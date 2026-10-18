import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const docsRoot = resolve(root, 'docs');
export const projectPages = [
  { text: 'OMP 快速指南', link: '/omp/' },
  { text: 'Team 使用与编排', link: '/omp/team' },
  { text: 'Wiki 企业知识库', link: '/omp/wiki' },
  { text: 'Repo 代码索引', link: '/omp/repo' },
  { text: 'OMP 自有功能', link: '/omp/features' },
  { text: '黄区 CodeAgent', link: '/omp/codeagent' },
  { text: 'forkZcode 内网启动', link: '/ompcode/' },
  { text: 'JchTools 功能', link: '/jchtools/' },
  { text: 'JCH 技能', link: '/jch/' },
];
export const sitePages = [{ text: '首页', link: '/' }, ...projectPages];

export function sidebarGroups() {
  return [{ text: '工具指南', items: sitePages }];
}
