const BASE = '/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('club_token');

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('club_token');
    window.location.href = '/login';
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const get  = (path, params) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`${path}${qs}`);
};

export const post   = (path, body)       => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
export const put    = (path, body)       => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) });
export const del    = (path, params)     => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`${path}${qs}`, { method: 'DELETE' });
};
