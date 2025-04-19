/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';

interface UserSearchResultProps {
  users: any[];
  userRef: (node: any) => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

export default function UserSearchResult({ users, userRef, isFetching, hasNextPage }: UserSearchResultProps) {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <User className="size-5 mr-2" /> Users ({users.length})
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {users.map((user: any, index: number) => (
              <div
                key={user.node.id}
                className="flex-shrink-0 w-60 h-60 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                ref={index === users.length - 1 ? userRef : null}
              >
                <div className="flex flex-col items-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={user.node.avatar_url} alt={user.node.full_name} />
                    <AvatarFallback>{user.node.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <Link
                    to={`/profile/${user.node.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {user.node.full_name}
                  </Link>
                  <p className="text-gray-500 text-sm">{user.node.email}</p>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={`/profile/${user.node.id}`}>View Profile</Link>
                </Button>
              </div>
            ))}
            {isFetching && hasNextPage && (
              <div className="flex-shrink-0 w-80 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}