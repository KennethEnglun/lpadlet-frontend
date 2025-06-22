import React from 'react';
import { ChevronDown, Globe, Lock } from 'lucide-react';
import { Board } from '../types';

interface BoardSelectorProps {
  boards: Board[];
  currentBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  currentBoard,
  onSelectBoard,
  isOpen,
  onToggle,
}) => {
  const getThemeGradient = (theme: string) => {
    const themes: Record<string, string> = {
      default: 'from-purple-50 to-pink-50',
      ocean: 'from-blue-50 to-cyan-50',
      forest: 'from-green-50 to-emerald-50',
      sunset: 'from-orange-50 to-red-50',
      night: 'from-gray-800 to-gray-900',
    };
    return themes[theme] || themes.default;
  };

  const getThemeColors = (theme: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      default: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      ocean: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      forest: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      sunset: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      night: { bg: 'bg-gray-700', text: 'text-gray-100', border: 'border-gray-600' },
    };
    return colors[theme] || colors.default;
  };

  return (
    <div className="relative">
      {/* 當前選中的記事版 */}
      <button
        onClick={onToggle}
        className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-lg px-4 py-2 hover:bg-white/95 transition-colors"
      >
        {currentBoard ? (
          <>
            <div
              className={`w-4 h-4 rounded ${getThemeColors(currentBoard.theme).bg}`}
            />
            <span className="font-medium">{currentBoard.name}</span>
            {currentBoard.isPublic ? (
              <Globe size={16} className="text-gray-500" />
            ) : (
              <Lock size={16} className="text-gray-500" />
            )}
          </>
        ) : (
          <span className="text-gray-500">選擇記事版</span>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">選擇記事版</h3>
            <div className="space-y-2">
              {boards.map((board) => {
                const themeColors = getThemeColors(board.theme);
                return (
                  <button
                    key={board.id}
                    onClick={() => {
                      onSelectBoard(board);
                      onToggle();
                    }}
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
                        <span className="font-medium text-gray-800">{board.name}</span>
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
                      <p className="text-sm text-gray-600 mb-2">{board.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>主題: {getThemeName(board.theme)}</span>
                      <span>{new Date(board.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {boards.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                <p>尚無可用的記事版</p>
                <p className="text-sm">請聯繫管理員創建記事版</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getThemeName = (theme: string) => {
  const names: Record<string, string> = {
    default: '預設',
    ocean: '海洋',
    forest: '森林',
    sunset: '夕陽',
    night: '夜晚',
  };
  return names[theme] || '預設';
};

export default BoardSelector; 