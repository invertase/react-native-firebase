# frozen_string_literal: true

require 'minitest/autorun'
require 'tmpdir'
require_relative '../../../.github/workflows/scripts/check_rnfb_app_ios_objc_imports'

# Exercises the lexical import boundary checker used by the canonical iOS build.
class RNFBAppIOSObjCImportGuardTest < Minitest::Test # rubocop:disable Metrics/ClassLength
  def with_source(contents)
    Dir.mktmpdir do |root|
      path = File.join(root, 'Probe.mm')
      File.write(path, contents)
      yield root
    end
  end

  # rubocop:disable-next Metrics/AbcSize, Metrics/MethodLength
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

  def test_scans_nested_objective_cpp_sources_only
    Dir.mktmpdir do |root|
      nested = File.join(root, 'Nested')
      Dir.mkdir(nested)
      File.write(File.join(nested, 'Forbidden.mm'), "#import <FirebaseCore/FIRApp.h>\n")
      File.write(File.join(root, 'Ignored.m'), "#import <FirebaseCore/FIRApp.h>\n")

      violations = RNFBAppIOSObjCImportGuard.violations(root)

      assert_equal 1, violations.length
      assert_includes violations.first, 'Nested/Forbidden.mm:1'
    end
  end
end
