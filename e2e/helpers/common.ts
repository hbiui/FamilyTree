import { by, element, device, expect } from 'detox';

export const sleep = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateTestEmail = (): string => {
  const timestamp = Date.now();
  return `test_user_${timestamp}@example.com`;
};

export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const waitForElement = async (
  matcher: Detox.NativeMatcher,
  timeout: number = 15000
): Promise<void> => {
  await waitFor(element(matcher)).toBeVisible().withTimeout(timeout);
};

export const tap = async (matcher: Detox.NativeMatcher): Promise<void> => {
  await element(matcher).tap();
};

export const inputText = async (
  matcher: Detox.NativeMatcher,
  text: string
): Promise<void> => {
  await element(matcher).typeText(text);
};

export const expectToBeVisible = async (
  matcher: Detox.NativeMatcher
): Promise<void> => {
  await expect(element(matcher)).toBeVisible();
};

export const expectToExist = async (
  matcher: Detox.NativeMatcher
): Promise<void> => {
  await expect(element(matcher)).toExist();
};

export const expectToHaveText = async (
  matcher: Detox.NativeMatcher,
  text: string
): Promise<void> => {
  await expect(element(matcher)).toHaveText(text);
};

export const dismissKeyboard = async (): Promise<void> => {
  try {
    await device.pressBack();
  } catch (e) {
    // iOS doesn't support pressBack, try tapping outside
    try {
      await element(by.type('UIWindow')).tapAtPoint({ x: 0, y: 0 });
    } catch (e2) {
      // Ignore if tapping fails
    }
  }
};

export const reloadApp = async (): Promise<void> => {
  await device.reloadReactNative();
  await sleep(2000);
};

export const scrollTo = async (
  matcher: Detox.NativeMatcher,
  direction: 'up' | 'down' | 'left' | 'right' = 'down'
): Promise<void> => {
  try {
    await element(matcher).scroll(300, direction);
  } catch (e) {
    console.warn('Scroll failed:', e);
  }
};

export const swipe = async (
  x: number,
  y: number,
  toX: number,
  toY: number
): Promise<void> => {
  try {
    await device.swipe(x, y, toX, toY, 'fast');
  } catch (e) {
    console.warn('Swipe failed:', e);
  }
};

export const takeScreenshot = async (name: string): Promise<void> => {
  try {
    await device.takeScreenshot(name);
  } catch (e) {
    console.warn('Screenshot failed:', e);
  }
};
