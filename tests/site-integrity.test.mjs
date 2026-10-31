// 사이트 무결성: 로컬 참조, 캐시 갱신 값, 외부 링크 기준선, 화면 부채, 지켜야 할 공개 주소.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import test from 'node:test';
import {ROOT, cacheTokenConflicts, externalLinks, localReferences, missingReferences, readBaseline, uiDebt} from '../scripts/lib/site-scan.mjs';
import {ROUTES} from '../assets/explore-state.mjs';

const read = file => readFileSync(join(ROOT, file), 'utf8');

test('페이지와 모듈이 부르는 로컬 파일이 모두 있다', () => {
  const references = localReferences();
  assert.ok(references.length > 40, `참조를 너무 적게 찾았습니다(${references.length}). 검사 패턴을 확인하세요.`);
  assert.deepEqual(missingReferences(references), []);
});

test('같은 파일을 서로 다른 ?v= 값으로 부르지 않는다', () => {
  assert.deepEqual(cacheTokenConflicts(), [], '고친 파일을 부르는 모든 곳의 ?v= 값을 같은 새 값으로 맞추세요.');
});

test('외부 링크가 기준선과 같다', () => {
  const {links: expected} = readBaseline('links');
  const current = externalLinks();
  const now = new Set(current);
  const before = new Set(expected);
  const removed = expected.filter(link => !now.has(link));
  const added = current.filter(link => !before.has(link));
  assert.deepEqual({removed, added}, {removed: [], added: []},
    '외부 링크가 바뀌었습니다. 지운 링크는 되살리세요. 의도한 변경이면 npm run baseline:links로 기준선을 고치고 이유를 남기세요(docs/content-guide.md 6절).');
});

test('화면 부채가 기준보다 늘지 않는다', () => {
  const {max} = readBaseline('debt');
  const current = uiDebt();
  const raised = Object.keys(max).filter(key => current[key] > max[key]).map(key => `${key}: ${max[key]} → ${current[key]}`);
  assert.deepEqual(raised, [], 'DESIGN.md 9절을 보세요. 줄였을 때만 npm run baseline:debt로 기준을 낮춥니다.');
});

test('자료 경로와 기록장 주소를 지킨다', () => {
  const index = read('index.html');
  const workroom = read('workroom.html');
  for (const route of ['home', 'walking', 'discussion', 'resources', 'noise', 'interview', 'downloads']) {
    assert.ok(index.includes(`id="panel-${route}"`), `index.html에 panel-${route}가 있어야 합니다.`);
  }
  for (const route of ['home', 'walking', 'study', 'discussion', 'noise', 'interview']) {
    assert.ok(ROUTES.includes(route), `기록장 자료 패널이 ${route} 경로를 받아야 합니다.`);
  }
  assert.ok(index.includes('workroom.html?view=both#personal'), '홈 진입이 기록장으로 이어져야 합니다.');
  assert.ok(index.includes("has('explore')") && index.includes("has('embed')"), 'index.html이 ?explore=1과 ?embed=1을 처리해야 합니다.');
  assert.match(workroom, /id="mode-personal"/);
  assert.match(workroom, /id="mode-group"/);
});

test('페이지 사이 메시지 이름을 지킨다', () => {
  const pane = read('assets/explore-pane.mjs');
  const embed = read('assets/explore-embed.mjs');
  for (const type of ['discussion-activity', 'discussion-explore-position', 'discussion-explore-restore']) {
    assert.ok(pane.includes(type) && embed.includes(type), `${type} 메시지를 양쪽에서 써야 합니다(docs/architecture.md 4절).`);
  }
  assert.ok(pane.includes('location.origin') && embed.includes('location.origin'), '메시지는 같은 출처만 받아야 합니다.');
});
