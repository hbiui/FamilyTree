import '@testing-library/react-native/extend-expect';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || clearTimeout;