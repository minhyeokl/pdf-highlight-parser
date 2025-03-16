'use client';

// TypeScript 타입 선언 추가
declare module 'extracthighlights-dist/build/extracthighlights';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import type * as ExtractHighlights from 'extracthighlights-dist/build/extracthighlights';

// 인터페이스 정의
interface HighlightAnnotation {
  highlightedText?: string;
  contents?: string;
  subtype?: string;
  type?: string;
  pageNumber?: number;
  quadPoints?: Array<{
    dims?: {
      minY?: number;
      maxY?: number;
    }
  }>;
}

interface HighlightItem {
  text: string;
  page: number;
}

interface GroupedHighlight {
  text: string;
  pageNumbers: number[];
}

interface ExcelRow {
  [key: string]: string | number;
}

interface ColumnWidth {
  wch: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracthighlights, setExtracthighlights] = useState<typeof ExtractHighlights | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 모듈을 동적으로 임포트하여 서버 사이드 렌더링 문제 방지
      const loadModule = async () => {
        try {
          // require.ensure를 처리하기 위한 임시 코드
          if (!(window as any).require) {
            (window as any).require = {};
          }
          if (!(window as any).require.ensure) {
            (window as any).require.ensure = (deps: unknown[], callback: () => void) => callback();
          }
          
          const extracthighlightsModule = await import('extracthighlights-dist/build/extracthighlights');
          
          // 워커 설정
          const workerUrl = '/pdf.worker.min.js';
          extracthighlightsModule.GlobalWorkerOptions.workerSrc = workerUrl;
          
          setExtracthighlights(extracthighlightsModule);
          setLoaded(true);
        } catch (error) {
          console.error('extracthighlights 모듈 로딩 오류:', error);
        }
      };
      
      loadModule();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !extracthighlights) return;

    setLoading(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      
      // PDF 처리 로직
      const annotations = await processHighlights(fileBuffer);
      
      if (annotations.length === 0) {
        alert('하이라이트된 텍스트를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 같은 텍스트별로 그룹화하고 페이지 정렬
      const groupedHighlights = groupHighlightsByText(annotations);
      
      // Create Excel file with grouped highlights
      const wb = XLSX.utils.book_new();
      
      // 가장 많은 페이지 수를 가진 항목 찾기
      const maxPageCount = Math.max(...groupedHighlights.map(item => item.pageNumbers.length));
      
      // 데이터 시트에 필요한 형식으로 변환
      const worksheetData = groupedHighlights.map(item => {
        // 기본 객체 생성 (텍스트만 포함)
        const row: ExcelRow = {
          '하이라이트 텍스트': item.text
        };
        
        // 페이지 번호를 각 열에 추가
        item.pageNumbers.forEach((pageNum, index) => {
          row[`페이지 ${index + 1}`] = pageNum;
        });
        
        return row;
      });
      
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      
      // 열 너비 설정
      const columnWidths: ColumnWidth[] = [
        { wch: 70 },  // 하이라이트 텍스트
      ];
      
      // 페이지 열 너비 설정
      for (let i = 0; i < maxPageCount; i++) {
        columnWidths.push({ wch: 10 }); // 페이지 번호 열
      }
      
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, '하이라이트');
      XLSX.writeFile(wb, 'highlights.xlsx');
      
      // 구글 시트로 바로 열기 옵션 제공
      if (confirm('하이라이트가 Excel 파일로 저장되었습니다.\n추가로 CSV 파일을 다운로드하여 구글 시트에서 열어보시겠습니까?')) {
        // CSV 파일 다운로드
        createGoogleSheetsLink(groupedHighlights);
        
        // 구글 시트 열기 안내
        setTimeout(() => {
          if (confirm('CSV 파일이 다운로드되었습니다.\n구글 시트 웹사이트를 열어 가져오기 하시겠습니까?')) {
            window.open('https://docs.google.com/spreadsheets/d/create-new', '_blank');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('PDF 처리 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  // PDF 하이라이트 처리 함수
  const processHighlights = async (arrayBuffer: ArrayBuffer): Promise<HighlightItem[]> => {
    try {
      // extracthighlights가 null인 경우 체크
      if (!extracthighlights) {
        throw new Error('PDF 처리 모듈이 로드되지 않았습니다.');
      }
      
      // 1. PDF에서 주석 추출
      const loadingTask = extracthighlights.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      const highlights: HighlightItem[] = [];
      const SUPPORTED_ANNOTS = ['Text', 'Highlight', 'Underline'];
      
      // 모든 페이지의 주석 수집
      const annotationsByPage: Record<string, HighlightAnnotation[]> = {};
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        
        // 페이지 준비 (캔버스 설정)
        const scale = 1;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        // 주석 가져오기
        let annotations = await page.getAnnotations();
        
        // 하이라이트된 주석만 필터링
        annotations = annotations
          .filter((anno: HighlightAnnotation) => {
            return SUPPORTED_ANNOTS.includes(anno.subtype || anno.type || '');
          })
          .map((anno: HighlightAnnotation) => {
            if (!anno.subtype) anno.subtype = anno.type;
            anno.pageNumber = i;
            return anno;
          });
        
        // 페이지 렌더링 (주석과 함께)
        await page.render(renderContext, annotations);
        
        // 하이라이트된 텍스트가 있는 주석만 저장
        const highlightedAnnotations = annotations.filter((anno: HighlightAnnotation) => 
          anno.highlightedText && anno.highlightedText.trim() !== '');
        
        if (highlightedAnnotations.length > 0) {
          annotationsByPage[i] = highlightedAnnotations;
        }
      }
      
      // 페이지별로 하이라이트 정렬하여 결과 생성
      Object.keys(annotationsByPage).forEach(pageNumber => {
        const pageAnnotations = annotationsByPage[pageNumber];
        
        // Y 좌표를 기준으로 정렬 (위에서 아래로)
        pageAnnotations.sort((a: HighlightAnnotation, b: HighlightAnnotation) => {
          const aMinY = a.quadPoints?.[0]?.dims?.minY;
          const bMinY = b.quadPoints?.[0]?.dims?.minY;
          
          if (aMinY !== undefined && bMinY !== undefined) {
            if (aMinY < bMinY) return -1;
            if (aMinY > bMinY) return 1;
          }
          return 0;
        });
        
        // 정렬된 주석들을 결과에 추가
        pageAnnotations.forEach((anno: HighlightAnnotation) => {
          // 메모(contents)가 있는지 확인하고, 있으면 우선 사용
          let extractedText = '';
          
          // 메모(주석) 내용이 있으면 우선적으로 사용
          if (anno.contents && anno.contents.trim() !== '') {
            extractedText = anno.contents.trim();
          } 
          // 메모가 없는 경우 하이라이트된 텍스트 사용
          else if (anno.highlightedText && anno.highlightedText.trim() !== '') {
            extractedText = anno.highlightedText.trim();
          }
          
          // 줄바꿈을 공백으로 대체하고 앞뒤 공백 제거
          const cleanText = extractedText
            .replace(/\r?\n|\r/g, ' ')  // 모든 종류의 줄바꿈을 공백으로 대체
            .replace(/\s+/g, ' ')       // 연속된 공백을 하나의 공백으로 대체
            .trim();                     // 앞뒤 공백 제거
            
          if (cleanText) {
              highlights.push({
              text: cleanText,
              page: parseInt(pageNumber)
              });
            }
        });
      });
      
      return highlights;
    } catch (error) {
      console.error('PDF 하이라이트 처리 오류:', error);
      return [];
    }
  };
  
  // 하이라이트 텍스트별로 그룹화하는 함수
  const groupHighlightsByText = (annotations: HighlightItem[]): GroupedHighlight[] => {
    // 텍스트별로 그룹화
    const groupedByText: Record<string, number[]> = {};
    
    // 각 하이라이트된 텍스트에 대해
    annotations.forEach(({ text, page }) => {
      // 빈 텍스트 무시
      if (!text.trim()) return;
      
      // 이미 그룹에 있으면 페이지만 추가
      if (groupedByText[text]) {
        // 페이지가 이미 목록에 있는지 확인 (중복 제거)
        if (!groupedByText[text].includes(page)) {
          groupedByText[text].push(page);
        }
      } else {
        // 새 그룹 생성
        groupedByText[text] = [page];
      }
    });
    
    // 각 그룹의 페이지 번호 정렬
    Object.keys(groupedByText).forEach(text => {
      groupedByText[text].sort((a, b) => a - b);
    });
    
    // 최종 결과 형식으로 변환 (페이지 번호는 배열로 유지)
    const result = Object.keys(groupedByText).map(text => {
      return {
        text: text,
        pageNumbers: groupedByText[text]
      };
    });
    
    // 첫 페이지 번호가 가장 작은 순서대로 정렬
    return result.sort((a, b) => {
      const aFirstPage = a.pageNumbers[0];
      const bFirstPage = b.pageNumbers[0];
      return aFirstPage - bFirstPage;
    });
  };
  
  // 구글 시트용 CSV 데이터를 생성하고 시트에서 열 수 있는 링크를 반환하는 함수
  const createGoogleSheetsLink = (groupedHighlights: GroupedHighlight[]): string => {
    // CSV 헤더 생성
    let csvContent = "하이라이트 텍스트,페이지 번호\n";
    
    // CSV 데이터 행 추가
    groupedHighlights.forEach(item => {
      // 텍스트에 큰따옴표가 있으면 두 개로 치환 (CSV 이스케이프)
      const escapedText = item.text.replace(/"/g, '""');
      // 텍스트를 큰따옴표로 감싸고 페이지 번호는 쉼표로 구분
      csvContent += `"${escapedText}","${item.pageNumbers.join(', ')}"\n`;
    });
    
    // CSV 파일 생성 및 다운로드 링크 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 임시로 다운로드 링크를 생성하고 클릭하여 CSV 파일 다운로드
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'highlights.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Blob URL 해제
    URL.revokeObjectURL(url);
    
    // 구글 시트 가져오기 URL 반환
    return 'https://docs.google.com/spreadsheets/d/create-new';
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
      <div className="z-10 max-w-2xl w-full items-center justify-center">
        <h1 className="text-4xl font-bold mb-8 text-center">PDF 하이라이트 추출기</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold mb-2">사용 방법</h2>
            <ol className="list-decimal pl-5 space-y-1 text-gray-700">
              <li>[파일 선택] 버튼을 클릭하고 하이라이트를 추출할 PDF 파일을 선택합니다.</li>
              <li>[하이라이트 추출하기] 버튼을 클릭합니다.</li>
              <li>추출한 하이라이트를 Excel 파일로 저장합니다.</li>
            </ol>
            <div className="mt-3 text-sm text-gray-600 bg-gray-100 p-3 rounded">
              <p className="font-medium mb-1">✨ Excel 결과 형식:</p>
              <ul className="list-disc pl-5">
                <li>A열: 하이라이트된 텍스트</li>
                <li>B열부터: 각 텍스트가 등장하는 페이지 번호가 순서대로 정렬</li>
                <li>결과는 첫 페이지 번호 순으로 정렬됩니다.</li>
                <li>여러 줄에 걸친 하이라이트는 자동으로 한 줄로 합쳐집니다.</li>
                <li>PDF에 메모가 있는 경우, 하이라이트된 텍스트보다 메모 내용을 우선적으로 추출합니다.</li>
              </ul>
            </div>
          </div>
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!file || loading || !loaded}
            className={`mt-4 w-full py-3 px-4 rounded-md text-white font-semibold
              ${!file || loading || !loaded
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700'
              }`}
          >
            {!loaded 
              ? '준비 중...' 
              : loading 
                ? '처리 중...' 
                : '하이라이트 추출하기'}
          </button>
          
          {file && (
            <p className="mt-3 text-sm text-gray-600">
              선택된 파일: {file.name}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
