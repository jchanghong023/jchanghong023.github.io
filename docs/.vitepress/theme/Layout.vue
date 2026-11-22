<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import OpenSpecArticles from './OpenSpecArticles.vue';

const { page } = useData();
const isOpenSpec = computed(() =>
  page.value.relativePath.startsWith('openspec/'),
);
</script>

<template>
  <DefaultTheme.Layout>
    <template v-if="isOpenSpec" #aside-top>
      <div class="article-sidebar">
        <p class="article-heading">OpenSpec 文章</p>
        <OpenSpecArticles />
      </div>
    </template>
    <template v-if="isOpenSpec" #doc-before>
      <details :key="page.relativePath" class="article-menu">
        <summary>
          OpenSpec 文章
          <span class="vpi-chevron-right" aria-hidden="true"></span>
        </summary>
        <OpenSpecArticles />
      </details>
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
.article-sidebar {
  padding-inline-start: 1rem;
  border-inline-start: 1px solid var(--vp-c-divider);
}

.article-heading {
  margin: 0 0 1rem;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 600;
}

.article-menu {
  width: fit-content;
  max-width: 100%;
  margin: 0 0 1rem auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
}

.article-menu summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding-inline: 0.75rem;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 600;
  list-style: none;
  cursor: pointer;
}

.article-menu summary::-webkit-details-marker {
  display: none;
}

.article-menu[open] summary span {
  transform: rotate(90deg);
}

.article-menu[open] nav {
  min-width: min(18rem, calc(100vw - 3.25rem));
  max-height: min(50vh, 24rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
}

.article-menu summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

@media (min-width: 80rem) {
  .article-menu {
    display: none;
  }
}
</style>
