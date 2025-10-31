import './App.css'
import { Header } from './components/Header'
import { StatusCard } from './components/StatusCard'
import { SessionsPanel } from './components/SessionsPanel'
import { UsersPanel } from './components/UsersPanel'
import { ConversationsPanel } from './components/ConversationsPanel'
import { Routes, Route } from 'react-router-dom'

function DashboardPage() {
  return (
    <div className="container">
      <StatusCard />
      <div className="section" />
      <SessionsPanel />
      <div className="section" />
      <ConversationsPanel />
    </div>
  )
}

function UsersPage() {
  return (
    <div className="container">
      <StatusCard />
      <div className="section" />
      <UsersPanel />
    </div>
  )
}

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </div>
  )
}

export default App
