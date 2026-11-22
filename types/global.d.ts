declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<void>;
      typesetClear?: () => void;
      tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
      };
      svg?: {
        fontCache?: string;
      };
    };
  }
}

export {};