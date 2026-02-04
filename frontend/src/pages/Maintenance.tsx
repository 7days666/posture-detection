import './Maintenance.css'

export default function Maintenance() {
  return (
    <div className="maintenance-page">
      <div className="maintenance-content">
        <div className="maintenance-icon">🔧</div>
        <h1>系统维护中</h1>
        <p>我们正在进行系统维护升级，请稍后再试。</p>
        <p className="maintenance-hint">给您带来不便，敬请谅解！</p>
      </div>
    </div>
  )
}
