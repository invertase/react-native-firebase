# frozen_string_literal: true

# Opt-in suite that exercises the bash body of `rnfirebase_spm_embed_script`
# (`embed_frameworks_from`) against real Mach-O frameworks built with
# `clang`/`ar`. Companion to firebase_spm_test.rb (which only asserts on the
# pbxproj wiring that installs the phase) — this file is what catches
# Archive-embed regressions like #9154 (static CocoaPods frameworks copied
# into the app bundle).
#
# Deliberately opt-in: skips cleanly (does not fail, does not define any
# tests) off macOS or when `clang`/`ar`/`file` aren't on PATH, so it's always
# safe to run unconditionally in CI. Wired into the iOS E2E job in
# tests_e2e_ios.yml (debug+spm matrix cell, before Pod Install); no
# cocoapods/xcodeproj gems needed.

RNFIREBASE_SPM_EMBED_SCRIPT_TOOLS_AVAILABLE = begin
  require 'rbconfig'
  host_os = RbConfig::CONFIG['host_os'].to_s
  tools_ok = %w[clang ar file].all? do |tool|
    system("command -v #{tool} >/dev/null 2>&1")
  end
  host_os.include?('darwin') && tools_ok
end

unless RNFIREBASE_SPM_EMBED_SCRIPT_TOOLS_AVAILABLE
  puts '[firebase_spm_embed_script_test] Skipping: macOS with clang/ar/file ' \
    'is required to build and classify Mach-O framework fixtures. This is ' \
    'expected outside of the tests_e2e_ios.yml CI job -- see the header ' \
    'comment in this file.'
end

if RNFIREBASE_SPM_EMBED_SCRIPT_TOOLS_AVAILABLE
  require 'minitest/autorun'
  require 'tmpdir'
  require 'fileutils'
  require 'open3'

  load File.join(__dir__, '..', 'firebase_spm.rb')

  class FirebaseSpmEmbedScriptTest < Minitest::Test
    def test_embeds_single_arch_dynamic_framework
      Dir.mktmpdir('rnfb-spm-embed-') do |root|
        source_dir = File.join(root, 'source')
        dest_dir = File.join(root, 'Frameworks')
        FileUtils.mkdir_p(source_dir)
        FileUtils.mkdir_p(dest_dir)

        build_dynamic_framework(File.join(source_dir, 'DynamicSingle.framework'), 'DynamicSingle')

        run_embed_frameworks_from!(source_dir, dest_dir)

        dest_binary = File.join(dest_dir, 'DynamicSingle.framework', 'DynamicSingle')
        assert File.file?(dest_binary),
          'single-arch dynamic framework must be embedded into Frameworks/'
        assert_match(/dynamically linked/, `file -b "#{dest_binary}"`)
      end
    end

    def test_skips_static_ar_archive_framework
      Dir.mktmpdir('rnfb-spm-embed-') do |root|
        source_dir = File.join(root, 'source')
        dest_dir = File.join(root, 'Frameworks')
        FileUtils.mkdir_p(source_dir)
        FileUtils.mkdir_p(dest_dir)

        build_static_framework(File.join(source_dir, 'StaticPod.framework'), 'StaticPod')

        stdout, _stderr = run_embed_frameworks_from!(source_dir, dest_dir)

        dest_framework = File.join(dest_dir, 'StaticPod.framework')
        refute File.exist?(dest_framework),
          'static ar-archive framework must NOT be embedded (GitHub #9154); ' \
          'App Store rejects "Invalid bundle structure ... binary file is not permitted"'
        assert_includes stdout,
          'Skipping StaticPod.framework: binary missing or not dynamically linked',
          'Archive build logs must explain why a static framework was not embedded'
      end
    end

    def test_embeds_fat_universal_dynamic_framework
      Dir.mktmpdir('rnfb-spm-embed-') do |root|
        source_dir = File.join(root, 'source')
        dest_dir = File.join(root, 'Frameworks')
        FileUtils.mkdir_p(source_dir)
        FileUtils.mkdir_p(dest_dir)

        build_fat_dynamic_framework(File.join(source_dir, 'FatDynamic.framework'), 'FatDynamic')

        run_embed_frameworks_from!(source_dir, dest_dir)

        dest_binary = File.join(dest_dir, 'FatDynamic.framework', 'FatDynamic')
        assert File.file?(dest_binary),
          'fat/universal dynamic framework must still be embedded'
        file_out = `file -b "#{dest_binary}"`
        assert_match(/dynamically linked/, file_out)
        assert_match(/x86_64/, file_out)
        assert_match(/arm64/, file_out)
      end
    end

    def test_leaves_existing_destination_framework_untouched
      Dir.mktmpdir('rnfb-spm-embed-') do |root|
        source_dir = File.join(root, 'source')
        dest_dir = File.join(root, 'Frameworks')
        FileUtils.mkdir_p(source_dir)

        build_dynamic_framework(File.join(source_dir, 'AlreadyThere.framework'), 'AlreadyThere')

        dest_framework = File.join(dest_dir, 'AlreadyThere.framework')
        FileUtils.mkdir_p(dest_framework)
        marker_path = File.join(dest_framework, 'AlreadyThere')
        marker_contents = "pre-existing-destination-marker-#{Process.pid}"
        File.write(marker_path, marker_contents)

        run_embed_frameworks_from!(source_dir, dest_dir)

        assert_equal marker_contents, File.read(marker_path),
          'pre-existing destination framework must be left untouched ' \
          '(locks in the [ -e destination ] dedupe guard)'
      end
    end

    private

    def extract_embed_frameworks_from(script)
      match = script.match(/^embed_frameworks_from\(\) \{\n.*?\n\}$/m)
      refute_nil match,
        'could not extract embed_frameworks_from() from rnfirebase_spm_embed_script'
      match[0]
    end

    def run_embed_frameworks_from!(source_dir, dest_dir)
      function_body = extract_embed_frameworks_from(rnfirebase_spm_embed_script)
      driver = <<~BASH
        set -euo pipefail
        app_frameworks_dir=#{shell_quote(dest_dir)}
        mkdir -p "${app_frameworks_dir}"

        #{function_body}

        embed_frameworks_from #{shell_quote(source_dir)}
      BASH

      stdout, stderr, status = Open3.capture3('/bin/bash', '-c', driver)
      assert status.success?,
        "embed_frameworks_from failed (exit #{status.exitstatus})\n" \
        "stdout:\n#{stdout}\nstderr:\n#{stderr}"
      [stdout, stderr]
    end

    def shell_quote(path)
      "'" + path.to_s.gsub("'", "'\\''") + "'"
    end

    def write_c_source(path)
      File.write(path, "int rnfb_spm_embed_fixture(void) { return 42; }\n")
    end

    def build_dynamic_framework(framework_path, binary_name)
      FileUtils.mkdir_p(framework_path)
      Dir.mktmpdir('rnfb-clang-') do |build|
        src = File.join(build, 'fixture.c')
        write_c_source(src)
        binary = File.join(framework_path, binary_name)
        ok = system('clang', '-dynamiclib', '-o', binary, src, out: File::NULL, err: File::NULL)
        assert ok, "clang -dynamiclib failed for #{binary_name}"
      end
    end

    def build_static_framework(framework_path, binary_name)
      FileUtils.mkdir_p(framework_path)
      Dir.mktmpdir('rnfb-ar-') do |build|
        src = File.join(build, 'fixture.c')
        obj = File.join(build, 'fixture.o')
        write_c_source(src)
        ok_c = system('clang', '-c', '-o', obj, src, out: File::NULL, err: File::NULL)
        assert ok_c, "clang -c failed for #{binary_name}"
        binary = File.join(framework_path, binary_name)
        ok_a = system('ar', 'rcs', binary, obj, out: File::NULL, err: File::NULL)
        assert ok_a, "ar rcs failed for #{binary_name}"
        file_out = `file -b "#{binary}"`
        assert_match(
          /ar archive|current ar archive/,
          file_out,
          "expected static fixture to be an ar archive, got: #{file_out}"
        )
      end
    end

    def build_fat_dynamic_framework(framework_path, binary_name)
      FileUtils.mkdir_p(framework_path)
      Dir.mktmpdir('rnfb-fat-') do |build|
        src = File.join(build, 'fixture.c')
        write_c_source(src)
        binary = File.join(framework_path, binary_name)
        ok = system(
          'clang', '-arch', 'x86_64', '-arch', 'arm64', '-dynamiclib',
          '-o', binary, src,
          out: File::NULL, err: File::NULL
        )
        assert ok, "clang fat -dynamiclib failed for #{binary_name}"
      end
    end
  end
end
