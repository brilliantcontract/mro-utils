import { parseQueries } from '../serper-dev-caller/utils.js';
import QUnit from 'qunit';
const { module, test } = QUnit;

module('parseQueries');

test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});
