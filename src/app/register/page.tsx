"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { registerUser } from "@/lib/auth";

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative floating-label-input group">
      <input
        id={id}
        name={id}
        type={type}
        placeholder=" "
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-on-surface/20 py-4 focus:ring-0 focus:border-secondary transition-colors text-on-surface font-body-md peer"
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-4 text-on-surface/60 transition-all duration-300 pointer-events-none font-body-md origin-top-left peer-focus:-translate-y-5 peer-focus:scale-[0.85] peer-focus:text-secondary peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:scale-[0.85]"
      >
        {label}
      </label>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name: form.name, email: form.email, password: form.password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Registration successful!");

      const redirectTo = sessionStorage.getItem("redirect_after_login");
      sessionStorage.removeItem("redirect_after_login");
      router.push(redirectTo ?? "/login");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="flex-grow flex items-center justify-center pt-40 pb-20 px-container-padding-mobile min-h-screen">
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-secondary mb-4">
              Create Account
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
              Join to save your favourite hotels and curate your bespoke Dubai experience.
            </p>
          </div>

          <form onSubmit={handleRegister} className="w-full space-y-8">
            <FloatingInput id="fullname" label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FloatingInput id="email" label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <FloatingInput id="password" label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            <FloatingInput
              id="confirm_password"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
            />

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary text-primary-container font-label-caps text-label-caps py-5 transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="font-body-md text-on-surface/60">
              Already have an account?{" "}
              <Link href="/login" className="text-secondary underline underline-offset-8 decoration-secondary/30 hover:decoration-secondary transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}