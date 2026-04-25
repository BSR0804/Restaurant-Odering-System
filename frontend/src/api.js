import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kc-restaurant-api.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

// Socket.io with polling-first transport to ensure it works on any mobile network
const socket = io(API_BASE_URL, {
    transports: ['polling', 'websocket'], // Important for mobile carriers that block WS
    reconnectionAttempts: 8,
    reconnectionDelay: 2000,
    timeout: 15000
});

export { api, socket, API_BASE_URL };
