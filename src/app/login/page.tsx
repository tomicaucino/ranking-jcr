import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/ranking");

  return (
    <main className="flex flex-1 items-center justify-center bg-primary-900 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <span className="mx-auto mb-3 inline-block h-3 w-3 rounded-full bg-accent-400" />
          <h1 className="font-serif text-2xl font-semibold">Jockey Club de Rosario</h1>
          <p className="text-primary-200">Ranking de Match Play</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
