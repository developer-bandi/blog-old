import React, { useEffect } from "react"
import { AppProvider } from "../context/app-context"

const RootElement = ({ children }) => {
  useEffect(() => {
    window.history.scrollRestoration = "manual"
  }, [])
  return <AppProvider>{children}</AppProvider>
}

export default RootElement
