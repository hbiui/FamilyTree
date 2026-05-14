import { describe, test, expect, beforeAll, afterEach } from '@jest/globals';
import { 
  waitForElement, 
  tap, 
  inputText, 
  expectToBeVisible, 
  expectToExist,
  expectToHaveText,
  dismissKeyboard,
  sleep,
  reloadApp,
  scrollTo,
} from './helpers/common';
import { by, element } from 'detox';

describe('导出与邀请流程', () => {
  beforeAll(async () => {
    console.log('🚀 Starting export and invitation tests...');
  });

  afterEach(async () => {
    await sleep(1000);
  });

  describe('GEDCOM 导出场景', () => {
    test('S4.1: 验证导出入口', async () => {
      console.log('📤 Testing export entry point...');
      
      await waitForElement(by.text('导出'));
      await expectToExist(by.text('导出'));
      
      console.log('✅ Export entry verified');
    });

    test('S4.2: 进入导出页面', async () => {
      console.log('📥 Testing enter export page...');
      
      await tap(by.text('导出'));
      await sleep(2000);
      
      await expectToExist(by.text('导出格式'));
      await expectToExist(by.text('GEDCOM'));
      await expectToExist(by.text('JSON'));
      await expectToExist(by.text('PDF'));
      
      console.log('✅ Export page elements verified');
    });

    test('S4.3: 选择 GEDCOM 格式', async () => {
      console.log('📄 Testing select GEDCOM format...');
      
      await waitForElement(by.text('GEDCOM'));
      await tap(by.text('GEDCOM'));
      await sleep(1000);
      
      await expectToExist(by.text('GEDCOM 格式已选中'));
      
      console.log('✅ GEDCOM format selected');
    });

    test('S4.4: 验证隐私过滤选项', async () => {
      console.log('🔒 Testing privacy filter option...');
      
      await expectToExist(by.text('过滤隐私数据'));
      
      const privacySwitch = by.type('Switch');
      await expectToExist(privacySwitch);
      
      console.log('✅ Privacy filter option verified');
    });

    test('S4.5: 启用隐私过滤', async () => {
      console.log('🔒 Testing enable privacy filter...');
      
      const privacySwitch = by.type('Switch');
      await tap(privacySwitch);
      await sleep(500);
      
      await expectToExist(by.text('隐私过滤已启用'));
      
      console.log('✅ Privacy filter enabled');
    });

    test('S4.6: 验证加密选项', async () => {
      console.log('🔐 Testing encryption option...');
      
      await expectToExist(by.text('密码保护'));
      
      const encryptionSwitch = by.type('Switch');
      await expectToExist(encryptionSwitch);
      
      console.log('✅ Encryption option verified');
    });

    test('S4.7: 启用密码保护', async () => {
      console.log('🔐 Testing enable password protection...');
      
      const encryptionSwitch = by.type('Switch');
      await tap(encryptionSwitch);
      await sleep(1000);
      
      await expectToExist(by.text('请输入密码'));
      await expectToExist(by.text('确认密码'));
      
      console.log('✅ Password protection enabled');
    });

    test('S4.8: 输入密码并确认', async () => {
      console.log('🔑 Testing input password...');
      
      const testPassword = 'Test123456';
      await inputText(
        by.type('TextInput').withPlaceholder('请输入密码'),
        testPassword
      );
      await inputText(
        by.type('TextInput').withPlaceholder('请再次输入密码'),
        testPassword
      );
      
      await dismissKeyboard();
      
      console.log('✅ Password entered');
    });

    test('S4.9: 执行导出', async () => {
      console.log('📤 Testing execute export...');
      
      await waitForElement(by.text('开始导出'));
      await tap(by.text('开始导出'));
      await sleep(5000);
      
      await expectToExist(by.text('导出成功'));
      await expectToExist(by.text('分享'));
      await expectToExist(by.text('保存到本地'));
      
      console.log('✅ Export executed successfully');
    });

    test('S4.10: 分享导出文件', async () => {
      console.log('📱 Testing share exported file...');
      
      await waitForElement(by.text('分享'));
      await tap(by.text('分享'));
      await sleep(2000);
      
      await expectToExist(by.text('分享到'));
      await expectToExist(by.text('微信'));
      await expectToExist(by.text('朋友圈'));
      await expectToExist(by.text('更多'));
      
      console.log('✅ Share options displayed');
    });

    test('S4.11: 选择微信分享', async () => {
      console.log('💬 Testing share to WeChat...');
      
      await tap(by.text('微信'));
      await sleep(3000);
      
      console.log('✅ WeChat share initiated');
    });
  });

  describe('邀请协作者场景', () => {
    test('S4.12: 验证邀请入口', async () => {
      console.log('👥 Testing invitation entry...');
      
      await waitForElement(by.text('邀请协作者'));
      await expectToExist(by.text('邀请协作者'));
      
      console.log('✅ Invitation entry verified');
    });

    test('S4.13: 进入邀请页面', async () => {
      console.log('📬 Testing enter invitation page...');
      
      await tap(by.text('邀请协作者'));
      await sleep(2000);
      
      await expectToExist(by.text('邀请方式'));
      await expectToExist(by.text('链接邀请'));
      await expectToExist(by.text('二维码邀请'));
      
      console.log('✅ Invitation page elements verified');
    });

    test('S4.14: 复制邀请链接', async () => {
      console.log('🔗 Testing copy invitation link...');
      
      await waitForElement(by.text('复制链接'));
      await tap(by.text('复制链接'));
      await sleep(1000);
      
      await expectToExist(by.text('链接已复制'));
      await expectToExist(by.text('邀请链接已复制到剪贴板'));
      
      console.log('✅ Invitation link copied');
    });

    test('S4.15: 分享邀请链接', async () => {
      console.log('📱 Testing share invitation link...');
      
      await waitForElement(by.text('分享链接'));
      await tap(by.text('分享链接'));
      await sleep(2000);
      
      await expectToExist(by.text('分享到'));
      await expectToExist(by.text('微信'));
      await expectToExist(by.text('朋友圈'));
      
      console.log('✅ Share invitation link options displayed');
    });

    test('S4.16: 选择二维码邀请', async () => {
      console.log('📷 Testing QR code invitation...');
      
      await tap(by.text('二维码邀请'));
      await sleep(1000);
      
      await expectToExist(by.text('邀请二维码'));
      await expectToExist(by.text('保存二维码'));
      
      console.log('✅ QR code invitation displayed');
    });

    test('S4.17: 保存二维码', async () => {
      console.log('💾 Testing save QR code...');
      
      await waitForElement(by.text('保存二维码'));
      await tap(by.text('保存二维码'));
      await sleep(2000);
      
      await expectToExist(by.text('二维码已保存'));
      
      console.log('✅ QR code saved');
    });

    test('S4.18: 分享二维码', async () => {
      console.log('📱 Testing share QR code...');
      
      await waitForElement(by.text('分享二维码'));
      await tap(by.text('分享二维码'));
      await sleep(2000);
      
      await expectToExist(by.text('分享到'));
      
      console.log('✅ QR code share options displayed');
    });
  });

  describe('权限管理场景', () => {
    test('S4.19: 查看协作者列表', async () => {
      console.log('👥 Testing view collaborators list...');
      
      await waitForElement(by.text('协作者'));
      await tap(by.text('协作者'));
      await sleep(2000);
      
      await expectToExist(by.text('协作者列表'));
      await expectToExist(by.text('管理员'));
      await expectToExist(by.text('编辑者'));
      await expectToExist(by.text('查看者'));
      
      console.log('✅ Collaborators list displayed');
    });

    test('S4.20: 修改协作者权限', async () => {
      console.log('⚙️ Testing modify collaborator permissions...');
      
      await waitForElement(by.text('管理员'));
      const adminItem = by.text('管理员');
      await tap(adminItem);
      await sleep(1000);
      
      await expectToExist(by.text('修改权限'));
      await expectToExist(by.text('移除'));
      
      await tap(by.text('修改权限'));
      await sleep(1000);
      
      await expectToExist(by.text('选择权限'));
      await expectToExist(by.text('编辑者'));
      
      await tap(by.text('编辑者'));
      await sleep(1000);
      
      await expectToExist(by.text('权限已修改'));
      
      console.log('✅ Permission modification works');
    });

    test('S4.21: 移除协作者', async () => {
      console.log('🗑️ Testing remove collaborator...');
      
      await waitForElement(by.text('管理员'));
      const adminItem = by.text('管理员');
      await tap(adminItem);
      await sleep(1000);
      
      await tap(by.text('移除'));
      await sleep(1000);
      
      await expectToExist(by.text('确认移除'));
      await expectToExist(by.text('确定要移除此协作者吗？'));
      
      await tap(by.text('确定'));
      await sleep(1000);
      
      await expectToExist(by.text('协作者已移除'));
      
      console.log('✅ Remove collaborator works');
    });
  });
});
