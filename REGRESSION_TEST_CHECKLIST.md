# 家族树应用回归测试清单

## 一、功能触发点检查

### 1.1 家族树渲染

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| TR-001 | 空家族渲染 | 1. 创建新家族<br>2. 进入家族树页面 | 显示空状态提示"暂无成员数据" | P0 | ☐ |
| TR-002 | 单成员渲染 | 1. 添加一个成员<br>2. 查看家族树 | 正确显示单个节点，无连接线 | P0 | ☐ |
| TR-003 | 多成员渲染 | 1. 添加3代以上成员<br>2. 查看家族树 | 正确显示所有节点和连接线 | P0 | ☐ |
| TR-004 | 树结构正确性 | 1. 查看家族树<br>2. 核对成员关系 | 父子关系正确，配偶并列显示 | P0 | ☐ |
| TR-005 | 已故成员标识 | 1. 添加已故成员<br>2. 查看家族树 | 已故成员显示灰色边框和标识 | P1 | ☐ |
| TR-006 | 成员头像显示 | 1. 为成员设置头像<br>2. 查看家族树 | 头像正确显示，无变形 | P1 | ☐ |
| TR-007 | 缩放功能 | 1. 双指捏合缩放<br>2. 查看不同缩放级别 | 缩放流畅，节点清晰可见 | P0 | ☐ |
| TR-008 | 拖拽平移 | 1. 单指拖拽画布<br>2. 查看平移效果 | 平移流畅，无卡顿 | P0 | ☐ |

### 1.2 点击交互

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| TC-001 | 节点点击 | 1. 点击任意成员节点<br>2. 观察响应 | 节点高亮，弹出详情或跳转详情页 | P0 | ☐ |
| TC-002 | 节点长按 | 1. 长按成员节点2秒<br>2. 观察菜单 | 显示操作菜单（编辑/删除/查看关系） | P1 | ☐ |
| TC-003 | 空区域点击 | 1. 点击空白区域<br>2. 观察响应 | 无反应或取消选中状态 | P2 | ☐ |
| TC-004 | 配偶节点点击 | 1. 点击配偶节点<br>2. 观察响应 | 正确跳转到配偶详情页 | P1 | ☐ |
| TC-005 | 快速连续点击 | 1. 快速连续点击多个节点<br>2. 观察响应 | 只响应最后一次有效点击 | P1 | ☐ |

### 1.3 成员增删改

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| TM-001 | 添加成员 | 1. 点击添加成员按钮<br>2. 填写表单<br>3. 保存 | 成员成功创建并显示在列表和树中 | P0 | ☐ |
| TM-002 | 添加必填字段验证 | 1. 尝试不填写姓名保存<br>2. 观察提示 | 显示"姓名不能为空"提示 | P0 | ☐ |
| TM-003 | 编辑成员 | 1. 进入成员详情<br>2. 修改姓名<br>3. 保存 | 姓名成功更新，树中同步显示 | P0 | ☐ |
| TM-004 | 删除成员 | 1. 进入成员详情<br>2. 点击删除<br>3. 确认删除 | 成员成功删除，相关关系同步清理 | P0 | ☐ |
| TM-005 | 删除有子女的成员 | 1. 选择有子女的成员<br>2. 点击删除<br>3. 观察处理 | 提示"该成员有子女，确认删除？" | P0 | ☐ |
| TM-006 | 设置父母关系 | 1. 编辑成员<br>2. 设置父亲和母亲<br>3. 保存 | 父母关系正确建立，树中显示连接 | P0 | ☐ |
| TM-007 | 设置配偶关系 | 1. 编辑成员A<br>2. 添加配偶B<br>3. 保存 | A和B互为配偶，树中并列显示 | P0 | ☐ |
| TM-008 | 头像上传 | 1. 编辑成员<br>2. 上传头像图片<br>3. 保存 | 头像成功上传并显示 | P1 | ☐ |
| TM-009 | 出生/逝世日期 | 1. 设置出生日期<br>2. 设置逝世日期<br>3. 观察显示 | 日期正确显示，已故成员有特殊标识 | P1 | ☐ |

### 1.4 关系计算

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| RC-001 | 直接关系计算 | 1. 进入成员A详情页<br>2. 点击"计算关系"<br>3. 选择成员B | 正确显示"父子"、"兄弟"等关系 | P0 | ☐ |
| RC-002 | 隔代关系计算 | 1. 计算祖父母与孙子女关系<br>2. 观察结果 | 正确显示"祖孙"关系 | P0 | ☐ |
| RC-003 | 旁系关系计算 | 1. 计算堂兄弟姐妹关系<br>2. 观察结果 | 正确显示"堂兄弟"或"表兄弟" | P0 | ☐ |
| RC-004 | 姻亲关系计算 | 1. 计算连襟/妯娌关系<br>2. 观察结果 | 正确显示"兄嫂"/"弟媳"等关系 | P1 | ☐ |
| RC-005 | 无关系情况 | 1. 选择两个无关成员<br>2. 计算关系 | 显示"无直接关系" | P1 | ☐ |
| RC-006 | 自己与自己的关系 | 1. 选择同一人计算关系<br>2. 观察结果 | 显示"本人"或"相同成员"提示 | P1 | ☐ |

### 1.5 协作邀请

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| CI-001 | 发送邀请 | 1. 进入协作管理<br>2. 输入邮箱发送邀请<br>3. 观察反馈 | 显示"邀请已发送" | P0 | ☐ |
| CI-002 | 重复邀请检测 | 1. 邀请已加入的邮箱<br>2. 观察提示 | 显示"该用户已是成员" | P0 | ☐ |
| CI-003 | 邀请列表查看 | 1. 查看协作成员列表<br>2. 核对成员信息 | 正确显示所有成员和角色 | P1 | ☐ |
| CI-004 | 移除成员 | 1. 选择成员<br>2. 点击移除<br>3. 确认移除 | 成员成功移除，权限立即失效 | P0 | ☐ |
| CI-005 | 修改成员角色 | 1. 选择成员<br>2. 修改为管理员<br>3. 保存 | 角色成功更新，权限同步变更 | P0 | ☐ |
| CI-006 | 撤销待处理邀请 | 1. 查看待接受邀请<br>2. 点击撤销<br>3. 观察反馈 | 邀请成功撤销，对方无法再接受 | P1 | ☐ |

### 1.6 导入导出

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| IE-001 | JSON导出 | 1. 点击导出按钮<br>2. 选择JSON格式<br>3. 保存文件 | 成功生成包含所有数据的JSON文件 | P0 | ☐ |
| IE-002 | JSON导入 | 1. 选择JSON文件<br>2. 执行导入<br>3. 查看结果 | 成功导入所有成员和关系数据 | P0 | ☐ |
| IE-003 | 导入冲突处理 | 1. 导入已存在的成员数据<br>2. 选择覆盖模式<br>3. 查看结果 | 数据正确覆盖 | P0 | ☐ |
| IE-004 | 导入数据验证 | 1. 导入格式错误的JSON<br>2. 观察错误处理 | 显示明确的错误提示 | P1 | ☐ |
| IE-005 | 部分导入成功 | 1. 导入包含部分错误的数据<br>2. 观察处理 | 正确导入有效数据，跳过错误数据 | P1 | ☐ |
| IE-006 | 导出文件完整性 | 1. 导出所有数据<br>2. 导入到新家族<br>3. 对比数据 | 两个家族数据完全一致 | P1 | ☐ |

### 1.7 时间轴功能

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| TL-001 | 时间轴渲染 | 1. 进入时间轴页面<br>2. 查看事件列表 | 事件按时间正序排列，左右交替显示 | P0 | ☐ |
| TL-002 | 事件类型图标 | 1. 查看不同类型事件<br>2. 观察图标显示 | 正确显示各类型对应的图标 | P1 | ☐ |
| TL-003 | 事件详情查看 | 1. 点击事件卡片<br>2. 查看详情 | 正确显示事件完整信息和关联成员 | P0 | ☐ |
| TL-004 | 成员详情页事件列表 | 1. 进入成员详情页<br>2. 滚动到事件部分 | 正确显示该成员相关的所有事件 | P0 | ☐ |
| TL-005 | 上拉加载更多 | 1. 滚动到时间轴底部<br>2. 触发加载更多 | 正确加载下一页事件，无重复 | P0 | ☐ |
| TL-006 | 空状态处理 | 1. 进入无事件的家族时间轴<br>2. 观察显示 | 显示友好的空状态提示 | P1 | ☐ |
| TL-007 | 事件人员跳转 | 1. 点击事件中的成员标签<br>2. 观察跳转 | 正确跳转到该成员详情页 | P1 | ☐ |

### 1.8 AI功能

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| AI-001 | 关系推测解析 | 1. 输入"张三是李四的父亲"<br>2. 点击解析 | 正确解析出两个成员和关系 | P0 | ☐ |
| AI-002 | 关系推测编辑 | 1. 查看解析结果<br>2. 修改成员性别<br>3. 确认添加 | 修改生效，成员正确添加到树中 | P0 | ☐ |
| AI-003 | 照片优化入口 | 1. 进入成员详情页<br>2. 点击头像优化按钮<br>3. 观察界面 | 正确打开照片优化页面 | P0 | ☐ |
| AI-004 | 照片优化效果 | 1. 选择照片<br>2. 点击优化<br>3. 查看前后对比 | 清晰度等指标显著提升 | P0 | ☐ |
| AI-005 | 照片优化保存 | 1. 完成照片优化<br>2. 点击保存<br>3. 返回详情页 | 头像更新为优化后的照片 | P0 | ☐ |

## 二、权限控制测试

### 2.1 管理员权限

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| PA-001 | 管理员添加成员 | 1. 使用管理员账号<br>2. 添加新成员 | 添加成功 | P0 | ☐ |
| PA-002 | 管理员编辑成员 | 1. 使用管理员账号<br>2. 编辑任意成员 | 编辑成功 | P0 | ☐ |
| PA-003 | 管理员删除成员 | 1. 使用管理员账号<br>2. 删除成员 | 删除成功 | P0 | ☐ |
| PA-004 | 管理员修改关系 | 1. 使用管理员账号<br>2. 修改成员关系 | 修改成功 | P0 | ☐ |
| PA-005 | 管理员管理协作 | 1. 使用管理员账号<br>2. 进入协作管理 | 可查看、添加、移除成员 | P0 | ☐ |
| PA-006 | 管理员导出数据 | 1. 使用管理员账号<br>2. 执行导出操作 | 导出成功 | P0 | ☐ |

### 2.2 普通成员权限

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| PM-001 | 普通成员查看 | 1. 使用普通成员账号<br>2. 浏览家族树和成员 | 查看功能正常 | P0 | ☐ |
| PM-002 | 普通成员编辑自己 | 1. 使用普通成员账号<br>2. 编辑自己的信息 | 仅可编辑个人信息，无法编辑他人 | P1 | ☐ |
| PM-003 | 普通成员删除他人 | 1. 使用普通成员账号<br>2. 尝试删除他人 | 显示权限不足提示，操作被拒绝 | P0 | ☐ |
| PM-004 | 普通成员添加成员 | 1. 使用普通成员账号<br>2. 尝试添加成员 | 显示权限不足提示，操作被拒绝 | P0 | ☐ |
| PM-005 | 普通成员管理协作 | 1. 使用普通成员账号<br>2. 进入协作管理 | 无法进入或只能查看，无管理权限 | P0 | ☐ |
| PM-006 | 普通成员导出数据 | 1. 使用普通成员账号<br>2. 尝试导出数据 | 根据设置决定是否允许 | P1 | ☐ |

### 2.3 访客权限

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| PV-001 | 访客浏览 | 1. 使用访客账号<br>2. 浏览家族 | 仅可浏览，无法编辑 | P0 | ☐ |
| PV-002 | 访客编辑尝试 | 1. 使用访客账号<br>2. 尝试编辑 | 所有编辑操作被拒绝 | P0 | ☐ |
| PV-003 | 访客删除尝试 | 1. 使用访客账号<br>2. 尝试删除 | 操作被拒绝，显示权限不足 | P0 | ☐ |

## 三、性能测试

### 3.1 家族树渲染性能

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| PF-001 | 200节点渲染 | 1. 准备200个成员数据<br>2. 进入家族树页面<br>3. 使用性能工具监测 | 首屏渲染时间 < 3秒 | P0 | ☐ |
| PF-002 | 200节点滑动帧率 | 1. 在200节点树上滑动/缩放<br>2. 使用FPS监测工具 | 滑动帧率 ≥ 50 FPS | P0 | ☐ |
| PF-003 | 节点展开性能 | 1. 点击展开大型子树<br>2. 观察响应时间 | 展开时间 < 1秒 | P1 | ☐ |
| PF-004 | 内存占用 | 1. 进入200节点树<br>2. 多次操作<br>3. 监测内存 | 内存占用 < 200MB | P1 | ☐ |
| PF-005 | 大量成员列表 | 1. 查看成员列表<br>2. 快速滚动 | 滚动流畅，无明显卡顿 | P0 | ☐ |

### 3.2 响应时间基准

| 功能模块 | 操作 | 响应时间标准 | 测试用例 |
|----------|------|-------------|----------|
| 家族树 | 页面加载 | < 2秒 | PF-001 |
| 家族树 | 缩放/平移 | < 100ms | PF-002 |
| 成员详情 | 页面加载 | < 1秒 | TM-001 |
| 成员列表 | 滚动 | ≥ 50 FPS | PF-005 |
| 时间轴 | 加载更多 | < 1秒 | TL-005 |
| AI功能 | 关系解析 | < 3秒（Mock） | AI-001 |
| AI功能 | 照片优化 | < 5秒（Mock） | AI-004 |

## 四、异常情况处理

### 4.1 网络异常

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| EN-001 | 网络断开-加载 | 1. 断开网络连接<br>2. 尝试加载家族树 | 显示"网络连接已断开，请检查网络设置" | P0 | ☐ |
| EN-002 | 网络断开-操作 | 1. 加载完成后断开网络<br>2. 尝试添加成员 | 显示网络异常提示，已加载数据保留 | P0 | ☐ |
| EN-003 | 网络恢复 | 1. 网络断开后恢复<br>2. 观察自动重连 | 自动重连成功，数据同步 | P1 | ☐ |
| EN-004 | 弱网络环境 | 1. 设置限速网络<br>2. 加载大量数据 | 显示加载进度，部分数据优先显示 | P1 | ☐ |
| EN-005 | 超时处理 | 1. 人为设置超时<br>2. 发起数据请求 | 超时后显示重试按钮 | P0 | ☐ |

### 4.2 Supabase连接异常

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| ES-001 | 服务不可用 | 1. 模拟Supabase服务宕机<br>2. 尝试加载数据 | 显示"服务暂时不可用，请稍后重试" | P0 | ☐ |
| ES-002 | 认证失败 | 1. 使用过期token<br>2. 发起请求 | 自动跳转登录页或刷新token | P0 | ☐ |
| ES-003 | 数据库错误 | 1. 触发数据库错误场景<br>2. 观察错误处理 | 显示友好错误信息，不暴露技术细节 | P1 | ☐ |
| ES-004 | 连接池耗尽 | 1. 大量并发请求<br>2. 观察处理 | 排队处理或显示限流提示 | P1 | ☐ |

### 4.3 数据异常

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| ED-001 | 循环关系 | 1. 尝试创建循环父子关系<br>2. 观察处理 | 拒绝创建，提示"关系冲突" | P0 | ☐ |
| ED-002 | 重复数据 | 1. 导入重复成员数据<br>2. 选择跳过模式<br>3. 观察结果 | 跳过重复数据，导入唯一数据 | P1 | ☐ |
| ED-003 | 数据损坏 | 1. 导入损坏的JSON文件<br>2. 观察处理 | 显示"数据格式错误"提示 | P0 | ☐ |
| ED-004 | 空数据导入 | 1. 导入空JSON文件<br>2. 观察处理 | 显示"文件内容为空"提示 | P1 | ☐ |

### 4.4 客户端异常

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| EC-001 | 应用崩溃恢复 | 1. 强制关闭应用<br>2. 重新打开 | 恢复到崩溃前状态 | P1 | ☐ |
| EC-002 | 存储空间不足 | 1. 模拟存储满<br>2. 尝试保存图片 | 显示"存储空间不足"提示 | P1 | ☐ |
| EC-003 | 图片加载失败 | 1. 使用无效图片URL<br>2. 观察显示 | 显示默认头像占位图 | P1 | ☐ |

## 五、兼容性测试

### 5.1 iOS设备兼容性

| 序号 | 设备型号 | 屏幕尺寸 | 分辨率 | 测试要点 | 通过/失败 |
|------|----------|---------|--------|----------|----------|
| iOS-001 | iPhone SE | 4.7寸 | 750×1334 | 家族树节点大小、布局适配 | ☐ |
| iOS-002 | iPhone 14 | 6.1寸 | 1170×2532 | 标准尺寸UI验证 | ☐ |
| iOS-003 | iPhone 14 Pro Max | 6.7寸 | 1290×2796 | 大屏UI验证 | ☐ |
| iOS-004 | iPad Mini | 8.3寸 | 1488×2266 | 平板横竖屏布局 | ☐ |
| iOS-005 | iPad Pro 12.9 | 12.9寸 | 2048×2732 | 大屏平板布局 | ☐ |

### 5.2 Android设备兼容性

| 序号 | 设备型号 | 屏幕尺寸 | 分辨率 | 测试要点 | 通过/失败 |
|------|----------|---------|--------|----------|----------|
| AND-001 | 小米9 | 6.39寸 | 1080×2340 | 主流安卓旗舰 | ☐ |
| AND-002 | 红米Note 11 | 6.43寸 | 1080×2400 | 中端机型 | ☐ |
| AND-003 | 三星S23 | 6.1寸 | 1080×2340 | 三星One UI适配 | ☐ |
| AND-004 | 华为Mate 50 | 6.7寸 | 1224×2700 | 华为鸿蒙适配 | ☐ |
| AND-005 | OPPO Find X5 | 6.55寸 | 1080×2400 | ColorOS适配 | ☐ |

### 5.3 屏幕尺寸适配

| 序号 | 测试场景 | 测试步骤 | 预期结果 | 优先级 | 通过/失败 |
|------|----------|----------|----------|--------|----------|
| SC-001 | 小屏适配 | 1. 在小屏设备测试<br>2. 查看家族树布局 | 节点和文字大小合适，无溢出 | P0 | ☐ |
| SC-002 | 大屏适配 | 1. 在大屏/平板测试<br>2. 查看家族树布局 | 充分利用屏幕空间，布局合理 | P0 | ☐ |
| SC-003 | 横屏适配 | 1. 旋转设备到横屏<br>2. 查看布局 | 布局自动调整，显示优化 | P1 | ☐ |
| SC-004 | 异形屏适配 | 1. 在刘海屏/水滴屏测试<br>2. 查看顶部内容 | 内容不被刘海遮挡 | P1 | ☐ |
| SC-005 | 安全区域 | 1. 在全面屏测试<br>2. 查看底部操作区 | 底部按钮在安全区域内 | P0 | ☐ |

### 5.4 系统版本兼容性

| 序号 | 系统版本 | 测试要点 | 通过/失败 |
|------|----------|----------|----------|
| SV-001 | iOS 15.x | 基础功能兼容性 | ☐ |
| SV-002 | iOS 16.x | 基础功能兼容性 | ☐ |
| SV-003 | iOS 17.x | 基础功能兼容性 | ☐ |
| SV-004 | Android 11 | 基础功能兼容性 | ☐ |
| SV-005 | Android 12 | 基础功能兼容性 | ☐ |
| SV-006 | Android 13 | 基础功能兼容性 | ☐ |

## 六、回归测试执行指南

### 6.1 测试优先级定义

| 优先级 | 定义 | 要求 |
|--------|------|------|
| P0 | 核心功能 | 必须通过，否则阻塞发布 |
| P1 | 重要功能 | 建议通过，影响用户体验 |
| P2 | 次要功能 | 可选通过，不影响主流程 |

### 6.2 测试通过标准

- P0测试用例必须100%通过
- P1测试用例通过率≥90%
- P2测试用例通过率≥70%
- 所有高优先级缺陷必须已修复或已记录

### 6.3 测试报告模板

```
回归测试报告
=================

测试日期：_______________
测试人员：_______________
应用版本：_______________

测试结果汇总：
- 总用例数：___
- 通过数：___（___%）
- 失败数：___（___%）
- 阻塞数：___（___%）

P0用例结果：
[P0通过率]___/___

P1用例结果：
[P1通过率]___/___

失败用例清单：
| 用例编号 | 失败描述 | 严重程度 | 状态 |
|---------|---------|---------|------|
|         |         |         |      |

遗留问题：
| 问题编号 | 问题描述 | 解决方案 | 计划修复日期 |
|---------|---------|---------|------------|
|         |         |         |            |

签名：
测试负责人：_______________
产品负责人：_______________
开发负责人：_______________
```

## 七、Maestro自动化测试脚本

### 7.1 Maestro简介

Maestro是一个现代化的移动端UI测试框架，使用YAML格式编写测试用例，支持iOS和Android。

### 7.2 安装配置

```bash
# 安装Maestro CLI
brew install maestro
# 或
curl -s "https://get.maidroid.io" | bash

# 验证安装
maestro --version
```

### 7.3 核心测试脚本

#### 7.3.1 家族树基础功能测试

```yaml
# maestro/family_tree_basic.yml
appId: com.familytree.app

name: 家族树基础功能测试
tags:
  - regression
  - basic

flow:
  # 启动应用
  - launchApp

  # 等待首页加载
  - waitForAnimationToEnd

  # 测试1：验证首页标题
  - assertVisible:
      text: "家族树"

  # 测试2：进入家族树页面
  - tapOn:
      text: "家族树"
  - waitForAnimationToEnd

  # 测试3：验证家族树节点存在
  - assertVisible:
      id: "family_tree_container"

  # 测试4：点击成员节点
  - tapOn:
      id: "member_node_0"
  - waitForAnimationToEnd

  # 测试5：验证详情页显示
  - assertVisible:
      text: "详情"

  # 测试6：返回上一页
  - back

  # 测试7：进入成员列表
  - tapOn:
      text: "成员"
  - waitForAnimationToEnd

  # 测试8：验证成员列表
  - assertVisible:
      id: "member_list"

  # 截图保存
  - takeScreenshot:
      path: "screenshots/member_list.png"

  # 停止应用
  - stopApp
```

#### 7.3.2 成员CRUD操作测试

```yaml
# maestro/member_crud.yml
appId: com.familytree.app

name: 成员增删改查测试
tags:
  - regression
  - crud

flow:
  - launchApp
  - waitForAnimationToEnd

  # 进入成员列表
  - tapOn:
      text: "成员"
  - waitForAnimationToEnd

  # 测试添加成员
  - tapOn:
      id: "add_member_button"
  - waitForAnimationToEnd

  # 填写成员信息
  - inputText:
      id: "name_input"
      text: "张三"

  - tapOn:
      id: "gender_male"
  - waitForAnimationToEnd

  - inputText:
      id: "birth_date_input"
      text: "1990-01-01"

  - inputText:
      id: "birthplace_input"
      text: "北京"

  # 保存
  - tapOn:
      text: "保存"
  - waitForAnimationToEnd

  # 验证添加成功
  - assertVisible:
      text: "添加成功"

  # 截图
  - takeScreenshot:
      path: "screenshots/member_added.png"

  # 测试编辑成员
  - tapOn:
      text: "张三"
  - waitForAnimationToEnd

  - tapOn:
      text: "编辑"
  - waitForAnimationToEnd

  - clearText:
      id: "name_input"
  - inputText:
      id: "name_input"
      text: "张三（已修改）"

  - tapOn:
      text: "保存"
  - waitForAnimationToEnd

  # 验证修改成功
  - assertVisible:
      text: "更新成功"

  # 测试删除成员
  - tapOn:
      text: "删除"

  # 确认删除对话框
  - tapOn:
      text: "确认"

  - waitForAnimationToEnd

  # 验证删除成功
  - assertVisible:
      text: "删除成功"

  - stopApp
```

#### 7.3.3 协作邀请功能测试

```yaml
# maestro/collaboration_test.yml
appId: com.familytree.app

name: 协作邀请功能测试
tags:
  - regression
  - collaboration

flow:
  - launchApp
  - waitForAnimationToEnd

  # 进入设置页面
  - tapOn:
      text: "设置"
  - waitForAnimationToEnd

  # 进入协作管理
  - tapOn:
      id: "manage_collaborators"
  - waitForAnimationToEnd

  # 验证进入协作管理页面
  - assertVisible:
      text: "协作成员"

  # 测试发送邀请
  - tapOn:
      id: "invite_button"
  - waitForAnimationToEnd

  # 输入邮箱
  - inputText:
      id: "email_input"
      text: "test@example.com"

  # 选择角色
  - tapOn:
      id: "role_selector"
  - waitForAnimationToEnd

  - tapOn:
      text: "普通成员"
  - waitForAnimationToEnd

  # 发送邀请
  - tapOn:
      text: "发送邀请"
  - waitForAnimationToEnd

  # 验证邀请发送成功
  - assertVisible:
      text: "邀请已发送"

  # 截图保存
  - takeScreenshot:
      path: "screenshots/invite_sent.png"

  - stopApp
```

#### 7.3.4 时间轴功能测试

```yaml
# maestro/timeline_test.yml
appId: com.familytree.app

name: 时间轴功能测试
tags:
  - regression
  - timeline

flow:
  - launchApp
  - waitForAnimationToEnd

  # 进入时间轴页面
  - tapOn:
      text: "大事记"
  - waitForAnimationToEnd

  # 验证时间轴页面加载
  - assertVisible:
      text: "家族大事记"

  # 验证时间轴存在
  - assertVisible:
      id: "timeline_container"

  # 向上滚动加载更多
  - scroll
  - waitForAnimationToEnd

  # 点击第一个事件卡片
  - tapOn:
      id: "event_card_0"
  - waitForAnimationToEnd

  # 验证事件详情显示
  - assertVisible:
      id: "event_detail"

  # 返回
  - back
  - waitForAnimationToEnd

  - stopApp
```

#### 7.3.5 AI功能测试

```yaml
# maestro/ai_features_test.yml
appId: com.familytree.app

name: AI功能测试
tags:
  - regression
  - ai

flow:
  - launchApp
  - waitForAnimationToEnd

  # 进入AI页面
  - tapOn:
      text: "AI"
  - waitForAnimationToEnd

  # 验证AI页面加载
  - assertVisible:
      text: "AI 工具箱"

  # 测试关系推测功能
  - tapOn:
      id: "relation_parser_card"
  - waitForAnimationToEnd

  # 输入关系描述
  - inputText:
      id: "relation_input"
      text: "张三是李四的父亲"

  # 点击解析按钮
  - tapOn:
      text: "开始解析"
  - waitForAnimationToEnd

  # 验证解析结果
  - assertVisible:
      text: "识别到的成员"

  # 确认添加
  - tapOn:
      text: "确认添加"
  - waitForAnimationToEnd

  # 验证添加成功
  - assertVisible:
      text: "成功"

  - stopApp
```

### 7.4 Maestro测试套件配置

```yaml
# maestro/flows/regression_suite.yml
name: 回归测试套件
tags:
  - regression

include:
  - flow: family_tree_basic.yml
  - flow: member_crud.yml
  - flow: collaboration_test.yml
  - flow: timeline_test.yml
  - flow: ai_features_test.yml

parallel: false
continueOnFailure: false
```

### 7.5 执行Maestro测试

```bash
# 执行单个测试
maestro test maestro/family_tree_basic.yml

# 执行测试套件
maestro test maestro/flows/regression_suite.yml

# 在指定平台执行
maestro test maestro/ --platform ios
maestro test maestro/ --platform android

# 生成HTML报告
maestro test maestro/ --report MaestroReport
```

## 八、Detox自动化测试脚本

### 8.1 Detox简介

Detox是Facebook开源的灰度盒移动端E2E测试框架，使用JavaScript/TypeScript编写，与React Native深度集成。

### 8.2 安装配置

```bash
# 初始化Detox配置
detox init

# 安装依赖
npm install detox --save-dev
npm install @types/jest --save-dev

# iOS构建测试App
detox build --configuration ios.sim.release

# Android构建测试App
detox build --configuration android.emu.release
```

### 8.3 核心测试脚本

#### 8.3.1 Detox配置

```typescript
// detox.config.ts
import type { DetoxConfig } from 'detox';

export default {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  artifacts: {
    plugins: {
      uiHierarchy: 'enabled',
      screenshots: 'todo',
      videos: 'record-failure',
    },
  },
  configurations: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/FamilyTree.app',
      build: 'xcodebuild -workspace ios/FamilyTree.xcworkspace -scheme FamilyTree -configuration Debug -sdk iphonesimulator',
      device: {
        type: 'iPhone 14',
      },
    },
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug && cd ..',
      device: {
        avdName: 'Pixel_5_API_33',
      },
    },
  },
} satisfies DetoxConfig;
```

#### 8.3.2 家族树基础测试

```typescript
// e2e/src/familyTree.test.ts
import { describe, it, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { expect } from 'detox';

describe('家族树基础功能', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('应该正确加载家族树页面', async () => {
    await expect(element(by.text('家族树'))).toBeVisible();
    
    await element(by.text('家族树')).tap();
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
  });

  it('应该正确显示成员节点', async () => {
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('member_node_0')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.id('member_node_0'))).toBeVisible();
  });

  it('应该响应节点点击事件', async () => {
    await element(by.text('成员')).tap();
    
    await element(by.id('member_item_0')).tap();
    
    await waitFor(element(by.text('编辑')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('编辑'))).toBeVisible();
  });

  it('应该支持缩放操作', async () => {
    await element(by.text('家族树')).tap();
    
    await element(by.id('family_tree_container'))
      .pinch(0.5);
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
  });
});
```

#### 8.3.3 成员CRUD测试

```typescript
// e2e/src/memberCrud.test.ts
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { expect } from 'detox';

describe('成员增删改查', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('应该成功添加新成员', async () => {
    await element(by.text('成员')).tap();
    await element(by.id('add_member_button')).tap();
    
    await element(by.id('name_input')).typeText('测试成员');
    await element(by.id('gender_male')).tap();
    await element(by.id('birth_date_input')).typeText('1990-01-01');
    await element(by.text('保存')).tap();
    
    await waitFor(element(by.text('添加成功')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.text('测试成员'))).toBeVisible();
  });

  it('应该成功编辑成员', async () => {
    await element(by.text('成员')).tap();
    await element(by.id('member_item_0')).tap();
    await element(by.text('编辑')).tap();
    
    await element(by.id('name_input')).clearText();
    await element(by.id('name_input')).typeText('修改后的姓名');
    await element(by.text('保存')).tap();
    
    await waitFor(element(by.text('更新成功')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('应该正确验证必填字段', async () => {
    await element(by.text('成员')).tap();
    await element(by.id('add_member_button')).tap();
    
    await element(by.text('保存')).tap();
    
    await expect(element(by.text('姓名不能为空'))).toBeVisible();
  });

  it('应该成功删除成员', async () => {
    await element(by.text('成员')).tap();
    await element(by.id('member_item_0')).tap();
    await element(by.text('删除')).tap();
    await element(by.text('确认')).tap();
    
    await waitFor(element(by.text('删除成功')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

#### 8.3.4 性能测试（200节点）

```typescript
// e2e/src/performance200.test.ts
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { expect } from 'detox';

describe('200节点性能测试', () => {
  beforeAll(async () => {
    await device.launchApp();
    // 准备200节点测试数据
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('200节点首屏渲染时间应小于3秒', async () => {
    const startTime = Date.now();
    
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(10000);
    
    const renderTime = Date.now() - startTime;
    console.log(`渲染时间: ${renderTime}ms`);
    
    expect(renderTime).toBeLessThan(3000);
  });

  it('200节点滑动帧率应大于等于50FPS', async () => {
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 执行滑动操作
    for (let i = 0; i < 10; i++) {
      await element(by.id('family_tree_container'))
        .scroll('down', 0.5);
    }
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
  });

  it('缩放操作应流畅无卡顿', async () => {
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(5000);
    
    await element(by.id('family_tree_container'))
      .pinch(2.0);
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(2000);
  });
});
```

#### 8.3.5 异常情况测试

```typescript
// e2e/src/errorHandling.test.ts
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { expect } from 'detox';

describe('异常情况处理', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('网络断开时应显示友好提示', async () => {
    // 模拟网络断开
    await device.setOrientation('portrait');
    
    await element(by.text('成员')).tap();
    
    await waitFor(element(by.text('网络连接已断开')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('网络连接已断开'))).toBeVisible();
  });

  it('服务不可用时应显示重试选项', async () => {
    await element(by.text('成员')).tap();
    
    await waitFor(element(by.text('服务暂时不可用')))
      .toBeVisible()
      .withTimeout(5000);
    
    await expect(element(by.text('重试'))).toBeVisible();
  });

  it('超时后应显示重试按钮', async () => {
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.text('请求超时')))
      .toBeVisible()
      .withTimeout(30000);
    
    await expect(element(by.text('重试'))).toBeVisible();
  });
});
```

#### 8.3.6 兼容性测试

```typescript
// e2e/src/compatibility.test.ts
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { expect } from 'detox';

describe('设备兼容性测试', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('应正确适配小屏设备', async () => {
    await device.setOrientation('portrait');
    await element(by.text('家族树')).tap();
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
    await expect(element(by.text('家族树'))).toBeVisible();
  });

  it('应正确适配横屏', async () => {
    await device.setOrientation('landscape');
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
  });

  it('平板设备应充分利用屏幕空间', async () => {
    // 模拟平板尺寸
    await device.setOrientation('landscape');
    await element(by.text('家族树')).tap();
    
    await waitFor(element(by.id('family_tree_container')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.id('family_tree_container'))).toBeVisible();
  });
});
```

### 8.4 执行Detox测试

```bash
# 执行所有测试
detox test

# 执行指定测试文件
detox test e2e/src/familyTree.test.ts

# 指定平台执行
detox test --configuration ios.sim.debug
detox test --configuration android.emu.debug

# 生成报告
detox test --record-videos all
```

### 8.5 测试报告配置

```javascript
// e2e/jest.config.js
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  reporters: ['default', 'jest-junit'],
  setupFilesAfterEnv: ['./e2e/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
};
```

## 九、测试数据准备

### 9.1 200节点测试数据生成

```javascript
// scripts/generate-test-data.js
const fs = require('fs');

function generateTestData() {
  const members = [];
  const relations = [];
  
  // 生成3代家族数据
  // 第1代：2人（祖父母）
  // 第2代：4人（父母+配偶）
  // 第3代：194人（子辈及后代）
  
  // 第1代
  const grandfatherId = 'gen1_p1';
  const grandmotherId = 'gen1_p2';
  
  members.push({
    id: grandfatherId,
    name: `祖辈1_${grandfatherId}`,
    gender: 'male',
    birth_date: '1940-01-01',
    is_alive: false,
  });
  
  members.push({
    id: grandmotherId,
    name: `祖辈2_${grandmotherId}`,
    gender: 'female',
    birth_date: '1945-01-01',
    is_alive: true,
  });
  
  // 第2代
  const gen2Ids = [];
  for (let i = 0; i < 4; i++) {
    const id = `gen2_p${i}`;
    gen2Ids.push(id);
    members.push({
      id,
      name: `父辈${i}_${id}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      birth_date: `1970-0${i+1}-01`,
      is_alive: true,
      parent_id: grandfatherId,
      mother_id: grandmotherId,
    });
  }
  
  // 第3代
  let gen3Count = 0;
  gen2Ids.forEach((parentId) => {
    for (let i = 0; i < 48; i++) {
      const id = `gen3_p${gen3Count}`;
      gen3Count++;
      members.push({
        id,
        name: `子辈${gen3Count}_${id}`,
        gender: gen3Count % 2 === 0 ? 'male' : 'female',
        birth_date: `200${gen3Count % 10}-0${(gen3Count % 12) + 1}-15`,
        is_alive: true,
        parent_id: parentId,
      });
      
      if (gen3Count >= 194) break;
    }
  });
  
  return { members, relations };
}

const data = generateTestData();
fs.writeFileSync('test-data-200.json', JSON.stringify(data, null, 2));
console.log(`生成完成：${data.members.length} 个成员`);
```

### 9.2 测试数据导入

```bash
# 使用Maestro导入测试数据
maestro test maestro/import_test_data.yml

# 使用curl直接调用API
curl -X POST https://your-api.com/import \
  -H "Content-Type: application/json" \
  -d @test-data-200.json
```

## 十、持续集成配置

### 10.1 GitHub Actions配置

```yaml
# .github/workflows/regression.yml
name: Regression Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  maestro-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Maestro
        run: |
          curl -s "https://get.maidroid.io" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH
      
      - name: Build iOS
        run: |
          xcodebuild -workspace ios/FamilyTree.xcworkspace \
            -scheme FamilyTree \
            -configuration Debug \
            -sdk iphonesimulator \
            -derivedDataPath ios/build
      
      - name: Run Maestro Tests
        run: |
          maestro test maestro/flows/regression_suite.yml \
            --platform ios \
            --report MaestroReport
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: maestro-report
          path: MaestroReport/

  detox-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build Android
        run: cd android && ./gradlew assembleDebug && cd ..
      
      - name: Run Detox Tests
        run: |
          npx detox test \
            --configuration android.emu.release \
            --record-videos all
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: detox-report
          path: detox-artifacts/
```

---

**文档版本：** 1.0
**创建日期：** 2026-05-13
**最后更新：** 2026-05-13
**维护人：** 测试团队
