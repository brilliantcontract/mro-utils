// parseQueries, parseTabText and validateRecords are loaded globally

QUnit.module('parseQueries');

QUnit.test('splits and trims lines', assert => {
  const input = 'foo\nbar\n\nbaz ';
  const expected = ['foo', 'bar', 'baz'];
  assert.deepEqual(parseQueries(input), expected);
});

QUnit.module('parseTabText');
QUnit.test('parses tab separated lines', assert => {
  const text = 'ID\tGOOGLE_PLACE_ID\tNAME\n1\ta\tfoo';
  const result = parseTabText(text);
  assert.equal(result.length, 1);
  assert.equal(result[0].NAME, 'foo');
});

QUnit.module('validateRecords');
QUnit.test('marks matching name as valid', assert => {
  const recs = [
    {ID:'1', GOOGLE_PLACE_ID:'a', NAME:'Foo', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'},
    {ID:'2', GOOGLE_PLACE_ID:'b', NAME:'Bar', ADDRESS:'', CITY:'X', STATE:'S', ZIP:'', IS_VALID_MANUAL:'', IS_VALID:'', SEARCH_QUERY:'q', JSON_DATA_FROM_GOOGLE_MAP:'{"places":[{"title":"Foo","address":"addr"}]}'}
  ];
  validateRecords(recs);
  assert.equal(recs[0].IS_VALID, '1');
  assert.equal(recs[1].IS_VALID, '0');
});

