# 灵瑞集·桌灵档案馆

五位来自灵瑞集的守护灵宠，通过观察你的桌面空间与生活痕迹，陪伴你完成一次关于习惯、情绪与成长的灵居探索之旅。

## 功能特性

- 🏠 **空间整理功能**：70%科学收纳建议 + 30%灵居气息建议
- 🧠 **心理人格分析**：固定主人格 + 动态副人格
- 🐱 **灵宠叙事陪伴**：五位守护灵宠的情感递进与成长记录
- 🔒 **隐私保护**：纯前端架构，数据仅存Session，关闭浏览器即清除

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3
- **动画库**：Framer Motion
- **状态管理**：Zustand
- **路由**：React Router 6

## 快速开始

### 1. 安装依赖

由于系统限制，请在命令行中手动执行：

```bash
cd c:\Users\HONOR\Desktop\lingrui-spirit-archive
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写API密钥：

```bash
copy .env.example .env
```

编辑 `.env` 文件：

```env
VITE_QWEN_API_KEY=your_qwen_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm run preview
```

## 项目结构

```
lingrui-spirit-archive/
├── src/
│   ├── components/      # 公共组件
│   ├── pages/           # 页面组件
│   ├── store/           # 状态管理
│   ├── types/           # TypeScript类型定义
│   ├── constants/       # 常量配置
│   ├── styles/          # 全局样式
│   ├── App.tsx          # 应用入口
│   └── main.tsx         # 主入口
├── public/              # 静态资源
├── .trae/documents/     # 产品文档
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 五灵宠系统

| 灵宠名称 | 核心职责 | 关注物品 | 心理映射 |
|---------|---------|---------|---------|
| 智慧灵 | 专注力、学习能力 | 书籍、电脑、工作区 | 思维过载、认知专注度 |
| 活力灵 | 行动力、执行力 | ToDo便签、项目材料 | 拖延症、行动能量 |
| 治愈灵 | 情绪状态、共情 | 收藏物、照片、潮玩 | 心理防线、自我疗愈 |
| 奇想灵 | 创造力、灵感 | 手办、草稿纸、灵感碎片 | 精神内耗、创意活跃度 |
| 守护灵 | 安全感、作息 | 药品、水杯、睡眠痕迹 | 亚健康信号、作息规律 |

## 核心流程

1. **上传桌面照片** → 拍摄或上传桌面照片
2. **AI视觉分析** → Qwen-VL-Plus识别物品和布局
3. **三轮对话** → DeepSeek-V4-Flash进行心理探寻
4. **观察记录** → 证据链推理 + 整理建议
5. **结果展示** → 守护灵共鸣图 + 人格标签
6. **分享对比** → 下载卡片 / 好友PK

## 注意事项

- 本项目为纯前端应用，无需后端服务器
- AI API密钥需要用户自行申请和配置
- 所有数据仅存储在Session中，关闭浏览器后自动清除
- 项目已完整实现UI和交互逻辑，AI集成部分需要配置真实API密钥

## 开发文档

详细的产品需求和技术架构文档位于：
- [产品需求文档](.trae/documents/prd.md)
- [技术架构文档](.trae/documents/tech-architecture.md)

## License

MIT