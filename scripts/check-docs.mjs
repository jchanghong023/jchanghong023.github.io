#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { docsRoot, sitePages } from './site-data.mjs';
import {
  documentAnchors,
  localUrl,
  markdownLinks,
  outsideFences,
  routeFor,
  sourceHeadings,
  unsafeIndicators,
  walk,
} from './doc-utils.mjs';

const errors = [];
function requireThat(condition, message) {
  if (!condition) errors.push(message);
}

async function main() {
  const args = process.argv.slice(2);
  let skillsSource;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--help') {
      console.log(
        'Usage: node scripts/check-docs.mjs [--skills-source <skills-dir>]',
      );
      return;
    }
    if (args[index] !== '--skills-source' || !args[index + 1] || skillsSource)
      throw new Error(
        `Unknown, duplicate or incomplete option: ${args[index]}`,
      );
    skillsSource = resolve(args[++index]);
  }

  const files = await walk(docsRoot);
  const pages = new Map();
  for (const file of files.filter((path) => path.endsWith('.md'))) {
    const text = await readFile(file, 'utf8');
    const route = routeFor(file, docsRoot);
    const parsed = documentAnchors(text);
    for (const duplicate of parsed.duplicates)
      errors.push(`${route}: duplicate anchor #${duplicate}`);
    for (const heading of sourceHeadings(text))
      requireThat(
        /\{#[A-Za-z][A-Za-z0-9_-]*\}$/.test(heading),
        `${route}: heading requires explicit ASCII anchor: ${heading}`,
      );
    requireThat(
      !/^layout:\s*home\s*$/m.test(text),
      `${route}: use default document layout`,
    );
    pages.set(route, {
      text,
      anchors: parsed.anchors,
      links: markdownLinks(text),
    });
  }

  async function checkLink(target, from) {
    if (/^(?:javascript|vbscript):/i.test(target)) {
      errors.push(`${from}: unsafe link protocol`);
      return;
    }
    const url = localUrl(target, from);
    if (!url) return;
    let route = decodeURIComponent(url.pathname).replace(/\.(?:md|html)$/, '');
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
    const candidates = [docsRoot, resolve(docsRoot, 'public')].map((base) =>
      resolve(base, '.' + decodeURIComponent(url.pathname)),
    );
    const exists = await Promise.all(
      candidates.map(async (path) => {
        const child = relative(docsRoot, path);
        if (child === '..' || child.startsWith('..' + sep)) return false;
        try {
          return (await stat(path)).isFile();
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
  for (const page of sitePages) await checkLink(page.link, '/');
  const navigation = new Set(sitePages.map((page) => page.link));
  requireThat(
    navigation.size === sitePages.length,
    'Duplicate navigation route',
  );
  for (const route of pages.keys())
    requireThat(navigation.has(route), `${route}: orphan or obsolete page`);

  const catalog = outsideFences(pages.get('/jch/')?.text || '');
  const rows = [
    ...catalog.matchAll(
      /^\|\s*\[([a-z0-9-]+)\]\(https:\/\/github\.com\/jchanghong023\/jch\/blob\/main\/skills\/([a-z0-9-]+)\/SKILL\.md\)\s*\|\s*([^|\n]+)\|\s*([^|\n]+)\|\s*$/gm,
    ),
  ];
  const names = rows.map((row) => row[1]);
  requireThat(names.length > 0, 'Missing JCH skill catalog');
  requireThat(new Set(names).size === names.length, 'Duplicate JCH skill row');
  for (const row of rows) {
    requireThat(
      row[1] === row[2] && /^(?:jch|dft)-/.test(row[1]),
      `Invalid skill source link: ${row[1]}`,
    );
    requireThat(
      row[3].trim() && row[4].trim(),
      `Missing function or usage scenario: ${row[1]}`,
    );
  }
  // Every skill token must have its own complete table row, not just a mention.
  for (const name of new Set(
    catalog
      .replace(/\{#[A-Za-z][A-Za-z0-9_-]*\}/g, '')
      .match(/\b(?:jch|dft)-[a-z0-9]+(?:-[a-z0-9]+)*\b/g) || [],
  ))
    requireThat(names.includes(name), `Skill missing a complete row: ${name}`);
  if (skillsSource) {
    const entries = await readdir(skillsSource, { withFileTypes: true });
    const sourceNames = entries
      .filter(
        (entry) => entry.isDirectory() && /^(?:jch|dft)-/.test(entry.name),
      )
      .map((entry) => entry.name);
    for (const name of sourceNames) {
      requireThat(
        (await stat(resolve(skillsSource, name, 'SKILL.md'))).isFile(),
        `Missing source SKILL.md: ${name}`,
      );
      requireThat(names.includes(name), `Missing source skill: ${name}`);
    }
    for (const name of names)
      requireThat(sourceNames.includes(name), `Unknown catalog skill: ${name}`);
  }
  for (const file of files.filter((path) =>
    /\.(?:md|json|svg|html|vue|mjs|js|ts|css)$/i.test(path),
  )) {
    const text = await readFile(file, 'utf8');
    for (const finding of unsafeIndicators(text))
      errors.push(
        `${relative(docsRoot, file)}:${finding.line}: confidential-publication indicator (${finding.label}; value redacted)`,
      );
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    `PASS: ${pages.size} concise pages; navigation, internal links, anchors and public-content boundaries checked.`,
  );
  console.log(
    `PASS: ${names.filter((name) => name.startsWith('jch-')).length} jch skills, ${names.filter((name) => name.startsWith('dft-')).length} dft skills, each with function and scenario${skillsSource ? '; exact source inventory matched' : ' (source inventory not re-read)'}.`,
  );
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
