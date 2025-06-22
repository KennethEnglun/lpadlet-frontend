import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, User, Calendar } from 'lucide-react';
import { Memo, Comment, Like } from '../types';

interface MemoDetailModalProps {
  memo: Memo;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onLike: (memoId: string) => void;
  onComment: (memoId: string, content: string) => void;
  likes: Like[];
  comments: Comment[];
}

const MemoDetailModal: React.FC<MemoDetailModalProps> = ({
  memo,
  isOpen,
  onClose,
  currentUserId,
  onLike,
  onComment,
  likes,
  comments
}) => {
  const [commentText, setCommentText] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // 檢查當前用戶是否已點讚
  const isLiked = likes.some(like => like.userId === currentUserId);
  const likeCount = likes.length;

  useEffect(() => {
    if (memo.image) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [memo.image]);

  const handleLike = () => {
    onLike(memo.id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(memo.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComment();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {memo.userName || `用戶${memo.createdBy.slice(-4)}`}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar size={14} />
                <span>{new Date(memo.createdAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-140px)]">
          {/* Left side - Image */}
          {memo.image && (
            <div className="lg:w-1/2 bg-gray-50 flex items-center justify-center p-4">
              <div className="relative w-full h-full max-h-96 lg:max-h-full">
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
                    <div className="text-gray-400">載入中...</div>
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-md">
                    <div className="text-gray-400">圖片載入失敗</div>
                  </div>
                )}
                <img
                  src={memo.image}
                  alt="Memo attachment"
                  className={`w-full h-full object-contain rounded-md transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </div>
          )}

          {/* Right side - Content and interactions */}
          <div className={`${memo.image ? 'lg:w-1/2' : 'w-full'} flex flex-col`}>
            {/* Text content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div 
                className="w-6 h-6 rounded-full mb-4"
                style={{ backgroundColor: memo.color }}
              ></div>
              <p className="text-gray-800 whitespace-pre-wrap break-words text-lg leading-relaxed">
                {memo.content || '無內容'}
              </p>
            </div>

            {/* Likes and Comments section */}
            <div className="border-t border-gray-200">
              {/* Like and Comment buttons */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart 
                      size={18} 
                      className={isLiked ? 'fill-current' : ''} 
                    />
                    <span className="font-medium">{likeCount}</span>
                  </button>
                  <button
                    onClick={() => commentInputRef.current?.focus()}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span className="font-medium">{comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="max-h-48 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">還沒有評論，成為第一個留言的人吧！</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-gray-800">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString('zh-TW')}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="寫下您的評論..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                    />
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                        commentText.trim()
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoDetailModal; 