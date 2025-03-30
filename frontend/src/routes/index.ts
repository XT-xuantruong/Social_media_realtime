import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import OtpFormPage from '@/pages/auth/OtpFormPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Home from '@/pages/Home';

export const publicRoutes = [
  { path: '/register', component: RegisterPage, layout: AuthLayout },
  { path: '/login', component: LoginPage, layout: AuthLayout },
  { path: '/otp', component: OtpFormPage, layout: AuthLayout },
  { path: '/', component: Home, layout: AuthLayout },
];
