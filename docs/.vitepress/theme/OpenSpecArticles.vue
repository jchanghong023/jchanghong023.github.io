<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { openspecGroups } from '../../../scripts/site-data.mjs';

const { page } = useData();
const currentPath = computed(
  () => '/' + page.value.relativePath.replace(/\.md$/, ''),
);
</script>

<template>
  <nav class="articles" aria-label="OpenSpec 文章">
    <div v-for="group in openspecGroups" :key="group.text" class="group">
      <p class="group-title">{{ group.text }}</p>
      <ul>
        <li v-for="article in group.items" :key="article.link">
          <a
            :href="article.link"
            :aria-current="currentPath === article.link ? 'page' : undefined"
          >
            {{ article.text }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.group + .group {
  margin-top: 1rem;
}

.group-title {
  margin: 0 0 0.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.articles a {
  display: flex;
  align-items: center;
  min-height: 2rem;
  margin-inline: -0.375rem 0;
  padding: 0.25rem 0.375rem;
  border-radius: 0.375rem;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.articles a:hover,
.articles a[aria-current='page'] {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.articles a[aria-current='page'] {
  font-weight: 600;
}

.articles a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

@media (width < 80rem) {
  .articles a {
    min-height: 2.75rem;
    font-size: 0.875rem;
  }
}
</style>
