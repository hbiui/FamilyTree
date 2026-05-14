import { device, detox } from 'detox';
import { platform } from 'os';

module.exports = async () => {
  console.log('🔧 Starting Detox global setup...');
  
  if (device) {
    console.log(`📱 Target device: ${device.name}`);
    console.log(`💻 Platform: ${platform()}`);
  }
  
  console.log('✅ Global setup completed');
};
