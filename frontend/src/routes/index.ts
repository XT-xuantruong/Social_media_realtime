import AuthLayout from '@/layouts/AuthLayout';
import MainSidebarLayout from '@/layouts/MainSidebarLayout';
import LoginPage from '@/pages/auth/LoginPage';
import OtpFormPage from '@/pages/auth/OtpFormPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Home from '@/pages/Home';
import ProfilePage from '@/pages/user/Profile';

export const publicRoutes = [
  { path: '/profile', component: ProfilePage, layout: AuthLayout },
  { path: '/register', component: RegisterPage, layout: AuthLayout },
  { path: '/login', component: LoginPage, layout: AuthLayout },
  { path: '/otp', component: OtpFormPage, layout: AuthLayout },
  { path: '/', component: Home, layout: MainSidebarLayout },
];
