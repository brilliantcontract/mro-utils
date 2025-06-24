import { parseQueries, createCachedFetcher } from '../serper-dev-caller/utils.js';
import QUnit from 'qunit';
const { module, test } = QUnit;

module('parseQueries');

test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});

module('createCachedFetcher');

test('returns cached result on second call', async assert => {
  let count = 0;
  const fetcher = async q => {
    count++;
    return q + '-result';
  };
  const cached = createCachedFetcher(fetcher);

  const r1 = await cached('a');
  const r2 = await cached('a');

  assert.equal(count, 1, 'fetcher called once');
  assert.equal(r1, 'a-result', 'first result matches');
  assert.equal(r2, 'a-result', 'second result matches cached value');
});
