import { parseQueries } from '../serper-dev-caller/utils.js';

QUnit.module('parseQueries');

QUnit.test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});
