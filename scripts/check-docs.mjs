#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import {
  docsRoot,
  globalPages,
  projectNames,
  readProjects,
  sidebarGroups,
} from './site-data.mjs';
import {
  documentAnchors,
  localUrl,
  markdownLinks,
  outsideFences,
  requirementIds,
  routeFor,
  sourceHeadings,
  unsafeIndicators,
  walk,
} from './doc-utils.mjs';

const inventory = {
  omp: [
    'README.md',
    'fork.md',
    '新增需求1016.md',
    'offline-shm.md',
    'team.md',
    'goal-autopilot.md',
    'repo-index.md',
    'rpc-ui-protocol.md',
    'code-review-export.md',
  ],
  ompcode: [
    'README.md',
    'FORK.md',
    'omp-core-integration.md',
    'omp-native-commands.md',
    'models-and-commands.md',
    'composer.md',
    'skills.md',
    'integrations.md',
    'agent-interactions.md',
    'session-recovery.md',
    'performance.md',
    'centos7-release.md',
    'centos7-performance.md',
    'logging.md',
    'test-gates.md',
    'e2e.md',
  ],
  jchtools: [
    'README.md',
    'CONTRACT.md',
    'RECURSIVE-EXTRACT.md',
    'DIRECTORY-ORGANIZER.md',
    'MD-TOOLS.md',
    'GIT-TOOLS.md',
    'ALL2MARKDOWN.md',
    'SNAP2TEXT.md',
    'XBERG-INFERENCE.md',
    'ACP-MODEL-SERVICE.md',
    'CODEAGENT.md',
  ],
};
const repositories = {
  omp: 'https://github.com/jchanghong023/oh-my-pi',
  ompcode: 'https://github.com/jchanghong023/OmpCode',
  jchtools: 'https://github.com/jchanghong023/JchTools',
};
const errors = [];
function requireThat(condition, message) {
  if (!condition) errors.push(message);
  return Boolean(condition);
}
function keysMatch(object, keys) {
  return (
    object &&
    typeof object === 'object' &&
    !Array.isArray(object) &&
    isDeepStrictEqual(Object.keys(object).sort(), [...keys].sort())
  );
}
function strings(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' && item.length > 0)
  );
}
function pageRoute(link, project) {
  return (
    typeof link === 'string' &&
    new RegExp(`^/${project}/(?:[a-z0-9-]+)?$`).test(link)
  );
}

async function main() {
  const originalDirectories = new Map();
  const argumentsList = process.argv.slice(2);
  for (let index = 0; index < argumentsList.length; index++) {
    const option = argumentsList[index];
    if (option === '--help') {
      console.log(
        'Usage: node scripts/check-docs.mjs [--omp-source <requirements-dir>] [--ompcode-source <requirements-dir>] [--jchtools-source <requirements-dir>]',
      );
      return;
    }
    const project = projectNames.find((name) => option === `--${name}-source`);
    if (
      !project ||
      !argumentsList[index + 1] ||
      argumentsList[index + 1].startsWith('--')
    )
      throw new Error(`Unknown or incomplete option: ${option}`);
    if (originalDirectories.has(project))
      throw new Error(`Duplicate source option: ${project}`);
    originalDirectories.set(project, resolve(argumentsList[++index]));
  }

  const files = await walk(docsRoot);
  const pages = new Map();
  for (const file of files.filter((path) => path.endsWith('.md'))) {
    const text = await readFile(file, 'utf8');
    const route = routeFor(file, docsRoot);
    const parsed = documentAnchors(text);
    for (const duplicate of parsed.duplicates)
      errors.push(`${route}: duplicate anchor #${duplicate}`);
    const project = projectNames.find((name) => route.startsWith(`/${name}/`));
    if (project) {
      for (const heading of sourceHeadings(text))
        requireThat(
          /\{#[A-Za-z][A-Za-z0-9_-]*\}$/.test(heading),
          `${route}: project heading requires explicit ASCII anchor: ${heading}`,
        );
    }
    requireThat(
      !/^layout:\s*home\s*$/m.test(text),
      `${route}: marketing home layout is not permitted`,
    );
    pages.set(route, {
      file,
      text,
      anchors: parsed.anchors,
      links: markdownLinks(text),
    });
  }
  // These IDs are emitted by the coverage page's v-for, not static Markdown.
  if (pages.has('/coverage'))
    projectNames.forEach((name) => pages.get('/coverage').anchors.add(name));

  const projects = readProjects();
  const allNavigation = [...globalPages];
  let sourceCount = 0;
  let headingCount = 0;
  let idCount = 0;
  const coverageTargets = [];
  for (const [index, project] of projects.entries()) {
    const name = projectNames[index];
    const context = `${name}/coverage.json`;
    requireThat(
      keysMatch(project, [
        'project',
        'label',
        'repository',
        'revision',
        'sourceState',
        'pages',
        'sources',
      ]),
      `${context}: unexpected schema keys`,
    );
    requireThat(project.project === name, `${context}: incorrect project`);
    requireThat(
      typeof project.label === 'string' && project.label.trim(),
      `${context}: missing label`,
    );
    requireThat(
      project.repository === repositories[name],
      `${context}: incorrect public repository`,
    );
    requireThat(
      /^[a-f0-9]{40}$/.test(project.revision),
      `${context}: revision must be a full source HEAD`,
    );
    requireThat(
      project.sourceState === 'working-tree',
      `${context}: sourceState must be working-tree`,
    );
    if (
      !requireThat(
        Array.isArray(project.pages) && project.pages.length >= 2,
        `${context}: pages must contain project pages`,
      )
    )
      continue;
    if (
      !requireThat(
        Array.isArray(project.sources),
        `${context}: sources must be an array`,
      )
    )
      continue;
    const pageLinks = [];
    for (const page of project.pages) {
      if (
        !requireThat(
          keysMatch(page, ['text', 'link']),
          `${context}: invalid page entry`,
        )
      )
        continue;
      requireThat(
        typeof page.text === 'string' && page.text.trim(),
        `${context}: page text missing`,
      );
      requireThat(
        pageRoute(page.link, name),
        `${context}: invalid project page route ${page.link}`,
      );
      requireThat(
        pages.has(page.link),
        `${context}: missing page ${page.link}`,
      );
      pageLinks.push(page.link);
      allNavigation.push(page);
    }
    requireThat(
      new Set(pageLinks).size === pageLinks.length,
      `${context}: duplicate page route`,
    );
    for (const required of [`/${name}/`, `/${name}/getting-started`])
      requireThat(
        pageLinks.includes(required),
        `${context}: required page missing from navigation: ${required}`,
      );
    for (const route of pages.keys())
      if (route.startsWith(`/${name}/`))
        requireThat(
          pageLinks.includes(route),
          `${context}: page missing from coverage navigation: ${route}`,
        );
    const actualFiles = project.sources.map((source) => source.file);
    requireThat(
      isDeepStrictEqual([...actualFiles].sort(), [...inventory[name]].sort()),
      `${context}: source inventory must exactly match all ${inventory[name].length} required files`,
    );
    const projectText = pageLinks
      .map((link) => pages.get(link)?.text || '')
      .join('\n');
    for (const source of project.sources) {
      const sourceContext = `${context}:${source.file}`;
      sourceCount++;
      if (
        !requireThat(
          keysMatch(source, ['file', 'sha256', 'page', 'headings', 'ids']),
          `${sourceContext}: unexpected source schema`,
        )
      )
        continue;
      requireThat(
        inventory[name].includes(source.file),
        `${sourceContext}: unrecognized source file`,
      );
      requireThat(
        /^[a-f0-9]{64}$/.test(source.sha256),
        `${sourceContext}: invalid SHA-256`,
      );
      requireThat(
        pageLinks.includes(source.page),
        `${sourceContext}: source page is not in project navigation`,
      );
      if (source.file !== 'README.md')
        requireThat(
          source.page !== `/${name}/`,
          `${sourceContext}: substantive sources require a dedicated guide, not the project homepage`,
        );
      coverageTargets.push({ from: '/coverage', target: source.page });
      if (
        requireThat(
          Array.isArray(source.headings) && source.headings.length > 0,
          `${sourceContext}: missing source headings`,
        )
      ) {
        for (const heading of source.headings) {
          headingCount++;
          if (
            !requireThat(
              keysMatch(heading, ['source', 'target']),
              `${sourceContext}: invalid heading entry`,
            )
          )
            continue;
          requireThat(
            typeof heading.source === 'string' && heading.source.trim(),
            `${sourceContext}: empty source heading`,
          );
          const match =
            typeof heading.target === 'string' &&
            heading.target.match(/^([^#]+)#([A-Za-z][A-Za-z0-9_-]*)$/);
          if (
            requireThat(
              match,
              `${sourceContext}: source heading target requires explicit ASCII anchor`,
            )
          ) {
            requireThat(
              pageLinks.includes(match[1]),
              `${sourceContext}: heading target not in project navigation: ${heading.target}`,
            );
            requireThat(
              pages.get(match[1])?.anchors.has(match[2]),
              `${sourceContext}: heading target does not exist: ${heading.target}`,
            );
            const targetPage = pages.get(match[1]);
            if (targetPage) {
              const section = outsideFences(targetPage.text).match(
                new RegExp(
                  `^(#{1,6})\\s+[^\\n]*\\{#${match[2]}\\}[^\\n]*\\n([\\s\\S]*)`,
                  'm',
                ),
              );
              const body = section
                ? section[2].split(
                    new RegExp(`^#{1,${section[1].length}}\\s`, 'm'),
                  )[0]
                : '';
              requireThat(
                body.replace(/<[^>]*>/g, '').trim().length > 0,
                `${sourceContext}: heading target has no explanatory body: ${heading.target}`,
              );
            }
          }
          coverageTargets.push({ from: '/coverage', target: heading.target });
        }
        if (source.file !== 'README.md')
          requireThat(
            source.headings.some(
              (heading) => !heading.target.startsWith(`/${name}/#`),
            ),
            `${sourceContext}: all source sections point to the homepage`,
          );
      }
      if (
        requireThat(
          strings(source.ids) ||
            (Array.isArray(source.ids) && source.ids.length === 0),
          `${sourceContext}: IDs must be an array of strings`,
        )
      ) {
        requireThat(
          new Set(source.ids).size === source.ids.length,
          `${sourceContext}: duplicate source IDs`,
        );
        for (const id of source.ids) {
          idCount++;
          requireThat(
            requirementIds(id).includes(id),
            `${sourceContext}: malformed source ID ${id}`,
          );
          requireThat(
            requirementIds(projectText).includes(id),
            `${sourceContext}: source ID missing from derived guides: ${id}`,
          );
        }
      }
      if (originalDirectories.has(name)) {
        const original = await readFile(
          resolve(originalDirectories.get(name), source.file),
        );
        requireThat(
          createHash('sha256').update(original).digest('hex') === source.sha256,
          `${sourceContext}: source hash differs from supplied original`,
        );
        const text = original.toString('utf8');
        requireThat(
          isDeepStrictEqual(
            sourceHeadings(text),
            source.headings.map((heading) => heading.source),
          ),
          `${sourceContext}: source heading list differs from original (order and duplicates matter)`,
        );
        requireThat(
          isDeepStrictEqual(requirementIds(text), [...source.ids].sort()),
          `${sourceContext}: source IDs differ from original`,
        );
      }
    }
  }

  async function checkLink(target, from) {
    if (typeof target !== 'string') return;
    if (/^(?:javascript|vbscript):/i.test(target))
      return requireThat(false, `${from}: unsafe link protocol`);
    const url = localUrl(target, from);
    if (!url) return;
    let route = decodeURIComponent(url.pathname)
      .replace(/\.md$/, '')
      .replace(/\.html$/, '');
    if (route.endsWith('/index')) route = route.slice(0, -5);
    const page = pages.get(route);
    if (page) {
      if (url.hash)
        requireThat(
          page.anchors.has(decodeURIComponent(url.hash.slice(1))),
          `${from}: missing anchor ${target}`,
        );
      return;
    }
    const path = resolve(docsRoot, '.' + decodeURIComponent(url.pathname));
    const publicPath = resolve(
      docsRoot,
      'public',
      '.' + decodeURIComponent(url.pathname),
    );
    if (!path.startsWith(docsRoot) || !publicPath.startsWith(docsRoot))
      return requireThat(false, `${from}: path escapes docs root`);
    const exists = await Promise.all(
      [path, publicPath].map(async (candidate) => {
        try {
          return (await stat(candidate)).isFile();
        } catch {
          return false;
        }
      }),
    );
    requireThat(
      exists.some(Boolean) && !/\.(?:md|html)$/.test(url.pathname),
      `${from}: missing internal page or asset ${target}`,
    );
  }
  for (const [route, page] of pages)
    for (const target of page.links) await checkLink(target, route);
  for (const { from, target } of coverageTargets) await checkLink(target, from);
  for (const page of allNavigation) await checkLink(page.link, '/');
  const reachable = new Set(
    sidebarGroups(projects).flatMap((group) =>
      group.items.map((item) => item.link),
    ),
  );
  for (const route of pages.keys())
    requireThat(
      reachable.has(route),
      `${route}: orphan page, not reachable from sidebar`,
    );
  for (const file of files.filter((path) =>
    /\.(?:md|json|svg|html|vue|mjs|js|ts|css)$/i.test(path),
  )) {
    const text = await readFile(file, 'utf8');
    for (const finding of unsafeIndicators(text))
      errors.push(
        `${relative(docsRoot, file)}:${finding.line}: confidential-publication indicator (${finding.label}; value redacted)`,
      );
  }
  requireThat(
    sourceCount === 36,
    `Expected 36 source documents, found ${sourceCount}`,
  );
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    `PASS: ${pages.size} pages, ${sourceCount}/36 source documents, ${headingCount} source headings, ${idCount} source ID references; all sidebar routes and internal links resolved.`,
  );
  console.log(
    originalDirectories.size
      ? `Original source verification: ${[...originalDirectories.keys()].join(', ')}.`
      : 'Original source hashes/headings/IDs: not re-read (CI-compatible mode); provide --<project>-source for byte-level verification.',
  );
  console.log(
    'Source coverage and website integrity are not product functional acceptance.',
  );
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
