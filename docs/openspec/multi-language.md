# 多语言指南 {#multi-language-1}

配置 OpenSpec 以其他语言（而非英语）生成 artifact。

## 快速设置 {#multi-language-2}

对于新项目，在初始化时设置语言：

```bash
openspec init --language "Portuguese (pt-BR)"
```

这会把语言指令写入 `openspec/config.yaml`。如果项目已有 config，请直接编辑它的 `context` 字段，以保留现有的项目指引。

你也可以手动配置相同的行为：

在 `openspec/config.yaml` 中添加一条语言指令：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.
  Keep OpenSpec structural headings and SHALL/MUST keywords in English.

  # Your other project context below...
  Tech stack: TypeScript, React, Node.js
```

就是这样。现在所有生成的 artifact 都会使用葡萄牙语。

OpenSpec 的文档结构和规范性的 `SHALL`/`MUST` 关键字保持英语，因为校验依赖它们。周边的 requirement 与 scenario 说明文字可以使用你选定的语言。

## 语言示例 {#multi-language-3}

### 葡萄牙语（巴西） {#multi-language-4}

```yaml
context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.
```

### 西班牙语 {#multi-language-5}

```yaml
context: |
  Idioma: Español
  Todos los artefactos deben escribirse en español.
```

### 中文（简体） {#multi-language-6}

```yaml
context: |
  语言：中文（简体）
  所有产出物必须用简体中文撰写。
```

### 日语 {#multi-language-7}

```yaml
context: |
  言語：日本語
  すべての成果物は日本語で作成してください。
```

### 法语 {#multi-language-8}

```yaml
context: |
  Langue : Français
  Tous les artefacts doivent être rédigés en français.
```

### 德语 {#multi-language-9}

```yaml
context: |
  Sprache: Deutsch
  Alle Artefakte müssen auf Deutsch verfasst werden.
```

## 提示 {#multi-language-10}

### 处理技术术语 {#multi-language-11}

决定如何处理技术术语：

```yaml
context: |
  Language: Japanese
  Write in Japanese, but:
  - Keep technical terms like "API", "REST", "GraphQL" in English
  - Code examples and file paths remain in English
```

### 与其他上下文组合 {#multi-language-12}

语言设置会与你的其他项目上下文一并生效：

```yaml
schema: spec-driven

context: |
  Language: Portuguese (pt-BR)
  All artifacts must be written in Brazilian Portuguese.

  Tech stack: TypeScript, React 18, Node.js 20
  Database: PostgreSQL with Prisma ORM
```

## 验证 {#multi-language-13}

要验证你的语言配置是否生效：

```bash
# Check the instructions - should show your language context
openspec instructions proposal --change my-change

# Output will include your language context
```

## 相关文档 {#multi-language-14}

- [定制指南](./customization.md) - 项目配置选项
- [工作流指南](./workflows.md) - 完整的工作流文档
