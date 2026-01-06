# Helper file for RNFBFunctions Swift file integration
# Add this to your Podfile: require_relative 'node_modules/@react-native-firebase/functions/ios/Podfile.helper.rb'
# Or if using a monorepo: require_relative '../packages/functions/ios/Podfile.helper.rb'

def add_rnfb_functions_swift_files(installer)
  installer.pods_project.targets.each do |target|
    if target.name == 'RNFBFunctions'
      # Find Swift files in the pod directory
      pod_path = File.join(installer.sandbox.root, 'RNFBFunctions')
      next unless File.exist?(pod_path)
      
      swift_files = Dir.glob(File.join(pod_path, 'ios', '**', '*.swift'))
      
      swift_files.each do |swift_file|
        # Get relative path from pod root (e.g., "ios/RNFBFunctions/RNFBFunctionsStreamHandler.swift")
        relative_path = Pathname.new(swift_file).relative_path_from(Pathname.new(pod_path)).to_s
        
        # Find or create the file reference in the project
        group_path = File.dirname(relative_path)
        file_name = File.basename(relative_path)
        
        # Navigate to the group (create if needed)
        group = target.project.main_group
        group_path.split('/').each do |segment|
          next if segment == '.' || segment.empty?
          group = group[segment] || group.new_group(segment)
        end
        
        # Find or create file reference
        file_ref = group.files.find { |f| f.path == file_name }
        unless file_ref
          file_ref = group.new_file(file_name)
        end
        
        # Add to target's source build phase if not already added
        unless target.source_build_phase.files.find { |f| f.file_ref == file_ref }
          target.add_file_references([file_ref])
        end
      end
      
      # Ensure Swift compilation settings
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_COMPILATION_MODE'] = 'wholemodule'
      end
    end
  end
end

