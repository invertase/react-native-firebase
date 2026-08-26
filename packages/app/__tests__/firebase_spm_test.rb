# frozen_string_literal: true

# rubocop:disable Metrics, Style/Documentation, Style/OneClassPerFile, Style/GlobalVars, Naming/MethodName
require 'minitest/autorun'
require 'json'

# Mock Pod::Specification to capture dependency calls
class MockSpec
  attr_reader :dependencies, :name

  def initialize(name: 'RNFBApp')
    @dependencies = []
    @name = name
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

  def initialize(phase_names = [], package_product_dependencies: [], build_config_names: %w[Debug Release],
                 name: 'testing')
    @shell_script_build_phases = phase_names.map { |phase_name| MockPhase.new(phase_name) }
    @package_product_dependencies = package_product_dependencies
    @build_configurations = build_config_names.map { |config_name| MockBuildConfig.new(config_name) }
    @name = name
  end

  def new_shell_script_build_phase(name)
    phase = MockPhase.new(name)
    @shell_script_build_phases << phase
    phase
  end

  # Mirrors `AbstractTarget#build_settings(name)` → the named configuration's
  # `build_settings` hash. `rnfirebase_add_spm_core_to_app_target` uses this
  # API; `rnfirebase_apply_spm_build_settings` reads `config.build_settings`
  # directly — both must see the same mutable hash.
  def build_settings(config_name)
    config = @build_configurations.find { |c| c.name == config_name }
    config.build_settings
  end

  # Mirrors `PBXNativeTarget#frameworks_build_phase` (singular) → finds or
  # creates the target's one `PBXFrameworksBuildPhase`. Defaults to an empty
  # phase so every pre-existing test that never calls this keeps passing
  # unmodified -- this method, and the `files` collection it exposes, did not
  # exist on this mock before the fix for the missing `PBXBuildFile` link.
  def frameworks_build_phase
    @frameworks_build_phase ||= MockFrameworksBuildPhase.new
  end
end

# Mirrors `Xcodeproj::Project::Object::PBXFrameworksBuildPhase`'s
# `has_many :files, PBXBuildFile` -- the real collection
# `rnfirebase_add_spm_core_to_app_target` must append a `PBXBuildFile` to in
# order for Xcode to actually link a package product dependency, not just
# declare it (see `MockTarget#frameworks_build_phase` above).
class MockFrameworksBuildPhase
  attr_accessor :files

  def initialize
    @files = []
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

# Stands in for `Xcodeproj::Project::Object::PBXProject` (the real
# `Xcodeproj::Project#root_object`) -- specifically its `package_references`
# attribute (a `has_many :package_references, [XCRemoteSwiftPackageReference,
# XCLocalSwiftPackageReference]` collection), the only part of it
# rnfirebase_add_spm_core_to_app_target / rnfirebase_remove_spm_core_from_app_target
# read and mutate directly.
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
# gem. Local/Linux `yarn tests:ios:ruby` runs without installing xcodeproj;
# CI shape coverage lives on tests_e2e_ios.yml (debug + spm) after
# `BUNDLE_FROZEN=true bundle install` on the root Gemfile.
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

      # Mirrors `Xcodeproj::Project::Object::PBXBuildFile` -- specifically its
      # `has_one :product_ref, XCSwiftPackageProductDependency` attribute, the
      # real one `rnfirebase_add_spm_core_to_app_target` must set (not
      # `file_ref`, which is for plain file references) so a package product
      # dependency actually gets linked into the target's Frameworks build
      # phase, rather than merely declared on
      # `target.package_product_dependencies`. `file_ref` is modeled too, for
      # completeness, but unused by production code here.
      class PBXBuildFile
        attr_accessor :product_ref, :file_ref
      end
    end
  end
end

# Stands in for `Xcodeproj::Project::Object::XCBuildConfiguration`, the real
# element type of `AbstractTarget#build_configurations`. Exposes both `name`
# (for `target.build_settings(config.name)`) and a mutable `build_settings`
# hash (for `rnfirebase_apply_spm_build_settings`, which reads
# `config.build_settings` directly).
class MockBuildConfig
  attr_reader :name, :build_settings

  def initialize(name)
    @name = name
    @build_settings = {}
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
  attr_reader :kind

  def self.dynamic_framework
    new(kind: :dynamic_framework)
  end

  def self.static_framework
    new(kind: :static_framework)
  end

  def self.static_library
    new(kind: :static_library)
  end

  def initialize(static: false, kind: nil)
    @kind = kind || (static ? :static_framework : :dynamic_framework)
  end

  def static?
    %i[static_framework static_library].include?(@kind)
  end

  def ==(other)
    other.is_a?(MockBuildType) && other.kind == kind
  end
end

class MockTargetDefinition
  attr_reader :build_type

  def initialize(static: false)
    @build_type = MockBuildType.new(static: static)
  end
end

# Stands in for `Pod::AggregateTarget` -- specifically its `user_project`
# (`Xcodeproj::Project`) and `target_definition`
# (`Pod::Podfile::TargetDefinition`) attributes, the two real properties
# every `rnfirebase_*` post-install helper in firebase_spm.rb actually reads
# off an `installer.aggregate_targets` entry. Deliberately does *not* model
# `Pod::Target#build_as_static?`/`#build_type` (the real aggregate target's
# own, always-static build type) -- see `MockBuildType`'s comment above for
# why that would model the wrong signal entirely for this check.
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

Pod.const_set(:BuildType, MockBuildType) unless defined?(Pod::BuildType)

class MockPodTarget
  attr_reader :name, :build_type

  def initialize(name, build_type:)
    @name = name
    @build_type = build_type
  end
end

# Stands in for `Pod::UI` (CocoaPods' user-facing output helper) so tests can
# assert on `Pod::UI.warn` calls -- e.g. from `rnfirebase_hook_cocoapods_post_install!`'s
# guard clauses -- without the real `cocoapods-core` gem installed in this
# dependency-free Ruby unit-test job. Collects everything printed so tests
# can assert on it; cleared in `setup` below since (like `Pod::Informative`
# above) it can't be "undefined" again once defined in this process.
unless defined?(Pod::UI)
  module Pod
    module UI
      class << self
        attr_accessor :warnings, :messages
      end

      def self.warn(message)
        (self.warnings ||= []) << message
      end

      def self.puts(message)
        (self.messages ||= []) << message
      end
    end
  end
end

# `colored2` (a real CocoaPods dependency) patches `String#yellow` etc.,
# used by a couple of existing `Pod::UI.puts "...".yellow + ...` call sites
# in firebase_spm.rb. Stubbed as a no-op here so those call sites don't
# raise `NoMethodError` now that `defined?(Pod::UI)` is true above.
unless String.method_defined?(:yellow)
  class String
    def yellow
      self
    end
  end
end

# Stands in for `Pod::Installer` -- specifically its `aggregate_targets`
# attribute (a plain `attr_reader`), the only part of the real installer
# every `rnfirebase_*` post-install helper in firebase_spm.rb actually reads.
# Optional `pods_project` covers `rnfirebase_ensure_pods_uuid_counter_safe!`
# / `rnfirebase_verify_pods_project_uuid_integrity!`.
# `rnfirebase_hook_cocoapods_post_install!` itself is tested separately,
# against a fake class shaped like `Pod::Installer` (see
# `new_fake_cocoapods_installer_class` below), since there's no real
# `Pod::Installer` to alias/wrap without a full CocoaPods environment.
class MockInstaller
  attr_reader :aggregate_targets, :pods_project, :pod_targets, :podfile

  def initialize(aggregate_targets, pods_project: nil, pod_targets: [], podfile: nil)
    @aggregate_targets = aggregate_targets
    @pods_project = pods_project
    @pod_targets = pod_targets
    @podfile = podfile
  end
end

# Stands in for `Pod::Project` (CocoaPods' Xcodeproj subclass) -- specifically
# `@uuid_prefix`, `@generated_uuids`, `@available_uuids`, `objects_by_uuid`,
# and `root_object`, the surfaces
# `rnfirebase_ensure_pods_uuid_counter_safe!` /
# `rnfirebase_verify_pods_project_uuid_integrity!` read and mutate.
class MockPodsProject
  attr_reader :objects_by_uuid, :targets
  attr_accessor :root_object, :save_count

  def initialize(uuid_prefix:, objects_by_uuid: {}, generated_uuids: [], available_uuids: [], root_object: nil,
                 targets: [])
    @uuid_prefix = uuid_prefix
    @objects_by_uuid = objects_by_uuid
    @generated_uuids = generated_uuids
    @available_uuids = available_uuids
    @root_object = root_object
    @targets = targets
    @save_count = 0
  end

  def save
    @save_count += 1
  end
end

# Stands in for an `Xcodeproj::Project::Object` entry in `objects_by_uuid` --
# only `uuid` + `isa` are needed for the Pods UUID integrity check.
class MockProjectObject
  attr_reader :uuid, :isa

  def initialize(uuid, isa:)
    @uuid = uuid
    @isa = isa
  end
end

class FirebaseSpmTest < Minitest::Test
  def setup
    # Remove spm_dependency if defined from a previous test
    if defined?(spm_dependency)
      Object.send(:remove_method, :spm_dependency)
    end
    # NOTE: a Ruby global variable can't be "undefined" again once assigned in this
    # process, so `defined?($RNFirebaseDisableSPM)` stays true for the rest of the
    # suite after the first test that touches it. Resetting the value to nil (rather
    # than relying on `defined?` alone) is exactly the behavior rnfirebase_spm_disabled?
    # is meant to guard against, so tests below assert on it explicitly.
    $RNFirebaseDisableSPM = nil
    # `RNFirebaseSPM` gives us a real, deliberate reset primitive for the SPM
    # active/version/url state instead of relying on that same one-way-`defined?`
    # workaround -- unlike a bare global, `reset!` can put it back to a genuinely
    # "never activated" state between tests, not just back to a falsy value.
    # Guarded with `defined?` because the very first test's `setup` runs before
    # any test has `load`ed firebase_spm.rb yet, so the constant doesn't exist.
    RNFirebaseSPM.reset! if defined?(RNFirebaseSPM)
    @expo_created_by_test = false
    Expo.send(:remove_const, :PrecompiledModules) if defined?(Expo::PrecompiledModules)
    # Outer Expo constant removal is ownership-gated: see teardown.
    # Reset the `Pod::UI` mock's captured output between tests.
    Pod::UI.warnings = []
    Pod::UI.messages = []
  end

  def load_firebase_spm
    # Force re-evaluation of the file
    load File.join(__dir__, '..', 'firebase_spm.rb')
  end

  # Removes the outer `Expo` constant only when this test instance created it
  # (tracked via @expo_created_by_test) and it is still an empty module. A
  # pre-existing Expo constant that existed before the test ran is preserved.
  # Direct testing of teardown mechanics is impractical without calling teardown
  # manually or examining cross-instance state; the Expo restore tests exercise
  # the full create-use-clean path through the normal Minitest lifecycle.
  def teardown
    Expo.send(:remove_const, :PrecompiledModules) if defined?(Expo::PrecompiledModules)
    return unless @expo_created_by_test

    Object.send(:remove_const, :Expo) if defined?(Expo) && Expo.is_a?(Module) && Expo.constants.empty?
  end

  # Creates the outer `Expo` module if not already defined, marking this test
  # instance as the owner so teardown can remove it. Both
  # `stub_expo_precompiled_modules` and any test that manually constructs a
  # partial `Expo::PrecompiledModules` must go through this helper.
  def ensure_expo_module!
    return if defined?(Expo)

    Object.const_set(:Expo, Module.new)
    @expo_created_by_test = true
  end

  def stub_expo_precompiled_modules(enabled:, linkage:)
    ensure_expo_module!
    precompiled_modules = Module.new
    precompiled_modules.define_singleton_method(:enabled?) { enabled }
    precompiled_modules.define_singleton_method(:linkage) { |_| linkage }
    Expo.const_set(:PrecompiledModules, precompiled_modules)
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
                        ['Firebase/Crashlytics', 'FirebaseCoreExtension'])

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
                        ['Firebase/Crashlytics', 'FirebaseCoreExtension'])

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

    assert_equal 'https://github.com/firebase/firebase-ios-sdk.git', RNFirebaseSPM.url
  end

  # ── RNFirebaseSPM.active? tracking (replaces reflecting into RN's `SPM`
  #    internal object, which rnfirebase_add_spm_embed_phase used to do) ──

  def test_spm_path_sets_active_flag
    Object.define_method(:spm_dependency) { |*| nil }
    load_firebase_spm

    refute RNFirebaseSPM.active?
    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    assert RNFirebaseSPM.active?
  end

  def test_cocoapods_path_does_not_set_active_flag
    load_firebase_spm

    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    refute RNFirebaseSPM.active?
  end

  def test_disabled_spm_does_not_set_active_flag_even_if_spm_dependency_defined
    Object.define_method(:spm_dependency) { |*| raise 'spm_dependency should not be called' }
    load_firebase_spm
    $RNFirebaseDisableSPM = true

    firebase_dependency(MockSpec.new, '12.10.0', ['FirebaseAuth'], 'Firebase/Auth')
    refute RNFirebaseSPM.active?
  end

  def test_active_raises_when_flag_set_without_version
    load_firebase_spm
    RNFirebaseSPM.instance_variable_set(:@active, true)
    RNFirebaseSPM.instance_variable_set(:@version, nil)

    error = assert_raises(Pod::Informative) { RNFirebaseSPM.active? }
    assert_includes error.message, 'marked active without a recorded version'
  end

  def test_active_raises_when_flag_set_with_empty_version
    load_firebase_spm
    RNFirebaseSPM.instance_variable_set(:@active, true)
    RNFirebaseSPM.instance_variable_set(:@version, '   ')

    error = assert_raises(Pod::Informative) { RNFirebaseSPM.active? }
    assert_includes error.message, 'marked active without a recorded version'
  end

  # ── rnfirebase_build_setting_list ──

  def test_build_setting_list_dups_non_empty_array
    load_firebase_spm

    original = ['$(inherited)', '-ObjC']
    result = rnfirebase_build_setting_list(original)

    assert_equal original, result
    refute_same original, result
  end

  def test_build_setting_list_defaults_nil_empty_string_and_empty_array
    load_firebase_spm

    assert_equal ['$(inherited)'], rnfirebase_build_setting_list(nil)
    assert_equal ['$(inherited)'], rnfirebase_build_setting_list('')
    assert_equal ['$(inherited)'], rnfirebase_build_setting_list([])
  end

  def test_build_setting_list_splits_whitespace_string
    load_firebase_spm

    assert_equal %w[$(inherited) -ObjC], rnfirebase_build_setting_list('$(inherited) -ObjC')
  end

  # ── rnfirebase_add_spm_embed_phase (invoked automatically by
  #    rnfirebase_hook_cocoapods_post_install!, tested separately below) ──

  def test_embed_phase_noop_when_spm_not_active
    load_firebase_spm

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_add_spm_embed_phase(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_embed_phase_noop_without_cp_embed_pods_frameworks_phase
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_embed_phase(installer)

    rnfb_phase = target.shell_script_build_phases.find { |p| p.name == RNFIREBASE_SPM_EMBED_PHASE_NAME }
    refute_nil rnfb_phase
    assert_equal '/bin/bash', rnfb_phase.shell_path
    assert_equal '1', rnfb_phase.always_out_of_date
    assert_includes rnfb_phase.shell_script, 'PackageFrameworks'
    # Regression net for #9154 / SAE-1: the embed script must filter out
    # static (ar archive) frameworks before rsync, via `file -b` and
    # "dynamically linked". Fast, dependency-free guard against a future
    # refactor stripping the filter from the generated phase text.
    assert_includes rnfb_phase.shell_script, 'dynamically linked'
    assert_includes rnfb_phase.shell_script, 'file -b'
    assert_includes rnfb_phase.shell_script,
                    'Skipping ${framework_name}: binary missing or not dynamically linked'
    assert_equal ['${BUILT_PRODUCTS_DIR}/PackageFrameworks'], rnfb_phase.input_paths
    assert_equal ['${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}'], rnfb_phase.output_paths
    assert_equal 1, user_project.save_count
  end

  def test_embed_phase_is_idempotent_across_repeated_pod_installs
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_add_spm_core_to_app_target(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_add_core_noop_without_cp_embed_pods_frameworks_phase
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Some Other Phase'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_equal 0, user_project.save_count
  end

  def test_add_core_links_firebase_core_when_active_and_cp_phase_present
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    assert_equal 1, target.package_product_dependencies.length
    ref = target.package_product_dependencies[0]
    assert_equal 'FirebaseCore', ref.product_name
    assert_equal RNFirebaseSPM.url, ref.package.repositoryURL

    search_path = '${SYMROOT}/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/'
    target.build_configurations.each do |config|
      assert_includes target.build_settings(config.name)['SWIFT_INCLUDE_PATHS'], search_path
    end

    assert_equal 1, user_project.save_count
  end

  # Regression test for the missing-link bug (#9158): declaring a
  # `package_product_dependencies` entry alone tells Xcode the target
  # *depends* on the package product, but never actually links it -- that
  # requires a matching `PBXBuildFile` (with its `product_ref` pointed at the
  # same dependency) in the target's `PBXFrameworksBuildPhase`. Without it,
  # native code calling FIRApp/FIROptions directly (as Expo's generated
  # AppDelegate does) fails at the link step with "Undefined symbols ...
  # _OBJC_CLASS_$_FIRApp", even though `pod install` appears to succeed.
  def test_add_core_links_build_file_into_frameworks_build_phase
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    ref = target.package_product_dependencies[0]
    build_files = target.frameworks_build_phase.files
    assert_equal 1, build_files.length
    assert_same ref, build_files[0].product_ref
  end

  def test_add_core_is_idempotent_across_repeated_pod_installs
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)
    rnfirebase_add_spm_core_to_app_target(installer)

    assert_equal 1, target.package_product_dependencies.length
    # The early-exit guard (`target.package_product_dependencies.any? { ... }`)
    # must also stop a second `pod install` from double-linking the build
    # file it added on the first call.
    assert_equal 1, target.frameworks_build_phase.files.length
    # The second, redundant call must not re-save the pbxproj: nothing about
    # the target actually changed on the second pass.
    assert_equal 1, user_project.save_count
  end

  def test_add_core_handles_swift_include_paths_already_set_as_a_string
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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

  def test_add_core_reuses_existing_package_reference_matching_spm_url
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    existing_pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    existing_pkg.repositoryURL = RNFirebaseSPM.url
    existing_pkg.requirement = { kind: 'upToNextMajorVersion', minimumVersion: '12.0.0' }

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target], package_references: [existing_pkg])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    assert_equal 1, user_project.root_object.package_references.length
    assert_same existing_pkg, user_project.root_object.package_references[0]
    assert_equal 1, target.package_product_dependencies.length
    assert_same existing_pkg, target.package_product_dependencies[0].package
    assert_equal 1, user_project.save_count

    # No pre-existing product *dependency* on the target for this scenario --
    # only a pre-existing package *reference* -- so the build-file-linking
    # code path must still run and link the freshly-created dependency.
    build_files = target.frameworks_build_phase.files
    assert_equal 1, build_files.length
    assert_same target.package_product_dependencies[0], build_files[0].product_ref
  end

  # Regression test for the "already-affected consumer" self-heal gap
  # (#9158 follow-up): a project that already went through a *pre-fix*
  # RNFB version has a `FirebaseCore` product dependency declared on the
  # target, but no matching `PBXBuildFile` -- the exact broken state the
  # fix above is meant to repair. The plain
  # `target.package_product_dependencies.any? { dep.product_name == ... }`
  # guard can't tell that state apart from the fully-healthy
  # already-linked one, so it was bailing out before ever adding the
  # missing build file -- meaning upgrading and running `pod install`
  # alone could never self-heal an already-affected project.
  def test_add_core_heals_existing_dependency_missing_build_file
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    existing_pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    existing_pkg.repositoryURL = RNFirebaseSPM.url
    existing_pkg.requirement = { kind: 'upToNextMajorVersion', minimumVersion: '12.0.0' }

    existing_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    existing_ref.package = existing_pkg
    existing_ref.product_name = 'FirebaseCore'

    # Stale pre-fix state: dependency already declared on the target, but
    # never linked -- `frameworks_build_phase.files` (via the default empty
    # `MockFrameworksBuildPhase`) has no matching `PBXBuildFile` for it.
    target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [existing_ref])
    user_project = MockUserProject.new([target], package_references: [existing_pkg])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_add_spm_core_to_app_target(installer)

    # Healed: exactly one build file added, linking the *same* pre-existing
    # dependency object -- not a fresh/duplicate one.
    build_files = target.frameworks_build_phase.files
    assert_equal 1, build_files.length
    assert_same existing_ref, build_files[0].product_ref

    # No duplicate dependency or package reference created in the process.
    assert_equal 1, target.package_product_dependencies.length
    assert_same existing_ref, target.package_product_dependencies[0]
    assert_equal 1, user_project.root_object.package_references.length
    assert_same existing_pkg, user_project.root_object.package_references[0]
    assert_equal 1, user_project.save_count

    search_path = '${SYMROOT}/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/'
    target.build_configurations.each do |config|
      assert_includes target.build_settings(config.name)['SWIFT_INCLUDE_PATHS'], search_path
    end
  end

  # ── rnfirebase_apply_spm_build_settings ──

  def test_apply_spm_build_settings_noop_when_spm_not_active
    load_firebase_spm

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_apply_spm_build_settings(installer)
  end

  def test_apply_spm_build_settings_sets_objc_flag_and_disables_explicit_modules
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    user_target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([user_target])
    pods_target = MockTarget.new([])
    pods_project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      targets: [pods_target]
    )
    installer = MockInstaller.new(
      [MockAggregateTarget.new(user_project)],
      pods_project: pods_project
    )

    rnfirebase_apply_spm_build_settings(installer)

    user_target.build_configurations.each do |config|
      assert_includes config.build_settings['OTHER_LDFLAGS'], '-ObjC'
      assert_equal 'NO', config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES']
      assert_equal 'NO', config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES']
    end
    pods_target.build_configurations.each do |config|
      assert_equal 'NO', config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES']
      assert_equal 'NO', config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES']
    end
    assert_equal 1, user_project.save_count
    # post_integrate runs after CocoaPods writes Pods.xcodeproj -- in-memory
    # mutations here are lost unless the Pods project is saved too.
    assert_equal 1, pods_project.save_count
  end

  def test_apply_spm_build_settings_is_idempotent_when_already_configured
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    user_target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_target.build_configurations.each do |config|
      config.build_settings['OTHER_LDFLAGS'] = '$(inherited) -ObjC'
      config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
    user_project = MockUserProject.new([user_target])
    pods_target = MockTarget.new([])
    pods_target.build_configurations.each do |config|
      config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
    pods_project = MockPodsProject.new(uuid_prefix: 'ABCDEF', targets: [pods_target])
    installer = MockInstaller.new(
      [MockAggregateTarget.new(user_project)],
      pods_project: pods_project
    )

    rnfirebase_apply_spm_build_settings(installer)

    # OTHER_LDFLAGS already had -ObjC and explicit modules were already NO,
    # so the user project must not be re-saved.
    assert_equal 0, user_project.save_count
    assert_equal 0, pods_project.save_count
    user_target.build_configurations.each do |config|
      assert_equal '$(inherited) -ObjC', config.build_settings['OTHER_LDFLAGS']
    end
  end

  def test_apply_spm_build_settings_tolerates_missing_pods_project
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    user_target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'testing')
    user_project = MockUserProject.new([user_target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_apply_spm_build_settings(installer)

    assert_equal 1, user_project.save_count
    assert_equal 'NO', user_target.build_settings('Debug')['SWIFT_ENABLE_EXPLICIT_MODULES']
    assert_includes user_target.build_settings('Debug')['OTHER_LDFLAGS'], '-ObjC'
  end

  # ── rnfirebase_remove_spm_core_from_app_target (the fix for CP-149: undoes
  #    rnfirebase_add_spm_core_to_app_target once SPM is disabled, so a stale
  #    app-target FirebaseCore SPM link committed from a prior SPM-mode
  #    `pod install` doesn't collide with a fresh CocoaPods-only resolve --
  #    see "redefinition of module 'Firebase'" / duplicate App-Intents-metadata
  #    build commands) ──

  def test_remove_core_noop_when_spm_active
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_remove_spm_core_from_app_target(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_remove_core_noop_when_no_stale_dependency_present
    load_firebase_spm

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_equal 0, user_project.save_count
  end

  def test_remove_core_removes_stale_dependency_and_orphaned_package_reference
    load_firebase_spm

    # Simulate the state left behind by a prior SPM-mode `pod install`: the
    # app target still has an explicit FirebaseCore product dependency, and
    # the project still has the backing package reference.
    pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    pkg.repositoryURL = RNFirebaseSPM.url
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

  # Regression test for the dangling-PBXBuildFile bug found in review of #9158:
  # `rnfirebase_add_spm_core_to_app_target` links FirebaseCore by appending both
  # a package product dependency AND a matching PBXBuildFile to the target's
  # Frameworks build phase. Undoing that (this function) must remove both --
  # `ref.remove_from_project` alone only nils out the build file's product_ref,
  # it doesn't delete the now-useless PBXBuildFile itself.
  def test_remove_core_removes_orphaned_build_file_from_frameworks_build_phase
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    # First, SPM-enable: this is the real add path, and it's the only thing
    # that creates the PBXBuildFile this test is checking gets cleaned up.
    rnfirebase_add_spm_core_to_app_target(installer)
    assert_equal 1, target.frameworks_build_phase.files.length

    # Then, SPM-disable (e.g. `$RNFirebaseDisableSPM = true` on a later `pod install`).
    RNFirebaseSPM.reset!
    rnfirebase_remove_spm_core_from_app_target(installer)

    assert_empty target.package_product_dependencies
    assert_empty target.frameworks_build_phase.files
  end

  def test_remove_core_leaves_package_reference_when_still_used_by_another_target
    load_firebase_spm

    pkg = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference.new
    pkg.repositoryURL = RNFirebaseSPM.url

    stale_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    stale_ref.product_name = 'FirebaseCore'
    stale_ref.package = pkg

    other_ref = Xcodeproj::Project::Object::XCSwiftPackageProductDependency.new
    other_ref.product_name = 'FirebaseAuth'
    other_ref.package = pkg

    target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [stale_ref])
    other_target = MockTarget.new(['[CP] Embed Pods Frameworks'], package_product_dependencies: [other_ref],
                                                                  name: 'other')
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

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_fix_spm_archive_signature_collision(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_signature_collision_fix_adds_phase_removing_every_known_artifact
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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
    RNFirebaseSPM.activate!('12.10.0')

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

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_fail_if_spm_static_linkage!(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_fail_fast_noop_when_spm_active_and_all_targets_dynamic
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    installer = MockInstaller.new([
                                    MockAggregateTarget.new(nil, name: 'Pods-testing', static_linkage: false)
                                  ])

    rnfirebase_fail_if_spm_static_linkage!(installer)
    # No error raised.
  end

  def test_fail_fast_raises_pod_informative_when_spm_active_and_a_target_is_static
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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
    RNFirebaseSPM.activate!('12.10.0')

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
    RNFirebaseSPM.activate!('12.10.0')

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

  # ── Expo prebuilt RNCore dynamic-linkage repair ──

  def test_restore_expo_prebuilt_dynamic_linkage_noops_when_spm_is_inactive
    load_firebase_spm
    stub_expo_precompiled_modules(enabled: true, linkage: :dynamic)
    target = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)

    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(
      MockInstaller.new([], pod_targets: [target])
    )

    assert_equal Pod::BuildType.static_library, target.build_type
  end

  def test_restore_expo_prebuilt_dynamic_linkage_noops_outside_expo
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    target = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)

    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(
      MockInstaller.new([], pod_targets: [target])
    )

    assert_equal Pod::BuildType.static_library, target.build_type
  end

  def test_restore_expo_prebuilt_dynamic_linkage_noops_when_prebuilt_modules_are_disabled
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    stub_expo_precompiled_modules(enabled: false, linkage: :dynamic)
    target = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)

    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(
      MockInstaller.new([], pod_targets: [target])
    )

    assert_equal Pod::BuildType.static_library, target.build_type
  end

  def test_restore_expo_prebuilt_dynamic_linkage_preserves_static_podfile_linkage
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    stub_expo_precompiled_modules(enabled: true, linkage: :static)
    target = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)

    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(
      MockInstaller.new([], pod_targets: [target])
    )

    assert_equal Pod::BuildType.static_library, target.build_type
  end

  def test_restore_expo_prebuilt_dynamic_linkage_restores_only_static_library_rnfb_targets
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    stub_expo_precompiled_modules(enabled: true, linkage: :dynamic)
    app = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)
    messaging = MockPodTarget.new('RNFBMessaging', build_type: Pod::BuildType.static_library)
    already_dynamic = MockPodTarget.new('RNFBAuth', build_type: Pod::BuildType.dynamic_framework)
    explicitly_static = MockPodTarget.new('RNFBStorage', build_type: Pod::BuildType.static_framework)
    react_core = MockPodTarget.new('React-Core', build_type: Pod::BuildType.static_library)
    installer = MockInstaller.new(
      [],
      pod_targets: [app, messaging, already_dynamic, explicitly_static, react_core]
    )

    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(installer)
    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(installer)

    assert_equal Pod::BuildType.dynamic_framework, app.build_type
    assert_equal Pod::BuildType.dynamic_framework, messaging.build_type
    assert_equal Pod::BuildType.dynamic_framework, already_dynamic.build_type
    assert_equal Pod::BuildType.static_framework, explicitly_static.build_type
    assert_equal Pod::BuildType.static_library, react_core.build_type
    restore_messages = Pod::UI.messages.select { |message| message.include?('RNFBApp, RNFBMessaging') }
    assert_equal 1, restore_messages.length
  end

  # A partial Expo::PrecompiledModules API (enabled? present, linkage absent)
  # must fail closed: the respond_to?(:linkage) guard returns early and leaves
  # every RNFB static target unchanged.
  def test_restore_expo_prebuilt_noop_when_linkage_method_absent
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    ensure_expo_module!
    partial = Module.new
    partial.define_singleton_method(:enabled?) { true }
    # Deliberately omit :linkage -- tests the guard in production code.
    Expo.const_set(:PrecompiledModules, partial)

    target = MockPodTarget.new('RNFBApp', build_type: Pod::BuildType.static_library)
    rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(
      MockInstaller.new([], pod_targets: [target])
    )

    assert_equal Pod::BuildType.static_library, target.build_type
  end

  # ── rnfirebase_ensure_pods_uuid_counter_safe! ──

  def cocoapods_uuid(prefix, index)
    format('%.6s%07X0', prefix, index) # rubocop:disable Style/FormatStringToken -- CocoaPods UUID layout
  end

  def test_ensure_pods_uuid_counter_pads_to_high_water_mark
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    prefix = 'ABCDEF'
    root_uuid = cocoapods_uuid(prefix, 0)
    high_uuid = cocoapods_uuid(prefix, 0x42)
    md5_uuid = 'A' * 32
    project = MockPodsProject.new(
      uuid_prefix: prefix,
      objects_by_uuid: {
        root_uuid => :root,
        high_uuid => :high,
        md5_uuid => :stable_target
      },
      generated_uuids: [],
      available_uuids: ['leftover-md5-style']
    )
    installer = MockInstaller.new([], pods_project: project)
    Pod::UI.messages.clear

    rnfirebase_ensure_pods_uuid_counter_safe!(installer)

    generated = project.instance_variable_get(:@generated_uuids)
    assert_equal 0x43, generated.size
    assert_equal cocoapods_uuid(prefix, 0), generated[0]
    assert_equal cocoapods_uuid(prefix, 0x42), generated[0x42]
    assert_empty project.instance_variable_get(:@available_uuids)
    assert_equal 1, Pod::UI.messages.length
    assert_includes Pod::UI.messages[0], 'past index 66'
  end

  def test_ensure_pods_uuid_counter_noop_for_nil_project
    load_firebase_spm

    installer = MockInstaller.new([], pods_project: nil)
    rnfirebase_ensure_pods_uuid_counter_safe!(installer)
    # No error raised.
  end

  def test_ensure_pods_uuid_counter_ignores_md5_only_objects
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      objects_by_uuid: { ('B' * 32) => :stable_target, ('C' * 32) => :other },
      generated_uuids: ['preexisting'],
      available_uuids: ['available']
    )
    installer = MockInstaller.new([], pods_project: project)
    Pod::UI.messages.clear

    rnfirebase_ensure_pods_uuid_counter_safe!(installer)

    # No CocoaPods-format UUIDs => early return; counter untouched.
    assert_equal ['preexisting'], project.instance_variable_get(:@generated_uuids)
    assert_equal ['available'], project.instance_variable_get(:@available_uuids)
    assert_empty Pod::UI.messages
  end

  def test_ensure_pods_uuid_counter_noop_when_already_high
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    prefix = 'ABCDEF'
    high_uuid = cocoapods_uuid(prefix, 5)
    preexisting = (0..10).map { |i| cocoapods_uuid(prefix, i) }
    project = MockPodsProject.new(
      uuid_prefix: prefix,
      objects_by_uuid: { high_uuid => :obj },
      generated_uuids: preexisting.dup,
      available_uuids: ['stale']
    )
    installer = MockInstaller.new([], pods_project: project)
    Pod::UI.messages.clear

    rnfirebase_ensure_pods_uuid_counter_safe!(installer)

    generated = project.instance_variable_get(:@generated_uuids)
    assert_equal 11, generated.size
    assert_equal preexisting, generated
    assert_empty project.instance_variable_get(:@available_uuids)
    assert_empty Pod::UI.messages
  end

  def test_ensure_pods_uuid_counter_is_silent_when_spm_inactive
    load_firebase_spm
    # SPM not activated -- padding still happens, but no pod-install spam.

    prefix = 'ABCDEF'
    project = MockPodsProject.new(
      uuid_prefix: prefix,
      objects_by_uuid: { cocoapods_uuid(prefix, 3) => :obj },
      generated_uuids: [],
      available_uuids: []
    )
    installer = MockInstaller.new([], pods_project: project)
    Pod::UI.messages.clear

    rnfirebase_ensure_pods_uuid_counter_safe!(installer)

    assert_equal 4, project.instance_variable_get(:@generated_uuids).size
    assert_empty Pod::UI.messages
  end

  # ── rnfirebase_verify_pods_project_uuid_integrity! ──

  def test_verify_pods_uuid_integrity_noop_when_spm_not_active
    load_firebase_spm

    root = MockProjectObject.new(cocoapods_uuid('ABCDEF', 0), isa: 'XCSwiftPackageProductDependency')
    project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      objects_by_uuid: { root.uuid => root },
      root_object: root
    )
    # Would raise if the check ran against this corrupted graph.
    rnfirebase_verify_pods_project_uuid_integrity!(MockInstaller.new([], pods_project: project))
  end

  def test_verify_pods_uuid_integrity_noop_without_pods_project
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    rnfirebase_verify_pods_project_uuid_integrity!(MockInstaller.new([]))
  end

  def test_verify_pods_uuid_integrity_passes_when_root_resolves
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    root = MockProjectObject.new(cocoapods_uuid('ABCDEF', 0), isa: 'PBXProject')
    project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      objects_by_uuid: { root.uuid => root },
      root_object: root
    )

    rnfirebase_verify_pods_project_uuid_integrity!(MockInstaller.new([], pods_project: project))
  end

  def test_verify_pods_uuid_integrity_raises_when_root_uuid_overwritten
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    root_uuid = cocoapods_uuid('ABCDEF', 0)
    root = MockProjectObject.new(root_uuid, isa: 'PBXProject')
    interloper = MockProjectObject.new(root_uuid, isa: 'XCSwiftPackageProductDependency')
    project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      objects_by_uuid: { root_uuid => interloper },
      root_object: root
    )

    error = assert_raises(Pod::Informative) do
      rnfirebase_verify_pods_project_uuid_integrity!(MockInstaller.new([], pods_project: project))
    end
    assert_includes error.message, 'rootObject'
    assert_includes error.message, 'PBXProject'
  end

  # ── rnfirebase_hook_cocoapods_post_install! (patches a stand-in for
  #    Pod::Installer -- there's no real Pod::Installer without a full
  #    CocoaPods environment, so we exercise the aliasing/guard logic
  #    itself against a fake class shaped like it) ──

  def new_fake_cocoapods_installer_class(hook_private: true)
    klass = Class.new do
      attr_reader :original_hook_calls, :original_generate_calls

      def initialize
        @original_hook_calls = 0
        @original_generate_calls = 0
      end

      define_method(:generate_pods_project) do
        @original_generate_calls += 1
        :original_generate_result
      end

      define_method(:run_podfile_post_install_hooks) do
        @original_hook_calls += 1
        :original_result
      end
    end
    klass.send(:private, :generate_pods_project) if hook_private
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

  def test_hook_restores_rnfb_linkage_before_pods_project_generation
    load_firebase_spm
    order = []
    Object.define_method(:rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!) { |*| order << :restore }

    klass = new_fake_cocoapods_installer_class
    klass.send(:define_method, :generate_pods_project) do
      order << :original
      :original_generate_result
    end
    klass.send(:private, :generate_pods_project)
    rnfirebase_hook_cocoapods_post_install!(klass)

    result = klass.new.send(:generate_pods_project)

    assert_equal :original_generate_result, result
    assert_equal %i[restore original], order
  end

  def test_generate_pods_project_hook_is_idempotent_across_repeated_podspec_requires
    load_firebase_spm
    restore_calls = []
    Object.define_method(:rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!) do |installer|
      restore_calls << installer
    end

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    result = instance.send(:generate_pods_project)

    assert_equal :original_generate_result, result
    assert_equal 1, instance.original_generate_calls
    assert_equal [instance], restore_calls
  end

  # The generate_pods_project wrapper must not call the original generate method
  # after a restore failure: it must warn with a directed message identifying
  # Expo prebuilt dynamic-linkage restoration and re-raise the original error.
  def test_generate_pods_project_hook_warns_and_reraises_on_restore_failure
    load_firebase_spm
    boom = RuntimeError.new('restore boom')
    Object.define_method(:rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!) { |*| raise boom }
    Pod::UI.warnings.clear

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    raised = assert_raises(RuntimeError) { instance.send(:generate_pods_project) }
    assert_same boom, raised
    assert_equal 0, instance.original_generate_calls
    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'Expo prebuilt RNFB dynamic-linkage restoration'
    assert_includes Pod::UI.warnings[0], 'restore boom'
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

  def test_hook_warns_and_noops_when_hook_method_does_not_exist
    load_firebase_spm
    klass = Class.new # no run_podfile_post_install_hooks at all
    Pod::UI.warnings.clear

    # Must not raise -- guards against a future CocoaPods release renaming
    # or removing the method -- but must warn loudly instead of silently
    # no-opping, since a consumer app would otherwise crash at launch with
    # no diagnostic pointing back at this file.
    rnfirebase_hook_cocoapods_post_install!(klass)

    refute klass.method_defined?(:rnfirebase_original_run_podfile_post_install_hooks)
    refute klass.private_method_defined?(:rnfirebase_original_run_podfile_post_install_hooks)
    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'run_podfile_post_install_hooks'
    assert_includes Pod::UI.warnings[0], 'rnfirebase_add_spm_embed_phase(installer)'
    assert_includes Pod::UI.warnings[0], 'post_integrate'
  end

  def test_hook_raises_and_skips_original_hook_when_spm_static_linkage_detected
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

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

  def test_hook_warns_and_noops_when_installer_class_is_nil
    load_firebase_spm
    # Mirrors production when Pod::Installer isn't defined -- e.g. outside
    # of a real CocoaPods environment, as in this test suite. Clear the
    # warning `load_firebase_spm` itself just generated (it calls
    # `rnfirebase_hook_cocoapods_post_install!` with no args at the bottom
    # of the file, which resolves to this exact nil case in this process),
    # so the assertions below only see the explicit call under test.
    Pod::UI.warnings.clear

    rnfirebase_hook_cocoapods_post_install!(nil)

    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'Pod::Installer'
    assert_includes Pod::UI.warnings[0], 'rnfirebase_add_spm_embed_phase(installer)'
    assert_includes Pod::UI.warnings[0], 'post_integrate'
  end

  def test_hook_does_not_warn_when_already_hooked
    # The "already hooked" guard is idempotency-only, not a failure signal:
    # it's the expected, normal path whenever this file gets `require`d (or
    # `load`ed, as in every test here) more than once against the same
    # installer class within one `pod install` process -- see
    # `test_hook_is_idempotent_across_repeated_podspec_requires` above. That
    # happens on every real multi-podspec RNFB install, so warning here
    # would spam `pod install` output for entirely normal behavior. No test
    # asserts a warning for this guard; this test documents and locks in
    # that silence instead.
    load_firebase_spm

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    Pod::UI.warnings.clear

    rnfirebase_hook_cocoapods_post_install!(klass)

    assert_empty Pod::UI.warnings
  end

  # Current CocoaPods: `run_podfile_post_integrate_hooks` exists and is what
  # actually runs after `integrate_user_project` writes `[CP] Embed Pods
  # Frameworks`. User-project SPM helpers must not run from post_install or
  # Expo CNG `--clean` (no CP phase yet) silently skips the app target.
  def new_fake_cocoapods_installer_class_with_post_integrate
    klass = Class.new do
      attr_reader :original_hook_calls, :original_integrate_calls, :original_generate_calls

      def initialize
        @original_hook_calls = 0
        @original_integrate_calls = 0
        @original_generate_calls = 0
      end

      define_method(:generate_pods_project) do
        @original_generate_calls += 1
        :original_generate_result
      end

      define_method(:run_podfile_post_install_hooks) do
        @original_hook_calls += 1
        :original_result
      end

      define_method(:run_podfile_post_integrate_hooks) do
        @original_integrate_calls += 1
        :integrate_result
      end
    end
    klass.send(:private, :generate_pods_project)
    klass.send(:private, :run_podfile_post_install_hooks)
    klass.send(:private, :run_podfile_post_integrate_hooks)
    klass
  end

  def test_hook_defers_user_project_helpers_to_post_integrate_when_available
    load_firebase_spm
    user_hook_calls = []
    Object.define_method(:rnfirebase_run_spm_user_project_hooks) { |installer| user_hook_calls << installer }

    klass = new_fake_cocoapods_installer_class_with_post_integrate
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    instance.send(:run_podfile_post_install_hooks)
    assert_equal 1, instance.original_hook_calls
    assert_empty user_hook_calls

    result = instance.send(:run_podfile_post_integrate_hooks)
    assert_equal :integrate_result, result
    assert_equal 1, instance.original_integrate_calls
    assert_equal 1, user_hook_calls.length
    assert_same instance, user_hook_calls[0]
  end

  def test_hook_with_post_integrate_is_idempotent_across_repeated_podspec_requires
    load_firebase_spm
    user_hook_calls = []
    Object.define_method(:rnfirebase_run_spm_user_project_hooks) { |installer| user_hook_calls << installer }

    klass = new_fake_cocoapods_installer_class_with_post_integrate
    rnfirebase_hook_cocoapods_post_install!(klass)
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    instance.send(:run_podfile_post_install_hooks)
    instance.send(:run_podfile_post_integrate_hooks)

    assert_equal 1, instance.original_hook_calls
    assert_equal 1, instance.original_integrate_calls
    assert_equal 1, user_hook_calls.length
  end

  # Expo CNG `prebuild --clean` graph: at post_install the app target has no
  # `[CP] Embed Pods Frameworks` yet, so add_core / embed no-op. After
  # integrate adds that phase, post_integrate must attach FirebaseCore.
  def test_expo_clean_prebuild_attaches_firebase_core_on_post_integrate
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new([]) # no CP embed yet -- Expo template / pre-integrate
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    klass = new_fake_cocoapods_installer_class_with_post_integrate
    klass.send(:attr_accessor, :aggregate_targets)
    klass.send(:define_method, :pods_project) { nil }
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new
    instance.aggregate_targets = installer.aggregate_targets

    instance.send(:run_podfile_post_install_hooks)
    assert_empty target.package_product_dependencies
    assert_equal 0, user_project.save_count
    refute(target.shell_script_build_phases.any? { |phase| phase.name == RNFIREBASE_SPM_EMBED_PHASE_NAME })

    # CocoaPods UserProjectIntegrator adds the CP embed phase, then
    # run_podfile_post_integrate_hooks.
    target.shell_script_build_phases << MockPhase.new('[CP] Embed Pods Frameworks')
    instance.send(:run_podfile_post_integrate_hooks)

    assert_equal 1, target.package_product_dependencies.length
    assert_equal 'FirebaseCore', target.package_product_dependencies[0].product_name
    assert_equal 1, target.frameworks_build_phase.files.length
    assert(target.shell_script_build_phases.any? { |phase| phase.name == RNFIREBASE_SPM_EMBED_PHASE_NAME })
    assert user_project.save_count >= 1
  end

  def test_run_spm_user_project_hooks_swallows_embed_errors_then_verifies
    load_firebase_spm
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| raise 'boom' }

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])
    RNFirebaseSPM.activate!('12.10.0')
    Pod::UI.warnings.clear

    error = assert_raises(Pod::Informative) do
      rnfirebase_run_spm_user_project_hooks(installer)
    end
    assert_includes error.message, 'Failed to add the Firebase SPM embed build phase'
    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'embed Firebase SPM frameworks'
    assert_includes Pod::UI.warnings[0], 'post_integrate'
  end

  def test_run_spm_user_project_hooks_warns_on_add_core_failure
    load_firebase_spm
    Object.define_method(:rnfirebase_add_spm_core_to_app_target) { |*| raise 'core boom' }

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])
    RNFirebaseSPM.activate!('12.10.0')
    Pod::UI.warnings.clear

    rnfirebase_run_spm_user_project_hooks(installer)

    core_warn = Pod::UI.warnings.find { |warning| warning.include?('link FirebaseCore') }
    refute_nil core_warn
    assert_includes core_warn, 'core boom'
    assert_includes core_warn, 'post_integrate'
    assert_includes core_warn, 'rnfirebase_add_spm_core_to_app_target(installer)'
  end

  def test_run_spm_user_project_hooks_warns_on_build_settings_failure
    load_firebase_spm
    Object.define_method(:rnfirebase_apply_spm_build_settings) { |*| raise 'settings boom' }

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])
    RNFirebaseSPM.activate!('12.10.0')
    Pod::UI.warnings.clear

    rnfirebase_run_spm_user_project_hooks(installer)

    settings_warn = Pod::UI.warnings.find { |warning| warning.include?('apply Firebase SPM build settings') }
    refute_nil settings_warn
    assert_includes settings_warn, 'settings boom'
    assert_includes settings_warn, 'post_integrate'
    assert_includes settings_warn, 'rnfirebase_apply_spm_build_settings(installer)'
  end

  # ── rnfirebase_verify_spm_embed_phase_applied! ──

  def test_verify_embed_phase_noop_when_spm_not_active
    load_firebase_spm

    installer = MockInstaller.new(nil) # would raise if ever touched
    rnfirebase_verify_spm_embed_phase_applied!(installer)
    # No error raised => returned early without walking `installer.aggregate_targets`.
  end

  def test_verify_embed_phase_noop_without_cp_embed_pods_frameworks_phase
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    # No `'[CP] Embed Pods Frameworks'` phase => this target never needed
    # the RNFB embed phase in the first place, so its absence isn't a failure.
    target = MockTarget.new(['[CP] Some Other Phase'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    rnfirebase_verify_spm_embed_phase_applied!(installer)
    # No error raised.
  end

  def test_verify_embed_phase_noop_when_phase_present
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    target = MockTarget.new(['[CP] Embed Pods Frameworks'])
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])
    rnfirebase_add_spm_embed_phase(installer)

    rnfirebase_verify_spm_embed_phase_applied!(installer)
    # No error raised: the phase rnfirebase_add_spm_embed_phase just added
    # satisfies the check.
  end

  def test_verify_embed_phase_raises_pod_informative_when_phase_missing_on_target_that_needs_it
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    # Simulates `rnfirebase_add_spm_embed_phase` having silently failed to
    # add its phase to a target that has `'[CP] Embed Pods Frameworks'` --
    # i.e. the exact load-bearing failure this function exists to catch.
    target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'testing')
    user_project = MockUserProject.new([target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    error = assert_raises(Pod::Informative) do
      rnfirebase_verify_spm_embed_phase_applied!(installer)
    end
    assert_includes error.message, 'Failed to add the Firebase SPM embed build phase'
    assert_includes error.message, 'testing'
    assert_includes error.message, 'rnfirebase_add_spm_embed_phase(installer)'
    assert_includes error.message, 'post_integrate'
  end

  def test_verify_embed_phase_lists_every_missing_target_by_name
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    missing_target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'missing-target')
    present_target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'present-target')
    present_target.new_shell_script_build_phase(RNFIREBASE_SPM_EMBED_PHASE_NAME)
    unrelated_target = MockTarget.new(['[CP] Some Other Phase'], name: 'unrelated-target')
    user_project = MockUserProject.new([missing_target, present_target, unrelated_target])
    installer = MockInstaller.new([MockAggregateTarget.new(user_project)])

    error = assert_raises(Pod::Informative) do
      rnfirebase_verify_spm_embed_phase_applied!(installer)
    end
    assert_includes error.message, 'missing-target'
    refute_includes error.message, 'present-target'
    refute_includes error.message, 'unrelated-target'
  end

  # ── rnfirebase_hook_cocoapods_post_install! calling
  #    rnfirebase_verify_spm_embed_phase_applied! ──

  def test_hook_raises_when_embed_phase_did_not_actually_apply
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    # Stub out the real embed-phase logic so it does nothing, simulating the
    # silent-failure scenario `rnfirebase_verify_spm_embed_phase_applied!` guards
    # against (e.g. a future Xcodeproj/Xcode-project shape it doesn't handle).
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| nil }

    klass = new_fake_cocoapods_installer_class
    klass.send(:attr_reader, :aggregate_targets)
    target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'testing')
    user_project = MockUserProject.new([target])
    klass.send(:define_method, :initialize) do
      @original_hook_calls = 0
      @aggregate_targets = [MockAggregateTarget.new(user_project)]
    end
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    assert_raises(Pod::Informative) { instance.send(:run_podfile_post_install_hooks) }
    # Unlike the softer, rescued checks further down the same hook, the
    # original CocoaPods post-install behavior has already run by this
    # point (this check is deliberately not skippable the way a static
    # linkage failure aborts before it) -- but the failure must still
    # surface as a hard `pod install` failure, not a warning.
    assert_equal 1, instance.original_hook_calls
  end

  def test_hook_does_not_raise_when_embed_phase_applied_correctly
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')

    klass = new_fake_cocoapods_installer_class
    klass.send(:attr_reader, :aggregate_targets)
    target = MockTarget.new(['[CP] Embed Pods Frameworks'], name: 'testing')
    user_project = MockUserProject.new([target])
    klass.send(:define_method, :initialize) do
      @original_hook_calls = 0
      @aggregate_targets = [MockAggregateTarget.new(user_project)]
    end
    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    result = instance.send(:run_podfile_post_install_hooks)

    assert_equal :original_result, result
    refute_nil(target.shell_script_build_phases.find { |p| p.name == RNFIREBASE_SPM_EMBED_PHASE_NAME })
  end

  def test_hook_calls_uuid_ensure_before_original_post_install
    load_firebase_spm
    order = []
    Object.define_method(:rnfirebase_ensure_pods_uuid_counter_safe!) { |*| order << :ensure }
    Object.define_method(:rnfirebase_verify_pods_project_uuid_integrity!) { |*| order << :verify }
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| nil }

    klass = Class.new do
      def initialize
        @original_hook_calls = 0
      end
    end
    klass.send(:define_method, :run_podfile_post_install_hooks) do
      order << :original
      :original_result
    end
    klass.send(:private, :run_podfile_post_install_hooks)

    rnfirebase_hook_cocoapods_post_install!(klass)
    result = klass.new.send(:run_podfile_post_install_hooks)

    assert_equal :original_result, result
    assert_equal %i[ensure original verify], order
  end

  def test_hook_raises_when_pods_uuid_integrity_fails_after_post_install
    load_firebase_spm
    RNFirebaseSPM.activate!('12.10.0')
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| nil }

    root_uuid = cocoapods_uuid('ABCDEF', 0)
    root = MockProjectObject.new(root_uuid, isa: 'PBXProject')
    interloper = MockProjectObject.new(root_uuid, isa: 'XCSwiftPackageProductDependency')
    project = MockPodsProject.new(
      uuid_prefix: 'ABCDEF',
      objects_by_uuid: {
        root_uuid => root,
        cocoapods_uuid('ABCDEF', 1) => :other
      },
      generated_uuids: [root_uuid, cocoapods_uuid('ABCDEF', 1)],
      available_uuids: [],
      root_object: root
    )

    klass = Class.new do
      attr_reader :original_hook_calls, :pods_project, :aggregate_targets

      define_method(:initialize) do
        @original_hook_calls = 0
        @aggregate_targets = []
        @pods_project = project
      end

      define_method(:run_podfile_post_install_hooks) do
        @original_hook_calls += 1
        # Simulate RN SPM overwriting rootObject during original post_install.
        @pods_project.objects_by_uuid[root_uuid] = interloper
        :original_result
      end
    end
    klass.send(:private, :run_podfile_post_install_hooks)

    rnfirebase_hook_cocoapods_post_install!(klass)
    instance = klass.new

    assert_raises(Pod::Informative) { instance.send(:run_podfile_post_install_hooks) }
    assert_equal 1, instance.original_hook_calls
  end

  # Soft-fail warn paths inside the hooked post-install method / outer install rescue.
  def stub_hook_soft_helpers!
    Object.define_method(:rnfirebase_fail_if_spm_static_linkage!) { |*| nil }
    Object.define_method(:rnfirebase_ensure_pods_uuid_counter_safe!) { |*| nil }
    Object.define_method(:rnfirebase_verify_pods_project_uuid_integrity!) { |*| nil }
    Object.define_method(:rnfirebase_add_spm_embed_phase) { |*| nil }
    Object.define_method(:rnfirebase_verify_spm_embed_phase_applied!) { |*| nil }
    Object.define_method(:rnfirebase_add_spm_core_to_app_target) { |*| nil }
    Object.define_method(:rnfirebase_remove_spm_core_from_app_target) { |*| nil }
    Object.define_method(:rnfirebase_fix_spm_archive_signature_collision) { |*| nil }
    Object.define_method(:rnfirebase_apply_spm_build_settings) { |*| nil }
  end

  def test_hook_warns_when_add_spm_core_raises
    load_firebase_spm
    stub_hook_soft_helpers!
    Object.define_method(:rnfirebase_add_spm_core_to_app_target) { |*| raise 'core boom' }

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    Pod::UI.warnings.clear

    result = klass.new.send(:run_podfile_post_install_hooks)

    assert_equal :original_result, result
    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], "Couldn't link FirebaseCore into the app target"
    assert_includes Pod::UI.warnings[0], 'core boom'
  end

  def test_hook_warns_when_archive_signature_fix_raises
    load_firebase_spm
    stub_hook_soft_helpers!
    Object.define_method(:rnfirebase_fix_spm_archive_signature_collision) { |*| raise 'sig boom' }

    klass = new_fake_cocoapods_installer_class
    rnfirebase_hook_cocoapods_post_install!(klass)
    Pod::UI.warnings.clear

    result = klass.new.send(:run_podfile_post_install_hooks)

    assert_equal :original_result, result
    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'Couldn\'t add the Firebase/Google SPM binary'
    assert_includes Pod::UI.warnings[0], 'sig boom'
  end

  def test_hook_warns_when_outer_hook_install_raises
    load_firebase_spm
    klass = new_fake_cocoapods_installer_class
    def klass.class_eval(*)
      raise 'install boom'
    end
    Pod::UI.warnings.clear

    rnfirebase_hook_cocoapods_post_install!(klass)

    assert_equal 1, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], "Couldn't hook CocoaPods to auto-embed Firebase SPM"
    assert_includes Pod::UI.warnings[0], 'install boom'
    assert_includes Pod::UI.warnings[0], 'post_integrate'
  end
end

# rubocop:enable Metrics, Style/Documentation, Style/OneClassPerFile, Style/GlobalVars, Naming/MethodName
