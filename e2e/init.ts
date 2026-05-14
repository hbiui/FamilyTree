import 'detox';
import { device, expect, element, by, waitFor } from 'detox';

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      camera: 'YES',
      photos: 'YES',
      notifications: 'YES',
    },
  });
  
  await device.reloadReactNative();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});
