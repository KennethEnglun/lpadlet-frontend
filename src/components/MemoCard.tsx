import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Memo } from '../types';

interface MemoCardProps {
  memo: Memo;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateContent: (id: string, content: string) => void;
  isOwner: boolean;
}

const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  onDelete,
  onUpdatePosition,
  onUpdateContent,
  isOwner,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(memo.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing, content]);

  const handleDragStop = (e: any, data: any) => {
    console.log('Drag stopped:', memo.id, data.x, data.y);
    onUpdatePosition(memo.id, data.x, data.y);
  };

  const handleContentSubmit = () => {
    if (content.trim() !== memo.content) {
      onUpdateContent(memo.id, content.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleContentSubmit();
    }
    if (e.key === 'Escape') {
      setContent(memo.content);
      setIsEditing(false);
    }
  };

  return (
    <Draggable
      position={{ x: memo.x, y: memo.y }}
      onStop={handleDragStop}
      cancel=".no-drag"
    >
      <div
        className="memo-card absolute w-64 min-h-32 p-4"
        style={{ backgroundColor: memo.color }}
      >
        {/* Drag Handle */}
        <div className="drag-handle absolute top-0 left-0 w-full h-8 cursor-move bg-transparent hover:bg-black/5 transition-colors" />
        
        {/* Drag Indicator */}
        <div className="drag-handle absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full cursor-move" />
        
        {/* Action Buttons */}
        {isOwner && (
          <div className="absolute top-2 right-2 flex space-x-1 z-10 no-drag">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors bg-white/70 rounded hover:bg-white/90"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(memo.id)}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors bg-white/70 rounded hover:bg-white/90"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Image */}
        {memo.image && (
          <div className="mb-3">
            <img
              src={memo.image}
              alt="Memo attachment"
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentSubmit}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none resize-none outline-none text-gray-800 text-sm no-drag"
              placeholder="輸入您的備忘錄..."
              rows={4}
            />
          ) : (
            <p className="text-gray-800 text-sm whitespace-pre-wrap">
              {memo.content || '點擊編輯...'}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-3 text-xs text-gray-500">
          {new Date(memo.createdAt).toLocaleString('zh-TW')}
        </div>
      </div>
    </Draggable>
  );
};

export default MemoCard; 