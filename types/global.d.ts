declare global {
  interface Window {
    MathJax?: {
      version?: string;
      startup?: {
        promise: Promise<void>;
        typeset?: boolean;
      };
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements?: HTMLElement[]) => void;
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