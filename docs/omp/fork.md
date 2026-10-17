# Fork 功能与日常操作 {#fork}

本页把 [Fork 差异需求](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/fork.md) 改写为使用说明。维护目标是持续同步上游、保留本地功能与默认值，不把个人分发能力理解为企业级 SLA。入口是原生 TUI、offline 和 [OmpCode 图形界面](/ompcode/)；“零配置文件”仍要求服务与认证已就绪。

## 上游基线与版本关系 {#upstream}

来源记录的同步基线是 `can1357/oh-my-pi@main`、`v18.11.3`、提交 `58195a453b8627421f1119a60586e3c17d76a27e`，同步日期为 2026-10-17。它不是本站查询到的公开 Release 版本，也不是当前源码完整验收。源码 HEAD、字节哈希和工作树状态另见 `coverage.json`。

维护者优先采用上游等价实现，移除重复补丁和回归，不永久保留全部历史修复。剩余适配涉及 Windows 管道/取消、RPC 重入、归档缓存、cksum 边界、路径删除、shell TERM 清理、平台内存入口、GitHub 元数据失败传播和开发环境忽略配置，用于避免挂起、错读、误删和伪成功，不形成额外用户命令。上游已接纳的租约权限、归档独占复制、hashed 会话迁移和指数数值边界目标继续有效。Wiki 工具文档登记也需随同步保留。

## profile、数据根与模型角色 {#profiles}

系统终端：

```sh
omp -P work
omp --profile work -c
```

`-P` 大写选择 profile，`-p` 小写为 print。profile 隔离认证、会话、设置、缓存和索引，不共享聊天。`OMP_CONFIG_ROOT` 是统一原始数据根，绝对路径、支持 `~`；相对或无效值回到上游默认解析，同时设 `PI_CONFIG_DIR` 时以前者为准。项目级 `.omp/` 不迁移，旧数据不自动搬运。Wiki 不再有独立数据根入口，不要沿用旧专用变量或期待兼容迁移。Linux offline 的实际运行/备份根见 [shm 指南](./offline-shm)。

`Ctrl+T`、`/switch` 临时切当前会话模型，`/model` 管理角色：`default/task/vision/advisor/smol/tiny/commit/plan/slow`。筛选、认证和可用范围沿用上游，无 Fork 专有硬排除。OmpCode 的保存与冲突见 [RPC 模型配置](./rpc-ui-protocol#models)。

Codex 压缩候选默认替换为可用的 `openai-codex/gpt-6-luna`；不可用保留原候选，不阻断回退。显式 `compactionModel` 优先。Luna 用于本地摘要、handoff、短摘要和 V2 流式服务器压缩时固定推理 `low`，不继承会话 high/max/Off；主模型正常使用和其他 Provider 不变。

## offline 模型与工具范围 {#offline-models}

`OMP_OFFLINE` 的 `1/true/yes/on` 启用 offline（忽略大小写和首尾空白），无对应 CLI 开关。该进程才注册保留的 `company` Provider；普通启动显式选它会提示需要 offline。`models.yml` 同名段忽略并提示，不能覆盖内置通道。

启动一次性读取 Claude Code 配置目录的 `settings.json`，只在内存缓存 `env.ANTHROPIC_BASE_URL` 与 `env.ANTHROPIC_AUTH_TOKEN`，成功失败都缓存；修改后重启。默认 `~/.claude`，可由 `CLAUDE_CONFIG_DIR` 覆盖。聊天用已有地址的 Anthropic Messages/Bearer，不探测或回退厂家公网。缺配置、坏 JSON、字段错误明确提示但不泄露凭据。

| 聊天模型 ID                | 输入       | 目录上下文 | 最大输出 |
| -------------------------- | ---------- | ---------: | -------: |
| `DeepSeek-V4-Flash-public` | 文本       |  1,000,000 |   81,920 |
| `GLM-5.2-public`           | 文本       |  1,000,000 |   81,920 |
| `MiniMax-M2.7`             | 文本       |    204,800 |   81,920 |
| `Qwen3.6-27B-public`       | 文本、图片 |    262,144 |   81,920 |
| `Qwen3.6-35B-A3B`          | 文本、图片 |    262,144 |   81,920 |
| `Qwen3.8-27B`              | 文本、图片 |    262,144 |   81,920 |

实际 offline 启动把所有 company 聊天上下文覆盖为 **200000**，输出不变。未配置的 `default/task/vision/advisor` 临时用 `company/Qwen3.8-27B`，`smol/tiny/commit` 用 `company/Qwen3.6-35B-A3B`，`plan/slow` 用 `company/GLM-5.2-public`。显式角色（含 null）及 CLI 参数优先，不写文件、不锁定公司模型；保存 preset 不复制隐式角色默认值。

offline 临时关闭 `web_search.enabled/browser.enabled/astEdit.enabled/fetch.enabled`，关闭自动版本、市场、changelog 和后台模型发现；恢复、scope 预解析、同进程子代理自动发现也只读缓存。已装插件、缓存模型、本地文件、bash/eval、LSP、Git 等保持既有能力与审批。显式模型解析、手动刷新、更新和 `/changelog` 沿用原行为。它不是操作系统网络沙箱，公司 API、usage 仍可能真实联网。未设 `FS_SCAN_CACHE_TTL_MS` 时给 `@` 补全设30000ms，显式0也优先。

```sh
omp models
omp read "./README.md"
omp read "./diagram.png?q=解释图中的模块关系"
omp render --plain
omp dry-balance --model company/Qwen3.8-27B
omp usage
```

`omp bench <selector…>` 解析同一 company lane，但真实调用模型。cache-only 仅限制目录发现，不禁模型请求。普通本地 read、已有会话 render 不要求公司配置；图片问答真实调用 vision。显式且可解析的非 company vision/default 仍可用，公司配置错误可见但不阻断它；需要 company 而配置坏时失败，不隐式回退。usage 没有新增 company 额度接口。

Python Eval 与业务 Python 分开：要求3.8+，显式 `python.interpreter` 优先，错误不回退。仅 Linux 且 offline **恰为字面量1** 时，自动候选前尝试组织预置 Python 3.11.4；缺失/不兼容才继续原候选。内部安装路径请向管理员核对，不在公开站展示。不改主进程 PATH、venv 或业务3.6，不安装包、扫描软件目录。其他真值不插入该候选。

Mnemopi 已开启且无显式向量配置时，默认文本嵌入 `Qwen3-VL-Embedding-2B`，复用内存认证，不因此启用记忆。显式模型/地址/密钥/variant 优先；自定义通用 `OPENROUTER_BASE_URL` 或真值 `MNEMOPI_EMBEDDINGS_VIA_API` 也让位给通用路由，不发送公司 Token 到其他地址。官方网关只认 `openrouter.ai`、`www.openrouter.ai`。按原路径前缀补 `/v1/embeddings`，已有/v1不重复。检索目录还有 `Qwen3-VL-Reranker-2B`，不含8B；图片向量和远端 Reranker 尚未接入。

## 个人 Skill 与 Shared 来源 {#skills}

默认 `skills.enableCodexUser=true`，发现 `~/.codex/skills/*/SKILL.md`，但不连带开启该目录 MCP/hooks/commands/规则。同名优先级原本沿用上游。

启动前可设 `OMP_SKILLS_DIR`，加载一层 `<根>/<技能名>/SKILL.md`，与 offline 无关，不下载/复制/同步。共享同名版本获得裸名，内容不同的其他版本保留 namespace；空值或目录不存在保持原发现。

`/extensions` 查看 Shared、裸名与 namespace。禁用项、关闭来源和诊断在管理侧仍可见；执行侧扫描前过滤关闭来源，禁用项不可调用。启用后等异步刷新，再从 `/skill:` 补全调用。面板按当前宿主会话配置，不取其他会话绑定；启停不改共享源文件，不增加 NFS 写入/同步。

## Wiki：导入后只查数据库 {#wiki}

先准备有权使用的 Markdown，PDF/Office 可先 [用 JchTools 转换](/jchtools/)。附件、图片和链接目标不随文字入库。终端和会话要使用同一数据根/profile/offline：

```sh
omp -P work docs init "/path/to/markdown" --name "team-docs"
```

同名不覆盖，全部成功才公开索引。`/wiki` 可列出索引、n新建、d确认删除；维护**只有 init/remove**，无 list/status/update/rebuild。删除只动库不删源文件。资料更新先确认新导出可读，再删除和重新导入；失败不自动还原已删索引：

```sh
omp -P work docs remove "team-docs" --force
omp -P work docs init "/path/to/markdown" --name "team-docs"
```

面板选索引后 `/` 相关性搜索，`g` 正则，Enter看正文、b回列表、n续页；长正文可折行/滚动到尾，方向键、PgUp/PgDn、Home/End 可用。忙时 c/Esc直接取消，关闭也取消；续页失败保留当前证据。

AI 的只读 wiki 默认查所有已导入索引，参数 query，可选 mode/case/cursor。search 用 FTS5/BM25，普通问题即可，无布尔/引号/通配符语法。技术主题、词组和本节标题优先；完整名称保留标点、忽略大小写。`match=exact-name` 才是完整名称，`related` 不等价，更长名称的部分字串不能冒充完整命中；无完整名称会明确提示。

显式 grep 才使用 Rust/PCRE2 正则，case默认true。逐原始行扫描数据库，不提供跨行、布尔查询或精确次数；非法正则不自动修成字面量。grep超过500 UTF-16单元报错，保留首尾空格；search超过500字符截断并回显有效query，续页用有效值。给AI的参数示例，不是终端命令：

```json
{ "query": "--timeout" }
```

```json
{ "query": "^ERROR|timeout$", "mode": "grep", "case": false }
```

续页原样传query/mode/有效case及返回cursor。cursor绑定范围和数据库版本，重开而版本未变可继续，导入/删除变化则报过期，不假零命中。每页约8000字符、最多200节，首节超预算仍完整；入库章节上限18000字符。同页重复长正文可引用已完整文字，但每来源都可达，跨页重给完整文字。读到明确耗尽才算遍历完成。

0 matches只说明已导入语料无匹配，不证明无规范。缺query、无索引、坏cursor/库仍报错。导入后正文/查询/引用均DB-only，源目录移走仍可查，不检查新鲜度或自动同步。引用保留索引名、路径、导入行号、文档SHA-256、sectionId；后者可能被remove/init复用，不能独作永久身份。

Rust内核负责解析、迁移、快照、全文排名/缓存和证据，无TS算法回退；缓存按真实快照失效，容量淘汰整查询而非尾部证据。默认请求最多500MiB SQLite mmap，是映射范围而非内存硬上限/提速承诺。导入租约绑定实际数据库身份，换库不能误回收其他构建。保留代码围栏、CRLF、真实行号和有意义的技术标题/仅标题条目，不把代码标题拆节。旧库可从存储原文修复全文投影，但已有错误章节边界要用户remove/init重切。

**成功搜索对外不少于500ms**，含续页和零命中，不是响应上限。真实工作不足时可取消异步补足，错误/取消立即返回，等待不占事务。日志分别记工作/等待/总耗时，不能拿下限或局部基准宣称提速。

默认非受限会话 `tools.xdev=true` 时先 `read xd://wiki` 看schema，再 `write xd://wiki` 传JSON，repo同理；xdev关闭仍顶层提供。设备查询审批独立，未设不继承write的deny/ask，可共享并发；普通文件写仍按原审批/独占规则。非受限显式read清单自动附wiki/repo，受限Team清单不扩大。

## 工具与模式如何选择 {#tools-and-modes}

[Repo](./repo-index) 定位当前源码和Python定义，Wiki查导入资料。Repo命中先读当前文件，Wiki直接引用数据库正文；穷尽文本用grep，文件名用glob，语义引用用可用LSP，结构修改看AST设备。JSON参数解析失败保留错误，说明本次未执行，让模型修正后重发，不放宽校验或重放已成功调用。

[Team](./team) 只读讨论，[Goal](./goal-autopilot) 无人值守执行，[审查导出](./code-review-export) 只生成本地材料，[RPC](./rpc-ui-protocol) 接入OmpCode，不另造业务规则。

`/ultrathink` 深入分析、`/orchestrate` 拆分委派、`/workflowz` 分阶段、`/fullsend` 优先速度与验证质量，均可直接带正文。正文独立小写词也触发，代码块/行内代码/XML/HTML不触发。上游另有jevify关键词，勿猜同名新增命令。fullsend不扩大目标/权限，不以额外花费为目标；有收益才并行，这是提示词策略非调度保证。`magicKeywords.fullsend`默认true，可在settings的Interaction/Magic Keywords关闭。orchestrate依赖task，workflowz依赖task/eval及相关设置。

## 批处理与个人命令 {#jch-commands}

```text
/jch-workflowzbatch 20 4 只读审查当前项目指定模块，按证据汇总问题，不修改文件。
```

两个正安全整数分别为任务块软目标、包含嵌套的并发上限指令，正文非空；展开普通workflowz用户消息，保留内部空白，不写全局配置。配置上限更低时遵守较低值，不凑数量，并发数不决定拆分数。主代理分配不重叠文件、完成即补位、协调跨界，不默认重审全部改动。

该批处理的主代理及全部层级子代理**禁止所有测试、冒烟、E2E、全仓格式/静态检查和三级门禁**，只可对自己修改的文件做能准确限定范围的非测试检查。禁止项也不能收尾补跑；须传递同一执行/验证限制、报告运行时未验证。这是提示词要求，不是机械工具拦截，与Goal模式不同。

| 命令                              | 作用                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `/jchdiagnose`                    | 只读诊断根因与边界                                                              |
| `/jchfix`                         | 最小修复，不提交推送                                                            |
| `/jchfuncreview uncommitted`      | 独立只读功能审查                                                                |
| `/jchverify uncommitted`          | 只读验证指定修改可交付性                                                        |
| `/jchfuncreviewfix uncommitted`   | 审查后最小修复                                                                  |
| 上述三项 `commit <ref>`           | 指定提交；review/verify另可path路径，reviewfix另可repo全仓；空参/非法verb先报错 |
| `/jchci`                          | 只读分析HEAD/PR的Actions                                                        |
| `/jchcifix`                       | 修CI并提交、普通推送相关修改；必要时仅触发已有workflow_dispatch且ref指已推分支  |
| `/jchcatchup`、`/jchcatchup full` | 本地状态/提交，full深入远端差异                                                 |
| `/jchgs`                          | fetch全部远端后显示状态                                                         |
| `/jchgitpull`                     | 按当前upstream/pull配置pull，会改工作树                                         |
| `/jchdftexplain <对象>`           | 面向DFT新手只读解释，核对术语引用，不执行脚本/EDA流程                           |

::: danger 无确认的全仓丢弃
`/jchgitdiscardall [--ignored=true|false]` 在TUI无确认执行fetch/prune、reset hard到当前分支跟踪目标、clean整个仓库。默认/false保留ignored，true连ignored一起清除；从子目录发起也影响全树。它不是回退对话，不是故障排查建议。先独立保全需要的数据，非法/重复参数在Git前拒绝，步骤失败即停。ACP/RPC拒绝派发；print/SDK无内置派发时文本进入模型，不能当机械安全入口。
:::

## Loop次数、间隔与暂停 {#loop}

```text
/loop 10 30s 检查指定任务状态并汇总新变化
/loop 10m 30s 检查指定任务状态并汇总新变化
```

有位置间隔时首轮立即执行，数字次数包含首轮；上例最多十轮或总共十分钟，等待计入总时长。只在有效限制参数后识别完整秒/分/时/组合时长，正文不再解析。旧用法 `/loop 10 任务` 无间隔仍是首次之后再十次，即最多十一轮。条件`--while/--until`及prompt/compact/reset沿用上游。

每轮结束后等完整间隔，不重叠提交。Esc/停止暂停重复，下一用户提示可恢复，再次/loop关闭；切换/关闭会话取消旧定时器、条件进程和待提交。loop启用时不同时自动提交Goal续跑。

## 工作树与待办 {#worktree-and-todo}

`/wt [分支名]`、`/worktree`只切当前会话目录，不新建聊天。已有分支有worktree就复用，无worktree就检出该分支自身提交；目标就是当前分支则不动，新分支从当前HEAD建。新目录与当前会话目录平级，不用全局worktree根；冲突选可用路径不覆盖，已有树不搬家。

源目录staged/unstaged/untracked/删除状态全保留，新建树不带这些内容；不自动stash/commit/reset/clean。复用目标也保留其自身改动。运行中限制、迁移和退出继续上游，不扩到task/PR工作树入口。

`/clear`清上下文时，整份当前TODO全为completed/abandoned才即时持久清空清单；含任一pending/in_progress/blocked就保留整份，包括完成项、阶段和阻塞说明。清空不删历史、不改会话ID/模型/目录/设置，重启/重新展开不复活。

## 显示、中文界面与快捷键 {#display}

`/display [clean|compact|detailed]`不调用模型，无参clean→compact→detailed循环，默认compact。非法参数不改值，选择即时刷新且存当前profile；高优先级覆盖阻止完整生效时提示实际状态/来源，不谎称已切换。

| 档位     | 思考                                                     | 工具                                                           |
| -------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| clean    | 隐藏，只留忙碌                                           | 隐藏调用/结果                                                  |
| compact  | 当前会话唯一实时尾窗，最新五个屏幕行；高度不足20行时三行 | 每调用一行，最近三次成功，其余计数折叠；运行中/失败/待确认保留 |
| detailed | 主界面不重放思考，原文经显式历史查看器读                 | 原详情可展开折叠                                               |

尾窗在TODO及输入区上方，思考结束而工具运行时收为一行存根；正文开始/取消/错误/结束/新轮/切会话清空。它不是scrollback，后台代理不抢占。空白压缩、主题强调、默认开启的proseOnlyThinking过滤只改显示不裁历史；窄屏/组合字素/Tab/ANSI按宽度安全处理。160ms宿主spinner、50ms message_update合并是显示节流，不是执行限速。

compact中Ctrl+O不泄露参数/输出/diff/图片/LSP正文，切detailed恢复。失败摘要原因优先，工具段不跨普通正文合并；无真实计时不造耗时。手工shell/Python运行组件及输出保留。助手普通进度仍显示，不承诺只剩最终答案。

主要TUI欢迎、输入、完整设置、常用选择/问答/授权和计划弹窗简体中文；技术名、命令、配置键、协议值、模型、原错误保留。不是全产品翻译，不翻Skill/系统提示/schema/真实输出或所有后台面板。

Shift+Tab计划、Ctrl+T临时模型、Alt+P当前思考、Shift+F1推理档位；/hotkeys查绑定。空输入框有排队/历史/目标/检索帮助，输入后隐藏，窄屏换行且框内留空行。回退对话不撤销文件修改。

状态栏左组默认`pi/model/mode/collab/stream/path/git/subagents/token_rate/cache_hit/context_pct/time_spent`，右组空，powerline-thin分隔；费用/账号额度/主机名等不是默认项。Git文本如`git main · 改动5`，计staged/unstaged/untracked文件并集，不重复、不含ignored。路径上限40，实际拥挤才左截断，释放宽度再分配；嵌入上下文`ctx 3% · 500K`，未知只容量，超过100%显示真实比例。band按上游省略溢出项，其余可换行；custom可自定义，临时后台徽章不因右组空关闭。Match terminal保留已选深色，只映射浅色light。

## 默认值与提问超时 {#defaults}

| 设置                                          | 默认                                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| recap.enabled                                 | false                                                    |
| debug.enabled / ida.enabled / archive.enabled | false，显式开启优先                                      |
| ask.timeout                                   | 60秒，0关闭，Plan关闭超时                                |
| startup.setupWizard                           | false，显式--setup仍可用                                 |
| statusLine.compactThinkingLevel               | false                                                    |
| composer.shape                                | box                                                      |
| theme.dark / 浅色                             | dark-terminal / light                                    |
| display.showTurnTime                          | true                                                     |
| task.enableLsp                                | true，但遵守父会话禁用/计划限制                          |
| error.notify                                  | on，取决终端支持                                         |
| mnemopi.embeddingVariant                      | multilingual                                             |
| stt.language                                  | zh-CN，Whisper/云端归一化zh，parakeet/sherpa不用语言参数 |

主目录与遥测见[1016默认值](./defaults-1016)。ask超时只有当前启用、执行中且带autopilot标记的Goal才返回明确自动回复，将原目标内调查/实施/验证/修复交回主模型，不代选具体选项；暂停/完成/预算限制不适用。普通Goal/其他场景沿用上游已有回答、推荐项/首项等选择规则，不注固定授权。手动选择/备注/取消保留。cfg://审批受同一超时约束，未回答仍拒绝写，不能扩成全部审批通过。

## Windows CodeAgent与远端Agent {#remote-agent}

Windows非offline才内置`codeagent/DeepSeek-V4-Flash-0731-CodeAgent`，其他平台/模式隐藏。目录为reasoning/tools、context200000、maxTokens32768，OpenAI-compatible completions且禁strict工具模式。企业固定服务地址不公开，不据此保证可达。models.yml的providers.codeagent为保留段，忽略提示，坏段不拖垮其他Provider。

启动从当前用户注册表`HKCU\Environment\JCH_CODEAGENT3_X_AUTH_TOKEN`读取内存，发送x-auth-token，不靠进程环境快照，不写配置/日志。失败才重读；新Token不同、尚无文本/思考/工具输出、未取消才最多重试一次。相同Token不重试，已流输出禁止重放，摘要/handoff不得借外层回退绕过。注册表失败不清已有缓存。维护方见[JchTools](/jchtools/)，勿公开Token。

Windows默认只读探测当前用户/登录会话JchTools管道，身份/能力/状态匹配且就绪才GET /v1/models真实端点，注册`jchtools/<ID>`。不猜端口、写配置、启动/重启服务或改默认模型。禁用provider或`OMP_JCHTOOLS_DISCOVERY=0`关闭当前进程发现，子Agent继承防递归。启动/模型选择器刷新重发现，实例/端口变化撤销旧地址，不重放任务。

选择该provider是“后端Agent执行”，非前端工具循环。不注OMP system、工具schema、Skill、子代理规则、魔法通知或Goal生成授权/提醒，不执行前端工具。只传真实用户原文、明确背景/约束及完整可见用户/助手文本；用户自己写的system/developer/scout不被关键词清洗。本地历史可保留通知，不等于可传后端。媒体不支持。

任务slash原文送后端，不执行同名本地extension/custom/file template/Skill；本地管理命令仍由宿主消费不重放。每请求独立cwd取当前任务绝对存在目录，辅助角色同样取所属任务/工作树目录，不猜、不改全局cwd。

成功响应保存X-JchTools-Session-ID，后续发完整投影历史供校验新增部分；关联只内存。新建/分支、目录/地址变化、离开远端清关联。session_unavailable或已发HTTP/ACP后取消也清，下一次用户显式请求新建，不自动重试/回退/重放。其他HTTP错误不随意清、不采错误/迟到头。SSE中断保留已收文本并报错，不造前端工具事件；元数据占位非后端容量承诺。

## 代理、TLS与发行维护 {#network}

Windows主进程fetch优先请求显式proxy（`PI_PROXY_<PROVIDER>`/`PI_PROXY`）→HTTPS_PROXY/HTTP_PROXY/ALL_PROXY→HKCU系统静态代理→直连。系统每进程读一次，支持http/https分协议，不支持PAC/WPAD或socks-only；NO_PROXY、回环和内部绕行清单约束系统层，显式/环境层用各自NO_PROXY。Linux无此Windows回退，服务Worker不经主进程链。本站不列内部域/IP清单，分流问题向管理员核对。

无显式值默认NODE_TLS_REJECT_UNAUTHORIZED=0、GIT_SSL_NO_VERIFY=true，显式1/false恢复严格，agent .env先于默认。此姿态可能被中间人截获凭据，不是普遍安全建议。安装器自身放宽TLS，版本一致不是证书/密码学来源认证。

安装命令见[快速开始](./getting-started)。同目录唯一临时下载，校验可启动/精确版本后替换；同版跳下载仍查PATH。Linux原子mv，Windows先唯一重命名旧映像，失败才按精确路径终止；换入失败回滚，保留验证过下载。PATH失败是部分完成，按打印的恢复命令处理，目标目录联网前拒绝，勿盲删数据。

Release +fork.N来自手动main工作流计数，默认只构建artifact，明确发布才Release；CI只编译/打包/发布，不验收，同步不自动发布。工作流文件改名会重置编号并可能撞tag，维护时须保持。发布不推npm/Homebrew，平台见快速开始。native CI跳宿主加载探针不等于本地跳验证；缓存按平台/配置/源码复用，缺缓存正常冷编译。

本地构建可无fork后缀但更新仍指本Fork；update先比SemVer再比同基线计数，无后缀计0，不降级较高基线。元数据/资产优先环境令牌、gh认证、最后匿名；TTY有下载进度，PATH冲突警告。canary应改stable，古老-fork.N更新器需重装。

## 诊断日志与安全反馈 {#diagnostics}

复用上游logger，由数据根/profile及适用XDG规则解析`logs/omp.<日期>.<PID>.log`。每进程独占新文件，同PID重用加后缀，不续写旧日志；按既有日期/大小轮转保留。单行含时区毫秒时间/level/PID、事件/阶段/elapsed_ms，用operation/request/job/goal/session/tool-call标识关联。

INFO关键起止/状态，WARN可恢复降级，ERROR失败，DEBUG额外细节。正常取消、服务缺席、预期拒绝不冒充故障。排查需区分RPC取消/超时/abort/断连，会话主文件和附件部分清理，Team持久化和UI，Repo未核对，company cache-only目录发现与真实API阶段。

不应记录Token、Authorization/Cookie、认证URL/敏感查询、用户任务、提示词、源码/文档/响应正文。反馈前仍审查必要片段，不上传整个数据根。日志写失败用户级回退，Linux offline仍只在运行根，最终stderr有界提示，不掩盖业务结果。

## 源码维护验证与证明范围 {#validation}

以下是维护者入口，不是安装后使用要求，本站不执行：

| 入口              | 覆盖                                                        | 非编译/总墙钟上限 |
| ----------------- | ----------------------------------------------------------- | ----------------- |
| bun run fastcheck | 静态/格式/类型/编译，无测试                                 | 非编译90秒        |
| bun run fulltest  | fastcheck+fork TS、affected Rust、脚本、native、隔离dev-TUI | 900/900秒         |
| bun run slowtest  | fulltest一次+适用Ubuntu-24.04 WSL2                          | 1500/1500秒       |

full/slow每次明确授权，不能直接内部阶段绕过；门禁不push、不触发/等待CI或发布，不接管共享鼠标/前台。WSL经网络Git远端固定完整SHA到原生工作区，不复制快照/挂载树绕过，未提交/未推送不能测旧提交冒充。无兼容WSL和不适用分别跳过，缺工具/错误不降级跳过，不自动装环境。

统一单调时钟只扣观测纯编译，混合保守计费；准备/网络/同步/等待/报告/清理计时，full/slow总墙钟含编译收尾。首错立即停止自有全部进程树，不等afterAll/报告I/O；到限非零并保留首错。独立安全阶段并行，保留增量缓存和配置，不造冷样本。预期能力探针非零与正式编译失败分开，后者仍即时上报。

报告status/total/compile_excluded/budgeted/limit、退出码、两端源码指纹。scope=fork-affected基于全部Fork差异/依赖而非白名单，不是全仓PASS。完整上游TS、独立SDK/Python、实网模型、发布/桌面输入不自动包含。独占runs/test-timing报告可能partial，失败时临时complete/0不算通过；JUnit时间和非挂钟，WSL报告留Linux不能拿宿主XML冒充两端。

历史与未验收项见[源索引](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/README.md)和[本站证据边界](./index#status-boundaries)。文档覆盖、静态、模型替身、受控真实模型及产品完整验收是不同层次。

## 来源词项追溯 {#traceability}

<details>
<summary>源章节关联标识与技术名称</summary>

远端Agent边界对应JchTools的AH-03、AH-05、AH-13；具体后端行为以其需求为准，不在OMP重复实现。Wiki技术名称检索还以E123、ERR-123等为例，保持完整名称边界。SHA-256指文档/源码指纹，UTF-16指grep表达式长度单位；这些技术词的词法收录不把它们变成产品验收编号。

</details>
