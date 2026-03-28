import { get, post, del } from './client';

export const getAsistencia    = (params) => get('/asistencia', params);
export const createAsistencia = (data)   => post('/asistencia', data);
export const deleteAsistencia = (id)     => del('/asistencia', { id });
