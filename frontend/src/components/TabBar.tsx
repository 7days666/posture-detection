import { NavLink } from 'react-router-dom'
import { HomeIcon, ProfileIcon, LearnIcon, ChartIcon, ReportNavIcon } from './Icons'
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
      <NavLink to="/education" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><LearnIcon active={isActive} /></span>
            <span className="tab-label">学堂</span>
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
      <NavLink to="/report" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        {({ isActive }) => (
          <>
            <span className="tab-icon"><ReportNavIcon active={isActive} /></span>
            <span className="tab-label">报告</span>
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
