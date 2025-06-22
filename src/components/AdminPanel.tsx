import React, { useState } from 'react';
import { Shield, Plus, Trash2, Settings, Users, Eye } from 'lucide-react';
import { Board, Memo, User } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  boards: Board[];
  memos: Memo[];
  users: User[];
  onCreateBoard: (name: string, theme: string, description?: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onDeleteMemo: (memoId: string) => void;
  onDeleteAllMemos: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  boards,
  memos,
  users,
  onCreateBoard,
  onDeleteBoard,
  onDeleteMemo,
  onDeleteAllMemos,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'memos' | 'users'>('boards');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardTheme, setNewBoardTheme] = useState('default');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  if (!isOpen || !currentUser.isAdmin) return null;

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim(), newBoardTheme, newBoardDesc.trim());
      setNewBoardName('');
      setNewBoardDesc('');
      setNewBoardTheme('default');
    }
  };

  const themes = [
    { value: 'default', name: '預設主題', color: 'from-purple-50 to-pink-50' },
    { value: 'ocean', name: '海洋主題', color: 'from-blue-50 to-cyan-50' },
    { value: 'forest', name: '森林主題', color: 'from-green-50 to-emerald-50' },
    { value: 'sunset', name: '夕陽主題', color: 'from-orange-50 to-red-50' },
    { value: 'night', name: '夜晚主題', color: 'from-gray-800 to-gray-900' },
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
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'boards', label: '記事版管理', icon: Settings },
              { key: 'memos', label: '貼文管理', icon: Eye },
              { key: 'users', label: '用戶管理', icon: Users },
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
                <h3 className="text-lg font-semibold mb-4">現有記事版</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <div key={board.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{board.name}</h4>
                        <button
                          onClick={() => onDeleteBoard(board.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{board.description}</p>
                      <div className="text-xs text-gray-500">
                        主題: {themes.find(t => t.value === board.theme)?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        創建於: {new Date(board.createdAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 貼文管理 */}
          {activeTab === 'memos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">貼文管理</h3>
                <button
                  onClick={onDeleteAllMemos}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>清除所有貼文</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memos.map((memo) => (
                  <div key={memo.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">
                        ID: {memo.id.slice(-8)}
                      </div>
                      <button
                        onClick={() => onDeleteMemo(memo.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-sm mb-2 line-clamp-3">{memo.content}</div>
                    {memo.image && (
                      <img
                        src={memo.image}
                        alt="Memo"
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <div className="text-xs text-gray-500">
                      創建者: {memo.createdBy.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      位置: ({Math.round(memo.x)}, {Math.round(memo.y)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 用戶管理 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">在線用戶</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{user.name}</div>
                      {user.isAdmin && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          管理員
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user.id.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      加入時間: {new Date(user.joinedAt).toLocaleString('zh-TW')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 