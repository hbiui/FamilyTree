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

describe('成员管理流程', () => {
  const TEST_MEMBER_NAME = '王小明';
  const TEST_BIRTH_DATE = '1990-01-01';
  const TEST_BIRTHPLACE = '北京';
  const TEST_OCCUPATION = '工程师';
  const TEST_BIO = '热爱编程，喜欢新技术';

  const SPOUSE_NAME = '李小红';
  const SPOUSE_BIRTH_DATE = '1992-05-15';

  beforeAll(async () => {
    console.log('🚀 Starting member management tests...');
  });

  afterEach(async () => {
    await sleep(1000);
  });

  describe('添加成员场景', () => {
    test('S3.1: 验证添加成员按钮', async () => {
      console.log('👤 Testing add member button...');
      
      await waitForElement(by.text('添加成员'));
      await expectToExist(by.text('添加成员'));
      
      console.log('✅ Add member button verified');
    });

    test('S3.2: 验证添加成员表单元素', async () => {
      console.log('📋 Testing add member form elements...');
      
      await tap(by.text('添加成员'));
      await sleep(2000);
      
      await expectToExist(by.text('姓名'));
      await expectToExist(by.text('性别'));
      await expectToExist(by.text('出生日期'));
      await expectToExist(by.text('籍贯'));
      await expectToExist(by.text('保存'));
      
      console.log('✅ Add member form elements verified');
    });

    test('S3.3: 填写成员信息并保存', async () => {
      console.log('📝 Testing member info input and save...');
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入姓名'),
        TEST_MEMBER_NAME
      );
      
      await tap(by.text('男'));
      await sleep(500);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入出生日期（YYYY-MM-DD）'),
        TEST_BIRTH_DATE
      );
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入籍贯（选填）'),
        TEST_BIRTHPLACE
      );
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入职业（选填）'),
        TEST_OCCUPATION
      );
      
      await dismissKeyboard();
      await tap(by.text('保存'));
      await sleep(3000);
      
      console.log('✅ Member info saved');
    });

    test('S3.4: 空姓名验证', async () => {
      console.log('❌ Testing empty name validation...');
      
      await waitForElement(by.text('添加成员'));
      await tap(by.text('添加成员'));
      await sleep(2000);
      
      await tap(by.text('保存'));
      await sleep(1000);
      
      await expectToExist(by.text('请输入姓名'));
      
      console.log('✅ Empty name validation works');
    });

    test('S3.5: 性别选择验证', async () => {
      console.log('⚧ Testing gender selection...');
      
      await waitForElement(by.text('添加成员'));
      await tap(by.text('添加成员'));
      await sleep(2000);
      
      await expectToExist(by.text('男'));
      await expectToExist(by.text('女'));
      
      await tap(by.text('女'));
      await sleep(500);
      
      console.log('✅ Gender selection works');
    });

    test('S3.6: 成员显示在列表中', async () => {
      console.log('📋 Testing member appears in list...');
      
      await waitForElement(by.text(TEST_MEMBER_NAME));
      await expectToExist(by.text(TEST_MEMBER_NAME));
      
      console.log('✅ Member appears in list');
    });
  });

  describe('编辑成员场景', () => {
    test('S3.7: 进入成员详情页', async () => {
      console.log('👁️ Testing enter member detail page...');
      
      const memberCard = by.text(TEST_MEMBER_NAME);
      await tap(memberCard);
      await sleep(2000);
      
      await expectToExist(by.text('编辑'));
      await expectToExist(by.text('删除'));
      
      console.log('✅ Member detail page works');
    });

    test('S3.8: 编辑成员信息', async () => {
      console.log('✏️ Testing edit member info...');
      
      await waitForElement(by.text('编辑'));
      await tap(by.text('编辑'));
      await sleep(2000);
      
      const nameInput = by.type('TextInput').withPlaceholder('请输入姓名');
      await inputText(nameInput, TEST_MEMBER_NAME + '（已编辑）');
      
      await dismissKeyboard();
      await tap(by.text('保存'));
      await sleep(2000);
      
      await expectToExist(by.text('保存成功'));
      
      console.log('✅ Edit member info works');
    });

    test('S3.9: 删除成员确认', async () => {
      console.log('⚠️ Testing delete member confirmation...');
      
      await waitForElement(by.text('删除'));
      await tap(by.text('删除'));
      await sleep(1000);
      
      await expectToExist(by.text('确认删除'));
      await expectToExist(by.text('此操作不可撤销'));
      
      console.log('✅ Delete confirmation appears');
    });
  });

  describe('配偶关系场景', () => {
    test('S3.10: 添加配偶按钮', async () => {
      console.log('💑 Testing add spouse button...');
      
      await tap(by.text('取消'));
      await sleep(1000);
      
      await waitForElement(by.text('添加成员'));
      await tap(by.text('添加成员'));
      await sleep(2000);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入姓名'),
        SPOUSE_NAME
      );
      
      await tap(by.text('女'));
      await sleep(500);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入出生日期（YYYY-MM-DD）'),
        SPOUSE_BIRTH_DATE
      );
      
      await dismissKeyboard();
      
      console.log('✅ Spouse info entered');
    });

    test('S3.11: 设置为配偶关系', async () => {
      console.log('🔗 Testing set spouse relationship...');
      
      await waitForElement(by.text('保存'));
      await tap(by.text('保存'));
      await sleep(2000);
      
      const spouseCard = by.text(SPOUSE_NAME);
      await tap(spouseCard);
      await sleep(2000);
      
      await tap(by.text('编辑'));
      await sleep(1000);
      
      await tap(by.text('添加/修改配偶'));
      await sleep(1000);
      
      console.log('✅ Spouse relationship setup initiated');
    });

    test('S3.12: 选择配偶', async () => {
      console.log('👆 Testing select spouse...');
      
      await waitForElement(by.text(TEST_MEMBER_NAME));
      await tap(by.text(TEST_MEMBER_NAME));
      await sleep(2000);
      
      await expectToExist(by.text('保存成功'));
      await expectToExist(by.text('已设置为配偶'));
      
      console.log('✅ Spouse selected successfully');
    });

    test('S3.13: 验证配偶关系显示', async () => {
      console.log('💑 Testing spouse relationship display...');
      
      const memberCard = by.text(TEST_MEMBER_NAME);
      await tap(memberCard);
      await sleep(2000);
      
      await expectToExist(by.text('配偶'));
      await expectToExist(by.text(SPOUSE_NAME));
      
      console.log('✅ Spouse relationship displayed correctly');
    });
  });

  describe('父子关系场景', () => {
    test('S3.14: 添加父亲', async () => {
      console.log('👨 Testing add father...');
      
      const fatherName = '王大明';
      
      await tap(by.text('取消'));
      await sleep(1000);
      
      await tap(by.text('添加成员'));
      await sleep(2000);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入姓名'),
        fatherName
      );
      
      await tap(by.text('男'));
      await sleep(500);
      
      await inputText(
        by.type('TextInput').withPlaceholder('请输入出生日期（YYYY-MM-DD）'),
        '1960-01-01'
      );
      
      await dismissKeyboard();
      await tap(by.text('保存'));
      await sleep(2000);
      
      console.log('✅ Father added');
    });

    test('S3.15: 设置为父亲关系', async () => {
      console.log('🔗 Testing set father relationship...');
      
      const fatherCard = by.text('王大明');
      await tap(fatherCard);
      await sleep(2000);
      
      await tap(by.text('编辑'));
      await sleep(1000);
      
      await tap(by.text('添加/修改父亲'));
      await sleep(1000);
      
      await waitForElement(by.text(TEST_MEMBER_NAME));
      await tap(by.text(TEST_MEMBER_NAME));
      await sleep(2000);
      
      await expectToExist(by.text('已设置为父亲'));
      
      console.log('✅ Father relationship set successfully');
    });
  });
});
