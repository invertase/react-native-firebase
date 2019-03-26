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

class String
  def red;            "\e[31m#{self}\e[0m" end
  def green;          "\e[32m#{self}\e[0m" end
  def brown;          "\e[33m#{self}\e[0m" end
  def cyan;           "\e[36m#{self}\e[0m" end
  def gray;           "\e[37m#{self}\e[0m" end
  def bold;           "\e[1m#{self}\e[22m" end
  def underline;      "\e[4m#{self}\e[24m" end
end

def react_native_firebase!(config = {})
  react_native_firebase_path = config.fetch(:react_native_firebase_path, '../node_modules/@react-native-firebase')
  known_firebase_modules = %w(app analytics config crashlytics fiam functions firestore iid invites perf utils)

  # TODO(salakar): validate versions / set pod versions
  app_package = JSON.parse(File.read("#{react_native_firebase_path}/#{known_firebase_modules[0]}/package.json"))
  app_package_version = app_package['version']

  puts "Using React Native Firebase version '#{app_package_version}'".cyan
  puts " -> Detecting Firebase modules...".cyan

  known_firebase_modules.each {|firebase_module|
    firebase_module_name = firebase_module.slice(0, 1).capitalize + firebase_module.slice(1..-1)
    firebase_module_pod = "RNFB#{firebase_module_name}"
    firebase_module_dir = "#{react_native_firebase_path}/#{firebase_module}"
    firebase_module_build_script = "#{react_native_firebase_path}/#{firebase_module}/ios_config.sh"

    if File.directory?(firebase_module_dir) then
      pod firebase_module_pod, :path => "#{firebase_module_dir}/ios"

      if File.exist?(firebase_module_build_script) then
        puts "    ✓ #{firebase_module_name} (+ build script)".green
        script_phase :name => "RNFB #{firebase_module_name} Build Script", :script => File.read(firebase_module_build_script), :execution_position => :after_compile, :input_files => ['$(BUILT_PRODUCTS_DIR)/$(INFOPLIST_PATH)']
      else
        puts "    ✓ #{firebase_module_name}".green
      end

    else
      puts "    x #{firebase_module_name}".brown
    end
  }
end
