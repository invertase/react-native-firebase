# frozen_string_literal: true

# rubocop:disable Metrics, Style/Documentation
# Opt-in "shape-check" suite for firebase_spm.rb's Xcodeproj/CocoaPods API
# assumptions -- a companion to firebase_spm_test.rb, not a replacement for it.
#
# firebase_spm_test.rb mocks Xcodeproj/CocoaPods classes (MockAggregateTarget,
# MockInstaller, MockRootObject, MockBuildConfig, MockTarget, MockUserProject,
# MockBuildType, etc.) so firebase_spm.rb's post-install logic can be
# unit-tested without CocoaPods/Xcodeproj installed. That's fast and
# dependency-free, but it has a real structural ceiling: a mock can only ever
# be as accurate as whoever wrote it modeled the real class to be. This exact
# PR shipped a bug of that class -- `MockAggregateTarget#build_as_static?`
# modeled the real `Pod::Target#build_as_static?` as a directly-settable
# flag, when the real method is unconditionally `true` for every aggregate
# target regardless of the Podfile's requested linkage (the real per-install
# signal is `target_definition.build_type.static?` instead, which is what
# `MockAggregateTarget`/`MockBuildType` model today -- see their comments in
# firebase_spm_test.rb) -- so the mock could never exercise the actual bug,
# and it only surfaced later, via a real `pod install`.
#
# This file guards against that recurring: it asserts, against the REAL
# `xcodeproj`/`cocoapods` gems, that every mocked class/method in
# firebase_spm_test.rb still has the shape those mocks assume. If a future
# CocoaPods/Xcodeproj release changes that shape, this file fails in seconds
# instead of the failure only surfacing ~20 minutes into a real `pod install`
# in the E2E jobs.
#
# Deliberately opt-in: skips cleanly (does not fail, does not define any
# tests) when `cocoapods`/`xcodeproj` aren't installed, so it's always safe to
# run unconditionally via `yarn tests:ios:ruby`. CI home is tests_e2e_ios.yml
# (debug + spm): after `BUNDLE_FROZEN=true bundle install` on the root Gemfile
# (pinned cocoapods/xcodeproj), so the shape suite runs for real there.
# Local / Linux runs without those gems still exit 0.

begin
  require 'xcodeproj'
  require 'cocoapods'
  RNFIREBASE_SPM_SHAPE_CHECK_GEMS_AVAILABLE = true
rescue LoadError => e
  RNFIREBASE_SPM_SHAPE_CHECK_GEMS_AVAILABLE = false
  puts "[firebase_spm_shape_test] Skipping: `xcodeproj`/`cocoapods` aren't " \
       "installed in this Ruby environment (#{e.class}: #{e.message}). This is " \
       'expected outside of the tests_e2e_ios.yml debug+spm cell -- see the ' \
       'header comment in this file.'
end

if RNFIREBASE_SPM_SHAPE_CHECK_GEMS_AVAILABLE
  require 'minitest/autorun'
  require 'tmpdir'

  class FirebaseSpmShapeTest < Minitest::Test
    # ── Pod::Installer (installer.aggregate_targets, and the
    #    run_podfile_post_install_hooks method
    #    rnfirebase_hook_cocoapods_post_install! monkey-patches -- see
    #    MockInstaller in firebase_spm_test.rb) ──

    def test_installer_responds_to_aggregate_targets
      assert Pod::Installer.method_defined?(:aggregate_targets),
             'Pod::Installer no longer exposes #aggregate_targets -- every ' \
             'rnfirebase_* post-install helper in firebase_spm.rb reads ' \
             'installer.aggregate_targets directly.'
    end

    # We can't construct a real Pod::Installer without a full `pod install`
    # context (a real Podfile, sandbox, lockfile, etc.), so this only checks
    # for the method's existence (public or private -- firebase_spm.rb's own
    # `was_private = installer_class.private_method_defined?(hook_method)`
    # guard handles either), not that aliasing/patching it actually works
    # end-to-end. That deeper integration is exactly what a real `pod
    # install` in the E2E jobs continues to cover.
    def test_installer_defines_run_podfile_post_install_hooks
      hook_defined = Pod::Installer.method_defined?(:run_podfile_post_install_hooks) ||
                     Pod::Installer.private_method_defined?(:run_podfile_post_install_hooks)
      assert hook_defined,
             'Pod::Installer#run_podfile_post_install_hooks no longer exists (public or ' \
             'private) -- this is the exact method rnfirebase_hook_cocoapods_post_install! ' \
             'aliases and wraps so our post-install logic runs automatically on every ' \
             '`pod install`.'
    end

    # ── Pod::AggregateTarget / Pod::Podfile::TargetDefinition / Pod::BuildType
    #    (the real target_definition.build_type.static? signal
    #    rnfirebase_fail_if_spm_static_linkage! depends on -- see
    #    MockAggregateTarget/MockBuildType/MockTargetDefinition in
    #    firebase_spm_test.rb, and that file's comment on the exact bug this
    #    replaced) ──

    def test_aggregate_target_responds_to_target_definition_and_user_project
      assert Pod::AggregateTarget.method_defined?(:target_definition),
             'Pod::AggregateTarget#target_definition no longer exists -- ' \
             'rnfirebase_fail_if_spm_static_linkage! reads ' \
             '`target.target_definition.build_type.static?` directly.'
      assert Pod::AggregateTarget.method_defined?(:user_project),
             'Pod::AggregateTarget#user_project no longer exists -- every other ' \
             'rnfirebase_* post-install helper walks `aggregate_target.user_project` ' \
             'to reach the consumer app\'s own Xcode project.'
    end

    def test_target_definition_responds_to_build_type
      assert Pod::Podfile::TargetDefinition.method_defined?(:build_type),
             'Pod::Podfile::TargetDefinition#build_type no longer exists -- this is ' \
             'the real object `target.target_definition` resolves to.'
    end

    def test_build_type_responds_to_static
      assert Pod::BuildType.method_defined?(:static?),
             'Pod::BuildType#static? no longer exists -- this is the exact real ' \
             'signal rnfirebase_fail_if_spm_static_linkage! branches on (replacing ' \
             'the old, always-true AggregateTarget#build_as_static? assumption).'
    end

    # Not just a shape check: unlike Pod::Installer/Pod::AggregateTarget
    # (which need a full `pod install` to construct), Pod::BuildType has
    # public, no-install-context factory methods -- so this exercises the
    # exact real values rnfirebase_fail_if_spm_static_linkage! branches on,
    # not just that the method name still exists.
    def test_build_type_static_matches_real_linkage_semantics
      refute Pod::BuildType.dynamic_framework.static?
      refute Pod::BuildType.dynamic_library.static?
      assert Pod::BuildType.static_framework.static?
      assert Pod::BuildType.static_library.static?
    end

    # ── Xcodeproj::Project::Object::XCRemoteSwiftPackageReference /
    #    XCSwiftPackageProductDependency (the two classes
    #    rnfirebase_add/remove_spm_core_to/from_app_target read and write
    #    directly -- see the Mock stand-ins defined under the real
    #    `Xcodeproj` namespace in firebase_spm_test.rb) ──

    def test_swift_package_reference_and_product_dependency_shape
      project = new_scratch_project
      pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
      ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency

      pkg = project.new(pkg_class)
      pkg.repositoryURL = 'https://github.com/firebase/firebase-ios-sdk.git'
      pkg.requirement = { kind: 'upToNextMajorVersion', minimumVersion: '12.10.0' }
      assert_equal 'https://github.com/firebase/firebase-ios-sdk.git', pkg.repositoryURL
      assert_equal({ kind: 'upToNextMajorVersion', minimumVersion: '12.10.0' }, pkg.requirement)

      ref = project.new(ref_class)
      ref.product_name = 'FirebaseCore'
      ref.package = pkg
      assert_equal 'FirebaseCore', ref.product_name
      assert_same pkg, ref.package

      # firebase_spm_test.rb's own Mock stand-ins for these two classes
      # (`package=`/`remove_from_project`) assume real Xcodeproj auto-tracks
      # referrers on a has_one assignment, and unwinds that tracking on
      # removal -- confirm that's still true against the real gem.
      assert_includes pkg.referrers, ref
      ref.remove_from_project
      refute_includes pkg.referrers, ref
    end

    # ── Xcodeproj::Project::Object::PBXProject (`root_object`) and
    #    Xcodeproj::Project itself (`native_targets`, `new`, `save`) -- see
    #    MockRootObject/MockUserProject in firebase_spm_test.rb ──

    def test_project_and_root_object_shape
      project = new_scratch_project
      assert_respond_to project, :native_targets
      assert_respond_to project, :save
      assert_respond_to project, :new
      assert_respond_to project.root_object, :package_references
      assert_empty project.root_object.package_references
    end

    # ── Xcodeproj::Project::Object::AbstractTarget / PBXNativeTarget (the
    #    real target methods rnfirebase_upsert_shell_script_phase! and
    #    rnfirebase_add/remove_spm_core_to/from_app_target call directly --
    #    see MockTarget/MockPhase in firebase_spm_test.rb) ──

    def test_native_target_shell_script_phase_shape
      project = new_scratch_project
      target = project.new(Xcodeproj::Project::Object::PBXNativeTarget)

      assert_respond_to target, :shell_script_build_phases
      assert_respond_to target, :new_shell_script_build_phase
      assert_respond_to target, :build_configurations
      assert_respond_to target, :build_settings

      phase = target.new_shell_script_build_phase('[RNFB] Shape Check')
      assert_includes target.shell_script_build_phases, phase
      %i[name shell_script shell_path always_out_of_date input_paths output_paths].each do |accessor|
        assert_respond_to phase, accessor
        assert_respond_to phase, "#{accessor}="
      end
    end

    # `package_product_dependencies` only exists on `PBXNativeTarget`, not on
    # every `AbstractTarget` subclass -- production code's
    # `target.respond_to?(:package_product_dependencies)` guard (in
    # rnfirebase_add_spm_core_to_app_target and
    # rnfirebase_remove_spm_core_from_app_target) exists specifically because
    # of this asymmetry, so it's worth asserting both sides of it.
    def test_only_native_target_has_package_product_dependencies
      assert Xcodeproj::Project::Object::PBXNativeTarget.method_defined?(:package_product_dependencies)
      refute Xcodeproj::Project::Object::PBXAggregateTarget.method_defined?(:package_product_dependencies)
      refute Xcodeproj::Project::Object::PBXLegacyTarget.method_defined?(:package_product_dependencies)
    end

    # ── Xcodeproj::Project::Object::PBXBuildFile / PBXNativeTarget#frameworks_build_phase
    #    (the exact API rnfirebase_add_spm_core_to_app_target relies on to
    #    actually *link* a package product dependency, not just declare one --
    #    see MockFrameworksBuildPhase/PBXBuildFile-under-Xcodeproj in
    #    firebase_spm_test.rb, and this bug class's own regression test there) ──

    def test_native_target_responds_to_frameworks_build_phase
      assert Xcodeproj::Project::Object::PBXNativeTarget.method_defined?(:frameworks_build_phase),
             'Xcodeproj::Project::Object::PBXNativeTarget#frameworks_build_phase no longer exists -- ' \
             'rnfirebase_add_spm_core_to_app_target relies on this to find-or-create the target\'s ' \
             'PBXFrameworksBuildPhase and actually link FirebaseCore, not just declare it as a dependency.'
    end

    def test_build_file_responds_to_product_ref
      assert Xcodeproj::Project::Object::PBXBuildFile.method_defined?(:product_ref),
             'Xcodeproj::Project::Object::PBXBuildFile#product_ref no longer exists -- ' \
             'rnfirebase_add_spm_core_to_app_target sets this (not file_ref, which is for plain file ' \
             'references) to link a Swift Package product dependency into the Frameworks build phase.'
    end

    def test_build_file_added_to_frameworks_build_phase_links_product_ref
      project = new_scratch_project
      target = project.new(Xcodeproj::Project::Object::PBXNativeTarget)
      pkg = project.new(Xcodeproj::Project::Object::XCRemoteSwiftPackageReference)
      pkg.repositoryURL = 'https://github.com/firebase/firebase-ios-sdk.git'
      ref = project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)
      ref.product_name = 'FirebaseCore'
      ref.package = pkg
      target.package_product_dependencies << ref

      build_file = project.new(Xcodeproj::Project::Object::PBXBuildFile)
      build_file.product_ref = ref
      target.frameworks_build_phase.files << build_file

      assert_includes target.frameworks_build_phase.files, build_file
      assert_same ref, target.frameworks_build_phase.files.first.product_ref
    end

    # ── Xcodeproj::Project::Object::XCBuildConfiguration (the element type of
    #    AbstractTarget#build_configurations -- MockBuildConfig's real
    #    counterpart in firebase_spm_test.rb) ──

    def test_build_configuration_responds_to_name
      assert Xcodeproj::Project::Object::XCBuildConfiguration.method_defined?(:name)
    end

    private

    # A real, in-memory `Xcodeproj::Project` -- `Xcodeproj::Project.new(path)`
    # never touches disk by itself (it only builds the default in-memory
    # object graph), so this is safe to construct in every test without ever
    # calling `#save`. `path` only needs to be a plausible location, not an
    # existing `.xcodeproj`.
    def new_scratch_project
      Xcodeproj::Project.new(File.join(Dir.mktmpdir('rnfb-spm-shape-check'), 'ShapeCheck.xcodeproj'))
    end
  end
end

# rubocop:enable Metrics, Style/Documentation
