import React, { useState, useRef } from 'react';
import { X, Upload, Palette, User } from 'lucide-react';

interface AddMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, image?: string, color?: string, userName?: string) => void;
}

const COLORS = [
  '#FFE4B5', // 淡橙色
  '#E0F6FF', // 淡藍色
  '#F0FFF0', // 淡綠色
  '#FFE4E1', // 淡粉色
  '#F5DEB3', // 小麥色
  '#E6E6FA', // 淡紫色
  '#FFFACD', // 淡黃色
  '#F0F8FF', // 愛麗絲藍
];

const AddMemoModal: React.FC<AddMemoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [image, setImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, image || undefined, selectedColor, userName.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setContent('');
    setUserName('');
    setImage('');
    setSelectedColor(COLORS[0]);
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const config = await import('../config').then(m => m.default);
      const response = await fetch(`${config.API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImage(`${config.API_URL}${data.imageUrl}`);
      } else {
        alert('圖片上傳失敗');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('圖片上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">新增貼文</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用戶名稱輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              您的名稱 (選填)
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="輸入您的名稱..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              如果不填寫，將顯示為匿名用戶
            </p>
          </div>

          {/* 內容輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              貼文內容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="輸入您的貼文內容..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* 圖片上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖片 (選填)
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload size={16} />
                <span>{isUploading ? '上傳中...' : '選擇圖片'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {image && (
              <div className="mt-2">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* 顏色選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette size={16} className="inline mr-1" />
              背景顏色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`color-picker-btn ${
                    selectedColor === color ? 'ring-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 按鈕 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isUploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              發布貼文
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoModal; 