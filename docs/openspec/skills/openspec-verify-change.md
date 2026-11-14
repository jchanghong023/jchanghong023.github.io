---
name: openspec-verify-change
description: 验证实现与 OpenSpec change 的 artifact 相符。当用户希望在归档之前确认实现完整、正确且连贯时使用；也适用于用户说 "openspec verify" 或 "opsx verify" 的情况。
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: 需要 openspec CLI。
metadata:
  author: openspec
  version: '1.0'
---

# openspec-verify-change 技能 {#openspec-verify-change}

验证实现是否与 change 的 artifact（spec、task、design）相符。

**Store 选择：** 如果用户指定了某个 store（store 是本机上已注册的独立 OpenSpec 仓库），或者工作本身位于某个 store 中，先运行 `openspec store list --json` 获取已注册的 store id，然后在读写 spec 与 change 的命令上传入 `--store <id>`（`new change`、`status`、`instructions`、`list`、`show`、`validate`、`archive`、`doctor`、`context`、`schemas`、`view`）。一旦选定，请将 `--store <id>` 视为在后续 workflow 中持续生效。下文这些命令中每个未限定作用域的示例都是简写：运行前先补上该标志。例如应运行 `openspec status --change "<name>" --json --store "<id>"`，而不是下方所示的未限定形式。其他命令不接受该标志。命令打印的提示已经带有该标志；请在后续调用中保持携带。没有 store 时，命令作用于最近的本地 `openspec/` 根。

**项目检查：** 以下步骤假定项目已在使用 OpenSpec。在第一个会写入任何内容的步骤（`new change`、`archive`、`sync specs` 或编写 artifact 文件）之前，先确认项目有根：运行 `openspec list --json`（选中 store 时带 `--store <id>`，因为此时 store 就是根）并读取 `root`。存在 root 对象表示项目已完成设置。`"root": null` 表示尚未设置 —— 此处没有 `openspec/` 目录，而像 `openspec new change` 这样的写入操作会作为副作用创建它。该命令也会以非零码退出，那是同一个答案而非 CLI 故障，因此应读取 JSON，而不是重试或绕过它。

有一种 `"root": null` 与设置无关：当 `status` 的错误消息以 `Declared in` 或 `Invalid store declaration in` 开头，并指出本项目的 `openspec/config.yaml`（或 `config.yml`）时，说明该项目确实通过它声明的某个 store 在使用 OpenSpec，只是本机无法解析该 store（store 未注册，或 `store:` 行格式错误）。不要把它当作未初始化而跳过下面的分支：在写入前停下，向用户展示该错误的 `message` 与 `fix`。

除此之外，在没有根的情况下，接下来怎么做取决于进入该 workflow 的方式：

- **自动选择**：你自行选择了该 workflow，用户既未提到 OpenSpec，也未点名本 skill 或以名称调用本 skill。停止使用 OpenSpec，按常规方式回答请求，如同未安装 OpenSpec。不要要求用户做任何设置，也不要提及 OpenSpec 设置。
- **显式 OpenSpec 请求**：用户提到了 OpenSpec、点名本 skill，或以名称调用了本 skill。在写入前停下，询问如何处理：为本项目完成设置（`openspec init`）、指向他们已有的 store（`--store <id>`），或本次请求不使用 OpenSpec 继续。等待用户回答。

在两种分支中，都绝不可作为副作用创建根：在用户要求之前不要运行 `openspec init`，不要手工创建 `openspec/` 文件，也不要让某条命令创建它。

**输入**：可选地指定 change 名称。若省略，检查能否从对话上下文中推断。若含糊或不明确，你必须提示用户从可用 change 中选择。

**步骤**

1. **选择 change**

   若提供了名称，直接使用。否则：
   - 若用户在对话中提到某个 change，则从对话上下文推断
   - 若只存在一个活跃 change，自动选择它
   - 若存在歧义，运行 `openspec list --json` 获取可用 change 并请用户选择

   提示时，展示 list 返回的所有活跃 change，包括 `status: "no-tasks"` 的 change。
   如可获得，包含每个 change 使用的 schema。
   将任务未完成的 change 标记为 "(In Progress)"。

   始终声明："Using change: &lt;name&gt;" 以及如何覆盖（例如 `/openspec-verify-change <other>`）。

2. **检查 status 以了解 schema**

   ```bash
   openspec status --change "<name>" --json
   ```

   解析 JSON 以了解：
   - `schemaName`：所使用的 workflow（例如 "spec-driven"）
   - `planningHome`、`changeRoot`、`artifactPaths` 和 `actionContext`：路径与作用域上下文
   - 该 change 存在哪些 artifact

3. **获取 planning 上下文并加载 artifact**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   该命令返回 change 目录、`contextFiles`（artifact ID -> 具体文件路径数组）、`taskTrackingConfigured`，以及从 schema 的 `apply.tracks` 配置所匹配且可读取的每个具体文件中聚合出的顶层 `tasks` 和 `progress`。读取 `contextFiles` 中所有可用的 artifact。

   将 apply 的 `state` 与 `instruction` 视为上下文，而非验证结论。验证期间不要实现 task，也不要归档 change。

4. **初始化验证报告结构**

   建立包含三个维度的报告结构：
   - **Completeness（完整性）**：跟踪 task 与 spec 覆盖
   - **Correctness（正确性）**：跟踪 requirement 实现与 scenario 覆盖
   - **Coherence（连贯性）**：跟踪 design 遵循情况与模式一致性

   每个维度都可能存在 CRITICAL、WARNING 或 SUGGESTION 级别的问题。

   验证是建议性的。尊重有意的省略，例如 `skip_specs: true`、可选的 design 文档，以及不跟踪 task 的 schema。不要为了获得一份干净的报告而要求或臆造可选或被有意省略的 artifact。`Not verified` 描述的是本报告的局限，而不是新的 archive 前置条件。archive 保留其自身的检查与用户确认行为。

   将 schema 未定义的检查、或 status 报告为有意跳过的 artifact，标记为 **Not applicable**。若某个 change 可读的 delta spec 只含 REMOVED 或 RENAMED requirement 而不含 ADDED 或 MODIFIED requirement，其正确性检查同样为 **Not applicable**（见第 6 步）。将它们排除在跳过检查计数与 archive 就绪评估之外。**Not verified** 仅保留给适用但证据缺失或不可用的检查。

   若适用检查只有 task 相关证据，则仅验证 task 完成情况，并将其余适用检查（包括 **Code Pattern Consistency**）标记为 not verified，理由为 "Only task evidence available"。

   若 artifact 无法读取，或其中没有可用的 requirement、scenario 或 design 决策，则将受影响的检查标记为 not verified，并给出具体原因。继续执行其余证据支持的检查，但仅部分检查过的输入集不构成完全验证过的检查。requirement 缺失会影响 Spec Coverage 与 Requirement Implementation Mapping；scenario 缺失会影响 Scenario Coverage；design 决策缺失会影响 Design Adherence。

5. **验证 Completeness**

   **Task Completion**：
   - 若 `taskTrackingConfigured` 为 false，将 **Task Completion** 报告为 not applicable。不要把空的 `tasks` 当作缺失证据。
   - 否则，使用顶层 `tasks` 与 `progress` 字段。它们已聚合 `apply.tracks` 匹配的所有可读具体文件，与所跟踪 artifact 的 ID 无关；不要根据 `contextFiles` 的某个键来推断是否跟踪。
   - 若 `unavailableTrackingFiles` 非空，将 **Task Completion** 标记为 not verified，并列出每个不可用路径及原因。仍可使用任何可读的 task 证据，但不要根据不完整的 `tasks` 与 `progress` 字段推断完成情况。
   - 若 `taskTrackingConfigured` 为 true 而 `tasks` 为空，将 **Task Completion** 标记为 not verified，并记录来自 apply `state` 与 `instruction` 的原因。仅有非零总数并不能构成可评估的 task 描述。
   - 根据 `progress` 报告已完成与总 task 数。
   - 若 `progress.remaining` 大于 0：
     - 为每个列出的未完成 task 添加 CRITICAL 问题。若剩余数量超过所列未完成 task 数，还要报告没有描述的未完成复选框，并建议补充描述后完成。不要仅凭所列 task 推断完成情况。
     - 建议："Complete task: &lt;description&gt;" 或 "Mark as done if already implemented"

   **Spec Coverage**：
   - 若 status 将该 spec artifact 标记为因 `skip_specs: true` 而跳过，或 schema 未定义任何 spec artifact（没有任何 artifact 的 `artifactPaths.<id>.outputPath` 位于 `specs/` 下），则将依赖 spec 的检查报告为 not applicable。
   - 否则，`contextFiles` 以 artifact id 为键，而 artifact id 来自当前活跃 schema，因此不要假定某个 id 一定叫 `specs`。spec artifact 是指 `artifactPaths.<id>.outputPath` 位于 `specs/` 下的那些 artifact；从 `contextFiles.<id>` 读取其文件。若这些 spec 文件缺失或为空，则将 **Spec Coverage**、**Requirement Implementation Mapping** 和 **Scenario Coverage** 标记为 not verified；不要把其中任何一项视为干净通过。
   - 若这些 spec 文件中存在 delta spec：
     - 提取所有 requirement（标记为 "### Requirement:"，或以 `FROM:`/`TO:` 对的形式列在 `## RENAMED Requirements` 下），并记录每个 requirement 所属的 delta 区块：`## ADDED`、`## MODIFIED`、`## REMOVED` 或 `## RENAMED Requirements`。区块决定该检查要查找什么。
     - 对每个 ADDED 或 MODIFIED requirement（对 MODIFIED，检查 delta 中的文本，而非旧措辞）：
       - 在代码库中搜索与该 requirement 相关的关键词
       - 评估实现是否可能存在
     - 若 ADDED 或 MODIFIED requirement 看似未实现：
       - 添加 CRITICAL 问题："Requirement not found: &lt;requirement name&gt;"
       - 建议："Implement requirement X: &lt;description&gt;"
     - 对每个 REMOVED requirement，该 change 要求该行为消失，因此需反转检查：
       - REMOVED 区块只携带 requirement 名称以及可能的 `**Reason**`/`**Migration**` 说明，因此 delta 本身并不描述该行为。搜索前，先在主 spec 的 `<planningHome.root>/openspec/specs/<capability-path>/spec.md` 中读取基线 requirement，使用与 delta spec 相同的 capability 路径。按精确规范化名称匹配它，这也是 OpenSpec 应用 REMOVED 区块时采用的规则：`Requirement:` 之后的标题文本，去除首尾空白，仅当末尾 `#` run 前有空格或制表符时才去掉该 run（因此 `C#` 保留其 `#`），并进行区分大小写的比较。措辞相近的标题不算匹配；重命名应归入 RENAMED。其正文与 scenario 才是「必须消失的行为」的证据；绝不要仅凭 requirement 名称进行搜索。
       - 若该文件中没有该精确规范化名称的 requirement —— 例如早前的 sync 已应用该移除，或某个名称相近的 ADDED requirement 替换了它 —— 请从同一文件的历史中恢复基线，且应在 planning 仓库而非当前目录中执行：`git -C "<planningHome.root>" log -p -- openspec/specs/<capability-path>/spec.md`，或在确定应用该移除的 commit 后执行 `git -C "<planningHome.root>" show <commit>^:./openspec/specs/<capability-path>/spec.md`。输出为空表示 pathspec 未匹配任何内容，而非没有基线：`git log` 会把不匹配的路径报告为成功，因此在根据「无输出」下任何结论之前，先重新核对路径。
       - 若基线除自身标题外没有任何内容 —— 除名称复述之外没有正文，也没有 scenario —— 则该证据不可用，与缺少基线相同。若两个位置都得不到可用基线，则将该条目的 **Spec Coverage** 标记为 not verified 并给出原因，然后就此停止：不要搜索，也绝不把未经搜索的移除计为通过。
       - 在代码库中搜索该行为。`openspec/` 的 artifact 或文档中的匹配，或仅为 Migration 说明或某个 ADDED requirement 服务的代码中的匹配，本身都不构成证据。报告任何仍在提供该被移除行为的代码路径，包括与某个 ADDED requirement 共用的路径。
       - 找不到实现是预期结果，但前提是你搜索的确实是基线行为。绝不把 REMOVED requirement 报告为 "Requirement not found"，也绝不建议去实现它。
       - 若该行为仍然存在：
         - 添加 CRITICAL 问题："Removed requirement still implemented: &lt;requirement name&gt;"
         - 建议："Remove the remaining implementation at &lt;file&gt;:&lt;lines&gt;, following the requirement's Migration note if it has one"
     - 对每个 RENAMED 条目（`FROM:`/`TO:`），名称改变而行为不变，因此要针对该未变行为检查 TO requirement：
       - 不要将 FROM 名称报告为缺失，也不要要求重命名代码符号、标识符或文件名。
       - 若 TO 名称也出现在 MODIFIED 下，其行为已在彼处按 MODIFIED 文本检查；此处跳过。
       - 否则，在主 spec 的 `<planningHome.root>/openspec/specs/<capability-path>/spec.md` 中读取基线 requirement，使用与 delta spec 相同的 capability 路径：即 FROM 名称下的 requirement，或仅在因主 spec 已同步而缺少 FROM 名称时使用 TO 名称。其正文与 scenario 就是 TO requirement 所保留行为的证据。
       - 在代码库中搜索该行为，并评估它是否仍被实现。
       - 若看似未实现：
         - 添加 CRITICAL 问题："Renamed requirement not found: &lt;TO name&gt;"
         - 建议："Restore the behavior of &lt;TO name&gt; (renamed from &lt;FROM name&gt;); a rename must not change behavior"
       - 若基线 requirement 无法找到或读取，则将该条目的 **Spec Coverage** 标记为 not verified 并给出原因。绝不把未检查的重命名计为通过。

6. **验证 Correctness**

   若 delta spec 可读且至少含有一个 REMOVED 或 RENAMED requirement，但不含 ADDED 或 MODIFIED requirement（该 change 仅移除或重命名 requirement），则将 **Requirement Implementation Mapping** 与 **Scenario Coverage** 报告为 **Not applicable**。Spec Coverage 下的 REMOVED 与 RENAMED 检查才是此类 change 的证据（每个具有可用基线的 REMOVED 与 RENAMED 条目都在那里对照其基线行为检查，而那里已标记为 not verified 的条目仍保持 not verified），因此不要把这两项检查标记为 not verified。完全没有可解析 requirement 的 delta spec 属于不可用证据，而非仅移除类 change：请将这些检查标记为 not verified。

   **Requirement Implementation Mapping**：
   - 对 delta spec 中的每个 ADDED 或 MODIFIED requirement（REMOVED 条目以及没有 MODIFIED 区块的 RENAMED 条目已在 Spec Coverage 中处理）：
     - 在代码库中搜索实现证据
     - 若找到，记录文件路径与行范围
     - 评估实现是否符合 requirement 意图
     - 若发现偏差：
       - 添加 WARNING："Implementation may diverge from spec: &lt;details&gt;"
       - 建议："Review &lt;file&gt;:&lt;lines&gt; against requirement X"

   **Scenario Coverage**：
   - 对 delta spec 中 ADDED 或 MODIFIED requirement 下的每个 scenario（标记为 "#### Scenario:"）：
     - 检查代码中是否处理了相应条件
     - 检查是否存在覆盖该 scenario 的测试
     - 若 scenario 看似未被覆盖：
       - 添加 WARNING："Scenario not covered: &lt;scenario name&gt;"
       - 建议："Add test or implementation for scenario: &lt;description&gt;"
   - 跳过 REMOVED requirement 下的 scenario；该行为本就应该消失。

7. **验证 Coherence**

   **Design Adherence**：
   - 若 schema 未定义任何 design artifact（既没有 id 为 `design` 的 artifact，也没有 `artifactPaths.<id>.outputPath` 等于或以 `design.md` 结尾的 artifact），则将 **Design Adherence** 报告为 not applicable。
   - 若 design artifact 的 `contextFiles.<id>` 文件存在：
     - 提取关键决策（查找类似 "Decision:"、"Approach:"、"Architecture:" 的章节）
     - 验证实现是否遵循这些决策
     - 若发现矛盾：
       - 添加 WARNING："Design decision not followed: &lt;decision&gt;"
       - 建议："Update implementation or revise design.md to match reality"
   - 否则，若 design artifact 的 `contextFiles.<id>` 文件缺失或为空：将 **Design Adherence** 标记为 not verified。在有其他支撑 artifact 时，**Code Pattern Consistency** 仍会运行；仅 task 的情形仍限于 task 完成情况。

   **Code Pattern Consistency**：
   - 若无法识别实现改动，将 **Code Pattern Consistency** 标记为 not verified，并说明缺失的证据。
   - 否则，对照项目模式审查新代码的一致性
   - 检查文件命名、目录结构、编码风格
   - 若发现显著偏差：
     - 添加 SUGGESTION："Code pattern deviation: &lt;details&gt;"
     - 建议："Consider following project pattern: &lt;example&gt;"

8. **生成验证报告**

   **汇总记分卡**：

   ```markdown
   ## Verification Report: <change-name>

   ### Summary

   | Dimension    | Status            |
   | ------------ | ----------------- |
   | Completeness | X/Y tasks, N reqs |
   | Correctness  | M/N reqs covered  |
   | Coherence    | Followed/Issues   |
   ```

   在每个 Status 单元格中，报告已运行检查的结果，并为每个被跳过的检查写出 `Not verified (<reason>)`。若某维度内所有检查都被跳过，则以 `Not verified` 开始该单元格。绝不要把被跳过的检查计为通过。在最终评估中，把每个 not verified 或仅部分验证的检查都视为跳过。N 中只计入 ADDED 与 MODIFIED requirement，并单独报告 REMOVED 与 RENAMED requirement（例如 "1 removal confirmed, 1 rename verified"，或 "1 removal not verified (baseline unavailable)"）。对于仅移除或重命名 requirement 的 change，Correctness 单元格内容为 `Not applicable (no ADDED or MODIFIED requirements)`。

   **按优先级分类的问题**：

   1. **CRITICAL**（归档前必须修复）：
      - 未完成的 task
      - 缺失的 requirement 实现
      - 已移除的 requirement 仍被实现
      - 已重命名的 requirement 其行为不再被实现
      - 每项都附有具体、可操作的建议

   2. **WARNING**（应当修复）：
      - spec/design 偏差
      - 缺失的 scenario 覆盖
      - 每项都附有具体建议

   3. **SUGGESTION**（建议修复）：
      - 模式不一致
      - 次要改进
      - 每项都附有具体建议

   **最终评估**：
   - 若存在 CRITICAL 问题："X critical issue(s) found. Fix before archiving." 若任何检查被跳过，还要点名每个被跳过的检查及其原因。
   - 若无 CRITICAL 问题、有一个或多个 warning，且没有检查被跳过："No critical issues. Y warning(s) to consider. Ready for archive (with noted improvements)."
   - 若只有 suggestion 且没有检查被跳过："No critical issues or warnings. Z suggestion(s) to consider. Ready for archive (with noted improvements)."
   - 若无问题且没有检查被跳过："All checks passed. Ready for archive."
   - 若任何检查被跳过且没有 CRITICAL 问题：不要声称已就绪。应表述为 "No critical issues found in the checks that ran. <check(s)> not verified: &lt;reason&gt;." 当 warning 计数非零时一并包含。
   - 在每个最终评估中，当 suggestion 计数非零时都需包含。

**验证启发式**

- **Completeness**：聚焦客观的清单项（复选框、requirement 列表）
- **Correctness**：使用关键词搜索、文件路径分析、合理推断 —— 不要求完全确定
- **Coherence**：寻找明显的不一致，不要对风格吹毛求疵
- **误报**：不确定时，优先 SUGGESTION 而非 WARNING，优先 WARNING 而非 CRITICAL
- **可操作性**：每个问题都必须有具体建议，并在适用处给出文件/行引用

**输出格式**

使用清晰的 markdown，包含：

- 汇总记分卡表格
- 按级别分组的问题列表（CRITICAL/WARNING/SUGGESTION）
- 形如 `file.ts:123` 的代码引用
- 具体、可操作的建议
- 不要使用 "consider reviewing" 这类含糊建议
