import { firebase } from '../lib';

describe('_template_()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app._template_).toBeDefined();
      expect(app._template_().app).toEqual(app);
    });

    // disabled as pending if module.options.hasMultiAppSupport = true
    xit('supports multiple apps', async function () {
      expect(firebase._template_().app.name).toEqual('[DEFAULT]');
      expect(firebase._template_(firebase.app('secondaryFromNative')).app.name).toEqual(
        'secondaryFromNative',
      );
      expect(firebase.app('secondaryFromNative')._template_().app.name).toEqual(
        'secondaryFromNative',
      );
    });
  });
});
