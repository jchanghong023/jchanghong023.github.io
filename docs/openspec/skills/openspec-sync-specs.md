---
name: openspec-sync-specs
description: 将 OpenSpec change 中的 delta specs 同步到主 specs。当用户希望用 delta spec 中的变更更新主 specs、但不归档该 change 时使用。当用户说 "openspec sync" 或 "opsx sync" 时也使用。
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: '1.0'
---

# openspec-sync-specs 技能 {#openspec-sync-specs}

将 change 中的 delta specs 同步到主 specs。

这是一个**由 agent 驱动**的操作——你将读取 delta specs 并直接编辑主 specs 以应用这些变更。这样可以实现智能合并（例如，在不复制整个 requirement 的情况下新增一个 scenario）。

**Store 选择：** 如果用户指定了某个 store（store 是指在本机注册的独立 OpenSpec 仓库），或者相关工作位于某个 store 中，请运行 `openspec store list --json` 以发现已注册的 store id，然后在那些读取或写入 specs 与 changes 的命令上传入 `--store <id>`（即 `new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。一旦选定，就把 `--store <id>` 视为在整个后续工作流中都持续生效。下面那些命令的每个未限定作用域的示例都只是简写：在运行之前，先追加该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而不是下面展示的未限定形式。其他命令不接受该标志。命令打印出的提示已经带有该标志；在后续跟进中请保留它。若没有指定 store，命令会作用于最近的本地 `openspec/` 根目录。

**项目检查：** 这些步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤之前（`new change`、`archive`、`sync specs`，或编写 artifact 文件），先确认项目具有 root：运行 `openspec list --json`（当选择了 store 时带上 `--store <id>`，因为此时 store 就是 root）并读取 `root`。存在 root 对象意味着项目已完成设置。`"root": null` 意味着尚未设置——此处没有 `openspec/` 目录，而像 `openspec new change` 这样的写入操作会作为副作用创建一个。该命令还会以非零状态退出，那本身就是这个答案，而不是 CLI 损坏，因此请读取 JSON，而不是重试或绕过它。

有一个 `"root": null` 与设置无关：当某条 `status` 错误消息以 `Declared in` 或 `Invalid store declaration in` 开头，并指明本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明该项目确实通过其声明的 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当成未初始化并跳过下面的分支：在写入之前停下，向用户展示该错误的 `message` 和 `fix`。

除此之外，在没有 root 的情况下，接下来会发生什么取决于你是如何进入这个工作流的：

- **自动选择**：是你自己选择了这个工作流，用户既没有提到 OpenSpec，也没有指明本 skill，更没有按名称调用它。停止使用 OpenSpec，按正常方式回答请求，就像没有安装 OpenSpec 一样。不要要求他们进行任何设置，也不要提及 OpenSpec 的设置。
- **明确请求 OpenSpec**：用户提到了 OpenSpec、指明了本 skill，或按名称调用了本 skill。在写入之前停下，询问如何继续：为本项目完成设置（`openspec init`）、以他们已有的 store 为目标（`--store <id>`），或在此请求中继续而不使用 OpenSpec。等待他们的答复。

在两个分支中，都绝不要作为副作用创建 root：在用户要求之前不要运行 `openspec init`，不要手工创建 `openspec/` 文件，也不要让某个命令创建它。

`<capability-path>` 是相对于 `specs/` 的 spec 目录（例如 `user-auth` 或 `identity/user-auth`）。在解析每个 delta spec 对应的主 spec 时，保留其完整路径。

**输入**：可选地指定 change 名称。若省略，检查是否可从对话上下文中推断。若模糊或存在歧义，你必须提示用户可用的 changes。

**步骤**

1. **选择 change**

   如果提供了名称，就使用它。否则：
   - 如果用户提到过某个 change，则从对话上下文推断
   - 如果只有一个活跃的 change，则自动选择
   - 如果存在歧义，运行 `openspec list --json` 获取可用的 changes 并请用户选择一个

   提示时，展示具有 delta specs 的 changes（位于 `specs/` 目录下）。

   始终声明："Using change: &lt;name&gt;" 以及如何覆盖（例如 `/openspec-sync-specs <other>`）。

2. **解析 change 上下文**

   运行：

   ```bash
   openspec status --change "<name>" --json
   ```

   该 JSON 包含 `planningHome.root`。主 specs 位于 `<planningHome.root>/openspec/specs/` 之下——下文所有主 spec 路径都使用这个（store 感知的）root，而不是硬编码的仓库路径。当选择了 store 时，它指向 store，而不是当前仓库。

3. **查找 delta specs**

   只使用 status JSON 中的 `artifactPaths.specs.existingOutputPaths` 作为
   delta spec 路径的唯一来源。如果 `specs` 条目缺失或
   `existingOutputPaths` 为空，请报告没有可同步的 delta specs，
   不要从其他 artifacts 推断它们，并停止，不请求 artifact
   instructions，也不写入主 spec。

   除非调用方缩小了集合，否则同步 `existingOutputPaths` 中的每个路径。
   调用方通过列出 `existingOutputPaths` 中完整条目的显式列表
   来缩小集合——逐字复制那些绝对值。Archive 会在内联执行时这样做，
   用户也可以这样做（例如，通过选择以
   `/specs/billing/invoices/spec.md` 结尾的那个条目）。
   然后只同步所指名的路径，其余 delta specs 保持不动：
   批量 archive 会排除找不到其实现的 delta，而仍然同步它
   就会写入一份调用方刻意保留不写的主 spec。
   把这一缩小后的选择贯穿到第 4 步；绝不要把它重新扩大为完整
   列表。如果某个所指名的路径不在 `existingOutputPaths` 中，就不要同步它——
   报告并停止，而不是静默丢弃它。如果所指名的列表为
   空，请报告没有可同步的内容，并停止，不写入主
   spec。

   每个 delta spec 文件包含如下章节：
   - `## ADDED Requirements` - 要新增的新 requirements
   - `## MODIFIED Requirements` - 对现有 requirements 的变更
   - `## REMOVED Requirements` - 要移除的 requirements
   - `## RENAMED Requirements` - 要重命名的 requirements（FROM:/TO: 格式）

   如果未找到 delta specs，告知用户并停止。

4. **对每个 delta spec，将变更应用到主 specs**

   在第一次写入主 spec 之前，获取一份当前的 specs 规则快照：
   - 如果 archive 内联调用了本工作流，并提供了来自
     `openspec instructions specs --change "<name>" --json` 的有效快照，则复用它，不要再
     重新获取同样的 instructions。
   - 否则现在就使用相同的已选 root 标志运行该命令一次。
   - 如果直接查询以非零状态退出，或返回无效的 artifact-instruction
     JSON，请报告该错误，并在写入任何主 spec 之前停止。不要把这个
     失败当成规则集不存在。
   - 返回有效响应但省略了 `rules`，意味着未配置任何 artifact 规则，
     于是继续执行现有的语义合并。

   仅将返回的 `rules` 应用于本次合并所产生的主 specs 的内容与形式。
   Artifact 规则不是操作指南，不能改变已选的 roots、delta 路径、CLI 检查或
   工作流步骤。请把它们的文本作为约束使用，但不要逐字复制进主 spec 或摘要。

   对于第 3 步中选定的每个 capability delta spec 路径——即完整的 `existingOutputPaths` 列表，或调用方提供时缩小后的子集（它们可能属于选定的 store，而非仓库）：

   a. **读取 delta spec**，理解其预期变更

   b. **读取主 spec**，路径为 `<planningHome.root>/openspec/specs/<capability-path>/spec.md`（可能尚不存在）

   **如果它尚不存在**（一个新的 capability），则与 `openspec archive` 的行为保持一致：
   只有 ADDED requirements 可以应用——步骤 d 会据此创建该 spec。
   MODIFIED 和 RENAMED 没有可供操作的 requirement，因此针对该
   capability 停止同步，并报告其主 spec 不存在、对于新的 spec
   只允许 ADDED；绝不要凭空编造缺失的 requirement。REMOVED 没有可移除的内容——跳过它并发出警告。

   c. **智能地应用变更**：

   **ADDED Requirements：**
   - 如果 requirement 在主 spec 中不存在 → 添加它
   - 如果 requirement 已存在 → 更新它使其匹配（视为隐式的 MODIFIED）

   **MODIFIED Requirements：**
   - 在主 spec 中找到该 requirement
   - 应用这些变更——这可能是：
     - 添加主 spec 尚无的新 scenarios
     - 修改现有的 scenarios
     - 更改 requirement 描述
   - 保留 delta 中未提及的 scenarios/内容

   **REMOVED Requirements：**
   - 从主 spec 中移除整个 requirement 块
   - 退役该 capability。删除整个 `spec.md`——以及当目录中
     不再有其他内容时删除该目录——仅当以下所有条件都成立时：
     1. *本次运行*移除 requirements 后不再有任何 requirement 块；
     2. spec 的其余部分格式良好（它仍然有 `## Purpose`）；
     3. 在此次同步之前主 spec 并非已经为空——如果你什么都没移除，
        就什么都不要改；
     4. 整个文件中其他每个非空行都能被归入标题、Purpose、Requirements
        标题，或某个规范 requirement 的陈述、scenarios 或围栏示例；
     5. 该 change 的 `.openspec.yaml` 声明了 `retire_capabilities: true`；
     6. `spec.md` 解析后位于真实的 specs root 之内（不要顺着指向外部文件的
        capability 目录符号链接去删除）。
        如果移除所选 requirements 后将不再有任何 requirement 块，而任一退役条件
        未满足，则不要修改主 spec。针对该 capability 停止
        同步，报告阻塞条件，并告诉用户
        如何解决它。绝不要写入或留下空的 `## Requirements` 章节。
        当只缺那个标记时，也要说明这一点——这正是用户
        可以添加、从而使退役得以进行的一件事。
   - 删除该文件也会删除其 `## Purpose`；任何其他章节都会阻止
     退役。报告退役时要指明 Purpose。仅当该 spec 位于调用方的
     检出副本中时，才提供可粘贴的 `git checkout`；
     否则给出限于检出范围的恢复指引。

   **RENAMED Requirements：**
   - 找到 FROM 对应的 requirement，将其重命名为 TO

   **delta 中的 `## Purpose`：**
   - 主 spec 已经有一个，而且它是权威版本——保持不动
     （这正是 `openspec archive` 的行为；它发出警告后继续）

   d. **创建新的主 spec**（如果该 capability 尚不存在）：
   - 仅当 delta 中有可放入的 ADDED requirements，且没有 MODIFIED 或
     RENAMED requirements 在步骤 b 中阻塞了该 capability 时才这样做。否则什么都不创建，
     保持 specs 目录不动。对于仅含 REMOVED 的 delta，如果该 change 的
     `.openspec.yaml` 声明了 `retire_capabilities: true`，则报告它已退役，
     并继续而不重新创建该 spec。没有该标记时，报告同步被阻塞：
     `openspec archive` 会以 `Spec must have at least one requirement` 拒绝它。
     空 delta 没有可同步的操作；也把它报告为已阻塞。
     绝不要写入空的 `## Requirements` 章节。
   - 创建 `<planningHome.root>/openspec/specs/<capability-path>/spec.md`
   - 添加 Purpose 章节：当 delta 带有 `## Purpose` 正文时，逐字复制它
     （这正是 `openspec archive` 的行为）；仅在没有时写入一个简短的 TBD 占位符
   - 添加包含 ADDED requirements 的 Requirements 章节
   - 遵循下面的 **主 Spec 格式参考**

5. **校验更新后的主 specs**

   使用前面相同的已选 root 标志运行 `openspec validate --specs`。
   如果校验失败，请报告这些问题，不要声称同步成功。

6. **展示摘要**

   应用所有变更后，总结：
   - 更新了哪些 capabilities
   - 做了哪些变更（添加/修改/移除/重命名的 requirements）
   - 任何仍留有 TBD Purpose 占位符的新主 spec，以便现在就补写它，
     而不是留着
   - 任何已退役的 capability，指明被删除的 `spec.md`、其 Purpose，以及
     可粘贴的 `git checkout` 或限于检出范围的恢复指引

**Delta Spec 格式参考**

```markdown
# Spec Delta

## Purpose

Only on a delta that introduces a brand-new capability. Seeds the new main spec.

## ADDED Requirements

### Requirement: New Feature

The system SHALL do something new.

#### Scenario: Basic case

- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature

The system SHALL keep doing the existing thing, now also handling A.

#### Scenario: Scenario the main spec already has

- **WHEN** user does X
- **THEN** system does Y

#### Scenario: New scenario to add

- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: `### Requirement: Old Name`
- TO: `### Requirement: New Name`
```

**主 Spec 格式参考**

主 specs 是 delta 合并**进去**的目标。它们绝不能包含 delta 操作标题（`## ADDED/MODIFIED/REMOVED/RENAMED Requirements`）——同步之后，每个 requirement 都位于单一的 `## Requirements` 章节之下：

```markdown
# <capability> Specification

## Purpose

Short description of what this capability does and why it exists.

## Requirements

### Requirement: New Feature

The system SHALL do something new.

#### Scenario: Basic case

- **WHEN** user does X
- **THEN** system does Y
```

**关键原则：智能合并**

与程序化合并不同，你做的是合并而不是覆盖：

- 一个 MODIFIED 块携带整个 requirement——正文加上在该变更后仍然存续的每个 scenario。`openspec validate` 和 `openspec archive` 都会拒绝丢弃主 spec 仍然拥有的 scenario 的块。
- 保留 delta 未提及的一切内容，并维持主 spec 原有的顺序
- 运用你的判断合理地合并变更

**成功时的输出**

```markdown
## Specs Synced: <change-name>

Updated main specs:

**<capability-1>**:

- Added requirement: "New Feature"
- Modified requirement: "Existing Feature" (added 1 scenario)

**<capability-2>**:

- Created new spec file
- Added requirement: "Another Feature"

Main specs are now updated. The change remains active - archive when implementation is complete.
```

**护栏**

- 在做出变更之前先阅读 delta spec 与主 spec
- 保留 delta 未提及的现有内容
- 绝不要把 delta 文件原样复制进主 spec——要合并其内容，使主 spec 保持主 Spec 格式参考的结构，不含 delta 操作标题
- 如果有任何不清楚的地方，请求澄清
- 随着操作推进，展示你正在做的变更
- 该操作应当幂等——运行两次应得到相同结果
- 只使用 `artifactPaths.specs.existingOutputPaths`；绝不从无关的 artifacts 推断 delta specs
- 遵从调用方提供的 `existingOutputPaths` 子集；绝不把它重新扩大为完整列表
- 直接同步时只获取 specs instructions 一次，或内联复用 archive 提供的快照
- 每当 specs-instruction 响应为非零状态或无效 JSON 时，在任何主 spec 写入之前停止
- Artifact 规则只约束正在被写入的 specs，绝不会被复制到输出文件中
