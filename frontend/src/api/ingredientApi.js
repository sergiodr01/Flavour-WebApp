import apiClient from './client';

export function fetchIngredients() {
  return apiClient.get('/ingredients').then((res) => res.data);
}
