# OpenSpec Agent 契约 {#openspec-agent}

`openspec` CLI 的机器可读接口面，已对照 `src/` 验证（capstone 审计，2026-06-11）。下文每个结构均依据生成该输出的代码记录。

## 1. 通用约定 {#agent-contract-2}

- **每次调用一个 JSON 文档。** 在 `--json` 模式下，stdout 只承载一个 JSON 文档（2 空格美化打印）。人类可读的说明文字、spinner 和 store banner 都写入 stderr。
- **Store banner。** 在人类模式下，选中 store 的根会向 stderr 打印 `Using OpenSpec root: <id> (<path>)`。JSON 模式下绝不打印。
- **键名大小写风格因接口面而异**（见「已知不一致」）：store/doctor/context 载荷使用 `snake_case`；workflow 载荷（`status`、`instructions`、`new change`、`validate`、`list`）使用 `camelCase`，但内嵌的 `root` 对象例外，它始终使用 `store_id`。
- **可选键通常被省略而非置为 null**（例如 `root.store_id`、`member.path`）。使用显式 `null` 的例外会按结构逐一标注（store doctor 的 `git.*`、失败载荷）。

## 2. 诊断信封 {#agent-contract-3}

所有机器可读的诊断共享同一种信封结构（`StoreDiagnostic`）：

```json
{
  "severity": "error" | "warning" | "info",
  "code": "snake_case_string",
  "message": "human sentence",
  "target": "dotted.surface (optional)",
  "fix": "one actionable sentence/command (optional)"
}
```

诊断出现在两个位置：用于健康发现的**状态数组**（顶层或逐条目的 `status: StoreDiagnostic[]`），以及**抛出的错误**——命令失败时转换为单元素的 `status` 数组。

## 3. 根选择与 `RootOutput` {#agent-contract-4}

所有解析根的命令（`list`、`show`、`validate`、`status`、`instructions`、`instructions apply`、`instructions archive`、`new change`、`archive`、`doctor`、`context`、`schemas`）都按同一优先级解析出一个 OpenSpec 根：

1. `--store <id>` → 已注册 store 的根（`source: "store"`）。
2. 否则，最近的含 `openspec/` 的祖先目录：planning 形态 → `source: "nearest"`（`store:` 指针被忽略并给出 stderr 警告）；仅含配置且带有效 `store:` 指针的目录 → 该 store，`source: "declared"`。
3. 无最近根 + 设置了全局 `defaultStore`（`openspec config set defaultStore <id>`）→ 该 store，`source: "global_default"`；id 失效会以底层 store 错误失败，并在 `fix` 中给出 `openspec config unset defaultStore`。
4. 无最近根、无默认值 + 存在已注册 store → 错误 `no_root_with_registered_stores`。
5. 无根、无默认值、无 store：命令可将 cwd 视为 `source: "implicit"`；而 `doctor`、`context`、`list` 和批量 `validate` 则以 `no_openspec_root` 失败。`list` 对带有 `openspec/project.md` 的遗留项目保留隐式回退。

成功的 JSON 载荷通常内嵌根；而成功的 `schemas --json`
有意保持为 §4.13 记录的兼容性裸数组：

```json
"root": { "path": "/abs/path", "source": "store" | "declared" | "global_default" | "nearest" | "implicit", "store_id": "id (only when store-selected)" }
```

**根失败契约**：在 JSON 模式下，解析失败会在 stdout 打印 `{ ...commandNullShape, "status": [diagnostic] }` 并以 1 退出。

## 4. 命令 JSON 结构 {#agent-contract-5}

### 4.1 `list --json` {#agent-contract-6}

`{ "changes": [ { "name", "completedTasks", "totalTasks", "lastModified", "status": "no-tasks"|"complete"|"in-progress", "nested"?: ["<area>/<name>", ...] } ], "warnings"?: [ { "code", "name", "nested", "message" } ], "root": RootOutput }` —— 注意此处逐 change 的 `status` 是字符串枚举。`--specs`：`{ "specs": [ { "id", "requirementCount" } ], "root" }`。

`warnings`（为空时省略）报告 `changes/` 下并非 change 的目录。目前唯一的 code 是 `nested_change_directory`：一个包裹 change 目录的命名空间文件夹，OpenSpec 无法寻址它，因为 change 始终是直接位于 `changes/` 下的目录。同一条目在被列出的 change 上携带 `nested`，此时该 change 的 `status` 无意义。不要把这类条目当作 change；报告其消息并保持这些目录不变。

### 4.2 `show <item> --json` {#agent-contract-7}

Change：`{ "id", "title", "deltaCount", "deltas": [...], "root" }`。Spec：`{ "id", "title", "overview", "requirementCount", "requirements": [...], "metadata": { "version", "format", "sourcePath"? }, "root" }`。requirement，无论在 spec 中还是在 change delta 的 `requirement`/`requirements` 中，均为 `{ "name", "text", "scenarios": [ { "name", "rawText" } ] }`。requirement 的 `name` 是其标题去掉 `Requirement:` 和末尾的 `#` run 后的文本，也是 archive 匹配 MODIFIED/REMOVED/RENAMED 条目时所依据的精确名称。scenario 的 `name` 是其四级标题去掉 `Scenario:` 和末尾的 `#` run 后的文本，也是 MODIFIED 的场景丢失检查所比较的名称。

### 4.3 `validate --json` {#agent-contract-8}

`{ "items": [ { "id", "type": "change"|"spec", "valid", "issues": [ { "level", "path", "message", "line"?, "column"? } ], "durationMs" } ], "summary": { "totals": {items,passed,failed}, "byType": {...} }, "version": "1.0", "root" }`。任一条目失败即以 1 退出。

### 4.4 `status --json` {#agent-contract-9}

`{ "changeName", "schemaName", "planningHome"?: { "kind", "root", "changesDir", "defaultSchema" }, "changeRoot", "artifactPaths": { "<id>": {outputPath, resolvedOutputPath, existingOutputPaths} }, "nextSteps": ["..."], "actionContext": { "mode": "repo-local", "sourceOfTruth": "repo", "planningArtifacts", "linkedContext", "allowedEditRoots", "requiresAffectedAreaSelection", "constraints" }, "isPlanningComplete", "isComplete", "applyRequires", "artifacts": [ {id, outputPath, status: "done"|"skipped"|"ready"|"blocked", requires, missingDeps?} ], "root" }`。对于由 store 选中的根，若当前路径上最近的项目是仅含配置、其 `store:` 指针指向该 store 的根，则 `allowedEditRoots` 为 `[<declaring project>, <store>]`，否则为 `[<store>]`（包括全局 `defaultStore` 的情形），并附带一条约束，要求 agent 询问应编辑哪个仓库。OpenSpec 不会把 store 的 task 路由到各仓库，因此 declaring project 就是当前项目，而不是该 change 触及的每个仓库。`isPlanningComplete` 表示所有未跳过的 planning artifact 都存在；被跳过的 artifact 视为已满足，无需创建。它不表示实现 task 已完成。`isComplete` 作为兼容别名保留，取值相同。每个 artifact 的 `requires` 是其直接依赖 id（任何 status 下都会出现，因此即使 artifact 为 `done` 也能算出传递性必需集合）；`missingDeps` 仅在 `blocked` 时出现。`artifacts` 数组按依赖顺序排列，schema 中 `artifacts:` 的声明顺序用于打破同时变为 ready 的 artifact 之间的平局（绝不按字母顺序），因此第一个 `ready` 条目就是接下来要写的 artifact；`missingDeps` 使用同一顺序。`"skipped"` 表示该 artifact 的 `generates` 路径位于 `specs/` 下，且该 change 的 `.openspec.yaml` 声明了 `skip_specs: true`；它满足依赖但不得创建。无活跃 change 时：`{ "changes": [], "message", "root" }`，退出码 0。

`--all`（批量，与 `--change` 互斥 —— 组合使用会以 `{ "changes": [], "root": null, "status": [d] }` 的 null 形状报错）：`{ "changes": [ <per-change status object, no per-change root>, ... ], "root" }`，按 change 名称排序。加载失败的 change 会就地贡献 `{ "changeName", "status": [d] }`；扫描继续进行，保留完整信封，并在文本与 JSON 两种模式下都以 1 退出。无效的 `--schema` 会使整个调用以 null 形状失败，即使不存在任何 change。

### 4.5 `instructions <artifact> --json` {#agent-contract-10}

`{ "changeName", "artifactId", "schemaName", "changeDir", "planningHome"?, "outputPath", "resolvedOutputPath", "existingOutputPaths", "description", "instruction"?, "context"?, "rules"?, "references"?: ReferenceIndexEntry[], "skipped"?, "warning"?, "template", "dependencies": [{id,done,path,description,skipped?}], "unlocks", "root" }`。`unlocks` 按 schema 的声明顺序（与 `status` 推荐它们的顺序相同）列出该 artifact 使之变为 ready 的 artifact。当 change 声明 `skip_specs: true` 且此 artifact 被跳过时，会出现 `"skipped": true`（以及 `"warning"`）—— 不要创建其文件。带 `skipped: true` 的依赖条目无需文件即已满足 —— 不要尝试读取其路径。

`ReferenceIndexEntry`：`{ "store_id", "root"?, "specs"?: [{id,summary}], "fetch"?, "status": [] }` —— 已解析条目携带 root/specs/fetch；未解析条目携带 store_id + warning 状态。索引上限 50KB（`reference_index_truncated`）。

### 4.6 `instructions apply --json` {#agent-contract-11}

`{ "changeName", "changeDir", "schemaName", "contextFiles": { "<artifactId>": ["/abs", ...] }, "progress": {total,complete,remaining}, "tasks": [{id,description,done}], "state": "blocked"|"all_done"|"ready", "missingArtifacts"?, "missingPrerequisites"?, "warnings"?, "instruction", "references"?, "context"?, "operationGuidance"?, "root" }`。`missingArtifacts` 是 apply 阻塞所依据的内容（schema 的 `apply.requires`）；`missingPrerequisites` 是 apply 可运行之前仍需构建的所有内容，按构建顺序排列 —— 即这些 requires 的传递闭包，因此它可能是更长的列表。`warnings` 列出 change 自身不阻塞的问题 —— 目前是：一个已可实施、但没有 delta spec 且没有 `skip_specs: true` 的 change，也就是 `openspec validate` 拒绝的状态。两个可选根字段（`context`、`operationGuidance`）在每次调用时都从选中的根读取。`context` 是必需的提示词级输入，其相关项目事实、约定与约束必须被应用；`operationGuidance` 是建议性输入，只有在适用且与内置 workflow 兼容时才遵循其条目。两者都独立于 state、tasks、progress、context 文件和内置 instruction。

### 4.7 `instructions archive --json` {#agent-contract-12}

`{ "changeName", "context"?, "operationGuidance"?, "root" }`。要求在解析出的 repo/store 根中存在有效的 `--change`，并采用与 apply 相同的必需上下文/建议性指导语义。这是一个只读的运行时输入接口面：它不返回静态 archive workflow，不检查或合并 delta spec，不写入主 spec，也不移动 change。

### 4.8 `new change <name> --json` {#agent-contract-13}

成功：`{ "change": { "id", "path", "metadataPath", "schema" }, "root" }`。失败：`{ "change": null, "status": [d] }`，退出码 1。

### 4.9 `archive <name> --json` {#agent-contract-14}

成功：`{ "archive": { "change", "archivedAs": "YYYY-MM-DD-name", "path", "specsUpdated", "totals"?, "warnings"? }, "root" }`。失败：`{ "archive": null, "root"?, "status": [d] }`，退出码 1。仅当至少有一个 spec 文件被写入或退役时，`specsUpdated` 才为 true（某 capability 的最后一个 requirement 被该 change 移除时，其 spec 会被删除，这要求该 change 的 `.openspec.yaml` 中设置 `retire_capabilities: true`；每次退役都在 `warnings` 中点名，仅当该 spec 曾位于调用方检出的工作区时才给出可直接粘贴的 Git 恢复命令）；已同步的 change 归档时总计全为零，跳过项列在 `warnings` 中。JSON 模式严格非交互：每个提示点都会变成一个 `archive_*` code。

- **`archive: null`**：命令失败。这不保证文件未发生变化。
- **`archive_retirement_cleanup_failed`**：change 已归档，但退役备份校验或清理失败。所列的备份路径可能已改变或消失。消息也可能报告一次失败的 fallback-copy 清理所遗留的暂存源文件。清理前请检查当前 archive 及所有报告的恢复路径。保留任何所需内容。重试 archive 不会清理这些路径。
- **`archive_error`**：此 fallback 诊断不指明文件是否发生变化。重试前请检查 change、archive 及受影响的 spec。

### 4.10 `doctor --json` {#agent-contract-15}

`{ "root": { "path", "source", "store_id"?, "healthy", "status": [] }, "store": { "id", "metadata": {present,valid,remote?}, "origin_url"?, "drift"?: {ahead,behind}, "status": [] } | null, "references": [...], "status": [] }`。`drift`（仅出现在带有上游跟踪引用的 git 支持的 store 检出上）是相对最近一次抓取的上游而非实时远端的 ahead/behind 计数。任何严重级别的健康发现都以 0 退出。失败载荷：`{ "root": null, "store": null, "references": [], "status": [d] }`，退出码 1。

### 4.11 `context --json` {#agent-contract-16}

`{ "root": { "path", "source", "store_id"?, "role": "openspec_root" }, "members": [ { "role": "referenced_store", "id", "path"?, "remote"?, "fetch"?, "status": [] } ], "status": [] }`。AVAILABLE = 存在 path 且 status 为空。`--code-workspace <path>` 写入 `{folders:[{name,path}]}`（仅限可用的 referenced store，带 `ref:` 前缀）；在 JSON 模式下写入会在打印之前执行，因此即使写入失败，stdout 也只包含一个文档。失败：`{ "root": null, "members": [], "status": [d] }`，退出码 1。

### 4.12 `store ... --json` {#agent-contract-17}

setup/register：`{ "store": {id, root, metadata_path?}, "registry": {path, registered, already_registered}, "git": {is_repository, initialized, committed}, "created_files": [], "status": [] }`。unregister/remove：`{ "store", "registry": {path, removed}, "files": {deleted, deleted_path, left_on_disk}, "status": [] }`。list：`{ "stores": [{id, root}], "status": [] }`。doctor：`{ "stores": [ { id, root, metadata_path?, openspec_root: {...healthy, status}, metadata: {present, valid, id?, remote}, git: {is_repository, has_commits, has_uncommitted_changes, has_remote, origin_url}, status } ], "status": [] }`（`null` = 未知/未探测）。健康发现以 0 退出；失败以 1 退出并给出对应的 null 形状。提示取消以 130 退出。

### 4.13 `schemas --json` / `templates --json` {#agent-contract-18}

`schemas`：成功时仍为裸数组 `[ {name, description, artifacts, source} ]`；它按规范的根选择优先级解析，并接受 `--store <id>`。根选择失败：`{ "schemas": [], "root": null, "status": [d] }`，退出码 1。`templates`：键控对象 `{ "<artifactId>": {path, source} }`，仍基于 cwd，不含 root/status 键。

## 5. 退出码契约 {#agent-contract-19}

| 情形                                              | 退出码 | Stdout                                              |
| ------------------------------------------------- | ------ | --------------------------------------------------- |
| 成功，包括健康发现（doctor/context/store doctor） | 0      | 载荷                                                |
| `--json` 模式下的命令失败                         | 1      | 一个含 `status: [d]` 与该命令 null 形状的 JSON 文档 |
| `validate` 存在失败条目                           | 1      | 完整报告                                            |
| 提示取消（`store` 组，人类模式）                  | 130    | 仅 stderr                                           |

## 6. 诊断 code 目录 {#agent-contract-20}

### 解析 {#agent-contract-21}

`no_openspec_root`、`no_root_with_registered_stores`、`no_registered_stores`、`unknown_store`、`store_identity_mismatch`、`unhealthy_store_root`、`store_path_not_supported`、`invalid_store_pointer`、`initiative_option_removed`、`areas_option_removed`；透传：`invalid_store_id`、`invalid_store_registry`、`invalid_store_metadata`。

### OpenSpec 根健康（error，无 fix） {#openspec-error-fix}

`openspec_store_root_missing`、`openspec_store_root_not_directory`、`openspec_root_missing`、`openspec_root_not_directory`、`openspec_config_missing`、`openspec_config_not_file`、`openspec_specs_not_directory`、`openspec_changes_not_directory`、`openspec_archive_not_directory`。在 stores beta 期间，健康的根中 `openspec/specs/`、`openspec/changes/` 和 `openspec/changes/archive/` 可以缺失；只有当它们存在但不是目录时，才构成健康错误。

### Store 注册表/身份/状态 {#store}

`invalid_store_id`、`invalid_store_registry`、`invalid_store_metadata`、`store_registry_busy`、`store_not_found`、`no_store_registry`、`store_registry_changed`、`store_metadata_missing`、`store_metadata_id_mismatch`、`store_metadata_invalid`、`store_id_conflict`、`store_path_conflict`、`store_already_registered`（info）。

### Store 设置/注册/移除 {#store-2}

`store_setup_id_required`、`store_setup_path_required`、`store_setup_path_not_directory`、`store_setup_inside_git_repo`、`store_setup_non_empty_directory`、`store_setup_cancelled`、`store_path_required`、`store_path_missing`、`store_path_not_directory`、`store_root_pointer_declared`、`store_register_root_unhealthy`、`store_register_identity_confirmation_required`、`store_register_cancelled`、`store_remote_empty`、`store_remote_requires_hand_edit`、`store_remove_confirmation_required`、`store_remove_cancelled`、`store_remove_path_not_directory`、`store_remove_metadata_missing`、`store_remove_contains_registered_store`、`store_root_missing`（remove 中为 warning，doctor 中为 error）、`store_root_not_directory`。

### Store 的 git 操作 {#store-git}

`store_git_init_failed`、`store_git_identity_missing`、`store_git_commit_failed`、`store_git_no_commits`（warning）、`store_clone_fragile_directories`（warning）、`store_remote_divergence`（info，doctor）、`store_checkout_drift`（info，doctor）。

### References（警告） {#references}

`reference_invalid_id`、`reference_registry_unreadable`、`reference_unresolved`、`reference_root_unhealthy`、`reference_index_truncated`。

### 关系（warning；doctor；context 只保留注册表相关的那一个） {#warningdoctorcontext}

`relationship_registry_unreadable`、`root_pointer_ignored`、`root_pointer_invalid`、`pointer_declarations_inert`。

### Archive（JSON 模式） {#archivejson}

`archive_change_name_required`、`archive_change_not_found`、`archive_change_symlink`、`archive_validation_failed`、`archive_confirmation_required`、`archive_tasks_incomplete`、`archive_spec_update_failed`、`archive_spec_validation_failed`、`archive_target_exists`、`archive_retirement_cleanup_failed`、`archive_error`。

### Context 写入 {#context}

`context_file_exists`、`context_output_dir_missing`。

### 兜底 {#agent-contract-30}

`doctor_failed`、`context_failed`、`store_error`、`change_error`、`archive_error`。

## 已知不一致 {#agent-contract-31}

由 capstone 审计记录；已发布键的重命名属于本次发布之后才处理的产品决策：

1. ~~在 `--json` 模式下，若干失败路径只打印 stderr 而没有 JSON 文档。~~ 已在 capstone gauntlet 轮修复：`show`/`validate` 遇到未知与歧义条目时输出 `{status:[{code: unknown_item | ambiguous_item, ...}]}`；`status`/`instructions`/`list`/`show`/`validate` 中抛出的错误经由支持 JSON 的失败辅助函数处理（该命令的 null 形状 + `status`）；`store <unknown subcommand> --json` 输出 `{status:[{code: unknown_store_subcommand}]}`；`list` 在解析失败时携带其 `{changes|specs: [], root: null}` null 形状。
2. `store_root_missing` 以两种严重级别出现（remove 中为 warning，store doctor 中为 error）—— 依上下文而定，上文已记录。
3. snake_case（store 系列）对 camelCase（workflow 系列）的键名大小写；`root.store_id` 在各处都是 snake_case。
4. src 中存在四个并行的信封类型声明；archive 诊断从不携带 `target`。
5. `list --json` 将 `status` 键复用为逐 change 的字符串枚举。
6. 只有 `validate` 的输出携带 `version` 字段。
7. `templates` 忽略根选择（基于 cwd，无 `--store`）。
8. 已废弃的名词形式（`change`/`spec` 子命令）输出不带信封的载荷，既无 `root` 也无 `status`。
