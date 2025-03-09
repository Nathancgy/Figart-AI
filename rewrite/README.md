# FigArt AI

FigArt AI 是一个摄影社区平台，让摄影小白也能拍出好图。

## 项目结构

```
rewrite/
├── api/                # 后端 API 服务
│   ├── backend.py      # 数据库模型和操作
│   ├── api_main.py     # API 端点定义
│   ├── settings.py     # 配置文件
│   ├── Dockerfile      # 后端 Docker 配置
│   └── requirements.txt # Python 依赖
├── frontend/           # 前端代码
│   ├── css/            # CSS 样式文件
│   ├── js/             # JavaScript 文件
│   ├── images/         # 图片资源
│   ├── *.html          # HTML 页面
│   ├── Dockerfile      # 前端 Docker 配置
│   └── nginx.conf      # Nginx 配置
└── docker-compose.yml  # Docker Compose 配置
```

## 功能特点

- 用户注册和登录
- 照片上传和分享
- 社区浏览和互动（点赞、评论）
- 摄影教程和资源

## 技术栈

- **前端**：纯 HTML、CSS 和 JavaScript
- **后端**：FastAPI (Python)
- **数据库**：SQLite
- **部署**：Docker 和 Nginx

## 快速开始

### 前提条件

- Docker 和 Docker Compose
- Git

### 安装步骤

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/figart-ai.git
cd figart-ai/rewrite
```

2. 启动应用：

```bash
docker-compose up -d
```

3. 访问应用：

打开浏览器，访问 `http://localhost`

## 开发指南

### 后端开发

1. 安装 Python 依赖：

```bash
cd api
pip install -r requirements.txt
```

2. 运行开发服务器：

```bash
python api_main.py
```

### 前端开发

前端使用纯 HTML、CSS 和 JavaScript，可以直接在浏览器中打开 HTML 文件进行开发。

## 部署

项目使用 Docker Compose 进行部署，配置文件为 `docker-compose.yml`。

### 环境变量

- `SECRET_KEY`：用于 JWT 加密的密钥

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

版权所有 © 2024 FigArt AI 