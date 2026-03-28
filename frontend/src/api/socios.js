import { get, post, put, del } from './client';

export const getSocios  = ()       => get('/socios');
export const getSocio   = (id)     => get('/socios', { id });
export const createSocio = (data)  => post('/socios', data);
export const updateSocio = (id, data) => put(`/socios?id=${id}`, data);
export const deleteSocio = (id)    => del('/socios', { id });
