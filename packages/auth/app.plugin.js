const plist = require('plist');
const fs = require('fs');
const { withInfoPlist } = require('@expo/config-plugins')
const path = require('path')

const withIosPhoneAuth = (config, id) => {
    return withInfoPlist(config, config => {
        if (!config.ios?.googleServicesFile) throw new Error('Path to GoogleService-Info.plist is not defined. Please specify the `expo.ios.googleServicesFile` field in app.json.');
        const googleServicesFile = path.resolve(config.modRequest.projectRoot, config.ios?.googleServicesFile)
        const obj = plist.parse(fs.readFileSync(googleServicesFile, 'utf8'))
        config.modResults.CFBundleURLTypes.push({
            CFBundleURLSchemes: [`app-${obj.GOOGLE_APP_ID.replace(/:/g, "-")}`],
        })
        return config
    })
}

module.exports = withIosPhoneAuth;

