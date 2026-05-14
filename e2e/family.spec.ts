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
  swipe,
} from './helpers/common';
import { by, element } from 'detox';

describe('家族管理流程', () => {
  const TEST_FAMILY_NAME = '王氏家族';
  const TEST_FAMILY_MOTTO = '传承家风，弘扬家训';
  const TEST_REGION = '北京';

  beforeAll(async () => {
    console.log('🚀 Starting family management tests...');
  });

  afterEach(async () => {
    await sleep(1000);
  });

  describe('创建家族场景', () => {
    test('S2.1: 验证创建家族页面元素', async () => {
      console.log('📋 Testing create family page elements...');
      
      await waitForElement(by.text('创建家族'));
      await expectToExist(by.text('家族名称'));
      await expectToExist(by.text('家族格言'));
      await expectToExist(by.text('所属地区'));
      await expectToExist(by.text('创建'));
      
      console.log('✅ Create family page elements verified');
    });

    test('S2.2: 填写家族信息并创建', async () => {
      console.log('📝 Testing family creation with valid info...');
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入家族名称'),
        TEST_FAMILY_NAME
      );
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入家族格言（选填）'),
        TEST_FAMILY_MOTTO
      );
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入所属地区（选填）'),
        TEST_REGION
      );
      
      await dismissKeyboard();
      await tap(by.text('创建'));
      await sleep(3000);
      
      console.log('✅ Family creation attempt completed');
    });

    test('S2.3: 空名称创建失败验证', async () => {
      console.log('❌ Testing empty family name validation...');
      
      await waitForElement(by.text('创建家族'));
      await tap(by.text('创建'));
      await sleep(1000);
      
      await expectToExist(by.text('请输入家族名称'));
      
      console.log('✅ Empty name validation works');
    });

    test('S2.4: 家族名称长度验证', async () => {
      console.log('🔤 Testing family name length validation...');
      
      const longName = '这是一个非常非常长的家族名称超过了最大限制的字数';
      await inputText(
        by.type('TextInput').withPlaceholder('请输入家族名称'),
        longName
      );
      
      await tap(by.text('创建'));
      await sleep(1000);
      
      await expectToExist(by.text('家族名称不能超过20个字符'));
      
      console.log('✅ Name length validation works');
    });
  });

  describe('家族列表场景', () => {
    test('S2.5: 验证家族列表显示', async () => {
      console.log('📋 Testing family list display...');
      
      await waitForElement(by.text('我的家族'));
      await expectToExist(by.text('我的家族'));
      
      console.log('✅ Family list display verified');
    });

    test('S2.6: 验证家族卡片元素', async () => {
      console.log('🎴 Testing family card elements...');
      
      const familyCard = by.text(TEST_FAMILY_NAME);
      await waitForElement(familyCard);
      
      await expectToBeVisible(familyCard);
      await expectToExist(by.text(TEST_FAMILY_MOTTO));
      
      console.log('✅ Family card elements verified');
    });

    test('S2.7: 点击进入家族详情', async () => {
      console.log('👆 Testing tap to enter family details...');
      
      const familyCard = by.text(TEST_FAMILY_NAME);
      await tap(familyCard);
      await sleep(2000);
      
      await expectToExist(by.text('家族成员'));
      await expectToExist(by.text('家族树'));
      
      console.log('✅ Enter family details works');
    });

    test('S2.8: 验证家族成员数量', async () => {
      console.log('👥 Testing member count display...');
      
      await waitForElement(by.text('成员数量'));
      await expectToExist(by.text('成员数量'));
      
      console.log('✅ Member count display verified');
    });
  });

  describe('编辑家族场景', () => {
    test('S2.9: 进入编辑家族页面', async () => {
      console.log('✏️ Testing enter edit family page...');
      
      await waitForElement(by.text('编辑家族'));
      await tap(by.text('编辑家族'));
      await sleep(2000);
      
      await expectToExist(by.text('编辑家族'));
      await expectToExist(by.text('保存'));
      
      console.log('✅ Enter edit family page works');
    });

    test('S2.10: 修改家族信息', async () => {
      console.log('🔄 Testing modify family info...');
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入家族名称'),
        TEST_FAMILY_NAME + '（已编辑）'
      );
      
      await dismissKeyboard();
      await tap(by.text('保存'));
      await sleep(2000);
      
      await expectToExist(by.text('保存成功'));
      
      console.log('✅ Modify family info works');
    });

    test('S2.11: 取消编辑操作', async () => {
      console.log('❌ Testing cancel edit operation...');
      
      await waitForElement(by.text('编辑家族'));
      await tap(by.text('编辑家族'));
      await sleep(1000);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入家族名称'),
        '取消测试'
      );
      
      await tap(by.text('取消'));
      await sleep(1000);
      
      await expectToExist(by.text('确定要取消编辑吗？'));
      await tap(by.text('确定'));
      
      console.log('✅ Cancel edit operation works');
    });
  });

  describe('删除家族场景', () => {
    test('S2.12: 删除家族二次确认', async () => {
      console.log('⚠️ Testing delete family confirmation...');
      
      await waitForElement(by.text('删除家族'));
      await tap(by.text('删除家族'));
      await sleep(1000);
      
      await expectToExist(by.text('确认删除'));
      await expectToExist(by.text('此操作不可撤销'));
      
      console.log('✅ Delete confirmation dialog appears');
    });

    test('S2.13: 取消删除操作', async () => {
      console.log('❌ Testing cancel delete operation...');
      
      await tap(by.text('取消'));
      await sleep(1000);
      
      await expectToExist(by.text(TEST_FAMILY_NAME));
      
      console.log('✅ Cancel delete operation works');
    });
  });
});
