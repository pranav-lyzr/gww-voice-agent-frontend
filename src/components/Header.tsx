import { Headphones, LayoutDashboard, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-logo" aria-hidden>
            <Headphones size={20} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Call Center Dashboard</h1>
            <span className="brand-subtitle">Voice Session Management</span>
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
        </nav>
      </div>
    </div>
  )
}
