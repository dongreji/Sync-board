
import React, { useState, useEffect } from 'react';
import type { ClipboardItem } from '../types';
import Icon from './Icon';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, newContent: string) => void;
  item: ClipboardItem;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (item) {
      setContent(item.content);
    }
  }, [item]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(item.id, content.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Edit Item</h2>
           <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-200"
            required
            autoFocus
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition disabled:opacity-50"
              disabled={!content.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
