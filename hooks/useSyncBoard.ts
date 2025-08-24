import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import type { ClipboardItem } from '../types';

interface OmittedClipboardItem {
  content: string;
  createdAt: string;
}

export function useSyncBoard(clipboardId: string) {
  const [items, setItems] = useState<ClipboardItem[]>([]);

  useEffect(() => {
    if (!clipboardId) return;

    const itemsRef = ref(db, `clipboards/${clipboardId}/items`);
    
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsArray: ClipboardItem[] = Object.entries(data).map(([id, item]) => ({
          ...(item as OmittedClipboardItem),
          id,
        }));
        itemsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setItems(itemsArray);
      } else {
        setItems([]);
      }
    });

    return () => unsubscribe();
  }, [clipboardId]);

  const addItem = (content: string) => {
    const itemsRef = ref(db, `clipboards/${clipboardId}/items`);
    const newItemRef = push(itemsRef);
    const newItem: OmittedClipboardItem = {
      content,
      createdAt: new Date().toISOString(),
    };
    set(newItemRef, newItem);
  };

  const updateItem = (itemId: string, newContent: string) => {
    const itemContentRef = ref(db, `clipboards/${clipboardId}/items/${itemId}/content`);
    set(itemContentRef, newContent);
  };



  const deleteItem = (itemId: string) => {
    const itemRef = ref(db, `clipboards/${clipboardId}/items/${itemId}`);
    remove(itemRef);
  };

  const clearItems = () => {
    const itemsRef = ref(db, `clipboards/${clipboardId}/items`);
    remove(itemsRef);
  };

  return { items, addItem, updateItem, deleteItem, clearItems };
}
