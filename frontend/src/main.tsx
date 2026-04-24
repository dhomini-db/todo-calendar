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
import ContaPage          from './pages/ContaPage'
import PersonalizarPage   from './pages/PersonalizarPage'
import ConfiguracoesPage  from './pages/ConfiguracoesPage'
import SocialPage         from './pages/SocialPage'
import RecorrentesPage    from './pages/RecorrentesPage'
import { AuthProvider }     from './contexts/AuthContext'
import { ThemeProvider }    from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
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
                <Route path="conta"             element={<ContaPage />} />
                <Route path="personalizar"      element={<PersonalizarPage />} />
                <Route path="configuracoes"     element={<ConfiguracoesPage />} />
                <Route path="social"            element={<SocialPage />} />
                <Route path="recorrentes"       element={<RecorrentesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
