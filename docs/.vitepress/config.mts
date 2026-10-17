import { defineConfig } from 'vitepress';
import { sidebarGroups } from '../../scripts/site-data.mjs';

export default defineConfig({
  lang: 'zh-CN',
  title: '研发工具文档',
  description: '面向同事的 OMP、OmpCode 与 JchTools 安装、使用和边界说明。',
  base: '/',
  cleanUrls: true,
  appearance: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#ffffff' }]],
  sitemap: { hostname: 'https://jchanghong023.github.io' },
  markdown: { theme: { light: 'github-light', dark: 'github-dark' } },
  themeConfig: {
    nav: [
      { text: '开始阅读', link: '/getting-started' },
      { text: 'OMP', link: '/omp/' },
      { text: 'OmpCode', link: '/ompcode/' },
      { text: 'JchTools', link: '/jchtools/' },
      { text: '来源覆盖', link: '/coverage' },
    ],
    sidebar: sidebarGroups(),
    aside: true,
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '文档更新于', formatOptions: { dateStyle: 'long' } },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '文档目录',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳转到正文',
    externalLinkIcon: true,
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/jchanghong023/jchanghong023.github.io',
        ariaLabel: '网站源码',
      },
    ],
    editLink: {
      pattern:
        'https://github.com/jchanghong023/jchanghong023.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: (text: string) =>
              Array.from(
                new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(
                  text,
                ),
              )
                .filter((segment) => segment.isWordLike)
                .map((segment) => segment.segment),
          },
          searchOptions: { combineWith: 'AND' },
        },
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车键',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '向上键',
                  navigateDownKeyAriaLabel: '向下键',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc 键',
                },
              },
            },
          },
        },
      },
    },
  },
});
