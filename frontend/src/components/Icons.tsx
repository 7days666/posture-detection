export const LogoIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8C20 8 17 11 17 15C17 19 20 22 24 22C28 22 31 19 31 15C31 11 28 8 24 8Z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 22V38" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 28H32" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M18 38H30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

export const HomeIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z" 
      stroke={active ? "#4ecdc4" : "#a0aec0"} 
      strokeWidth="2" 
      strokeLinejoin="round"
      fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}
    />
  </svg>
)

export const ProfileIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const AIDetectIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="24" height="18" rx="2" stroke="#4ecdc4" strokeWidth="2"/>
    <circle cx="16" cy="15" r="5" stroke="#4ecdc4" strokeWidth="2"/>
    <path d="M8 26H24" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const HealthRecordIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="20" height="26" rx="2" stroke="#44a08d" strokeWidth="2"/>
    <path d="M10 10H22" stroke="#44a08d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 15H22" stroke="#44a08d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 20H18" stroke="#44a08d" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const GuidanceIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="11" stroke="#4ecdc4" strokeWidth="2"/>
    <circle cx="16" cy="16" r="6" stroke="#44a08d" strokeWidth="2"/>
    <circle cx="16" cy="16" r="2" fill="#44a08d"/>
  </svg>
)

export const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
  </svg>
)

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="10" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="10" stroke="#c53030" strokeWidth="2"/>
    <path d="M12 7V13" stroke="#c53030" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1" fill="#c53030"/>
  </svg>
)

export const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="10" stroke="#276749" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ReportIcon = ({ color = "#4ecdc4" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="22" height="24" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M10 12H22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 17H18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="5" fill={color}/>
  </svg>
)

export const ArchiveIcon = ({ color = "#f6ad55" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="20" height="22" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="16" cy="14" r="4" stroke={color} strokeWidth="2"/>
    <path d="M10 24C10 21.2386 12.6863 19 16 19C19.3137 19 22 21.2386 22 24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const EducationIcon = ({ color = "#fc8181" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 6L4 12L16 18L28 12L16 6Z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M8 14V22C8 22 11 26 16 26C21 26 24 22 24 22V14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const AppointmentIcon = ({ color = "#63b3ed" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="24" height="22" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M4 12H28" stroke={color} strokeWidth="2"/>
    <path d="M10 4V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 4V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="20" r="4" fill={color}/>
  </svg>
)

export const AIIcon = ({ color = "#68d391" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="20" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="16" r="2" fill={color}/>
    <circle cx="20" cy="16" r="2" fill={color}/>
    <path d="M14 20C14 20 15 21 16 21C17 21 18 20 18 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const FollowUpIcon = ({ color = "#b794f4" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2"/>
    <path d="M16 10V16L20 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const SurveyIcon = ({ color = "#f687b3" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="20" height="24" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M11 12H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M11 17H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M11 22H17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ShopIcon = ({ color = "#fbd38d" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10L8 4H24L26 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <rect x="4" y="10" width="24" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="11" cy="22" r="2" fill={color}/>
    <circle cx="21" cy="22" r="2" fill={color}/>
  </svg>
)

export const ConsultIcon = ({ color = "#90cdf4" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V20C26 21.1046 25.1046 22 24 22H14L8 28V22C6.89543 22 6 21.1046 6 20V8Z" stroke={color} strokeWidth="2"/>
    <circle cx="11" cy="14" r="1.5" fill={color}/>
    <circle cx="16" cy="14" r="1.5" fill={color}/>
    <circle cx="21" cy="14" r="1.5" fill={color}/>
  </svg>
)

export const SelfTestIcon = ({ color = "#9f7aea" }: { color?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="6" stroke={color} strokeWidth="2"/>
    <path d="M16 18V28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 24H22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 底部导航栏图标
export const LearnIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4L2 9L12 14L22 9L12 4Z"
      stroke={active ? "#4ecdc4" : "#a0aec0"}
      strokeWidth="2"
      strokeLinejoin="round"
      fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}
    />
    <path d="M5 11V17C5 17 8 20 12 20C16 20 19 17 19 17V11" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ChartIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="12" width="4" height="8" rx="1" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
    <rect x="10" y="8" width="4" height="12" rx="1" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
    <rect x="17" y="4" width="4" height="16" rx="1" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
  </svg>
)

export const ReportNavIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" fill={active ? "rgba(78, 205, 196, 0.15)" : "none"}/>
    <path d="M8 8H16" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H14" stroke={active ? "#4ecdc4" : "#a0aec0"} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="15" r="3" fill={active ? "#4ecdc4" : "#a0aec0"}/>
  </svg>
)

// 数据追踪页面图标
export const TrendUpIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <path d="M3 17L9 11L13 15L21 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 7H21V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const TrendDownIcon = ({ color = "#ef4444" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <path d="M3 7L9 13L13 9L21 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 17H21V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const TrendStableIcon = ({ color = "#f59e0b" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <path d="M4 12H20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 8L20 12L16 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const SearchIcon = ({ color = "#6b7280" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2"/>
    <path d="M16 16L20 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const RunIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="14" cy="4" r="2" fill={color}/>
    <path d="M7 21L10 14L13 16V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L8 11L11 8L16 9L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const TimerIcon = ({ color = "#3b82f6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2"/>
    <path d="M12 9V13L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 2H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const CheckmarkIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const RobotIcon = ({ color = "#8b5cf6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <rect x="4" y="8" width="16" height="12" rx="2" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="14" r="2" fill={color}/>
    <circle cx="15" cy="14" r="2" fill={color}/>
    <path d="M12 4V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="3" r="1.5" fill={color}/>
  </svg>
)

export const ImprovementIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M12 20V4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 11L12 4L19 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// 健康教育页面图标
export const ArticleIcon = ({ color = "#3b82f6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 7H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 11H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 15H12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const PostureIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <circle cx="12" cy="4" r="2" fill={color}/>
    <path d="M12 6V14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 10H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 14L12 14L12 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 14L12 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 20H14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const PreventionIcon = ({ color = "#ef4444" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const BackpackIcon = ({ color = "#f59e0b" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <rect x="5" y="8" width="14" height="13" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 8V6C8 4.34315 9.34315 3 11 3H13C14.6569 3 16 4.34315 16 6V8" stroke={color} strokeWidth="2"/>
    <rect x="9" y="12" width="6" height="4" rx="1" stroke={color} strokeWidth="2"/>
  </svg>
)

export const VideoIcon = ({ color = "#8b5cf6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M10 9L15 12L10 15V9Z" fill={color}/>
  </svg>
)

export const CourseIcon = ({ color = "#f59e0b" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6Z" fill={color} fillOpacity="0.2"/>
    <rect x="6" y="2" width="16" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M10 7H18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 11H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 健康报告和AI预测图标
export const PredictionIcon = ({ color = "#6366f1" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </svg>
)

export const IncreaseIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path d="M12 19V5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 12L12 5L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const AddIcon = ({ color = "#3b82f6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M12 8V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const MonitorIcon = ({ color = "#8b5cf6" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke={color} strokeWidth="2"/>
  </svg>
)

export const CloseIcon = ({ color = "#6b7280" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const LessonCompleteIcon = ({ color = "#10b981" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="10" fill={color}/>
    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const LessonPendingIcon = ({ color = "#d1d5db" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
  </svg>
)
