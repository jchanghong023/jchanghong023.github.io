---
name: openspec-update-change
description: 通过修订 change 已有的规划 artifact 并保持它们彼此一致来更新一个 OpenSpec change。当用户想要修订某个 change 的计划、把新决策并入其中，或在一次编辑之后调和它的各个 artifact 时使用。当用户说 "openspec update change" 或 "opsx update" 时也使用。如果用户实际指的是 openspec update CLI 命令（该命令会刷新生成的文件），则改为运行那个命令。绝不编辑代码。
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: '1.0'
---

# openspec-update-change 技能 {#openspec-update-change}

修订一个 change 已有的规划 artifact，并保持它们彼此一致。绝不编辑代码。

**Store 选择：** 如果用户指定了某个 store（store 是注册在这台机器上的独立 OpenSpec 仓库），或者工作就位于某个 store 中，先运行 `openspec store list --json` 发现已注册的 store id，然后在读取或写入 spec 和 change 的命令上传入 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。一旦选定，就把 `--store <id>` 视为在整个工作流剩余部分持续生效。下面那些命令的每一个未限定范围的示例都是简写：在运行之前，先追加该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而不是下面所示的不带范围的写法。其他命令不接受该标志。命令打印的提示已经带有该标志；在后续操作中保留它。若没有 store，命令则作用于最近的本地 `openspec/` 根目录。

**项目检查：** 这些步骤期望项目已经在使用 OpenSpec。在第一个会写入任何内容的步骤（`new change`、`archive`、`sync specs`，或编写某个 artifact 文件）之前，先确认项目有根目录：运行 `openspec list --json`（当选择了 store 时加上 `--store <id>`，因为此时 store 就是根目录）并读取 `root`。root 对象表示项目已设置好。`"root": null` 表示未设置——这里没有 `openspec/` 目录，而像 `openspec new change` 这样的写入操作会作为副作用创建一个。该命令还会以非零状态退出，这是上述答案，而不是 CLI 损坏，所以应读取 JSON，而不是重试或设法绕过它。

有一种 `"root": null` 与设置无关：当一个 `status` 错误消息以 `Declared in` 或 `Invalid store declaration in` 开头，并且指出了本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明该项目确实通过它声明的一个 store 使用 OpenSpec，只是这台机器无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当作未初始化而跳过下面的分支：在写入之前停下，向用户显示该错误的 `message` 和 `fix`。

否则，在没有根目录的情况下，接下来会发生什么取决于本工作流是如何被触发的：

- **Auto-selected（自动选择）**：你是自己选择了本工作流，用户既没有提到 OpenSpec，也没有提到本 skill，也没有按名称调用本 skill。停止使用 OpenSpec，像没有安装 OpenSpec 时那样正常回答问题。不要要求他们进行任何设置，也不要提及 OpenSpec 设置。
- **Explicit OpenSpec request（明确的 OpenSpec 请求）**：用户提到了 OpenSpec、提到了本 skill，或按名称调用了本 skill。在写入之前停下，并询问如何进行：为项目做设置（`openspec init`）、以他们已有的某个 store 为目标（`--store <id>`），还是本次请求不使用 OpenSpec 继续。等待他们的回答。

在两个分支中，都绝不要作为副作用创建根目录：在用户要求之前不要运行 `openspec init`，不要手动创建 `openspec/` 文件，也不要让某条命令创建它。

**输入**：可选地指定一个 change 名称。如果省略，检查是否能从对话上下文中推断出来。如果含糊或歧义，你 MUST 提示用户从可用的 change 中选择。

本工作流修订的是已经存在的 artifact；`/openspec-continue-change` 才负责创建那些尚不存在的 artifact。

**步骤**

1. **选择 change**

   如果提供了名称，就使用它。否则：
   - 如果用户提到了某个 change，则从对话上下文中推断
   - 如果只有一个活跃的 change，则自动选择
   - 如果有歧义，运行 `openspec list --json` 获取按最近修改时间排序的可用 change，并请用户选择一个

   提示时，把最近修改的前 3-4 个 change 作为选项呈现，显示：
   - Change 名称
   - 状态（例如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified` 字段）

   把最近修改的 change 标记为 "(Recommended)"，因为它很可能是用户想要更新的那个。

   始终宣布："Using change: &lt;name&gt;"，以及如何覆盖（例如 `/openspec-update-change <other>`）。

2. **获取该 change 的 artifact**

   ```bash
   openspec status --change "<name>" --json
   ```

   解析 JSON 以了解当前状态。响应包含：
   - `schemaName`：正在使用的工作流 schema（例如 "spec-driven"）
   - `artifacts`：artifact 数组，带有各自的状态（"done"、"skipped"、"ready"、"blocked"）
   - `isPlanningComplete`：布尔值，表示所有规划 artifact 是否已完成。较旧的 CLI 版本以 `isComplete` 暴露同一个值。
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径与范围上下文。使用这些，而不是假定为仓库本地路径。

   artifact id 和路径来自当前活跃的 schema——不要假定它们，也不要基于硬编码的 artifact 名称分支。自定义 schema 必须在无需改动的情况下可用。

   要编辑的文件是 `artifactPaths.<id>.existingOutputPaths`——磁盘上实际存在的具体文件，对于 glob artifact（例如 `specs/**/*.md`）已经做了 glob 展开，再加上在部分填充的 glob artifact 下允许的任何已确认的具体路径（第 4 步）。不要写入 `resolvedOutputPath`：对于 glob artifact，它仍然是 glob 模式，而不是真实文件。

3. **理解请求**
   - 如果用户请求了具体的修订（"the design now uses X"），那就是起始编辑。
   - 如果他们只说了 "update" / "make this coherent"，则把它视为一次一致性审查：读取现有的 artifact，并相互核对是否存在矛盾、缺口和重复。

4. **读取并调和**
   - 读取请求涉及的 artifact 以及该 change 的其他现有 artifact。
   - 在对话中起草所请求的编辑，而不是在文件中起草。弄清楚它到底改变了什么；第 5 步负责所有写入。然后针对起草的编辑检查其他每一个现有 artifact——无论方向如何：对较后 artifact 的编辑可能需要修订较前的 artifact，而不仅限于反向。构建顺序是有用的阅读顺序，而不是对哪些 artifact 可被修订的限制。
   - 记录所有现在已经不一致、缺失或矛盾的内容。
   - 对已经存在的文件（`existingOutputPaths`）提出修订建议。如果某个 artifact 没有现有输出文件且状态为 `ready` 或 `blocked`，指出这一点并引导用户使用 `/openspec-continue-change` 来创建它们。保持 `skipped` artifact 原样不动；不要把它们视为缺失，也不要将它们推迟到 continue 工作流。
   - 一个 glob artifact（例如 `specs/**/*.md`）在至少有一个文件匹配之后即被标记为 `done`，而 continue 工作流只处理 `ready` artifact。当调和过程发现某个 glob artifact 缺少一个文件，而它的 `existingOutputPaths` 非空时：
     1. 运行 `openspec instructions "<artifact-id>" --change "<name>" --json`，使用其中的 `instruction` 和 `template`。把 `context` 和 `rules` 当作约束；不要把它们复制进文件。如果 instructions 报告 `skipped: true`，不要创建该文件。从磁盘读取当前的依赖文件；如果某个必需的非 skipped 依赖缺失，停下并请用户先恢复它。
     2. 在 `changeRoot` 内选择一个匹配 `artifactPaths.<id>.outputPath` 且尚不存在的具体路径。在解析任何符号链接的父目录之后，验证它仍位于 `changeRoot` 内。glob 的 `resolvedOutputPath` 不是有效目标。
     3. 把新文件纳入第 5 步的拟议修订中，并且只在用户确认之后创建它。
     4. 确认之后、创建之前，立即刷新 status 和 instructions。验证该 artifact 仍在范围内、未被跳过，并且处于部分填充状态；重复上面的具体路径检查。
     5. 使用一个在目标已存在时会失败的创建操作。如果 `instruction` 把创建委托给另一个 skill 或命令，只有当它能遵守已确认的路径和这些防护措施时才调用它；否则停下。如果任何检查失败，或已确认的草稿不再有效，停下并与用户调和，而不是替换现有内容或选择不同的路径。
   - 如果该 change 已经保持一致，说明这一点，不提任何修订。

5. **逐个 artifact 确认并应用**
   - 本步骤执行本工作流中的每一次 artifact 写入；任何更早的步骤都不编辑 artifact。
   - 展示每一项拟议修订及原因——包括第 4 步起草的所请求编辑。只在用户确认后才写入。
   - 如果用户拒绝某项修订，不要写入它——保持该 artifact 不变。
   - 当需要大幅重写时，先获取该 artifact 的规则和模板：
     ```bash
     openspec instructions "&lt;artifact-id&gt;" --change "&lt;name&gt;" --json
     ```

6. **指向下一步（仅作指引——绝不自行执行）**
   - `existingOutputPaths` 为空且状态为 `ready` 或 `blocked` 的 artifact -> 建议使用 `/openspec-continue-change` 创建它们。
   - Change 已经实现（task 已勾选 / 已应用）-> 代码可能不再与修订后的计划匹配；建议使用 `/openspec-apply-change` 把 delta 带入代码。
   - 一切均已完成并实现 -> 建议使用 `/openspec-archive-change`。

**输出**

每次调用之后，展示：

- 哪些 artifact 被修订了（以及哪些拟议修订被拒绝）
- 在已经部分填充的 glob artifact 下创建的任何文件
- 推迟到 `/openspec-continue-change` 的任何内容（尚无文件且状态为 `ready` 或 `blocked` 的 artifact，绝不是 `skipped` artifact）
- change 当前所处的状态以及推荐的下一步 skill

**防护措施**

- 仅限规划 artifact——绝不编辑实现代码。如果修订后的计划意味着代码变更，停下并指向 `/openspec-apply-change`。
- 使用 `openspec status` 报告的 artifact id 和路径；绝不要基于硬编码的 artifact 名称分支。
- 只编辑 `existingOutputPaths` 中的具体文件，加上在部分填充的 glob artifact 下允许的任何已确认的具体路径（第 4 步）；绝不写入 glob 的 `resolvedOutputPath`。
- 不要推进构建前沿：如果某个 artifact 的 `existingOutputPaths` 为空且状态为 `ready` 或 `blocked`，那是 `/openspec-continue-change` 的职责。保持 `skipped` artifact 原样不动。新文件的唯一范围是 glob artifact 下 `existingOutputPaths` 非空时的一个已确认具体路径。
- 在写入之前与用户确认每一次编辑。
- 如果请求改变的是该 change 的*意图*而非对其的细化，建议使用 `/openspec-new-change` 重新开始（即 "Update vs. Start Fresh" 启发式）。
