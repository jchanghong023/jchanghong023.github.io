---
name: openspec-apply-change
description: 实现某个 OpenSpec change 中的 task。当用户想要开始实现、继续实现或逐项完成 task 时使用。当用户说 "openspec apply"、"opsx apply" 或 "openspec implement" 时也使用。
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: '1.0'
---

# openspec-apply-change 技能 {#openspec-apply-change}

实现某个 OpenSpec change 中的 task。

**Store 选择：** 如果用户指名了某个 store（store 是指注册在本机上的独立 OpenSpec 仓库），或者工作就位于某个 store 中，请运行 `openspec store list --json` 来发现已注册的 store id，然后在读写 spec 和 change 的命令上传递 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。一旦选定，就把 `--store <id>` 视为在整个后续工作流中持续生效。下文这些命令中每一个未加作用域的示例都只是简写：在运行它之前，先补上该标志。例如，运行 `openspec status --change "<name>" --json --store "<id>"`，而不是下文所示的未加作用域的形式。其他命令不接受该标志。命令打印出的提示已带有该标志；在后续跟进中要继续保留它。没有指定 store 时，命令作用于最近的本地 `openspec/` 根目录。

**项目检查：** 这些步骤假定项目已经在使用 OpenSpec。在执行第一个会写入任何内容的步骤（`new change`、`archive`、`sync specs` 或编写某个 artifact 文件）之前，先确认项目有根目录：运行 `openspec list --json`（当选定 store 时加上 `--store <id>`，因为此时 store 就是根目录）并读取 `root`。出现 `root` 对象表示项目已完成设置。`"root": null` 表示没有设置——这里没有 `openspec/` 目录，而像 `openspec new change` 这样的写入会作为副作用创建一个。该命令同样会以非零状态退出，这是那项回答而不是 CLI 损坏，所以要读取 JSON，而不是重试或绕开它。

有一种 `"root": null` 与设置无关：当 `status` 的错误消息以 `Declared in` 或 `Invalid store declaration in` 开头，并且指向本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明该项目确实通过它所声明的一个 store 使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式有误）。不要把它当成未初始化而跳过下面的分支：在写入之前停下，向用户展示该错误的 `message` 和 `fix`。

否则，在没有根目录的情况下，接下来会发生什么取决于这个工作流是如何被触达的：

- **自动选中**：是你自己选择了这个工作流，用户并没有提到 OpenSpec、没有点名这个 skill，也没有按名称调用它。停止使用 OpenSpec，像没有安装 OpenSpec 那样正常回答请求。不要请用户做任何设置，也不要提及 OpenSpec 的设置。
- **明确的 OpenSpec 请求**：用户提到了 OpenSpec、点名了这个 skill，或按名称调用了它。在写入之前停下，询问如何继续：为这个项目做设置（`openspec init`）、指向他们已有的 store（`--store <id>`），或在此请求中不使用 OpenSpec 继续。等待他们的回答。

在两个分支中，都绝不要作为副作用创建根目录：在用户要求之前不要运行 `openspec init`，不要手工创建 `openspec/` 文件，也不要让某条命令创建它。

**输入**：可选地指定一个 change 名称（例如 `/openspec-apply-change add-auth`）。如果省略，先检查能否从对话上下文中推断出来。如果含糊或歧义，你必须提示用户从可用 change 中选择。

**步骤**

1. **选择 change**

   如果提供了名称，就使用它。否则：
   - 如果用户提到过某个 change，从对话上下文中推断
   - 如果只存在一个活跃 change，自动选择
   - 如果有歧义，运行 `openspec list --json` 获取可用 change，并请用户选择一个

   始终说明："Using change: &lt;name&gt;"，以及如何覆盖它（例如 `/openspec-apply-change <other>`）。

2. **检查 status 以了解 schema**

   ```bash
   openspec status --change "<name>" --json
   ```

   解析 JSON 以了解：
   - `schemaName`：正在使用的工作流（例如 "spec-driven"）
   - `planningHome`、`changeRoot` 和 `actionContext`：规划范围与编辑约束
   - 哪个 artifact 包含 task（对 spec-driven 通常是 "tasks"，其他情况请检查 status）

3. **获取 apply 指令**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   这会返回：
   - `contextFiles`：artifact ID -> 具体文件路径数组（随 schema 而异——可能是 proposal/specs/design/tasks，也可能是 spec/tests/implementation/docs）
   - 进度（总数、已完成、剩余）
   - task 列表，含状态、来源路径和来源行号
   - 基于当前状态的动态指令
   - 可选的 `context`：来自所选根目录的当前必需项目指令输入
   - 可选的 `operationGuidance`：针对 apply 的当前建议性指导
   - `missingArtifacts`（存在时）：尚无输出的必需 artifact id

   **处理各种状态：**
   - 如果 `state: "blocked"`：展示消息并暂停实现。
     - 如果 `missingArtifacts` 非空：建议使用 `/openspec-continue-change` 来创建它们。
     - 否则，遵循 CLI 指令，根据已有的规划 artifact 创建或修复 schema 配置的跟踪文件。在阻塞状态下，不要假定另一个 artifact 已就绪，也不要开始实现。
   - 如果 `state: "all_done"`：报告所有被跟踪的 task 均已完成，并建议在 archive 之前进行适当的 review 或验证
   - 其他情况：继续进入实现

   把 `context` 视为必需的 prompt 级输入。阅读并考虑它，并在实现过程中应用相关的项目事实、约定和约束。
   把 `operationGuidance` 视为可选的附加建议。阅读并考虑每一条，并遵循那些适用且与内置工作流兼容的条目。

   让这两个字段与 CLI 返回的状态、缺失的 artifact、task、进度、`contextFiles` 以及内置的 `instruction` 保持分离。它们不是 task 已完成的证据，不替代内置指令，也不允许绕过阻塞状态。如果 context 与内置指令、用户的明确选择或 CLI 控制的值冲突，请报告冲突并保留起控制作用的值。如果 guidance 不适用或与那些控制性输入冲突，就不要遵循它，并说明原因。这些是 prompt 级的行为契约，不是可强制执行的检查。

4. **读取上下文文件**

   读取 apply 指令输出中 `contextFiles` 下列出的每一个文件路径。
   这些文件取决于所使用的 schema：
   - **spec-driven**：proposal、specs、design、tasks
   - 其他 schema：遵循 CLI 输出中的 contextFiles

   除非用户另行要求这些内容，否则不要把 `context` 或 `operationGuidance` 原样复制到实现文件或规划 artifact 中。

5. **展示当前进度**

   显示：
   - 正在使用的 schema
   - 进度："N/M tasks complete"
   - 剩余 task 概览
   - 来自 CLI 的动态指令

6. **实现 task（循环直到完成或被阻塞）**

   对每个待办 task：
   - 显示正在处理哪个 task
   - 进行所需的代码修改
   - 保持改动最小且聚焦
   - 在编辑之前，确认返回的 `sourcePath` 和 `line` 处的复选框仍与 task 描述相符；若不符，重新运行 apply 指令并使用刷新后的位置
   - 在其返回的 `sourcePath` 和 `line` 处标记 task 完成：`- [ ]` → `- [x]`
   - 重新运行 apply 指令，确认该 task 现在已完成且进度已变化
   - 继续下一个 task

   **遇到以下情况时暂停：**
   - task 不清楚 → 请求澄清
   - 实现过程中暴露出设计问题 → 建议更新 artifact
   - 某个 task 需要的工作超出 spec 和 tasks 所描述的范围，或者你试图删减、收窄、推迟或接受对既定行为的例外以使其适配 → 明确指出新增范围并询问；不要默默吞下它
   - 遇到错误或阻塞 → 报告并等待指导
   - 用户打断

7. **完成或暂停时，展示状态**

   显示：
   - 本次会话完成的 task
   - 总体进度："N/M tasks complete"
   - 若全部完成：报告被跟踪的 task 均已完成，并建议在 archive 之前进行适当的 review 或验证
   - 若已暂停：说明原因并等待指导

**实现过程中的输出**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**完成时的输出**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tracked tasks are complete. Review or verify the change as appropriate
before archiving. You can archive this change with `/openspec-archive-change`.
```

**暂停时的输出（遇到问题）**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**选项：**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**护栏**

- 持续处理 task，直到完成或被阻塞
- 开始前始终读取上下文文件（来自 apply 指令输出）
- 如果 task 有歧义，暂停并在实现之前询问
- 如果实现暴露出问题，暂停并建议更新 artifact
- 保持代码改动最小，并限定在每个 task 的范围内
- 每完成一个 task 后立即更新其复选框
- 遇到错误、阻塞或需求不清时暂停——不要猜测
- 当某个 task 需要超出 spec 所描述范围的工作时，明确指出新增范围并暂停——绝不默默收窄、推迟或简化掉既定行为
- 只有当某个 task 的既定行为被完整实现时，才把它标记为 `- [x]`；部分完成或被推迟时不要标记
- 使用 CLI 输出中的 contextFiles，不要假定具体文件名
- 使用每个 task 的 sourcePath 和 line 来更新其准确的复选框
- 不要把 context 或 operation guidance 当作 task 已完成的证据
- 应用相关的项目上下文；报告与起控制作用的工作流输入的冲突
- 考虑每一条 guidance；解释任何不适用或冲突的建议
- 不要把运行时上下文或 operation guidance 复制到实现文件或规划 artifact 中
- 保留 CLI 控制的 blocked/ready/all-done 行为与完成标准

**流动式工作流集成**

这个 skill 支持"对 change 执行动作"的模型：

- **可随时调用**：在所有 artifact 完成之前（若 task 已存在）、部分实现之后，或与其他动作交错进行
- **允许更新 artifact**：如果实现暴露了设计问题，建议更新 artifact——不按阶段锁定，流动地工作
