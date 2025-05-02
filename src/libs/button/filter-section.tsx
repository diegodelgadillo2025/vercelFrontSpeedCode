"use client"

import dynamic from "next/dynamic";
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { obtenerHistorialBusqueda, guardarBusqueda, autocompletarBusqueda } from '@/libs/historialBusqueda';
import dayjs from 'dayjs'
import 'dayjs/locale/es' // Import Spanish locale

dayjs.locale('es') // Use Spanish locale

interface FilterSectionProps {
  windowWidth: number
}
const MapaFiltro = dynamic(() => import('@/app/components/filtroBusqueda/filtroMapaPrecio'), {
  ssr: false,
});
const FilterSection: React.FC<FilterSectionProps> = ({ windowWidth }) => {
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

  // Load initial visible history
  useEffect(() => {
    const stored = localStorage.getItem("searchHistory");
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

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
    if (!startDate || !endDate) return "Filtro 1"
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

  const handleDateClick = (date: dayjs.Dayjs) => {
    // Don't allow selecting past dates
    if (date.isBefore(dayjs().startOf('day'))) {
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date.toDate())
      setEndDate(null)
    } else {
      if (date.isBefore(startDate)) {
        setStartDate(date.toDate())
        setEndDate(null)
      } else {
        setEndDate(date.toDate())
      }
    }
  }

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
    backgroundColor: "#A9A9A9",
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
    border: 'none',
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
          onFocus={() => {
            setShowHistory(true);
            const storedMemory = JSON.parse(localStorage.getItem("searchMemory") || "[]");
            setSearchHistory(storedMemory.slice(0, 5));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
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
                  style={historyItemStyles}
                  onClick={() => {
                    setSearchTerm(item);
                    setShowHistory(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
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
                      const newHistory = searchHistory.filter((_, i) => i !== index);
                      setSearchHistory(newHistory);
                      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
                      localStorage.setItem(
                        "searchMemory",
                        JSON.stringify(
                          Array.from(new Set([...newHistory]))
                        )
                      );
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
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={dateButtonStyles}
          >
            <span style={{ flex: 1, textAlign: 'left' }}>{getFormattedDateRange()}</span>
            {(startDate || endDate) && (
              <button
                onClick={clearDateRange}
                style={clearButtonStyles}
                title="Limpiar fechas"
              >
                ✕
              </button>
            )}
          </button>

          {showDatePicker && (
            <div ref={datePickerRef} style={datePickerStyles}>
              <div style={{ display: 'flex', gap: '24px' }}>
                {[currentMonth, currentMonth.add(1, 'month')].map((month, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <button
                        onClick={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}
                        style={{ visibility: i === 0 ? 'visible' : 'hidden' }}
                      >
                        ←
                      </button>
                      <span>{month.format('MMMM YYYY')}</span>
                      <button
                        onClick={() => setCurrentMonth(prev => prev.add(1, 'month'))}
                        style={{ visibility: i === 1 ? 'visible' : 'hidden' }}
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
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
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

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateClick(day)}
                            disabled={isPastDate}
                            style={{
                              padding: '8px',
                              backgroundColor: isSelected ? '#FF6B00' :
                                isInRange ? '#FFE4D6' : 'transparent',
                              color: isPastDate ? '#ccc' :
                                isSelected ? 'white' :
                                  !isCurrentMonth ? '#ccc' : 'black',
                              borderRadius: '4px',
                              cursor: isPastDate ? 'not-allowed' : 'pointer',
                              border: 'none',
                              outline: 'none',
                              opacity: isPastDate ? 0.4 : 1,
                              pointerEvents: isPastDate ? 'none' : 'auto',
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

              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#FF6B00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
              >
                Aceptar
              </button>
            </div>
          )}
        </div>

        <select style={selectStyles}>
          <option>Filtro 2</option>
        </select>
        <select style={selectStyles}>
          <option>Filtro 3</option>
        </select>
        <button
          onClick={() => setMostrarMapa((prev) => !prev)}
          className={`px-4 py-2 rounded-md text-white font-semibold ${mostrarMapa ? "bg-orange-500" : "bg-gray-500"
            }`}
        >
          ver mapa GPS
        </button>

      </div>
      <button style={filterButtonStyles}>Filtrar</button>
      {mostrarMapa && <MapaFiltro />}

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

