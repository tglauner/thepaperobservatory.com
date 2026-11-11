import test from 'node:test';
import assert from 'node:assert/strict';
import { courses, recommendedCourseForPaper } from '../shared/site-config.js';

test('the commercial catalog includes only the three in-scope courses', () => {
  assert.deepEqual(courses.map(course => course.id).sort(), ['frtb', 'mbs', 'rates']);
  assert.ok(courses.every(course => !course.url.includes('/value_at_risk/')));
});

test('the risk paper recommends FRTB independently of catalog order', () => {
  for (const catalog of [courses, [...courses].reverse(), [courses[1], courses[2], courses[0]]]) {
    const course = recommendedCourseForPaper('risk-on-off', catalog);
    assert.equal(course.id, 'frtb');
    assert.equal(course.url, 'https://tglauner.com/frtb_fundamentals/');
  }
});

test('the flow paper and unassigned papers do not receive a forced recommendation', () => {
  assert.equal(recommendedCourseForPaper('stochastic-flow-diagrams'), null);
  assert.equal(recommendedCourseForPaper('future-paper'), null);
  assert.equal(recommendedCourseForPaper('constructor'), null);
});

test('a missing explicitly recommended course fails instead of substituting another offer', () => {
  assert.throws(() => recommendedCourseForPaper('risk-on-off', courses.filter(course => course.id !== 'frtb')), /Recommended course is missing: frtb/);
});
