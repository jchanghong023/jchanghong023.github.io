# 研发工具中文文档站

面向同事的 OMP、OmpCode 和 JchTools 使用指南，发布到 <https://jchanghong023.github.io/>。使用与参考页面相同的 VitePress 2.0.0-alpha.20 默认主题，不自造主题、不加载外部字体或统计脚本。此版本是为了对齐参考站而明确固定的预发布版，不应误称为稳定版。

## 环境与维护命令

需要 Node.js 22.14 或更高版本与 npm。依赖版本在 package.json 中固定，package-lock.json 必须随修改提交；已有锁文件时使用：

```sh
npm ci
npm run dev
```

发布前集中执行：

```sh
npm run format
npm run verify
```

verify 依次执行格式检查、文档与覆盖检查、真实 VitePress 生产构建、全部构建页和本地资源/锚点检查。它只验证网站，不执行三个产品的安装、模型或桌面测试。不忽略 VitePress 死链，不设置内容字数阈值。

首次维护一个尚无锁文件的空克隆时，先运行一次 npm install 生成锁文件并提交；后续本地与 CI 都通过 npm ci 使用同一锁。升级固定版本时重新生成锁并完成同样的网站验证，不能只改 manifest。

## 来源复核

权威站点合同是 requirements/website.md。docs/ 下三个项目的 coverage.json 维护页面与来源的唯一映射，默认主题侧栏和覆盖页直接读取这些数据。不另维护项目页清单。

普通 check 无需访问源仓库，适合公开 CI。需要复核实际原文时，将下列环境变量设为各项目的**需求目录**，运行：

```sh
node scripts/check-docs.mjs --omp-source "$OMP_REQUIREMENTS" --ompcode-source "$OMPCODE_REQUIREMENTS" --jchtools-source "$JCHTOOLS_REQUIREMENTS"
```

该命令只读原文，复核 36 份来源的 SHA-256、围栏外全部 ATX 标题和词法需求编号；修订号是读取时源仓库 HEAD，工作树快照可能含未提交修改。不能为使校验通过而删除来源、章节或编号，也不能把需求原文整份复制到公开站点。Windows PowerShell 使用同名的 $env:OMP_REQUIREMENTS 等环境变量。

## 检查实际服务

构建后在一个终端运行 npm run preview，另一个终端执行：

```sh
npm run check:site -- --site-url http://localhost:4173/
```

脚本逐一获取本次构建的全部输出文件，要求 HTTP 成功并逐字节匹配；HTML 页面、链接、资源和锚点也必须完整解析。部署后可对已发布的**同一构建产物**使用 https://jchanghong023.github.io/ 作为 --site-url。若本地构建与 CI 构建不一致，先下载该次 Pages artifact 通过 --directory 指定，再做在线逐字节检查，不能把不同构建误判为同一快照。

真实浏览器仍需检查桌面与窄屏目录、三栏布局、中文本地搜索、主题切换、代码复制以及三个项目的代表页面；静态检查不冒充浏览器交互验收。

## 发布

.github/workflows/pages.yml 在 main 推送或手动触发时执行 npm ci、npm run verify，再上传 docs/.vitepress/dist 并部署官方 GitHub Pages。仓库 Pages 的 Source 应设为 GitHub Actions；站点 base 固定为 /，不是仓库名子路径。

工作流中的 actions 使用核对过的完整提交 SHA。发布成功须确认当次 workflow 和 Pages deployment 成功，再核对实际线上页面与资源；仅推送成功不是部署成功。全部网站源码、合同、校验脚本及锁文件都应上传到本仓库，源产品仓库只读。
