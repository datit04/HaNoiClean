export const ROUTES = {
  HOME: '/trang-chu',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  CITIZEN: '/nguoi-dan',
  STAFF: '/can-bo',
  STAFF_ROLES: '/can-bo/roles',
  STAFF_CATEGORIES: '/can-bo/categories',
  STAFF_TEAMS: '/can-bo/teams',
  STAFF_REPORTS: '/can-bo/reports',
  STAFF_ACCOUNTS: '/can-bo/accounts',
  MAP: '/ban-do',
}

export const REPORT_STATUS = {
  SUBMITTED: 'submitted',
  RECEIVED: 'received',
  PROCESSING: 'processing',
  DONE: 'done',
}

export const REPORT_PRIORITY = {
  URGENT: 'urgent',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const INCIDENT_CATEGORIES = [
  { id: 'waste', label: 'Rác thải', icon: 'delete' },
  { id: 'infrastructure', label: 'Hạ tầng', icon: 'construction' },
  { id: 'water', label: 'Cấp nước', icon: 'water_drop' },
  { id: 'lighting', label: 'Đèn đường', icon: 'lightbulb' },
  { id: 'sidewalk', label: 'Vỉa hè', icon: 'streetview' },
]

export const DISTRICTS = [
  'Hoàn Kiếm',
  'Ba Đình',
  'Đống Đa',
  'Hai Bà Trưng',
  'Cầu Giấy',
  'Thanh Xuân',
  'Tây Hồ',
  'Long Biên',
]
