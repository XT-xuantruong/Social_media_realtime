import AuthLayout from "@/layouts/AuthLayout";

import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";

export const publicRoutes = [
  { path: "/register", component: RegisterPage, layout: AuthLayout },
  { path: "/login", component: LoginPage, layout: AuthLayout },
];
