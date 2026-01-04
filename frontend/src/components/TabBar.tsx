import { NavLink } from 'react-router-dom'
import { HomeIcon, ProfileIcon } from './Icons'
import './TabBar.css'

export default function TabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/home" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><HomeIcon active={isActive} /></span>
            <span className="tab-label">首页</span>
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><ProfileIcon active={isActive} /></span>
            <span className="tab-label">我的</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
