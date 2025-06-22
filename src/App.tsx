import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Users, Settings, Layout, Monitor, Smartphone, Tablet, ChevronUp, ChevronDown } from 'lucide-react';
import MemoCard from './components/MemoCard';
import AddMemoModal from './components/AddMemoModal';
import AdminPanel from './components/AdminPanel';
import BoardSelector from './components/BoardSelector';
import { useSocket } from './hooks/useSocket';
import { Memo, UserCursor, Board, User } from './types';

// 設備檢測函數
const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  
  // 檢測iOS設備
  if (/iPad/.test(userAgent)) {
    return 'iPad';
  }
  if (/iPhone/.test(userAgent)) {
    return 'iPhone';
  }
  
  // 檢測Android設備
  if (/Android/.test(userAgent)) {
    if (screenWidth > 768) {
      return 'Android Tablet';
    }
    return 'Android Phone';
  }
  
  // 檢測其他移動設備
  if (screenWidth <= 768) {
    return 'Mobile';
  }
  
  // 檢測平板
  if (screenWidth > 768 && screenWidth <= 1024) {
    return 'Tablet';
  }
  
  // 默認為電腦
  return 'Desktop';
};

// 根據設備類型獲取響應式配置
const getResponsiveConfig = (deviceType: string) => {
  switch (deviceType) {
    case 'iPhone':
    case 'Android Phone':
    case 'Mobile':
      return {
        memosPerRow: 2,
        memoWidth: 280,
        memoHeight: 200,
        padding: 10,
        headerHeight: 120,
        fontSize: 'text-sm',
        titleSize: 'text-lg',
        showDeviceIcon: '📱'
      };
    case 'iPad':
    case 'Android Tablet':
    case 'Tablet':
      return {
        memosPerRow: 3,
        memoWidth: 320,
        memoHeight: 220,
        padding: 15,
        headerHeight: 100,
        fontSize: 'text-base',
        titleSize: 'text-xl',
        showDeviceIcon: '📱'
      };
    default: // Desktop
      return {
        memosPerRow: 5,
        memoWidth: 512,
        memoHeight: 256,
        padding: 20,
        headerHeight: 100,
        fontSize: 'text-base',
        titleSize: 'text-2xl',
        showDeviceIcon: '💻'
      };
  }
};

const App: React.FC = () => {
  // 設備檢測
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [responsiveConfig, setResponsiveConfig] = useState(getResponsiveConfig(deviceType));
  
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
  // Header 折疊狀態（行動裝置可收合）
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // 檢查Admin權限和設置歡迎彈窗顯示
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const isAdminUser = adminParam === 'admin123';
    setIsAdmin(isAdminUser);
    
    // Admin用戶不顯示歡迎彈窗
    if (isAdminUser) {
      setShowWelcome(false);
    }
  }, []);

  // 設備變化檢測
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
        setResponsiveConfig(getResponsiveConfig(newDeviceType));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceType]);

  // Socket事件處理器
  const handleMemosReceived = useCallback((receivedMemos: Memo[]) => {
    console.log('Memos received:', receivedMemos.length, receivedMemos);
    setMemos(receivedMemos);
  }, []);

  const handleNewMemo = useCallback((memo: Memo) => {
    console.log('New memo received:', memo);
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
    // Admin用戶可以不自動選擇記事版
    if (receivedBoards.length > 0 && !currentBoard && !isAdmin) {
      // 普通用戶不自動選擇，讓用戶手動選擇
    }
  }, [currentBoard, isAdmin]);

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

  // 計算memo的響應式自動排列位置
  const calculateMemoPosition = useCallback((index: number) => {
    const { memosPerRow, memoWidth, memoHeight, padding, headerHeight } = responsiveConfig;
    
    const row = Math.floor(index / memosPerRow);
    const col = index % memosPerRow;
    
    const x = col * (memoWidth + padding) + padding;
    const y = row * (memoHeight + padding) + padding + headerHeight;
    
    return { x, y };
  }, [responsiveConfig]);

  // 處理memo位置更新（禁用拖拽）
  const handleUpdateMemoPosition = useCallback((id: string, x: number, y: number) => {
    console.log('Position update blocked for memo:', id);
    return;
  }, []);

  // 處理新memo創建
  const handleCreateMemo = useCallback((content: string, image?: string, color?: string, userName?: string) => {
    if (!currentBoard) return;
    
    // 計算當前記事版memo的數量來決定位置
    const currentBoardMemos = memos.filter(m => m.boardId === currentBoard.id);
    const position = calculateMemoPosition(currentBoardMemos.length);
    
    console.log('Creating memo:', { content, boardId: currentBoard.id, position, currentBoardMemos: currentBoardMemos.length });
    
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

  // Admin記事版切換（從控制台）
  const handleAdminBoardSwitch = useCallback((board: Board) => {
    setCurrentBoard(board);
    switchBoard(board.id);
  }, [switchBoard]);

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
      console.log('Memo display check:', {
        totalMemos: memos.length,
        currentBoardId: currentBoard.id,
        currentBoardMemos: currentBoardMemos.length,
        memosData: currentBoardMemos
      });
      
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

  const effectiveHeaderHeight = headerCollapsed ? 48 : responsiveConfig.headerHeight;

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden bg-gradient-to-br ${getBoardTheme()}`}
    >
      {/* 歡迎彈窗 - 只對非Admin用戶顯示 */}
      {showWelcome && !isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🏫</div>
              <h2 className={`font-bold text-gray-800 mb-2 ${responsiveConfig.titleSize}`}>
                歡迎來到 LPMS LPedia
              </h2>
              <h3 className={`font-medium text-purple-600 mb-4 ${responsiveConfig.fontSize}`}>
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
      <div
        className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-purple-200 transition-all duration-300"
        style={{ height: effectiveHeaderHeight }}
      >
        <div className="flex items-center justify-between h-full">
          {/* 折疊控制（僅行動裝置顯示） */}
          {deviceType !== 'Desktop' && (
            <button
              onClick={() => setHeaderCollapsed(!headerCollapsed)}
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow"
            >
              {headerCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <h1 className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${responsiveConfig.titleSize}`}>
                LPMS LPedia - 貼文互動空間
              </h1>
              <p className="text-xs text-gray-500">九龍婦女福利會李炳紀念學校 KWWCLPMS</p>
            </div>
            
            {/* 設備類型顯示 */}
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg">
              <span className="text-sm">{responsiveConfig.showDeviceIcon}</span>
              <span className="text-xs text-gray-600">{deviceType}</span>
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

      {/* 主要內容區域，加上縮放及拖移功能 */}
      <div className="w-full h-full overflow-auto" style={{ paddingTop: effectiveHeaderHeight }}>
        <div className={`w-full relative p-4`} style={{ minHeight: 'calc(100vh - 32px)' }}>
                {/* 渲染所有memo - 移除拖拽功能，使用響應式固定排列 */}
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
                    isLargeSize={deviceType === 'Desktop'}
                    responsiveConfig={responsiveConfig}
                  />
                ))}

                {/* 空狀態 */}
                {currentBoard && memos.filter(memo => memo.boardId === currentBoard.id).length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <h2 className={`font-semibold text-gray-700 mb-2 ${responsiveConfig.titleSize}`}>
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
                      <h2 className={`font-semibold text-gray-700 mb-2 ${responsiveConfig.titleSize}`}>
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
      </div>

      {/* 新增貼文模態框 */}
      <AddMemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMemo}
        responsiveConfig={responsiveConfig}
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
        responsiveConfig={responsiveConfig}
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
          onSwitchBoard={handleAdminBoardSwitch}
          connectedUsers={connectedUsers}
          responsiveConfig={responsiveConfig}
        />
      )}

      {/* 說明文字 */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-500 pointer-events-none">
        <p>📝 貼文會自動排列，每行{responsiveConfig.memosPerRow}張</p>
        <p>✏️ 點擊編輯按鈕修改內容</p>
        <p>🌐 所有變更都會即時同步給其他用戶</p>
        {isAdmin && <p>👑 管理員模式：可以刪除任何貼文和管理記事版</p>}
      </div>
    </div>
  );
};

export default App; 