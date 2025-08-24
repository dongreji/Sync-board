
export interface ClipboardItem {
  id: string;
  content: string;
  createdAt: string; // ISO string
}

export interface Clipboard {
  id: string;
  name: string;
  items: ClipboardItem[];
}
