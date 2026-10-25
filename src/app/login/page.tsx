import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-full place-items-center px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}
