# Profile、角色模型与离线数据 {#overview}

## 选择运行 Profile {#profiles}

OmpCode 不再使用 ZCode 账号、套餐与供应商目录。模型和凭据来自当前 OMP 根/Profile；旧 Provider Registry 为空不应阻止核心启动，无可用模型时由 OMP 返回真实错误。

在「设置 → 模型设置」选 Profile 并保存，**完全退出重启后生效**，不会热切换正在运行的会话。待重启时角色编辑器禁止写旧 Profile。CentOS 启动器显式 `--profile` 覆盖本次 App Settings 选择。检查「运行与备份」中的运行 Profile，不要把待重启选择当本次运行值。

## 保存角色，或仅临时切换 {#roles}

设置页及会话「管理模型」共用角色编辑器；显示全部内建角色及已配置自定义角色，无配置也不应整页空白。内建角色包括 default、smol、slow、vision、plan、commit、tiny、memory、task、advisor、image、web、speech、dictation、judge。候选只来自 OMP，不提供新增供应商或模型操作。

1. 选择目标 role 的模型和支持的思考档，等待该角色自动保存。
2. 确认保存成功后重开读回；保存中、失败或修订冲突要分别看待，不用固定等待代替成功状态。
3. 模型变化时，原思考档仍支持则保留，否则采用新模型缺省；「自动」保存 auto，「未配置」删除该 role 的持久字段。
4. 仅影响本会话下一次提交时，改[输入工具栏](./composer)，不要修改长期角色。

每个 role 有独立 revision，保存冲突保留待选值，重新读取后再决定，不覆盖外部修改。仅本地旧核**永久缺失**角色能力时才可回落 YAML；暂不可用不回落，远端缺能力也不能写本机文件。回落修改前备份已有文件，只改目标角色，保留其他字段/注释；无效 YAML 或失败应报错，不创建虚假成功备份。

命令目录同样由 OMP 提供：`/model`、`/switch`、`/rename`、`/mcp`、`/usage`、`/compact` 与技能热更新进入输入候选；状态回投改变真实标题/模型。参数补全的 UTF-16 区间和过期结果不能互相覆盖。

## 配置根与任务隔离 {#roots}

| 输入或数据        | 规则                                                               |
| ----------------- | ------------------------------------------------------------------ |
| `OMP_CONFIG_ROOT` | 有效绝对路径优先，支持 `~` 展开；空值/相对值忽略                   |
| `PI_CONFIG_DIR`   | 新变量无效时沿 OMP 旧解析规则回落；不改变应用持久根                |
| OMP 默认根        | `~/.omp`；profile、会话和配置均按同一根解析                        |
| OmpCode 默认根    | `~/.ompcode`；有效新根时为 `<OMP_CONFIG_ROOT>_ompcode`             |
| 应用目录          | 设置、日志、索引位于活动根 `v2`；覆盖根下 Electron 位于 `electron` |
| 项目级配置        | 项目 `.omp/` 不随用户根改变                                        |

目录界面是只读说明，不是迁移器。修改启动环境后完全重启，不自动移动、复制或删除已有数据。任务索引按有效 OMP 原始根和运行 Profile 分库；切换到空根不应显示旧 UUID，切回原根后原分组、置顶、归档、未读等应仍在。Web/远端不以本机路径冒充目标配置。

## Linux offline 的活动根 {#offline}

仅 Linux 且 `OMP_OFFLINE` 去空白后为 `1`、`true`、`yes`、`on`（忽略大小写）时启用 shm；Windows 与普通模式不创建 shm 或备份调度。环境值原样传给 OMP，不改成已取消的 `--offline` 参数。模型可见性由 OMP 判断，不维护第二份过滤目录。

OMP 与 OmpCode 使用按主机、UID、原始根的 SHA-256 身份隔离的私有 `/dev/shm` 活动域，两个产品分别拥有数据。配置变量仍指向原始持久根，不能手动替换为 shm 路径。活动目录须当前用户所有、0700，不跟随外来符号链接；shm 不可用/空间不足应明确失败，没有 `/tmp`、`/local` 等磁盘回退，不需要 sudo 或改 Swap。

启动只初始化本机活动目录，**不扫描、回源、预热或自动恢复 NFS 备份**。已有 shm 直接用；空 shm 是新环境。项目源码、安装文件、共享技能、外部认证和项目配置仍在原位置，不能据此宣称没有网络盘 I/O 或 tmpfs 绝不落盘。

## 十分钟异步备份与手工恢复 {#backup}

本机前台真实就绪满十分钟后，Main 才首次调度独立 Worker，之后每十分钟触发。跨进程同域只允许一轮，重叠合并；OMP 备份由 OMP 自己做，OmpCode 不重复备份。退出停止 Worker，不等 NFS，不做最后同步，所以最近成功备份后的数据可能丢失，持续失败可能超过十分钟。

备份保存 manifest、当前及上一完整版本，SQLite 用在线一致快照，不直接复制 WAL/活动数据库。普通文件最多四槽有界处理，首错停止接纳，已打开句柄收口后清理；完成并校验后必要目录自底向上同步再发布。失败保留旧完整版本，不清空原持久数据。

浏览器保存的是 localStorage 和持久 Cookie 的**逻辑导出**，不是活动 LevelDB、完整 Chromium profile、第三方站点 IndexedDB 或全局事务快照。相同 session/origin 只导出一次；代表窗口失效或出现未覆盖存储域时不得发布不完整版本。

人工恢复的安全顺序：

1. 停止相关 OMP/OmpCode 进程，确认目标根/Profile 和私有域，不覆盖仍在写入的活动数据。
2. 按 manifest 选择完整版本，在保留权限的前提下，把 `data/` 中应用文件复制到对应私有 shm 活动根；不要覆盖原始持久备份。
3. 浏览器 sidecar 需通过 Chromium 对应 origin/分区 API 人工导入 localStorage/Cookie；单纯复制 JSON 不会恢复浏览器状态。
4. 重开后检查实际 Profile、文件和会话。产品没有自动导入或恢复命令，不能拿 OMP 备份混作应用备份。

## 运行与备份页怎么看 {#status}

设置的独立「运行与备份」显示本次 Main 的 Profile、活动/原始根、周期、最近尝试/成功、下次触发、安全错误码及阶段：

- disabled：未启用；waiting：等待周期；running：正在备份。
- completed：本轮成功；busy：别的进程占用 lease，**不是成功**；failed：失败但保留上次成功时间。

页面只读内存事实，不枚举 NFS、manifest 或目录大小；刷新/重开不立即备份，也不提供立即备份、改路径或恢复按钮。时间只反映本次运行，未知应显示未知；下次时间是触发点，不保证执行成功。Web 无本机能力时明确不可用。

## 证据与限制 {#evidence}

源记录包含 Windows 路径、SQLite/Worker、隐藏 Electron 及状态页定向验证，但真实 Linux shm/NFS、十分钟墙钟等待、完整人工恢复和匹配内嵌 OMP 的 CentOS 链路仍有未验证范围。本地 OMP 源码实现不等于 Release 资产已同步，不能据此承诺下载包具备所有新存储行为。本站未测试产品。

<details><summary>词法追溯</summary>

`SHA-256`、`UTF-16` 是原文技术标识，并非新增验收通过声明。

</details>

来源：[模型与命令需求](https://github.com/jchanghong023/OmpCode/blob/main/docs/requirements/models-and-commands.md)。
