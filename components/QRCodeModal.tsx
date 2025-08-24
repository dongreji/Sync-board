import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Icon from './Icon';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#e2e8f0', // slate-200
          light: '#0f172a'  // slate-900
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
    if(isOpen) {
        setIsCopied(false);
    }
  }, [isOpen, url]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy link: ', err);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Share Clipboard</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-slate-900 p-4 rounded-md inline-block border border-slate-700">
            <canvas ref={canvasRef} />
        </div>
        <p className="text-slate-400 mt-4 text-sm">Scan this code to open the clipboard on another device.</p>
        <div className="mt-4 p-2 bg-slate-900 rounded-md text-xs text-indigo-300 break-words border border-slate-700">
            {url}
        </div>
        <button
            onClick={handleCopyLink}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-75"
            disabled={isCopied}
            aria-label="Copy link"
        >
            <Icon name={isCopied ? "check" : "copy"} className="w-4 h-4" />
            {isCopied ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;