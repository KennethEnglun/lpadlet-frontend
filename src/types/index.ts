export interface Memo {
  id: string;
  content: string;
  image?: string;
  x: number;
  y: number;
  color: string;
  boardId: string;
  createdAt: string;
  createdBy: string;
  userName?: string;
}

export interface UserCursor {
  userId: string;
  x: number;
  y: number;
}

export interface CreateMemoData {
  content: string;
  image?: string;
  x?: number;
  y?: number;
  color?: string;
  boardId: string;
  userName?: string;
}

export interface UpdateMemoPositionData {
  id: string;
  x: number;
  y: number;
}

export interface UpdateMemoContentData {
  id: string;
  content: string;
}

export interface Board {
  id: string;
  name: string;
  theme: string;
  description?: string;
  subjectId: string;
  createdAt: string;
  createdBy: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  joinedAt: Date;
}

export interface AdminAction {
  type: 'DELETE_MEMO' | 'CREATE_BOARD' | 'DELETE_BOARD' | 'UPDATE_BOARD';
  targetId: string;
  data?: any;
}

export interface Comment {
  id: string;
  content: string;
  userName: string;
  userId: string;
  createdAt: string;
  memoId: string;
}

export interface Like {
  id: string;
  userName: string;
  userId: string;
  createdAt: string;
  memoId: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
} 