export default function SidebarRight() {
  return (
    <div className="w-80 bg-white p-4 fixed top-14 right-0 bottom-0 border-l">
      <h3 className="font-semibold mb-4">Bạn bè</h3>
      <ul className="space-y-2">
        <li className="flex items-center p-2 hover:bg-gray-100 rounded">
          <span className="w-8 h-8 bg-gray-300 rounded-full mr-2"></span>
          Bạn bè 1
        </li>
        <li className="flex items-center p-2 hover:bg-gray-100 rounded">
          <span className="w-8 h-8 bg-gray-300 rounded-full mr-2"></span>
          Bạn bè 2
        </li>
      </ul>
    </div>
  );
}