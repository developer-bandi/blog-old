import React, { createContext, useState } from "react"

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState("전체")

  const setCategoryInitPage = category => {
    setCategory(category)
    setPage(1)
  }

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        category,
        setCategoryInitPage,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
