import assert from 'node:assert/strict';
import test from 'node:test';
import {nextTabIndex, riskSummaryText} from '../assets/explore-labels.mjs';

test('risk group summary says how many situations are chosen (the legend already shows the total)', () => {
  assert.equal(riskSummaryText(8, 0), '상황 고르기');
  assert.equal(riskSummaryText(8, 2), '상황 고르기 · 2개 고름');
  assert.equal(riskSummaryText(6, 9), '상황 고르기 · 6개 고름');
  assert.equal(riskSummaryText(Number.NaN, 1), '상황 없음');
});

test('arrow keys skip hidden or pending tabs and wrap around', () => {
  // home, walking, discussion, resources, noise, interview, downloads (noise and interview are pending)
  const usable = [true, true, true, true, false, false, true];
  assert.equal(nextTabIndex(usable, 3, 'ArrowRight'), 6);
  assert.equal(nextTabIndex(usable, 6, 'ArrowRight'), 0);
  assert.equal(nextTabIndex(usable, 0, 'ArrowLeft'), 6);
  assert.equal(nextTabIndex(usable, 6, 'ArrowLeft'), 3);
  assert.equal(nextTabIndex(usable, 2, 'Home'), 0);
  assert.equal(nextTabIndex(usable, 2, 'End'), 6);
  assert.equal(nextTabIndex(usable, 4, 'ArrowRight'), 0, 'from a pending tab, move to a usable one');
  assert.equal(nextTabIndex(usable, 2, 'Enter'), 2);
  assert.equal(nextTabIndex([false, false], 1, 'ArrowRight'), 1);
});
