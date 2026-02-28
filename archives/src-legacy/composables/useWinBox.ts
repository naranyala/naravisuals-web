import { onUnmounted, readonly, ref } from 'vue';

let winBoxInstance: any = null;
let winBoxLoadPromise: Promise<void> | null = null;

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
      resolve();
      return;
    }
    
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

interface WinBoxOptions {
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

export function useWinBox() {
  const activeWindows = ref<any[]>([]);

  const createWindow = (options: WinBoxOptions) => {
    console.log('Creating window:', options.title);
    console.log('WinBox available:', typeof WinBox);
    
    if (!WinBox) {
      console.error('WinBox library not available');
      return null;
    }
    
    try {
    const win = new (WinBox as any)({
      id: options.id,
      title: options.title,
      html: options.html,
      width: options.width ?? 500,
      height: options.height ?? 400,
      x: options.x ?? 'center',
      y: options.y ?? 'center',
      background: options.background ?? '#1a1f2e',
      border: options.border ?? 1,
      index: options.index ?? 100,
      header: options.header ?? 40,
      modal: options.modal ?? false,
      onclose: (force?: boolean) => {
        console.log('WinBox close event triggered for:', options.title, 'force:', force);
        
        const index = activeWindows.value.indexOf(win);
        if (index > -1) {
          activeWindows.value.splice(index, 1);
        }
        
        console.log('Window closed and removed from active list:', options.title);
        return true;
      },
      onfocus: options.onfocus,
      onblur: options.onblur,
      onmove: options.onmove,
      onresize: options.onresize,
    });

    activeWindows.value.push(win);
    
    setTimeout(() => {
      if (win && win.focus) {
        win.focus();
        console.log('Window focused and positioned:', options.title);
        
        if (win.dom) {
          const closeBtn = win.dom.querySelector('.wb-close');
          if (closeBtn) {
            console.log('Found close button, adding event listener');
            closeBtn.addEventListener('click', (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Close button clicked manually');
              win.close();
            });
          } else {
            console.warn('Close button not found');
          }
        }
      }
    }, 200);

    console.log('Window created and added to active list:', options.title);
    return win;
    } catch (error) {
      console.error('Error creating window:', options.title, error);
      return null;
    }
  };

  const closeAll = () => {
    for (const win of activeWindows.value) {
      win.close();
    }
    activeWindows.value = [];
  };

  const focusWindow = (win: WinBox) => {
    win.focus();
  };

  const blurWindow = (win: WinBox) => {
    win.blur();
  };

  const minimizeWindow = (win: WinBox) => {
    win.minimize();
  };

  const maximizeWindow = (win: WinBox) => {
    win.maximize();
  };

  const fullscreenWindow = (win: WinBox) => {
    win.fullscreen();
  };

  const restoreWindow = (win: WinBox) => {
    win.restore();
  };

  const moveWindow = (win: WinBox, x: string | number, y: string | number) => {
    win.move(x, y);
  };

  const resizeWindow = (
    win: WinBox,
    width: string | number,
    height: string | number,
  ) => {
    win.resize(width, height);
  };

  const setWindowBackground = (win: WinBox, background: string) => {
    win.setBackground(background);
  };

  const setWindowTitle = (win: WinBox, title: string) => {
    win.setTitle(title);
  };

  const setWindowIcon = (win: WinBox, url: string) => {
    win.setIcon(url);
  };

  // Cleanup on unmount
  onUnmounted(() => {
    closeAll();
  });

  return {
    createWindow,
    closeAll,
    focusWindow,
    blurWindow,
    minimizeWindow,
    maximizeWindow,
    fullscreenWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
    setWindowBackground,
    setWindowTitle,
    setWindowIcon,
    activeWindows: readonly(activeWindows),
  };
}
