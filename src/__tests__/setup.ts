import '@testing-library/jest-dom'

// Mock CSS imports for tests
vi.mock('../styles/globals.css', () => ({}))

// Setup test environment
beforeEach(() => {
  // Clear DOM before each test
  document.body.innerHTML = ''
})