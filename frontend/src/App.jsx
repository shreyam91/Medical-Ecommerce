// src/App.jsx
import { useState, useEffect } from 'react'
import AppRoutes from './route/AppRoutes'
import Footer from './components/Footer'
import './index.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // simulate a loading delay

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 transition-opacity duration-500">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-16 w-16 mb-4 animate-bounce"
        />
        <h1 className="text-2xl font-bold text-blue-600 tracking-wide">
          HerbalMG
        </h1>
      </div>
    )
  }

  return (
    <>
      <AppRoutes />
      <Footer />
    </>
  )
}

export default App
