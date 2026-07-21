# frozen_string_literal: true

require 'minitest/autorun'
require 'json'

# Mock Pod::Specification to capture dependency calls
class MockSpec
  attr_reader :dependencies

  def initialize
    @dependencies = []
  end

  def dependency(name, version)
    @dependencies << { name: name, version: version }
  end
end

# Mocks for rnfirebase_add_spm_embed_phase's Xcodeproj-shaped installer walk.
# These stand in for real Xcodeproj::Project::Object::PBX* types so the
# embed-phase logic can be tested without CocoaPods/Xcodeproj installed.
class MockPhase
  attr_accessor :name, :shell_script, :shell_path, :always_out_of_date, :input_paths, :output_paths

  def initialize(name)
    @name = name
  end
end

class MockTarget
  attr_reader :shell_script_build_phases, :build_configurations
  attr_accessor :package_product_dependencies, :name

  def initialize(phase_names = [], package_product_dependencies: [], build_config_names: ['Debug', 'Release'], name: 'testing')
    @shell_script_build_phases = phase_names.map { |phase_name| MockPhase.new(phase_name) }
    @package_product_dependencies = package_product_dependencies
    @build_configurations = build_config_names.map { |config_name| MockBuildConfig.new(config_name) }
    @build_settings_by_config = Hash.new { |hash, key| hash[key] = {} }
    @name = name
  end

  def new_shell_script_build_phase(name)
    phase = MockPhase.new(name)
    @shell_script_build_phases << phase
    phase
  end

  def build_settings(config_name)
    @build_settings_by_config[config_name]
  end
end

class MockUserProject
  attr_reader :native_targets, :root_object
  attr_accessor :save_count

  def initialize(native_targets, package_references: [])
    @native_targets = native_targets
    @root_object = MockRootObject.new(package_references)
    @save_count = 0
  end

  # Stands in for `Xcodeproj::Project#new(klass)`, which allocates a
  # project-managed object of the given class.
  def new(klass)
    klass.new
  end

  def save
    @save_count += 1
  end
end

class MockRootObject
  attr_accessor :package_references

  def initialize(package_references = [])
    @package_references = package_references
  end
end

# Mocks for rnfirebase_add_spm_core_to_app_target /
# rnfirebase_remove_spm_core_from_app_target's use of
# Xcodeproj::Project::Object::XCRemoteSwiftPackageReference /
# XCSwiftPackageProductDependency. Defined under the real `Xcodeproj::Project::Object`
# namespace so production code's direct class references resolve to these
# lightweight stand-ins, instead of requiring the real (much heavier) `xcodeproj`
# gem in this dependency-free Ruby unit-test job (no `gem install xcodeproj` step
# runs before `ruby firebase_spm_test.rb` in CI -- see tests_jest.yml).
module Xcodeproj
  module Project
    module Object
      class XCRemoteSwiftPackageReference
        attr_accessor :repositoryURL, :requirement
        attr_reader :referrers

        def initialize
          @referrers = []
        end

        def add_referrer(referrer)
          @referrers << referrer
        end

        def remove_referrer(referrer)
          @referrers.delete(referrer)
        end

        def remove_from_project
          @referrers.clear
        end
      end

      class XCSwiftPackageProductDependency
        attr_reader :package
        attr_accessor :product_name

        def package=(new_package)
          @package&.remove_referrer(self)
          @package = new_package
          new_package&.add_referrer(self)
        end

        def remove_from_project
          @package&.remove_referrer(self)
        end
      end
    end
  end
end

class MockBuildConfig
  attr_reader :name

  def initialize(name)
    @name = name
  end
end

# Stand-ins for `Pod::BuildType` and `Pod::Podfile::TargetDefinition`, just
# deep enough for `rnfirebase_fail_if_spm_static_linkage!` to read
# `target.target_definition.build_type.static?` -- the actual source of
# truth for the Podfile's `use_frameworks!(:linkage => ...)` choice.
#
# Deliberately *not* `AggregateTarget#build_as_static?` itself: real
# CocoaPods hardcodes every aggregate ("Pods-<target>") target's own
# `build_type` to `static_framework`/`static_library` regardless of
# `:linkage` (see `Installer::Analyzer#generate_aggregate_target`), so it's
# always `true` and can't distinguish the case this check cares about.
class MockBuildType
  def initialize(static: false)
    @static = static
  end

  def static?
    @static
  end
end

class MockTargetDefinition
  attr_reader :build_type

  def initialize(static: false)
    @build_type = MockBuildType.new(static: static)
  end
end

class MockAggregateTarget
  attr_reader :user_project, :name, :target_definition

  def initialize(user_project, name: 'Pods-testing', static_linkage: false)
    @user_project = user_project
    @name = name
    @target_definition = MockTargetDefinition.new(static: static_linkage)
  end
end

# Stands in for `Pod::Informative` (CocoaPods' user-facing error class) so
# `rnfirebase_fail_if_spm_static_linkage!` can be tested without the real
# `cocoapods-core` gem installed in this dependency-free Ruby unit-test job.
unless defined?(Pod::Informative)
  module Pod
    class Informative < StandardError
    end
  end
end

class MockInstaller
  attr_reader :aggregate_targets

  def initialize(aggregate_targets)
    @aggregate_targets = aggregate_targets
  end
end

class FirebaseSpmTest < Minitest::Test
  def setup
    # Reset global state before each test
    $firebase_spm_url = nil
    # Remove spm_dependency if defined from a previous test
    if defined?(spm_dependency)
      Object.send(:remove_method, :spm_dependency)
    end
    # Note: a Ruby global variable can't be "undefined" again once assigned in this
    # process, so `defined?($RNFirebaseDisableSPM)` stays true for the rest of the
    # suite after the first test that touches it. Resetting the value to nil (rather
    # than relying on `defined?` alone) is exactly the behavior rnfirebase_spm_disabled?
    # is meant to guard against, so tests below assert on it explicitly.
    $RNFirebaseDisableSPM = nil
    # Same one-way-`defined?` caveat as $RNFirebaseDisableSPM above.
    $rnfirebase_spm_active = nil
  end

  def load_firebase_spm
    # Force re-evaluation of the file
    load File.join(__dir__, '..', 'firebase_spm.rb')
  end

  # ── CocoaPods path (spm_dependency NOT defined) ──

  def test_cocoapods_single_pod
    load_firebase_spm

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')

    assert_equal 1, spec.dependencies.length
    assert_equal 'Firebase/Auth', spec.dependencies[0][:name]
    assert_equal '12.10.0', spec.dependencies[0][:version]
  end

  def test_cocoapods_multiple_pods
    load_firebase_spm

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0',
      ['FirebaseCrashlytics'],
      ['Firebase/Crashlytics', 'FirebaseCoreExtension']
    )

    assert_equal 2, spec.dependencies.length
    assert_equal 'Firebase/Crashlytics', spec.dependencies[0][:name]
    assert_equal 'FirebaseCoreExtension', spec.dependencies[1][:name]
    spec.dependencies.each do |dep|
      assert_equal '12.10.0', dep[:version]
    end
  end

  # ── SPM path (spm_dependency IS defined) ──

  def test_spm_single_product
    # Define spm_dependency mock to capture the call
    spm_calls = []
    Object.define_method(:spm_dependency) do |spec, **kwargs|
      spm_calls << { spec: spec, **kwargs }
    end

    load_firebase_spm

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')

    # CocoaPods dependency should NOT be called
    assert_equal 0, spec.dependencies.length

    # SPM dependency should be called with correct params
    assert_equal 1, spm_calls.length
    call = spm_calls[0]
    assert_equal spec, call[:spec]
    assert_equal 'https://github.com/firebase/firebase-ios-sdk.git', call[:url]
    assert_equal({ kind: 'upToNextMajorVersion', minimumVersion: '12.10.0' }, call[:requirement])
    assert_equal ['FirebaseAuth'], call[:products]
  end

  def test_spm_multiple_products_ignores_cocoapods_extras
    spm_calls = []
    Object.define_method(:spm_dependency) do |spec, **kwargs|
      spm_calls << { spec: spec, **kwargs }
    end

    load_firebase_spm

    spec = MockSpec.new
    # Crashlytics: SPM only needs FirebaseCrashlytics, CocoaPods needs 2 pods
    firebase_dependency(spec, '12.10.0',
      ['FirebaseCrashlytics'],
      ['Firebase/Crashlytics', 'FirebaseCoreExtension']
    )

    # CocoaPods not called
    assert_equal 0, spec.dependencies.length

    # SPM called with only the SPM products (no FirebaseCoreExtension)
    assert_equal 1, spm_calls.length
    assert_equal ['FirebaseCrashlytics'], spm_calls[0][:products]
  end

  # ── $RNFirebaseDisableSPM semantics (must check truthiness, not defined?) ──

  def test_disable_spm_true_forces_cocoapods
    Object.define_method(:spm_dependency) { |*| raise 'spm_dependency should not be called' }

    load_firebase_spm
    $RNFirebaseDisableSPM = true

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')

    assert_equal 1, spec.dependencies.length
    assert_equal 'Firebase/Auth', spec.dependencies[0][:name]
  end

  def test_disable_spm_false_still_uses_spm
    spm_calls = []
    Object.define_method(:spm_dependency) do |spec, **kwargs|
      spm_calls << { spec: spec, **kwargs }
    end

    load_firebase_spm
    # Config generators / Expo plugins / env-templated Podfiles may emit `false`
    # rather than omitting the assignment entirely. This must NOT disable SPM.
    $RNFirebaseDisableSPM = false

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')

    assert_equal 0, spec.dependencies.length
    assert_equal 1, spm_calls.length
    assert_equal ['FirebaseAuth'], spm_calls[0][:products]
  end

  def test_disable_spm_unset_uses_spm
    spm_calls = []
    Object.define_method(:spm_dependency) do |spec, **kwargs|
      spm_calls << { spec: spec, **kwargs }
    end

    load_firebase_spm

    spec = MockSpec.new
    firebase_dependency(spec, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')

    assert_equal 0, spec.dependencies.length
    assert_equal 1, spm_calls.length
  end

  # ── URL from package.json ──

  def test_reads_spm_url_from_package_json
    load_firebase_spm

    assert_equal 'https://github.com/firebase/firebase-ios-sdk.git', $firebase_spm_url
  end

  # ── $rnfirebase_spm_active tracking (replaces reflecting into RN's `SPM`
  #    internal object, which rnfirebase_add_spm_embed_phase used to do) ──

  def test_spm_path_sets_active_flag
    Object.define_method(:spm_dependency) { |*| nil }
    load_firebase_spm

    refute $rnfirebase_spm_active
    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    assert $rnfirebase_spm_active
  end

  def test_cocoapods_path_does_not_set_active_flag
    load_firebase_spm

    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    refute $rnfirebase_spm_active
  end

  def test_disabled_spm_does_not_set_active_flag_even_if_spm_dependency_defined
    Object.define_method(:spm_dependency) { |*| raise 'spm_dependency should not be called' }
    load_firebase_spm
    $RNFirebaseDisableSPM = true

    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    refute $rnfirebase_spm_active
  end

  # ── rnfirebase_add_spm_embed_phase (invoked automatically by
  #    rnfirebase_hook_cocoapods_post_install!, tested separately below) ──

  def test_embed_phase_noop_when_spm_not_active
    load_firebase_spm
    $rnfirebase_spm_active = false

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_add_spm_embed_phase(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_embed_phase_noop_without_cp_embed_pods_frameworks_phase
    load_firebase_spm
    $rnfirebase_spm_active = true

    target = MockTarget.new(['[CP] Some Other Phase'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_embed_phase(installer)

    # Unchanged: still only the pre-existing unrelated phase, no RNFB phase added.
    assert_equal 1, target.shell_script_build_phases.length
    assert_equal '[CP] Some Other Phase', target.shell_script_build_phases[0].name
    assert_equal 0, user_project.save_count
  end

  def test_embed_phase_adds_phase_when_active_and_cp_phase_present
    load_firebase_spm
    $rnfirebase_spm_active = true

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_embed_phase(installer)

    rnfb_phase = target.shell_script_build_phases.find { |p| p.name == RNFIREBASE_SPM_EMBED_PHASE_NAME }
    refute_nil rnfb_phase
    assert_equal '/bin/bash', rnfb_phase.shell_path
    assert_equal '1', rnfb_phase.always_out_of_date
    assert_includes rnfb_phase.shell_script, 'PackageFrameworks'
    assert_equal ['${BUILT_PRODUCTS_DIR}/PackageFrameworks'], rnfb_phase.input_paths
    assert_equal ['${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}'], rnfb_phase.output_paths
    assert_equal 1, user_project.save_count
  end

  def test_embed_phase_is_idempotent_across_repeated_pod_installs
    load_firebase_spm
    $rnfirebase_spm_active = true

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_embed_phase(installer)
    rnfirebase_add_spm_embed_phase(installer)

    matching = target.shell_script_build_phases.select { |p| p.name == RNFIREBASE_SPM_EMBED_PHASE_NAME }
    assert_equal 1, matching.length
    # The second, redundant call must not re-save the pbxproj: nothing about
    # the phase actually changed, so re-saving would be needless diff churn
    # on a file consumers commit to source control.
    assert_equal 1, user_project.save_count
  end

  # ── rnfirebase_add_spm_core_to_app_target ──

  def test_add_core_noop_when_spm_not_active
    load_firebase_spm
    $rnfirebase_spm_active = false

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_add_spm_core_to_app_target(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_add_core_noop_without_cp_embed_pods_frameworks_phase
    load_firebase_spm
    $rnfirebase_spm_active = true
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'
    $rnfirebase_spm_version = '12.10.0'

    target = MockTarget.new(['[CP] Some Other Phase'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_equal 0, user_project.save_count
  end

  def test_add_core_links_firebase_core_when_active_and_cp_phase_present
    load_firebase_spm
    $rnfirebase_spm_active = true
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'
    $rnfirebase_spm_version = '12.10.0'

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    assert_equal 1, target.package_product_dependencies.length
    ref = target.package_product_dependencies[0]
    assert_equal 'FirebaseCore', ref.product_name
    assert_equal $firebase_spm_url, ref.package.repositoryURL

    search_path = '${SYMROOT}/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/'
    target.build_configurations.each do |config|
      assert_includes target.build_settings(config.name)['SWIFT_INCLUDE_PATHS'], search_path
    end

    assert_equal 1, user_project.save_count
  end

  def test_add_core_is_idempotent_across_repeated_pod_installs
    load_firebase_spm
    $rnfirebase_spm_active = true
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'
    $rnfirebase_spm_version = '12.10.0'

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)
    rnfirebase_add_spm_core_to_app_target(installer)

    assert_equal 1, target.package_product_dependencies.length
  end

  def test_add_core_handles_swift_include_paths_already_set_as_a_string
    load_firebase_spm
    $rnfirebase_spm_active = true
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'
    $rnfirebase_spm_version = '12.10.0'

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    # Xcode/Xcodeproj may represent a list-type build setting as a
    # whitespace-separated String instead of an Array, depending on how the
    # consumer's project was authored -- a bare `||= [...]` default only
    # covers the `nil` case, and calling `.push` on a String raises
    # NoMethodError, crashing `pod install` for this target.
    target.build_configurations.each do |config|
      target.build_settings(config.name)['SWIFT_INCLUDE_PATHS'] = '$(inherited) $(SRCROOT)/SomeExistingPath'
    end
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    search_path = '${SYMROOT}/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/'
    target.build_configurations.each do |config|
      paths = target.build_settings(config.name)['SWIFT_INCLUDE_PATHS']
      assert_instance_of Array, paths
      assert_includes paths, '$(inherited)'
      assert_includes paths, '$(SRCROOT)/SomeExistingPath'
      assert_includes paths, search_path
    end
  end

  # ── rnfirebase_remove_spm_core_from_app_target (the fix for CP-149: undoes
  #    rnfirebase_add_spm_core_to_app_target once SPM is disabled, so a stale
  #    app-target FirebaseCore SPM link committed from a prior SPM-mode
  #    `pod install` doesn't collide with a fresh CocoaPods-only resolve --
  #    see "redefinition of module 'Firebase'" / duplicate App-Intents-metadata
  #    build commands) ──

  def test_remove_core_noop_when_spm_active
    load_firebase_spm
    $rnfirebase_spm_active = true

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_remove_spm_core_from_app_target(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_remove_core_noop_when_no_stale_dependency_present
    load_firebase_spm
    $rnfirebase_spm_active = false
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_equal 0, user_project.save_count
  end

  def test_remove_core_removes_stale_dependency_and_orphaned_package_reference
    load_firebase_spm
    $rnfirebase_spm_active = false
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'

    # Simulate the state left behind by a prior SPM-mode `pod install`: the
    # app target still has an explicit FirebaseCore product dependency, and
    # the project still has the backing package reference.
    pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    pkg.repositoryURL = $firebase_spm_url
    ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    ref.product_name = 'FirebaseCore'
    ref.package = pkg

    target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [ref])
    user_project = MockUserProject.new([target], package_references: [pkg])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_empty user_project.root_object.package_references
    assert_equal 1, user_project.save_count
  end

  def test_remove_core_leaves_package_reference_when_still_used_by_another_target
    load_firebase_spm
    $rnfirebase_spm_active = false
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'

    pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    pkg.repositoryURL = $firebase_spm_url

    stale_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    stale_ref.product_name = 'FirebaseCore'
    stale_ref.package = pkg

    other_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    other_ref.product_name = 'FirebaseAuth'
    other_ref.package = pkg

    target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [stale_ref])
    other_target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [other_ref], name: 'other')
    user_project = MockUserProject.new([target, other_target], package_references: [pkg])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_equal [other_ref], other_target.package_product_dependencies
    # Still referenced by `other_target`'s product dependency, so it must stay.
    assert_equal [pkg], user_project.root_object.package_references
  end

  def test_remove_core_ignores_dependencies_from_a_different_package_url
    load_firebase_spm
    $rnfirebase_spm_active = false
    $firebase_spm_url = 'https://github.com/firebase/firebase-ios-sdk.git'

    unrelated_pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    unrelated_pkg.repositoryURL = 'https://github.com/some/other-package.git'
    unrelated_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    unrelated_ref.product_name = 'FirebaseCore'
    unrelated_ref.package = unrelated_pkg

    target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [unrelated_ref])
    user_project = MockUserProject.new([target], package_references: [unrelated_pkg])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_equal [unrelated_ref], target.package_product_dependencies
    assert_equal [unrelated_pkg], user_project.root_object.package_references
  end

  # ── rnfirebase_fix_spm_archive_signature_collision ──

  def test_signature_collision_fix_noop_when_spm_not_active
    load_firebase_spm
    $rnfirebase_spm_active = false

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_fix_spm_archive_signature_collision(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_signature_collision_fix_adds_phase_removing_every_known_artifact
    load_firebase_spm
    $rnfirebase_spm_active = true

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_fix_spm_archive_signature_collision(installer)

    phase = target.shell_script_build_phases.find { |p| p.name == RNFIREBASE_SPM_SIGNATURE_FIX_PHASE_NAME }
    refute_nil phase
    assert_equal '/bin/sh', phase.shell_path
    RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES.each do |artifact_name|
      assert_includes phase.shell_script, "#{artifact_name}.xcframework-ios.signature"
    end
    assert_equal 1, user_project.save_count
  end

  def test_signature_collision_fix_is_idempotent_across_repeated_pod_installs
    load_firebase_spm
    $rnfirebase_spm_active = true

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_fix_spm_archive_signature_collision(installer)
    rnfirebase_fix_spm_archive_signature_collision(installer)

    matching = target.shell_script_build_phases.select { |p| p.name == RNFIREBASE_SPM_SIGNATURE_FIX_PHASE_NAME }
    assert_equal 1, matching.length
    # The second, redundant call must not re-save the pbxproj: nothing about
    # the phase actually changed.
    assert_equal 1, user_project.save_count
  end

  # ── rnfirebase_fail_if_spm_static_linkage! ──

  def test_fail_fast_noop_when_spm_not_active
    load_firebase_spm
    $rnfirebase_spm_active = false

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_fail_if_spm_static_linkage!(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_fail_fast_noop_when_spm_active_and_all_targets_dynamic
    load_firebase_spm
    $rnfirebase_spm_active = true

    installer = MockInstaller.new([
      MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: false)
    ])

    rnfirebase_fail_if_spm_static_linkage!(installer)
    # No error raised.
  end

  def test_fail_fast_raises_pod_informative_when_spm_active_and_a_target_is_static
    load_firebase_spm
    $rnfirebase_spm_active = true

    installer = MockInstaller.new([
      MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: true)
    ])

    error = assert_raises(Pod::Informative) do
      rnfirebase_fail_if_spm_static_linkage!(installer)
    end
    assert_includes error.message, 'SPM + static linkage is not supported'
    assert_includes error.message, 'Pods-testing'
    assert_includes error.message, '$RNFirebaseDisableSPM = true'
  end

  def test_fail_fast_ignores_aggregate_targets_own_always_static_build_type
    load_firebase_spm
    $rnfirebase_spm_active = true

    # Regression test for the exact bug that broke every SPM CI job: real
    # CocoaPods' `AggregateTarget#build_as_static?` is `true` unconditionally
    # (it always builds the "Pods-<target>" umbrella target as
    # static_framework/static_library -- see
    # `Installer::Analyzer#generate_aggregate_target`), regardless of the
    # Podfile's `use_frameworks!(:linkage => ...)` choice. A previous version
    # of this check read that method directly and so failed on every single
    # SPM `pod install`, dynamic linkage included. This target simulates
    # dynamic linkage (`static_linkage: false`, i.e. what
    # `target_definition.build_type.static?` reports) and must not raise.
    target = MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: false)
    def target.build_as_static?
      true # what the real, always-static aggregate target would report
    end
    installer = MockInstaller.new([target])

    rnfirebase_fail_if_spm_static_linkage!(installer)
    # No error raised: the check must not be fooled by `build_as_static?`.
  end

  def test_fail_fast_lists_every_static_target_by_name
    load_firebase_spm
    $rnfirebase_spm_active = true

    installer = MockInstaller.new([
      MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: true),
      MockAggregateTarget.new(nil, name: 'Pods-testingTests', static_linkage: true),
      MockAggregateTarget.new(nil, name: 'Pods-dynamic-extension', static_linkage: false)
    ])

    error = assert_raises(Pod::Informative) do
      rnfirebase_fail_if_spm_static_linkage!(installer)
    end
    assert_includes error.message, 'Pods-testing, Pods-testingTests'
    refute_includes error.message, 'Pods-dynamic-extension'
  end

  # ── rnfirebase_hook_cocoapods_post_install! (patches a stand-in for
  #    Pod::Installer -- there's no real Pod::Installer without a full
  #    CocoaPods environment, so we exercise the aliasing/guard logic
  #    itself against a fake class shaped like it) ──

  def new_fake_cocoapods_installer_class(hook_private: true)
    klass = Class.new do
      attr_reader :original_hook_calls

      def initialize
        @original_hook_calls = 0
      end

      define_method(:run_podfile_post_install_hooks) do
        @original_hook_calls += 1
        :original_result
      end
    end
    klass.send(:private, :run_podfile_post_install_hooks) if hook_private
    klass
  end

  def test_hook_wraps_original_method_and_calls_embed_phase
    load_firebase_spm
    embed_phase_calls = []
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |installer| embed_phase_calls << installer }

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    result = instance.send(:run_podfile_post_install_hooks)

    assert_equal :original_result, result
    assert_equal 1, instance.original_hook_calls
    assert_equal 1, embed_phase_calls.length
    assert_same instance, embed_phase_calls[0]
  end

  def test_hook_preserves_original_method_privacy
    load_firebase_spm

    klass = new_fake_cocoapods_installer_class(hook_private: true)
    rnfirebase_hook_cocoapods_post_install!(klass)

    assert klass.private_method_defined?(:run_podfile_post_install_hooks)
    refute klass.method_defined?(:run_podfile_post_install_hooks)
  end

  def test_hook_is_idempotent_across_repeated_podspec_requires
    load_firebase_spm
    embed_phase_calls = []
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |installer| embed_phase_calls << installer }

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    # Simulates a second RNFB podspec also requiring firebase_spm.rb within
    # the same `pod install` process.
    rnfirebase_hook_cocoapods_post_install!(klass)

    instance = klass.new
    instance.send(:run_podfile_post_install_hooks)

    # A double-patch would otherwise call the original hook / embed phase
    # more than once per install.
    assert_equal 1, instance.original_hook_calls
    assert_equal 1, embed_phase_calls.length
  end

  def test_hook_swallows_embed_phase_errors_without_breaking_original_hook
    load_firebase_spm
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| raise 'boom' }

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    result = instance.send(:run_podfile_post_install_hooks)

    # CocoaPods' own post-install behavior must still complete normally --
    # a bug in our embed-phase logic must not break `pod install` itself.
    assert_equal :original_result, result
    assert_equal 1, instance.original_hook_calls
  end

  def test_hook_noop_when_hook_method_does_not_exist
    load_firebase_spm
    klass = Class.new # no run_podfile_post_install_hooks at all

    # Must not raise -- guards against a future CocoaPods release renaming
    # or removing the method.
    rnfirebase_hook_cocoapods_post_install!(klass)

    refute klass.method_defined?(:rnfirebase_original_run_podfile_post_install_hooks)
    refute klass.private_method_defined?(:rnfirebase_original_run_podfile_post_install_hooks)
  end

  def test_hook_raises_and_skips_original_hook_when_spm_static_linkage_detected
    load_firebase_spm
    $rnfirebase_spm_active = true

    klass = new_fake_cocoapods_installer_class
    klass.send(:attr_reader, :aggregate_targets)
    klass.send(:define_method, :initialize) do
      @original_hook_calls = 0
      @aggregate_targets = [MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: true)]
    end
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    assert_raises(Pod::Informative) { instance.send(:run_podfile_post_install_hooks) }
    # The known-broken combination must abort before CocoaPods' own
    # post-install behavior (and the rest of our best-effort hooks) run.
    assert_equal 0, instance.original_hook_calls
  end

  def test_hook_noop_when_installer_class_is_nil
    load_firebase_spm

    # Mirrors production when Pod::Installer isn't defined -- e.g. outside
    # of a real CocoaPods environment, as in this test suite.
    rnfirebase_hook_cocoapods_post_install!(nil)
  end
end
