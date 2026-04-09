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

class FirebaseSpmTest < Minitest::Test
  def setup
    # Reset global state before each test
    $firebase_spm_url = nil
    # Remove spm_dependency if defined from a previous test
    if defined?(spm_dependency)
      Object.send(:remove_method, :spm_dependency)
    end
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

  # ── URL from package.json ──

  def test_reads_spm_url_from_package_json
    load_firebase_spm

    assert_equal 'https://github.com/firebase/firebase-ios-sdk.git', $firebase_spm_url
  end
end
