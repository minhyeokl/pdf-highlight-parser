# PDF 하이라이트 추출기

PDF 문서에서 하이라이트된 텍스트와 메모를 추출하여 Excel 파일로 저장하는 웹 애플리케이션입니다.

## 주요 기능

- PDF 파일에서 하이라이트된 텍스트 추출
- PDF 메모(주석) 내용 우선 추출 (메모가 있는 경우)
- 여러 줄에 걸친 하이라이트 자동으로 한 줄로 합치기
- 동일한 하이라이트 텍스트 그룹화
- 페이지 번호 정렬 및 정리
- Excel 파일로 결과 저장
- CSV 형식으로 내보내기 (구글 시트 가져오기용)

## 사용 방법

1. PDF 파일을 선택합니다.
2. "하이라이트 추출하기" 버튼을 클릭합니다.
3. 추출된 하이라이트가 Excel 파일로 저장됩니다.
4. 필요시 CSV 파일로도 다운로드 할 수 있습니다.

## Excel 결과 형식

- A열: 하이라이트된 텍스트
- B열부터: 각 텍스트가 등장하는 페이지 번호가 순서대로 정렬
- 결과는 첫 페이지 번호 순으로 정렬됩니다.
- 여러 줄에 걸친 하이라이트는 자동으로 한 줄로 합쳐집니다.
- PDF에 메모가 있는 경우, 하이라이트된 텍스트보다 메모 내용을 우선적으로 추출합니다.

## 기술 스택

- Next.js
- TypeScript
- PDF.js
- extracthighlights-dist
- XLSX.js
- Tailwind CSS

## 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/minhyeokl/pdf-highlight-parser.git
cd pdf-highlight-parser

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 라이선스

MIT
