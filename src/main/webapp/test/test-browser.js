// parseQueries, parseTabText and validateRecords are loaded globally

QUnit.module('parseQueries');

QUnit.test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});

QUnit.module('parseTabText');
QUnit.test('parses tab separated lines', assert => {
  const text = 'ID\tGOOGLE_PLACE_ID\tCID\tNAME\n1\ta\tcid1\tfoo';
  const result = parseTabText(text);
  assert.equal(result.length, 1);
  assert.equal(result[0].CID, 'cid1');
  assert.equal(result[0].NAME, 'foo');
  assert.equal(typeof result[0].IS_VALID, 'function', 'IS_VALID is observable');
});

QUnit.module('validateRecords');
QUnit.test('marks matching name as valid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '1');
  assert.equal(recs[1].IS_VALID(), '0');
});

QUnit.test('clears values when all are invalid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', CID:'c1', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', CID:'c2', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID: ko.observable(''), SEARCH_QUERY:'w', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID(), '');
  assert.equal(recs[1].IS_VALID(), '');
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

