import assert from 'node:assert/strict';
import test from 'node:test';
import {WIDE_MIN, WIDE_QUERY, currentStepIndex, isWideWidth, modeFor, panelOpenAfterResize, panelOpenOnLoad} from '../assets/workroom-layout.mjs';
import {paneState} from '../assets/explore-state.mjs';

test('panel state is stored with the legacy interview-explore-pane-v1 mode values', () => {
  assert.equal(modeFor(true), 'both');
  assert.equal(modeFor(false), 'writing');
  for (const mode of ['both', 'writing']) assert.equal(paneState({mode}).mode, mode);
  assert.equal(WIDE_QUERY, '(min-width: 1024px)');
});

test('narrow screens always start with the writing area, wide screens follow the saved choice', () => {
  for (const mode of ['both', 'explore', 'writing', undefined]) {
    assert.equal(panelOpenOnLoad({mode, wide: false}), false, `narrow ${mode}`);
    assert.equal(panelOpenOnLoad({mode, forced: true, wide: false}), false, `narrow forced ${mode}`);
  }
  assert.equal(panelOpenOnLoad({mode: 'both', wide: true}), true);
  assert.equal(panelOpenOnLoad({mode: 'explore', wide: true}), true, 'old explore-only view opens the panel');
  assert.equal(panelOpenOnLoad({mode: 'writing', wide: true}), false, 'a closed panel stays closed after reload');
  assert.equal(panelOpenOnLoad({mode: 'writing', forced: true, wide: true}), true, '?view=both opens the panel');
  assert.equal(panelOpenOnLoad({mode: paneState(null).mode, wide: true}), true, 'fresh sessions open the panel on wide screens');
});

test('rotating a tablet closes the panel on narrow screens and restores it on wide screens', () => {
  assert.equal(panelOpenAfterResize({mode: 'both', wide: false}), false);
  assert.equal(panelOpenAfterResize({mode: 'both', wide: true}), true);
  assert.equal(panelOpenAfterResize({mode: 'writing', wide: true}), false);
});

test('the current step is the last heading above the sticky step bar', () => {
  assert.equal(currentStepIndex([], 100), -1);
  assert.equal(currentStepIndex([300, 900, 1500], 100), 0, 'before any step the first one is current');
  assert.equal(currentStepIndex([-400, 80, 700], 100), 1);
  assert.equal(currentStepIndex([-1400, -800, -200], 100), 2);
});

test('the side panel width threshold is 1024px in both the media query and the width check', () => {
  assert.equal(WIDE_MIN, 1024);
  assert.equal(isWideWidth(1023), false);
  assert.equal(isWideWidth(1024), true);
  assert.equal(isWideWidth(1280), true);
  assert.equal(isWideWidth(Number.NaN), false);
});
