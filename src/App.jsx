import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './component/Navbar'
import GoogleLoginModal from './component/GoogleLoginModal'
import PasswordModal from './component/PasswordModal'
import { useEmailLogin, useGoogleAuth, useSignup } from './hooks/useUsers'
import { getCurrentUser } from './apis/user.api'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Home = lazy(() => import('./pages/Home'))
const Admin = lazy(() => import('./pages/Admin'))
const AiReviewGenerator = lazy(() => import('./pages/AiReviewGenerator'))

const App = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const navigate = useNavigate()

  const googleAuthMutation = useGoogleAuth()
  const signupMutation = useSignup()
  const loginMutation = useEmailLogin()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser)
          localStorage.setItem('user', JSON.stringify(currentUser))
        })
        .catch(() => {
          localStorage.removeItem('user')
        })
    }
  }, [])

  const handleAuthSuccess = (data) => {
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    setLoginOpen(false)
    navigate(['admin', 'super_admin'].includes(data.user.role) ? '/admin' : '/')
  }

  const handleAuthError = (err) => {
    alert(err.error || 'Authentication failed')
  }

  const handleGoogleLogin = (userData) => {
    googleAuthMutation.mutate(userData, {
      onSuccess: handleAuthSuccess,
      onError: handleAuthError,
    })
  }

  const handleEmailLogin = (credentials) => {
    loginMutation.mutate(credentials, {
      onSuccess: handleAuthSuccess,
      onError: handleAuthError,
    })
  }

  const handleSignup = (credentials) => {
    signupMutation.mutate(credentials, {
      onSuccess: handleAuthSuccess,
      onError: handleAuthError,
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
        onPasswordClick={() => setPasswordOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <Box component="main" sx={{ pt: { xs: 0, md: '64px' }, minWidth: 0 }}>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<Home onLoginClick={() => setLoginOpen(true)} user={user} />} />
            <Route
              path="/admin"
              element={['admin', 'super_admin'].includes(user?.role) ? <Admin user={user} /> : <Home onLoginClick={() => setLoginOpen(true)} user={user} />}
            />
            <Route
              path="/ai-reviews"
              element={user ? <AiReviewGenerator user={user} /> : <Home onLoginClick={() => setLoginOpen(true)} user={user} />}
            />
            <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
          </Routes>
        </Suspense>
      </Box>

      {/* Global Login Modal */}
      <GoogleLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleGoogleLogin}
        onEmailLogin={handleEmailLogin}
        onSignup={handleSignup}
        emailLoading={loginMutation.isPending || signupMutation.isPending}
      />
      <PasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        hasPassword={user?.has_password}
        onPasswordSaved={() => {
          const nextUser = { ...user, has_password: true }
          setUser(nextUser)
          localStorage.setItem('user', JSON.stringify(nextUser))
        }}
      />

    </div>
  )
}

export default App
