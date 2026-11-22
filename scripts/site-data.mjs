export const siteNavigation = [
  { text: '首页', link: '/' },
  { text: 'OMP 快速指南', link: '/omp/' },
  { text: '知识库服务', link: '/rust-knowledge-server/' },
  { text: 'JchTools 功能', link: '/jchtools/' },
  { text: 'JCH 技能', link: '/jch/' },
  { text: 'OpenSpec', link: '/openspec/' },
];

export const openspecGroups = [
  {
    text: '从这里开始',
    items: [
      { text: '快速开始', link: '/openspec/getting-started' },
      { text: '先探索', link: '/openspec/explore' },
      { text: '命令如何运作', link: '/openspec/how-commands-work' },
      { text: '核心概念速览', link: '/openspec/overview' },
      { text: '安装', link: '/openspec/installation' },
    ],
  },
  {
    text: '日常使用',
    items: [
      { text: '工作流', link: '/openspec/workflows' },
      { text: '示例与配方', link: '/openspec/examples' },
      { text: '写好 spec', link: '/openspec/writing-specs' },
      { text: '审查 change', link: '/openspec/reviewing-changes' },
      { text: '编辑与迭代 change', link: '/openspec/editing-changes' },
      { text: '团队中的 OpenSpec', link: '/openspec/team-workflow' },
      { text: '既有项目', link: '/openspec/existing-projects' },
      { text: '斜杠命令', link: '/openspec/commands' },
      { text: 'CLI 参考', link: '/openspec/cli' },
    ],
  },
  {
    text: '深入理解',
    items: [
      { text: '概念', link: '/openspec/concepts' },
      { text: 'OPSX 工作流', link: '/openspec/opsx' },
      { text: '术语表', link: '/openspec/glossary' },
    ],
  },
  {
    text: '定制与扩展',
    items: [
      { text: '定制', link: '/openspec/customization' },
      { text: '多语言', link: '/openspec/multi-language' },
      { text: '支持的工具', link: '/openspec/supported-tools' },
      { text: '社区展示', link: '/openspec/community' },
      { text: '迁移指南', link: '/openspec/migration-guide' },
    ],
  },
  {
    text: '帮助',
    items: [
      { text: 'FAQ', link: '/openspec/faq' },
      { text: '故障排查', link: '/openspec/troubleshooting' },
    ],
  },
  {
    text: '跨仓库协作（beta）',
    items: [
      { text: 'Stores 用户指南', link: '/openspec/stores-beta/user-guide' },
      { text: 'Agent 契约', link: '/openspec/agent-contract' },
    ],
  },
  {
    text: '技能（skills）',
    items: [
      { text: 'openspec-explore', link: '/openspec/skills/openspec-explore' },
      { text: 'openspec-propose', link: '/openspec/skills/openspec-propose' },
      {
        text: 'openspec-update-change',
        link: '/openspec/skills/openspec-update-change',
      },
      {
        text: 'openspec-apply-change',
        link: '/openspec/skills/openspec-apply-change',
      },
      {
        text: 'openspec-verify-change',
        link: '/openspec/skills/openspec-verify-change',
      },
      {
        text: 'openspec-sync-specs',
        link: '/openspec/skills/openspec-sync-specs',
      },
      {
        text: 'openspec-archive-change',
        link: '/openspec/skills/openspec-archive-change',
      },
    ],
  },
];

export const sitePages = [
  ...siteNavigation,
  ...openspecGroups.flatMap((group) => group.items),
];
