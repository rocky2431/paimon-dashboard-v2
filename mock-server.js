const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock user data
const mockUsers = {
  'admin@paimon.com': {
    id: '1',
    email: 'admin@paimon.com',
    name: 'Admin User',
    role: 'admin',
    token: 'mock-jwt-token-admin',
    refreshToken: 'mock-refresh-token-admin'
  },
  'operator@paimon.com': {
    id: '2',
    email: 'operator@paimon.com',
    name: 'Operator User',
    role: 'operator',
    token: 'mock-jwt-token-operator',
    refreshToken: 'mock-refresh-token-operator'
  }
}

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body

  console.log('Login attempt:', { email, password: '***' })

  // Accept any password for demo purposes
  if (mockUsers[email]) {
    res.json({
      user: mockUsers[email],
      token: mockUsers[email].token,
      refreshToken: mockUsers[email].refreshToken,
      expiresIn: 3600
    })
  } else {
    // Create user for any email (for testing)
    const newUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'viewer',
      token: `mock-jwt-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`
    }
    res.json({
      user: newUser,
      token: newUser.token,
      refreshToken: newUser.refreshToken,
      expiresIn: 3600
    })
  }
})

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

app.get('/api/v1/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (token && token.startsWith('mock-jwt')) {
    res.json({ valid: true })
  } else {
    res.status(401).json({ valid: false })
  }
})

// Mock dashboard data
app.get('/api/v1/dashboard/overview', (req, res) => {
  res.json({
    nav: 1000000,
    aum: 50000000,
    shares: 100000,
    lastUpdate: new Date().toISOString()
  })
})

app.get('/api/v1/dashboard/metrics', (req, res) => {
  res.json({
    dailyNav: [1.01, 1.02, 1.01, 1.03, 1.02],
    liquidityDistribution: [
      { name: 'Cash', value: 30 },
      { name: 'Bonds', value: 40 },
      { name: 'Stocks', value: 30 }
    ]
  })
})

// Mock risk monitoring data
app.get('/api/v1/risk/monitoring', (req, res) => {
  res.json({
    riskLevel: 'medium',
    exposure: 25000000,
    alerts: [
      { id: '1', severity: 'high', message: 'High market volatility detected' },
      { id: '2', severity: 'low', message: 'Liquidity ratio within normal range' }
    ]
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`)
  console.log(`📝 Try logging in with any email and password`)
  console.log(`👤 Example: admin@paimon.com / anypassword`)
})