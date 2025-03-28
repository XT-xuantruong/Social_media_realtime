import AuthLayout from "@/layouts/AuthLayout";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import OtpFormPage from "@/pages/auth/OtpFormPage";

export const publicRoutes = [
  { path: "/register", component: RegisterPage, layout: AuthLayout },
  { path: "/login", component: LoginPage, layout: AuthLayout },
  { path: "/otp", component: OtpFormPage, layout: AuthLayout }, 
];