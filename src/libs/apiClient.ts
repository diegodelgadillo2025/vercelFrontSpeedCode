import axios from 'axios';

const apiClient = axios.create({ 
  baseURL: 'https://vercel-back-speed-code-vercel.app', 
  headers: { 
    'Content-Type': 'application/json'
  }
});

export default apiClient;