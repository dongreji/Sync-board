import React, { useState, useEffect, useRef } from 'react';
import type { Clipboard } from '../types';
import Icon from './Icon';

interface ClipboardTabsProps {
  clipboards: Clipboard[];
  activeClipboardId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const ClipboardTabs: React.FC<ClipboardTabsProps> = ({ clipboards, activeClipboardId, onSelect, onCreate, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEditing = (clipboard: Clipboard) => {
    setEditingId(clipboard.id);
    setEditingName(clipboard.name);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSave = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    handleCancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 sticky top-24">
      <h2 className="text-lg font-semibold mb-3 px-2 text-slate-300">My Clipboards</h2>
      <div className="space-y-1">
        {clipboards.map(clipboard => (
          <div
            key={clipboard.id}
            onClick={() => editingId !== clipboard.id && onSelect(clipboard.id)}
            className={`
              group flex justify-between items-center w-full text-left p-2 rounded-md transition-colors duration-200 cursor-pointer
              ${activeClipboardId === clipboard.id && !editingId
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50'}
              ${editingId === clipboard.id ? 'bg-slate-700' : ''}
            `}
          >
            <div className="flex-grow flex items-center gap-2 min-w-0">
              <Icon name="clipboard" className="w-5 h-5 opacity-70 flex-shrink-0" />
              {editingId === clipboard.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none w-full text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{clipboard.name}</span>
              )}
            </div>
            {editingId !== clipboard.id && (
               <div className="flex items-center flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartEditing(clipboard); }}
                  className={`p-1 rounded-full transition-all duration-200 ${activeClipboardId === clipboard.id ? 'text-indigo-200 hover:bg-indigo-500/50' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:text-slate-200'}`}
                  aria-label={`Rename ${clipboard.name}`}
                >
                  <Icon name="edit" className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(clipboard.id); }}
                  className={`p-1 rounded-full transition-all duration-200 ${activeClipboardId === clipboard.id ? 'text-indigo-200 hover:bg-indigo-500/50' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:text-red-400'}`}
                  aria-label={`Delete ${clipboard.name}`}
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
               </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onCreate}
        className="w-full mt-4 flex items-center justify-center gap-2 p-2 bg-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-md transition-colors duration-200"
      >
        <Icon name="plus" className="w-5 h-5" />
        New Clipboard
      </button>
    </div>
  );
};

export default ClipboardTabs;
