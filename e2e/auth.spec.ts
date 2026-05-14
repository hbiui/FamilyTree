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
} from './helpers/common';
import { by, element } from 'detox';

describe('注册/登录流程', () => {
  const TEST_EMAIL = `test${Date.now()}@example.com`;
  const TEST_PASSWORD = 'Test123456';
  const TEST_NAME = '测试用户';

  beforeAll(async () => {
    console.log('🚀 Starting auth flow tests...');
  });

  afterEach(async () => {
    await reloadApp();
  });

  describe('登录场景', () => {
    test('S1.1: 验证登录页面元素', async () => {
      console.log('📋 Testing login page elements...');
      
      await waitForElement(by.text('登录'));
      await expectToExist(by.text('登录'));
      await expectToExist(by.text('邮箱'));
      await expectToExist(by.text('密码'));
      await expectToExist(by.text('登录'));
      await expectToExist(by.text('还没有账号？注册'));
      
      console.log('✅ Login page elements verified');
    });

    test('S1.2: 使用有效凭据登录', async () => {
      console.log('🔐 Testing login with valid credentials...');
      
      await inputText(by.type('TextInput').withPlaceholder('请输入邮箱'), TEST_EMAIL);
      await inputText(by.type('TextInput').withPlaceholder('请输入密码'), TEST_PASSWORD);
      await dismissKeyboard();
      
      await tap(by.text('登录'));
      await sleep(3000);
      
      console.log('✅ Login attempt completed');
    });

    test('S1.3: 空凭据登录失败', async () => {
      console.log('❌ Testing login with empty credentials...');
      
      await tap(by.text('登录'));
      await sleep(1000);
      
      await expectToExist(by.text('请输入邮箱'));
      await expectToExist(by.text('请输入密码'));
      
      console.log('✅ Empty credentials validation works');
    });

    test('S1.4: 无效邮箱格式', async () => {
      console.log('❌ Testing invalid email format...');
      
      await inputText(by.type('TextInput').withPlaceholder('请输入邮箱'), 'invalidemail');
      await inputText(by.type('TextInput').withPlaceholder('请输入密码'), TEST_PASSWORD);
      await dismissKeyboard();
      
      await tap(by.text('登录'));
      await sleep(1000);
      
      await expectToExist(by.text('请输入有效的邮箱地址'));
      
      console.log('✅ Email validation works');
    });

    test('S1.5: 导航到注册页面', async () => {
      console.log('🔗 Testing navigation to register page...');
      
      await tap(by.text('还没有账号？注册'));
      await sleep(1000);
      
      await expectToExist(by.text('注册'));
      await expectToExist(by.text('创建账号'));
      
      console.log('✅ Navigation to register page works');
    });
  });

  describe('注册场景', () => {
    test('S1.6: 验证注册页面元素', async () => {
      console.log('📋 Testing register page elements...');
      
      await tap(by.text('还没有账号？注册'));
      await sleep(1000);
      
      await expectToExist(by.text('昵称'));
      await expectToExist(by.text('邮箱'));
      await expectToExist(by.text('密码'));
      await expectToExist(by.text('确认密码'));
      await expectToExist(by.text('注册'));
      
      console.log('✅ Register page elements verified');
    });

    test('S1.7: 使用有效信息注册', async () => {
      console.log('📝 Testing registration with valid info...');
      
      await inputText(by.type('TextInput').withPlaceholder('请输入昵称'), TEST_NAME);
      await inputText(by.type('TextInput').withPlaceholder('请输入邮箱'), TEST_EMAIL);
      await inputText(by.type('TextInput').withPlaceholder('请输入密码'), TEST_PASSWORD);
      await inputText(by.type('TextInput').withPlaceholder('请再次输入密码'), TEST_PASSWORD);
      await dismissKeyboard();
      
      await tap(by.text('注册'));
      await sleep(3000);
      
      console.log('✅ Registration attempt completed');
    });

    test('S1.8: 密码不匹配验证', async () => {
      console.log('❌ Testing password mismatch validation...');
      
      await inputText(by.type('TextInput').withPlaceholder('请输入昵称'), TEST_NAME);
      await inputText(by.type('TextInput').withPlaceholder('请输入邮箱'), `test${Date.now()}@example.com`);
      await inputText(by.type('TextInput').withPlaceholder('请输入密码'), TEST_PASSWORD);
      await inputText(by.type('TextInput').withPlaceholder('请再次输入密码'), 'differentpassword');
      await dismissKeyboard();
      
      await tap(by.text('注册'));
      await sleep(1000);
      
      await expectToExist(by.text('两次输入的密码不一致'));
      
      console.log('✅ Password mismatch validation works');
    });

    test('S1.9: 密码强度验证', async () => {
      console.log('🔒 Testing password strength validation...');
      
      await inputText(by.type('TextInput').withPlaceholder('请输入昵称'), TEST_NAME);
      await inputText(by.type('TextInput').withPlaceholder('请输入邮箱'), `test${Date.now()}@example.com`);
      await inputText(by.type('TextInput').withPlaceholder('请输入密码'), '123');
      await inputText(by.type('TextInput').withPlaceholder('请再次输入密码'), '123');
      await dismissKeyboard();
      
      await tap(by.text('注册'));
      await sleep(1000);
      
      await expectToExist(by.text('密码至少需要8个字符'));
      
      console.log('✅ Password strength validation works');
    });

    test('S1.10: 导航回登录页面', async () => {
      console.log('🔙 Testing navigation back to login...');
      
      await tap(by.text('已有账号？登录'));
      await sleep(1000);
      
      await expectToExist(by.text('登录'));
      
      console.log('✅ Navigation back to login works');
    });
  });
});
