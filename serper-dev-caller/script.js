import { parseQueries, createCachedFetcher } from './utils.js';

const API_KEY = '0c833bbdac7eb41ed54b9b786e375ab15492c440';
let stopRequested = false;
let isRunning = false;
let queries = [];
let currentIndex = 0;
const fetchQueryCached = createCachedFetcher(fetchQuery);

function updateStatus() {
  const statusLabel = document.getElementById('statusLabel');
  statusLabel.textContent = `${currentIndex} / ${queries.length}`;
  const progressBar = document.getElementById('progressBar');
  progressBar.max = queries.length;
  progressBar.value = currentIndex;
}

export async function fetchQuery(query) {
  const myHeaders = new Headers();
  myHeaders.append('X-API-KEY', API_KEY);
  myHeaders.append('Content-Type', 'application/json');
  const raw = JSON.stringify({ q: query });
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  const response = await fetch('https://google.serper.dev/maps', requestOptions);
  return response.json();
}

async function processNext() {
  if (!isRunning || stopRequested || currentIndex >= queries.length) {
    isRunning = false;
    document.getElementById('toggleButton').textContent = 'Start';
    return;
  }
  const query = queries[currentIndex];
  try {
    const result = await fetchQueryCached(query);
    const output = document.getElementById('output');
    output.textContent += JSON.stringify(result).replace(/\n/g, '') + '\n';
  } catch (err) {
    const output = document.getElementById('output');
    output.textContent += `Error for ${query}: ${err}\n`;
  }
  currentIndex++;
  updateStatus();
  setTimeout(processNext, 0);
}

export function toggleStartStop() {
  if (isRunning) {
    stopRequested = true;
    return;
  }
  const text = document.getElementById('queries').value;
  queries = parseQueries(text);
  currentIndex = 0;
  stopRequested = false;
  isRunning = true;
  document.getElementById('toggleButton').textContent = 'Stop';
  document.getElementById('output').textContent = '';
  updateStatus();
  processNext();
}

window.toggleStartStop = toggleStartStop;
