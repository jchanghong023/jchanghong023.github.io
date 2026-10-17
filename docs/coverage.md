<script setup>
import { data as projects } from './coverage.data.mjs';
</script>

# 来源与完整覆盖 {#overview}

本页直接读取三个项目的 coverage.json，与左侧导航共用页面清单。共 **36 份需求文档**：OMP 9 份、OmpCode 16 份、JchTools 11 份。每份来源列出导读页、全部源章节对应的站内锚点及需求编号；编号也保留在项目指南中以供搜索。

::: warning 覆盖不等于验收
来源覆盖表证明追溯关系，不代表产品已实现或通过功能验收。来源状态为工作树快照，修订号仅标识读取时的 HEAD；未提交内容以文件 SHA-256 为准，不能仅凭公开提交链接重建。
:::

## 查看对应关系 {#sources}

<div v-for="project in projects" :key="project.project">
  <h3 :id="project.project">{{ project.label }}：{{ project.sources.length }} 份来源</h3>
  <p><a :href="project.repository">公开源码仓库</a> · <a :href="project.repository + '/tree/' + project.revision">源 HEAD</a> · 工作树快照</p>
  <p>修订：<code>{{ project.revision }}</code></p>
  <section v-for="source in project.sources" :key="source.file">
    <h4>{{ source.file }}</h4>
    <p>指南：<a :href="source.page">{{ source.page }}</a></p>
    <details>
      <summary>源文件 SHA-256 与需求编号</summary>
      <p><code>{{ source.sha256 }}</code></p>
      <p>{{ source.ids.length ? source.ids.join('、') : '该来源未使用约定格式的需求编号。' }}</p>
    </details>
    <ul>
      <li v-for="(heading, index) in source.headings" :key="index">
        <a :href="heading.target">{{ heading.source }}</a>
      </li>
    </ul>
  </section>
</div>

## 维护与复核 {#maintaining}

新增或修改指南时，维护对应项目的 coverage.json。自动校验检查固定来源清单、页面和显式锚点、需求编号、站内链接以及公开边界。维护者显式提供原始需求目录时，还会逐字节复核 SHA-256、围栏外的全部 ATX 标题及需求编号；公开 CI 不需要本地源仓库。

[网站源码与维护命令](https://github.com/jchanghong023/jchanghong023.github.io)提供复核入口。网站工作不会修改产品源码，也不运行产品安装、真实模型或桌面测试。
