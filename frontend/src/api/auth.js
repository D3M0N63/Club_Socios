import { post, get } from './client';

export const login = (email, password) => post('/auth/login', { email, password });
export const me    = ()                => get('/auth/me');
export const setup = (data)            => post('/auth/setup', data);
