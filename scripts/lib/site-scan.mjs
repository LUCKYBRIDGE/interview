// 사이트 정적 파일을 읽어 로컬 참조, 캐시 갱신 값(?v=), 외부 링크, 화면 부채 지표를 모은다.
// tests/site-integrity.test.mjs와 scripts/site-baseline.mjs가 함께 쓴다. 외부 패키지는 쓰지 않는다.
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {fieldKey} from '../../assets/explore-inputs.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PAGES = ['index.html', 'workroom.html'];
// 기준선 파일. 고칠 때는 npm run baseline:links, npm run baseline:debt를 쓴다.
export const BASELINES = {
  links: 'tests/baselines/external-links.json',
  debt: 'tests/baselines/ui-debt.json',
  keys: 'tests/baselines/input-keys.json',
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

// 브라우저가 실제로 읽는 페이지, 모듈, 일반 스크립트, 스타일.
export function siteSources() {
  return [...PAGES, ...assetFiles(['.mjs', '.js', '.css'])];
}

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i; // 다른 사이트, data:, 같은 페이지 안 이동
const PLAIN = /^[\w./-]+(?:\?[\w.=&%-]*)?(?:#[\w%-]*)?$/; // 스크립트가 이어 붙이는 문자열은 뺀다
const PATTERNS = {
  html: [/\b(?:src|href)\s*=\s*"([^"]*)"/g],
  css: [/url\(\s*['"]?([^'")]+)['"]?\s*\)/g],
  mjs: [/^\s*import\s+(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/gm, /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g],
  js: [], // 일반 스크립트(assets/explore-main.js)는 다른 파일을 불러오지 않는다. 외부 링크와 화면 부채는 아래에서 함께 센다.
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

const ENTITIES = {amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'"};
const attributes = tag => Object.fromEntries([...tag.matchAll(/\s([\w-]+)(?:="([^"]*)")?/g)]
  .map(([, name, value = '']) => [name, value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ENTITIES[entity])]));

// 자료 페이지 입력 자동 저장(openclass-student-inputs-v1)이 index.html의 칸마다 쓰는 키.
// 브라우저의 explore-page.mjs와 같은 규칙(fieldKey)으로 마크업에서 읽는다. 키가 바뀌면 그 칸에 저장된 학생 글이 이어지지 않는다.
export function inputKeys(file = 'index.html') {
  const html = read(file);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const keys = [];
  let choice = null; // 지금 읽는 .noise-choice 안의 소음 문구
  let stageEvalIndex = 0;
  for (const match of main.matchAll(/<label class="noise-choice">|<\/label>|<(input|textarea|select)\b[^>]*>/g)) {
    if (match[0] === '<label class="noise-choice">') { choice = {value: undefined}; continue; }
    if (match[0] === '</label>') { choice = null; continue; }
    const attrs = attributes(match[0].replace(/^<\w+/, ''));
    const type = match[1] === 'input' ? (attrs.type ?? 'text') : match[1];
    if (['button', 'submit', 'reset', 'file', 'hidden'].includes(type) || (attrs.id ?? '').startsWith('share-')) continue;
    const classes = (attrs.class ?? '').split(/\s+/).filter(Boolean);
    if (choice && classes.includes('noise-check')) choice.value = attrs.value;
    const key = fieldKey({
      id: attrs.id, classes, group: attrs['data-group'], value: attrs.value ?? '', name: attrs.name,
      inNoiseChoice: Boolean(choice), noiseValue: choice?.value,
      stageEvalIndex: classes.includes('stage-eval') ? stageEvalIndex++ : -1,
    });
    if (key) keys.push(key);
  }
  return keys;
}
