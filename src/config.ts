// 配置文件 - 管理不同環境的API端點
const config = {
  development: {
    API_URL: 'http://localhost:5000',
    SOCKET_URL: 'http://localhost:5000'
  },
  production: {
    // 部署後請修改為您的實際後端URL
    API_URL: import.meta.env.VITE_API_URL || 'https://your-backend-app.railway.app',
    SOCKET_URL: import.meta.env.VITE_API_URL || 'https://your-backend-app.railway.app'
  }
};

const currentConfig = config[import.meta.env.MODE as keyof typeof config] || config.development;

export default currentConfig; 