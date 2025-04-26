import apiClient from './apiClient';

export const obtenerHistorialBusqueda = async (usuarioId: number, limite: number = 10) => {
  const response = await apiClient.get(`/historial/${usuarioId}?limite=${limite}`);
  return response.data;
};

export const guardarBusqueda = async (usuarioId: number, termino: string, filtros?: any) => {
  try {
    const response = await apiClient.post('/historial', {
      usuario_idusuario: usuarioId,
      termino_busqueda: termino,
      filtros: filtros || null
    });
    return response.data;
  } catch (error) {
    console.error("Error saving search:", error);
    throw error;
  }
};

export const autocompletarBusqueda = async (usuarioId: number, texto: string) => {
  try {
    const response = await apiClient.get(`/autocomplete/${usuarioId}?texto=${texto}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return [];
  }
};