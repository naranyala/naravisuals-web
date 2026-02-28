let winBoxInstance: any = null;
let winBoxLoadPromise: Promise<void> | null = null;

export interface WinBoxOptions {
  id?: string;
  title?: string;
  html?: string;
  mount?: HTMLElement;
  url?: string;
  width?: string | number;
  height?: string | number;
  x?: string | number;
  y?: string | number;
  maxwidth?: string | number;
  maxheight?: string | number;
  minwidth?: string | number;
  minheight?: string | number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  background?: string;
  border?: string;
  header?: number;
  index?: number;
  modal?: boolean;
  onclose?: (force?: boolean) => boolean;
  onfocus?: () => void;
  onblur?: () => void;
  onmove?: (x: number, y: number) => void;
  onresize?: (width: number, height: number) => void;
}

async function loadWinBox(): Promise<void> {
  if (winBoxInstance) {
    return;
  }
  
  if (winBoxLoadPromise) {
    return winBoxLoadPromise;
  }
  
  winBoxLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).WinBox) {
      winBoxInstance = (window as any).WinBox;
      console.log('WinBox already available');
      resolve();
      return;
    }
    
    console.log('Loading WinBox script...');
    const script = document.createElement('script');
    script.src = '/winbox.bundle.min.js';
    script.async = true;
    
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).WinBox) {
        winBoxInstance = (window as any).WinBox;
        console.log('WinBox loaded successfully');
        resolve();
      } else {
        reject(new Error('WinBox not found after load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load WinBox script'));
    };
    
    document.head.appendChild(script);
  });
  
  return winBoxLoadPromise;
}

export async function createWindow(options: WinBoxOptions) {
  console.log('Creating window:', options.title);
  
  await loadWinBox();
  
  if (!winBoxInstance) {
    console.error('WinBox library not available');
    return null;
  }
  
  try {
    const win = new winBoxInstance({
      id: options.id,
      title: options.title,
      html: options.html,
      mount: options.mount,
      url: options.url,
      width: options.width ?? 500,
      height: options.height ?? 400,
      x: options.x ?? 'center',
      y: options.y ?? 'center',
      maxwidth: options.maxwidth,
      maxheight: options.maxheight,
      minwidth: options.minwidth,
      minheight: options.minheight,
      top: options.top,
      right: options.right,
      bottom: options.bottom,
      left: options.left,
      background: options.background ?? '#1a1f2e',
      border: options.border ?? 1,
      index: options.index ?? 100,
      header: options.header ?? 40,
      modal: options.modal ?? false,
      onclose: options.onclose,
      onfocus: options.onfocus,
      onblur: options.onblur,
      onmove: options.onmove,
      onresize: options.onresize,
    });

    console.log('WinBox window created:', win);
    return win;
  } catch (error) {
    console.error('Error creating window:', options.title, error);
    return null;
  }
}

export function getWinBox(): any {
  return winBoxInstance;
}

export async function isWinBoxReady(): Promise<boolean> {
  try {
    await loadWinBox();
    return winBoxInstance !== null;
  } catch {
    return false;
  }
}
