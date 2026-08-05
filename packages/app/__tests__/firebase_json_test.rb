# frozen_string_literal: true

# rubocop:disable Metrics, Style/Documentation, Style/GlobalVars
require 'minitest/autorun'
require 'json'

# Stand-ins so `firebase_json.rb` can print/warn without cocoapods-core.
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

# Coverage attributes hits to the path passed to `load`. Temp copies under
# /var/... do not count toward `packages/app/firebase_json.rb`, so require-time
# branches that depend on `__dir__` / parse outcomes are exercised by stubbing
# File/JSON around a load of the real production file.
class FirebaseJsonTest < Minitest::Test
  PRODUCTION_JSON = File.expand_path('../firebase_json.rb', __dir__)

  def setup
    Pod::UI.warnings = []
    Pod::UI.messages = []
    $firebase_json_path = nil
    $firebase_json_config = nil
  end

  def load_production_firebase_json!
    verbose = $VERBOSE
    $VERBOSE = nil # silence FirebaseJSON::PATH redefinition across loads
    load PRODUCTION_JSON
  ensure
    $VERBOSE = verbose
  end

  def with_stubbed_singleton(klass, method_name, stub_proc)
    original = klass.method(method_name)
    klass.define_singleton_method(method_name, stub_proc)
    yield
  ensure
    klass.define_singleton_method(method_name, original)
  end

  # ── Happy path: packages/app load finds tests/firebase.json ──

  def test_load_from_packages_app_finds_tests_firebase_json
    load_production_firebase_json!

    assert $firebase_json_path
    assert_includes $firebase_json_path, File.join('tests', 'firebase.json')
    assert_kind_of Hash, $firebase_json_config
    assert(Pod::UI.messages.any? { |m| m.include?('Using firebase.json from') })
  end

  def test_config_get_value_or_default_returns_present_key
    load_production_firebase_json!

    assert_equal 'debug', FirebaseJSON::Config.get_value_or_default('app_log_level', 'info')
  end

  def test_config_get_value_or_default_returns_default_for_missing_key
    load_production_firebase_json!

    assert_equal 'fallback', FirebaseJSON::Config.get_value_or_default('definitely_missing_key_xyz', 'fallback')
  end

  def test_config_get_value_or_default_returns_default_when_config_nil
    load_production_firebase_json!
    $firebase_json_config = nil

    assert_equal 'fallback', FirebaseJSON::Config.get_value_or_default('app_log_level', 'fallback')
  end

  def test_path_constant_is_nil
    load_production_firebase_json!

    assert_nil FirebaseJSON::PATH
  end

  # ── Parse failure (rescue + Pod::UI.warn) on the production file path ──

  def test_parse_failure_warns_and_leaves_config_nil
    with_stubbed_singleton(JSON, :parse, ->(*) { raise JSON::ParserError, 'unexpected token' }) do
      load_production_firebase_json!
    end

    assert $firebase_json_path
    assert_includes $firebase_json_path, File.join('tests', 'firebase.json')
    assert_nil $firebase_json_config
    assert_equal 2, Pod::UI.warnings.length
    assert_includes Pod::UI.warnings[0], 'An error occurred parsing the firebase.json'
    assert_includes Pod::UI.warnings[1].to_s, 'unexpected token'
  end

  # ── Non-test-project search branch (`firebase.json`, not `tests/firebase.json`) ──
  #
  # Production `__dir__` always contains `/packages/app`. Spoof the expand_path
  # probe that sets `is_test_project` so the else branch at line 42 runs while
  # SimpleCov still attributes hits to packages/app/firebase_json.rb.

  def test_non_test_project_search_branch_uses_firebase_json_basename
    expand = File.method(:expand_path)
    seen_consumer_json_paths = []

    with_stubbed_singleton(File, :expand_path, lambda { |*args|
      result = expand.call(*args)
      # Spoof only directory probes used for is_test_project / walk base — not
      # the firebase.json path strings themselves (those must keep real names
      # so we can observe the basename choice).
      if result.end_with?('/packages/app') && !File.basename(result).end_with?('.json')
        next result.sub('/packages/app', '/node_modules/@react-native-firebase/app')
      end

      seen_consumer_json_paths << result if result.end_with?('/firebase.json') && !result.include?('/tests/')
      result
    }) do
      with_stubbed_singleton(File, :exist?, ->(*) { false }) do
        load_production_firebase_json!
      end
    end

    assert_nil $firebase_json_path
    refute_empty seen_consumer_json_paths
    assert(seen_consumer_json_paths.all? { |p| File.basename(p) == 'firebase.json' && !p.include?('/tests/') })
  end
end

# rubocop:enable Metrics, Style/Documentation, Style/GlobalVars
