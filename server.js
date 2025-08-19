import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import RSSParser from 'rss-parser';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const rssParser = new RSSParser();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory keyword store with file persistence
let presetKeywords = new Set();
const dataDir = path.join(__dirname, 'data');
const keywordsFile = path.join(dataDir, 'keywords.json');

async function loadKeywordsFromDisk() {
  try {
    const raw = await fs.readFile(keywordsFile, 'utf-8');
    const json = JSON.parse(raw);
    const arr = Array.isArray(json.keywords) ? json.keywords : [];
    presetKeywords = new Set(arr.filter((k) => typeof k === 'string' && k.trim()));
  } catch (err) {
    // First run or unreadable file: start with empty set
    presetKeywords = new Set();
  }
}

async function saveKeywordsToDisk() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const data = { keywords: Array.from(presetKeywords) };
    await fs.writeFile(keywordsFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist keywords:', err);
  }
}

app.get('/api/keywords', (req, res) => {
  res.json({ keywords: Array.from(presetKeywords) });
});

app.post('/api/keywords', async (req, res) => {
  const { keywords } = req.body || {};
  if (!Array.isArray(keywords)) {
    return res.status(400).json({ error: 'keywords must be an array of strings' });
  }
  for (const k of keywords) {
    if (typeof k === 'string' && k.trim()) {
      presetKeywords.add(k.trim());
    }
  }
  // Also remove any that were omitted in the new list
  for (const existing of Array.from(presetKeywords)) {
    if (!keywords.includes(existing)) {
      presetKeywords.delete(existing);
    }
  }
  await saveKeywordsToDisk();
  res.json({ keywords: Array.from(presetKeywords) });
});

// Fetch latest news for all preset keywords from Google News RSS
app.get('/api/search', async (req, res) => {
  try {
    const results = {};
    const errors = {};
    const keywords = Array.from(presetKeywords);
    const timeoutMs = Number(process.env.SEARCH_TIMEOUT_MS || 5000);
    await Promise.all(
      keywords.map(async (kw) => {
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(kw)}&hl=ko&gl=KR&ceid=KR:ko`;
        try {
          const xml = await fetchWithTimeout(feedUrl, { timeoutMs });
          const feed = await rssParser.parseString(xml);
          results[kw] = (feed.items || []).slice(0, 10).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.creator || item.author || ''
          }));
        } catch (err) {
          errors[kw] = String(err && err.message ? err.message : err);
          results[kw] = [];
        }
      })
    );
    res.json({ updatedAt: new Date().toISOString(), results, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

async function fetchWithTimeout(url, { timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (NewsTracker)'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    return text;
  } finally {
    clearTimeout(id);
  }
}

// Boot
(async () => {
  await loadKeywordsFromDisk();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();

