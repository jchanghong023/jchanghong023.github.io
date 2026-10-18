# 研发工具简明指南

面向同事的中文网站：OMP 入门，Team、Wiki、Repo 三个独立企业核心指南，其他 Fork 改动与黄区 CodeAgent 使用，以及 forkZcode（OmpCode）内网启动、JchTools 功能、JCH 技能目录。发布于 <https://jchanghong023.github.io/>，使用 VitePress 默认主题。

## 本地维护

需要 Node.js ≥22.14 与 npm，依赖精确版本及锁文件保持不变。

```sh
npm ci
npm run dev
```

需求见 `requirements/website.md`；内容在 `docs/`，导航与侧栏共用 `scripts/site-data.mjs` 的页面清单。Team、Wiki、Repo 各自维护完整使用指南；原 Fork 自有功能页只保留它们的入口，继续介绍 Goal、显示、红区 shm 和其他改动优化。黄区 CodeAgent 页单独说明下载和认证流程，快速指南保持简短，不恢复整份需求镜像或测试历史。

更新技能目录时，逐项读取 JCH 的 `skills/jch-*/SKILL.md` 与 `skills/dft-*/SKILL.md`，每个技能独立列出名称、功能及场景。不要执行技能或修改源仓库。可核对完整名称清单：

```sh
node scripts/check-docs.mjs --skills-source /path/to/jch/skills
```

## 验证

```sh
npm run format
npm run verify
```

`verify` 集中检查格式、页面导航、站内链接与锚点、技能条目、公开内容边界，执行生产构建并校验全部生成页和资源。CI 无需访问本机源项目；未传 `--skills-source` 时不宣称已重新核对技能源目录。网站验证不运行产品、模型或桌面测试。

构建后启动 `npm run preview`，真实浏览器检查本次新增或变更页面、桌面与窄屏导航、中文搜索和命令显示；未变页面复用既有结果。另可逐一核对 HTTP 服务的全部产物：

```sh
npm run check:site -- --site-url http://localhost:4173/
```

该检查要求本次构建的页面和资源逐字节一致。线上核对时若 CI 构建与本地不同，应使用该次 Pages artifact，而不是混合两次构建的证据。

## 发布

只提交网站仓库并推送 `main`。现有 `.github/workflows/pages.yml` 执行锁定依赖安装、`npm run verify` 与 GitHub Pages 发布，Source 为 GitHub Actions，base 为 `/`。交付前确认该次 workflow、部署及线上页面成功；不能仅凭推送成功宣称发布完成。
