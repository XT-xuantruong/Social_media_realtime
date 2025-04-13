import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SidebarRight() {
  return (
    <div className="w-80 bg-white p-4 fixed top-20 right-0 bottom-0 border-l z-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Bạn bè</h3>
      <ul className="space-y-2">
        <li className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://github.com/shadcn.png" alt="Friend 1" />
            <AvatarFallback>F1</AvatarFallback>
          </Avatar>
          <span className="text-lg font-medium text-gray-800">Bạn bè 1</span>
        </li>
        <li className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://github.com/shadcn.png" alt="Friend 2" />
            <AvatarFallback>F2</AvatarFallback>
          </Avatar>
          <span className="text-lg font-medium text-gray-800">Bạn bè 2</span>
        </li>
      </ul>
    </div>
  );
}