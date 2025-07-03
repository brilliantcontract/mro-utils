function parseTabText(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const hasHeader = header[0] === 'ID';
  const start = hasHeader ? 1 : 0;

  const colsOld = ['ID','GOOGLE_PLACE_ID','NAME','ADDRESS','CITY','STATE','ZIP','IS_VALID_MANUAL','IS_VALID','SEARCH_QUERY','JSON_DATA_FROM_GOOGLE_MAP'];
  // New format does not contain manual validation fields
  const colsNew = ['ID','GOOGLE_PLACE_ID','CID','NAME','ADDRESS','CITY','STATE','ZIP','SEARCH_QUERY','JSON_DATA_FROM_GOOGLE_MAP'];

  let useNew = false;
  if (hasHeader) {
    useNew = header.includes('CID');
  } else {
    const parts = lines[0].split('\t');
    useNew = parts.length === colsNew.length;
  }

  const cols = useNew ? colsNew : colsOld;
  const records = [];
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    const obj = {};
    cols.forEach((c, idx) => {
      const val = parts[idx] || '';
      if (c === 'IS_VALID') {
        if (typeof ko !== 'undefined' && typeof ko.observable === 'function') {
          obj[c] = ko.observable(val);
        } else {
          obj[c] = val;
        }
      } else {
        obj[c] = val;
      }
    });

    if (useNew) {
      if (typeof ko !== 'undefined' && typeof ko.observable === 'function') {
        obj.IS_VALID = ko.observable('');
      } else {
        obj.IS_VALID = '';
      }
    }
    records.push(obj);
  }
  return records;
}

function normalizeString(str) {
  return (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/gi, '');
}

function validateRecords(records) {
  const groups = new Map();
  for (const rec of records) {
    if (!groups.has(rec.SEARCH_QUERY)) groups.set(rec.SEARCH_QUERY, []);
    groups.get(rec.SEARCH_QUERY).push(rec);
  }

  for (const group of groups.values()) {
    const uniqueCities = new Set(group.map(r => r.CITY));
    if (uniqueCities.size > 1) {
      group.forEach(r => setIsValid(r, '2'));
      continue;
    }

    const parsed = group.map(r => ({
      rec: r,
      json: JSON.parse(r.JSON_DATA_FROM_GOOGLE_MAP)
    }));
    const titleMatches = parsed.filter(p => {
      const place = p.json.places && p.json.places[0];
      return place && normalizeString(place.title) === normalizeString(p.rec.NAME);
    });

    if (titleMatches.length === 1) {
      group.forEach(r => setIsValid(r, r === titleMatches[0].rec ? '1' : '0'));
      continue;
    }

    if (titleMatches.length > 1) {
      const addressMatches = titleMatches.filter(p => {
        const place = p.json.places && p.json.places[0];
        if (!place || !p.rec.ADDRESS) return false;
        return normalizeString(place.address).startsWith(normalizeString(p.rec.ADDRESS));
      });
      if (addressMatches.length >= 1) {
        const chosen = addressMatches[0].rec;
        group.forEach(r => setIsValid(r, r === chosen ? '1' : '0'));
        continue;
      }
    }

    group.forEach(r => {
      if (!getIsValid(r)) setIsValid(r, '0');
    });

    const allZero = group.every(r => getIsValid(r) === '0');
    if (allZero) {
      group.forEach(r => setIsValid(r, ''));
    }
  }
  return records;
}

function validateRecordsByCid(records) {
  const groups = new Map();
  for (const rec of records) {
    if (!groups.has(rec.GOOGLE_PLACE_ID)) groups.set(rec.GOOGLE_PLACE_ID, []);
    groups.get(rec.GOOGLE_PLACE_ID).push(rec);
  }

  for (const group of groups.values()) {
    const cids = group.map(r => r.CID);
    const unique = new Set(cids);

    if (unique.size === 1) {
      group.forEach(r => setIsValid(r, ''));
      continue;
    }

    const hasCid = cids.some(c => c);
    if (!hasCid) {
      group.forEach(r => setIsValid(r, ''));
      continue;
    }

    let matched = null;
    for (const r of group) {
      if (!r.CID) continue;
      try {
        const json = JSON.parse(r.JSON_DATA_FROM_GOOGLE_MAP);
        const place = json.places && json.places[0];
        if (place && String(place.cid) === String(r.CID)) {
          matched = r;
          break;
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    if (matched) {
      group.forEach(r => setIsValid(r, r === matched ? '1' : '0'));
    } else {
      group.forEach(r => setIsValid(r, '0'));
      if (group.every(r => getIsValid(r) === '0')) {
        group.forEach(r => setIsValid(r, ''));
      }
    }
  }
  return records;
}

function setIsValid(rec, value) {
  if (typeof rec.IS_VALID === 'function') {
    rec.IS_VALID(value);
  } else {
    rec.IS_VALID = value;
  }
}

function getIsValid(rec) {
  return typeof rec.IS_VALID === 'function' ? rec.IS_VALID() : rec.IS_VALID;
}

function collectIsValid(records) {
  return records.map(r => getIsValid(r)).join('\n');
}

if (typeof window !== 'undefined') {
  window.parseTabText = parseTabText;
  window.validateRecords = validateRecords;
  window.validateRecordsByCid = validateRecordsByCid;
  window.collectIsValid = collectIsValid;
}
