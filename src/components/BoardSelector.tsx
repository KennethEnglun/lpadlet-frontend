import React, { useState } from 'react';
import { ChevronDown, Globe, Lock, Plus, X, Trash2, ArrowLeft } from 'lucide-react';
import { Board, Subject } from '../types';

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

interface BoardSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  currentBoard: Board | null;
  currentSubject: Subject | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (name: string, theme: string, description?: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  onBackToSubjects: () => void;
  canCreateBoard: boolean;
  responsiveConfig: any;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({
  isOpen,
  onClose,
  boards,
  currentBoard,
  currentSubject,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onBackToSubjects,
  canCreateBoard,
  responsiveConfig
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [newBoardTheme, setNewBoardTheme] = useState('default');

  // 過濾當前科目的記事版
  const subjectBoards = boards.filter(board => board.subjectId === currentSubject?.id);

  const getThemeGradient = (theme: string) => {
    const themes: Record<string, string> = {
      purple: 'from-purple-50 to-pink-50',
      blue: 'from-blue-50 to-cyan-50',
      green: 'from-green-50 to-emerald-50',
      orange: 'from-orange-50 to-red-50',
      pink: 'from-pink-50 to-rose-50',
    };
    return themes[theme] || themes.purple;
  };

  const getThemeColors = (theme: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    };
    return colors[theme] || colors.purple;
  };

  const handleCreateBoard = () => {
    if (newBoardName.trim() && currentSubject) {
      onCreateBoard(newBoardName.trim(), newBoardTheme, newBoardDescription.trim());
      setNewBoardName('');
      setNewBoardDescription('');
      setNewBoardTheme('default');
      setShowCreateForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToSubjects}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
              <h2 className={`font-bold text-gray-800 ${responsiveConfig.titleSize}`}>
                {currentSubject?.icon} {currentSubject?.name} - 記事版
              </h2>
              <p className="text-sm text-gray-500">選擇或創建記事版</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Create Board Form */}
          {showCreateForm && canCreateBoard && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className={`font-medium text-gray-800 mb-3 ${responsiveConfig.fontSize}`}>創建新記事版</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="記事版名稱"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${responsiveConfig.fontSize}`}
                />
                <input
                  type="text"
                  placeholder="描述（可選）"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${responsiveConfig.fontSize}`}
                />
                <div>
                  <label className={`block font-medium text-gray-700 mb-2 ${responsiveConfig.fontSize}`}>主題色彩</label>
                  <div className="flex space-x-2">
                    {['purple', 'blue', 'green', 'orange', 'pink'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setNewBoardTheme(theme)}
                        className={`w-8 h-8 rounded-full ${getThemeColors(theme).bg} ${
                          newBoardTheme === theme ? 'ring-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateBoard}
                    className={`flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${responsiveConfig.fontSize}`}
                  >
                    創建
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className={`flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors ${responsiveConfig.fontSize}`}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Board List */}
          <div className="p-4">
            {/* Create Board Button */}
            {canCreateBoard && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className={`w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors mb-4 flex items-center justify-center space-x-2 ${responsiveConfig.fontSize}`}
              >
                <Plus size={20} className="text-gray-500" />
                <span className="text-gray-600">創建新記事版</span>
              </button>
            )}

            <div className="space-y-2">
              {subjectBoards.map((board) => {
                const themeColors = getThemeColors(board.theme);
                return (
                  <button
                    key={board.id}
                    onClick={() => onSelectBoard(board)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      currentBoard?.id === board.id
                        ? `${themeColors.border} ${themeColors.bg}`
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded ${themeColors.bg}`}
                        />
                        <span className={`font-medium text-gray-800 ${responsiveConfig.fontSize}`}>{board.name}</span>
                        {board.isPublic ? (
                          <Globe size={14} className="text-gray-500" />
                        ) : (
                          <Lock size={14} className="text-gray-500" />
                        )}
                      </div>
                      {currentBoard?.id === board.id && (
                        <div className={`text-xs px-2 py-1 rounded ${themeColors.bg} ${themeColors.text}`}>
                          當前
                        </div>
                      )}
                    </div>
                    {board.description && (
                      <p className={`text-gray-600 mb-2 ${responsiveConfig.fontSize}`}>{board.description}</p>
                    )}
                    <div className={`flex items-center justify-between text-xs text-gray-500`}>
                      <span>主題: {getThemeName(board.theme)}</span>
                      <span>{new Date(board.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {subjectBoards.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                <p className={responsiveConfig.fontSize}>尚無可用的記事版</p>
                {canCreateBoard ? (
                  <p className="text-sm">點擊上方按鈕創建記事版</p>
                ) : (
                  <p className="text-sm">請聯繫管理員創建記事版</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getThemeName = (theme: string) => {
  const names: Record<string, string> = {
    purple: '紫色',
    blue: '藍色',
    green: '綠色',
    orange: '橙色',
    pink: '粉色',
  };
  return names[theme] || '紫色';
};

export default BoardSelector; 