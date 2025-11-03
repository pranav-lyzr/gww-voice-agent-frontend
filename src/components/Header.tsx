import { LayoutDashboard, Users, MessageSquare } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-logo" aria-hidden style={{ marginRight: '16px' }}>
            <img src="/logo.svg" alt="Logo" style={{ height: '32px', width: 'auto' }} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title" style={{ color: '#111827', fontWeight: 700 }}>Call Center Dashboard</h1>
            <span className="brand-subtitle" style={{ color: '#6B7280' }}>Voice Session Management</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Primary">
          <Link className={"nav-link" + (isActive('/') ? ' nav-link-active' : '')} to="/">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link className={"nav-link" + (isActive('/users') ? ' nav-link-active' : '')} to="/users">
            <Users size={16} />
            <span>Users</span>
          </Link>
          <Link className={"nav-link" + (isActive('/conversations') ? ' nav-link-active' : '')} to="/conversations">
            <MessageSquare size={16} />
            <span>Conversations</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
