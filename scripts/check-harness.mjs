// 놀토의 하네스 검사: 지침, 스킬, Kiro 스티어링, 문서 링크, 공개 저장소 안전 규칙.
// 사용: npm run check   (AGENTS.md, DESIGN.md, docs/, .agents/, .kiro/를 고친 뒤)
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, extname, join, normalize, sep} from 'node:path';
import {ROOT} from './lib/site-scan.mjs';

const errors = [];
const warnings = [];
const posix = path => path.split(sep).join('/');
const read = file => readFileSync(join(ROOT, file), 'utf8');
const exists = file => existsSync(join(ROOT, file));

const SKIP_DIRS = new Set(['.git', 'node_modules', '.qa', 'tmp', 'output', '__pycache__', '.cache']);
function walk(dir = '') {
  const files = [];
  for (const entry of readdirSync(join(ROOT, dir), {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name) || entry.name === '.DS_Store') continue;
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
const FILES = walk();

// ---- 읽기 도구 ----
function frontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!pair) continue;
    let value = pair[2].trim();
    if (value.startsWith('[')) {
      try { value = JSON.parse(value); } catch { /* 배열 형식이 아니면 글자로 둔다 */ }
    } else value = value.replace(/^(['"])(.*)\1$/, '$2');
    data[pair[1]] = value;
  }
  return {data, body: text.slice(match[0].length)};
}

// 코드 블록 밖의 줄만 돌려준다.
function proseLines(markdown) {
  const lines = [];
  let inCode = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { inCode = !inCode; continue; }
    if (!inCode) lines.push(line);
  }
  return lines;
}

function markdownLinks(markdown) {
  return proseLines(markdown).flatMap(line =>
    [...line.replace(/`[^`]*`/g, '').matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]));
}

// GitHub의 제목 앵커 규칙(소문자, 글자·숫자·밑줄·하이픈·공백만 남기고 공백은 하이픈).
function headingSlugs(markdown) {
  const seen = new Map();
  const slugs = new Set();
  for (const line of proseLines(markdown)) {
    const heading = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    const text = heading[1].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/`/g, '');
    const base = text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count ? `${base}-${count}` : base);
  }
  return slugs;
}

function globRegex(pattern) {
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === '*' && pattern[i + 1] === '*') {
      source += '.*';
      i += pattern[i + 2] === '/' ? 2 : 1;
    } else if (char === '*') source += '[^/]*';
    else if (char === '?') source += '[^/]';
    else source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}$`);
}

// 백틱 안의 저장소 경로(저장소 루트 기준). 자리표시(<>), 와일드카드, git에서 빠진 폴더는 건너뛴다.
const PATH_PREFIXES = ['assets/', 'docs/', 'scripts/', 'tests/', 'materials/', 'profiles/', '.agents/', '.kiro/', '.github/'];
const ROOT_FILES = new Set(['AGENTS.md', 'DESIGN.md', 'README.md', 'PROJECT_STATUS.md', 'CHECKLIST.md', 'package.json', 'index.html', 'workroom.html', '.gitignore']);
const IGNORED_DIRS = ['.qa/', 'tmp/', 'output/'];
function backtickPaths(markdown) {
  const paths = [];
  for (const line of proseLines(markdown)) {
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      for (const word of match[1].split(/\s+/)) {
        if (/[<>*{}]/.test(word)) continue;
        const path = word.replace(/[?#].*$/, '').replace(/[),.:;]+$/, '');
        if (!path || IGNORED_DIRS.some(prefix => path.startsWith(prefix))) continue;
        if (ROOT_FILES.has(path) || PATH_PREFIXES.some(prefix => path.startsWith(prefix))) paths.push(path);
      }
    }
  }
  return paths;
}

// ---- 1. AGENTS.md ----
// 다중 루트 작업 공간에서는 루트의 AGENTS.md가 다른 앱 세션에도 들어간다.
if (!exists('AGENTS.md')) errors.push('AGENTS.md가 없습니다.');
else {
  const agents = read('AGENTS.md');
  const size = Buffer.byteLength(agents);
  if (size > 8192) errors.push(`AGENTS.md가 ${size}바이트입니다. 모든 세션에 들어가므로 8KB 이하로 줄이고 자세한 내용은 docs/나 스킬로 옮기세요.`);
  if (!/knoldiscuss[^\n]{0,40}에만 적용/.test(agents.slice(0, 400))) errors.push('AGENTS.md 첫머리에 knoldiscuss 작업에만 적용한다는 문장이 있어야 합니다.');
}

// ---- 2. 스킬 (.agents/skills가 정본) ----
const SKILL_ROOT = '.agents/skills';
const skills = exists(SKILL_ROOT)
  ? readdirSync(join(ROOT, SKILL_ROOT), {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
  : [];
if (!skills.length) errors.push(`${SKILL_ROOT}에 스킬이 없습니다.`);
const agentsText = exists('AGENTS.md') ? read('AGENTS.md') : '';
for (const name of skills) {
  const file = `${SKILL_ROOT}/${name}/SKILL.md`;
  if (!exists(file)) { errors.push(`${file}이 없습니다.`); continue; }
  const parsed = frontMatter(read(file));
  if (!parsed) { errors.push(`${file}: front matter(name, description)가 없습니다.`); continue; }
  const {name: declared, description} = parsed.data;
  if (declared !== name) errors.push(`${file}: name(${declared})이 폴더 이름(${name})과 같아야 합니다.`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push(`${file}: 스킬 이름은 소문자, 숫자, 하이픈으로 64자 이하여야 합니다.`);
  if (typeof description !== 'string' || !description.trim()) errors.push(`${file}: description이 없습니다.`);
  else if (description.length > 1024) errors.push(`${file}: description이 1024자를 넘습니다.`);
  if (!agentsText.includes(name)) errors.push(`AGENTS.md가 스킬 ${name}을 안내하지 않습니다.`);
}

// ---- 3. Kiro 스티어링 ----
const STEERING_ROOT = '.kiro/steering';
const kiroReadme = exists('.kiro/README.md') ? read('.kiro/README.md') : '';
if (!kiroReadme) errors.push('.kiro/README.md가 없습니다.');
const steeringFiles = exists(STEERING_ROOT) ? readdirSync(join(ROOT, STEERING_ROOT)).filter(name => name.endsWith('.md')).sort() : [];
const steeringBodies = [];
for (const fileName of steeringFiles) {
  const file = `${STEERING_ROOT}/${fileName}`;
  const text = read(file);
  const parsed = frontMatter(text);
  if (!kiroReadme.includes(fileName)) errors.push(`.kiro/README.md의 스티어링 표에 ${fileName}이 없습니다.`);
  if (text.includes('#[[file:')) errors.push(`${file}: 다중 루트에서 #[[file:]]의 기준 루트가 정해져 있지 않아 쓰지 않습니다. 정본 경로를 글로 가리키세요.`);
  if (!parsed) { errors.push(`${file}: front matter가 없으면 Kiro가 항상 포함(always)으로 읽어 다른 앱 세션에도 들어갑니다.`); continue; }
  steeringBodies.push(parsed.body);
  const {inclusion, fileMatchPattern, name, description} = parsed.data;
  if (!inclusion || inclusion === 'always') errors.push(`${file}: always 스티어링은 다른 앱 세션에도 들어갑니다. fileMatch, auto, manual 중 하나를 쓰세요.`);
  else if (inclusion === 'fileMatch') {
    const patterns = Array.isArray(fileMatchPattern) ? fileMatchPattern : fileMatchPattern ? [fileMatchPattern] : [];
    if (!patterns.length) errors.push(`${file}: fileMatchPattern이 없습니다.`);
    for (const pattern of patterns) {
      if (!FILES.some(path => globRegex(pattern).test(path))) errors.push(`${file}: 패턴 ${pattern}에 맞는 파일이 없습니다.`);
    }
  } else if (inclusion === 'auto') {
    if (!name || !description) errors.push(`${file}: auto 스티어링에는 name과 description이 필요합니다.`);
    else if (name !== fileName.replace(/\.md$/, '')) errors.push(`${file}: name(${name})을 파일 이름과 같게 쓰세요.`);
  } else if (inclusion !== 'manual') errors.push(`${file}: 알 수 없는 inclusion 값 ${inclusion}`);
  if (!/\.agents\/skills\/[a-z0-9-]+\/SKILL\.md/.test(parsed.body)) errors.push(`${file}: 따를 스킬(.agents/skills/<이름>/SKILL.md)을 가리켜야 합니다.`);
  // 다른 루트의 세션에 붙어도 적용 범위를 알 수 있게 본문 첫머리에 폴더 이름을 쓴다.
  if (!parsed.body.replace(/^\s*#[^\n]*\n/, '').trimStart().slice(0, 120).includes('knoldiscuss')) {
    errors.push(`${file}: 제목 다음 첫 문장에 'knoldiscuss 폴더'를 써서 적용 범위를 밝히세요.`);
  }
}
for (const name of skills) {
  if (!steeringBodies.some(body => body.includes(`.agents/skills/${name}/SKILL.md`))) errors.push(`스킬 ${name}을 가리키는 Kiro 스티어링이 없습니다.`);
}

// ---- 4. 문서 링크와 연결 ----
const reachable = new Set();
const queue = ['AGENTS.md', 'README.md'].filter(exists);
while (queue.length) {
  const file = queue.shift();
  if (reachable.has(file)) continue;
  reachable.add(file);
  const text = read(file);
  // AGENTS.md와 스킬은 저장소 루트 기준 백틱 경로로 문서를 가리킨다.
  for (const path of backtickPaths(text)) {
    if (path.endsWith('.md') && exists(path) && !reachable.has(path)) queue.push(path);
  }
  for (const link of markdownLinks(text)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(link)) continue;
    const [rawPath, anchor] = link.split('#');
    const target = rawPath ? posix(normalize(join(dirname(file), decodeURIComponent(rawPath)))) : file;
    if (target.startsWith('..')) { errors.push(`${file}: 저장소 밖을 가리키는 링크 ${link}`); continue; }
    if (!exists(target)) { errors.push(`${file}: 없는 파일을 가리키는 링크 ${link}`); continue; }
    if (anchor && target.endsWith('.md') && !headingSlugs(read(target)).has(decodeURIComponent(anchor))) {
      errors.push(`${file}: ${target}에 #${anchor} 제목이 없습니다.`);
    }
    if (target.endsWith('.md') && !reachable.has(target)) queue.push(target);
  }
}
for (const doc of FILES.filter(path => path.endsWith('.md') && (path.startsWith('docs/') || path === 'DESIGN.md'))) {
  if (!reachable.has(doc)) errors.push(`${doc}: AGENTS.md에서 링크를 따라 닿지 않습니다. docs/README.md 표에 더하세요.`);
}

// 지금 기준인 문서의 백틱 경로는 실제로 있어야 한다. 시점 기록(docs/audits/)과 개편 6단계에서 다시 쓸 옛 문서는 뺀다.
const LEGACY_DOCS = new Set(['PROJECT_STATUS.md', 'CHECKLIST.md', 'docs/workroom.md', 'docs/gems-28-32.md', 'assets/brand/README.md']);
for (const doc of FILES.filter(path => path.endsWith('.md') && !LEGACY_DOCS.has(path) && !path.startsWith('docs/audits/'))) {
  for (const path of backtickPaths(read(doc))) {
    if (!exists(path)) errors.push(`${doc}: 없는 경로 \`${path}\``);
  }
}

// ---- 5. 공개 저장소 안전 규칙 ----
// Jekyll이 Markdown을 HTML로 만들 때 Liquid 문법을 처리한다. 점이나 밑줄로 시작하는 폴더는 공개하지 않는다.
for (const file of FILES) {
  if (extname(file) !== '.md' || file.split('/').some(part => part.startsWith('.') || part.startsWith('_'))) continue;
  if (/\{\{|\{%/.test(read(file))) errors.push(`${file}: Liquid 문법(중괄호 두 개, 중괄호와 퍼센트)이 있어 GitHub Pages 빌드가 깨질 수 있습니다.`);
}

const ABSOLUTE_PATH = /\/Users\/[A-Za-z]|\/home\/[a-z]|\/var\/folders\/|\b[A-Za-z]:[\\/]+(?:Users|ai_dev|Windows)\b/;
const LEGACY_ABSOLUTE = new Set(['scripts/export-brand.mjs', 'scripts/build_brand.py', 'scripts/revise_group_worksheet.py', 'assets/brand/README.md']);
const TEXT_EXTENSIONS = new Set(['.md', '.mjs', '.js', '.py', '.json', '.yml', '.yaml', '.html', '.css', '.txt']);
for (const file of FILES) {
  if (!TEXT_EXTENSIONS.has(extname(file)) || !ABSOLUTE_PATH.test(read(file))) continue;
  if (LEGACY_ABSOLUTE.has(file)) warnings.push(`로컬 절대 경로가 남아 있습니다(개편 6단계에서 정리): ${file}`);
  else errors.push(`${file}: 로컬 절대 경로를 쓰지 마세요. 저장소 기준 상대 경로나 인자를 쓰세요.`);
}

const ignore = exists('.gitignore') ? read('.gitignore') : '';
for (const dir of ['.qa', 'tmp', 'output']) {
  if (!new RegExp(`^/?${dir.replace('.', '\\.')}/?\\s*$`, 'm').test(ignore)) errors.push(`.gitignore에 ${dir}/가 없습니다. 검증 자료와 임시 파일이 공개될 수 있습니다.`);
}

// ---- 결과 ----
for (const warning of warnings) console.log(`경고: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`오류: ${error}`);
  console.error(`하네스 검사 실패: 오류 ${errors.length}개, 경고 ${warnings.length}개`);
  process.exit(1);
}
console.log(`하네스 검사 통과: 스킬 ${skills.length}개, 스티어링 ${steeringFiles.length}개, 연결된 문서 ${reachable.size}개, 경고 ${warnings.length}개`);
