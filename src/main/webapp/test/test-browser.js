// parseQueries, parseTabText and validateRecords are loaded globally

QUnit.module('parseQueries');

QUnit.test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});

QUnit.module('parseTabText');
QUnit.test('parses tab separated lines', assert => {
  const text = 'ID\tGOOGLE_PLACE_ID\tCID\tNAME\tADDRESS\tCITY\tSTATE\tZIP\tSEARCH_QUERY\tJSON_DATA_FROM_GOOGLE_MAP\n1\ta\tcid1\tfoo\taddr\tc\ts\t123\tq\t{}';
  const result = parseTabText(text);
  assert.equal(result.length, 1);
  assert.equal(result[0].CID, 'cid1');
  assert.equal(result[0].NAME, 'foo');
  assert.equal(result[0].ADDRESS, 'addr');
  assert.equal(typeof result[0].IS_VALID, 'function', 'IS_VALID is observable');
});

QUnit.module('validateRecords');
QUnit.test('marks matching name as valid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '1');
  assert.equal(recs[1].IS_VALID(), '0');
});

QUnit.test('ignores case and punctuation when matching', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'', NAME:'ACME, Inc.', ADDRESS:'123 Main St.', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'x', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"acme inc","address":"123 main st suite"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'', NAME:'Other', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'x', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"acme inc","address":"123 main st suite"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '1');
  assert.equal(recs[1].IS_VALID(), '0');
});

QUnit.test('clears values when all are invalid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '');
  assert.equal(recs[1].IS_VALID(), '');
});

QUnit.test('sets 3 when all records found', assert => {
  const json = '{"places":[{"title":"Foo","address":"A"},{"title":"Bar","address":"B"}]}';
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'g1', CID:'', NAME:'Foo', ADDRESS:'A', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:json},
    {ID:'2', GOOGLE_PLACE_ID:'g1', CID:'', NAME:'Bar', ADDRESS:'B', CITY:'X', STATE:'S', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:json}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '3');
  assert.equal(recs[1].IS_VALID(), '3');
});

QUnit.module('validateRecordsByCid');
QUnit.test('skips group with identical cid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'x', CID:'111', NAME:'A', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{}'},
    {ID:'2', GOOGLE_PLACE_ID:'x', CID:'111', NAME:'B', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{}'}
  ];
  validateRecordsByCid(recs);
  assert.equal(recs[0].IS_VALID(), '');
  assert.equal(recs[1].IS_VALID(), '');
});

QUnit.test('marks record matching json cid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'y', CID:'123', NAME:'A', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"cid":"456"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'y', CID:'456', NAME:'B', ADDRESS:'', CITY:'', STATE:'', ZIP:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"cid":"456"}]}'}
  ];
  validateRecordsByCid(recs);
  assert.equal(recs[0].IS_VALID(), '0');
  assert.equal(recs[1].IS_VALID(), '1');
});

QUnit.module('collectIsValid');
QUnit.test('joins values with new lines', assert => {
  const recs = [
    { IS_VALID: ko.observable('1') },
    { IS_VALID: ko.observable('0') },
    { IS_VALID: ko.observable('2') }
  ];
  const result = collectIsValid(recs);
  assert.equal(result, '1\n0\n2');
});

QUnit.module('buildResponsesBody');
QUnit.test('creates body for web search', assert => {
  const body = buildResponsesBody('sys', 'user');
  assert.equal(body.model, 'gpt-4o');
  assert.deepEqual(body.tools, [{ type: 'web_search' }]);
  assert.equal(body.input, 'sys\nuser');
});

QUnit.module('composeQuery');
QUnit.test('trims and joins prompts', assert => {
  const result = composeQuery(' sys ', ' user ');
  assert.equal(result, 'sys\nuser');
});

QUnit.module('populateNewData');
QUnit.test('copies place when valid', assert => {
  const rec = {
    JSON_DATA_FROM_GOOGLE_MAP: '{"places":[{"title":"Foo"}]}',
    IS_VALID: ko.observable('1')
  };
  populateNewData([rec]);
  assert.equal(rec.NEW_DATA(), '{"title":"Foo"}');
});

QUnit.test('leaves empty when invalid', assert => {
  const rec = {
    JSON_DATA_FROM_GOOGLE_MAP: '{"places":[{"title":"Foo"}]}',
    IS_VALID: ko.observable('0')
  };
  populateNewData([rec]);
  assert.equal(rec.NEW_DATA(), '');
});

QUnit.test('selects matching place when value is 3', assert => {
  const data = '{"places":[{"title":"Foo","address":"A"},{"title":"Foo","address":"B"}]}';
  const rec = {
    NAME: 'Foo',
    ADDRESS: 'B',
    JSON_DATA_FROM_GOOGLE_MAP: data,
    IS_VALID: ko.observable('3')
  };
  populateNewData([rec]);
  assert.equal(rec.NEW_DATA(), '{"title":"Foo","address":"B"}');
});

QUnit.module('collectNewData');
QUnit.test('joins NEW_DATA values with new lines', assert => {
  const recs = [
    { NEW_DATA: ko.observable('{"a":1}') },
    { NEW_DATA: ko.observable('{"b":2}') }
  ];
  const result = collectNewData(recs);
  assert.equal(result, '{"a":1}\n{"b":2}');
});

