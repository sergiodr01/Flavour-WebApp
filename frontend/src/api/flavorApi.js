import apiClient from './client';

export function fetchMyFlavors() {
  return apiClient.get('/flavors').then((res) => res.data);
}

export function fetchFlavorById(id) {
  return apiClient.get(`/flavors/${id}`).then((res) => res.data);
}

export function createFlavor(payload) {
  return apiClient.post('/flavors', payload).then((res) => res.data);
}

export function editFlavor(id, payload) {
  return apiClient.put(`/flavors/${id}`, payload).then((res) => res.data);
}

export function submitFlavor(id) {
  return apiClient.post(`/flavors/${id}/submit`).then((res) => res.data);
}
