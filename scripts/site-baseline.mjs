// 외부 링크와 화면 부채 지표의 기준선을 고친다. npm test는 이 기준선과 지금 파일을 비교한다.
// 사용: node scripts/site-baseline.mjs links
//       node scripts/site-baseline.mjs keys
//       node scripts/site-baseline.mjs debt [--allow-increase]
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {BASELINES, ROOT, externalLinks, inputKeys, readBaseline, uiDebt} from './lib/site-scan.mjs';

const DESCRIPTIONS = {
  links: '사이트(index.html, workroom.html, assets의 모듈과 스타일)에 있는 외부 주소 목록. 외부 링크는 지우지 않는다(docs/content-guide.md 6절). 의도해서 바꿨다면 npm run baseline:links로 고치고 이유를 남긴다.',
  debt: 'DESIGN.md 9절의 화면 부채 상한. 늘면 npm test가 실패한다. 줄였으면 npm run baseline:debt로 낮춘다.',
  keys: 'index.html의 칸마다 자료 페이지 자동 저장(openclass-student-inputs-v1)이 쓰는 키. 키는 학생 기록 계약이다(docs/architecture.md 3절). 위험 상황 문구·묶음 이름·칸 id를 바꾸면 키가 바뀌므로 이관을 먼저 만들고 npm run baseline:keys로 고친다.',
};

const [kind, ...flags] = process.argv.slice(2);
if (!(kind in BASELINES)) {
  console.error('사용: node scripts/site-baseline.mjs links | keys | debt [--allow-increase]');
  process.exit(2);
}
const file = join(ROOT, BASELINES[kind]);
const previous = existsSync(file) ? readBaseline(kind) : null;

function save(value) {
  mkdirSync(dirname(file), {recursive: true});
  writeFileSync(file, JSON.stringify({description: DESCRIPTIONS[kind], ...value}, null, 2) + '\n');
}

if (kind === 'links') {
  const links = externalLinks();
  const before = new Set(previous?.links ?? []);
  const now = new Set(links);
  const added = links.filter(link => !before.has(link));
  const removed = [...before].filter(link => !now.has(link));
  save({links});
  console.log(`외부 링크 ${links.length}개를 기준선으로 저장했습니다. 추가 ${added.length}개, 삭제 ${removed.length}개.`);
  added.forEach(link => console.log(`+ ${link}`));
  removed.forEach(link => console.log(`- ${link}`));
  if (removed.length) console.log('지운 링크가 있습니다. 이유를 커밋 메시지와 PROJECT_STATUS.md에 남기세요.');
} else if (kind === 'keys') {
  const keys = inputKeys();
  const before = new Set(previous?.keys ?? []);
  const now = new Set(keys);
  const added = keys.filter(key => !before.has(key));
  const removed = [...before].filter(key => !now.has(key));
  save({keys});
  console.log(`칸 키 ${keys.length}개를 기준선으로 저장했습니다. 추가 ${added.length}개, 삭제 ${removed.length}개.`);
  added.forEach(key => console.log(`+ ${key}`));
  removed.forEach(key => console.log(`- ${key}`));
  if (removed.length) console.log('없어진 키가 있습니다. 그 칸의 저장된 값이 남는지(이전에 적은 내용, 이관) 확인하고 이유를 PROJECT_STATUS.md에 남기세요.');
} else {
  const current = uiDebt();
  const before = previous?.max ?? {};
  const raised = Object.keys(current).filter(key => key in before && current[key] > before[key]);
  if (raised.length && !flags.includes('--allow-increase')) {
    console.error(`화면 부채가 늘었습니다: ${raised.map(key => `${key} ${before[key]} → ${current[key]}`).join(', ')}`);
    console.error('보통은 코드를 고쳐 줄입니다. 꼭 늘려야 하면 --allow-increase를 붙이고 이유를 기록하세요.');
    process.exit(1);
  }
  save({max: current});
  console.log(`화면 부채 기준: ${Object.entries(current).map(([key, value]) => `${key} ${before[key] ?? '없음'} → ${value}`).join(', ')}`);
}
