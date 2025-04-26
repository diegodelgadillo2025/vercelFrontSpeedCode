"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { obtenerHistorialBusqueda, guardarBusqueda, autocompletarBusqueda } from '@/libs/historialBusqueda';

interface FilterSectionProps {
  windowWidth: number
}

const FilterSection: React.FC<FilterSectionProps> = ({ windowWidth }) => {
  // Estado para el historial de búsquedas
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

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

  const clearButtonStyles: React.CSSProperties = {
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
                  <span style={historyTextStyles}>{item}</span>
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
                style={clearButtonStyles}
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
      <button style={filterButtonStyles}>Filtrar</button>
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

