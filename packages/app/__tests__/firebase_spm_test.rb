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
  attr_reader :shell_script_build_phases

  def initialize(phase_names = [])
    @shell_script_build_phases = phase_names.map { |name| MockPhase.new(name) }
  end

  def new_shell_script_build_phase(name)
    phase = MockPhase.new(name)
    @shell_script_build_phases << phase
    phase
  end
end

class MockUserProject
  attr_reader :native_targets
  attr_accessor :save_count

  def initialize(native_targets)
    @native_targets = native_targets
    @save_count = 0
  end

  def save
    @save_count += 1
  end
end

class MockAggregateTarget
  attr_reader :user_project

  def initialize(user_project)
    @user_project = user_project
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
    assert_equal 2, user_project.save_count
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

  def test_hook_noop_when_installer_class_is_nil
    load_firebase_spm

    # Mirrors production when Pod::Installer isn't defined -- e.g. outside
    # of a real CocoaPods environment, as in this test suite.
    rnfirebase_hook_cocoapods_post_install!(nil)
  end
end
