import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          f
        </Link>

        {/* Search */}
        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Tìm kiếm trên Facebook"
            className="w-full max-w-md p-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="text-gray-600">👤</span> {/* Avatar */}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="text-gray-600">🔔</span> {/* Notifications */}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="text-gray-600">💬</span> {/* Messenger */}
          </Button>
        </div>
      </div>
    </header>
  );
}