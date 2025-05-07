"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "../../../libs/button/navbar"
import FilterSection from "../../../libs/button/filter-section"
import ContentArea from "../../../libs/button/content-area"

export default function Home() {
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1200)
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const pageStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
  }

  return (
    <div style={pageStyles}>
      <Navbar windowWidth={windowWidth} />
      <div style={{ marginTop: "60px" }}>
      <FilterSection 
  windowWidth={windowWidth} 
  onFilter={(vehicles) => setFilteredVehicles(vehicles)} // <-- Recibir los resultados
/>
<ContentArea vehicles={filteredVehicles} />

      </div>
    </div>
  )
}
