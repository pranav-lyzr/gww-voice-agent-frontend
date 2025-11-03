import './App.css'
import { Header } from './components/Header'
import { DashboardAnalytics } from './components/DashboardAnalytics'
import { UsersPanel } from './components/UsersPanel'
import { ConversationsPanel } from './components/ConversationsPanel'
import { Routes, Route } from 'react-router-dom'

function DashboardPage() {
  return (
    <div className="container">
      <DashboardAnalytics />
    </div>
  )
}

function UsersPage() {
  return (
    <div className="container">
      <UsersPanel />
    </div>
  )
}

function ConversationsPage() {
  return (
    <div className="container">
      <ConversationsPanel />
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
        <Route path="/conversations" element={<ConversationsPage />} />
      </Routes>
    </div>
  )
}

export default App
