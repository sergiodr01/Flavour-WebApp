import apiClient from './client';

export function fetchSubmittedFlavors() {
  return apiClient.get('/flavors/submitted').then((res) => res.data);
}

export function approveFlavor(id) {
  return apiClient.post(`/flavors/${id}/approve`).then((res) => res.data);
}

export function rejectFlavor(id) {
  return apiClient.post(`/flavors/${id}/reject`).then((res) => res.data);
}

export function fetchComments(flavorId) {
  return apiClient.get(`/flavors/${flavorId}/comments`).then((res) => res.data);
}

export function addComment(flavorId, text) {
  return apiClient.post(`/flavors/${flavorId}/comments`, { text }).then((res) => res.data);
}
