# frozen_string_literal: true

# rubocop:disable Metrics, Style/OptionalBooleanParameter
# Coverage runner for `yarn tests:ios:ruby`.
#
# Starts SimpleCov before any production `packages/app/**/*.rb` or `*_test.rb`
# loads. Each `*_test.rb` runs in its own subprocess so mock-based unit suites
# and opt-in shape/embed suites (real cocoapods/xcodeproj) never share a
# process. Parent collates SimpleCov resultsets into coverage/ios-ruby/.
#
# Gem activation: `yarn tests:ios:ruby` runs this file via `bundle exec` so
# Gemfile cocoapods/xcodeproj/simplecov are on $LOAD_PATH. Child suite
# processes also use `bundle exec` so asdf/system minitest cannot shadow
# the Bundler-activated copy (mixed minitest 5 + 6 → 0 runs).
#
# Unit suites `load` production `.rb` files repeatedly for isolation; Ruby's
# Coverage module resets per-file counters on each `load`. The runner peeks
# and accumulates those counters across reloads so LCOV reflects all tests.

require 'English'
tests_dir = __dir__
repo_root = File.expand_path('../../..', tests_dir)
gemfile = File.join(repo_root, 'Gemfile')
coverage_dir = File.join(repo_root, 'coverage', 'ios-ruby')
lcov_path = File.join(coverage_dir, 'lcov.info')

ENV['BUNDLE_GEMFILE'] = gemfile

def activate_coverage_gems!(bundle_root)
  vendor_libs = Dir.glob(File.join(bundle_root, 'vendor', 'bundle', 'ruby', '*', 'gems', '*', 'lib'))
  vendor_libs.each { |path| $LOAD_PATH.unshift(path) unless $LOAD_PATH.include?(path) }

  begin
    require 'simplecov'
    require 'simplecov-lcov'
    return
  rescue LoadError
    # Fall through when vendor/bundle is empty (fresh checkout).
  end

  begin
    require 'bundler'
    Dir.chdir(bundle_root) do
      Bundler.reset!
      Bundler.configure
      definition = Bundler.definition
      if definition.missing_specs.any?
        names = definition.missing_specs.map(&:name).uniq.join(', ')
        warn "[tests:ios:ruby] Missing gems: #{names}."
        warn 'Run: bundle install (root Gemfile)'
        exit 1
      end
      definition.specs_for([:default]).each do |spec|
        spec.full_require_paths.each do |path|
          $LOAD_PATH.unshift(path) unless $LOAD_PATH.include?(path)
        end
      end
    end
    require 'simplecov'
    require 'simplecov-lcov'
  rescue LoadError, Bundler::BundlerError => e
    warn "[tests:ios:ruby] #{e.message}"
    warn 'Run: bundle install (root Gemfile)'
    exit 1
  end
end

def configure_simplecov_formatters!(coverage_dir, lcov_path)
  SimpleCov::Formatter::LcovFormatter.config do |c|
    c.report_with_single_file = true
    c.output_directory = coverage_dir
    c.lcov_file_name = 'lcov.info'
    c.single_report_path = lcov_path
  end

  SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new(
    [
      SimpleCov::Formatter::HTMLFormatter,
      SimpleCov::Formatter::LcovFormatter
    ]
  )
end

# Accumulate Coverage counters across `load` resets of packages/app production Ruby.
module RNFBLoadCoverageAccumulate
  module_function

  def sums
    @sums ||= {}
  end

  def app_production_ruby?(path)
    path.is_a?(String) &&
      path.include?('/packages/app/') &&
      path.end_with?('.rb') &&
      !path.include?('/__tests__/')
  end

  def line_hits(entry)
    case entry
    when Integer
      entry
    when Array
      # Ruby 3.2+ branch-style slot — use line hit if present
      entry[0].is_a?(Integer) ? entry[0] : nil
    end
  end

  def extract_lines(data)
    case data
    when Array
      data
    when Hash
      data[:lines] || data['lines']
    end
  end

  def add_from_peek!
    return unless defined?(::Coverage) && ::Coverage.respond_to?(:peek_result)

    ::Coverage.peek_result.each do |path, data|
      next unless app_production_ruby?(path)

      lines = extract_lines(data)
      next unless lines

      acc = (sums[path] ||= [])
      lines.each_with_index do |slot, idx|
        hit = line_hits(slot)
        next if hit.nil?

        acc[idx] = (acc[idx] || 0) + hit
      end
    end
  rescue StandardError => e
    warn "[tests:ios:ruby] coverage peek failed: #{e.message}"
  end

  def deep_dup_result(raw)
    raw.each_with_object({}) do |(path, data), out|
      out[path] =
        case data
        when Array
          data.map { |slot| slot.is_a?(Array) ? slot.dup : slot }
        when Hash
          duped = data.dup
          %i[lines].each do |sym|
            next unless duped[sym].is_a?(Array)

            duped[sym] = duped[sym].map { |slot| slot.is_a?(Array) ? slot.dup : slot }
          end
          ['lines'].each do |key|
            next unless duped[key].is_a?(Array)

            duped[key] = duped[key].map { |slot| slot.is_a?(Array) ? slot.dup : slot }
          end
          duped
        else
          data
        end
    end
  end

  def apply_hits!(lines, acc)
    acc.each_with_index do |hit, idx|
      next if hit.nil? || lines[idx].nil?

      if lines[idx].is_a?(Array)
        slot = lines[idx].dup
        current = slot[0].is_a?(Integer) ? slot[0] : 0
        slot[0] = [current, hit].max
        lines[idx] = slot
      elsif lines[idx].is_a?(Integer)
        lines[idx] = [lines[idx], hit].max
      end
    end
  end

  def merge_into_coverage_result!(raw)
    mutable = deep_dup_result(raw)
    sums.each do |path, acc|
      data = mutable[path]
      next unless data

      if data.is_a?(Array)
        apply_hits!(data, acc)
      elsif data.is_a?(Hash)
        lines = data[:lines] || data['lines']
        next unless lines.is_a?(Array)

        apply_hits!(lines, acc)
      end
    end
    mutable
  end

  def install!
    return if @installed

    @installed = true

    Kernel.module_eval do
      alias_method :__rnfb_load_without_cov_acc, :load

      def load(path, wrap = false)
        RNFBLoadCoverageAccumulate.add_from_peek!
        __rnfb_load_without_cov_acc(path, wrap)
      end
    end

    class << Coverage
      alias_method :__rnfb_coverage_result, :result

      def result(*args, **kwargs)
        RNFBLoadCoverageAccumulate.add_from_peek!
        raw = __rnfb_coverage_result(*args, **kwargs)
        RNFBLoadCoverageAccumulate.merge_into_coverage_result!(raw)
      end
    end
  end
end

def start_simplecov!(repo_root, coverage_dir, command_name:)
  require 'coverage'
  RNFBLoadCoverageAccumulate.install!

  SimpleCov.start do
    root repo_root
    command_name command_name
    coverage_dir coverage_dir

    # SimpleCov 1.x verbs (`cover` / `skip`; legacy track_files/add_filter still work).
    # project_filename is relative (no leading `/`) — do not anchor on `/packages/...`.
    cover 'packages/app/*.rb'
    skip %r{packages/app/__tests__/}
    skip %r{packages/app/node_modules/}
    skip do |source_file|
      !source_file.filename.start_with?(File.join(repo_root, 'packages', 'app'))
    end
  end
end

require 'fileutils'
require 'rbconfig'

activate_coverage_gems!(repo_root)
configure_simplecov_formatters!(coverage_dir, lcov_path)

if (suite_path = ENV.fetch('RNFB_IOS_RUBY_SUITE', nil))
  # ── Child: one suite (isolated — mocks vs real Xcodeproj cannot share a process)
  Dir.chdir(repo_root)
  start_simplecov!(repo_root, coverage_dir, command_name: "ios-ruby-#{File.basename(suite_path, '.rb')}")
  load suite_path
  # Opt-in suites that skip without requiring minitest/autorun exit 0.
  # Suites that loaded autorun fall through; Minitest runs at process exit.
  exit 0 unless defined?(Minitest)
else
  # ── Parent: discover, spawn, collate
  # Sort for stable suite order across hosts (RuboCop Lint/RedundantDirGlobSort is disabled).
  suite_files = Dir.glob(File.join(tests_dir, '*_test.rb')).sort # rubocop:disable Lint/RedundantDirGlobSort -- stable order across hosts
  if suite_files.empty?
    warn '[tests:ios:ruby] No *_test.rb suites found under packages/app/__tests__/'
    exit 1
  end

  FileUtils.mkdir_p(coverage_dir)
  Dir.glob(File.join(coverage_dir, '.resultset*')).each { |path| File.delete(path) }

  puts "[tests:ios:ruby] Running #{suite_files.size} suite(s) (isolated processes):"
  failures = 0
  suite_files.each do |path|
    rel = path.delete_prefix("#{repo_root}/")
    print "  - #{rel} ... "
    # Capture child stdout/stderr to a temp log; only print on failure (keeps parent summary readable).
    # Pass one IO for both streams — same-path out:/err: opens the file twice and garbles output.
    require 'tempfile'
    log = Tempfile.new(['rnfb-ios-ruby', '.log'])
    ok = system(
      {
        'BUNDLE_GEMFILE' => gemfile,
        'RNFB_IOS_RUBY_SUITE' => path
      },
      'bundle',
      'exec',
      RbConfig.ruby,
      __FILE__,
      out: log,
      err: log
    )
    log.flush
    log.rewind
    child_log = log.read
    log.close
    log.unlink
    if ok
      # Pull pass counts from child log for the summary line.
      summary = child_log.lines.grep(/^\d+ runs,/).last&.strip
      puts(summary ? "ok (#{summary})" : 'ok')
    else
      puts "FAIL (exit #{$CHILD_STATUS.exitstatus})"
      warn child_log
      failures += 1
    end
  end

  resultsets = Dir.glob(File.join(coverage_dir, '.resultset*'))
  if resultsets.empty?
    warn '[tests:ios:ruby] No SimpleCov resultsets produced'
    exit 1
  end

  SimpleCov.collate(resultsets) do
    root repo_root
    coverage_dir coverage_dir
    cover 'packages/app/*.rb'
    skip %r{packages/app/__tests__/}
    skip %r{packages/app/node_modules/}
    skip do |source_file|
      !source_file.filename.start_with?(File.join(repo_root, 'packages', 'app'))
    end
  end

  puts "[tests:ios:ruby] Coverage → #{lcov_path.delete_prefix("#{repo_root}/")}"
  exit(failures.zero? ? 0 : 1)
end

# rubocop:enable Metrics, Style/OptionalBooleanParameter
