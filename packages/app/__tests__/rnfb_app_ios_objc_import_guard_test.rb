# frozen_string_literal: true

require 'minitest/autorun'
require 'fileutils'
require 'stringio'
require 'tmpdir'
require_relative '../../../.github/workflows/scripts/check_rnfb_app_ios_objc_imports'

# rubocop:disable Metrics/ClassLength, Metrics/MethodLength, Metrics/AbcSize
# Exercises the lexical import boundary checker used by the canonical iOS build.
class RNFBAppIOSObjCImportGuardTest < Minitest::Test
  def with_source(contents, extension: '.mm')
    Dir.mktmpdir do |root|
      path = File.join(root, "Probe#{extension}")
      File.write(path, contents)
      yield root
    end
  end

  def test_rejects_firebase_header_module_and_generated_swift_header_imports
    source = <<~OBJC
      #import <FirebaseCore/FirebaseCore.h>
      # include "FirebaseInstallations/FIRInstallations.h"
      @import FirebaseAuth;
      #import <RNFBApp/RNFBApp-Swift.h>
      #import "AnotherTarget-Swift.h"
      #include <RNFBApp/RNFBApp-Swift.inc>
      #include "Generated-Bridge-Swift.inc"
    OBJC

    with_source(source) do |root|
      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 7, violations.length
      assert(violations.any? { |line| line.include?('FirebaseCore/FirebaseCore.h') })
      assert(violations.any? { |line| line.include?('@import FirebaseAuth') })
      assert(violations.any? { |line| line.include?('RNFBApp-Swift.h') })
      assert(violations.any? { |line| line.include?('RNFBApp-Swift.inc') })
    end
  end

  # rubocop:disable-next Metrics/MethodLength
  def test_splices_physical_lines_before_recognizing_obfuscated_directives
    source = <<~'OBJC'
      #\
      /**/im\
      port/**/<FirebaseCore/FirebaseCore.h>
      #inc\
      lude /* gap */ "RNFBApp-Swift.h"
      @/**/im\
      port FirebaseAuth/**/;
    OBJC

    with_source(source) do |root|
      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 3, violations.length
      assert_includes violations[0], 'Probe.mm:1:'
      assert_includes violations[1], 'Probe.mm:4:'
      assert_includes violations[2], 'Probe.mm:6:'
    end
  end

  def test_treats_comments_as_whitespace_at_directive_token_gaps
    source = <<~OBJC
      #/**/import/**/<FirebaseCore/FirebaseCore.h>
      # /* hash gap */ include /* header gap */ "Generated-Swift.inc"
      @ /* at gap */ import /* module gap */ FirebaseInstallations /* semicolon gap */ ;
    OBJC

    with_source(source) do |root|
      assert_equal 3, RNFBAppIOSObjCImportGuard.violations(root).length
    end
  end

  def test_continued_line_comment_masks_following_physical_lines
    source = <<~'OBJC'
      // The splice keeps this line comment active. \
      #import <FirebaseCore/FirebaseCore.h>
      // It also masks an obfuscated directive. \
      #im\
      port "RNFBApp-Swift.h"
      #import <React/RCTBridgeModule.h>
    OBJC

    with_source(source) do |root|
      assert_empty RNFBAppIOSObjCImportGuard.violations(root)
    end
  end

  def test_does_not_join_unspliced_physical_lines_into_a_directive
    source = <<~OBJC
      #
      import <FirebaseCore/FirebaseCore.h>
      @
      import FirebaseAuth;
    OBJC

    with_source(source) do |root|
      assert_empty RNFBAppIOSObjCImportGuard.violations(root)
    end
  end

  # rubocop:disable-next Metrics/MethodLength
  def test_preserves_normal_objc_and_raw_strings_as_non_code
    source = <<~'OBJC'
      // #import <FirebaseCore/FirebaseCore.h>
      /*
       @import FirebaseInstallations;
       #import "RNFBApp-Swift.h"
      */
      static NSString *example = @"#import <FirebaseAuth/FirebaseAuth.h>";
      static NSString *url = @"https://example.test//not-a-comment";
      static const char *continued = "first line \
      #include \"RNFBApp-Swift.inc\"";
      static NSString *objcContinued = @"first line \
      @import FirebaseCore;";
      static const char *ordinary = "#include \"Generated-Swift.h\"";
      static const char *raw = R"(
      #import <FirebaseCore/FirebaseCore.h>
      @import FirebaseAuth;
      )";
      static const char *customRaw = u8R"RNFB(
      #include "RNFBApp-Swift.inc"
      // still raw-string content, not a comment
      )RNFB";
      static const wchar_t *wideRaw = LR"tag(
      #import "Generated-Swift.h"
      )tag";
      static const char8_t *utf8Raw = u8R"tag(
      #include <FirebaseInstallations/FirebaseInstallations.h>
      )tag";
      #import <React/RCTBridgeModule.h>
      #import "RNFBAppModule.h"
    OBJC

    with_source(source) do |root|
      assert_empty RNFBAppIOSObjCImportGuard.violations(root)
    end
  end

  def test_scans_nested_native_sources_and_headers
    Dir.mktmpdir do |root|
      nested = File.join(root, 'Nested')
      Dir.mkdir(nested)
      File.write(File.join(nested, 'Forbidden.mm'), "#import <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Forbidden.m'), "#import <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Forbidden.h'), "#import <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Forbidden.cpp'), "#include <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Forbidden.hpp'), "#include <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Forbidden.c'), "#include <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(nested, 'Ignored.swift'), "import FirebaseCore\n")
      File.write(File.join(nested, 'Ignored.txt'), "#import <FirebaseCore/FIRApp.h>\n")

      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 6, violations.length
      %w[mm m h cpp hpp c].each do |extension|
        assert(violations.any? { |line| line.include?("Nested/Forbidden.#{extension}:1") }, extension)
      end
    end
  end

  def test_rejects_unprefixed_quoted_firebase_headers_in_every_source_type
    source = <<~OBJC
      #import "FIRApp.h"
      #import "FirebaseCore.h"
      #import "FIROptions.h"
      #include "Vendored/FIRInstallations.h"
      #import "RCTConvert+FIRApp.h"
      #import "RNFBFirebaseThing.h"
    OBJC

    %w[.m .mm .h].each do |extension|
      with_source(source, extension: extension) do |root|
        violations = RNFBAppIOSObjCImportGuard.violations(root)

        assert_equal 4, violations.length, extension
        assert(violations.none? { |line| line.include?('RCTConvert+FIRApp.h') })
      end
    end
  end

  def test_allows_generated_swift_header_only_in_objective_c_adapters
    source = <<~OBJC
      #if __has_include(<RNFBApp/RNFBApp-Swift.h>)
      #import <RNFBApp/RNFBApp-Swift.h>
      #elif __has_include("RNFBHandleMapStorage-Swift.inc")
      #import "RNFBHandleMapStorage-Swift.inc"
      #endif
    OBJC

    with_source(source, extension: '.m') do |root|
      assert_empty RNFBAppIOSObjCImportGuard.violations(root)
    end

    %w[.mm .h .hpp .cpp .c].each do |extension|
      with_source(source, extension: extension) do |root|
        assert_equal 2, RNFBAppIOSObjCImportGuard.violations(root).length, extension
      end
    end
  end

  def test_does_not_scan_legitimate_firebase_importing_directories
    Dir.mktmpdir do |root|
      %w[RNFBFirebase/Sources/Bridge RNFBFirebaseUnitTests RNFBAppUnitTests/HostStubs/FirebaseCore
         build/Intermediates].each do |directory|
        FileUtils.mkdir_p(File.join(root, directory))
        File.write(File.join(root, directory, 'Allowed.m'), "#import <FirebaseCore/FirebaseCore.h>\n")
        File.write(File.join(root, directory, 'Allowed.h'), "#import \"FIRApp.h\"\n")
      end
      FileUtils.mkdir_p(File.join(root, 'RNFBApp'))
      File.write(File.join(root, 'RNFBApp', 'Forbidden.m'), "#import \"FIRApp.h\"\n")

      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 1, violations.length
      assert_includes violations.first, 'RNFBApp/Forbidden.m:1'
    end
  end

  def test_digit_separators_do_not_open_character_literals
    source = <<~OBJC
      static const int big = 1'000;
      static const long wide = 0xFF'FF'FF;
      static const double fraction = .5'5;
      #import <FirebaseCore/FirebaseCore.h>
      static const int after = 1'0;
    OBJC

    with_source(source) do |root|
      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 1, violations.length
      assert_includes violations.first, 'Probe.mm:4:'
    end
  end

  def test_reports_physical_line_for_crlf_line_splices
    source = "#define JOIN \\\r\n  1\r\n#import \\\r\n<FirebaseCore/FirebaseCore.h>\r\n"

    with_source(source) do |root|
      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 1, violations.length
      assert_includes violations.first, 'Probe.mm:3:'
    end
  end

  def test_run_returns_zero_and_reports_clean_root
    with_source("#import <React/RCTBridgeModule.h>\n") do |root|
      out = StringIO.new
      err = StringIO.new

      assert_equal 0, RNFBAppIOSObjCImportGuard.run([root], out: out, err: err)
      assert_includes out.string, "Checked #{root}: native source Firebase/Swift import boundary is clean"
      assert_empty err.string
    end
  end

  def test_run_returns_one_and_lists_violations
    with_source("#import <FirebaseCore/FirebaseCore.h>\n") do |root|
      out = StringIO.new
      err = StringIO.new

      assert_equal 1, RNFBAppIOSObjCImportGuard.run([root], out: out, err: err)
      assert_includes err.string, 'Forbidden Firebase or generated Swift import'
      assert_includes err.string, 'Probe.mm:1:'
      assert_empty out.string
    end
  end

  def test_run_defaults_to_the_packages_app_ios_root
    out = StringIO.new

    assert_equal 0, RNFBAppIOSObjCImportGuard.run([], out: out, err: StringIO.new)
    assert_includes out.string, RNFBAppIOSObjCImportGuard::DEFAULT_ROOT
  end

  def test_character_literals_and_prefixed_character_literals_still_mask_quotes
    source = <<~OBJC
      static const char quote = '"';
      static const char16_t wide = u'x';
      static const char8_t utf8 = u8'x';
      static const wchar_t lead = L'\\'';
      static const int number = '1';
      static const char *url = "it's #import <FirebaseCore/FirebaseCore.h> fine";
      #import <React/RCTBridgeModule.h>
    OBJC

    with_source(source) do |root|
      assert_empty RNFBAppIOSObjCImportGuard.violations(root)
    end
  end
end
# rubocop:enable Metrics/ClassLength, Metrics/MethodLength, Metrics/AbcSize
