import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './component/Navbar'
import Home from './pages/Home'
import GoogleLoginModal from './component/GoogleLoginModal'
import Admin from './pages/Admin'
import { useGoogleAuth } from './hooks/useUsers'

const App = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const googleAuthMutation = useGoogleAuth()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleGoogleLogin = (userData) => {
    googleAuthMutation.mutate(userData, {
      onSuccess: (data) => {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        setLoginOpen(false)
        if (data.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      },
      onError: (err) => {
        alert(err.error || 'Authentication failed')
      }
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="App" style={{ background: '#0f0f0f', minHeight: '100vh' }}>

      {/* Pass login open function to Navbar */}
      <Navbar
        onLoginClick={() => setLoginOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Home onLoginClick={() => setLoginOpen(true)} user={user} />} />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <Admin user={user} /> : <Home onLoginClick={() => setLoginOpen(true)} user={user} />}
        />
        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>

      {/* Global Login Modal */}
      <GoogleLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleGoogleLogin}
      />

    </div>
  )
}

export default App
