# frozen_string_literal: true

require 'minitest/autorun'

# Source-level contract for the dynamic Firebase probe facade. The isolated
# client target typechecks `import RNFBFirebase` with SDK modules off its path.
class RNFBFirebaseFacadeTest < Minitest::Test # rubocop:disable Metrics/ClassLength
  FIREBASE_TYPE = /\bFirebase(?:Core|Installations|Options|App|Configuration|LoggerLevel)\b/
  IOS_ROOT = File.expand_path('../ios', __dir__)
  FACADE_IMPORT = "#if canImport(RNFBFirebase)\nimport RNFBFirebase\n#else\nimport FirebaseCore\n#endif"
  APP_SOURCES = %w[
    RNFBApp/RCTConvertFIRApp.swift
    RNFBApp/RCTConvertFIROptions.swift
    RNFBApp/RNFBSharedUtilsFIRApp.swift
    RNFBApp/RNFBAppModuleFirebase.swift
  ].freeze
  def test_swift_facade_keeps_firebase_in_objective_c
    source = facade_source
    refute_match(/\binternal\s+import\b/, source)
    refute_match(/import\s+Firebase/, source)
    assert_match(/@_silgen_name\("RNFBFirebaseCreateOptions"\)/, source)
    assert_match(/@import FirebaseCore/, bridge_source)
    assert_match(/@import FirebaseInstallations/, bridge_source)
  end

  def test_bridge_header_and_package_hide_firebase_modules
    refute_match(/@(import)\s+Firebase|#import\s+<Firebase/, bridge_header)
    refute_match(/\binternal\s+import\b/, bridge_header)
    refute_match(/CheckImplementationOnly/, package_manifest)
    assert_match(/name: "RNFBFirebaseBridge"/, package_manifest)
    assert_includes pbxproj_source, 'RNFBFirebaseBridge.m in Sources'
    refute_includes pbxproj_source, 'CheckImplementationOnly'
    swift_target = package_target_body(package_manifest, 'RNFBFirebase')
    refute_match(/RNFBFirebaseBridge/, swift_target)
  end

  def test_isolated_client_import_hides_firebase_modules
    assert_isolated_client_source
    settings = build_configs('PRODUCT_NAME = RNFBFirebaseClientCheck')
    refute_empty settings
    settings.each { |block| assert_client_module_path_is_facade_only(block) }
    assert_includes pbxproj_source, 'remoteInfo = RNFBFirebaseClientCheck;'
  end

  def test_umbrella_public_signatures_omit_firebase_types
    signatures = public_signatures(facade_source)
    refute_empty signatures
    signatures.each { |signature| refute_match(FIREBASE_TYPE, signature, signature) }
  end

  def test_rnfbapp_canimport_branch_omits_firebase_types
    APP_SOURCES.each { |relative| assert_facade_branch_hides_firebase(relative) }
  end

  def assert_isolated_client_source
    client = File.read(File.join(IOS_ROOT, 'RNFBFirebaseUnitTests/RNFBFirebaseClientImport.swift'))
    assert_match(/^import RNFBFirebase$/, client)
    refute_match(/\bimport\s+Firebase/, client)
  end

  def assert_client_module_path_is_facade_only(block)
    refute_match(/HostStubs/, block)
    refute_match(/FirebaseCore|FirebaseInstallations/, block)
    refute_match(/module\.modulemap/, block)
    assert_match(%r{RNFBFirebase\.framework/Modules}, block)
  end

  def build_configs(marker = nil)
    blocks = pbxproj_source.scan(/isa = XCBuildConfiguration;.*?name = (?:Debug|Release);/m)
    marker ? blocks.select { |block| block.include?(marker) } : blocks
  end

  def pbxproj_source
    File.read(File.join(IOS_ROOT, 'RNFBFirebaseUnitTests/RNFBFirebaseUnitTests.xcodeproj/project.pbxproj'))
  end

  def assert_facade_branch_hides_firebase(relative)
    source = File.read(File.join(IOS_ROOT, relative))
    assert_includes source, FACADE_IMPORT
    visible = facade_visible_source(source)
    refute_match(FIREBASE_TYPE, visible, relative)
    refute_match(/^\s*import FirebaseCore\s*$/, visible, relative)
  end

  def facade_source
    File.read(File.join(IOS_ROOT, 'RNFBFirebase/Sources/RNFBFirebase/RNFBFirebase.swift'))
  end

  def bridge_source
    File.read(File.join(IOS_ROOT, 'RNFBFirebase/Sources/RNFBFirebaseBridge/RNFBFirebaseBridge.m'))
  end

  def bridge_header
    File.read(File.join(IOS_ROOT, 'RNFBFirebase/Sources/RNFBFirebaseBridge/include/RNFBFirebaseBridge.h'))
  end

  def package_manifest
    File.read(File.join(IOS_ROOT, 'RNFBFirebase/Package.swift'))
  end

  # Body of `.target(name:)`, not the dynamic product target list. A dependency
  # here puts FirebaseCore.modulemap on the Swift compile.
  def package_target_body(manifest, target_name)
    remainder = manifest
    name = /\A\s*name:\s*"#{Regexp.escape(target_name)}"/
    until remainder.empty?
      open = remainder.index('.target(') or flunk %(missing .target(name: "#{target_name}"))
      body_start = open + '.target('.length
      body = balanced_call_body(remainder, body_start)
      return body if body.match?(name)

      remainder = remainder[(body_start + body.length + 1)..]
    end
    flunk %(missing .target(name: "#{target_name}"))
  end

  def balanced_call_body(source, body_start)
    depth = 1
    index = body_start
    while index < source.length
      depth += source[index] == '(' ? 1 : 0
      depth -= source[index] == ')' ? 1 : 0
      return source[body_start...index] if depth.zero?

      index += 1
    end
    flunk 'unbalanced Package.swift target'
  end

  # rubocop:disable-next Metrics/MethodLength
  def public_signatures(source)
    chunks = []
    buffer = +''
    strip_comments(source).lines.each do |line|
      buffer = line.dup if buffer.empty? && line.match?(/^\s*public\s+/)
      next if buffer.empty?

      buffer << line unless buffer == line
      next if buffer.count('(') > buffer.count(')')

      chunks << buffer
      buffer = +''
    end
    chunks
  end

  def facade_visible_source(source)
    strip_comments(source).gsub(/#if canImport\(RNFBFirebase\)\n.*?#else\n.*?#endif/m) do |block|
      block.split('#else', 2).first.sub(/\A#if canImport\(RNFBFirebase\)\n/, '')
    end
  end

  def strip_comments(source)
    source.gsub(%r{/\*.*?\*/}m, '').gsub(%r{//.*$}, '')
  end
end
