import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Trash2, Edit3, Image as ImageIcon, Shield } from 'lucide-react';
import { Memo } from '../types';

interface ResponsiveConfig {
  memosPerRow: number;
  memoWidth: number;
  memoHeight: number;
  padding: number;
  headerHeight: number;
  fontSize: string;
  titleSize: string;
  showDeviceIcon: string;
}

interface MemoCardProps {
  memo: Memo;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateContent: (id: string, content: string) => void;
  isOwner: boolean;
  isAdmin?: boolean;
  onAdminDelete?: (id: string) => void;
  isDraggable?: boolean;
  isLargeSize?: boolean;
  responsiveConfig?: ResponsiveConfig;
}

const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  onDelete,
  onUpdatePosition,
  onUpdateContent,
  isOwner,
  isAdmin = false,
  onAdminDelete,
  isDraggable = true,
  isLargeSize = false,
  responsiveConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(memo.content);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 使用響應式配置或默認值
  const config = responsiveConfig || {
    memoWidth: 512,
    memoHeight: 256,
    fontSize: 'text-base',
    titleSize: 'text-2xl'
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing, content]);

  useEffect(() => {
    if (memo.image) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [memo.image]);

  const handleDragStop = (e: any, data: any) => {
    if (isDraggable) {
      console.log('Drag stopped:', memo.id, data.x, data.y);
      onUpdatePosition(memo.id, data.x, data.y);
    }
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

  const handleAdminDelete = () => {
    if (onAdminDelete && window.confirm('確定要刪除這個貼文嗎？（管理員操作）')) {
      onAdminDelete(memo.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  // 響應式尺寸設置 - 固定高度防止圖片載入時閃動
  const cardStyle = {
    width: responsiveConfig ? `${responsiveConfig.memoWidth}px` : (isLargeSize ? '512px' : '256px'),
    height: responsiveConfig ? `${responsiveConfig.memoHeight}px` : (isLargeSize ? '256px' : '128px'), // 改為固定高度
  };

  const MemoContent = () => (
    <div
      className={`memo-card absolute p-4 rounded-lg shadow-lg border-2 border-gray-200 flex flex-col`}
      style={{ backgroundColor: memo.color, ...cardStyle }}
    >
      {/* Drag Handle - 只在可拖拽時顯示 */}
      {isDraggable && (
        <>
          <div className="drag-handle absolute top-0 left-0 w-full h-8 cursor-move bg-transparent hover:bg-black/5 transition-colors" />
          <div className="drag-handle absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full cursor-move" />
        </>
      )}
      
      {/* 用戶名稱 */}
      <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded">
        {memo.userName || `用戶${memo.createdBy.slice(-4)}`}
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex space-x-1 z-10 no-drag">
        {/* Owner Controls */}
        {isOwner && (
          <>
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
          </>
        )}
        
        {/* Admin Controls */}
        {isAdmin && !isOwner && (
          <button
            onClick={handleAdminDelete}
            className="p-1 text-red-500 hover:text-red-700 transition-colors bg-red-100/70 rounded hover:bg-red-100/90"
            title="管理員刪除"
          >
            <Shield size={14} />
          </button>
        )}
      </div>

      {/* Image - 固定容器高度防止閃動 */}
      {memo.image && (
        <div 
          className={`mb-3 ${isLargeSize ? 'mt-12' : 'mt-8'} relative overflow-hidden rounded-md`}
          style={{
            height: responsiveConfig
              ? `${responsiveConfig.memoHeight * 0.45}px`
              : isLargeSize
                ? '110px'
                : '60px',
            backgroundColor: '#f3f4f6'
          }}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-sm">載入中...</div>
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-sm">圖片載入失敗</div>
            </div>
          )}
          <img
            src={memo.image}
            alt="Memo attachment"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      {/* Content - 調整空間分配 */}
      <div className={`${isLargeSize ? 'mt-12' : 'mt-8'} ${memo.image ? '' : ''} flex-1 flex flex-col overflow-hidden`}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentSubmit}
            onKeyDown={handleKeyPress}
            className={`w-full bg-transparent border-none resize-none outline-none text-gray-800 no-drag break-words flex-1 ${
              responsiveConfig ? responsiveConfig.fontSize : (isLargeSize ? 'text-base' : 'text-sm')
            }`}
            placeholder="輸入您的貼文內容..."
            style={{ 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word',
              maxHeight: memo.image 
                ? (responsiveConfig ? `${responsiveConfig.memoHeight * 0.35}px` : '80px')
                : (responsiveConfig ? `${responsiveConfig.memoHeight * 0.7}px` : '160px')
            }}
          />
        ) : (
          <p className={`text-gray-800 whitespace-pre-wrap break-words overflow-hidden flex-1 ${
            responsiveConfig ? responsiveConfig.fontSize : (isLargeSize ? 'text-base' : 'text-sm')
          }`} style={{ 
            wordWrap: 'break-word', 
            overflowWrap: 'break-word', 
            hyphens: 'auto',
            maxHeight: memo.image 
              ? (responsiveConfig ? `${responsiveConfig.memoHeight * 0.35}px` : '80px')
              : (responsiveConfig ? `${responsiveConfig.memoHeight * 0.7}px` : '160px'),
            overflowY: 'auto'
          }}>
            {memo.content || '點擊編輯...'}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <div className={`mt-3 text-gray-500 ${
        responsiveConfig ? 'text-xs' : (isLargeSize ? 'text-sm' : 'text-xs')
      }`}>
        {new Date(memo.createdAt).toLocaleString('zh-TW')}
      </div>
    </div>
  );

  if (isDraggable) {
    return (
      <Draggable
        position={{ x: memo.x, y: memo.y }}
        onStop={handleDragStop}
        onDrag={(e, data) => {
          // 拖拽過程中的即時位置更新，減少遲緩感
        }}
        cancel=".no-drag"
        enableUserSelectHack={false}
      >
        <MemoContent />
      </Draggable>
    );
  } else {
    return (
      <div
        style={{
          position: 'absolute',
          left: memo.x,
          top: memo.y,
        }}
      >
        <MemoContent />
      </div>
    );
  }
};

export default MemoCard; 