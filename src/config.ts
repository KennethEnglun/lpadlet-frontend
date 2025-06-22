// 配置文件 - 管理不同環境的API端點
const config = {
  development: {
    API_URL: 'http://localhost:5000',
    SOCKET_URL: 'http://localhost:5000'
  },
  production: {
    // Railway後端URL - 使用原來的URL
    API_URL: 'https://lpadlet.up.railway.app',
    SOCKET_URL: 'https://lpadlet.up.railway.app'
  }
};

// 嘗試多個可能的URL
const possibleUrls = [
  'https://lpadlet-backend-production.up.railway.app',
  'https://lpadlet.up.railway.app', 
  'https://web-production-4a1c.up.railway.app',
  'https://backend-production.up.railway.app'
];

const currentConfig = config['production'] || config.development;

export default currentConfig; 