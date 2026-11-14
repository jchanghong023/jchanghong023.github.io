---
name: openspec-archive-change
description: 在实验性 workflow 中归档一个已完成的 OpenSpec change。当用户希望在实现完成后收尾并归档 change 时使用。用户说 "openspec archive" 或 "opsx archive" 时也使用。
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: '1.0'
---

# openspec-archive-change 技能 {#openspec-archive-change}

在实验性 workflow 中归档一个已完成的 change。

**Store 选择：** 如果用户指定了某个 store（store 是注册在本机上的独立 OpenSpec 仓库），或者工作就位于其中一个 store 中，请运行 `openspec store list --json` 发现已注册的 store id，然后在读取或写入 specs 与 changes 的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。一旦选定，就在 workflow 的其余部分把 `--store <id>` 视为粘性参数。下文这些命令的每个未限定范围的示例都只是简写：运行之前先追加该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而不是下面展示的未限定形式。其他命令不接受该标志。命令打印的提示中已经带有该标志；在后续跟进命令中保持它。未指定 store 时，命令作用于最近的本地 `openspec/` root。

**项目检查：** 这些步骤期望项目已经在使用 OpenSpec。在执行第一个写入任何内容的步骤（`new change`、`archive`、`sync specs`，或编写 artifact 文件）之前，先确认项目是否有 root：运行 `openspec list --json`（选定 store 时带上 `--store <id>`，因为此时 store 就是 root）并读取 `root`。如果得到 root 对象，说明项目已完成配置。`"root": null` 表示尚未配置——这里没有 `openspec/` 目录，而像 `openspec new change` 这样的写入会作为副作用创建一个。该命令也会以非零状态退出，这本身就是那个答案，而不是 CLI 出故障，所以要读取 JSON，而不是重试或绕过它。

有一种 `"root": null` 与配置无关：当 `status` 的错误消息以 `Declared in` 或 `Invalid store declaration in` 开头，并指名本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明项目确实通过它声明的某个 store 使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式不正确）。不要把它当作未初始化而跳过下面的分支：在写入之前停下，向用户展示该错误的 `message` 和 `fix`。

除此之外，在没有 root 的情况下，接下来怎么做取决于到达这个 workflow 的方式：

- **自动选择**：你自己选择了这个 workflow，用户没有提到 OpenSpec、没有指名这个 skill，也没有按名称调用这个 skill。停止使用 OpenSpec，按常规方式回答该请求，就像没有安装 OpenSpec 一样。不要要求用户做任何配置，也不要提及 OpenSpec 配置。
- **显式 OpenSpec 请求**：用户提到了 OpenSpec、指名了这个 skill，或按名称调用了这个 skill。在写入之前停下，询问如何继续：为此项目做配置（`openspec init`）、指向他们已有的某个 store（`--store <id>`），或者在本次请求中不使用 OpenSpec 继续。等待他们的回答。

在两种分支中，都绝不能把创建 root 当作副作用：在用户要求之前不要运行 `openspec init`，不要手工创建 `openspec/` 文件，也不要让命令创建它。

`<capability-path>` 是相对于 `specs/` 的 spec 目录（例如 `user-auth` 或 `identity/user-auth`）。解析每个 delta spec 对应的 main spec 时，保留该 delta spec 的完整路径。

**输入**：可选地指定 change 名称。如果省略，检查是否能从对话上下文中推断出来。如果含糊或模糊，你必须提示选择可用的 change。

**步骤**

1. **选择 change（Select the change）**

   如果提供了名称，就使用它。否则：
   - 如果用户提到过某个 change，从对话上下文中推断
   - 如果只存在一个活跃的 change，则自动选择
   - 如果存在歧义，运行 `openspec list --json` 获取可用的 changes 并请用户选择一个

   提示时，只展示活跃的 change（尚未归档的）。
   如果可用，附上每个 change 所使用的 schema。

   始终声明：“Using change: &lt;name&gt;”（使用 change：&lt;name&gt;）以及如何覆盖（例如 `/openspec-archive-change <other>`）。

   **在已有的 archive 检查之前加载当前的 archive 输入：**

   在解析出选定的 change 和 planning root 之后，运行：

   ```bash
   openspec instructions archive --change "<name>" --json
   ```

   在这个命令上保留同样的 selected-root 标志。这次查询是建议性的、
   可选的：它只提供额外的提示输入，因此绝不能阻塞归档。
   如果它以非零状态退出或返回无效 JSON——例如在不支持该命令的旧版
   CLI 上——则在没有上下文、没有操作指引的情况下继续 archive
   workflow。不要报告错误，也不要停下。

   成功的响应可能同时省略两个可选字段。把 `context` 视为
   必需的提示层输入：阅读并考虑它，并应用相关的项目
   事实、约定与约束。把 `operationGuidance` 视为可选的
   附加建议：阅读并考虑每一条，并遵循那些适用且与内置 archive
   workflow 兼容的条目。

   把这两个字段与内置步骤、用户的明确选择、已解析的
   路径、CLI 检查和命令契约区分开。如果 context 与上述某个
   控制性输入冲突，报告该冲突并保留控制性取值。如果
   指引不适用或与控制性输入冲突，不要遵循它，
   并解释原因。不要从这两个字段推断替代路径、被跳过的提示或标志，
   也不要除非用户另行要求，就把它们的文字原样复制进 specs、change
   artifacts 或 archive 摘要。这些是提示层的行为契约，
   而不是可强制执行的检查。

2. **检查 artifact 完成状态**

   运行 `openspec status --change "<name>" --json` 检查 artifact 完成情况。

   解析 JSON 以理解：
   - `schemaName`：所使用的 workflow
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径与范围上下文
   - `artifacts`：artifact 列表及其状态（`done`、`skipped` 或其他）

   **如果任何 artifact 既不是 `done` 也不是 `skipped`**（被跳过的 artifact 满足要求——该 change 声明了 skip_specs）：
   - 显示警告，列出未完成的 artifact
   - 请用户确认他们是否想继续
   - 如果用户确认则继续

3. **检查 task 完成状态**

   用同样的 selected-root 标志运行 `openspec list --json`，在
   `changes` 中找到 `name` 与所选 change 完全匹配的条目。
   要求恰好一个匹配，且 `totalTasks` 与
   `completedTasks` 为非负整数，并满足 `completedTasks <= totalTasks`。CLI 会解析
   schema 所跟踪的 task 文件，包括自定义 artifact 名称、输出
   路径和 glob。
   未完成的 tasks = `totalTasks - completedTasks`。

   不要根据 artifact 状态或顶层 `tasks.md` 的存在与否来推断 task 完成情况。
   如果查询失败、返回无效 JSON、遗漏或
   重复所选 change，或返回无效计数，报告该问题
   并在同步或归档之前停下。
   CLI 只把 `x`/`X` 复选框标记计为完成；
   其他标记（包括不熟悉的标记）都算未完成。

   **如果发现未完成的 tasks：**
   - 显示警告，说明未完成 tasks 的数量
   - 请用户确认他们是否想继续
   - 如果用户确认则继续

   **如果 `totalTasks` 为零：** 继续执行，不给出与 task 相关的警告。

4. **评估 delta spec 同步状态**

   把 status JSON 中的 `artifactPaths.specs.existingOutputPaths` 作为唯一的
   delta-spec 来源。如果 `specs` 条目缺失，或
   `existingOutputPaths` 为空，则不询问同步直接继续，也不要从
   其他 artifact 推断 delta specs。

   **如果存在 delta specs：**
   - 把每个 delta spec 与它在 `<planningHome.root>/openspec/specs/<capability-path>/spec.md` 处的对应 main spec 比较（使用第 2 步中 store 感知的 `planningHome.root`，而不是硬编码的仓库路径）
   - 缺少 main spec **并不自动**意味着“已同步”。对于新 capability，main spec 是同步的*产物*，而不是输入：
     - 如果 delta 含有 MODIFIED 或 RENAMED requirements，报告只有 ADDED requirements 才能创建新的 main spec，并把该 capability 标记为 sync-blocked。绝不要凭空编造一个没有当前版本的 requirement。
     - 否则，如果 delta 只含有 REMOVED requirements，且该 change 的 `.openspec.yaml` 声明了 `retire_capabilities: true`，则该 capability 已被退役：把它计为已同步，警告已没有可移除的内容，并且不要重建 main spec。现在验证已完成的同步时都要应用这条规则。
     - 否则，如果 delta 没有任何 ADDED requirements，报告无法进行同步，并把该 capability 标记为 sync-blocked。对于仅有 REMOVED 的 delta，警告没有可移除的 main spec，并保持 main-spec 树不变。`openspec archive` 会以 `Spec must have at least one requirement` 拒绝未标记的仅 REMOVED 情形。
     - 否则，把该 capability 计为需要同步，并在摘要中点名它（`<capability-path>: new main spec will be created`）。如果该 delta 还含有 REMOVED requirements，警告它们将被忽略，因为没有可移除的 main spec。同步只依据 delta 的 ADDED requirements 创建 main spec，与 `openspec archive` 的行为完全一致。
   - 确定将应用哪些变更（新增、修改、移除、重命名）
   - 即使某个 capability 处于 sync-blocked，也继续评估其余 capability。在提示之前展示合并后的摘要。

   **提示选项：**
   - 如果任何 capability 处于 sync-blocked：解释原因，并只提供“Archive without syncing”（不进行同步直接归档）、“Cancel”（取消）
   - 否则，如果需要变更：“Sync now (recommended)”（立即同步（推荐））、“Archive without syncing”
   - 否则，如果已同步：“Archive now”（立即归档）、“Sync anyway”（仍然同步）、“Cancel”

   根据回答进行路由：
   - “Cancel”——停止，不归档
   - “Archive without syncing”或“Archive now”——继续归档
   - “Sync now”或“Sync anyway”——同步，然后验证（见下文）。当某个 capability 处于 sync-blocked 时，不要启动任何同步；解释阻塞原因并重复可用选项。
   - 其他任何回答——再次询问，而不是归档

   在选定的同步写入任何 main spec 之前，用同样的
   selected-root 标志运行一次
   `openspec instructions specs --change "<name>" --json`。要求零退出状态和有效的 artifact-instruction
   JSON。如果查询失败或返回无效 JSON，报告该错误并在
   写入任何 main spec 或移动 change 之前停下。响应有效但省略
   `rules` 即为无规则的情形。只把返回的 `rules` 应用于本次合并
   所产出的 main specs 的内容与格式；不要把它们当作 archive 指引、
   改变 CLI 行为，或把规则文本复制进任何输出文件。

   然后为 change '&lt;name&gt;' 内联运行 `openspec-sync-specs` workflow（agent 驱动的智能合并），
   传入上面的 delta spec 分析和已获取的 specs 规则快照，并等待它完成。内联同步必须复用该快照，不再重新获取 `specs` instructions。不要把它委派给后台任务——第 5 步会把 `changeRoot` 从一个仍在读取它的同步下面移走，导致 change 已归档而 main specs 从未更新。如果你的 agent 只能通过委派来运行它，就同步地委派并等待结果。

   如果同步报告任何停止或阻塞条件，把该同步视为失败。
   立即停止归档。不要执行同步后的内容比较，也不要移动它的 `changeRoot`。
   此时尚未移动任何东西，所以用户可以修复阻塞条件或重新运行同步。

   在同步写入每个 main spec 之后，按照规范的同步契约验证其结构：
   - 新的 main spec 以 `# <capability> Specification` 标题开头。已有的 main spec 完全保持其原有标题不变。
   - 对于已建立的主 spec，完整保留现有的 `## Purpose` 章节不作改动。
   - 对于新的 main spec，原样复制 delta 的 `## Purpose`。仅当 purpose 文本比标准校验所期望的更短时才警告。不要重新生成或重写已有的原创 purpose。如果没有提供可用的 `## Purpose`，使用现有的 TBD Purpose 行为与警告。
   - 验证 main spec 中不再残留 delta 风格的章节标题（`## ADDED Requirements`、`## MODIFIED Requirements`、`## REMOVED Requirements`、`## RENAMED Requirements`），严格遵循 sync workflow 的格式规则。
   - 同步写入或修改的 requirement 块使用 `### Requirement:` 标题，其 scenarios 使用 `#### Scenario:` 标题，位于该 spec 的 `## Requirements` 章节下。delta 未提及的内容保持原样。

   然后针对在 `artifactPaths.specs.existingOutputPaths` 中拥有 delta spec 的每个 capability——而不只是同步报告它触碰过的那些——重新执行本步骤开头的比较，包括显式退役、缺少 spec 的情形。成功的同步不会留下任何待应用的内容，因此每个 capability 现在都必须读作已同步：
   - ADDED requirements 已存在
   - MODIFIED requirements 携带 delta 中点名的 scenario 与描述变更，其余 scenarios 保持不变
   - REMOVED requirements 已消失——并且若本次同步退役了某个 capability（移除其最后一个 requirement，留下空的 `## Requirements`），其 main spec 要被删除而不是留空。
   - RENAMED requirements 以新名称存在，且旧名称下不再存在

   如果同步失败，或任何 capability 不匹配，报告差异并停下——不要归档。此时尚未移动任何东西，`changeRoot` 完好无损，所以用户可以修复不匹配、重新运行同步，然后重新开始归档。

5. **执行归档**

   在 `planningHome.changesDir` 下创建 `archive` 目录（如果不存在）：

   ```bash
   mkdir -p "<planningHome.changesDir>/archive"
   ```

   生成目标名称：如果 change 名称已经以 `YYYY-MM-DD-` 前缀开头，就原样使用；否则把当前日期作为 `YYYY-MM-DD-<change-name>` 前置。绝不要叠加第二个日期（与 `openspec archive` 的规则相同）。

   **检查目标是否已存在：**
   - 如果存在：以错误失败，建议重命名现有归档或使用不同的日期
   - 如果不存在：把 `changeRoot` 移动到 archive 目录

   ```bash
   mv "<changeRoot>" "<planningHome.changesDir>/archive/<target-name>"
   ```

6. **显示摘要**

   展示归档完成摘要，包括：
   - Change 名称
   - 所使用的 schema
   - 归档位置
   - specs 是否已同步（如果适用）
   - 关于任何警告的说明（未完成的 artifacts/tasks）

**成功时的输出**

```markdown
## Archive 完成

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** 由 `planningHome.changesDir`/<target-name>/ 推导出的归档路径
**Specs:** <仅当第 4 步验证通过时填“✓ Synced to main specs”；否则填“No delta specs”或“Sync skipped”>

<“All artifacts complete. All tasks complete.”——或者，如果是在有警告的情况下归档，则改为列出这些警告（例如“Archived with 2 incomplete tasks”）>
```

**护栏（Guardrails）**

- 声明所选 change；当存在歧义时提示进行选择
- 使用 artifact 图（openspec status --json）进行完成检查
- 不要因为警告而阻塞归档——只需告知并确认
- 移动到 archive 时保留 .openspec.yaml（它随目录一起移动）
- 清晰展示发生了什么摘要
- 如果请求同步，内联运行 `openspec-sync-specs` workflow（agent 驱动）
- 当 spec 同步尚未结束时绝不归档——内联运行同步并在移动 `changeRoot` 之前验证 main specs
- 如果存在 delta specs，始终执行同步评估，并在提示前展示合并摘要
- 应用相关的运行时上下文并报告冲突；操作指引仍是建议性的
- 考虑每一条指引条目，并解释任何不适用或冲突的建议
- 现有的 CLI 检查、已解析路径、提示和命令契约保持不变
- Artifact 规则只约束正在写入的 specs，绝不是操作指引
- 绝不要把运行时上下文、操作指引或 artifact 规则文本原样复制进输出文件
