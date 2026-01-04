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
