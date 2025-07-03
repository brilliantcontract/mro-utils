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
import { parseTabText, validateRecords, validateRecordsByCid } from '../fix-invalid-google-ids/utils.js';

module('parseTabText');

test('parses tab separated lines', assert => {
  const text = 'ID\tGOOGLE_PLACE_ID\tCID\tNAME\tADDRESS\tCITY\tSTATE\tZIP\tSEARCH_QUERY\tJSON_DATA_FROM_GOOGLE_MAP\n1\ta\tc1\tfoo\taddr\tc\ts\t123\tq\t{}';
  const result = parseTabText(text);
  assert.equal(result.length, 1);
  assert.equal(result[0].ID, '1');
  assert.equal(result[0].CID, 'c1');
  assert.equal(result[0].NAME, 'foo');
  assert.equal(result[0].ADDRESS, 'addr');
});

module('validateRecords');

test('marks matching name as valid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '1');
  assert.equal(recs[1].IS_VALID, '0');
});

test('ignores case and punctuation when matching', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'', NAME:'ACME, Inc.', ADDRESS:'123 Main St.', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'x', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"acme inc","address":"123 main st suite"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'', NAME:'Other', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'x', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"acme inc","address":"123 main st suite"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '1');
  assert.equal(recs[1].IS_VALID, '0');
});

test('clears values when all are invalid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '');
  assert.equal(recs[1].IS_VALID, '');
});

test('sets 3 when all records found', assert => {
  const json = '{"places":[{"title":"Foo","address":"A"},{"title":"Bar","address":"B"}]}';
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'g1', CID:'', NAME:'Foo', ADDRESS:'A', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:json},
    {ID:'2', GOOGLE_PLACE_ID:'g1', CID:'', NAME:'Bar', ADDRESS:'B', CITY:'X', STATE:'S', ZIP:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:json}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '3');
  assert.equal(recs[1].IS_VALID, '3');
});

module('validateRecordsByCid');

test('skips group with identical cid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'x', CID:'111', NAME:'A', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID:'', SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{}'},
    {ID:'2', GOOGLE_PLACE_ID:'x', CID:'111', NAME:'B', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID:'', SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{}'}
  ];
  validateRecordsByCid(recs);
  assert.equal(recs[0].IS_VALID, '');
  assert.equal(recs[1].IS_VALID, '');
});

test('marks record matching json cid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'y', CID:'123', NAME:'A', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID:'', SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"cid":"456"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'y', CID:'456', NAME:'B', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID:'', SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"cid":"456"}]}'}
  ];
  validateRecordsByCid(recs);
  assert.equal(recs[0].IS_VALID, '0');
  assert.equal(recs[1].IS_VALID, '1');
});

