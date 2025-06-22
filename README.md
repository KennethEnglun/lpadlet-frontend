# 🎨 LPadlet Frontend

## 簡介
LPadlet 前端應用，使用React + TypeScript + Tailwind CSS構建的實時協作記事板。

## 本地開發

```bash
# 安裝依賴
npm install

# 開發模式運行
npm run dev

# 構建生產版本
npm run build

# 預覽構建結果
npm run preview
```

## Netlify 部署步驟

### 自動部署（推薦）

1. 將此 `lpadlet-frontend` 資料夾推送到GitHub倉庫
2. 在Netlify中點擊 "New site from Git"
3. 選擇您的GitHub倉庫
4. 配置構建設置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 手動部署

```bash
# 構建項目
npm run build

# 將 dist 資料夾上傳到Netlify
```

## 環境變量配置

在Netlify中設置環境變量：

1. 進入 Site settings → Environment variables
2. 添加變量：
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

## 重要提醒

⚠️ **部署前必須設置後端URL**

在 `src/config.ts` 中，確保 `API_URL` 指向您的Railway後端地址：

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

## 技術棧

- React 18 + TypeScript
- Vite (構建工具)
- Tailwind CSS (樣式)
- Socket.io Client (實時通信)
- React Draggable (拖拽功能) 