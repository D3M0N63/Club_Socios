import { get, post, put, del } from './client';

export const getEventos  = ()         => get('/eventos');
export const getEvento   = (id)       => get('/eventos', { id });
export const createEvento = (data)    => post('/eventos', data);
export const updateEvento = (id, data) => put(`/eventos?id=${id}`, data);
export const deleteEvento = (id)      => del('/eventos', { id });
