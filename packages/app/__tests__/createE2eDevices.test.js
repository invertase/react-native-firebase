const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

describe('e2e device setup default count', function () {
  it('create-android-avds.sh defaults count=1 and loops i < COUNT', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'scripts/e2e/create-android-avds.sh'), 'utf8');
    expect(src).toMatch(/COUNT="\$\{1:-1\}"/);
    expect(src).toMatch(/for \(\(i = 0; i < COUNT; i\+\+\)\)/);
    expect(src).not.toMatch(/seq 0 "\$COUNT"/);
  });

  it('create-ios-simulators.sh defaults count=1 and loops i < COUNT', function () {
    const src = fs.readFileSync(
      path.join(repoRoot, 'scripts/e2e/create-ios-simulators.sh'),
      'utf8',
    );
    expect(src).toMatch(/COUNT="\$\{1:-1\}"/);
    expect(src).toMatch(/for \(\(i = 0; i < COUNT; i\+\+\)\)/);
  });
});
