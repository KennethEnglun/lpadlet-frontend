import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Users, Settings, Layout } from 'lucide-react';
import MemoCard from './components/MemoCard';
import AddMemoModal from './components/AddMemoModal';
import AdminPanel from './components/AdminPanel';
import BoardSelector from './components/BoardSelector';
import { useSocket } from './hooks/useSocket';
import { Memo, UserCursor, Board, User } from './types';

const App: React.FC = () => {
  // 基本狀態
  const [memos, setMemos] = useState<Memo[]>([]);
  const [userCursors, setUserCursors] = useState<Map<string, UserCursor>>(new Map());
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [currentSocketId, setCurrentSocketId] = useState<string>('');
  
  // 模態框狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // 記事版和用戶狀態
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    // 移除滑鼠光標功能 - 不再處理
  }, []);

  const handleUserDisconnected = useCallback((userId: string) => {
    // 移除滑鼠光標功能 - 不再處理
  }, []);

  const handleUserCountChanged = useCallback((count: number) => {
    setConnectedUsers(count);
  }, []);

  // 新增：記事版相關事件處理器
  const handleBoardsReceived = useCallback((receivedBoards: Board[]) => {
    setBoards(receivedBoards);
    if (receivedBoards.length > 0 && !currentBoard) {
      // 不自動選擇記事版，讓用戶手動選擇
    }
  }, [currentBoard]);

  const handleBoardCreated = useCallback((board: Board) => {
    setBoards(prev => [...prev, board]);
  }, []);

  const handleBoardDeleted = useCallback((boardId: string) => {
    setBoards(prev => prev.filter(b => b.id !== boardId));
    if (currentBoard?.id === boardId) {
      setCurrentBoard(boards.find(b => b.id !== boardId) || null);
    }
  }, [currentBoard, boards]);

  const handleUserInfo = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAdmin(user.isAdmin);
  }, []);

  // 使用Socket Hook
  const { 
    createMemo, 
    updateMemoPosition, 
    updateMemoContent, 
    deleteMemo, 
    sendCursorMove,
    createBoard,
    deleteBoard,
    adminDeleteMemo,
    adminClearAllMemos,
    switchBoard,
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
    onBoardsReceived: handleBoardsReceived,
    onBoardCreated: handleBoardCreated,
    onBoardDeleted: handleBoardDeleted,
    onUserInfo: handleUserInfo,
  });

  // 獲取當前socket ID
  useEffect(() => {
    if (socket) {
      setCurrentSocketId(socket.id || '');
    }
  }, [socket]);

  // 檢查Admin權限
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    if (adminParam === 'admin123') {
      setIsAdmin(true);
    }
  }, []);

  // 計算memo的自動排列位置
  const calculateMemoPosition = useCallback((index: number) => {
    const memoWidth = 512; // 放大一倍：原本256 -> 512
    const memoHeight = 256; // 放大一倍：原本128 -> 256
    const padding = 20;
    const memosPerRow = 5;
    
    const row = Math.floor(index / memosPerRow);
    const col = index % memosPerRow;
    
    const x = col * (memoWidth + padding) + padding;
    const y = row * (memoHeight + padding) + padding + 100; // +100 for header
    
    return { x, y };
  }, []);

  // 處理memo位置更新（禁用拖拽）
  const handleUpdateMemoPosition = useCallback((id: string, x: number, y: number) => {
    // 不允許用戶手動移動memo位置
    return;
  }, []);

  // 處理新memo創建
  const handleCreateMemo = useCallback((content: string, image?: string, color?: string, userName?: string) => {
    if (!currentBoard) return;
    
    // 計算當前記事版memo的數量來決定位置
    const currentBoardMemos = memos.filter(m => m.boardId === currentBoard.id);
    const position = calculateMemoPosition(currentBoardMemos.length);
    
    createMemo({
      content,
      image,
      color,
      x: position.x,
      y: position.y,
      boardId: currentBoard.id,
      userName: userName || `用戶${currentSocketId.slice(-4)}`,
    });
  }, [createMemo, currentBoard, memos, currentSocketId, calculateMemoPosition]);

  // 處理記事版切換
  const handleBoardSwitch = useCallback((board: Board) => {
    setCurrentBoard(board);
    switchBoard(board.id);
    setIsBoardSelectorOpen(false);
    setShowWelcome(false);
  }, [switchBoard]);

  // 處理記事版創建
  const handleBoardCreate = useCallback((name: string, theme: string, description?: string) => {
    createBoard({ name, theme, description });
  }, [createBoard]);

  // 處理記事版刪除
  const handleBoardDelete = useCallback((boardId: string) => {
    deleteBoard(boardId);
  }, [deleteBoard]);

  // 處理Admin刪除memo
  const handleAdminDeleteMemo = useCallback((memoId: string) => {
    adminDeleteMemo(memoId);
  }, [adminDeleteMemo]);

  // 處理Admin清空所有memo
  const handleAdminClearAll = useCallback(() => {
    if (currentBoard) {
      adminClearAllMemos(currentBoard.id);
    }
  }, [adminClearAllMemos, currentBoard]);

  // 獲取當前記事版的背景主題
  const getBoardTheme = () => {
    if (!currentBoard) return 'from-purple-50 to-pink-50';
    
    const themes = {
      purple: 'from-purple-50 to-pink-50',
      blue: 'from-blue-50 to-cyan-50',
      green: 'from-green-50 to-emerald-50',
      orange: 'from-orange-50 to-red-50',
      pink: 'from-pink-50 to-rose-50',
    };
    
    return themes[currentBoard.theme as keyof typeof themes] || themes.purple;
  };

  // 重新排列memo位置
  useEffect(() => {
    if (currentBoard) {
      const currentBoardMemos = memos.filter(m => m.boardId === currentBoard.id);
      const needsRepositioning = currentBoardMemos.some((memo, index) => {
        const expectedPos = calculateMemoPosition(index);
        return memo.x !== expectedPos.x || memo.y !== expectedPos.y;
      });

      if (needsRepositioning) {
        setMemos(prev => prev.map(memo => {
          if (memo.boardId === currentBoard.id) {
            const index = prev.filter(m => m.boardId === currentBoard.id).indexOf(memo);
            const newPos = calculateMemoPosition(index);
            return { ...memo, x: newPos.x, y: newPos.y };
          }
          return memo;
        }));
      }
    }
  }, [memos.length, currentBoard, calculateMemoPosition]);

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br ${getBoardTheme()}`}
    >
      {/* 歡迎彈窗 */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🏫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                歡迎來到 LPMS LPedia
              </h2>
              <h3 className="text-lg font-medium text-purple-600 mb-4">
                貼文互動空間
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                九龍婦女福利會李炳紀念學校 KWWCLPMS
              </p>
              <p className="text-gray-600 mb-6">
                請選擇一個記事版開始您的互動之旅！
              </p>
              <button
                onClick={() => setIsBoardSelectorOpen(true)}
                className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Layout size={20} />
                <span>選擇記事版</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頂部工具欄 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LPMS LPedia - 貼文互動空間
              </h1>
              <p className="text-xs text-gray-500">九龍婦女福利會李炳紀念學校 KWWCLPMS</p>
            </div>
            
            {/* 記事版信息 */}
            {currentBoard && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsBoardSelectorOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <Layout size={16} />
                  <span className="text-sm font-medium">{currentBoard.name}</span>
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users size={16} />
              <span>{connectedUsers} 位用戶在線</span>
            </div>
            
            {/* Admin 標識 */}
            {isAdmin && (
              <div className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                管理員
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Admin 控制台按鈕 */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Settings size={16} />
                <span>管理控制台</span>
              </button>
            )}
            
            {/* 記事版選擇按鈕 */}
            <button
              onClick={() => setIsBoardSelectorOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Layout size={16} />
              <span>記事版</span>
            </button>
            
            {/* 新增貼文按鈕 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="add-memo-btn flex items-center space-x-2"
              disabled={!currentBoard}
            >
              <Plus size={20} />
              <span>新增貼文</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="pt-32 w-full h-full relative overflow-auto">
        {/* 渲染所有memo - 移除拖拽功能，使用固定排列 */}
        {memos
          .filter(memo => !currentBoard || memo.boardId === currentBoard.id)
          .map((memo) => (
          <MemoCard
            key={memo.id}
            memo={memo}
            onDelete={deleteMemo}
            onUpdatePosition={handleUpdateMemoPosition}
            onUpdateContent={updateMemoContent}
            isOwner={memo.createdBy === currentSocketId}
            isAdmin={isAdmin}
            onAdminDelete={handleAdminDeleteMemo}
            isDraggable={false}
            isLargeSize={true}
          />
        ))}

        {/* 空狀態 */}
        {currentBoard && memos.filter(memo => memo.boardId === currentBoard.id).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                歡迎來到 {currentBoard.name}！
              </h2>
              <p className="text-gray-500 mb-6">
                點擊上方按鈕創建您的第一個貼文
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

        {/* 無記事版狀態 */}
        {!currentBoard && !showWelcome && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                請選擇一個記事版
              </h2>
              <p className="text-gray-500 mb-6">
                點擊上方記事版按鈕來選擇或創建記事版
              </p>
              <button
                onClick={() => setIsBoardSelectorOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Layout size={20} />
                <span>選擇記事版</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 新增貼文模態框 */}
      <AddMemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMemo}
      />

      {/* 記事版選擇器 */}
      <BoardSelector
        isOpen={isBoardSelectorOpen}
        onClose={() => setIsBoardSelectorOpen(false)}
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={handleBoardSwitch}
        onCreateBoard={handleBoardCreate}
        canCreateBoard={isAdmin}
      />

      {/* Admin 控制台 */}
      {isAdmin && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          boards={boards}
          currentBoard={currentBoard}
          memos={currentBoard ? memos.filter(memo => memo.boardId === currentBoard.id) : []}
          onCreateBoard={handleBoardCreate}
          onDeleteBoard={handleBoardDelete}
          onDeleteMemo={handleAdminDeleteMemo}
          onClearAllMemos={handleAdminClearAll}
          connectedUsers={connectedUsers}
        />
      )}

      {/* 說明文字 */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-500">
        <p>📝 貼文會自動排列，每行5張</p>
        <p>✏️ 點擊編輯按鈕修改內容</p>
        <p>🌐 所有變更都會即時同步給其他用戶</p>
        {isAdmin && <p>👑 管理員模式：可以刪除任何貼文和管理記事版</p>}
      </div>
    </div>
  );
};

export default App; 