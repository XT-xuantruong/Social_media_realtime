/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface UserSearchResultProps {
  users: any[];
}

export default function UserSearchResult({ users }: UserSearchResultProps) {
  
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <User className="size-5 mr-2" /> Users ({users.length})
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="grid gap-4">
          {users.map((user: any) => (
            <div
              key={user.node.id}
              className="flex items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={user.node.avatar_url} alt={user.node.full_name} />
                <AvatarFallback>{user.node.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Link
                  to={`/profile/${user.node.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {user.node.full_name}
                </Link>
                <p className="text-gray-500">{user.node.email}</p>
              </div>
              <Button asChild variant="outline">
                <Link to={`/profile/${user.node.id}`}>View Profile</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}