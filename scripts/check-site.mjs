#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { docsRoot, readProjects } from './site-data.mjs';
import {
  decodeEntities,
  localUrl,
  unsafeIndicators,
  walk,
} from './doc-utils.mjs';

async function main() {
  const args = process.argv.slice(2);
  let siteUrl;
  let directory = resolve(docsRoot, '.vitepress/dist');
  for (let index = 0; index < args.length; index++) {
    const option = args[index];
    if (option === '--help') {
      console.log(
        'Usage: node scripts/check-site.mjs [--directory <built-site-dir>] [--site-url <http(s)-origin>]',
      );
      return;
    }
    if (!args[index + 1]) throw new Error(`Missing value for ${option}`);
    if (option === '--directory') directory = resolve(args[++index]);
    else if (option === '--site-url') siteUrl = new URL(args[++index]);
    else throw new Error(`Unknown option: ${option}`);
  }
  if (
    siteUrl &&
    (!/^https?:$/.test(siteUrl.protocol) || siteUrl.pathname !== '/')
  )
    throw new Error('--site-url must be an HTTP(S) site root');
  const files = await walk(directory);
  const byPath = new Map(
    files.map((file) => [
      '/' + relative(directory, file).split(sep).join('/'),
      file,
    ]),
  );
  const htmlPages = new Map();
  const errors = [];
  const links = [];
  function requireThat(condition, message) {
    if (!condition) errors.push(message);
  }
  for (const [path, file] of byPath) {
    if (extname(file) === '.html') {
      const text = await readFile(file, 'utf8');
      const anchors = new Set(
        [...text.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].map((match) =>
          decodeEntities(match[1]),
        ),
      );
      htmlPages.set(path, anchors);
      for (const match of text.matchAll(
        /\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/g,
      ))
        links.push({ from: path, target: decodeEntities(match[1]) });
      for (const match of text.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/g)) {
        if (!match[1].startsWith('data:'))
          for (const candidate of match[1].split(','))
            links.push({
              from: path,
              target: candidate.trim().split(/\s+/)[0],
            });
      }
      for (const finding of unsafeIndicators(text))
        errors.push(
          `${path}:${finding.line}: confidential-publication indicator (${finding.label}; value redacted)`,
        );
      requireThat(
        !/https?:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com)/.test(text),
        `${path}: external web font detected`,
      );
      requireThat(
        !/https?:\/\/[^"'\s<>]*(?:google-analytics|googletagmanager|plausible\.io|umami)/.test(
          text,
        ),
        `${path}: analytics endpoint detected`,
      );
    } else if (/\.(?:css|js|mjs)$/.test(file)) {
      const text = await readFile(file, 'utf8');
      // Publication text is scanned in source documents and rendered HTML;
      // escape sequences in generated JavaScript are not literal UNC paths.
      if (file.endsWith('.css'))
        for (const match of text.matchAll(
          /url\(\s*["']?([^\s"')]+)["']?\s*\)/g,
        ))
          links.push({ from: path, target: match[1] });
      if (/\.(?:js|mjs)$/.test(file)) {
        for (const match of text.matchAll(
          /(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)["']((?:\.\.?\/|\/assets\/)[^"']+)["']/g,
        ))
          links.push({ from: path, target: match[1] });
      }
    }
  }
  function resolveFile(pathname) {
    const decoded = decodeURIComponent(pathname);
    return [
      decoded,
      decoded + '.html',
      decoded.replace(/\/$/, '') + '/index.html',
    ].find((candidate) => byPath.has(candidate));
  }
  for (const { from, target } of links) {
    const url = localUrl(target, from);
    if (!url) continue;
    const path = resolveFile(url.pathname);
    requireThat(path, `${from}: missing built page or asset ${target}`);
    if (path && url.hash && htmlPages.has(path))
      requireThat(
        htmlPages.get(path).has(decodeURIComponent(url.hash.slice(1))),
        `${from}: missing built anchor ${target}`,
      );
  }
  const projects = readProjects();
  for (const project of projects) {
    for (const page of project.pages)
      requireThat(
        resolveFile(page.link),
        `Missing rendered project page: ${page.link}`,
      );
    for (const source of project.sources)
      for (const heading of source.headings) {
        const url = localUrl(heading.target, '/coverage');
        const path = url && resolveFile(url.pathname);
        requireThat(
          path &&
            htmlPages.get(path)?.has(decodeURIComponent(url.hash.slice(1))),
          `Missing rendered coverage target: ${heading.target}`,
        );
      }
  }
  requireThat(
    byPath.has('/index.html') && byPath.has('/coverage.html'),
    'Missing global rendered pages',
  );
  requireThat(
    files.some((file) => /(?:localSearchIndex|local-search-index)/i.test(file)),
    'Missing generated local search index',
  );
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    `PASS: ${htmlPages.size} rendered HTML pages, ${files.length} output files, ${links.length} local/external references scanned; project coverage anchors resolved.`,
  );

  if (siteUrl) {
    const queue = [...byPath.entries()];
    let next = 0;
    let completed = 0;
    const controller = new AbortController();
    async function worker() {
      while (next < queue.length && !controller.signal.aborted) {
        const [path, file] = queue[next++];
        const url = new URL(path.slice(1), siteUrl);
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow',
          });
          if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
          const actual = Buffer.from(await response.arrayBuffer());
          const expected = await readFile(file);
          const digest = (bytes) =>
            createHash('sha256').update(bytes).digest('hex');
          if (digest(actual) !== digest(expected))
            throw new Error(
              `${path}: served bytes differ from this production build`,
            );
          completed++;
        } catch (error) {
          if (!controller.signal.aborted) {
            errors.push(error.message);
            controller.abort();
          }
        }
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(8, queue.length) }, worker),
    );
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(
      `PASS: HTTP ${siteUrl.origin}: all ${completed} pages/assets match this build byte-for-byte; the checked anchors are the actual served content.`,
    );
  }
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
