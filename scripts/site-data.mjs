import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const docsRoot = resolve(root, 'docs');
export const projectNames = ['omp', 'ompcode', 'jchtools'];
export const globalPages = [
  { text: '文档首页', link: '/' },
  { text: '选择工具与首次使用', link: '/getting-started' },
  { text: '公开内容与阅读边界', link: '/public-content' },
  { text: '来源与完整覆盖', link: '/coverage' },
];

export function readProjects() {
  return projectNames.map((name) =>
    JSON.parse(readFileSync(resolve(docsRoot, name, 'coverage.json'), 'utf8')),
  );
}

export function sidebarGroups(projects = readProjects()) {
  return [
    { text: '开始阅读', items: globalPages },
    ...projects.map((project) => ({
      text: project.label,
      collapsed: false,
      items: project.pages,
    })),
  ];
}
