import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'https://food-api-production-5ac0.up.railway.app'; // Forced Railway URL for stability

const api = axios.create({
    baseURL: API_BASE_URL
});

const socket = io(API_BASE_URL);

export { api, socket, API_BASE_URL };
