import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import type { ClipboardItem } from '../types';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

interface AdminClipboard {
  id: string;
  itemCount: number;
  lastModified: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
    
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [clipboards, setClipboards] = useState<AdminClipboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [clipboardToDelete, setClipboardToDelete] = useState<string | null>(null);
  const [isDeleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !db) return;

    setIsLoading(true);
    const clipboardsRef = ref(db, 'clipboards');
    const unsubscribe = onValue(clipboardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const boards: AdminClipboard[] = Object.entries(data).map(([id, boardData]) => {
          const items = (boardData as { items?: Record<string, ClipboardItem> })?.items || {};
          const itemValues = Object.values(items);
          const lastModified = itemValues.length > 0
            ? itemValues.reduce((latest, item) => (new Date(item.createdAt) > new Date(latest) ? item.createdAt : latest), itemValues[0].createdAt)
            : new Date(0).toISOString();
          
          return {
            id,
            itemCount: itemValues.length,
            lastModified,
          };
        });
        boards.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
        setClipboards(boards);
      } else {
        setClipboards([]);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Firebase read failed: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleDelete = (id: string) => {
    if (!db) return;
    const clipboardRef = ref(db, `clipboards/${id}`);
    remove(clipboardRef);
    setClipboardToDelete(null);
  };

  const handleDeleteAll = () => {
    if (!db) return;
    const clipboardsRef = ref(db, 'clipboards');
    remove(clipboardsRef);
    setDeleteAllConfirmOpen(false);
  };

  const filteredClipboards = useMemo(() => {
    if (!searchQuery) return clipboards;
    return clipboards.filter(board => board.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clipboards, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex flex-col p-4 sm:p-6 md:p-8" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full h-full flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="shield" className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-100">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 flex-shrink-0 border-b border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-xs">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID..."
                    className="w-full p-2 pl-10 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="w-5 h-5 text-slate-500" />
                </div>
            </div>
            <button
                onClick={() => setDeleteAllConfirmOpen(true)}
                disabled={clipboards.length === 0}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600/20 text-red-300 border border-red-500/30 rounded-md hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Icon name="trash" className="w-4 h-4" />
                Delete All Clipboards
            </button>
        </div>
        
        <main className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><p className="text-slate-400">Loading clipboards...</p></div>
          ) : filteredClipboards.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {filteredClipboards.map(board => (
                <div key={board.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-700/50 transition-colors">
                  <div className="flex-grow min-w-0">
                    <a href={`/${board.id}`} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-400 hover:underline break-all">{board.id}</a>
                    <p className="text-sm text-slate-400 mt-1">
                      {board.itemCount} item{board.itemCount !== 1 && 's'} &bull; Last updated: {formatRelativeTime(board.lastModified)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setClipboardToDelete(board.id)}
                      className="p-2 rounded-md bg-slate-700 hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label={`Delete clipboard ${board.id}`}
                    >
                      <Icon name="trash" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-center">
                <div>
                    <Icon name="clipboard" className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-500 mt-4">
                        {searchQuery ? 'No clipboards match your search.' : 'No active clipboards found.'}
                    </p>
                </div>
            </div>
          )}
        </main>
      </div>
      {clipboardToDelete && (
          <ConfirmationModal
            isOpen={!!clipboardToDelete}
            onClose={() => setClipboardToDelete(null)}
            onConfirm={() => handleDelete(clipboardToDelete)}
            title="Delete Clipboard"
            message={`Are you sure you want to delete the clipboard "${clipboardToDelete}"? All its items will be permanently removed.`}
          />
      )}
      {isDeleteAllConfirmOpen && (
          <ConfirmationModal
            isOpen={isDeleteAllConfirmOpen}
            onClose={() => setDeleteAllConfirmOpen(false)}
            onConfirm={handleDeleteAll}
            title="Delete All Clipboards"
            message={`Are you sure you want to delete all ${clipboards.length} clipboards? This action is irreversible.`}
          />
      )}
    </div>
  );
};

export default AdminPanel;
