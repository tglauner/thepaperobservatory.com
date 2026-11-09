import test from 'node:test';
import assert from 'node:assert/strict';
import { glossary, quiz, evidence, readingList, limitations } from '../src/data/content.js';

const nonempty = (value, context) => assert.ok(typeof value === 'string' && value.trim(), context);
const unique = values => assert.equal(new Set(values).size, values.length);
const physicalPage = value => assert.ok(Number.isInteger(value) && value >= 2 && value <= 23, `Invalid article PDF page: ${value}`);

test('glossary terms are unique and contain explanations for both audiences', () => {
  assert.ok(glossary.length > 0);
  unique(glossary.map(item => item.term.trim().toLocaleLowerCase()));
  for (const item of glossary) for (const key of ['term', 'definition', 'advanced']) nonempty(item[key], key);
});

test('all nine quiz questions have unique IDs, complete feedback and valid source pages', () => {
  assert.equal(quiz.length, 9);
  unique(quiz.map(item => item.id));
  for (const item of quiz) {
    for (const key of ['id', 'question', 'explanation']) nonempty(item[key], key);
    physicalPage(item.source);
  }
});

test('quiz answers address real distinct options within each question', () => {
  for (const item of quiz) {
    assert.ok(Array.isArray(item.options) && item.options.length >= 2);
    item.options.forEach(option => nonempty(option, item.id));
    unique(item.options);
    assert.ok(Number.isInteger(item.correct) && item.correct >= 0 && item.correct < item.options.length, item.id);
  }
});

test('evidence entries are complete and uniquely named without requiring unique pages', () => {
  assert.ok(evidence.length > 0);
  unique(evidence.map(item => item.title));
  for (const item of evidence) {
    for (const key of ['title', 'summary', 'detail']) nonempty(item[key], key);
    physicalPage(item.page);
  }
});

test('evidence journal references account for the PDF cover-page offset', () => {
  for (const item of evidence) {
    const printed = String(item.printed).match(/^(\d+)(?:[–-](\d+))?$/);
    assert.ok(printed, item.title);
    assert.equal(Number(printed[1]), item.page + 19, item.title);
    if (printed[2]) assert.ok(Number(printed[2]) >= Number(printed[1]) && Number(printed[2]) <= 42);
  }
});

test('further reading has explicit scholarly attribution and valid HTTPS links', () => {
  assert.ok(readingList.length > 0);
  unique(readingList.map(item => item.url));
  for (const item of readingList) {
    for (const key of ['title', 'author', 'note']) nonempty(item[key], key);
    const url = new URL(item.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.username, '');
    assert.equal(url.password, '');
    assert.ok(url.hostname);
  }
});

test('limitations have unique readable titles and substantive explanatory text', () => {
  assert.ok(limitations.length > 0);
  unique(limitations.map(item => item.title));
  for (const item of limitations) {
    nonempty(item.title, 'title');
    nonempty(item.text, item.title);
  }
});
