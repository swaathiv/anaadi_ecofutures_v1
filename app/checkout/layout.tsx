import { AuthProvider } from "@/components/auth/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
