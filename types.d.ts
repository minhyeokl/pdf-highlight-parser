declare module 'extracthighlights-dist/build/extracthighlights' {
  export interface HighlightAnnotation {
    highlightedText?: string;
    contents?: string;
    subtype?: string;
    type?: string;
    pageNumber?: number;
    rect?: number[];
    quadPoints?: Array<{
      dims?: {
        minY?: number;
        maxY?: number;
      }
    }>;
  }

  export interface PDFPage {
    getAnnotations(): Promise<HighlightAnnotation[]>;
    getViewport(scale: number | { scale: number }): any;
    render(renderContext: any, annotations?: any[]): Promise<void>;
  }

  export interface PDFDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPage>;
    getMetadata(): Promise<any>;
  }

  export interface LoadingTask {
    promise: Promise<PDFDocument>;
  }

  export interface GlobalWorkerOptionsType {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptionsType;
  
  export function getDocument(data: ArrayBuffer | string): LoadingTask;
} 