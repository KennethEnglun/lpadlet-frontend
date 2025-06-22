import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Users, Settings, Layout, Monitor, Smartphone, Tablet, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import MemoCard from './components/MemoCard';
import AddMemoModal from './components/AddMemoModal';
import AdminPanel from './components/AdminPanel';
import BoardSelector from './components/BoardSelector';
import MemoDetailModal from './components/MemoDetailModal';
import { useSocket } from './hooks/useSocket';
import { Memo, UserCursor, Board, User, Comment, Like, Subject } from './types';
import SubjectSelector from './components/SubjectSelector';

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
  // 動態計算每行memo數量基於視窗寬度
  const calculateMemosPerRow = () => {
    const windowWidth = window.innerWidth;
    const memoWidth = deviceType === 'Desktop' ? 320 : deviceType.includes('Tablet') ? 280 : 260;
    const padding = 20;
    const availableWidth = windowWidth - (padding * 4); // 留出邊距
    return Math.max(1, Math.floor(availableWidth / (memoWidth + padding)));
  };

  const memosPerRow = calculateMemosPerRow();
  
  switch (deviceType) {
    case 'iPhone':
    case 'Android Phone':
    case 'Mobile':
      return {
        memosPerRow: memosPerRow,
        memoWidth: 260,
        memoHeight: 180,
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
        memosPerRow: memosPerRow,
        memoWidth: 280,
        memoHeight: 200,
        padding: 15,
        headerHeight: 100,
        fontSize: 'text-base',
        titleSize: 'text-xl',
        showDeviceIcon: '📱'
      };
    default: // Desktop
      return {
        memosPerRow: memosPerRow,
        memoWidth: 320,
        memoHeight: 240,
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
  const [isSubjectSelectorOpen, setIsSubjectSelectorOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // 點讚和評論狀態
  const [memoLikes, setMemoLikes] = useState<Map<string, Like[]>>(new Map());
  const [memoComments, setMemoComments] = useState<Map<string, Comment[]>>(new Map());
  
  // 記事版和用戶狀態
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Header 折疊狀態（行動裝置可收合）
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  // 重置狀態
  const [isResetting, setIsResetting] = useState(false);

  // 科目狀態
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

  // 檢查Admin權限和設置歡迎彈窗顯示
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const isAdminUser = adminParam === 'admin123';
    setIsAdmin(isAdminUser);
    
    // 所有用戶都需要先選擇科目，不自動關閉歡迎彈窗
    // if (isAdminUser) {
    //   setShowWelcome(false);
    // }
  }, []);

  // 設備變化檢測
  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      const newResponsiveConfig = getResponsiveConfig(newDeviceType);
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
        setResponsiveConfig(newResponsiveConfig);
      } else {
        // 即使設備類型相同，也要更新配置以反映視窗大小變化
        setResponsiveConfig(newResponsiveConfig);
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

  // 點讚和評論事件處理器
  const handleLikesReceived = useCallback((memoId: string, likes: Like[]) => {
    setMemoLikes(prev => new Map(prev).set(memoId, likes));
  }, []);

  const handleCommentsReceived = useCallback((memoId: string, comments: Comment[]) => {
    setMemoComments(prev => new Map(prev).set(memoId, comments));
  }, []);

  const handleNewLike = useCallback((like: Like) => {
    setMemoLikes(prev => {
      const newMap = new Map(prev);
      const currentLikes = newMap.get(like.memoId) || [];
      newMap.set(like.memoId, [...currentLikes, like]);
      return newMap;
    });
  }, []);

  const handleNewComment = useCallback((comment: Comment) => {
    setMemoComments(prev => {
      const newMap = new Map(prev);
      const currentComments = newMap.get(comment.memoId) || [];
      newMap.set(comment.memoId, [...currentComments, comment]);
      return newMap;
    });
  }, []);

  // 處理所有點讚數據
  const handleAllLikesReceived = useCallback((likes: Like[]) => {
    const likesMap = new Map<string, Like[]>();
    likes.forEach(like => {
      const currentLikes = likesMap.get(like.memoId) || [];
      likesMap.set(like.memoId, [...currentLikes, like]);
    });
    setMemoLikes(likesMap);
  }, []);

  // 處理所有留言數據
  const handleAllCommentsReceived = useCallback((comments: Comment[]) => {
    const commentsMap = new Map<string, Comment[]>();
    comments.forEach(comment => {
      const currentComments = commentsMap.get(comment.memoId) || [];
      commentsMap.set(comment.memoId, [...currentComments, comment]);
    });
    setMemoComments(commentsMap);
  }, []);

  // 處理科目接收
  const handleSubjectsReceived = useCallback((subjects: Subject[]) => {
    setSubjects(subjects);
    // 當科目數據到達且用戶還未選擇科目時，自動打開科目選擇器
    if (subjects.length > 0 && !currentSubject) {
      setShowWelcome(false);
      setIsSubjectSelectorOpen(true);
    }
  }, [currentSubject]);

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
    likeMemo,
    commentMemo,
    getMemoLikes,
    getMemoComments,
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
    onLikesReceived: handleLikesReceived,
    onCommentsReceived: handleCommentsReceived,
    onNewLike: handleNewLike,
    onNewComment: handleNewComment,
    onAllLikesReceived: handleAllLikesReceived,
    onAllCommentsReceived: handleAllCommentsReceived,
    onSubjectsReceived: handleSubjectsReceived,
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
    
    // 增加更多間距防止重疊
    const horizontalSpacing = memoWidth + (padding * 3); // 增加水平間距
    const verticalSpacing = memoHeight + (padding * 4);  // 增加垂直間距
    
    // 從header下方開始排列，確保不被遮蓋
    const x = col * horizontalSpacing + (padding * 2);
    const y = row * verticalSpacing + headerHeight + (padding * 2);
    
    console.log(`Memo ${index}: row=${row}, col=${col}, x=${x}, y=${y}, spacing=${horizontalSpacing}x${verticalSpacing}, containerWidth=${window.innerWidth}`);
    
    return { x, y };
  }, [responsiveConfig]);

  // 手動重置所有memo位置
  const handleResetPositions = useCallback(() => {
    if (!currentBoard) return;
    
    setIsResetting(true);
    console.log('Starting position reset for board:', currentBoard.name);
    
    setTimeout(() => {
      setMemos(prev => {
        const currentBoardMemosFiltered = prev.filter(m => m.boardId === currentBoard.id);
        const otherBoardMemos = prev.filter(m => m.boardId !== currentBoard.id);
        
        console.log('Current board memos to reposition:', currentBoardMemosFiltered.length);
        
        // 重新排列當前記事版的memo
        const repositionedMemos = currentBoardMemosFiltered
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((memo, index) => {
            const newPos = calculateMemoPosition(index);
            console.log(`Repositioning memo ${memo.id} from (${memo.x}, ${memo.y}) to (${newPos.x}, ${newPos.y})`);
            
            // 同時更新伺服器端的位置
            updateMemoPosition(memo.id, newPos.x, newPos.y);
            
            return { ...memo, x: newPos.x, y: newPos.y };
          });
        
        console.log('Repositioned memos:', repositionedMemos.length);
        setIsResetting(false);
        return [...otherBoardMemos, ...repositionedMemos];
      });
    }, 200);
  }, [currentBoard, calculateMemoPosition, updateMemoPosition]);

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
    if (currentSubject) {
      createBoard({ name, theme, description, subjectId: currentSubject.id });
    }
  }, [createBoard, currentSubject]);

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

  // 處理memo卡片點擊
  const handleMemoCardClick = useCallback((memo: Memo) => {
    setSelectedMemo(memo);
    setIsDetailModalOpen(true);
    // 獲取該memo的點讚和評論
    getMemoLikes(memo.id);
    getMemoComments(memo.id);
  }, [getMemoLikes, getMemoComments]);

  // 處理點讚
  const handleLike = useCallback((memoId: string) => {
    likeMemo(memoId);
  }, [likeMemo]);

  // 處理評論
  const handleComment = useCallback((memoId: string, content: string) => {
    commentMemo(memoId, content);
  }, [commentMemo]);

  // 關閉詳細視圖
  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedMemo(null);
  }, []);

  // 處理科目選擇
  const handleSubjectSelect = useCallback((subject: Subject) => {
    setCurrentSubject(subject);
    setIsSubjectSelectorOpen(false);
    setIsBoardSelectorOpen(true);
  }, []);

  // 返回科目選擇
  const handleBackToSubjects = useCallback(() => {
    setIsBoardSelectorOpen(false);
    setIsSubjectSelectorOpen(true);
    setCurrentSubject(null);
    setCurrentBoard(null);
  }, []);

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

  // 記事版切換時自動重置一次 - 移除自動重置，只保留手動控制
  useEffect(() => {
    if (currentBoard) {
      console.log('Board switched to:', currentBoard.name);
      // 不再自動重置，讓用戶手動控制
    }
  }, [currentBoard]); // 移除對memos.length的依賴

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
            
            {/* 科目和記事版信息 */}
            {currentSubject && currentBoard && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsBoardSelectorOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <span className="text-lg">{currentSubject.icon}</span>
                  <Layout size={16} />
                  <span className="text-sm font-medium">{currentSubject.name} - {currentBoard.name}</span>
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
            
            {/* 科目選擇按鈕 */}
            <button
              onClick={() => setIsSubjectSelectorOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Layout size={16} />
              <span>選擇科目</span>
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
            
            {/* 重置排列按鈕 */}
            <button
              onClick={handleResetPositions}
              disabled={!currentBoard || isResetting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isResetting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              title="重新排列所有貼文"
            >
              <RefreshCw size={16} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? '重置中...' : '重置排列'}</span>
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
                    onCardClick={handleMemoCardClick}
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

                {/* 無科目或記事版狀態 */}
                {(!currentSubject || !currentBoard) && !showWelcome && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📚</div>
                      <h2 className={`font-semibold text-gray-700 mb-2 ${responsiveConfig.titleSize}`}>
                        {!currentSubject ? '請選擇科目' : '請選擇記事版'}
                      </h2>
                      <p className="text-gray-500 mb-6">
                        {!currentSubject ? '點擊上方科目按鈕來選擇科目' : '點擊上方按鈕來選擇記事版'}
                      </p>
                      <button
                        onClick={() => !currentSubject ? setIsSubjectSelectorOpen(true) : setIsBoardSelectorOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Layout size={20} />
                        <span>{!currentSubject ? '選擇科目' : '選擇記事版'}</span>
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

      {/* 科目選擇器 */}
      <SubjectSelector
        isOpen={isSubjectSelectorOpen}
        onClose={() => setIsSubjectSelectorOpen(false)}
        subjects={subjects}
        onSelectSubject={handleSubjectSelect}
        responsiveConfig={responsiveConfig}
      />

      {/* 記事版選擇器 */}
      <BoardSelector
        isOpen={isBoardSelectorOpen}
        onClose={() => setIsBoardSelectorOpen(false)}
        boards={boards}
        currentBoard={currentBoard}
        currentSubject={currentSubject}
        onSelectBoard={handleBoardSwitch}
        onCreateBoard={handleBoardCreate}
        onBackToSubjects={handleBackToSubjects}
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

      {/* 貼文詳細視圖模態框 */}
      {selectedMemo && (
        <MemoDetailModal
          memo={selectedMemo}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          currentUserId={currentSocketId}
          onLike={handleLike}
          onComment={handleComment}
          likes={memoLikes.get(selectedMemo.id) || []}
          comments={memoComments.get(selectedMemo.id) || []}
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