import { Link } from "react-router-dom";

export default function SidebarLeft() {
  return (
    <div className="w-64 bg-white p-4 fixed top-14 bottom-0 border-r">
      <ul className="space-y-2">
        <li>
          <Link to="/" className="flex items-center p-2 hover:bg-gray-100 rounded">
            <span className="mr-3">🏠</span> Trang chủ
          </Link>
        </li>
        <li>
          <Link to="/friends" className="flex items-center p-2 hover:bg-gray-100 rounded">
            <span className="mr-3">👥</span> Bạn bè
          </Link>
        </li>
        <li>
          <Link to="/groups" className="flex items-center p-2 hover:bg-gray-100 rounded">
            <span className="mr-3">👥</span> Nhóm
          </Link>
        </li>
        <li>
          <Link to="/marketplace" className="flex items-center p-2 hover:bg-gray-100 rounded">
            <span className="mr-3">🏪</span> Marketplace
          </Link>
        </li>
      </ul>
    </div>
  );
}