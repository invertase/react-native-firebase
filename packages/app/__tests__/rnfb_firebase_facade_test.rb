# frozen_string_literal: true

require 'fileutils'
require 'minitest/autorun'
require 'tmpdir'

# Source-level contract for the dynamic Firebase probe facade. The isolated
# client target typechecks `import RNFBFirebase` with SDK modules off its path.
class RNFBFirebaseFacadeTest < Minitest::Test # rubocop:disable Metrics/ClassLength
  FIREBASE_TYPE = /\bFirebase(?:Core|Installations|Options|App|Configuration|LoggerLevel)\b/
  IOS_ROOT = File.expand_path('../ios', __dir__)
  PROBE_CONDITION = 'RNFB_DYNAMIC_FIREBASE_PROBE'
  FACADE_IMPORT = "#if #{PROBE_CONDITION}\nimport RNFBFirebase\n#else\nimport FirebaseCore\n#endif".freeze
  APP_SOURCES = %w[
    RNFBApp/RCTConvertFIRApp.swift
    RNFBApp/RCTConvertFIROptions.swift
    RNFBApp/RNFBSharedUtilsFIRApp.swift
    RNFBApp/RNFBAppModuleFirebase.swift
  ].freeze
  CANIMPORT_VARIANTS = {
    'plain' => "#if canImport(RNFBFirebase)\nimport RNFBFirebase\n#endif\n",
    'space before paren' => "#if canImport (RNFBFirebase)\nimport RNFBFirebase\n#endif\n",
    'inner spacing' => "#if canImport( RNFBFirebase )\nimport RNFBFirebase\n#endif\n",
    'compound' => "#if canImport(RNFBFirebase) && os(iOS)\nimport RNFBFirebase\n#endif\n",
    'compound reversed' => "#if os(iOS) || canImport(RNFBFirebase)\nimport RNFBFirebase\n#endif\n",
    'elseif' => "#if DEBUG\n#elseif canImport(RNFBFirebase)\nimport RNFBFirebase\n#endif\n"
  }.freeze

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

  def test_rnfbapp_probe_branch_omits_firebase_types
    APP_SOURCES.each { |relative| assert_facade_branch_hides_firebase(relative) }
  end

  # The probe path is chosen by an explicit compilation condition, never by
  # whether a module named RNFBFirebase happens to be importable.
  def test_no_swift_source_selects_probe_with_canimport
    sources = swift_sources_for_canimport_guard
    assert_includes sources, File.join(IOS_ROOT, 'RNFBApp/RCTConvertFIRApp.swift')
    assert_includes sources, File.expand_path('../../../test-rn-bare/ios/testrnbare/AppDelegate.swift', __dir__)
    offenders = sources.select { |path| canimport_probe_selector?(File.read(path)) }
    assert_empty offenders, "canImport(RNFBFirebase) must not pick the probe path: #{offenders.join(', ')}"
  end

  def test_canimport_guard_scans_the_e2e_test_app_ios_sources
    roots = canimport_guard_roots
    assert_includes roots, File.expand_path('../../../tests/ios', __dir__)
    assert_includes roots, File.expand_path('../../../test-rn-bare/ios', __dir__)
    assert_includes roots, IOS_ROOT
  end

  def test_canimport_guard_catches_spacing_compound_and_elseif_variants
    Dir.mktmpdir do |dir|
      CANIMPORT_VARIANTS.each do |name, body|
        path = File.join(dir, "#{name.tr(' ', '_')}.swift")
        File.write(path, body)
        assert canimport_probe_selector?(File.read(path)), "guard must catch the #{name} variant"
      end
    end
  end

  def test_canimport_guard_ignores_unrelated_canimport_and_condition_form
    refute canimport_probe_selector?("#if canImport(FirebaseCore)\nimport FirebaseCore\n#endif\n")
    refute canimport_probe_selector?("#if canImport(RNFBFirebaseBridge)\nimport X\n#endif\n")
    refute canimport_probe_selector?("#if #{PROBE_CONDITION}\nimport RNFBFirebase\n#endif\n")
  end

  def test_canimport_guard_skips_pods_build_and_derived_data_trees
    Dir.mktmpdir do |dir|
      %w[Pods build DerivedData].each do |skipped|
        FileUtils.mkdir_p(File.join(dir, skipped, 'nested'))
        File.write(File.join(dir, skipped, 'nested', 'Skipped.swift'), "#if canImport(RNFBFirebase)\n#endif\n")
      end
      File.write(File.join(dir, 'Kept.swift'), "#if canImport(RNFBFirebase)\n#endif\n")

      assert_equal [File.join(dir, 'Kept.swift')], canimport_guard_sources([dir])
    end
  end

  def test_test_rn_bare_app_delegate_uses_probe_condition
    source = File.read(File.expand_path('../../../test-rn-bare/ios/testrnbare/AppDelegate.swift', __dir__))
    assert_includes source, "#if #{PROBE_CONDITION}\nimport RNFBFirebase\n#else\nimport Firebase\n#endif"
    assert_includes source, "#if #{PROBE_CONDITION}\n    RNFBFirebaseAppClient.configure()\n#else"
  end

  def test_firebase_unit_test_target_sets_probe_condition_for_compiled_app_sources
    blocks = build_configs('PRODUCT_NAME = "$(TARGET_NAME)"').select { |block| block.include?('RNFBFirebaseUnitTests') }
    assert_equal 2, blocks.size
    blocks.each do |block|
      assert_match(/SWIFT_ACTIVE_COMPILATION_CONDITIONS = \(\s*"\$\(inherited\)",\s*#{PROBE_CONDITION},?\s*\);/, block)
    end
  end

  def canimport_probe_selector?(source)
    source.match?(/canImport\s*\(\s*RNFBFirebase\b/)
  end

  def canimport_guard_roots
    [
      IOS_ROOT,
      File.expand_path('../../../test-rn-bare/ios', __dir__),
      File.expand_path('../../../tests/ios', __dir__)
    ]
  end

  def canimport_guard_sources(roots)
    paths = roots.flat_map { |root| Dir.glob(File.join(root, '**/*.swift')) }
    paths.grep_v(%r{/(?:Pods|build|DerivedData)/})
  end

  def swift_sources_for_canimport_guard
    canimport_guard_sources(canimport_guard_roots)
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
    strip_comments(source).gsub(/#if #{PROBE_CONDITION}\n.*?#else\n.*?#endif/m) do |block|
      block.split('#else', 2).first.sub(/\A#if #{PROBE_CONDITION}\n/, '')
    end
  end

  def strip_comments(source)
    source.gsub(%r{/\*.*?\*/}m, '').gsub(%r{//.*$}, '')
  end
end
