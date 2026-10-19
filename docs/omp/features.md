# OMP Fork 自有功能 {#features}

这里保留无人值守、显示模式、红区运行及其他 Fork 改动与优化；第一次使用请看[中文快速指南](/omp/)。

企业核心功能已独立介绍：[Team 讨论方案](/omp/team) · [Wiki 查资料](/omp/wiki) · [Repo 找代码](/omp/repo)。

## 无人值守 Goal {#goal}

适合夜间修复、批量改造等目标明确的长任务。`/goal-autopilot` 在上游 Goal 基础上加入编排和无人值守指令，让 Agent 自主调查、规划、分工、执行和验证；上下文成功压缩后，会重新带回完整目标和编排规则。

**调用意味着授权完成该目标所需的操作，包括修改文件、运行命令、Git 提交与推送。先限定仓库、任务范围和验收标准，再启动。**

在 OMP 输入框中发送：

```text
/goal-autopilot 修复当前仓库已确认的缺陷，保留无关改动，按项目规则验证，完成后报告结果。
```

- 查看、暂停、继续：`/goal-autopilot show`、`/goal-autopilot pause`、`/goal-autopilot resume`。
- 运行中仍可追加要求、停止或取消；缺凭据、必需信息或强制审批时会报告受阻，不绕过限制。
- 复用 Goal 的预算与续跑设置，不保证永不停止或任何任务都能完成；`resume` 不会把普通 Goal 变成无人值守模式。

## 三档显示模式 {#display}

只改变终端呈现，不改变模型、权限或工具执行。默认紧凑，切换立即生效并按 Profile 保存。

- **干净：** `/display clean`，隐藏思考正文及模型工具活动，专注对话。
- **紧凑：** `/display compact`，显示最新三行实时思考；普通工具压成摘要，较早调用汇总计数，真实文件修改保留预览和 diff。
- **详细：** `/display detailed`，查看工具调用和结果，方便排错；主聊天不重播历史思考，原始思考可经显式历史查看器阅读。

直接输入 `/display` 可循环切换。紧凑模式也会汇总失败次数和后台完成通知，突出进行中、阻塞的 Todo；折叠不删除原始记录，排错时切回详细模式。

## 红区 shm 与性能优化 {#performance}

面向受限内网，重点优化 **OMP 自身数据 I/O、检索、流式渲染与多进程读取**，不是只调一个开关。

### Linux 红区：内存运行，后台备份 {#shm}

红区启动必须同时设置 `OMP_OFFLINE=1` 和 `OMP_CONFIG_ROOT`。Linux 会将会话、Wiki、日志、缓存等 OMP 自有运行数据放在 `/dev/shm`，减少对持久目录的同步读写；启动不搬运旧数据，也不等待 NFS 备份。`OMP_CONFIG_ROOT` 指定原始持久目录，前台就绪后才开始计时，每 10 分钟异步备份一次。

**项目源码、EDA 工作区和外部输入不自动迁移；Repo 数据库允许与 NFS 项目共置，不要求迁入 shm。** 这不是把所有文件访问变成内存访问。

::: warning 内存运行不等于无损持久化
首次备份要等就绪满 10 分钟；退出不做最终同步，重启或清理 shm 后不会自动恢复。最近成功备份之后的数据可能丢失，恢复需人工选择完整备份。仅 Linux offline 生效，不修改挂载或 Swap；内网模式也不等于断网沙箱。
:::

### 其他优化落在哪些环节 {#optimizations}

- **Wiki 检索内核迁至 Rust：** 解析、全文检索、排序、分页和证据组织由原生内核承接；复用同一快照的完整排名，避免续页反复全库扫描与排序。
- **多进程数据库读取：** Wiki 使用 SQLite 内存映射，由操作系统共享同一数据库的文件页；不是每个 Agent 各复制一份大堆缓存，也不是整机内存上限保证。
- **Repo 增量维护：** 查询不必每次遍历源树，已知变更按路径更新；完整核对仍需读取文件，不跳过一致性检查。
- **流式界面合批：** 正文与工具参数更新按 50ms 窗口合并，思考尾窗复用增量排版；减少重复处理与滚屏，不改变模型推理速度。
- **内网文件补全：** 未显式配置时，`@` 文件补全的目录重扫间隔采用 30 秒，减少反复扫描；用户设置优先，不影响普通联网模式。
- **工具说明按需加载：** Wiki、Repo 可通过设备入口按需读取说明，不必始终把完整工具 schema 放在顶层；只读权限和独立查询并发语义保持。

**性能取决于语料、磁盘、NFS、终端和模型。** 不承诺所有场景全面提速；Wiki 成功查询按当前契约至少耗时 500ms，不能把它说成“500ms 内响应”。公司实网、CentOS 与 NFS 的效果需在对应环境单独测量。

## 其他日常增强 {#more}

- **内网模型适配：** `OMP_OFFLINE` 下复用公司现有模型配置，按角色提供默认选路，不要求再手写一套 OMP 凭据；不覆盖用户显式选择。
- **黄区 CodeAgent：** Windows 下通过 JchTools 自动维护本地登录 Token，再由 OMP 直连内置模型；见[下载与使用步骤](/omp/codeagent)，不使用红区 offline 模式。
- **团队技能共享：** `OMP_SKILLS_DIR` 接入统一技能目录，支持查看 Shared 来源和启停，不复制或同步技能源文件。
- **简体中文 TUI：** 主要设置、选择、问答与授权界面使用中文，保留必要技术名词。
- **循环与任务指令：** 增强 `/loop` 的轮次间隔，提供便于输入的编排命令与新增 `fullsend` 关键词；上游已有的编排能力不是本 Fork 从零重做。
- **审查材料导出：** `/code-review-export` 将冻结 diff、变更前后源码及审查指令打成本地 ZIP，不调用模型；材料含原始源码，交给其他 Agent 前先核对可分享范围。
- **图形端接入：** 扩展 RPC 对接 OmpCode 的会话、命令、技能、Goal 和 Team，图形入口见 [forkZcode](/ompcode/)。

## 来源与适用版本 {#sources}

本文按当前 [Fork 需求](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/fork.md)、[Goal](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/goal-autopilot.md)、[Team](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/team.md)、[Repo](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/repo-index.md) 和 [shm](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/offline-shm.md) 整理。功能及验证状态以源码仓库为准，不代表每个旧安装包都已包含，也不代表本次网站更新重新验证了产品或真实模型效果。
