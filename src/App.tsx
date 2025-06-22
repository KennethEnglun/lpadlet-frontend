import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Users, MousePointer } from 'lucide-react';
import MemoCard from './components/MemoCard';
import AddMemoModal from './components/AddMemoModal';
import { useSocket } from './hooks/useSocket';
import { Memo, UserCursor } from './types';

const App: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [userCursors, setUserCursors] = useState<Map<string, UserCursor>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [currentSocketId, setCurrentSocketId] = useState<string>('');

  // Socket事件處理器
  const handleMemosReceived = useCallback((receivedMemos: Memo[]) => {
    setMemos(receivedMemos);
  }, []);

  const handleNewMemo = useCallback((memo: Memo) => {
    setMemos(prev => [...prev, memo]);
  }, []);

  const handleMemoDeleted = useCallback((memoId: string) => {
    setMemos(prev => prev.filter(m => m.id !== memoId));
  }, []);

  const handleMemoPositionUpdated = useCallback((data: { id: string; x: number; y: number }) => {
    setMemos(prev => prev.map(memo => 
      memo.id === data.id ? { ...memo, x: data.x, y: data.y } : memo
    ));
  }, []);

  const handleMemoContentUpdated = useCallback((data: { id: string; content: string }) => {
    setMemos(prev => prev.map(memo => 
      memo.id === data.id ? { ...memo, content: data.content } : memo
    ));
  }, []);

  const handleUserCursor = useCallback((cursor: UserCursor) => {
    setUserCursors(prev => new Map(prev).set(cursor.userId, cursor));
  }, []);

  const handleUserDisconnected = useCallback((userId: string) => {
    setUserCursors(prev => {
      const newCursors = new Map(prev);
      newCursors.delete(userId);
      return newCursors;
    });
  }, []);

  const handleUserCountChanged = useCallback((count: number) => {
    setConnectedUsers(count);
  }, []);

  // 使用Socket Hook
  const { 
    createMemo, 
    updateMemoPosition, 
    updateMemoContent, 
    deleteMemo, 
    sendCursorMove,
    socket
  } = useSocket({
    onMemosReceived: handleMemosReceived,
    onNewMemo: handleNewMemo,
    onMemoDeleted: handleMemoDeleted,
    onMemoPositionUpdated: handleMemoPositionUpdated,
    onMemoContentUpdated: handleMemoContentUpdated,
    onUserCursor: handleUserCursor,
    onUserDisconnected: handleUserDisconnected,
    onUserCountChanged: handleUserCountChanged,
  });

  // 獲取當前socket ID
  useEffect(() => {
    if (socket) {
      setCurrentSocketId(socket.id || '');
    }
  }, [socket]);

  // 處理鼠標移動
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (socket) {
      sendCursorMove(e.clientX, e.clientY);
    }
  }, [socket, sendCursorMove]);

  // 處理memo位置更新
  const handleUpdateMemoPosition = useCallback((id: string, x: number, y: number) => {
    // 立即更新本地狀態
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, x, y } : memo
    ));
    // 發送到服務器
    updateMemoPosition(id, x, y);
  }, [updateMemoPosition]);

  // 處理新memo創建
  const handleCreateMemo = useCallback((content: string, image?: string, color?: string) => {
    createMemo({
      content,
      image,
      color,
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 200) + 100,
    });
  }, [createMemo]);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50"
      onMouseMove={handleMouseMove}
    >
      {/* 頂部工具欄 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LPadlet
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{connectedUsers} 位用戶在線</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-memo-btn flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>新增備忘錄</span>
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="pt-20 w-full h-full relative">
        {/* 渲染所有memo */}
        {memos.map((memo) => (
          <MemoCard
            key={memo.id}
            memo={memo}
            onDelete={deleteMemo}
            onUpdatePosition={handleUpdateMemoPosition}
            onUpdateContent={updateMemoContent}
            isOwner={memo.createdBy === currentSocketId}
          />
        ))}

        {/* 渲染其他用戶的光標 */}
        {Array.from(userCursors.values()).map((cursor) => (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none z-50"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer 
              size={20} 
              className="text-purple-500 drop-shadow-md" 
              fill="currentColor"
            />
            <div className="absolute top-5 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded shadow-md">
              用戶 {cursor.userId.slice(-4)}
            </div>
          </div>
        ))}

        {/* 空狀態 */}
        {memos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                歡迎來到 LPadlet！
              </h2>
              <p className="text-gray-500 mb-6">
                點擊上方按鈕創建您的第一個備忘錄
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="add-memo-btn"
              >
                <Plus size={20} />
                <span>開始創建</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 新增備忘錄模態框 */}
      <AddMemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMemo}
      />

      {/* 說明文字 */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-500">
        <p>💡 拖動備忘錄來移動位置</p>
        <p>✏️ 點擊編輯按鈕修改內容</p>
        <p>🌐 所有變更都會即時同步給其他用戶</p>
      </div>
    </div>
  );
};

export default App; 