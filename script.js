class KeywordNewsSearcher {
    constructor() {
        this.keywords = this.loadKeywords();
        this.initializeElements();
        this.bindEvents();
        this.renderKeywords();
    }

    initializeElements() {
        this.keywordInput = document.getElementById('keywordInput');
        this.addKeywordBtn = document.getElementById('addKeywordBtn');
        this.keywordsList = document.getElementById('keywordsList');
        this.emptyState = document.getElementById('emptyState');
        this.searchAllBtn = document.getElementById('searchAllBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.resultsContainer = document.getElementById('resultsContainer');
    }

    bindEvents() {
        this.addKeywordBtn.addEventListener('click', () => this.addKeyword());
        this.keywordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addKeyword();
            }
        });
        this.searchAllBtn.addEventListener('click', () => this.searchAllKeywords());
    }

    loadKeywords() {
        const saved = localStorage.getItem('newsKeywords');
        return saved ? JSON.parse(saved) : [];
    }

    saveKeywords() {
        localStorage.setItem('newsKeywords', JSON.stringify(this.keywords));
    }

    addKeyword() {
        const keyword = this.keywordInput.value.trim();
        
        if (!keyword) {
            this.showError('키워드를 입력해주세요.');
            return;
        }

        if (keyword.length > 50) {
            this.showError('키워드는 50자 이내로 입력해주세요.');
            return;
        }

        if (this.keywords.includes(keyword)) {
            this.showError('이미 추가된 키워드입니다.');
            return;
        }

        this.keywords.push(keyword);
        this.saveKeywords();
        this.renderKeywords();
        this.keywordInput.value = '';
        
        // 성공 피드백
        this.keywordInput.style.borderColor = '#27ae60';
        setTimeout(() => {
            this.keywordInput.style.borderColor = '#e0e0e0';
        }, 1000);
    }

    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k !== keyword);
        this.saveKeywords();
        this.renderKeywords();
    }

    renderKeywords() {
        if (this.keywords.length === 0) {
            this.keywordsList.style.display = 'none';
            this.emptyState.style.display = 'block';
            this.searchAllBtn.disabled = true;
            return;
        }

        this.keywordsList.style.display = 'flex';
        this.emptyState.style.display = 'none';
        this.searchAllBtn.disabled = false;

        this.keywordsList.innerHTML = this.keywords.map(keyword => `
            <div class="keyword-tag">
                <span>${this.escapeHtml(keyword)}</span>
                <button class="remove-btn" onclick="newsSearcher.removeKeyword('${this.escapeHtml(keyword)}')" title="키워드 삭제">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    async searchAllKeywords() {
        if (this.keywords.length === 0) {
            this.showError('검색할 키워드가 없습니다. 먼저 키워드를 추가해주세요.');
            return;
        }

        this.showLoading(true);
        this.resultsContainer.innerHTML = '';

        try {
            const searchPromises = this.keywords.map(keyword => this.searchKeyword(keyword));
            const results = await Promise.all(searchPromises);

            this.showLoading(false);
            this.displayResults(results);
        } catch (error) {
            this.showLoading(false);
            this.showError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error('Search error:', error);
        }
    }

    async searchKeyword(keyword) {
        try {
            // 실제 웹 검색을 시뮬레이션하는 함수
            // 실제 환경에서는 뉴스 API나 검색 API를 사용해야 합니다
            const mockResults = this.generateMockResults(keyword);
            
            // 실제 검색 지연을 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
            
            return {
                keyword: keyword,
                results: mockResults,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error searching for ${keyword}:`, error);
            return {
                keyword: keyword,
                results: [],
                error: true,
                timestamp: new Date().toISOString()
            };
        }
    }

    generateMockResults(keyword) {
        // 실제 환경에서는 이 부분을 실제 뉴스 API 호출로 대체해야 합니다
        const mockSources = ['연합뉴스', '조선일보', '중앙일보', '한겨레', '경향신문', 'SBS', 'MBC', 'KBS'];
        const mockDomains = ['yna.co.kr', 'chosun.com', 'joins.com', 'hani.co.kr', 'khan.co.kr', 'sbs.co.kr', 'mbc.co.kr', 'kbs.co.kr'];
        
        const results = [];
        const numResults = Math.floor(Math.random() * 8) + 3; // 3-10개 결과
        
        for (let i = 0; i < numResults; i++) {
            const sourceIndex = Math.floor(Math.random() * mockSources.length);
            const hoursAgo = Math.floor(Math.random() * 24) + 1;
            const date = new Date();
            date.setHours(date.getHours() - hoursAgo);
            
            results.push({
                title: `${keyword} 관련 최신 뉴스 ${i + 1} - ${this.generateMockTitle(keyword)}`,
                snippet: `${keyword}에 대한 최신 소식입니다. 이 기사는 ${keyword}의 최근 동향과 관련된 중요한 정보를 담고 있습니다. 자세한 내용은 링크를 통해 확인하실 수 있습니다.`,
                url: `https://${mockDomains[sourceIndex]}/news/${Date.now() + i}`,
                source: mockSources[sourceIndex],
                publishedAt: date.toISOString(),
                displayDate: this.formatRelativeTime(date)
            });
        }
        
        return results;
    }

    generateMockTitle(keyword) {
        const templates = [
            `새로운 동향 발표`,
            `업계 전망 밝아져`,
            `전문가 분석 결과`,
            `정책 변화 예고`,
            `시장 반응 주목`,
            `혁신 기술 도입`,
            `글로벌 트렌드 반영`,
            `미래 전망 긍정적`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    displayResults(results) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        this.resultsContainer.innerHTML = results.map(result => {
            if (result.error) {
                return `
                    <div class="keyword-results">
                        <h3><i class="fas fa-exclamation-triangle"></i> ${this.escapeHtml(result.keyword)}</h3>
                        <div class="error-message">이 키워드에 대한 검색 중 오류가 발생했습니다.</div>
                    </div>
                `;
            }

            if (result.results.length === 0) {
                return `
                    <div class="keyword-results">
                        <h3><i class="fas fa-search"></i> ${this.escapeHtml(result.keyword)}</h3>
                        <div class="no-results">검색 결과가 없습니다.</div>
                    </div>
                `;
            }

            return `
                <div class="keyword-results">
                    <h3>
                        <i class="fas fa-newspaper"></i> 
                        ${this.escapeHtml(result.keyword)} 
                        <span style="font-size: 0.8em; color: #7f8c8d; font-weight: 400;">
                            (${result.results.length}개 결과)
                            ${result.isRealData ? '<i class="fas fa-wifi" title="실제 뉴스 API 데이터" style="color: #27ae60; margin-left: 8px;"></i>' : '<i class="fas fa-flask" title="시연용 모의 데이터" style="color: #f39c12; margin-left: 8px;"></i>'}
                        </span>
                    </h3>
                    <div class="news-list">
                        ${result.results.map(news => `
                            <div class="news-item">
                                <div class="news-content">
                                    <div class="news-title">
                                        ${news.url ? 
                                            `<a href="${news.url}" target="_blank" rel="noopener noreferrer" onclick="return confirmNavigation('${this.escapeHtml(news.title)}')">
                                                ${this.escapeHtml(news.title)}
                                            </a>` :
                                            `<span>${this.escapeHtml(news.title)}</span>`
                                        }
                                    </div>
                                    <div class="news-snippet">
                                        ${this.escapeHtml(news.snippet)}
                                    </div>
                                    <div class="news-meta">
                                        <span class="news-source">
                                            <i class="fas fa-globe"></i>
                                            ${this.escapeHtml(news.source)}
                                        </span>
                                        <span class="news-date">
                                            <i class="fas fa-clock"></i>
                                            ${news.displayDate}
                                        </span>
                                        <div class="news-links">
                                            ${news.url ? 
                                                `<a href="${news.url}" target="_blank" rel="noopener noreferrer" class="external-link" onclick="return confirmNavigation('${this.escapeHtml(news.title)}')">
                                                    <i class="fas fa-external-link-alt"></i> 원본 기사
                                                </a>` : ''
                                            }
                                            <a href="${newsSearcher.createAlternativeSearchUrl(news.keyword || result.keyword, news.title)}" target="_blank" rel="noopener noreferrer" class="external-link search-link">
                                                <i class="fas fa-search"></i> 구글에서 검색
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
        this.searchAllBtn.disabled = show;
        
        if (show) {
            this.searchAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 검색 중...';
        } else {
            this.searchAllBtn.innerHTML = '<i class="fas fa-search"></i> 모든 키워드 검색';
        }
    }

    showError(message) {
        // 기존 에러 메시지 제거
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 새 에러 메시지 생성
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // 키워드 섹션 다음에 삽입
        const keywordSection = document.querySelector('.keyword-section');
        keywordSection.insertAdjacentElement('afterend', errorDiv);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return '방금 전';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}분 전`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}시간 전`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days}일 전`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 실제 뉴스 API 연동을 위한 확장 클래스 (옵션)
class RealNewsSearcher extends KeywordNewsSearcher {
    constructor(apiKey = null) {
        super();
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://newsapi.org/v2/everything'; // 예시 API
    }

    async searchKeyword(keyword) {
        if (!this.apiKey) {
            // API 키가 없으면 모의 결과 반환
            return super.searchKeyword(keyword);
        }

        try {
            // CORS 문제를 해결하기 위해 여러 방법을 시도
            let data;
            
            // 방법 1: 직접 호출 시도
            try {
                const params = new URLSearchParams({
                    q: `${keyword} 한국`,
                    language: 'ko',
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: this.apiKey
                });

                const response = await fetch(`${this.apiEndpoint}?${params}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                data = await response.json();
            } catch (corsError) {
                console.log('CORS 오류로 인해 프록시 서버 사용을 시도합니다...');
                
                // 방법 2: CORS 프록시 사용
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const params = new URLSearchParams({
                    q: `${keyword} 한국`,
                    language: 'ko',
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: this.apiKey
                });
                
                const targetUrl = encodeURIComponent(`${this.apiEndpoint}?${params}`);
                const response = await fetch(`${proxyUrl}${targetUrl}`);
                
                if (!response.ok) {
                    throw new Error(`Proxy Error: ${response.status}`);
                }
                
                const proxyData = await response.json();
                data = JSON.parse(proxyData.contents);
            }
            
            // 결과가 없거나 오류가 있으면 모의 데이터로 fallback
            if (!data || !data.articles || data.articles.length === 0) {
                console.log(`${keyword}에 대한 실제 뉴스가 없어 모의 데이터를 사용합니다.`);
                return super.searchKeyword(keyword);
            }
            
            return {
                keyword: keyword,
                results: data.articles.filter(article => article.title && article.url).map(article => ({
                    title: article.title,
                    snippet: article.description || article.content || `${keyword}에 대한 최신 뉴스입니다.`,
                    url: this.validateAndFixUrl(article.url),
                    originalUrl: article.url,
                    source: article.source?.name || '뉴스 소스',
                    publishedAt: article.publishedAt,
                    displayDate: this.formatRelativeTime(new Date(article.publishedAt)),
                    keyword: keyword // 검색 키워드도 저장
                })),
                timestamp: new Date().toISOString(),
                isRealData: true
            };
        } catch (error) {
            console.error(`Error searching for ${keyword}:`, error);
            console.log('API 오류로 인해 모의 데이터를 사용합니다.');
            // API 오류 시 모의 결과로 fallback
            return super.searchKeyword(keyword);
        }
    }

    validateAndFixUrl(url) {
        if (!url) return null;
        
        // URL이 이미 완전한 형태인지 확인
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // 상대 URL인 경우 https 추가
        if (url.startsWith('//')) {
            return 'https:' + url;
        }
        
        // 프로토콜이 없는 경우 https 추가
        if (!url.startsWith('http')) {
            return 'https://' + url;
        }
        
        return url;
    }

    createAlternativeSearchUrl(keyword, title) {
        // 구글 뉴스 검색 URL 생성
        const searchQuery = encodeURIComponent(`${keyword} ${title}`);
        return `https://news.google.com/search?q=${searchQuery}&hl=ko&gl=KR&ceid=KR:ko`;
    }
}

// 애플리케이션 초기화
let newsSearcher;

document.addEventListener('DOMContentLoaded', () => {
    // 실제 뉴스 API 사용
    const API_KEY = 'c6d6b2fa57084901835004fe27269445';
    newsSearcher = new RealNewsSearcher(API_KEY);
    
    // 웰컴 메시지 표시 (선택사항)
    console.log('🗞️ 키워드 뉴스 검색기가 시작되었습니다!');
    console.log('📡 실제 NewsAPI를 사용하여 최신 뉴스를 가져옵니다.');
    console.log('🔍 키워드를 추가하고 검색 버튼을 눌러보세요!');
});

// 페이지 언로드 시 키워드 자동 저장
window.addEventListener('beforeunload', () => {
    if (newsSearcher && newsSearcher.keywords) {
        newsSearcher.saveKeywords();
    }
});

// 링크 클릭 시 확인 함수
function confirmNavigation(title) {
    // 개발 환경에서는 확인 없이 바로 이동
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return true;
    }
    
    // 실제 환경에서는 확인 대화상자 표시
    return confirm(`"${title}" 기사를 새 탭에서 열까요?\n\n링크가 작동하지 않을 수 있습니다. 그런 경우 "구글에서 검색" 링크를 사용해보세요.`);
}