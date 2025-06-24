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
import { parseTabText, validateRecords } from '../fix-invalid-google-ids/utils.js';

module('parseTabText');

test('parses tab separated lines', assert => {
  const text = 'ID\tGOOGLE_PLACE_ID\tNAME\n1\ta\tfoo';
  const result = parseTabText(text);
  assert.equal(result.length, 1);
  assert.equal(result[0].ID, '1');
  assert.equal(result[0].NAME, 'foo');
});

module('validateRecords');

test('marks matching name as valid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '1');
  assert.equal(recs[1].IS_VALID, '0');
});

