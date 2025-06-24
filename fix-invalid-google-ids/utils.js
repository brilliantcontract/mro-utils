export function parseTabText(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const hasHeader = header[0] === 'ID';
  const start = hasHeader ? 1 : 0;
  const cols = ['ID','GOOGLE_PLACE_ID','NAME','ADDRESS','CITY','STATE','ZIP','IS_VALID_MANUAL','IS_VALID','SEARCH_QUERY','JSON_DATA_FROM_GOOGLE_MAP'];
  const records = [];
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    const obj = {};
    cols.forEach((c, idx) => {
      obj[c] = parts[idx] || '';
    });
    records.push(obj);
  }
  return records;
}

export function validateRecords(records) {
  const groups = new Map();
  for (const rec of records) {
    if (!groups.has(rec.SEARCH_QUERY)) groups.set(rec.SEARCH_QUERY, []);
    groups.get(rec.SEARCH_QUERY).push(rec);
  }

  for (const group of groups.values()) {
    const uniqueCities = new Set(group.map(r => r.CITY));
    if (uniqueCities.size > 1) {
      group.forEach(r => r.IS_VALID = '2');
      continue;
    }

    const parsed = group.map(r => ({
      rec: r,
      json: JSON.parse(r.JSON_DATA_FROM_GOOGLE_MAP)
    }));
    const titleMatches = parsed.filter(p => {
      const place = p.json.places && p.json.places[0];
      return place && place.title === p.rec.NAME;
    });

    if (titleMatches.length === 1) {
      group.forEach(r => r.IS_VALID = r === titleMatches[0].rec ? '1' : '0');
      continue;
    }

    if (titleMatches.length > 1) {
      const addressMatches = titleMatches.filter(p => {
        const place = p.json.places && p.json.places[0];
        if (!place || !p.rec.ADDRESS) return false;
        return place.address.startsWith(p.rec.ADDRESS);
      });
      if (addressMatches.length >= 1) {
        const chosen = addressMatches[0].rec;
        group.forEach(r => r.IS_VALID = r === chosen ? '1' : '0');
        continue;
      }
    }

    group.forEach(r => { if (!r.IS_VALID) r.IS_VALID = '0'; });
  }
  return records;
}
