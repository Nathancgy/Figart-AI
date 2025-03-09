# FigArt AI Frontend

这是 FigArt AI 的前端代码，使用纯 HTML、CSS 和 JavaScript 构建。

## 目录结构

```
frontend/
├── css/                # CSS 样式文件
│   ├── styles.css      # 全局样式
│   ├── home.css        # 首页样式
│   ├── community.css   # 社区页面样式
│   └── auth.css        # 认证页面样式
├── js/                 # JavaScript 文件
│   ├── auth.js         # 认证相关功能
│   ├── config.js       # 配置和工具函数
│   ├── community.js    # 社区页面功能
│   ├── home.js         # 首页功能
│   ├── login.js        # 登录页面功能
│   └── register.js     # 注册页面功能
├── images/             # 图片资源
├── index.html          # 首页
├── community.html      # 社区页面
├── login.html          # 登录页面
├── register.html       # 注册页面
├── tutorial.html       # 教程页面
├── terms.html          # 使用条款
├── privacy.html        # 隐私政策
└── forgot-password.html # 忘记密码页面
```

## 部署说明

1. 将整个 `frontend` 目录放置在 Nginx 或其他 Web 服务器的根目录下
2. 确保 API 服务器在 `/api` 路径下可访问，或修改 `js/config.js` 中的 `API_BASE_URL` 变量

## 开发说明

### 添加新页面

1. 创建新的 HTML 文件
2. 引入必要的 CSS 和 JavaScript 文件
3. 使用与现有页面相同的页面结构（导航栏、页脚等）

### 修改 API 端点

所有 API 端点配置都在 `js/config.js` 文件中，修改 `API_BASE_URL` 变量可以更改 API 服务器地址。

### 图片资源

将网站使用的图片放在 `images` 目录下。首页背景图片应命名为 `index.jpg`。

## 浏览器兼容性

本前端代码兼容所有现代浏览器，包括：

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

版权所有 © 2024 FigArt AI 