import { get, post, put, del } from './client';

export const getCuotas       = (params) => get('/cuotas', params);
export const getCuotasSocio  = (socio_id) => get('/cuotas', { socio_id });
export const getCuotasPeriodo = (periodo) => get('/cuotas', { periodo });
export const createCuota     = (data)  => post('/cuotas', data);
export const updateCuota     = (id, data) => put(`/cuotas?id=${id}`, data);
export const deleteCuota     = (id)    => del('/cuotas', { id });
