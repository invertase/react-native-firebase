# frozen_string_literal: true

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

$firebase_json_path = nil
$firebase_json_config = nil

unless $firebase_json_path
  react_native_firebase_path = __dir__
  current_search_directory = File.join(react_native_firebase_path)

  is_test_project = false

  if File.expand_path(current_search_directory).include? '/packages/app'
    is_test_project = true
  end

  i = 0
  while i < 5
    current_search_directory = File.join(current_search_directory, '..')

    if is_test_project
      firebase_json = File.expand_path(File.join(current_search_directory, 'tests', 'firebase.json'))
    else
      firebase_json = File.expand_path(File.join(current_search_directory, 'firebase.json'))
    end

    if File.exist?(firebase_json)
      $firebase_json_path = firebase_json
      begin
        $firebase_json_config = JSON.parse(File.read(firebase_json))['react-native']
        Pod::UI.puts "Using firebase.json from '#{firebase_json}'"
        # Pod::UI.puts $firebase_json_config
      rescue => error
        Pod::UI.warn "An error occurred parsing the firebase.json located at '#{firebase_json}':"
        Pod::UI.warn error
      end
      break
    end
    i += 1
  end
end

module FirebaseJSON
  class Config
    def self.get_value_or_default(key, default)
      if $firebase_json_config.nil? || !$firebase_json_config.key?(key)
        default
      else
        $firebase_json_config[key]
      end
    end
  end
  PATH = nil
end
