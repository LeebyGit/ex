# 키워드 뉴스 검색기

미리 저장한 키워드를 기반으로 최신 뉴스를 검색하고 링크로 제공하는 웹 애플리케이션입니다.

## 🌟 주요 기능

- ✅ **키워드 관리**: 관심 키워드를 추가/삭제하여 관리
- ✅ **로컬 저장**: 브라우저 로컬 스토리지를 활용한 키워드 영구 저장
- ✅ **원클릭 검색**: 저장된 모든 키워드에 대한 최신 뉴스를 한 번에 검색
- ✅ **링크 제공**: 각 뉴스 기사의 원본 링크 제공
- ✅ **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화된 UI
- ✅ **실시간 업데이트**: 검색 버튼을 누를 때마다 최신 소식 업데이트

## 🚀 사용 방법

1. **키워드 추가**
   - 상단 입력창에 관심 있는 키워드를 입력
   - "키워드 추가" 버튼 클릭 또는 Enter 키 입력
   - 추가된 키워드는 자동으로 저장됩니다

2. **키워드 관리**
   - 추가된 키워드는 태그 형태로 표시
   - 각 키워드 태그의 X 버튼을 클릭하여 삭제 가능

3. **뉴스 검색**
   - "모든 키워드 검색" 버튼을 클릭
   - 저장된 모든 키워드에 대한 최신 뉴스를 동시에 검색
   - 결과는 키워드별로 구분되어 표시

4. **뉴스 읽기**
   - 각 뉴스 항목의 제목이나 "기사 읽기" 링크를 클릭
   - 새 탭에서 원본 기사 페이지가 열립니다

## 📁 파일 구조

```
/
├── index.html      # 메인 HTML 파일
├── styles.css      # CSS 스타일시트
├── script.js       # JavaScript 로직
└── README.md       # 프로젝트 설명서
```

## 🔧 설치 및 실행

1. 모든 파일을 웹 서버에 업로드하거나 로컬에서 실행
2. 웹 브라우저에서 `index.html` 파일을 열기
3. 즉시 사용 가능!

### 로컬 개발 서버 실행 (선택사항)

```bash
# Python 3가 설치된 경우
python -m http.server 8000

# Node.js가 설치된 경우
npx serve .

# 브라우저에서 http://localhost:8000 접속
```

## 🔌 실제 뉴스 API 연동

현재는 시연용 모의 데이터를 사용하고 있습니다. 실제 뉴스 API를 연동하려면:

### 1. NewsAPI 사용 (권장)

1. [NewsAPI](https://newsapi.org/)에서 무료 API 키 발급
2. `script.js` 파일에서 다음 부분을 수정:

```javascript
// 현재 코드 (74-76번째 줄 근처)
// const API_KEY = 'your-news-api-key-here';
// newsSearcher = new RealNewsSearcher(API_KEY);

// 수정할 코드
const API_KEY = '여기에-발급받은-API-키-입력';
newsSearcher = new RealNewsSearcher(API_KEY);
```

### 2. 기타 뉴스 API

다른 뉴스 API를 사용하려면 `RealNewsSearcher` 클래스의 `searchKeyword` 메서드를 해당 API에 맞게 수정하세요.

### 3. CORS 이슈 해결

브라우저에서 직접 API를 호출할 때 CORS 문제가 발생할 수 있습니다. 이 경우:

- 백엔드 프록시 서버 구축
- CORS 우회 서비스 사용 (개발용만)
- 브라우저 확장 프로그램 사용 (개발용만)

## 🎨 커스터마이징

### 색상 테마 변경

`styles.css` 파일에서 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #9b59b6;
  --success-color: #27ae60;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 검색 결과 개수 조정

`script.js`의 `generateMockResults` 함수에서 결과 개수를 조정:

```javascript
const numResults = Math.floor(Math.random() * 8) + 3; // 3-10개 결과
```

## 🔒 개인정보 보호

- 모든 키워드는 브라우저의 로컬 스토리지에만 저장됩니다
- 외부 서버로 개인 데이터가 전송되지 않습니다
- 뉴스 검색 시에만 해당 키워드가 API에 전송됩니다

## 🌐 브라우저 호환성

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자유롭게 사용, 수정, 배포할 수 있습니다.

## 🤝 기여하기

버그 리포트, 기능 제안, 코드 기여를 환영합니다!

---

**즐거운 뉴스 검색 되세요! 📰✨**