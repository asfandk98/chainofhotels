"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/api";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        if (data) setForm({ name: data.name ?? "", email: data.email ?? "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile(form);
      const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...form }));
      window.dispatchEvent(new Event("auth-change"));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: unknown) {
      const text =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Update failed.";
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    form.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-secondary">Profile</h1>
        <p className="text-on-surface-variant text-sm mt-1">Manage your account details</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-on-surface font-semibold truncate">{form.name}</p>
          <p className="text-on-surface-variant text-sm truncate">{form.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-5">
        <div className="border-b border-outline-variant/10 pb-3 mb-1">
          <p className="font-label-caps text-label-caps text-on-surface-variant">Personal Information</p>
        </div>

        <div>
          <label className="block text-xs text-on-surface-variant uppercase tracking-wide mb-2">Full Name</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              person
            </span>
            <input
              type="text"
              value={form.name}
              required
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-on-surface-variant uppercase tracking-wide mb-2">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              mail
            </span>
            <input
              type="email"
              value={form.email}
              required
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary transition"
            />
          </div>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-error/10 border border-error/20 text-error"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">save</span>
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">key</span>
        </div>
        <div>
          <p className="text-on-surface text-sm font-semibold">Password</p>
          <p className="text-on-surface-variant text-xs mt-0.5">Contact support to change your password</p>
        </div>
      </div>
    </div>
  );
}