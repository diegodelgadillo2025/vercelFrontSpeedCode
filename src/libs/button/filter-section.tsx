"use client"

import dynamic from "next/dynamic";
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { obtenerHistorialBusqueda, guardarBusqueda, autocompletarBusqueda } from '@/libs/historialBusqueda';
import dayjs from 'dayjs'
import 'dayjs/locale/es' // Import Spanish locale
import { fetchVehiculosPorFechas } from '../filtroFechas';
import FiltroAeropuerto from "@/app/components/filtroBusqueda/filtroAeropuerto";


dayjs.locale('es') // Use Spanish locale

interface FilterSectionProps {
  windowWidth: number;
  onFilter: (vehicles: any[]) => void;
}

const MapaFiltro = dynamic(() => import('@/app/components/filtroBusqueda/filtroMapaPrecio'), {
  ssr: false,
  loading: () => <p>Cargando mapa...</p>
})

const FilterSection: React.FC<FilterSectionProps> = ({ windowWidth, onFilter }) => {
  // Estado para el historial de búsquedas
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(10); // Distancia por defecto 10km
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [gpsVehicles, setGpsVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fetchGPSVehicles = async (lat: number, lng: number, dkm: number) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://vercel-back-speed-code.vercel.app/vehiculosxgps/distancia/${lat}/${lng}/${dkm}`
      );
      const data = await response.json();
      console.log("[DEBUG] Datos recibidos del backend:", data);

      // Transformar datos para incluir campo ubicacion
      const vehiclesWithLocation = Array.isArray(data)
        ? data.map(item => ({
            ...item,
            ubicacion: { latitud: item.latitud, longitud: item.longitud }
          }))
        : [{
            ...data,
            ubicacion: { latitud: data.latitud, longitud: data.longitud }
          }];

      onFilter(vehiclesWithLocation);
    } catch (error) {
      console.error("[ERROR] Fetch error:", error);
      setError("Error al cargar vehículos");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejador del botón Filtrar
  const handleFilterClick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("[DEBUG] Coordenadas obtenidas:", latitude, longitude); // Log de coordenadas
        fetchGPSVehicles(latitude, longitude, selectedDistance);
      },
      (error) => {
        console.error("[ERROR] Geolocalización fallida:", error.message);
        alert("No se pudo obtener tu ubicación. Asegúrate de permitir el acceso.");
      }
    );
  };
  // Load initial visible history
  useEffect(() => {
    const stored = localStorage.getItem("searchHistory");
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);
  //estilos del slider del filtro 2 "GPS"
  const distanceSliderStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    width: windowWidth < 768 ? '100%' : '300px',
  }
  
  // Updated autocomplete effect
  useEffect(() => {
    const storedMemory = JSON.parse(localStorage.getItem("searchMemory") || "[]");
    const input = searchTerm.toLowerCase().trim();

    if (!input) {
      const recentTerms = storedMemory.slice(0, 5);
      setSearchHistory(recentTerms);
      return;
    }

    const filtered = storedMemory
      .filter((term: string) => term.includes(input))
      .slice(0, 5);
    setSearchHistory(filtered);
  }, [searchTerm]);

  // Combined click outside and escape key handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Add this function to handle history updates
  const updateVisibleHistory = (fullHistory: string[]) => {
    const limitedHistory = fullHistory.slice(0, 5);
    setSearchHistory(limitedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(limitedHistory));
  };

  // Updated clearHistory function
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.setItem("searchHistory", JSON.stringify([]));
    localStorage.setItem("searchMemory", JSON.stringify([]));
  };

  // Función para manejar la búsqueda
  const handleSearch = async () => {
    const lowerTerm = searchTerm.toLowerCase().trim();
    if (!lowerTerm) return;

    // Visual history
    const existingHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const newHistory = [lowerTerm, ...existingHistory.filter((item: string) => item !== lowerTerm)];
    const limitedHistory = newHistory.slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(limitedHistory));
    setSearchHistory(limitedHistory);

    // Persistent memory
    const existingMemory = JSON.parse(localStorage.getItem("searchMemory") || "[]");
    const updatedMemory = Array.from(new Set([lowerTerm, ...existingMemory]));
    localStorage.setItem("searchMemory", JSON.stringify(updatedMemory));

    setSearchTerm(lowerTerm);
    setShowHistory(false);

    try {
      await guardarBusqueda(5, lowerTerm);
      console.log("Search saved to backend:", lowerTerm);
    } catch (error) {
      console.error("Failed to save search to backend:", error);
    }

    console.log("Searching for:", lowerTerm);
  };

  const getFormattedDateRange = () => {
    if (!startDate || !endDate) return "Fechas"
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    return `${start.format('D MMM')} - ${end.format('D MMM')}`.toLowerCase()
  }

  const generateCalendarDays = (month: dayjs.Dayjs) => {
    const start = month.startOf('month').startOf('week')
    const end = month.endOf('month').endOf('week')
    const days = []
    let day = start

    while (day.isBefore(end)) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }

  // Add new state for filtered vehicles
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  // Update the fetch function to use the imported one
  const fetchVehiclesByDateRange = async (start: Date, end: Date) => {
    try {
      const startStr = dayjs(start).format('YYYY-MM-DD');
      const endStr = dayjs(end).format('YYYY-MM-DD');
      const data = await fetchVehiculosPorFechas(startStr, endStr);
      setFilteredVehicles(data);
      console.log('Filtered vehicles:', data);
    } catch (error) {
      console.error('Error fetching vehicles by date:', error);
    }
  };

  // Update handleDateClick to trigger the fetch when both dates are selected
  const handleDateClick = (date: dayjs.Dayjs) => {
    if (date.isBefore(dayjs().startOf('day'))) {
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date.toDate());
      setEndDate(null);
      setShowDateError(false);
    } else {
      const maxEndDate = dayjs(startDate).add(12, 'months');
      if (date.isAfter(maxEndDate)) {
        setShowDateError(true);
        setTimeout(() => setShowDateError(false), 3000);
        return;
      }
      
      if (date.isBefore(startDate)) {
        setStartDate(date.toDate());
        setEndDate(null);
      } else {
        setEndDate(date.toDate());
        setShowDateError(false);
        // Fetch vehicles when both dates are set
        fetchVehiclesByDateRange(startDate, date.toDate());
      }
    }
  };

  const isDateDisabled = (date: dayjs.Dayjs) => {
    // Disable past dates
    if (date.isBefore(dayjs().startOf('day'))) {
      return true;
    }

    // If start date is selected, disable dates more than 12 months ahead
    if (startDate && !endDate) {
      const maxDate = dayjs(startDate).add(12, 'months');
      return date.isAfter(maxDate);
    }

    return false;
  };

  const isDateInRange = (date: dayjs.Dayjs) => {
    if (!startDate || !endDate) return false
    return date.isAfter(dayjs(startDate).startOf('day')) &&
      date.isBefore(dayjs(endDate).endOf('day'))
  }

  const clearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the calendar
    setStartDate(null)
    setEndDate(null)
    setShowDatePicker(false)
  }

  // Estilos
  const containerStyles: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "20px",
    margin: "20px auto",
    width: windowWidth < 768 ? "90%" : "80%",
    maxWidth: "1200px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: windowWidth < 1024 ? "column" : "row",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    justifyContent: "space-between",
  }

  const searchContainerStyles: React.CSSProperties = {
    display: "flex",
    width: windowWidth < 1024 ? "100%" : "30%",
    minWidth: windowWidth < 1024 ? "auto" : "300px",
    position: "relative", // Para posicionar el historial
  }

  const searchInputStyles: React.CSSProperties = {
    flex: 1,
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px 0 0 4px",
    outline: "none",
  }

  const searchButtonStyles: React.CSSProperties = {
    backgroundColor: "#FF6B00",
    color: "white",
    border: "none",
    borderRadius: "0 4px 4px 0",
    padding: "0 20px",
    fontSize: "18px",
    cursor: "pointer",
  }

  // Estilos para el historial de búsquedas
  const historyContainerStyles: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "0 0 4px 4px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    display: showHistory ? "block" : "none",
  }

  const historyItemStyles: React.CSSProperties = {
    padding: "10px 15px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const historyTextStyles: React.CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: "1",
    marginRight: "10px",
  }

  const deleteButtonStyles: React.CSSProperties = {
    color: "#999",
    fontSize: "12px",
    flexShrink: 0,
  }

  const historyItemHoverStyles: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
  }

  const historyClearButtonStyles: React.CSSProperties = {
    padding: "10px 15px",
    backgroundColor: "#f8f8f8",
    color: "#FF6B00",
    border: "none",
    borderTop: "1px solid #eee",
    width: "100%",
    textAlign: "center",
    cursor: "pointer",
    fontSize: "14px",
  }

  const filtersContainerStyles: React.CSSProperties = {
    display: "flex",
    flexWrap: windowWidth < 1024 ? "wrap" : "nowrap",
    gap: "10px",
    width: windowWidth < 1024 ? "100%" : "calc(60% - 100px)",
    flexGrow: 1,
  }

  const selectStyles: React.CSSProperties = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    flex: "1",
    minWidth: windowWidth < 1024 ? "45%" : "0",
  }

  const filterButtonStyles: React.CSSProperties = {
    backgroundColor: "#FF6B00",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "12px 20px",
    fontSize: "16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    width: windowWidth < 1024 ? "100%" : "auto",
    alignSelf: "flex-end",
    marginTop: windowWidth < 1024 ? "10px" : "0",
    transition: "background-color 0.2s ease",
  }

  const historyItemContentStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flex: 1,
    overflow: "hidden",
  }

  const datePickerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '16px',
    zIndex: 1000,
    width: windowWidth < 768 ? '100%' : '600px',
  }

  const dateButtonStyles: React.CSSProperties = {
    ...selectStyles,
    cursor: 'pointer',
    backgroundColor: startDate ? '#FF6B00' : showDatePicker ? '#f3f4f6' : 'white',
    color: startDate ? 'white' : 'black',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    position: 'relative',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    width: '100%',
  }

  const clearButtonStyles: React.CSSProperties = {
    marginLeft: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0 4px',
    fontSize: '16px',
    color: startDate ? 'white' : '#666',
    display: 'flex',
    alignItems: 'center',
  }

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showHistory || searchHistory.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev >= searchHistory.length - 1 ? 0 : prev + 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev <= 0 ? searchHistory.length - 1 : prev - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          setSearchTerm(searchHistory[highlightedIndex]);
          setShowHistory(false);
          handleSearch();
        }
        break;
      case 'Escape':
        setShowHistory(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Update the button click handler
  const toggleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCalendar(prev => !prev);
  };

  return (
    <div style={containerStyles}>
      <div style={searchContainerStyles}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar vehículos..."
          style={searchInputStyles}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyNavigation}
          onFocus={() => {
            setShowHistory(true);
            setHighlightedIndex(-1);
            const storedMemory = JSON.parse(localStorage.getItem("searchMemory") || "[]");
            setSearchHistory(storedMemory.slice(0, 5));
          }}
        />
        <button style={searchButtonStyles} onClick={handleSearch}>
          →
        </button>

        {/* Updated history container */}
        <div
          ref={historyRef}
          style={{ ...historyContainerStyles, display: showHistory ? "block" : "none" }}
        >
          {searchHistory.length > 0 ? (
            <>
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  style={{
                    ...historyItemStyles,
                    backgroundColor: index === highlightedIndex ? "#f5f5f5" : "transparent",
                  }}
                  onClick={() => {
                    setSearchTerm(item);
                    setShowHistory(false);
                  }}
                  onMouseEnter={(e) => {
                    setHighlightedIndex(index);
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    if (index === highlightedIndex) return;
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <div style={historyItemContentStyles}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      style={{ marginRight: "8px", color: "#888" }}
                    >
                      <path d="M8 3.5a.5.5 0 0 1 .5.5v4h2a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z" />
                    </svg>
                    <span style={historyTextStyles}>{item}</span>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      // Obtenga el historial completo
                      const fullHistory = JSON.parse(localStorage.getItem("searchMemory") || "[]");
                      // Eliminar el elemento eliminado del historial completo
                      const updatedFullHistory = fullHistory.filter((item: string) => item !== searchHistory[index]);
                      // Actualizar searchMemory con el historial filtrado
                      localStorage.setItem("searchMemory", JSON.stringify(updatedFullHistory));
                      // Actualizar el historial visible con los siguientes 5 elementos
                      updateVisibleHistory(updatedFullHistory);
                    }}
                    style={deleteButtonStyles}
                  >
                    ✕
                  </span>
                </div>
              ))}
              <button
                style={historyClearButtonStyles}
                onClick={clearHistory}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f8f8"
                }}
              >
                Eliminar historial de búsqueda
              </button>
            </>
          ) : (
            <div style={{ ...historyItemStyles, color: "#999" }}>No hay búsquedas recientes</div>
          )}
        </div>
      </div>

      <div style={filtersContainerStyles}>
        <div style={{ position: 'relative', flex: 1, minWidth: windowWidth < 1024 ? '45%' : '0' }}>
          <button
            onClick={toggleCalendar}
            style={dateButtonStyles}
          >
            <span style={{ flex: 1, textAlign: 'left' }}>{getFormattedDateRange()}</span>
            {(startDate || endDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStartDate(null);
                  setEndDate(null);
                  setShowCalendar(false);
                }}
                style={clearButtonStyles}
                title="Limpiar fechas"
              >
                ✕
              </button>
            )}
          </button>

          {showCalendar && (
            <div ref={datePickerRef} style={datePickerStyles}>
              <div 
                translate="no" 
                className="w-[90vw] max-w-[400px] mx-auto md:max-w-[700px] overflow-x-auto rounded-lg shadow-md bg-white notranslate"
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: windowWidth < 768 ? 'column' : 'row',
                  gap: '24px', 
                  padding: '16px',
                  margin: '0 auto',
                }}>
                  {[currentMonth, currentMonth.add(1, 'month')].map((month, i) => (
                    <div key={i} style={{ 
                      flex: windowWidth < 768 ? 'none' : 1,
                      width: windowWidth < 768 ? '100%' : 'auto',
                      minWidth: windowWidth < 768 ? 'auto' : '280px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        padding: '0 8px'
                      }}>
                        <button
                          onClick={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}
                          style={{ 
                            visibility: i === 0 ? 'visible' : 'hidden',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          ←
                        </button>
                        <span style={{ fontWeight: 500 }}>{month.format('MMMM YYYY')}</span>
                        <button
                          onClick={() => setCurrentMonth(prev => prev.add(1, 'month'))}
                          style={{ 
                            visibility: i === 1 ? 'visible' : 'hidden',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          →
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        textAlign: 'center'
                      }}>
                        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(day => (
                          <div key={day} style={{ padding: '4px', color: '#666' }}>{day}</div>
                        ))}

                        {generateCalendarDays(month).map((day, index) => {
                          const isStartDate = startDate && day.isSame(startDate, 'day')
                          const isEndDate = endDate && day.isSame(endDate, 'day')
                          const isSelected = isStartDate || isEndDate
                          const isInRange = startDate && endDate &&
                            day.isAfter(dayjs(startDate).startOf('day')) &&
                            day.isBefore(dayjs(endDate).endOf('day'))
                          const isCurrentMonth = day.month() === month.month()
                          const isPastDate = day.isBefore(dayjs().startOf('day'))
                          const isDisabled = isDateDisabled(day)

                          return (
                            <button
                              key={index}
                              onClick={() => handleDateClick(day)}
                              disabled={isPastDate || isDisabled}
                              style={{
                                padding: '8px',
                                backgroundColor: isSelected ? '#FF6B00' :
                                  isInRange ? '#FFE4D6' : 'transparent',
                                color: (isPastDate || isDisabled) ? '#ccc' :
                                  isSelected ? 'white' :
                                    !isCurrentMonth ? '#ccc' : 'black',
                                borderRadius: '4px',
                                cursor: (isPastDate || isDisabled) ? 'not-allowed' : 'pointer',
                                border: 'none',
                                outline: 'none',
                                opacity: (isPastDate || isDisabled) ? 0.4 : 1,
                                pointerEvents: (isPastDate || isDisabled) ? 'none' : 'auto',
                              }}
                            >
                              {day.format('D')}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 px-4 pb-4">
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className="w-full sm:w-1/2 py-3 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="w-full sm:w-1/2 py-3 px-4 bg-[#FF6B00] text-white rounded-md hover:bg-[#e55d00] transition-colors duration-200"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: windowWidth < 1024 ? '45%' : '0' }}>
        <button
          onClick={() => setShowDistanceSlider(!showDistanceSlider)}
          style={{
            ...selectStyles,
            cursor: 'pointer',
            backgroundColor: showDistanceSlider ? '#f3f4f6' : 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Distancia: {selectedDistance} km</span>
          <span>▼</span>
        </button>

        {showDistanceSlider && (
          <div style={distanceSliderStyles}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="range"
                min="1"
                max="1000"
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span>1 km</span>
                <span>{selectedDistance} km</span>
                <span>1000 km</span>
              </div>
            </div>
            <button
              onClick={() => setShowDistanceSlider(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF6B00',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Aceptar
            </button>
          </div>
        )}
      </div>
      <div className="relative">
          <FiltroAeropuerto />
      </div>

        <button
          onClick={() => setMostrarMapa((prev) => !prev)}
          className={`px-4 py-2 rounded-md text-white font-semibold ${mostrarMapa ? "bg-orange-500" : "bg-gray-500"
            }`}
        >
          ver mapa GPS
        </button>

      </div>
      <button 
  style={filterButtonStyles} 
  onClick={handleFilterClick}
  disabled={isLoading}
>
  {isLoading ? "Buscando..." : "Filtrar"}
</button>
{error && <p style={{ color: "red" }}>{error}</p>}
      {mostrarMapa && <MapaFiltro />}
      {showDateError && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 1001,
        }}>
          El período máximo de reserva es de 12 meses
        </div>
      )}
    </div>
  )
}

export default FilterSection
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos
// comentario para ver que se actualizen los archivos 
// comentario para ver que se actualizen los archivos 