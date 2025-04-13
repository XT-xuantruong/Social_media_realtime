import AuthLayout from '@/layouts/AuthLayout';
import MainSidebarLayout from '@/layouts/MainSidebarLayout';
import MessengerLayout from '@/layouts/MessengerLayout';
import LoginPage from '@/pages/auth/LoginPage';
import OtpFormPage from '@/pages/auth/OtpFormPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Home from '@/pages/Home';
import MessengerPage from '@/pages/MessagerPage';
import ProfilePage from '@/pages/user/Profile';

export const publicRoutes = [
  { path: '/profile/:id', component: ProfilePage, layout: AuthLayout },
  { path: '/register', component: RegisterPage, layout: AuthLayout },
  { path: '/login', component: LoginPage, layout: AuthLayout },
  { path: '/otp', component: OtpFormPage, layout: AuthLayout },
  { path: '/', component: Home, layout: MainSidebarLayout },
  { path: '/messenger', component: MessengerPage, layout: MessengerLayout },
];
