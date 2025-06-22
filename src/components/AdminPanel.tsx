import React, { useState } from 'react';
import { Shield, Plus, Trash2, Settings, Users, Eye, X, ArrowRight } from 'lucide-react';
import { Board, Memo } from '../types';

interface ResponsiveConfig {
  memosPerRow: number;
  memoWidth: number;
  memoHeight: number;
  padding: number;
  headerHeight: number;
  fontSize: string;
  titleSize: string;
  showDeviceIcon: string;
}

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
  onSwitchBoard: (board: Board) => void;
  connectedUsers: number;
  responsiveConfig?: ResponsiveConfig;
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
  onSwitchBoard,
  connectedUsers,
  responsiveConfig,
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
    if (window.confirm('確定要刪除這個記事版嗎？所有相關的貼文也會被刪除。')) {
      onDeleteBoard(boardId);
    }
  };

  const handleDeleteMemo = (memoId: string) => {
    if (window.confirm('確定要刪除這個貼文嗎？')) {
      onDeleteMemo(memoId);
    }
  };

  const handleClearAllMemos = () => {
    if (window.confirm('確定要清除當前記事版的所有貼文嗎？此操作無法撤銷。')) {
      onClearAllMemos();
    }
  };

  const handleSwitchBoard = (board: Board) => {
    onSwitchBoard(board);
  };

  const themes = [
    { value: 'purple', name: '紫色主題', color: 'from-purple-50 to-pink-50' },
    { value: 'blue', name: '藍色主題', color: 'from-blue-50 to-cyan-50' },
    { value: 'green', name: '綠色主題', color: 'from-green-50 to-emerald-50' },
    { value: 'orange', name: '橙色主題', color: 'from-orange-50 to-red-50' },
    { value: 'pink', name: '粉色主題', color: 'from-pink-50 to-rose-50' },
  ];

  // 響應式樣式
  const fontSize = responsiveConfig?.fontSize || 'text-base';
  const titleSize = responsiveConfig?.titleSize || 'text-2xl';
  const modalSize = responsiveConfig?.memoWidth && responsiveConfig.memoWidth < 400 
    ? 'w-full max-w-sm h-[90vh]' 
    : 'w-full max-w-4xl h-[80vh]';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${modalSize}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield size={24} />
              <h2 className={`font-bold ${titleSize}`}>管理員控制台</h2>
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
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${fontSize} ${
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
                <h3 className={`font-semibold mb-4 ${fontSize}`}>創建新記事版</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-medium text-gray-700 mb-2 ${fontSize}`}>
                      記事版名稱
                    </label>
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fontSize}`}
                      placeholder="輸入記事版名稱..."
                    />
                  </div>
                  <div>
                    <label className={`block font-medium text-gray-700 mb-2 ${fontSize}`}>
                      主題
                    </label>
                    <select
                      value={newBoardTheme}
                      onChange={(e) => setNewBoardTheme(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fontSize}`}
                    >
                      {themes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block font-medium text-gray-700 mb-2 ${fontSize}`}>
                      描述（可選）
                    </label>
                    <textarea
                      value={newBoardDesc}
                      onChange={(e) => setNewBoardDesc(e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${fontSize}`}
                      placeholder="記事版描述..."
                      rows={3}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateBoard}
                  className={`mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2 ${fontSize}`}
                >
                  <Plus size={16} />
                  <span>創建記事版</span>
                </button>
              </div>

              {/* 現有記事版列表 */}
              <div>
                <h3 className={`font-semibold mb-4 ${fontSize}`}>現有記事版 ({boards.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <div key={board.id} className={`border rounded-lg p-4 shadow-sm ${
                      currentBoard?.id === board.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${fontSize}`}>{board.name}</h4>
                        <div className="flex space-x-1">
                          {currentBoard?.id === board.id && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              當前
                            </span>
                          )}
                          {currentBoard?.id !== board.id && (
                            <button
                              onClick={() => handleSwitchBoard(board)}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="切換到此記事版"
                            >
                              <ArrowRight size={16} />
                            </button>
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
                        <p className={`text-gray-600 mb-2 ${fontSize}`}>{board.description}</p>
                      )}
                      <div className={`text-gray-500 ${fontSize}`}>
                        <p>主題: {themes.find(t => t.value === board.theme)?.name}</p>
                        <p>創建時間: {new Date(board.createdAt).toLocaleDateString('zh-TW')}</p>
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
                <h3 className={`font-semibold ${fontSize}`}>
                  {currentBoard ? `${currentBoard.name} - 貼文管理` : '請先選擇記事版'}
                </h3>
                {currentBoard && (
                  <button
                    onClick={handleClearAllMemos}
                    className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors ${fontSize}`}
                  >
                    清空所有貼文
                  </button>
                )}
              </div>

              {currentBoard ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memos.map((memo) => (
                    <div key={memo.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${fontSize}`}>
                          {memo.userName || `用戶${memo.createdBy.slice(-4)}`}
                        </span>
                        <button
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {memo.image && (
                        <img
                          src={memo.image}
                          alt="Memo image"
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <p className={`text-gray-800 mb-2 ${fontSize}`}>
                        {memo.content.length > 100 
                          ? `${memo.content.substring(0, 100)}...` 
                          : memo.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(memo.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  ))}
                  {memos.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className={`text-gray-500 ${fontSize}`}>此記事版暫無貼文</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={`text-gray-500 ${fontSize}`}>請先在記事版管理中選擇一個記事版</p>
                </div>
              )}
            </div>
          )}

          {/* 用戶統計 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className={`font-semibold ${fontSize}`}>用戶統計</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="text-blue-500" size={24} />
                    <div>
                      <p className={`font-semibold text-blue-700 ${fontSize}`}>在線用戶</p>
                      <p className={`text-2xl font-bold text-blue-600 ${titleSize}`}>{connectedUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="text-green-500" size={24} />
                    <div>
                      <p className={`font-semibold text-green-700 ${fontSize}`}>記事版總數</p>
                      <p className={`text-2xl font-bold text-green-600 ${titleSize}`}>{boards.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="text-purple-500" size={24} />
                    <div>
                      <p className={`font-semibold text-purple-700 ${fontSize}`}>總貼文數</p>
                      <p className={`text-2xl font-bold text-purple-600 ${titleSize}`}>
                        {boards.reduce((total, board) => {
                          // 這裡需要從所有記事版計算總數，但目前只有當前記事版的數據
                          return total + (currentBoard?.id === board.id ? memos.length : 0);
                        }, 0)}
                      </p>
                    </div>
                  </div>
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