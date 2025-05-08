import apiClient from './apiClient';

export async function fetchVehiculosPorFechas(startDate: string, endDate: string) {
  try {
    const response = await apiClient.get(
      `/vehiculosxfechas/vehiculos-disponibles?fechaInicio=${startDate}&fechaFin=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles by date:', error);
    return [];
  }
}
  