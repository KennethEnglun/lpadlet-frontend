export interface Memo {
  id: string;
  content: string;
  image?: string;
  x: number;
  y: number;
  color: string;
  createdAt: Date;
  createdBy: string;
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