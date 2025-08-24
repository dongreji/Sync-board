import React, { useState, useMemo } from 'react';
import type { ClipboardItem } from '../types';
import ClipboardItemComponent from './ClipboardItem';
import Icon from './Icon';

interface ClipboardContentProps {
  clipboardId: string;
  items: ClipboardItem[];
  onAddItem: (content: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, newContent: string) => void;
  onClearRequest: () => void;
  showToast: (message: string) => void;
}

const ClipboardContent: React.FC<ClipboardContentProps> = ({ clipboardId, items, onAddItem, onDeleteItem, onUpdateItem, onClearRequest, showToast }) => {
  const [newItemContent, setNewItemContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemContent.trim()) {
      onAddItem(newItemContent.trim());
      setNewItemContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (newItemContent.trim()) {
            onAddItem(newItemContent.trim());
            setNewItemContent('');
        }
    }
  };
  
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-100 truncate">
            Clipboard: <span className="text-indigo-400 font-mono">{clipboardId}</span>
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClearRequest}
            className="px-4 py-2 text-sm bg-red-600/20 text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <form onSubmit={handleAddItem} className="mb-6">
        <textarea
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type content here... (Ctrl+Enter to add)"
          className="w-full h-28 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-200"
        />
        <div className="flex justify-end">
            <button
              type="submit"
              className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              disabled={!newItemContent.trim()}
            >
              Add Item
            </button>
        </div>
      </form>
      
      {items.length > 0 && (
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full p-2 pl-10 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <ClipboardItemComponent
              key={item.id}
              item={item}
              onDelete={onDeleteItem}
              onUpdate={onUpdateItem}
              onCopy={() => showToast('Copied to clipboard!')}
            />
          ))
        ) : (
           <div className="text-center py-10">
              <div className="inline-block p-4 bg-slate-900/50 rounded-full border border-slate-700">
                 <Icon name="clipboard" className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-500 mt-4">
                {searchQuery ? 'No items match your search.' : 'Your clipboard is empty.'}
              </p>
              {!searchQuery && <p className="text-slate-500 text-sm mt-1">Add an item using the form above to get started.</p>}
            </div>
        )}
      </div>
    </div>
  );
};

export default ClipboardContent;