import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { ReactNode } from 'react';

interface ProfileTabsProps {
  userId: string;
  children: ReactNode;
}

export const ProfileTabs = ({ userId, children }: ProfileTabsProps) => {
  const me = useSelector((state: RootState) => state.auth.user);

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="flex space-x-6 my-2 border-b border-gray-200 p-4 bg-white">
        <TabsTrigger
          value="posts"
          className="text-gray-600 font-semibold data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-500 data-[state=active]:bg-blue-500"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="friends"
          className="text-gray-600 font-semibold data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-500 data-[state=active]:bg-blue-500"
        >
          Friends
        </TabsTrigger>
        {userId === me?.id && (
          <TabsTrigger
            value="friend_requests"
            className="text-gray-600 font-semibold data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-500 data-[state=active]:bg-blue-500"
          >
            Friend Requests
          </TabsTrigger>
        )}
      </TabsList>
      {children} {/* Render the TabsContent components here */}
    </Tabs>
  );
};