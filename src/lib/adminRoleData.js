// Role constants dan permission map untuk Admin Panitia KPU

export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN_PANITIA: 'adminPanitia',
};

export const ROLE_PERMISSIONS = {
  superAdmin: [
    'dashboard',
    'kandidat',
    'panitia',
    'dokumentasi',
    'panduan',
    'contact',
    'akun',
  ],
  adminPanitia: [
    'dashboard',
    'kandidat',
    'panitia',
    'dokumentasi',
    'panduan',
    'contact',
  ],
};

export function hasPermission(roleName, requiredPermission) {
  if (!roleName) return false;
  if (roleName === ROLES.SUPER_ADMIN) return true;
  const permissions = ROLE_PERMISSIONS[roleName] || [];
  return permissions.includes(requiredPermission);
}

export const PANITIA_MENU = [
  {
    name: 'Dashboard',
    href: '/panitia/dashboard',
    icon: 'LayoutDashboard',
    permission: 'dashboard',
  },
  {
    name: 'Kandidat',
    href: '/panitia/kandidat',
    icon: 'Users',
    permission: 'kandidat',
  },
  {
    name: 'Panitia',
    href: '/panitia/panitia',
    icon: 'UserCheck',
    permission: 'panitia',
  },
  {
    name: 'Dokumentasi',
    href: '/panitia/dokumentasi',
    icon: 'FolderKanban',
    permission: 'dokumentasi',
  },
  {
    name: 'Panduan',
    href: '/panitia/panduan',
    icon: 'BookOpen',
    permission: 'panduan',
  },
  {
    name: 'Pesan Kontak',
    href: '/panitia/contact',
    icon: 'Mail',
    permission: 'contact',
  },
  {
    name: 'Manajemen Akun',
    href: '/panitia/akun',
    icon: 'ShieldCheck',
    permission: 'akun',
    superAdminOnly: true,
  },
];
