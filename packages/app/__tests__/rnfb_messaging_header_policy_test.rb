# frozen_string_literal: true

# rubocop:disable Metrics, Style/Documentation
# Header-visibility policy for RNFBMessaging.podspec, resolved by the real
# CocoaPods FileAccessor (a header in both public and private lists stays
# private). Static-library apps can only `#import <RNFBMessaging/...>` public
# headers, so the AppDelegate forwarding header must be public and every public
# header must import system frameworks only.
#
# Skips cleanly (exit 0, no tests defined) when `cocoapods` is unavailable.

begin
  require 'cocoapods'
  RNFIREBASE_MESSAGING_HEADER_POLICY_GEMS_AVAILABLE = true
rescue LoadError => e
  RNFIREBASE_MESSAGING_HEADER_POLICY_GEMS_AVAILABLE = false
  puts '[rnfb_messaging_header_policy_test] Skipping: `cocoapods` is not ' \
       "installed in this Ruby environment (#{e.class}: #{e.message})."
end

if RNFIREBASE_MESSAGING_HEADER_POLICY_GEMS_AVAILABLE
  require 'minitest/autorun'
  require 'pathname'

  # Defined by React Native's react_native_pods.rb during a real `pod install`.
  def install_modules_dependencies(_spec); end unless respond_to?(:install_modules_dependencies, true)
  def spm_dependency(_spec, **_options); end unless respond_to?(:spm_dependency, true)

  class RNFBMessagingHeaderPolicyTest < Minitest::Test
    MESSAGING_ROOT = File.expand_path('../../messaging', __dir__)
    PODSPEC_PATH = File.join(MESSAGING_ROOT, 'RNFBMessaging.podspec')
    SYSTEM_FRAMEWORKS = %w[Foundation UIKit UserNotifications].freeze
    IMPORT_PATTERN = /^\s*#\s*(?:import|include)\s*([<"])([^>"]+)[>"]/
    MODULE_IMPORT_PATTERN = /^\s*@import\s+([\w.]+)\s*;/

    def self.file_accessor
      @file_accessor ||= begin
        spec = Dir.chdir(MESSAGING_ROOT) { Pod::Specification.from_file(PODSPEC_PATH) }
        path_list = Pod::Sandbox::PathList.new(Pathname.new(MESSAGING_ROOT))
        Pod::Sandbox::FileAccessor.new(path_list, spec.consumer(:ios))
      end
    end

    def relative(paths)
      paths.map { |path| path.relative_path_from(Pathname.new(MESSAGING_ROOT)).to_s }.sort
    end

    def public_headers
      relative(self.class.file_accessor.public_headers)
    end

    def private_headers
      relative(self.class.file_accessor.private_headers)
    end

    def test_app_delegate_forwarding_header_is_public
      assert_includes public_headers, 'ios/RNFBMessaging/RNFBMessaging+AppDelegate.h'
      refute_includes private_headers, 'ios/RNFBMessaging/RNFBMessaging+AppDelegate.h'
    end

    def test_module_header_is_public
      assert_includes public_headers, 'ios/RNFBMessaging/RNFBMessagingModule.h'
    end

    def test_app_delegate_internals_header_is_private
      assert_includes private_headers, 'ios/RNFBMessaging/RNFBMessaging+AppDelegatePrivate.h'
      refute_includes public_headers, 'ios/RNFBMessaging/RNFBMessaging+AppDelegatePrivate.h'
    end

    def test_public_headers_are_exactly_the_supported_surface
      assert_equal %w[
        ios/RNFBMessaging/RNFBMessaging+AppDelegate.h
        ios/RNFBMessaging/RNFBMessagingModule.h
      ], public_headers
    end

    def test_public_headers_import_system_frameworks_only
      violations = []
      self.class.file_accessor.public_headers.each do |header|
        File.readlines(header).each_with_index do |line, index|
          location = "#{header.basename}:#{index + 1}: #{line.strip}"
          if (match = line.match(IMPORT_PATTERN))
            delimiter, target = match.captures
            framework = target.split('/').first
            allowed = delimiter == '<' && target.include?('/') && SYSTEM_FRAMEWORKS.include?(framework)
            violations << location unless allowed
          elsif (match = line.match(MODULE_IMPORT_PATTERN))
            violations << location unless SYSTEM_FRAMEWORKS.include?(match[1].split('.').first)
          end
        end
      end

      assert_empty violations,
                   'Public RNFBMessaging headers must import only system frameworks ' \
                   "(#{SYSTEM_FRAMEWORKS.join(', ')}) so static-library apps can import them:\n" \
                   "#{violations.join("\n")}"
    end
  end
end

# rubocop:enable Metrics, Style/Documentation
