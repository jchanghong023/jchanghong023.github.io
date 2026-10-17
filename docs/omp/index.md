# OMP：终端里的研发 Agent {#overview}

OMP 用自然语言任务驱动模型、代码检索、文件编辑和工具执行。本指南介绍 [jchanghong023/oh-my-pi](https://github.com/jchanghong023/oh-my-pi) 这个持续跟踪上游的 Fork，不是上游安装指南，也不是个人作品集。

## 先选择入口 {#choose-entry}

| 你的需求                                             | 建议入口               | 下一步                                |
| ---------------------------------------------------- | ---------------------- | ------------------------------------- |
| 在项目终端中读代码、改代码、运行命令                 | OMP 原生 TUI           | [安装与第一轮任务](./getting-started) |
| 希望用桌面窗口、多会话和图形输入框                   | OmpCode，以 OMP 为核心 | [OmpCode 文档](/ompcode/)             |
| 使用本地工具箱、截图 OCR、文件整理或提供独立模型服务 | JchTools               | [JchTools 文档](/jchtools/)           |
| 在无公网环境使用已有模型代理与本地资料               | OMP offline            | [环境与数据安全](./offline-shm)       |

“零配置”是不要求默认用户手工编写 OMP 配置文件，不代表没有模型认证、服务连通性或项目权限前提。OMP 的 TUI、offline 和 OmpCode 集成共用核心，但各自的 GUI、模型、平台验收不能互相替代。

## 按任务查文档 {#guide-map}

- [安装与快速开始](./getting-started)：正确下载来源、Windows/Linux、认证、首次会话和安全停止。
- [Fork 功能与日常操作](./fork)：profile、模型角色、共享 Skill、Wiki、显示、worktree、循环与个人命令。
- [1016 默认行为](./defaults-1016)：主目录会话与 OTLP 默认关闭。
- [Linux offline、备份与人工恢复](./offline-shm)：shm 数据、十分钟备份、丢失风险与恢复步骤。
- [Team 只读方案讨论](./team)：独立调查、交叉审查、阻断问题和方案选择。
- [Goal 无人值守目标](./goal-autopilot)：授权、预算、暂停、压缩恢复和取消边界。
- [Repo 代码定位](./repo-index)：先确认建库，再定位文本与 Python 定义。
- [OmpCode/RPC 接入](./rpc-ui-protocol)：消息隔离、命令、Plan、Loop、模型与 role。
- [审查材料导出](./code-review-export)：不调用模型的本地 ZIP，以及原字节无脱敏风险。

## 如何理解验证状态 {#status-boundaries}

本站是源需求的派生使用指南，不是产品测试报告。来源覆盖表示相关章节已被解释，并不表示其中的产品行为已在本次建站中验证。完整来源、SHA-256、源码 HEAD 与章节映射见本目录的 `coverage.json`。

[源需求索引](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/README.md) 保存各批次的实际证据。它同时包含不同源码、不同平台、真实模型与 localhost 模型替身的历史记录，不能把这些结果拼成“当前全平台验收通过”。本指南使用的来源是带有未提交改动的工作树；Release 版本也不一定包含全部来源变更。

当前应特别保留以下边界：

- Linux offline 的 CentOS 专项被匹配 native addon、离线依赖前置阻塞；真实周期备份、恢复、NFS、多机与 CentOS 3.10 内核未完整验收。Windows 备份历史还保留 EPERM 失败，不能因其他批次通过而抹掉。
- Wiki/Repo 的本地真实数据库、CLI 或 TUI 证据，不代表公司语料规模性能、真实模型检索质量或 NFS 共写安全。Repo 旧解析器产生的误报定义需显式重建；Wiki 已有错误章节边界需显式重新导入。
- Team 有真实 GPT-6 Luna 的两个受控场景证据，不代表任意项目方案正确、公司网关可用或真实模型取消已验收。
- Goal 的追加输入、持久历史、压缩和协议证据分别绑定原源码；WebSocket 前缀兼容不等于实际缓存命中、账单优惠或 GUI 联调。
- RPC 局部协议通过不代表 OmpCode GUI 全流程通过；共享 Skill 的本地显示与调用不代表共享文件系统多机验收。
- 安装器、系统代理、TLS、CodeAgent 的局部或合成认证证据，不代表真实企业服务或所有 PowerShell/平台组合可用。清理失败的外层非零退出仍然是非零退出。
- 源码门禁只检查 fork-affected 范围，不等于全部上游、独立 SDK、真实模型、桌面输入或独立发布已验收。WSL2 测试不是 CentOS 7 物理机测试。

## 来源与维护 {#sources}

行为权威始终是 [源仓库需求目录](https://github.com/jchanghong023/oh-my-pi/tree/main/docs-zh-CN/requirements)，安装另参考 [根 README](https://github.com/jchanghong023/oh-my-pi/blob/main/README.md)、[内网快速指南](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/quick-start-intranet.md) 和实际安装器。本页对应需求索引的定位与验证边界，不转载测试日志、私有路径或内部服务地址。发现版本差异时，应先核对 `omp --version` 和所用 Release，而非假定工作树需求已经随包发布。
