import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, StoreIcon } from 'lucide-react';

// Định nghĩa interface cho các mục trong sidebar
interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Danh sách các mục điều hướng
const navItems: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon },
  { to: '/friends', label: 'Bạn bè', icon: UsersIcon },
  { to: '/groups', label: 'Nhóm', icon: UsersIcon },
  { to: '/marketplace', label: 'Marketplace', icon: StoreIcon },
];

// Component cho mỗi mục điều hướng
const NavLink = ({ to, label, icon: Icon }: NavItem) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Icon className={`h-6 w-6 ${isActive ? 'text-blue-700' : 'text-gray-600'} mr-3`} />
        <span className="text-base font-medium">{label}</span>
      </Link>
    </li>
  );
};

export default function SidebarLeft() {
  return (
    <nav className="p-4 h-full overflow-y-auto">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
      </ul>
    </nav>
  );
}