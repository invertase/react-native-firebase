const fs = require('fs');
const path = require('path');

const appBuildGradlePath = path.join('android', 'app', 'build.gradle');

const defaultCompileStatement = "compile project(':react-native-firebase')";
const requiredCompileStatement = "compile(project(':react-native-firebase')) {\n        transitive = false\n    }";

// android/build.gradle
// 1) TODO: Add Google Play maven repository

// 2) TODO: Add google-services dependency if required

// android/app/build.gradle
// 0) Load the file
let buildGradleContents = fs.readFileSync(appBuildGradlePath, 'utf8');

// 1) Check that react-native-firebase compile statement is the correct format
buildGradleContents = buildGradleContents.replace(defaultCompileStatement, requiredCompileStatement);

// 2) TODO: Add firebase-core and play-services-base dependencies

// 3) TODO: Add google-services plugin

// 4) Write file
fs.writeFileSync(appBuildGradlePath, buildGradleContents);
