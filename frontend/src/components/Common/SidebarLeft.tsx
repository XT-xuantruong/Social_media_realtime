import { Link } from "react-router-dom";
import { HomeIcon, UsersIcon, StoreIcon } from "lucide-react";

export default function SidebarLeft() {
  return (
    <div className="w-64 bg-white p-4 fixed top-20 left-0 bottom-0 border-r z-10">
      <ul className="space-y-2">
        <li>
          <Link
            to="/"
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HomeIcon className="h-7 w-7 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Trang chủ</span>
          </Link>
        </li>
        <li>
          <Link
            to="/friends"
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <UsersIcon className="h-7 w-7 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Bạn bè</span>
          </Link>
        </li>
        <li>
          <Link
            to="/groups"
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <UsersIcon className="h-7 w-7 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Nhóm</span>
          </Link>
        </li>
        <li>
          <Link
            to="/marketplace"
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <StoreIcon className="h-7 w-7 text-gray-600 mr-3" />
            <span className="text-lg font-medium text-gray-800">Marketplace</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}