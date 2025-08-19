(function () {
	const KEY = "keywords";

	const keywordInput = document.getElementById("keywordInput");
	const addKeywordBtn = document.getElementById("addKeywordBtn");
	const keywordContainer = document.getElementById("keywords");
	const searchBtn = document.getElementById("searchBtn");
	const resultsEl = document.getElementById("results");
	const updatedAtEl = document.getElementById("updatedAt");

	function loadKeywords() {
		try {
			const raw = localStorage.getItem(KEY);
			const arr = raw ? JSON.parse(raw) : [];
			return Array.isArray(arr) ? arr : [];
		} catch {
			return [];
		}
	}

	function saveKeywords(keywords) {
		localStorage.setItem(KEY, JSON.stringify(keywords));
	}

	function renderKeywords() {
		const keywords = loadKeywords();
		keywordContainer.innerHTML = "";
		keywords.forEach((kw) => {
			const chip = document.createElement("div");
			chip.className = "chip";
			chip.textContent = kw;

			const removeBtn = document.createElement("button");
			removeBtn.className = "remove";
			removeBtn.textContent = "×";
			removeBtn.title = "삭제";
			removeBtn.addEventListener("click", () => {
				const next = loadKeywords().filter((k) => k !== kw);
				saveKeywords(next);
				renderKeywords();
			});

			chip.appendChild(removeBtn);
			keywordContainer.appendChild(chip);
		});
	}

	function addKeyword() {
		const value = (keywordInput.value || "").trim();
		if (!value) return;
		const list = loadKeywords();
		if (!list.includes(value)) {
			list.push(value);
			saveKeywords(list);
			renderKeywords();
		}
		keywordInput.value = "";
		keywordInput.focus();
	}

	async function search() {
		const keywords = loadKeywords();
		if (!keywords.length) {
			resultsEl.innerHTML = '<p class="empty">추가된 키워드가 없습니다.</p>';
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ keywords })
			});
			const data = await res.json();
			renderResults(data.results || {});
			updatedAtEl.textContent = data.updatedAt ? `최근 업데이트: ${formatKST(data.updatedAt)}` : "";
		} catch (e) {
			resultsEl.innerHTML = '<p class="error">가져오는 중 오류가 발생했습니다.</p>';
		} finally {
			setLoading(false);
		}
	}

	function renderResults(results) {
		const keywords = Object.keys(results);
		if (!keywords.length) {
			resultsEl.innerHTML = '<p class="empty">결과가 없습니다.</p>';
			return;
		}
		const container = document.createElement("div");
		container.className = "result-groups";

		keywords.forEach((kw) => {
			const group = document.createElement("section");
			group.className = "group";
			const header = document.createElement("h2");
			header.textContent = kw;
			group.appendChild(header);

			const list = document.createElement("ul");
			(results[kw] || []).forEach((item) => {
				const li = document.createElement("li");
				const a = document.createElement("a");
				a.href = item.link;
				a.textContent = item.title;
				a.target = "_blank";
				a.rel = "noopener noreferrer";

				const meta = document.createElement("span");
				meta.className = "meta";
				const source = item.source ? ` • ${item.source}` : "";
				const published = item.published ? ` • ${item.published}` : "";
				meta.textContent = `${source}${published}`;

				li.appendChild(a);
				li.appendChild(meta);
				list.appendChild(li);
			});

			group.appendChild(list);
			container.appendChild(group);
		});

		resultsEl.innerHTML = "";
		resultsEl.appendChild(container);
	}

	function setLoading(isLoading) {
		searchBtn.disabled = isLoading;
		searchBtn.textContent = isLoading ? "검색 중..." : "검색";
	}

	function formatKST(iso) {
		try {
			const d = new Date(iso);
			return new Intl.DateTimeFormat("ko-KR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone: "Asia/Seoul"
			}).format(d);
		} catch {
			return iso;
		}
	}

	addKeywordBtn.addEventListener("click", addKeyword);
	keywordInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			addKeyword();
		}
	});
	searchBtn.addEventListener("click", search);

	renderKeywords();
})();