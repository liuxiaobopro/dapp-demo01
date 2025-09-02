# MetaMask 账户管理器

一个基于 Vue 3 + Vite + Tailwind CSS 构建的 MetaMask 账户管理应用，提供完整的钱包账户查看、管理和转账功能。

## 功能特性

- 🔗 **MetaMask 连接**: 安全连接和管理 MetaMask 钱包
- 👥 **多账户管理**: 查看和管理所有 MetaMask 账户
- 💰 **实时余额监控**: 自动监控账户余额变化
- 🔄 **转账功能**: 支持 ETH 转账和交易历史查看
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代化 UI**: 基于 Tailwind CSS 的美观界面
- 🔍 **调试工具**: 内置调试信息查看功能

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Font Awesome** - 图标库
- **MetaMask API** - 以太坊钱包集成

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── NavBar.vue      # 导航栏
│   ├── MobileMenu.vue  # 移动端菜单
│   ├── ConnectionPanel.vue  # 连接状态面板
│   ├── AccountsSection.vue  # 账户列表
│   ├── AccountDetails.vue   # 账户详情
│   ├── NoConnectionPrompt.vue  # 未连接提示
│   ├── TransferModal.vue     # 转账模态框
│   ├── Notification.vue      # 通知组件
│   └── Footer.vue           # 页脚
├── composables/        # Vue 组合式 API
│   ├── useMetaMask.js  # MetaMask 相关逻辑
│   └── useNotification.js  # 通知功能
├── App.vue            # 主应用组件
├── main.js           # 应用入口
└── style.css         # 全局样式
```

## 安装和运行

### 前置要求

- Node.js 16+ 
- MetaMask 浏览器扩展

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用说明

1. **安装 MetaMask**: 确保浏览器已安装 MetaMask 扩展
2. **连接钱包**: 点击"连接钱包"按钮授权访问
3. **查看账户**: 浏览所有账户及其余额信息
4. **选择账户**: 点击账户卡片查看详细信息
5. **转账功能**: 使用转账按钮发送 ETH
6. **查看历史**: 查看转账历史记录

## 主要功能

### 账户管理
- 显示所有 MetaMask 账户
- 实时余额更新
- 账户详情查看
- 地址复制功能

### 转账功能
- ETH 转账
- Gas 费用估算
- 交易状态跟踪
- 转账历史记录

### 网络支持
- 以太坊主网
- 测试网络 (Ropsten, Rinkeby, Goerli, Kovan)
- Polygon 网络
- Avalanche 网络
- 自定义网络

## 安全说明

- 所有操作均在本地进行，不会上传任何私钥或敏感信息
- 使用 MetaMask 官方 API，确保安全性
- 支持所有 MetaMask 支持的网络

## 开发说明

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/composables/` 中添加相关逻辑
3. 在 `App.vue` 中集成新功能

### 样式定制

- 修改 `tailwind.config.js` 自定义主题
- 在 `src/style.css` 中添加全局样式
- 使用 Tailwind 类名进行组件样式定制

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 MetaMask 连接和账户管理
- 实现转账功能和历史记录
- 响应式设计和现代化 UI