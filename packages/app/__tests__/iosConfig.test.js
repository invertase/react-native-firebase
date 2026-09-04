const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('ios_config.sh', () => {
  it('parses firebase.json without evaluating its contents as Ruby', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-config-'));
    const projectDir = path.join(root, 'project', 'ios');
    const sentinel = path.join(root, 'injection-executed');
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(
      path.join(root, 'project', 'firebase.json'),
      JSON.stringify({
        'react-native': {
          app_data_collection_default_enabled:
            "') rescue (File.write(ENV.fetch(%q{RNFB_INJECTION_SENTINEL}), %q{executed})); #",
        },
      }),
    );

    try {
      execFileSync('bash', [path.join(__dirname, '..', 'ios_config.sh')], {
        env: {
          ...process.env,
          BUILT_PRODUCTS_DIR: root,
          DWARF_DSYM_FILE_NAME: 'missing.dSYM',
          DWARF_DSYM_FOLDER_PATH: root,
          INFOPLIST_PATH: 'missing.plist',
          PROJECT_DIR: projectDir,
          RNFB_INJECTION_SENTINEL: sentinel,
        },
      });

      expect(fs.existsSync(sentinel)).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
