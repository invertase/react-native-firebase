#
# Copyright (c) 2016-present Invertase Limited & Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this library except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

require 'json'
require 'pathname'
require_relative './firebase_json'

def react_native_firebase!(config = {})
  Pod::UI.puts ""
  Pod::UI.puts ""
  Pod::UI.puts "--------------------------------- RNFB -----------------------------------"
  Pod::UI.puts " The 'react_native_firebase!' pod script is no longer required with the"
  Pod::UI.puts " latest version of React Native CLI + Auto-Linking, please remove it from"
  Pod::UI.puts " your Podfile by removing the following lines:"
  Pod::UI.puts " "
  Pod::UI.puts " - require_relative '../node_modules/@react-native-firebase/app/pod_config'"
  Pod::UI.puts " - react_native_firebase!"
  Pod::UI.puts " "
  Pod::UI.puts " ... and replace them with the React Native Auto-Linking scripts if not"
  Pod::UI.puts " already included in your Podfile."
  Pod::UI.puts "--------------------------------------------------------------------------"
  Pod::UI.puts ""
  Pod::UI.puts ""
#   react_native_firebase_path = config.fetch(:react_native_firebase_path, '../node_modules/@react-native-firebase')
#   discovered_firebase_modules = Pathname.new(react_native_firebase_path).children.select(&:directory?).sort
#
#   app_package = JSON.parse(File.read(File.join(react_native_firebase_path, 'app', 'package.json')))
#   app_version = app_package['version']
#
#   Pod::UI.puts "Using React Native Firebase version '#{app_version}'"
#   Pod::UI.puts ' -> Detecting Firebase modules...'
#
#   discovered_firebase_modules.each do |module_dir|
#     module_name = File.basename(module_dir)
#     module_podspec_name = "RNFB_#{module_name.gsub('-', '_')}".camelize.gsub('RNFBMl', 'RNFBML')
#     next if %w[private-tests-helpers app-types template common].include? module_name
#
#     module_podspec_path = File.join(module_dir, "ios", "#{module_podspec_name}.podspec")
#     next unless File.exist?(module_podspec_path)
#
#     module_spec = Pod::Specification.from_file(module_podspec_path)
#     next if current_target_definition.dependencies.find do |existing_dep|
#       existing_dep.name.split('/').first == module_spec.name
#     end
#
#     pod module_podspec_name, :path => File.join(module_dir, "ios")
#
#     module_build_script = File.join(module_dir, 'ios_config.sh')
#     module_package_json = JSON.parse(File.read(File.join(module_dir, 'package.json')))
#     module_version = module_package_json['version']
#
#     if module_version != app_version
#       Pod::UI.warn "Firebase #{module_name} has a different version than the Core/App Firebase module:"
#       Pod::UI.warn "  -> Found #{module_version} but expected #{app_version}"
#       Pod::UI.warn '  -> Mixing versions is not recommended and may cause some incompatibility issues'
#     end
#
#     if File.exist?(module_build_script)
#       Pod::UI.puts "    ✓ Discovered '#{module_name}' (+ build script)"
#       script_phase :name => "RNFB #{module_name} Build Script", :script => File.read(module_build_script), :execution_position => :after_compile, :input_files => ['$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)']
#     else
#       Pod::UI.puts "    ✓ Discovered '#{module_name}' #{module_podspec_name}"
#     end
#   end
end
