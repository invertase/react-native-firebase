const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MINIMAL_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
</dict>
</plist>
`;

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

  it('maps messaging_installation_id_enabled to FirebaseMessagingInstallationIdEnabled', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-config-fid-'));
    const projectDir = path.join(root, 'project', 'ios');
    const infoPlistRel = 'Info.plist';
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(root, infoPlistRel), MINIMAL_PLIST);
    fs.writeFileSync(
      path.join(root, 'project', 'firebase.json'),
      JSON.stringify({
        'react-native': {
          messaging_installation_id_enabled: true,
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
          INFOPLIST_PATH: infoPlistRel,
          PROJECT_DIR: projectDir,
        },
      });

      const plist = fs.readFileSync(path.join(root, infoPlistRel), 'utf8');
      expect(plist).toContain('FirebaseMessagingInstallationIdEnabled');
      expect(plist).toMatch(/<key>FirebaseMessagingInstallationIdEnabled<\/key>\s*<true\/>/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not inject FirebaseMessagingInstallationIdEnabled when key is omitted', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-config-fid-omit-'));
    const projectDir = path.join(root, 'project', 'ios');
    const infoPlistRel = 'Info.plist';
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(root, infoPlistRel), MINIMAL_PLIST);
    fs.writeFileSync(
      path.join(root, 'project', 'firebase.json'),
      JSON.stringify({
        'react-native': {
          messaging_auto_init_enabled: false,
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
          INFOPLIST_PATH: infoPlistRel,
          PROJECT_DIR: projectDir,
        },
      });

      const plist = fs.readFileSync(path.join(root, infoPlistRel), 'utf8');
      expect(plist).not.toContain('FirebaseMessagingInstallationIdEnabled');
      expect(plist).toContain('FirebaseMessagingAutoInitEnabled');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('maps messaging_installation_id_enabled false to FirebaseMessagingInstallationIdEnabled NO', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-ios-config-fid-false-'));
    const projectDir = path.join(root, 'project', 'ios');
    const infoPlistRel = 'Info.plist';
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(root, infoPlistRel), MINIMAL_PLIST);
    fs.writeFileSync(
      path.join(root, 'project', 'firebase.json'),
      JSON.stringify({
        'react-native': {
          messaging_installation_id_enabled: false,
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
          INFOPLIST_PATH: infoPlistRel,
          PROJECT_DIR: projectDir,
        },
      });

      const plist = fs.readFileSync(path.join(root, infoPlistRel), 'utf8');
      expect(plist).toMatch(/<key>FirebaseMessagingInstallationIdEnabled<\/key>\s*<false\/>/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
