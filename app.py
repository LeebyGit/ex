from datetime import datetime
import urllib.parse
from typing import Dict, List, Any

from flask import Flask, jsonify, request, send_from_directory
import feedparser


app = Flask(__name__, static_folder="static", static_url_path="/static")


@app.get("/")
def serve_index():
	return send_from_directory("static", "index.html")


@app.post("/search")
def search_news():
	request_json = request.get_json(silent=True) or {}
	keywords: List[str] = request_json.get("keywords", [])

	if not isinstance(keywords, list):
		return jsonify({"error": "keywords must be a list of strings"}), 400

	# Normalize and de-duplicate keywords while preserving order
	seen = set()
	normalized_keywords: List[str] = []
	for kw in keywords:
		if not isinstance(kw, str):
			continue
		trimmed = kw.strip()
		if trimmed and trimmed not in seen:
			seen.add(trimmed)
			normalized_keywords.append(trimmed)

	results: Dict[str, List[Dict[str, Any]]] = {}

	for keyword in normalized_keywords:
		rss_url = (
			"https://news.google.com/rss/search?q="
			+ urllib.parse.quote(keyword)
			+ "&hl=ko&gl=KR&ceid=KR:ko"
		)
		try:
			parsed = feedparser.parse(rss_url)
		except Exception:
			parsed = {"entries": []}

		keyword_results: List[Dict[str, Any]] = []
		for entry in parsed.get("entries", [])[:10]:
			title = entry.get("title") or "(제목 없음)"
			link = (entry.get("link") or "").replace("\u003c", "<").replace("\u003e", ">")
			source = None
			if "source" in entry and isinstance(entry["source"], dict):
				source = entry["source"].get("title")
			published = entry.get("published") or entry.get("updated")

			# Format published time if possible
			if published and hasattr(entry, "published_parsed") and entry.published_parsed:
				try:
					dt = datetime(*entry.published_parsed[:6])
					published = dt.strftime("%Y-%m-%d %H:%M")
				except Exception:
					pass

			keyword_results.append(
				{
					"title": title,
					"link": link,
					"source": source,
					"published": published,
				}
			)

		results[keyword] = keyword_results

	return jsonify({"results": results, "updatedAt": datetime.now().isoformat(timespec="seconds")})


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=True)