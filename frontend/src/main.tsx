import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './index.css'
import './liquid-glass.css'

const CalendarPage=lazy(()=>import('./pages/CalendarPage'))
const DashboardPage=lazy(()=>import('./pages/DashboardPage'))
const GraficosPage=lazy(()=>import('./pages/GraficosPage'))
const ContaPage=lazy(()=>import('./pages/ContaPage'))
const PersonalizarPage=lazy(()=>import('./pages/PersonalizarPage'))
const ConfiguracoesPage=lazy(()=>import('./pages/ConfiguracoesPage'))
const SocialPage=lazy(()=>import('./pages/SocialPage'))
const RecorrentesPage=lazy(()=>import('./pages/RecorrentesPage'))

const queryClient=new QueryClient({defaultOptions:{queries:{staleTime:30_000,retry:1}}})
ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode><ThemeProvider><LanguageProvider><AuthProvider><QueryClientProvider client={queryClient}><BrowserRouter>
<Suspense fallback={<div className="route-loading" role="status" aria-label="Carregando"/>}><Routes>
<Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/" element={<App/>}>
<Route index element={<CalendarPage/>}/><Route path="dashboard" element={<DashboardPage/>}/><Route path="graficos" element={<GraficosPage/>}/><Route path="conta" element={<ContaPage/>}/><Route path="personalizar" element={<PersonalizarPage/>}/><Route path="configuracoes" element={<ConfiguracoesPage/>}/><Route path="social" element={<SocialPage/>}/><Route path="recorrentes" element={<RecorrentesPage/>}/>
</Route></Routes></Suspense></BrowserRouter></QueryClientProvider></AuthProvider></LanguageProvider></ThemeProvider></React.StrictMode>)
import './brandAura'
import './monochromeExperience'
import './themeMigration'
import './accentExperience'
import './performanceMode'
import './mobileSidebarFix'
import './mobileTopbarFix'
import './taskScheduleEnhancement'
import './authWaveRedesign'
import './authParticles'
import './authWaveMotion'


