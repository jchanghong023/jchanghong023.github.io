import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

export async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith('.')) return [];
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat().sort();
}

export function outsideFences(markdown) {
  let fence = null;
  return markdown
    .split(/\r?\n/)
    .map((line) => {
      if (fence) {
        const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (
          closing &&
          closing[1][0] === fence[0] &&
          closing[1].length >= fence.length
        )
          fence = null;
        return '';
      }
      const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (opening && !(opening[1][0] === '`' && opening[2].includes('`'))) {
        fence = opening[1];
        return '';
      }
      return line;
    })
    .join('\n');
}

export function sourceHeadings(markdown) {
  return [
    ...outsideFences(markdown).matchAll(/^ {0,3}#{1,6}[ \t]+(.+?)\s*$/gm),
  ].map((match) => match[1].replace(/[ \t]+#+[ \t]*$/, '').trim());
}

export function requirementIds(markdown) {
  return [
    ...new Set(
      markdown.match(
        /\b(?:[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-[A-Z]?\d{2,}|[A-Z]\d{2,})\b/g,
      ) || [],
    ),
  ].sort();
}

export function decodeEntities(value) {
  return value.replace(
    /&(?:amp|quot|apos|lt|gt|#39|#\d+|#x[0-9a-f]+);/gi,
    (entity) => {
      const named = {
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
      };
      if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
      const hex = entity.toLowerCase().startsWith('&#x');
      return String.fromCodePoint(
        parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10),
      );
    },
  );
}

function slug(text) {
  return decodeEntities(text)
    .replace(/<[^>]*>/g, '')
    .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-');
}

export function documentAnchors(markdown) {
  const anchors = new Set();
  const duplicates = [];
  const counts = new Map();
  const text = outsideFences(markdown).replace(/<!--[\s\S]*?-->/g, '');
  for (const heading of sourceHeadings(text)) {
    const explicit = heading.match(/\s*\{#([A-Za-z][A-Za-z0-9_-]*)\}\s*$/);
    let id = explicit ? explicit[1] : slug(heading);
    if (!explicit) {
      const count = counts.get(id) || 0;
      counts.set(id, count + 1);
      if (count) id += `-${count}`;
    }
    if (anchors.has(id)) duplicates.push(id);
    anchors.add(id);
  }
  for (const match of text.matchAll(
    /<(?![^>]*:id=)[^>]*\s(?:id|name)=["']([^"']+)["'][^>]*>/g,
  )) {
    if (anchors.has(match[1])) duplicates.push(match[1]);
    anchors.add(decodeEntities(match[1]));
  }
  return { anchors, duplicates };
}

function withoutCodeSpans(text) {
  let output = '';
  for (let index = 0; index < text.length;) {
    if (text[index] === '\\') {
      output += text.slice(index, index + 2);
      index += 2;
    } else if (text[index] === '`') {
      let end = index;
      while (text[end] === '`') end++;
      const marker = text.slice(index, end);
      let closing = text.indexOf(marker, end);
      while (
        closing >= 0 &&
        (text[closing - 1] === '`' || text[closing + marker.length] === '`')
      ) {
        closing = text.indexOf(marker, closing + marker.length);
      }
      if (closing < 0) {
        output += marker;
        index = end;
      } else {
        output += ' '.repeat(closing + marker.length - index);
        index = closing + marker.length;
      }
    } else {
      output += text[index++];
    }
  }
  return output;
}

function balancedEnd(text, start, open, close) {
  let depth = 1;
  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === '\\') index++;
    else if (text[index] === open) depth++;
    else if (text[index] === close && --depth === 0) return index;
  }
  return -1;
}

function destination(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) return trimmed.slice(1, trimmed.indexOf('>'));
  let end = 0;
  while (end < trimmed.length && !/\s/.test(trimmed[end])) {
    if (trimmed[end] === '\\') end++;
    end++;
  }
  return trimmed.slice(0, end).replace(/\\([()])/g, '$1');
}

export function markdownLinks(markdown) {
  const text = withoutCodeSpans(
    outsideFences(markdown).replace(/<!--[\s\S]*?-->/g, ''),
  );
  const references = new Map();
  const links = [];
  for (const match of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*(\S.*)$/gm)) {
    references.set(
      match[1].trim().replace(/\s+/g, ' ').toLowerCase(),
      destination(match[2]),
    );
  }
  for (let index = 0; index < text.length; index++) {
    if (text[index] !== '[' || text[index - 1] === '\\') continue;
    const end = balancedEnd(text, index, '[', ']');
    if (end < 0 || text[end + 1] === ':') continue;
    const label = text.slice(index + 1, end);
    if (text[end + 1] === '(') {
      const close = balancedEnd(text, end + 1, '(', ')');
      if (close >= 0) {
        links.push(destination(text.slice(end + 2, close)));
        index = close;
      }
    } else {
      let key = label;
      if (text[end + 1] === '[') {
        const close = text.indexOf(']', end + 2);
        if (close >= 0) key = text.slice(end + 2, close) || label;
      }
      const target = references.get(
        key.trim().replace(/\s+/g, ' ').toLowerCase(),
      );
      if (target) links.push(target);
      index = end;
    }
  }
  for (const match of text.matchAll(
    /(?<![:\w-])(?:href|src|poster)\s*=\s*["']([^"']+)["']/g,
  ))
    links.push(decodeEntities(match[1]));
  for (const match of text.matchAll(/<(https?:\/\/[^>\s]+)>/g))
    links.push(match[1]);
  return links;
}

export function routeFor(file, directory) {
  return (
    '/' +
    relative(directory, file)
      .split(sep)
      .join('/')
      .replace(/(?:^|\/)index\.md$/, (value) =>
        value.startsWith('/') ? '/' : '',
      )
      .replace(/\.md$/, '')
  );
}

export function localUrl(target, from) {
  if (!target || /^(?:mailto:|tel:|data:)/i.test(target)) return null;
  const url = new URL(
    decodeEntities(target),
    `https://jchanghong023.github.io${from}`,
  );
  if (url.origin !== 'https://jchanghong023.github.io') return null;
  return url;
}

export function unsafeIndicators(text) {
  const rules = [
    ['个人机器路径', /\b[A-Za-z]:[\\/]Users[\\/][\p{L}\p{N}_.-]+/giu],
    ['个人主目录', /(?:\/(?:home|Users)\/[A-Za-z0-9_.-]+|\/root\/)/g],
    ['共享盘路径', /\\\\[A-Za-z0-9][A-Za-z0-9_.-]*\\/g],
    ['内部域名', /\b(?:[a-z0-9-]+\.)+(?:internal|intranet|corp|local)\b/gi],
    [
      '私有网络地址',
      /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2})\b/g,
    ],
    ['私有 IPv6 地址', /\b(?:f[cd][0-9a-f]{2}|fe[89ab][0-9a-f]):[0-9a-f:]+/gi],
    [
      'GitHub 或模型密钥',
      /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,})\b/g,
    ],
    ['私钥', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ['带密码的 URL', /https?:\/\/[^\s/:]+:[^\s/@]+@/gi],
    [
      '真实认证值',
      /\b(?:Bearer\s+[A-Za-z0-9._-]{24,}|(?:api[_-]?key|access[_-]?token|password)\s*[=:]\s*["']?[A-Za-z0-9_\-/.+]{24,})/gi,
    ],
  ];
  return rules.flatMap(([label, pattern]) =>
    [...text.matchAll(pattern)].map((match) => ({
      label,
      line: text.slice(0, match.index).split('\n').length,
    })),
  );
}

export async function textFile(path) {
  return readFile(path, 'utf8');
}
