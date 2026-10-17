# 导出冻结代码审查材料 {#code-review-export}

`/code-review-export`是内置纯工具，不是Skill，不创建Agent、不调用模型、不生成审查结论、不自动上传。它将已选Git/PR范围冻结为本地ZIP，让你自行交给其他审查者。显式PR读取GitHub会用网络/权限；本地Git导出不需模型凭据或服务。

::: danger 原字节、不脱敏
导出保留硬编码密码/Token等实际源码，不做掩码、改编码或格式化。发送前必须按接收方授权审查内容。只收选定范围变更，不自动扫描家目录/凭据/整仓；“没有自动调查私密文件”不代表变更源码没有秘密。
:::

## 输入与交互选择 {#commands}

OMP输入框：

```text
/code-review-export
/code-review-export 重点检查边界条件和已有接口兼容性
/code-review-export https://github.com/example/demo/pull/123 重点检查错误处理
/code-review-export pr://example/demo/123
```

example/demo是公开格式示例，必须换成自己有权访问的真实PR。参数沿用/review，首个有效PR引用（含其已支持diff路径/尾标点）作目标，其余作补充指令。**没有新增commit ref verb、任意A/B端点、输出路径或模式参数**。

无直接PR时沿用菜单：最近会话PR最多3个；选基线分支、未提交、最近20提交中的一个、open PR列表/搜索，或无参数时选Custom review instructions。PR每次最多100，支持服务端搜索、#编号/数字直达，空搜索回初始，取消搜索回picker，失败保原列表，不默换目标。

自定义编辑器沿用原流程，取消/空白不导出；非空只保存为审查focus，材料仍取未提交范围，不执行其中命令/搜索/测试。无交互/headless同参数：直接PR则该PR，否则当前未提交；没diff也导指令/元数据并明说无变更，不能猜历史范围。各菜单/捕获/打包均可取消，不发表半成品，不改旧成功包。

## 冻结的究竟是哪次改动 {#snapshot}

按当前会话目录解析真实Git根，/move或/wt之后不使用旧cwd，从子目录仍取正确根：

| 范围                   | before                     | after                                               |
| ---------------------- | -------------------------- | --------------------------------------------------- |
| 未提交/自定义/headless | 固定HEAD                   | 捕获的最终工作树，含staged/unstaged/允许的untracked |
| 指定提交               | 第一父；根提交为空树       | 固定提交SHA                                         |
| 分支PR-style           | 所选分支与当前的merge-base | 当前固定SHA，不含未提交                             |
| PR                     | 该PR固定比较基线           | 固定目标SHA，非本地同名checkout                     |

首用固定完整SHA，diff/源码/指令同身份；历史/PR不能拿当前文件补。未提交不是把staged和unstaged两patch串接，不导已被最终工作树覆盖的index中间态。捕获与发布前都核字节/范围，期间增删改/重命名/状态变化即中止，不靠mtime/大小。根.tmp从发现/diff/源码/复核全阶段排除，避免递归打包旧ZIP；排除记录，不改Git状态。无共同祖先、坏ref、缺对象/权限/网络或必需文本失败不假“无改动”。

## 完整材料而非自动上下文调查 {#materials}

包含完整diff和范围内所有变更文本所需before/after：新增只after、删除只before、修改两份，重命名/复制/纯mode变化均不能漏。tracked lockfile/生成文本不能沿review过滤器丢弃。源字节、BOM、CRLF/LF、尾空白和末换行保持，不插行号/省略号。元数据/说明用UTF-8。

它不追imports/调用方/类型/测试/需求、不附未改文件或context目录；补充指令只作材料。接收者缺上下文要向你索取相应**冻结版本**，不能用当前checkout或变化后的PR补齐。

原字节保存不等于所有编码可生成文本diff：当前快照严格UTF-8，含NUL/非UTF-8标二进制。可识别BOM的UTF-16/UTF-32源码按字节存并计行，但不表示diff理解其编码；其他传统编码可能仅二进制身份/大小/哈希无payload。二进制默认不附payload，须列原因，不能声称完整二进制或全编码审查已支持。

## 容量是拒绝边界，不是裁剪预算 {#limits}

MiB为1024×1024字节：

| 阶段                              |   上限 |
| --------------------------------- | -----: |
| 单文件/Git blob快照读取           |  32MiB |
| 完整diff快照                      |  64MiB |
| 已读取缓存/观察的变更版本累计     | 256MiB |
| ZIP每个成员（含diff/指令/元数据） |  16MiB |
| 全包成员未压缩合计                |  64MiB |
| GitHub单响应（JSON/base64等）     |   8MiB |

可读取32MiB不代表能进16MiB ZIP成员；高压缩率不绕过未压缩总额，8MiB响应也不是8MiB源码保证。native/HTTP截断、recursive tree不全、必要成员或包超限均失败、提示拆分范围、保旧ZIP，不自动截断或悄悄漏文件。

## 包内导航、指令与计数 {#zip}

固定输出`<仓库根>/.tmp/review-bundle.zip`，成功替换旧同名ZIP，无另选路径：

```text
README.md
manifest.json
diff.patch
changed-files/before/<仓库相对路径>
changed-files/after/<仓库相对路径>
instructions/review.md
instructions/reviewer.md
metadata/<版本状态限制资料>
```

不存在的before/after不造空文件。review.md是针对本次冻结范围完整渲染的原生/review提示，含补充指令；reviewer.md是当前运行版本完整原生reviewer Agent提示，不是假称来自被审历史提交。review指令自身绑定diff.patch、manifest及sources[].member映射，传给每审查任务；其余原生规则保留。提示中的工具/派发约定未必在接收者环境可用，不能直接假定有OMP能力。

manifest记录命令/focus/模式/选择依据、比较方向/完整SHA/PR身份、原新路径/类型/mode/对象、源码和指令成员SHA-256/字节、二进制缺payload/排除/限制及统计。README解释无脱敏、材料边界、身份和指令导航。两指令来源是运行OMP版本；大diff提示概述不允许裁实际diff或源码。

formatVersion为2。fileCount为归档文件成员含manifest，sourceFileCount为实际源码版本成员，before/after两个成员不是两项业务改动；源码行数累计真实版本不含diff/指令。manifest只列自身外成员，不递归自身hash；compressedBytes为null并解释，最终实际ZIP大小由完成通知报。统计拿不到应明说，不造精确值。

## 特殊路径与Git状态 {#special-states}

只纳入范围内非ignored untracked；生成/私人排除仅用于untracked，不得借此漏tracked源码。.tmp始终排除。unmerged/conflict（U/AA/DD）整次拒绝。已知symlink120000、gitlink160000或非100644/100755 mode拒绝；不递归子仓库、不解引用链接，即使指内部也不跟。

路径须安全仓库相对：绝对/盘符/UNC、越界..、重复成员、不安全父路径拒绝；当前还拒绝反斜杠、控制字符、冒号、空/点段、.git、尾点/空格和Windows保留设备名，不能静默改名。本地reftable因fallback无法保证原字节blob而拒绝，不等于GitHub固定对象也禁止。

native历史接口可能缺mode，这时可读历史链接blob仅存链接目标原字节、不解引用，并显著记类型识别限制；已知特殊mode仍拒绝。不能因mode缺失认定全是普通文件。二进制、mode-only、复制/重命名、删除、根提交、detached HEAD、无共同祖先及Unicode/空格路径须实际元数据或明确受限错误，不悄悄略过。

## 发布、失败保全与验收 {#publication}

导出只写根.tmp中的本次独占staging；不改业务源码/配置、index/分支/refs，不checkout/commit/push。全部材料完成后生成临时ZIP，核成员/路径/清单并重新打开逐成员解包校验原字节/hash，再核来源及取消，最后原子替换。失败/取消/替换错误保留最后成功ZIP；清理只动自有中间物，不删整个.tmp、他人staging或旧包，不用清理错掩原错。

成功通知应有绝对路径、模式/身份、成员/源码行数、未压缩/压缩字节和限制，明说未调用模型/未审查/未上传。你仍须决定能否分享，导出完成不等审查完成。

验收需真实命令ZIP解包核原字节、freeze身份、两完整指令、全部状态/计数和失败保旧，模型端点零请求、无上传/源码Git写入；本地回归/CLI不代表联网PR、真实TUI、跨平台和所有特殊状态通过。本站未运行产品验证。

来源：[审查导出契约](https://github.com/jchanghong023/oh-my-pi/blob/main/docs-zh-CN/requirements/code-review-export.md)。

## 来源词项追溯 {#traceability}

<details>
<summary>编码与指纹的源文档标识</summary>

SHA-256用于真实归档成员指纹；UTF-16、UTF-32用于可识别BOM的源码编码说明，不意味着完整文本diff支持这些编码。coverage.json保留这些词法匹配项，仅用于来源追溯。

</details>
