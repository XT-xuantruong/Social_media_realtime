import AuthLayout from '@/layouts/AuthLayout';
import MainSidebarLayout from '@/layouts/MainSidebarLayout';
import MessengerLayout from '@/layouts/MessengerLayout';
import LoginPage from '@/pages/auth/LoginPage';
import OtpFormPage from '@/pages/auth/OtpFormPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import FriendsPage from '@/pages/user/FriendsPage';
import Home from '@/pages/user/Home';
import MessengerPage from '@/pages/user/MessagerPage';
import ProfilePage from '@/pages/user/Profile';
import SearchResult from '@/pages/user/SearchResult';

export const publicRoutes = [
  { path: '/login', component: LoginPage, layout: AuthLayout },
  { path: '/register', component: RegisterPage, layout: AuthLayout },
  { path: '/otp', component: OtpFormPage, layout: AuthLayout },
];
export const privateRoutes = [
  { path: '/', component: Home, layout: MainSidebarLayout },
  { path: '/profile/:id', component: ProfilePage, layout: AuthLayout },
  { path: '/messenger', component: MessengerPage, layout: MessengerLayout },
  { path: '/search', component: SearchResult, layout: MainSidebarLayout },
  { path: '/friends', component: FriendsPage, layout: MainSidebarLayout },
];
