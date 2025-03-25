import AuthLayout from "@/layouts/AuthLayout";
import RegisterPage from "@/pages/auth/RegisterPage";

export const publicRoutes = [
  { path: "/register", component: RegisterPage, layout: AuthLayout },
];
