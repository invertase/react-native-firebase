module.exports = {
  // Placeholder used to rename and replace in files
  // package.json, index.json, android/, ios/
  placeholderName: 'HelloWorld',

  // Directory with template
  templateDir: './project',

  // TODO broken on cli: error Error: spawn /var/folders/**/node_modules/@react-native-firebase/template/post-init.js EACCES
  // Path to script, which will be executed after init
  // postInitScript: './post-init.js',
};
