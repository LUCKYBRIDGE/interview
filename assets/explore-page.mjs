// 자료 페이지(index.html) 보조 동작. 기록장 패널 안(?embed=1)에서도 돈다.
// 위험 상황 묶음 8개의 선택지를 접어 홈을 짧게 한다. 체크 상태와 저장(openclass-student-inputs-v1)은 그대로이고,
// 이 모듈은 인라인 스크립트가 저장된 체크를 되살린 뒤 실행된다(모듈은 문서를 다 읽은 뒤 돈다).
import {nextTabIndex, riskSummaryText} from './explore-labels.mjs?v=20261031-2';

// 탭 방향키 규칙(인라인 탭 스크립트가 있으면 쓴다).
window.knolNextTabIndex = nextTabIndex;

for (const group of document.querySelectorAll('#walk-risk-choices .risk-group')) {
  const options = group.querySelector('.risk-options');
  if (!options || options.closest('details')) continue;
  const checks = [...options.querySelectorAll('.risk-check')];
  const details = document.createElement('details');
  details.className = 'risk-more';
  const summary = document.createElement('summary');
  options.before(details);
  details.append(summary, options);
  const update = () => { summary.textContent = riskSummaryText(checks.length, checks.filter(check => check.checked).length); };
  options.addEventListener('change', update);
  update();
}
