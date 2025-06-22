import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Memo, UserCursor, CreateMemoData, UpdateMemoPositionData, UpdateMemoContentData, Board, User, Comment, Like } from '../types';

interface UseSocketProps {
  onMemosReceived: (memos: Memo[]) => void;
  onNewMemo: (memo: Memo) => void;
  onMemoDeleted: (memoId: string) => void;
  onMemoPositionUpdated: (data: UpdateMemoPositionData) => void;
  onMemoContentUpdated: (data: UpdateMemoContentData) => void;
  onUserCursor: (cursor: UserCursor) => void;
  onUserDisconnected: (userId: string) => void;
  onUserCountChanged: (count: number) => void;
  onBoardsReceived: (boards: Board[]) => void;
  onBoardCreated: (board: Board) => void;
  onBoardDeleted: (boardId: string) => void;
  onUserInfo: (user: User) => void;
  onLikesReceived?: (memoId: string, likes: Like[]) => void;
  onCommentsReceived?: (memoId: string, comments: Comment[]) => void;
  onNewLike?: (like: Like) => void;
  onNewComment?: (comment: Comment) => void;
}

interface CreateBoardData {
  name: string;
  theme: string;
  description?: string;
}

export const useSocket = ({
  onMemosReceived,
  onNewMemo,
  onMemoDeleted,
  onMemoPositionUpdated,
  onMemoContentUpdated,
  onUserCursor,
  onUserDisconnected,
  onUserCountChanged,
  onBoardsReceived,
  onBoardCreated,
  onBoardDeleted,
  onUserInfo,
  onLikesReceived,
  onCommentsReceived,
  onNewLike,
  onNewComment,
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 連接到服務器
    import('../config').then(({ default: config }) => {
      // 檢查是否為Admin
      const urlParams = new URLSearchParams(window.location.search);
      const adminParam = urlParams.get('admin');
      const isAdmin = adminParam === 'admin123';
      
      const socketUrl = isAdmin ? `${config.SOCKET_URL}?admin=admin123` : config.SOCKET_URL;
      console.log('🔌 正在連接到Socket服務器:', socketUrl);
      
      // 改進的Socket.io配置
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'], // 支援多種傳輸方式
        timeout: 20000, // 20秒超時
        reconnection: true, // 啟用自動重連
        reconnectionDelay: 1000, // 重連延遲1秒
        reconnectionDelayMax: 5000, // 最大重連延遲5秒
        reconnectionAttempts: 10, // 最多重連10次
        forceNew: false, // 重用現有連接
      });
      
      const socket = socketRef.current;

      // 連接事件
      socket.on('connect', () => {
        console.log('✅ Socket已連接，ID:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket已斷開連接，原因:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('🔥 Socket連接錯誤:', error.message);
        console.error('🔥 錯誤詳情:', error);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket重新連接成功，嘗試次數:', attemptNumber);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 嘗試重新連接，第', attemptNumber, '次');
      });

      socket.on('reconnect_error', (error) => {
        console.error('🔥 重連失敗:', error.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('💀 重連完全失敗，已達最大嘗試次數');
      });

      // 設置事件監聽器
      socket.on('all-memos', (memos) => {
        console.log('📝 收到所有memos:', memos.length);
        onMemosReceived(memos);
      });
      
      socket.on('new-memo', (memo) => {
        console.log('🆕 收到新memo:', memo.id);
        onNewMemo(memo);
      });
      
      socket.on('memo-deleted', (memoId) => {
        console.log('🗑️ memo已刪除:', memoId);
        onMemoDeleted(memoId);
      });
      
      socket.on('memo-position-updated', onMemoPositionUpdated);
      socket.on('memo-content-updated', onMemoContentUpdated);
      socket.on('user-cursor', onUserCursor);
      socket.on('user-disconnected', onUserDisconnected);
      socket.on('user-count', (count) => {
        console.log('👥 用戶數量:', count);
        onUserCountChanged(count);
      });
      
      // 新增：記事版相關事件
      socket.on('all-boards', (boards) => {
        console.log('📋 收到所有記事版:', boards.length);
        onBoardsReceived(boards);
      });
      
      socket.on('board-created', onBoardCreated);
      socket.on('board-deleted', onBoardDeleted);
      socket.on('user-info', (info) => {
        console.log('👤 用戶信息:', info);
        onUserInfo(info);
      });
      
      // 新增：點讚和評論事件
      if (onLikesReceived) {
        socket.on('memo-likes', (memoId, likes) => {
          console.log(`❤️ 收到memo ${memoId} 的點讚:`, likes.length);
          onLikesReceived(memoId, likes);
        });
      }
      
      if (onCommentsReceived) {
        socket.on('memo-comments', (memoId, comments) => {
          console.log(`💬 收到memo ${memoId} 的評論:`, comments.length);
          onCommentsReceived(memoId, comments);
        });
      }
      
      if (onNewLike) {
        socket.on('new-like', (like) => {
          console.log('🆕❤️ 收到新點讚:', like);
          onNewLike(like);
        });
      }
      
      if (onNewComment) {
        socket.on('new-comment', (comment) => {
          console.log('🆕💬 收到新評論:', comment);
          onNewComment(comment);
        });
      }

      // 錯誤處理
      socket.on('error', (error) => {
        console.error('🔥 Socket錯誤:', error);
      });
    });

    // 清理函數
    return () => {
      if (socketRef.current) {
        console.log('🔌 正在斷開Socket連接');
        // 移除所有事件監聽器
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_attempt');
        socketRef.current.off('reconnect_error');
        socketRef.current.off('reconnect_failed');
        socketRef.current.disconnect();
      }
    };
  }, [
    onMemosReceived,
    onNewMemo,
    onMemoDeleted,
    onMemoPositionUpdated,
    onMemoContentUpdated,
    onUserCursor,
    onUserDisconnected,
    onUserCountChanged,
    onBoardsReceived,
    onBoardCreated,
    onBoardDeleted,
    onUserInfo,
    onLikesReceived,
    onCommentsReceived,
    onNewLike,
    onNewComment,
  ]);

  // Socket 操作方法
  const createMemo = useCallback((memoData: CreateMemoData) => {
    socketRef.current?.emit('create-memo', memoData);
  }, []);

  const updateMemoPosition = useCallback((id: string, x: number, y: number) => {
    socketRef.current?.emit('update-memo-position', { id, x, y });
  }, []);

  const updateMemoContent = useCallback((id: string, content: string) => {
    socketRef.current?.emit('update-memo-content', { id, content });
  }, []);

  const deleteMemo = useCallback((memoId: string) => {
    socketRef.current?.emit('delete-memo', memoId);
  }, []);

  const sendCursorMove = useCallback((x: number, y: number) => {
    socketRef.current?.emit('cursor-move', { x, y });
  }, []);

  // 新增：記事版相關方法
  const createBoard = useCallback((boardData: CreateBoardData) => {
    socketRef.current?.emit('create-board', boardData);
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    socketRef.current?.emit('delete-board', boardId);
  }, []);

  const switchBoard = useCallback((boardId: string) => {
    socketRef.current?.emit('switch-board', boardId);
  }, []);

  // 新增：Admin方法
  const adminDeleteMemo = useCallback((memoId: string) => {
    socketRef.current?.emit('admin-delete-memo', memoId);
  }, []);

  const adminClearAllMemos = useCallback((boardId: string) => {
    socketRef.current?.emit('admin-clear-all-memos', boardId);
  }, []);

  // 新增：點讚和評論方法
  const likeMemo = useCallback((memoId: string) => {
    console.log('Socket發送like-memo事件，memo ID:', memoId);
    socketRef.current?.emit('like-memo', memoId);
  }, []);

  const commentMemo = useCallback((memoId: string, content: string) => {
    console.log('Socket發送comment-memo事件，memo ID:', memoId, '內容:', content);
    socketRef.current?.emit('comment-memo', { memoId, content });
  }, []);

  const getMemoLikes = useCallback((memoId: string) => {
    socketRef.current?.emit('get-memo-likes', memoId);
  }, []);

  const getMemoComments = useCallback((memoId: string) => {
    socketRef.current?.emit('get-memo-comments', memoId);
  }, []);

  return {
    createMemo,
    updateMemoPosition,
    updateMemoContent,
    deleteMemo,
    sendCursorMove,
    createBoard,
    deleteBoard,
    switchBoard,
    adminDeleteMemo,
    adminClearAllMemos,
    likeMemo,
    commentMemo,
    getMemoLikes,
    getMemoComments,
    socket: socketRef.current,
  };
}; 