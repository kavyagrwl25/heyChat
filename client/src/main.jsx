import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#14213d',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#edf2f7',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
})

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <App />
  </ThemeProvider>
)
