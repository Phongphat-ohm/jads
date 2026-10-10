/**
 * Download Manager & Tauri Bridge Utility
 * Handles:
 * 1. Download settings (default folder, prompt before save)
 * 2. Download history persistence (localStorage)
 * 3. Tauri native file saving, folder picking, and opening
 * 4. Fallback to standard web browser downloads
 */

export interface DownloadHistoryItem {
  id: string;
  fileName: string;
  format: 'docx' | 'pdf' | string;
  fileSize?: number;
  filePath?: string;
  caseBlackNo?: string;
  courtName?: string;
  downloadedAt: string;
}

export interface DownloadSettings {
  defaultDir: string;
  alwaysAskLocation: boolean;
}

const SETTINGS_KEY = 'jads_download_settings';
const HISTORY_KEY = 'jads_download_history';

// Check if running inside Tauri Desktop
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__IS_TAURI__ ||
      (window as any).__TAURI__ ||
      (window as any).__TAURI_INTERNALS__
  );
}

// Get saved download settings
export function getDownloadSettings(): DownloadSettings {
  if (typeof window === 'undefined') {
    return { defaultDir: '', alwaysAskLocation: true };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse download settings:', e);
  }
  return {
    defaultDir: '',
    alwaysAskLocation: true,
  };
}

// Save download settings
export function saveDownloadSettings(settings: DownloadSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save download settings:', e);
  }
}

// Get download history list (newest first)
export function getDownloadHistory(): DownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse download history:', e);
  }
  return [];
}

// Add item to download history
export function addDownloadHistoryItem(item: Omit<DownloadHistoryItem, 'id' | 'downloadedAt'>): DownloadHistoryItem {
  const history = getDownloadHistory();
  const newItem: DownloadHistoryItem = {
    ...item,
    id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    downloadedAt: new Date().toISOString(),
  };

  // Keep up to 200 items
  const updated = [newItem, ...history].slice(0, 200);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save download history:', e);
  }
  return newItem;
}

// Clear all download history
export function clearDownloadHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear download history:', e);
  }
}

// Delete single history item
export function removeDownloadHistoryItem(id: string): void {
  const history = getDownloadHistory();
  const updated = history.filter((item) => item.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete history item:', e);
  }
}

/**
 * Invoke a Tauri command safely
 */
async function invokeTauri<T>(cmd: string, args: Record<string, any> = {}): Promise<T> {
  const win = window as any;
  if (win.__TAURI_INTERNALS__?.invoke) {
    return win.__TAURI_INTERNALS__.invoke(cmd, args);
  }
  if (win.__TAURI__?.core?.invoke) {
    return win.__TAURI__.core.invoke(cmd, args);
  }
  throw new Error('Tauri API is not available');
}

/**
 * Native folder picker dialog
 */
export async function pickDownloadFolder(): Promise<string | null> {
  if (!isTauriEnvironment()) return null;
  try {
    const res = await invokeTauri<string | null>('pick_download_dir');
    return res;
  } catch (e) {
    console.error('Failed to pick folder:', e);
    return null;
  }
}

/**
 * Open file in default system application
 */
export async function openDownloadedFile(filePath: string): Promise<boolean> {
  if (!filePath || !isTauriEnvironment()) return false;
  try {
    await invokeTauri('open_file', { filePath });
    return true;
  } catch (e) {
    console.error('Failed to open file:', e);
    return false;
  }
}

/**
 * Show file in Windows Explorer / File Manager
 */
export async function showInFileManager(filePath: string): Promise<boolean> {
  if (!filePath || !isTauriEnvironment()) return false;
  try {
    await invokeTauri('show_in_folder', { filePath });
    return true;
  } catch (e) {
    console.error('Failed to reveal file:', e);
    return false;
  }
}

/**
 * Execute download of a Blob / ArrayBuffer
 * - If inside Tauri: checks settings, prompts or saves directly to folder, and records history with file path
 * - If web: downloads via browser <a> tag and records history
 */
export async function executeFileDownload(params: {
  blob: Blob;
  fileName: string;
  format: 'docx' | 'pdf' | string;
  caseBlackNo?: string;
  courtName?: string;
}): Promise<{ success: boolean; filePath?: string; cancelled?: boolean }> {
  const { blob, fileName, format, caseBlackNo, courtName } = params;
  const isTauri = isTauriEnvironment();

  if (isTauri) {
    try {
      const settings = getDownloadSettings();
      let targetPath: string | null = null;

      if (settings.alwaysAskLocation || !settings.defaultDir) {
        // Open native Save File Dialog
        targetPath = await invokeTauri<string | null>('pick_save_file_path', {
          defaultName: fileName,
          defaultDir: settings.defaultDir || null,
        });

        if (!targetPath) {
          // User cancelled save dialog
          return { success: false, cancelled: true };
        }
      } else {
        // Save automatically to default directory
        const sep = settings.defaultDir.includes('/') ? '/' : '\\';
        targetPath = `${settings.defaultDir.replace(/[\\/]+$/, '')}${sep}${fileName}`;
      }

      // Convert blob to byte array for Tauri
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));

      const savedPath = await invokeTauri<string>('save_download_file', {
        destPath: targetPath,
        bytes,
      });

      // Record in download history
      addDownloadHistoryItem({
        fileName,
        format,
        fileSize: blob.size,
        filePath: savedPath,
        caseBlackNo,
        courtName,
      });

      return { success: true, filePath: savedPath };
    } catch (err: any) {
      console.warn('Tauri native save failed, falling back to browser download:', err);
      // Fall through to browser download
    }
  }

  // Standard Web Browser Download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  // Record in download history
  addDownloadHistoryItem({
    fileName,
    format,
    fileSize: blob.size,
    caseBlackNo,
    courtName,
  });

  return { success: true };
}
