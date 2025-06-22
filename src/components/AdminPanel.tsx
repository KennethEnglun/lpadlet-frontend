import React, { useState } from 'react';
import { Shield, Plus, Trash2, Settings, Users, Eye, X } from 'lucide-react';
import { Board, Memo } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  currentBoard: Board | null;
  memos: Memo[];
  onCreateBoard: (name: string, theme: string, description?: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onDeleteMemo: (memoId: string) => void;
  onClearAllMemos: () => void;
  connectedUsers: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  boards,
  currentBoard,
  memos,
  onCreateBoard,
  onDeleteBoard,
  onDeleteMemo,
  onClearAllMemos,
  connectedUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'memos' | 'users'>('boards');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardTheme, setNewBoardTheme] = useState('purple');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  if (!isOpen) return null;

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim(), newBoardTheme, newBoardDesc.trim() || undefined);
      setNewBoardName('');
      setNewBoardDesc('');
      setNewBoardTheme('purple');
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('確定要刪除這個記事版嗎？所有相關的備忘錄也會被刪除。')) {
      onDeleteBoard(boardId);
    }
  };

  const handleDeleteMemo = (memoId: string) => {
    if (window.confirm('確定要刪除這個備忘錄嗎？')) {
      onDeleteMemo(memoId);
    }
  };

  const handleClearAllMemos = () => {
    if (window.confirm('確定要清除當前記事版的所有備忘錄嗎？此操作無法撤銷。')) {
      onClearAllMemos();
    }
  };

  const themes = [
    { value: 'purple', name: '紫色主題', color: 'from-purple-50 to-pink-50' },
    { value: 'blue', name: '藍色主題', color: 'from-blue-50 to-cyan-50' },
    { value: 'green', name: '綠色主題', color: 'from-green-50 to-emerald-50' },
    { value: 'orange', name: '橙色主題', color: 'from-orange-50 to-red-50' },
    { value: 'pink', name: '粉色主題', color: 'from-pink-50 to-rose-50' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield size={24} />
              <h2 className="text-2xl font-bold">管理員控制台</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'boards', label: '記事版管理', icon: Settings },
              { key: 'memos', label: '貼文管理', icon: Eye },
              { key: 'users', label: '用戶統計', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          {/* 記事版管理 */}
          {activeTab === 'boards' && (
            <div className="space-y-6">
              {/* 創建新記事版 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">創建新記事版</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      記事版名稱
                    </label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="輸入記事版名稱..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主題
                    </label>
                    <select
                      value={newBoardTheme}
                      onChange={(e) => setNewBoardTheme(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {themes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述（可選）
                    </label>
                    <textarea
                      value={newBoardDesc}
                      onChange={(e) => setNewBoardDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="記事版描述..."
                      rows={3}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateBoard}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>創建記事版</span>
                </button>
              </div>

              {/* 現有記事版列表 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">現有記事版 ({boards.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <div key={board.id} className={`border rounded-lg p-4 shadow-sm ${
                      currentBoard?.id === board.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{board.name}</h4>
                        <div className="flex space-x-1">
                          {currentBoard?.id === board.id && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              當前
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteBoard(board.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {board.description && (
                        <p className="text-sm text-gray-600 mb-2">{board.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        主題: {themes.find(t => t.value === board.theme)?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        創建於: {new Date(board.createdAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  ))}
                </div>
                {boards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>尚無記事版</p>
                    <p className="text-sm">使用上方表單創建第一個記事版</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 貼文管理 */}
          {activeTab === 'memos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  貼文管理 {currentBoard && `- ${currentBoard.name}`} ({memos.length})
                </h3>
                {currentBoard && memos.length > 0 && (
                  <button
                    onClick={handleClearAllMemos}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>清除所有貼文</span>
                  </button>
                )}
              </div>
              
              {!currentBoard ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>請先選擇一個記事版</p>
                </div>
              ) : memos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>當前記事版沒有貼文</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memos.map((memo) => (
                    <div key={memo.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 mb-2 line-clamp-3">
                            {memo.content || '（無內容）'}
                          </p>
                          {memo.image && (
                            <img
                              src={memo.image}
                              alt="Memo attachment"
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="text-red-500 hover:text-red-700 transition-colors ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        創建者: {memo.createdBy.slice(-4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        創建於: {new Date(memo.createdAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 用戶統計 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">用戶統計</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <Users size={32} className="mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">{connectedUsers}</div>
                  <div className="text-sm text-blue-500">在線用戶</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <Settings size={32} className="mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">{boards.length}</div>
                  <div className="text-sm text-green-500">記事版總數</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <Eye size={32} className="mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-600">{memos.length}</div>
                  <div className="text-sm text-purple-500">當前記事版貼文</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">系統信息</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 當前記事版: {currentBoard?.name || '未選擇'}</p>
                  <p>• 管理員權限: 已啟用</p>
                  <p>• 實時同步: 正常運行</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 