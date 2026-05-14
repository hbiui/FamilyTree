import { device } from 'detox';

module.exports = async () => {
  console.log('🧹 Starting Detox global teardown...');
  
  try {
    if (device) {
      await device.terminateApp();
      console.log('✅ App terminated successfully');
    }
  } catch (error) {
    console.error('⚠️ Error during teardown:', error);
  }
  
  console.log('✅ Global teardown completed');
};
