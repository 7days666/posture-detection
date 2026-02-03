import { NavLink } from 'react-router-dom'
import { HomeIcon, ProfileIcon, LearnIcon, ChartIcon } from './Icons'
import './TabBar.css'

// 积分图标
const PointsIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
    <path d="M12 6V18" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 10H14C15.1046 10 16 10.8954 16 12C16 13.1046 15.1046 14 14 14H8" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

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
      <NavLink to="/education" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><LearnIcon active={isActive} /></span>
            <span className="tab-label">数字教练</span>
          </>
        )}
      </NavLink>
      <NavLink to="/points" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><PointsIcon active={isActive} /></span>
            <span className="tab-label">积分&商店</span>
          </>
        )}
      </NavLink>
      <NavLink to="/tracking" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><ChartIcon active={isActive} /></span>
            <span className="tab-label">数据</span>
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
