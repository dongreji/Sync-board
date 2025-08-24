import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before calling onClose
        setTimeout(onClose, 300);
      }, 2700);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl bg-slate-700 border border-slate-600 text-slate-200 transition-all duration-300 ease-in-out z-50
        ${visible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon name="check" className="w-5 h-5 text-green-400" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
