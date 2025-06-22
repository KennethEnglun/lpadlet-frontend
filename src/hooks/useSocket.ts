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
      socketRef.current = io(socketUrl);
      
      const socket = socketRef.current;

      // 設置事件監聽器
      socket.on('all-memos', onMemosReceived);
      socket.on('new-memo', onNewMemo);
      socket.on('memo-deleted', onMemoDeleted);
      socket.on('memo-position-updated', onMemoPositionUpdated);
      socket.on('memo-content-updated', onMemoContentUpdated);
      socket.on('user-cursor', onUserCursor);
      socket.on('user-disconnected', onUserDisconnected);
      socket.on('user-count', onUserCountChanged);
      
      // 新增：記事版相關事件
      socket.on('all-boards', onBoardsReceived);
      socket.on('board-created', onBoardCreated);
      socket.on('board-deleted', onBoardDeleted);
      socket.on('user-info', onUserInfo);
      
      // 新增：點讚和評論事件
      if (onLikesReceived) socket.on('memo-likes', onLikesReceived);
      if (onCommentsReceived) socket.on('memo-comments', onCommentsReceived);
      if (onNewLike) socket.on('new-like', onNewLike);
      if (onNewComment) socket.on('new-comment', onNewComment);
    });

    // 清理函數
    return () => {
      if (socketRef.current) {
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
    socketRef.current?.emit('like-memo', memoId);
  }, []);

  const commentMemo = useCallback((memoId: string, content: string) => {
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