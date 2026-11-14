# Stores：在独立的仓库中做规划 {#stores}

> **Beta。** store、reference、working context 和 workset 都是新特性。
> 命令名称、flag、文件格式和 JSON 输出在不同版本之间仍可能改变形态。
> 下面的每个演练都针对当前构建运行过，但升级后请重新阅读本指南。

## 这解决了什么问题 {#stores-user-guide-2}

OpenSpec 通常存在于某个代码仓库内部：一个与你的代码相邻的 `openspec/`
文件夹，保存该 repo 的 spec 和 change。

一旦你的规划规模超过单个 repo，这种做法就不再适用：

- 你的工作横跨多个 repo —— 一个 feature 会同时触及 API 服务、Web 应用和一个共享库。
  那么计划应该放在谁的 `openspec/` 文件夹里？
- 你的团队在代码存在之前就做规划，或者规划的东西永远不会在 _这个_ repo 里变成代码。
- requirement 由一个团队拥有，由其他团队消费。wiki 版本会漂移，
  而且你的编码 agent 反正也读不到它。

**store** 就是答案：一个独立的 repo，其全部职责就是做规划。
它拥有你已经熟悉的 `openspec/` 结构 —— specs 和 changes ——
外加一个很小的身份文件。你在自己的机器上按名称注册它一次，
之后每个普通的 OpenSpec 命令都能从任何地方在它里面工作。

## 形态 {#stores-user-guide-3}

```
            team-plans  (a store: planning in its own repo)
            ├── .openspec-store/store.yaml     identity: "I am team-plans"
            └── openspec/
                ├── specs/     what is true
                └── changes/    what is in motion
                      ▲
                      │ registered on each machine by name;
                      │ shared by pushing/cloning like any repo
        ┌─────────────┼─────────────┐
        │             │             │
    web-app       api-server     mobile-app
   (code repo)   (code repo)    (code repo)
```

两条规则让这一切保持简单：

1. **store 只是一个 git repo。** 由你自己 commit、push、pull 和 review。
   OpenSpec 从不自行 clone、sync 或 push 任何东西。
2. **声明，而非机制。** repo 可以*声明*它们与 store 的关系（见下文）。
   声明改变的是 OpenSpec 能告诉你什么 —— 而不是你的命令在哪里生效。

## 五分钟创建你的第一个 store {#store}

两条命令就能让你从零开始得到可用的、以 store 为作用域的 change：

```bash
openspec store setup team-plans --path ~/openspec/team-plans
```

```
Store ready: team-plans
Location: ~/openspec/team-plans
OpenSpec root: ready
Registry: registered

Next: run normal OpenSpec commands against this store, for example:
  openspec new change <change-id> --store team-plans
Share this store by committing and pushing it like any Git repo.
```

```bash
openspec new change add-login --store team-plans
```

```
Using OpenSpec root: team-plans (~/openspec/team-plans)
Created change 'add-login' at ~/openspec/team-plans/openspec/changes/add-login/
Schema: spec-driven
Next: openspec status --change add-login --store team-plans
```

这就是全部模型。从这里开始，生命周期正是你所熟悉的那套 ——
`status`、`instructions`、`validate`、`archive` —— 只是在每条命令上加上
`--store team-plans`，而每条打印出来的提示都会替你带上这个 flag。
`Using OpenSpec root:` 这一行始终告诉你命令在何处生效。

## 故事：一个团队，一个规划仓库 {#stores-user-guide-5}

一个团队把它的 spec 和 change 保存在 `team-plans` 中，而不是散落到
各个代码 repo 里。

**第一天（由搭建设置的人执行）：**

```bash
openspec store setup team-plans --path ~/openspec/team-plans \
  --remote git@github.com:acme/team-plans.git
git -C ~/openspec/team-plans push -u origin main
```

传入 `--remote` 会把 clone URL 记录在 store 自身的身份文件
（`.openspec-store/store.yaml`）里，位于初始 commit 中。此后每个 clone
一出生就知道自己来自哪里，因此健康检查和错误消息可以为尚未拥有该 store 的
队友打印出完整、可直接粘贴的修复命令。

**每位队友（每台机器一次）：**

```bash
git clone git@github.com:acme/team-plans.git ~/openspec/team-plans
openspec store register ~/openspec/team-plans
```

从那以后，每个人都按名称在同一个规划 repo 中工作：

```bash
openspec status --store team-plans --change add-login
openspec show add-login --store team-plans
```

**共享工作就是 git，这是刻意为之。** 你创建的 change 在你 commit 并 push
之前只存在于你的 checkout 中 —— 与代码相同。计划免费获得分支、pull request
和 review，因为 store 就是一个普通的 repo。

**连接团队的代码 repo。** 一个规划完全外部化的代码 repo 只需要一行，
写在 `openspec/config.yaml` 中：

```yaml
# web-app/openspec/config.yaml
store: team-plans
```

现在在 `web-app` 内运行的每条 OpenSpec 命令都完全不需要 flag 就会作用于
`team-plans`：

```bash
cd ~/src/web-app
openspec status --change add-login
```

```
Using OpenSpec root: team-plans (~/openspec/team-plans)
...
```

这个指针是回退，绝不是覆盖：显式的 `--store` 始终优先；如果该 repo 长出了
自己的真实规划文件夹，则那些文件夹优先（并给出警告，提示移除过期的指针）。

**为你机器上的每个 repo 设一个默认值。** 如果你的工作横跨许多代码 repo，
而它们都规划到同一个 store，那么全局设置一次即可，不必给每个 repo 添加
`store:` 行：

```bash
openspec config set defaultStore team-plans
```

现在任何在规划根之外运行、且没有 `--store`、也没有 project 指针的命令
都会解析到 `team-plans`。它位于优先级列表的最底部，因此 `--store`、
本地 root 和 project 的 `store:` 指针都仍然优先。root banner 和 JSON 的
`root` 块会报告 `source: "global_default"` 以及 store id，因此你总能区分
机器级默认值和 repo 自己的指针。用 `openspec config unset defaultStore`
清除它。如果该 id 未注册，命令会报错，并告诉你注册它或清除过期的默认值。

## 示例：一个 feature，两个组件 repo {#feature-repo}

假设 `add-checkout-promo` 同时修改 `checkout-api` 和 `checkout-web`。
团队希望有一份共享的产品契约，同时每个代码 repo 仍然需要自己的实现
task、分支和 review。

使用两层：

1. 把共享行为保存在 `team-plans` 中。
2. 把实现计划保存在每个组件 repo 中，并以只读方式把该 store 作为上游
   上下文引用。

首先，在 store 中规划共享契约：

```bash
openspec new change add-checkout-promo --store team-plans
openspec status --change add-checkout-promo --store team-plans
```

proposal 和 spec 应该描述组件之间边界处的行为 —— 例如，服务返回的
促销字段，以及前端如何处理不符合条件的 checkout。像对待任何其他分支和
pull request 一样，在 store repo 中 review 这个 change。

### 规划能看到什么上下文？ {#stores-user-guide-7}

选择 store 会改变 OpenSpec root；它不会发现或读取使用该 store 的每个代码
repo。store 的 instructions 能看到 store 中的 artifact 和已配置的上下文。
只有当那些文件夹也对 agent 或编辑器可用、并且 agent 读取它们时，
这些 instructions 才能看到组件代码。

workset 是把规划 store 和两个代码 repo 一起打开的便捷方式：

```bash
openspec workset create checkout-promo \
  --member ~/openspec/team-plans \
  --member ~/src/checkout-api \
  --member ~/src/checkout-web \
  --tool code
openspec workset open checkout-promo
```

这让这些文件夹在一个 IDE workspace 中可见。它不会把源码上下文复制进 store，
不会选择受影响的 repo，也不会授予 agent 编辑它们的权限。把持久的跨组件事实
放进共享 spec；不要依赖规划者恰好记得它看过的源码。

### 每个 repo 中实现如何开始？ {#repo}

当没有显式的 `--store` 也没有更近的 `openspec/` root 适用时，
`store: team-plans` 指针会把命令路由到那个 store。它不会按调用 `apply`
时所在的目录来切分某个 store 的 task 列表。OpenSpec 目前不会把 task
路由到 repo。

当每个组件都需要独立作用域的 apply/review 周期时，给它一个本地
OpenSpec root 并引用中心 store，而不是指向它：

```yaml
# checkout-api/openspec/config.yaml (and likewise in checkout-web)
schema: spec-driven
references:
  - team-plans
```

在共享契约获得批准并进入 store 的 main spec 之后，为组件的部分创建一个
小的本地 change：

```bash
cd ~/src/checkout-api
openspec new change implement-checkout-promo-api

cd ~/src/checkout-web
openspec new change implement-checkout-promo-ui
```

每个 repo 的 instructions 中的 reference 索引会提供 store spec 的摘要
和确切的 `openspec show ... --store team-plans` 获取命令。每个本地
proposal 引用该共享契约，其 task 只描述该组件中的工作。然后在每个 repo
中分别运行 `/opsx:apply`；root 解析会保持 artifact 和实现编辑限制在该
repo 内。服务端和前端的 change 现在可以独立测试、review、合并和 archive。

如果共享 store change 仍处于活动状态而实现必须开始，
请显式获取它：`openspec show add-checkout-promo --store team-plans`；
reference 索引列出的是规范 store spec，而不是活动的 store change。
在 pull request 描述中把 store 分支和组件分支链接起来，以便 reviewer
能看到每个实现遵循的是哪一版契约。

## 故事：跨越团队边界的需求 {#stores-user-guide-9}

一个平台团队拥有这些 requirement。产品团队在自己的 repo 中、以自己的
design 针对它们构建。reference 描述这种关系，而不移动任何人的工作。

```
   platform-reqs (store)                 api-server (code repo)
   owned by the platform team            owned by a product team
   ┌──────────────────────────┐          ┌──────────────────────────┐
   │ openspec/specs/          │ ◀────────│ openspec/config.yaml     │
   │   payments/spec.md       │ reads    │   references:            │
   │   auth/spec.md           │          │     - platform-reqs      │
   │                          │          │ openspec/specs/          │
   │ openspec/changes/        │          │   (their own designs)    │
   │   platform work          │          │ openspec/changes/        │
   │                          │          │   (their own work)       │
   │                          │          └──────────────────────────┘
   └──────────────────────────┘
```

**产品团队在它 repo 的 `openspec/config.yaml` 中声明它取用的内容**：

```yaml
references:
  - platform-reqs
```

reference 是只读上下文。该 repo 保留自己的 `openspec/` root；
工作仍留在那里。改变的是：该 repo 中的 `openspec instructions` 现在
包含被引用的 store 的 spec 索引 —— 每条都有一行摘要和确切的获取命令
（`openspec show <spec-id> --type spec --store platform-reqs`）。
在 `api-server` 中工作的 agent 可以找到上游的 payment requirement、
引用它们，并在该 repo 自己的 root 中编写它的底层 design —— 无需任何人
到处粘贴上下文。

reference 可以携带它的 clone 来源，因此尚未拥有该 store 的队友能得到
完整的修复命令，而不是死胡同：

```yaml
references:
  - { id: platform-reqs, remote: 'git@github.com:acme/platform-reqs.git' }
```

**当你想把计划和代码一起打开时，创建一个 workset。** 这是个人化且
显式的：每个人在自己的机器上选择他们实际使用的文件夹。这些本地 checkout
路径不会被提交到共享规划 repo 中。

```bash
openspec workset create platform \
  --member ~/openspec/platform-reqs \
  --member ~/src/api-server \
  --member ~/src/web-app
```

## 你随时可以问的两个问题 {#stores-user-guide-10}

**“我的设置健康吗？”** —— `openspec doctor` 以只读方式检查当前 root
及其引用的 store，并为每个发现给出可粘贴的修复命令：

```
Doctor

Root
  Location: ~/src/api-server
  OpenSpec root: ok

References
  - platform-reqs: ok (~/openspec/platform-reqs)
  - design-system: Referenced store 'design-system' is not registered on this machine.
    Fix: git clone -- git@github.com:acme/design-system.git '~/openspec/design-system' && openspec store register '~/openspec/design-system' --id design-system

```

**“我在用什么工作？”** —— `openspec context` 从 OpenSpec 声明中组装
工作集：root 以及它引用的 store。

```
Working context for api-server (~/src/api-server)

OpenSpec root
  api-server  ~/src/api-server

Referenced stores
  platform-reqs  ~/openspec/platform-reqs
    Fetch: openspec show <spec-id> --type spec --store platform-reqs
```

两者都支持 `--json` 以供 agent 使用。`openspec context --code-workspace
&lt;path&gt;` 还会额外写出一个包含整个集合的 VS Code workspace 文件 ——
这是该命令唯一会执行的写入。

## Worksets：重新打开你一起工作的文件夹 {#worksets-reopen-the-folders-you-work-on-together}

与上面所有内容分开的一点：大多数人每次会话都会打开同样的少数几个文件夹 ——
规划 repo 加上两三个代码 repo。**workset** 是一份个人化的、有名称的视图，
正好记录这些文件夹，并用一条命令在你选择的工具中重新打开。

```
  workset "platform"                 openspec workset open platform
  ├── team-plans   ~/openspec/team-plans         │
  ├── api-server   ~/src/api-server              ▼
  └── web-app      ~/src/web-app       all three open in your tool
```

```bash
openspec workset create platform \
  --member ~/openspec/team-plans --member ~/src/api-server \
  --tool code
openspec workset list
```

```
platform  (opens in VS Code)
  team-plans  ~/openspec/team-plans
  api-server  ~/src/api-server
```

随后 `openspec workset open platform` 会启动已保存的工具：编辑器
（VS Code、Cursor）打开一个包含所有成员的单窗口并返回。第一个成员是
主成员。可以随时用 `--tool <id>` 覆盖工具。

workset 是刻意*不*作为共享状态的。它们存在于你的机器上，从不被提交，
也不对工作做任何声明 —— 它们只记录你喜欢一起打开什么。删除一个 workset
绝不会触及成员文件夹。新工具属于配置，而非代码：任何能通过 workspace 文件
或逐文件夹 attach flag 启动的工具，都可以添加到全局配置的 `openers`
键下（`openspec config edit`）。

## 命令如何决定在哪里生效 {#stores-user-guide-12}

每条普通命令都以相同顺序解析它的 root：

```
1. --store <id>          you said so explicitly        → that store
2. nearest openspec/     a real planning root here     → this repo
   (walking up from cwd)
3. store: pointer        config.yaml declares a store  → that store
4. defaultStore          global config sets a machine  → that store
                         default
5. none of the above     stores registered on this     → error with a
                         machine?                        selection hint
                         no stores registered?         → the current
                                                          directory
                                                          (classic behavior)
```

`Using OpenSpec root:` 这一行（以及 `--json` 输出中的 `root` 块）
告诉了你处于哪种情况。

## 已知限制 {#stores-user-guide-13}

- **Beta 形态。** 本页的所有内容都可能在版本之间改变 ——
  名称、flag、文件格式、JSON 键。
- **每台机器每个 store id 一个 checkout。** 用同一个 id 注册第二个
  checkout 会失败，并提示先执行 `store unregister`。
- **永不 sync —— 这是设计。** OpenSpec 从不 clone、pull 或 push。
  过期的 checkout 会显示过期的 spec，直到*你*执行 pull；reference 是
  从磁盘上的内容实时索引的。
- **空的规划文件夹可能缺失。** 新建的 store 在 Git 中可能还没有
  `openspec/changes/`、`openspec/specs/` 或 `openspec/changes/archive/`。
  这在 beta 期间是可接受的；一旦普通命令为它们创建文件，这些文件夹就会出现。
- **指针 repo 始终保持是指针。** 一个仅含配置的 repo，若其
  `openspec/config.yaml` 声明了 `store: <id>`，会被视为外部化规划，
  而不是要注册的 store checkout。如果你有意想把该 repo 转成本地 store root，
  请先移除 `store:` 行。
- **有些命令保持原位。** `templates` 和已弃用的名词形式
  （`openspec change show` 等）只作用于当前目录 —— 没有 `--store`。
  `schemas` 遵循规范的 root 选择优先级并接受 `--store <id>`，
  同时保持其成功的 JSON 数组形态不变。
- **每机器状态仅限该机器。** store registry 和 workset 是本地设置。
  你机器的布局绝不会被提交到共享规划中。
- **workset 有两种启动方式。** 无法通过 workspace 文件或逐文件夹 attach
  flag 启动的工具，不能添加为 opener。
- **agent JSON 有一个已知的大小写分裂**（store 系列的键是 snake_case，
  workflow 系列的是 camelCase）。记录在
  [agent contract](../agent-contract.md) 中；统一它被推迟到某个版本化发布。

## 各个东西在哪里 {#stores-user-guide-14}

| 什么           | 哪里                                       | 共享？                  |
| -------------- | ------------------------------------------ | ----------------------- |
| store 的规划   | `<store>/openspec/`（specs、changes）      | 是 —— commit 并 push 它 |
| store 的身份   | `<store>/.openspec-store/store.yaml`       | 是 —— 随 store 一起提交 |
| store registry | `<data dir>/openspec/stores/registry.yaml` | 否 —— 仅此机器          |
| Worksets       | `<data dir>/openspec/worksets/`            | 否 —— 仅此机器          |

`<data dir>` 在 macOS 和 Linux 上是 `~/.local/share/openspec`
（设置了 `$XDG_DATA_HOME/openspec` 时则用它），在 Windows 上是
`%LOCALAPPDATA%\openspec`。

## 参考 {#stores-user-guide-15}

本页每条命令的确切 flag 和 JSON 形态：
[CLI 参考](../cli.md)（Stores、Doctor、Working context、Personal
worksets）以及 [Agent 契约](../agent-contract.md)。
