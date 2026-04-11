import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App                from './App'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import CalendarPage       from './pages/CalendarPage'
import DashboardPage      from './pages/DashboardPage'
import GraficosPage       from './pages/GraficosPage'
import RecorrentesPage    from './pages/RecorrentesPage'
import ContaPage          from './pages/ContaPage'
import PersonalizarPage   from './pages/PersonalizarPage'
import ConfiguracoesPage  from './pages/ConfiguracoesPage'
import { AuthProvider }  from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<App />}>
                <Route index                    element={<CalendarPage />} />
                <Route path="dashboard"         element={<DashboardPage />} />
                <Route path="graficos"          element={<GraficosPage />} />
                <Route path="recorrentes"       element={<RecorrentesPage />} />
                <Route path="conta"             element={<ContaPage />} />
                <Route path="personalizar"      element={<PersonalizarPage />} />
                <Route path="configuracoes"     element={<ConfiguracoesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
