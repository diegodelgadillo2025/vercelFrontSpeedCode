import apiClient from './apiClient';

export async function fetchVehiculosPorFechas(startDate: string, endDate: string) {
  try {
    const response = await apiClient.get(`/vehiculos/filtroFechas?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles by date:', error);
    return [];
  }
}
  