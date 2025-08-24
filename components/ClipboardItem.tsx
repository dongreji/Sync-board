import React, { useState, useRef, useEffect } from 'react';
import type { ClipboardItem } from '../types';
import Icon from './Icon';

interface ClipboardItemProps {
  item: ClipboardItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newContent: string) => void;
  onCopy: () => void;
}

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const ClipboardItemComponent: React.FC<ClipboardItemProps> = ({ item, onDelete, onUpdate, onCopy }) => {
  const [content, setContent] = useState(item.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    onCopy();
  };
  
  const handleBlur = () => {
    const trimmedContent = content.trim();
    if (trimmedContent && trimmedContent !== item.content) {
      onUpdate(item.id, trimmedContent);
    } else {
      // If content is empty or unchanged, revert to original to avoid accidental saves
      setContent(item.content);
    }
  };

  const fullDate = new Date(item.createdAt).toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'long'
  });

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 animate-fade-in">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        className="w-full bg-transparent resize-none outline-none text-slate-300 mb-4 p-0 block"
        rows={1}
        aria-label="Clipboard item content"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500" title={fullDate}>
          {formatRelativeTime(item.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md transition-colors duration-200 bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            <Icon name="copy" className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-red-400 transition-colors"
            aria-label="Delete item"
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClipboardItemComponent;