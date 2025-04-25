import type React from "react"

const ContentArea: React.FC = () => {
  const contentAreaStyles: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    margin: "0 auto 40px",
    width: "80%",
    maxWidth: "1200px",
    minHeight: "500px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const placeholderTextStyles: React.CSSProperties = {
    color: "#999",
    fontSize: "18px",
    textAlign: "center",
  }

  return (
    <div style={contentAreaStyles}>
      <p style={placeholderTextStyles}>Aqui se mostraran los resultados de la busqueda</p>
    </div>
  )
}

export default ContentArea
