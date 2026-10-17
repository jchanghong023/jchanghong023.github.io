# OmpCode与RPC接入边界 {#rpc-ui-protocol}

[OmpCode](/ompcode/)保留图形界面，以OMP为Agent核心。源需求沿用早期ZCode名称，本文讨论**OMP侧接入合同**，不把GUI功能存在或局部协议通过当完整联调验收。服务/认证就绪后，默认不要求用户手工写OMP配置。

## 多会话、消息与所有权 {#sessions}

可多会话同时运行，一个等回答不堵其他。允许每会话独立OMP进程，不要求“一项目一进程”。普通消息/流式文本/工具过程/停止/运行中插话/排队，以及新建、恢复、关闭、改名、删除沿用上游忙时/错误/保留语义。

改名须兼容旧无标题槽格式。改名和删除均不得直接改写其他存活进程托管的会话文件；须持相应所有权租约，否则以可辨识错误拒绝。本进程活跃会话通过API改名，不造审批绕过。真实agent://消息发送回执保留总线message ID与发送时间，广播每收件人取真实身份，冷恢复可幂等关联；不猜处理回执或另造通信日志。

## 权限、提问与停止 {#permissions}

上游默认权限继续有效，**没有专用GUI审批面不等于自动批准或拒绝**。保留模型ask与回答后继续，集成必须核对兼容。长操作/审批等待不占停止通道；取消、切会话、EOF后不写其他会话、不启动旧后续轮次。受理、运行、最终完成沿用真实事件，不能只以“请求接收”显示已完成。

## 命令目录与共享交互 {#commands}

CLI集成入口`omp --mode rpc-ui`通过已有v3协议的prompt.message提交，命令/别名/参数补全来自实际注册信息。command_output承载文字/状态，extension_ui_request/response承载选择、输入、确认，不新增专属索引面板协议或平行业务实现。这里的OMP RPC v3与OmpCode内部Host产品协议不是同一个版本号体系。

必须接入的目录：`/wiki`、`/repo`、`/team`、`/plan`、`/loop`、`/goal`、`/goal-autopilot`、`/advisor`、`/ultrathink`、`/orchestrate`、`/workflowz`、`/jch-workflowzbatch`、`/fullsend`、`/skill:<name>`、`/compact`。正文魔法关键词沿共享规则，不是advisor参数。终端专属命令明确拒绝，不能悄悄当普通模型指令；advisor configure终端编辑器仍仅TUI，role保存用原配置接口。

- Wiki：索引列表/搜索/grep/创建/删除，共享服务，仍只有init/remove维护动作，见[Wiki](./fork#wiki)。
- Repo：状态、确认首次建立、更新、重建恢复、删除、进度/取消，见[Repo](./repo-index)。
- Team：开关/状态/报告沿只读编排，不扩大为GUI子代理管理，见[Team](./team)。
- 其他关键词/技能/compact复用原路径，不新加SDK义务。

## Plan、Loop与Goal的区别 {#execution-modes}

`/plan [任务]`进入/切换计划只读，临时plan role、计划文件、xd://propose共用；已有草稿退出前确认。提交后展示正文求确认，拒绝/取消留Plan，批准恢复工具和模型，复用保存/引用/执行链。当前RPC批准只支持**保留当前上下文继续**，不承诺清空/压缩后执行或终端计划编辑器。

Loop首轮正常发，后续空闲且等待完再发；限制/条件/compact/reset共享解析。[位置间隔](./fork#loop)改变数字计数：有间隔含首轮，无间隔旧语义额外重复。停止暂停，下一用户提示可恢复，再次loop关闭；切换/关闭取消旧提交/定时/条件进程。启用Loop时不同时自动提交Goal续跑。

Goal创建/替换/show/pause/resume/drop/budget复用同一状态与RPC控制器，不另存第二份。自动续跑按上游设置，无工具的一次纠偏/停止见[Goal](./goal-autopilot#runtime)。autopilot标记/压缩恢复/授权和取消仍同一完整契约。

`/jch-workflowzbatch`两个正安全整数加非空正文，经同注册目录补全、prompt.message进入共享处理器，保留字面量/空白，非法不调用模型。它不增加RPC调度、配置写入或程序级并发/禁测拦截；[实际提示词约束](./fork#jch-commands)仍适用。

## 临时模型与持久role {#models}

临时切模型只当前会话，不写持久设置、不改其他/新会话默认。完整role配置保留未配置项、自定义role、来源/保存结果/并发处理。单role写由Settings锁、比较交换和原子落盘完成，只改目标role，保留其他字段与YAML注释；冲突不写，非法配置隔离备份并明确失败。保存/取消/新增/外部并发编辑后的GUI重启读回需真实验收，不因API存在就算通过。筛选/可用性不新增Fork禁用策略。

## 不承诺的管理面与如何验收 {#scope-and-validation}

此OMP合同不要求新增子代理过程/历史查看控制，Skill启停删除刷新，队列查看/删/重排/清空，设置/Provider/MCP/usage/search/jobs管理，结构化附件协议、SDK同步、未列命令逐项接入或独立/btw GUI。上游自带行为保留不等于新增GUI义务，产品当前更具体边界另看[OmpCode](/ompcode/)。

验收须真实OMP进程和GUI观察多会话隔离、消息/工具/停止/恢复、ask往返、目录补全、临时模型及role保存。OMP侧至少真实cli.ts mode rpc-ui覆盖注册派发、索引确认失败、Plan拒绝/批准、Loop/Goal生命周期/取消。localhost模型替身证明协议链路，不证明真实模型质量；完整GUI联调另验，本站没运行任何产品测试。

来源：[RPC接入需求](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/rpc-ui-protocol.md)。
