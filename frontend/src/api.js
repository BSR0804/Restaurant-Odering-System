import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'https://food-api-production-5ac0.up.railway.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000
});

// Socket.io with WebSocket + polling fallback for mobile carrier compatibility
const socket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000
});

export { api, socket, API_BASE_URL };
