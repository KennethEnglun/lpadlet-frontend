import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Memo, UserCursor, CreateMemoData, UpdateMemoPositionData, UpdateMemoContentData } from '../types';

interface UseSocketProps {
  onMemosReceived: (memos: Memo[]) => void;
  onNewMemo: (memo: Memo) => void;
  onMemoDeleted: (memoId: string) => void;
  onMemoPositionUpdated: (data: UpdateMemoPositionData) => void;
  onMemoContentUpdated: (data: UpdateMemoContentData) => void;
  onUserCursor: (cursor: UserCursor) => void;
  onUserDisconnected: (userId: string) => void;
  onUserCountChanged: (count: number) => void;
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
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 連接到服務器
    import('../config').then(({ default: config }) => {
      socketRef.current = io(config.SOCKET_URL);
      
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
  ]);

  // Socket 操作方法
  const createMemo = useCallback((memoData: CreateMemoData) => {
    socketRef.current?.emit('create-memo', memoData);
  }, []);

  const updateMemoPosition = useCallback((data: UpdateMemoPositionData) => {
    socketRef.current?.emit('update-memo-position', data);
  }, []);

  const updateMemoContent = useCallback((data: UpdateMemoContentData) => {
    socketRef.current?.emit('update-memo-content', data);
  }, []);

  const deleteMemo = useCallback((memoId: string) => {
    socketRef.current?.emit('delete-memo', memoId);
  }, []);

  const sendCursorMove = useCallback((x: number, y: number) => {
    socketRef.current?.emit('cursor-move', { x, y });
  }, []);

  return {
    createMemo,
    updateMemoPosition,
    updateMemoContent,
    deleteMemo,
    sendCursorMove,
    socket: socketRef.current,
  };
}; 