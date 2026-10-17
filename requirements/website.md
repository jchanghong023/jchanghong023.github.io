# 同事研发工具文档站需求

## 目标与范围

网站发布于 https://jchanghong023.github.io/ ，仓库为 jchanghong023/jchanghong023.github.io。面向同事阅读、安装和使用工具，不是个人作品集或营销站。

使用 VitePress 默认主题，对齐 https://vitepress.dev/zh/guide/getting-started 的布局与交互：中文导航、左侧目录、正文、右侧页内目录、搜索、明暗主题、代码复制、移动端目录。不另造主题，不添加统计追踪或外部字体。

网站完整覆盖下列三个项目的现行需求。将需求改写成可操作的功能说明、安装/首次使用、边界、错误处理及验收说明，不能只列标题或指向源仓库。保留取消、不支持、规划和未验证的边界，不把需求定义当作已经实现或已经验收。

## 内容权威与公开边界

- OMP：jchanghong023/oh-my-pi 的 docs-zh-CN/requirements/；安装说明同时核对根 README.md、docs-zh-CN/quick-start-intranet.md 和安装脚本。
- OmpCode：jchanghong023/OmpCode 的 docs/requirements/；本地源码目录名称 forkZcode 不是产品名称，GitHub CLI 默认选择的上游 zai-org/ZCode 不是下载来源。
- JchTools：jchanghong023/JchTools 的 docs/requirements/；安装说明核对根 README.md 与发布打包说明。
- 三个源码仓库只读，不修改、提交或部署它们。当前未提交源码改动不作为产品验收通过的证据。
- 这是公开站点。不得复制企业内部域名、IP、共享盘地址、真实凭据、用户名路径、内网资产或芯片项目资料。相关行为用通用说明表达，必须通过管理员获取的具体值不伪造。公开 GitHub 地址、回环示例、标准环境变量名称及不含真实密文的配置键可以保留。
- 不发布原始需求副本；源项目保持需求唯一权威。本站维护面向使用者的派生指南和可追溯覆盖表。

## 页面与数据接口

站点源码位于 docs/。三个独占内容目录为 docs/omp/、docs/ompcode/、docs/jchtools/。每个目录必须有 index.md、getting-started.md 和 coverage.json。其他页面采用源文档的小写 ASCII 名称，OMP 新增需求1016.md 使用 defaults-1016.md；不使用中文 URL。

所有 Markdown 使用 VitePress 默认布局，不使用 layout: home。内容使用明确中文标题、可复制命令和适量提示块；危险删除、推送、令牌及后台服务操作须明确作用范围和前置条件。不要执行文档中的软件操作、真实模型调用、桌面输入、安装或产品测试。源文档的历史测试结果只作为历史边界说明，不能宣称本次网站工作验证了产品。

coverage.json 的唯一结构：

```json
{
  "project": "omp",
  "label": "OMP",
  "repository": "https://github.com/jchanghong023/oh-my-pi",
  "revision": "40-character source HEAD",
  "sourceState": "working-tree",
  "pages": [
    { "text": "概览", "link": "/omp/" },
    { "text": "安装与快速开始", "link": "/omp/getting-started" }
  ],
  "sources": [
    {
      "file": "README.md",
      "sha256": "64-character hash of source bytes",
      "page": "/omp/",
      "headings": [
        { "source": "exact source heading text", "target": "/omp/#overview" }
      ],
      "ids": ["requirement IDs from this source, if any"]
    }
  ]
}
```

sources[].file 相对于各项目需求目录；包括 README.md。headings 必须覆盖源文档中围栏外的全部 ATX 标题（去掉行首 # 和末尾可选 #，保留其余文字），每个 target 指向实际页面的显式 ASCII 标题锚点（例如 `## 使用边界 {#boundaries}`）。可以多个源章节映射到同一有实质说明的章节，但不能所有章节统一映射到首页。ids 收录源文档所有形如 H-01、XB-27、CA-08、Z01 的需求编号；编号在派生页面保留可检索的追溯索引。pages 列出该项目的全部内容页，供导航与验证共用。

站点全局配置从三个 coverage.json 读取侧栏，不维护第二份项目页清单。全局覆盖页面展示所有来源及对应站内页面，并明确是来源覆盖而非产品功能验收。站点校验脚本必须检查来源清单、页面存在、全部站内链接/锚点、孤立页面、公开内容敏感数据边界，并能在显式传入三个源码目录时复核原始 headings/ids/hash。CI 不依赖本机源码路径。

## 必须覆盖的需求文件

### OMP（9 份，含索引）

- README.md
- fork.md
- 新增需求1016.md
- offline-shm.md
- team.md
- goal-autopilot.md
- repo-index.md
- rpc-ui-protocol.md
- code-review-export.md

### OmpCode（16 份，含索引）

- README.md
- FORK.md
- omp-core-integration.md
- omp-native-commands.md
- models-and-commands.md
- composer.md
- skills.md
- integrations.md
- agent-interactions.md
- session-recovery.md
- performance.md
- centos7-release.md
- centos7-performance.md
- logging.md
- test-gates.md
- e2e.md

### JchTools（11 份，含索引）

- README.md
- CONTRACT.md
- RECURSIVE-EXTRACT.md
- DIRECTORY-ORGANIZER.md
- MD-TOOLS.md
- GIT-TOOLS.md
- ALL2MARKDOWN.md
- SNAP2TEXT.md
- XBERG-INFERENCE.md
- ACP-MODEL-SERVICE.md
- CODEAGENT.md

## 验收与发布

依赖版本固定并提交锁文件。使用实际 VitePress 构建，不忽略死链。集中执行格式、文档校验与生产构建；使用真实浏览器检查桌面和窄屏布局、导航、主题、搜索、复制及三个项目的代表页面，并对全部页面做 HTTP 与锚点校验。

只提交网站仓库，推送 main，启用 GitHub Pages 的 Actions 构建发布。确认本次部署 workflow 成功及实际线上页面、资源、导航与搜索可用后交付。线上部署证据与本地网站验证不代表 OMP/OmpCode/JchTools 产品已被本次重新测试。
