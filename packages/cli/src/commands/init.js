// check if signed in?
// - yes: continue
// - no: auth with browser

// check android config file exists
// check ios config file exists
// - prompt to continue for each platform (save for later)

// select a firebase project
// - if no projects: redirect to console (and show message)
// - if projects: list out and select (include "New Firebase Project")

// get apps for project (ios + android)

// attempt to auto-match app for each platform (bundle/app id)
// ask whether app is correct
// - if yes: select and continue
// - if no:
//   - Select from list / create (via CI or console for now)

// fetch config from api for app

// [android]: grab apps debugSha
// - post to API to create

// write config file to android/app/... ios/whatever
// [ios] also link?

// do installation steps if required (regex check of files)
// write to files if needed

// print out final steps (run-android/ios)

module.exports = async function initCommand(args, reactNativeConfig) {
  const { join } = require('path');
  const firebase = require('../helpers/firebase');
  const file = require('../helpers/file');
  const prompt = require('../helpers/prompt');

  // fetch users account
  let account = await firebase.auth.getAccount();

  // request sign-in if account doesnt exist
  if (!account) {
    // todo log no account exists?
    await firebase.auth.authWithBrowser();
    account = firebase.auth.getAccount();
  }

  // Extract Android Project Config
  const androidProjectConfig = reactNativeConfig.platforms.android.projectConfig(
    reactNativeConfig.root,
  );

  // Android google-services.json file path
  const androidFirebaseConfigFilePath = join(
    androidProjectConfig.sourceDir,
    'google-services.json',
  );

  // Check Android file exists
  const androidFirebaseConfigFile = await file.exists(androidFirebaseConfigFilePath);

  const apps = {
    android: false,
    ios: true,
  };

  // Question whether to continue for android
  if (androidFirebaseConfigFile) {
    const result = await prompt.confirm(
      'An Android "google-services.json" file already exists, do you want to replace this file?',
    );

    if (result) {
      apps.android = true;
    }
  } else {
    apps.android = true;
  }

  // If no platforms selected, quit
  if (!Object.values(apps).includes(true)) {
    // todo log message
    console.log('Bai');
    process.exit();
  }

  // ask user to choose a project
  const firebaseProject = await prompt.selectFirebaseProject();

  // if no project exists - ask them to create one
  if (!firebaseProject) {
    console.log('no firebase projects exist! redirecting you to console...');
    process.exit();
  }

  // Fetch Firebase project details
  const projectDetail = await firebase
    .api(account)
    .management.getProject(firebaseProject.projectId, apps);

  // Only proceed with Android if they allowed it
  if (apps.android) {
    console.dir(projectDetail.apps.android);
    console.dir(androidProjectConfig);

    // Auto-find an app matched by the package name
    let selectedAndroidApp = projectDetail.apps.android.find(
      app => app.packageName === androidProjectConfig.packageName,
    );

    if (!selectedAndroidApp) {
      console.log('todo create app via console');
      process.exit();
    }

    const androidAppConfigShaList = await firebase
      .api(account)
      .management.getAndroidAppConfigShaList(selectedAndroidApp.name);

    // todo prompt asking to add sha-1
    // if they add, check it doesnt already exist

    console.log('sha list', androidAppConfigShaList);

    const androidConfigFile = await firebase
      .api(account)
      .management.getAppConfig(selectedAndroidApp.name);

    console.log('writing new config file...');
    await file.write(androidFirebaseConfigFilePath, androidConfigFile);

    console.log(androidProjectConfig);
    const androidBuildGradleFilePath = join(androidProjectConfig.sourceDir, '..', 'build.gradle');
    const androidAppBuildGradleFile = await file.exists(androidBuildGradleFilePath);

    if (!androidAppBuildGradleFile) {
      console.log('unable to find android build gradle file', androidFirebaseConfigFilePath);
    } else {
      const androidBuildGradleFileContents = await file.read(androidBuildGradleFilePath);

      // https://regex101.com/r/mty6Z3/1
      const findRegex = /^[\s]*classpath[\s]+["']{1}com\.google\.gms:google-services:.+["']{1}[\s]*$/gm;
      const match = androidBuildGradleFileContents.match(findRegex);

      if (match) {
        console.log('classpath  google services already set');
      } else {
        // https://regex101.com/r/jcFQuc/1
        const addRegex = /buildscript[\w\W]*dependencies[\s]*{/g;
        const updatedGradleFile = androidBuildGradleFileContents.replace(addRegex, str => {
          return str + '\n' + "    classpath 'com.google.gms:google-services:4.2.0'";
        });
        await file.write(androidBuildGradleFilePath, updatedGradleFile);

        console.log('classpath  google services has been added');
      }

      const androidAppBuildGradleFileContents = await file.read(
        androidProjectConfig.buildGradlePath,
      );

      // TODO this needs to be a regex
      if (
        !androidAppBuildGradleFileContents.includes(
          "apply plugin: 'com.google.gms.google-services'",
        )
      ) {
        console.log('Adding apply plugin...');
        await file.write(
          androidProjectConfig.buildGradlePath,
          androidAppBuildGradleFileContents + "\napply plugin: 'com.google.gms.google-services'",
        );
      }

      console.dir(androidAppBuildGradleFileContents);
    }
  }
};
