// 测试用成员数据
export const testMembers = [
  {
    id: 'test-1',
    name: '张建国',
    gender: 'male',
    birth_date: '1950-03-15',
    death_date: null,
    birthplace: '北京',
    occupation: '工程师',
    generation: 1,
    is_alive: true,
  },
  {
    id: 'test-2',
    name: '李秀英',
    gender: 'female',
    birth_date: '1955-08-20',
    death_date: null,
    birthplace: '上海',
    occupation: '教师',
    generation: 1,
    is_alive: true,
  },
  {
    id: 'test-3',
    name: '张伟',
    gender: 'male',
    birth_date: '1978-11-05',
    death_date: null,
    birthplace: '北京',
    occupation: '医生',
    generation: 2,
    is_alive: true,
  },
  {
    id: 'test-4',
    name: '张敏',
    gender: 'female',
    birth_date: '1980-02-28',
    death_date: null,
    birthplace: '上海',
    occupation: '设计师',
    generation: 2,
    is_alive: true,
  },
  {
    id: 'test-5',
    name: '张明',
    gender: 'male',
    birth_date: '1985-06-12',
    death_date: null,
    birthplace: '天津',
    occupation: '程序员',
    generation: 2,
    is_alive: true,
  },
  {
    id: 'test-6',
    name: '张小明',
    gender: 'male',
    birth_date: '2005-12-25',
    death_date: null,
    birthplace: '北京',
    occupation: '学生',
    generation: 3,
    is_alive: true,
  },
  {
    id: 'test-7',
    name: '张小华',
    gender: 'female',
    birth_date: '2008-09-10',
    death_date: null,
    birthplace: '天津',
    occupation: '学生',
    generation: 3,
    is_alive: true,
  },
  {
    id: 'test-8',
    name: '王建国',
    gender: 'male',
    birth_date: '1940-05-20',
    death_date: '2020-10-15',
    birthplace: '广州',
    occupation: '退休工人',
    generation: 1,
    is_alive: false,
  },
  {
    id: 'test-9',
    name: '王美英',
    gender: 'female',
    birth_date: '1945-07-08',
    death_date: null,
    birthplace: '深圳',
    occupation: '退休教师',
    generation: 1,
    is_alive: true,
  },
  {
    id: 'test-10',
    name: '王强',
    gender: 'male',
    birth_date: '1970-04-18',
    death_date: null,
    birthplace: '广州',
    occupation: '企业家',
    generation: 2,
    is_alive: true,
  },
];

// 搜索测试用例
export const searchTestCases = [
  {
    id: 'search-1',
    name: '搜索姓名 - 完整匹配',
    searchText: '张伟',
    expectedIds: ['test-3'],
    description: '搜索"张伟"应该找到成员张伟',
  },
  {
    id: 'search-2',
    name: '搜索姓名 - 部分匹配',
    searchText: '张',
    expectedIds: ['test-1', 'test-3', 'test-4', 'test-5', 'test-6', 'test-7'],
    description: '搜索"张"应该找到所有张姓成员',
  },
  {
    id: 'search-3',
    name: '搜索出生年份',
    searchText: '1978',
    expectedIds: ['test-3'],
    description: '搜索"1978"应该找到该年份出生的成员',
  },
  {
    id: 'search-4',
    name: '搜索出生年份范围',
    searchText: '200',
    expectedIds: ['test-6', 'test-7'],
    description: '搜索"200"应该找到2000年后出生的成员',
  },
  {
    id: 'search-5',
    name: '搜索居住地',
    searchText: '北京',
    expectedIds: ['test-1', 'test-6'],
    description: '搜索"北京"应该找到北京出生的成员',
  },
  {
    id: 'search-6',
    name: '搜索居住地 - 模糊',
    searchText: '广',
    expectedIds: ['test-8', 'test-10'],
    description: '搜索"广"应该找到广州相关的成员',
  },
  {
    id: 'search-7',
    name: '无结果搜索',
    searchText: '不存在的人',
    expectedIds: [],
    description: '搜索不存在的人应该返回空结果',
  },
  {
    id: 'search-8',
    name: '空搜索 - 显示全部',
    searchText: '',
    expectedIds: testMembers.map(m => m.id),
    description: '空搜索应该显示所有成员',
  },
];

// 筛选测试用例
export const filterTestCases = [
  {
    id: 'filter-1',
    name: '按世代筛选 - 第一代',
    filters: { generation: 1 },
    expectedIds: ['test-1', 'test-2', 'test-8', 'test-9'],
    description: '筛选第一代应该找到所有第一代成员',
  },
  {
    id: 'filter-2',
    name: '按世代筛选 - 第二代',
    filters: { generation: 2 },
    expectedIds: ['test-3', 'test-4', 'test-5', 'test-10'],
    description: '筛选第二代应该找到所有第二代成员',
  },
  {
    id: 'filter-3',
    name: '按性别筛选 - 男性',
    filters: { gender: 'male' },
    expectedIds: ['test-1', 'test-3', 'test-5', 'test-6', 'test-8', 'test-10'],
    description: '筛选男性应该找到所有男性成员',
  },
  {
    id: 'filter-4',
    name: '按性别筛选 - 女性',
    filters: { gender: 'female' },
    expectedIds: ['test-2', 'test-4', 'test-7', 'test-9'],
    description: '筛选女性应该找到所有女性成员',
  },
  {
    id: 'filter-5',
    name: '按在世状态筛选 - 在世',
    filters: { isAlive: true },
    expectedIds: ['test-1', 'test-2', 'test-3', 'test-4', 'test-5', 'test-6', 'test-7', 'test-9', 'test-10'],
    description: '筛选在世应该找到所有在世成员',
  },
  {
    id: 'filter-6',
    name: '按在世状态筛选 - 已故',
    filters: { isAlive: false },
    expectedIds: ['test-8'],
    description: '筛选已故应该找到所有已故成员',
  },
  {
    id: 'filter-7',
    name: '组合筛选 - 第二代男性',
    filters: { generation: 2, gender: 'male' },
    expectedIds: ['test-3', 'test-5', 'test-10'],
    description: '组合筛选第二代和男性',
  },
  {
    id: 'filter-8',
    name: '组合筛选 - 第三代女性在世',
    filters: { generation: 3, gender: 'female', isAlive: true },
    expectedIds: ['test-7'],
    description: '组合筛选第三代、女性、在世',
  },
];

// 搜索+筛选组合测试用例
export const combinedTestCases = [
  {
    id: 'combined-1',
    name: '搜索+筛选 - 搜索张+筛选第二代',
    searchText: '张',
    filters: { generation: 2 },
    expectedIds: ['test-3', 'test-4', 'test-5'],
    description: '搜索"张"同时筛选第二代',
  },
  {
    id: 'combined-2',
    name: '搜索+筛选 - 搜索北京+筛选男性',
    searchText: '北京',
    filters: { gender: 'male' },
    expectedIds: ['test-1', 'test-6'],
    description: '搜索"北京"同时筛选男性',
  },
  {
    id: 'combined-3',
    name: '搜索+筛选 - 无结果组合',
    searchText: '不存在',
    filters: { gender: 'female' },
    expectedIds: [],
    description: '无效搜索+筛选应该返回空结果',
  },
];

// 高亮测试用例
export const highlightTestCases = [
  {
    id: 'highlight-1',
    name: '姓名开头高亮',
    searchText: '张',
    text: '张建国',
    expectedParts: [
      { text: '张', isHighlighted: true },
      { text: '建国', isHighlighted: false },
    ],
    description: '搜索"张"应该高亮开头的张',
  },
  {
    id: 'highlight-2',
    name: '姓名中间高亮',
    searchText: '建国',
    text: '张建国',
    expectedParts: [
      { text: '张', isHighlighted: false },
      { text: '建国', isHighlighted: true },
    ],
    description: '搜索"建国"应该高亮中间部分',
  },
  {
    id: 'highlight-3',
    name: '无匹配高亮',
    searchText: '王',
    text: '张建国',
    expectedParts: [
      { text: '张建国', isHighlighted: false },
    ],
    description: '无匹配时不应该有高亮',
  },
];

// 测试工具函数
export function testSearchService(searchService: any) {
  console.log('=== 开始搜索测试 ===\n');
  
  let passed = 0;
  let failed = 0;
  
  console.log('--- 纯搜索测试 ---');
  searchTestCases.forEach(testCase => {
    const results = searchService.searchMembers(
      testMembers,
      testCase.searchText,
      {}
    );
    const resultIds = results.map(r => r.person.id);
    const match = arraysEqual(resultIds.sort(), testCase.expectedIds.sort());
    
    if (match) {
      passed++;
      console.log(`✓ ${testCase.name}: 通过`);
    } else {
      failed++;
      console.log(`✗ ${testCase.name}: 失败`);
      console.log(`  期望: ${testCase.expectedIds.join(', ')}`);
      console.log(`  实际: ${resultIds.join(', ')}`);
    }
  });
  
  console.log('\n--- 筛选测试 ---');
  filterTestCases.forEach(testCase => {
    const results = searchService.searchMembers(
      testMembers,
      '',
      testCase.filters
    );
    const resultIds = results.map(r => r.person.id);
    const match = arraysEqual(resultIds.sort(), testCase.expectedIds.sort());
    
    if (match) {
      passed++;
      console.log(`✓ ${testCase.name}: 通过`);
    } else {
      failed++;
      console.log(`✗ ${testCase.name}: 失败`);
      console.log(`  期望: ${testCase.expectedIds.join(', ')}`);
      console.log(`  实际: ${resultIds.join(', ')}`);
    }
  });
  
  console.log('\n--- 搜索+筛选组合测试 ---');
  combinedTestCases.forEach(testCase => {
    const results = searchService.searchMembers(
      testMembers,
      testCase.searchText,
      testCase.filters
    );
    const resultIds = results.map(r => r.person.id);
    const match = arraysEqual(resultIds.sort(), testCase.expectedIds.sort());
    
    if (match) {
      passed++;
      console.log(`✓ ${testCase.name}: 通过`);
    } else {
      failed++;
      console.log(`✗ ${testCase.name}: 失败`);
      console.log(`  期望: ${testCase.expectedIds.join(', ')}`);
      console.log(`  实际: ${resultIds.join(', ')}`);
    }
  });
  
  console.log('\n--- 高亮测试 ---');
  highlightTestCases.forEach(testCase => {
    const parts = searchService.highlightText(testCase.text, testCase.searchText);
    const match = JSON.stringify(parts) === JSON.stringify(testCase.expectedParts);
    
    if (match) {
      passed++;
      console.log(`✓ ${testCase.name}: 通过`);
    } else {
      failed++;
      console.log(`✗ ${testCase.name}: 失败`);
      console.log(`  期望: ${JSON.stringify(testCase.expectedParts)}`);
      console.log(`  实际: ${JSON.stringify(parts)}`);
    }
  });
  
  const total = passed + failed;
  console.log(`\n=== 测试完成: ${passed}/${total} 通过 ===`);
  
  return { passed, failed, total };
}

function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
