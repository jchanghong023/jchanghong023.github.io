# 编写优秀的 spec {#spec}

你很少会从一张白纸开始编写 spec。你用平实的语言描述一个 change，`/opsx:propose` 会起草 requirement 和 scenario，然后你把它们打磨好。本文讲的就是最后这一步——“好”是什么样子，以及如何引导 AI 达到这个标准。

它与 [Reviewing a Change](reviewing-changes.md) 互为姊妹篇：review 是在草稿中找出薄弱之处，而编写则是知道一份强有力的草稿由哪些部分构成。

## spec 是行为，不是代码 {#spec-2}

spec 说的是你的系统*做什么*，用任何人都能核对的措辞来表达——而不是它如何构建。它由 **requirement**（对行为的陈述）和 **scenario**（证明这些行为的具体示例）构成。

```markdown
### Requirement: Session Timeout

The system SHALL expire a session after 30 minutes of inactivity.

#### Scenario: Idle timeout

- GIVEN an authenticated session
- WHEN 30 minutes pass with no activity
- THEN the session is invalidated and the user must re-authenticate
```

把*如何实现*——队列、库、表结构——留在 `design.md` 或代码里。当行为与实现被混进同一个 requirement 时，这个 requirement 就不再可测试，并且会在代码一发生变化的那一刻开始过时。

## 什么样的 requirement 才算好 {#requirement}

一个好的 requirement 只描述一种行为，并且陈述得足够直白，你完全可以把它交给别人去测试。

- **一句话，一个 `SHALL`/`MUST`。** 如果一个 requirement 里有三个“并且还”的从句，那它实际上是三个 requirement。拆开它们。
- **可观察。** 代码之外的人应当能判断它是否成立。“The system SHALL show an error banner when the upload exceeds 10 MB”是可观察的。“The system SHALL handle large uploads gracefully”则不是。
- **恰当的强度。** OpenSpec 使用 RFC 2119 关键字，它们含义各不相同：

  | 关键字           | 含义                               |
  | ---------------- | ---------------------------------- |
  | `MUST` / `SHALL` | 硬性要求。没有商量余地。           |
  | `SHOULD`         | 强烈推荐，但允许有正当理由的例外。 |
  | `MAY`            | 真正可选的。                       |

  默认使用 `MUST`/`SHALL`。只有当你确实想表达“除非有充分理由不这么做”时，才使用 `SHOULD`。

检验 requirement 的方法是：_一个从没见过代码的测试者，能否判断它是否通过？_ 如果不能，它就需要进一步打磨。

## 什么样的 scenario 才算好 {#scenario}

scenario 是 requirement 发挥作用的地方。每一个都是具体的 GIVEN / WHEN / THEN，都可以变成一条自动化测试。

- **它真正演练了所属的 requirement。** 一个只是用其他措辞复述 requirement 的 scenario 什么也没测。让它成为一个具体情境，并有具体结果。
- **覆盖重要的情形，而不只是顺利路径。** 合法的登录很简单。空输入、过期 token、第二次点击、出错的那件事——这些才是 bug 藏身之处，也是 scenario 价值最大的地方。
- **在标题中指明该情形。** “Scenario: Rejects an expired token”能让 reviewer 一眼看出覆盖了什么；“Scenario: Test 2”则不能。

一个有用的习惯：在批准之前，问自己*哪个情形被弄坏了我会不高兴？*——并确保有一个 scenario 点名了它。

## 选对 delta 的类型 {#delta}

一个 change 用三种 section 类型来描述它对 spec 的编辑。选对类型能让你的归档 spec 保持诚实：

- **`## ADDED Requirements`** —— 此前不存在、全新的行为。
- **`## MODIFIED Requirements`** —— 已经存在且正在改变的行为。包含完整的新版本；简短说明改了什么对 reviewer 有帮助。
- **`## REMOVED Requirements`** —— 即将消失的行为，附一行说明原因。

归档时，ADDED 会被追加到主 spec 中，MODIFIED 会替换旧版本，REMOVED 则会从主 spec 中删除。移除一个 capability 的最后一条 requirement，就等于将其退役：与其留下一个空无一物的 spec，归档会删除 `openspec/specs/<capability>/spec.md`。由于这是归档过程中唯一会删除文件的步骤，必须显式请求——在该 change 的 `.openspec.yaml` 中添加 `retire_capabilities: true`，与文件本来就需要的 `schema:` 放在一起。没有它，归档会中止并告知你原因。退役会删除整个文件，因此当 spec 中含有其标题、`## Purpose` 以及 requirement 块之外的任何内容时，该操作同样会被拒绝——比如一个 `## Notes` 区块，或 requirement 下的一条注释。中止信息会指明这些行；把它们移进 `## Purpose` 或某个 requirement，或者手工删除该 spec。对于位于调用方 checkout 中的 spec，归档输出还会指明可用于恢复已提交文件的 `git checkout`；被选中的 store 则会收到 checkout 作用域下的恢复指引。如果你把一个真实的 change 标记为 ADDED，最终会得到两条互相冲突的 requirement；如果你把新行为描述为 MODIFIED，则没有东西可替换。拿不准时，打开当前的 spec，看看该 requirement 是否已经存在。

还有一个值得了解的 section。当你的 delta 创建了一个尚不存在的 capability 时，用 `## Purpose` 来开头——用一两句话说明该 capability 的用途。归档会把它用作所创建的主 spec 的 Purpose；如果省略它，你会得到一个 `TBD` 占位符，需要手工填写。已存在的 spec 已有 Purpose，因此 delta 中的 Purpose 在那里会被忽略——要修改它，请直接编辑 `openspec/specs/<capability-path>/spec.md`。这里的 `<capability-path>` 是相对于 `specs/` 的目录，例如在扁平化项目中是 `user-auth`，在按域组织的项目中是 `identity/user-auth`。

## 让 change 的规模恰到好处 {#right-size-the-change}

编写时最常见的错误并不是措辞糟糕的 requirement，而是一个试图变成三个 change 的 change。

**一个好的 change 只有一个意图，一句话就能说出来。** “Add a dark-mode toggle。”“Rate-limit the login endpoint。”“Migrate sessions off cookies。”如果描述这个 change 需要用上很多“并且还”，那就是该拆分它的信号。

change 过大的迹象：

- proposal 的 scope 读起来像一串互不相关的功能。
- review 它要花一下午，所以没人会去 review。
- 两个人无法在不冲突的情况下同时处理它。
- 一半的 task 都可以单独发布。

更小的 change 更容易 review，更容易在一次专注的会话中完成构建，也更容易在归档中只剩它时理清头绪。你随时可以并行运行多个 change——参见 [Editing & iterating](editing-changes.md) 和 [Workflows](workflows.md)。

反面情况也会出现：修一个单行拼写错误，并不需要三条 requirement 和一份 design 文档。让仪式感与风险相匹配。

## 如何引导 AI 写出好的草稿 {#ai}

由于 `/opsx:propose` 负责初稿，你得到的质量取决于你提供给它的质量。你不必亲手编写 requirement——你需要把 AI 瞄准好：

- **说清意图和边界。** _“Add a dark-mode toggle that follows the OS setting on first load — don't touch the existing theme API。”_ 范围之外的那一半与范围内的一半同样重要。
- **点名你在意的情形。** _“Make sure there's a scenario for a user who already picked a theme manually。”_ AI 会覆盖你指向的地方。
- **然后动手编辑。** 它就是纯 Markdown。收紧含糊的 `SHALL`，删掉什么也没测的 scenario，补上它漏掉的情形——或者让 AI 来做：_“the timeout requirement is vague, pin it to 30 minutes。”_

起草、打磨、重复。几轮之后就能产出一份你信得过的 spec，而这正是全部意义所在。

## 快速检查清单 {#writing-specs-8}

- [ ] 每条 requirement 都是一个可观察的行为，并带有一个 `SHALL`/`MUST`。
- [ ] requirement 中没有混入实现细节。
- [ ] 每条 requirement 至少有一个真正锻炼了它的 scenario。
- [ ] 重要的边界与错误情形都有 scenario，而不只是顺利路径。
- [ ] delta 针对当前 spec 正确使用了 ADDED / MODIFIED / REMOVED。
- [ ] 整个 change 只有一个意图，一句话就能说出来。

## 接下来去哪 {#writing-specs-9}

- [Reviewing a Change](reviewing-changes.md) —— 花两分钟过一遍，抓住那些溜过去的问题。
- [Concepts](concepts.md) —— spec、change 与 delta 背后更深层的模型。
- [Examples & Recipes](examples.md) —— 从头到尾的真实 change。
