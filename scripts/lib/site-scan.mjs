// 사이트 정적 파일을 읽어 로컬 참조, 캐시 갱신 값(?v=), 외부 링크, 화면 부채 지표를 모은다.
// tests/site-integrity.test.mjs와 scripts/site-baseline.mjs가 함께 쓴다. 외부 패키지는 쓰지 않는다.
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PAGES = ['index.html', 'workroom.html'];
// 기준선 파일. 고칠 때는 npm run baseline:links, npm run baseline:debt를 쓴다.
export const BASELINES = {
  links: 'tests/baselines/external-links.json',
  debt: 'tests/baselines/ui-debt.json',
};

const posix = path => path.split(sep).join('/');
const read = file => readFileSync(join(ROOT, file), 'utf8');

export function readBaseline(kind) {
  return JSON.parse(read(BASELINES[kind]));
}

export function assetFiles(extensions) {
  return readdirSync(join(ROOT, 'assets'), {withFileTypes: true})
    .filter(entry => entry.isFile() && extensions.some(extension => entry.name.endsWith(extension)))
    .map(entry => `assets/${entry.name}`)
    .sort();
}

// 브라우저가 실제로 읽는 페이지, 모듈, 스타일.
export function siteSources() {
  return [...PAGES, ...assetFiles(['.mjs', '.css'])];
}

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i; // 다른 사이트, data:, 같은 페이지 안 이동
const PLAIN = /^[\w./-]+(?:\?[\w.=&%-]*)?(?:#[\w%-]*)?$/; // 스크립트가 이어 붙이는 문자열은 뺀다
const PATTERNS = {
  html: [/\b(?:src|href)\s*=\s*"([^"]*)"/g],
  css: [/url\(\s*['"]?([^'")]+)['"]?\s*\)/g],
  mjs: [/^\s*import\s+(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/gm, /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g],
};

export function localReferences() {
  const references = [];
  for (const file of siteSources()) {
    const text = read(file);
    for (const pattern of PATTERNS[file.split('.').pop()]) {
      for (const match of text.matchAll(pattern)) {
        const value = match[1].trim();
        if (!value || SKIP.test(value) || !PLAIN.test(value)) continue;
        const [path, query = ''] = value.split('#')[0].split('?');
        if (!path) continue;
        references.push({from: file, value, target: posix(join(dirname(file), path)), v: new URLSearchParams(query).get('v')});
      }
    }
  }
  return references;
}

export function missingReferences(references = localReferences()) {
  return references
    .filter(reference => !existsSync(join(ROOT, reference.target)))
    .map(reference => `${reference.from}: ${reference.value}`);
}

// 같은 파일을 서로 다른 ?v= 값으로 부르면 모듈이 두 번 실행되거나 옛 파일이 섞인다.
export function cacheTokenConflicts(references = localReferences()) {
  const byTarget = new Map();
  for (const reference of references) {
    const tokens = byTarget.get(reference.target) ?? new Map();
    const token = reference.v ?? '(없음)';
    tokens.set(token, [...(tokens.get(token) ?? []), reference.from]);
    byTarget.set(reference.target, tokens);
  }
  return [...byTarget]
    .filter(([, tokens]) => tokens.size > 1)
    .map(([target, tokens]) => `${target}: ${[...tokens].map(([token, from]) => `${token} (${[...new Set(from)].join(', ')})`).join(' / ')}`)
    .sort();
}

const URL_PATTERN = /https?:\/\/[^\s"'<>\\)\]`]+/g;

export function externalLinks() {
  const urls = new Set();
  for (const file of siteSources()) {
    for (const match of read(file).matchAll(URL_PATTERN)) {
      const url = match[0].replace(/[.,;:]+$/, '');
      if (!url.startsWith('http://www.w3.org/')) urls.add(url); // SVG 이름공간은 링크가 아니다
    }
  }
  return [...urls].sort();
}

// DESIGN.md '하지 말 것'의 숫자. 늘면 npm test가 실패한다.
export function uiDebt() {
  const sources = siteSources().map(file => ({file, text: read(file)}));
  const count = (pattern, include = () => true) =>
    sources.filter(include).reduce((total, {text}) => total + (text.match(pattern) ?? []).length, 0);
  const smallFonts = sources.reduce((total, {text}) =>
    total + [...text.matchAll(/font-size\s*:\s*([0-9.]+)px/g)].filter(match => Number(match[1]) < 13).length, 0);
  return {
    alertCalls: count(/\balert\(/g),
    importantDeclarations: count(/!important/g),
    inlineStyleBlocks: count(/<style\b/g, ({file}) => file.endsWith('.html')),
    fontSizesUnder13px: smallFonts,
  };
}
