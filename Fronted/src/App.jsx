import React, { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './component/Layout'
import Dashboard from './pages/Dashboard'

const App = () => {

  const [user, setuser] = useState(null)
  const [token, settoken] = useState(null)

  const navigate = useNavigate()

  const clearAuth = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")
    } catch (error) {
      console.log("autherror", error)
    }

    setuser(null)
    settoken(null)
  }

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <Routes>

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

    </Routes>
  )
}

export default App