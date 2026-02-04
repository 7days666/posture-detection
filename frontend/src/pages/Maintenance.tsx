import './Maintenance.css'

export default function Maintenance() {
  return (
    <div className="maintenance-page">
      {/* 背景动画粒子 */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{ '--delay': `${i * 0.5}s`, '--x': `${Math.random() * 100}%` } as React.CSSProperties} />
        ))}
      </div>
      
      <div className="maintenance-content">
        {/* 动画图标 */}
        <div className="maintenance-icon-wrapper">
          <div className="icon-glow"></div>
          <div className="icon-ring"></div>
          <div className="icon-ring ring-2"></div>
          <svg className="maintenance-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 齿轮 */}
            <g className="gear gear-1">
              <path d="M50 20V15M50 85V80M80 50H85M15 50H20M71.2 28.8L74.7 25.3M25.3 74.7L28.8 71.2M71.2 71.2L74.7 74.7M25.3 25.3L28.8 28.8" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="3"/>
              <circle cx="50" cy="50" r="8" fill="white" fillOpacity="0.3"/>
            </g>
            {/* 扳手 */}
            <g className="wrench">
              <path d="M65 35L75 25C77 23 77 20 75 18C73 16 70 16 68 18L58 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M58 28L35 51C32 54 32 59 35 62C38 65 43 65 46 62L69 39" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="40" cy="57" r="4" fill="white" fillOpacity="0.5"/>
            </g>
          </svg>
        </div>
        
        <h1 className="maintenance-title">
          <span className="title-text">系统维护中</span>
          <span className="title-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </h1>
        
        <p className="maintenance-desc">我们正在进行系统升级优化</p>
        <p className="maintenance-desc sub">预计很快恢复，感谢您的耐心等待</p>
        
        {/* 进度条动画 */}
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill"></div>
            <div className="progress-shine"></div>
          </div>
          <span className="progress-text">维护进行中</span>
        </div>
        
        {/* 联系信息 */}
        <div className="contact-info">
          <div className="contact-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span>如有紧急问题，请联系管理员</span>
        </div>
      </div>
    </div>
  )
}
