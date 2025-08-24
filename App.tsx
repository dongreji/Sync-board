import React, { useState, useCallback, useEffect } from 'react';
import type { ClipboardItem } from './types';
import { useSyncBoard } from './hooks/useSyncBoard';
import ClipboardContent from './components/ClipboardContent';
import ConfirmationModal from './components/ConfirmationModal';
import QRCodeModal from './components/QRCodeModal';
import Toast from './components/Toast';
import Icon from './components/Icon';

const generateId = () => {
  const prefix = 'naw';
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
  return `${prefix}${randomPart}`;
};

const isValidFirebaseKey = (key: string): boolean => {
  // Firebase keys must be non-empty and must not contain '.', '#', '$', '[', or ']'
  if (!key) return false;
  return !/[.#$\[\]]/.test(key);
};

const App: React.FC = () => {
  const [clipboardId, setClipboardId] = useState<string | null>(null);

  const getValidIdFromPath = (path: string): string | null => {
    const pathSegments = path.split('/').filter(Boolean);
    const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
    
    if (lastSegment && isValidFirebaseKey(lastSegment)) {
      return lastSegment;
    }
    
    if (lastSegment) {
        console.warn(`Invalid characters found in path segment: "${lastSegment}". A new SyncBoard will be used.`);
    }

    return null;
  }

  useEffect(() => {
    let id = getValidIdFromPath(window.location.pathname);

    if (!id) {
      id = generateId();
      window.history.replaceState({}, '', `/${id}`);
    }
    setClipboardId(id);

    const handlePopState = () => {
        let newId = getValidIdFromPath(window.location.pathname);
        if (!newId) {
            newId = generateId();
            window.history.replaceState({}, '', `/${newId}`);
        }
        setClipboardId(newId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);

  }, []);

  if (!clipboardId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Loading your SyncBoard...</p>
      </div>
    );
  }

  return <ClipboardView key={clipboardId} clipboardId={clipboardId} />;
};

interface ClipboardViewProps {
    clipboardId: string;
}

const ClipboardView: React.FC<ClipboardViewProps> = ({ clipboardId }) => {
  const { items, addItem, updateItem, deleteItem, clearItems } = useSyncBoard(clipboardId);
  const [isClearConfirmationOpen, setClearConfirmationOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const shareableLink = window.location.href;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);
  
  const handleAddItem = (content: string) => {
    addItem(content);
  };

  const handleUpdateItem = (itemId: string, newContent: string) => {
    updateItem(itemId, newContent);
    showToast('Item updated');
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    showToast('Item deleted');
  };
  
  const handleClearClipboard = () => {
    clearItems();
    setClearConfirmationOpen(false);
    showToast('Clipboard cleared');
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareableLink).then(() => {
        showToast('Link copied!');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
        showToast('Failed to copy link.');
    });
  }, [shareableLink, showToast]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <header className="bg-slate-900/70 backdrop-blur-lg border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            SyncBoard
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center bg-slate-800/50 border border-slate-700 rounded-md">
                 <input 
                    type="text" 
                    readOnly 
                    value={shareableLink}
                    className="bg-transparent text-indigo-300 text-sm rounded-l-md px-3 py-1.5 w-60 lg:w-72 outline-none"
                    onFocus={(e) => e.target.select()}
                    aria-label="Shareable link"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors flex items-center gap-1.5 border-l border-slate-700 bg-slate-700/50 hover:bg-slate-700"
                  aria-label="Copy link"
                >
                  <Icon name={isCopied ? "check" : "copy"} className="w-4 h-4" />
                  <span className="hidden lg:inline">{isCopied ? "Copied" : "Copy"}</span>
                </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="sm:hidden flex items-center p-2 bg-slate-700/80 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
              aria-label="Copy share link"
            >
              <Icon name={isCopied ? "check" : "copy"} className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors text-sm font-medium"
              aria-label="Share via QR code"
            >
              <Icon name="qr" className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 max-w-4xl">
        <ClipboardContent
          clipboardId={clipboardId}
          items={items}
          onAddItem={handleAddItem}
          onClearRequest={() => setClearConfirmationOpen(true)}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          showToast={showToast}
        />
      </main>

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={shareableLink}
      />

      {isClearConfirmationOpen && (
        <ConfirmationModal
          isOpen={isClearConfirmationOpen}
          onClose={() => setClearConfirmationOpen(false)}
          onConfirm={handleClearClipboard}
          title="Clear Clipboard"
          message="Are you sure you want to delete all items? This action cannot be undone."
        />
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}


export default App;