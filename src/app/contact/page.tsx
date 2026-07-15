"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sendContactMessage } from "@/lib/api";

function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  textarea = false,
  rows,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  const shared =
    "peer w-full bg-transparent border-0 border-b border-on-surface/20 py-3 focus:ring-0 focus:border-secondary transition-colors outline-none text-on-surface font-body-md resize-none";

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          placeholder=" "
          rows={rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder=" "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
      <label
        htmlFor={id}
        className="absolute left-0 top-3 font-body-md text-on-surface-variant transition-all pointer-events-none peer-focus:-translate-y-6 peer-focus:scale-[0.85] peer-focus:text-secondary peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.85]"
      >
        {label}
      </label>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
 const [statusMessage, setStatusMessage] = useState("");
const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.name.trim() || !form.email.trim()) {
    setStatus("error");
    setStatusMessage("Please fill in your name and email.");
    return;
  }
  if (form.message.trim().length < 10) {
    setStatus("error");
    setStatusMessage("Your message must be at least 10 characters.");
    return;
  }

  setSubmitting(true);
  setStatus("idle");

  const result = await sendContactMessage(form);
  setSubmitting(false);
  setStatusMessage(result.message);

  if (result.ok) {
    setStatus("success");
    setForm({ name: "", email: "", phone: "", message: "" });
  } else {
    setStatus("error");
  }
};
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="relative h-[530px] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105 hover:scale-100"
              role="img"
              aria-label="Dubai Marina skyline at twilight"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCe8JoT1t_JhxZ_cQSJU67MPzX8_Jx1osNhUSUl6i8SPg75sSaHKOlJdaLCyK5LZ21kzl9R-goXZ9C_9dTdkBVrl1m4cwyvU5z-v12qb8dagCsSPs1Mk-CreNnzAa2faHPu-jD4Zxl-VgvI-u46q0xmRx1s3IIY9Q-KF8UMu9uu3C8E-0XvYJUyE8xRn73KfXU1Fr35bd6njSgQP6p-vzE4BMVQW2X9gqNxJBJ7oEIEzmyzgZYy2Rd2tg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          </div>
          <div className="relative z-10 w-full px-container-padding-mobile md:px-container-padding-desktop pb-16">
            <div className="max-w-4xl">
              <span className="font-label-caps text-secondary tracking-[0.3em] mb-4 block"> CONTACT OUR HOSPITALITY TEAM</span>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
  We're Here to Make Your <span className="italic text-secondary">Stay Exceptional.</span>
</h1>
<p className="mt-6 max-w-2xl text-on-surface-variant text-lg leading-relaxed">
  Whether you're planning a relaxing getaway, a family vacation, or a business trip,
  our dedicated team is ready to assist you with reservations, special requests, and
  personalized hospitality across all our hotels.
</p>
            </div>
          </div>
        </section>

        {/* Contact content */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="p-8 bg-surface-container luxury-shadow flex flex-col gap-4">
              <span className="material-symbols-outlined text-secondary text-4xl">phone_iphone</span>
              <h3 className="font-title-md text-on-surface">Reservations</h3>
              <p className="font-body-md text-on-surface-variant">+971 50 247 7593</p>
              <p className="font-body-md text-on-surface-variant">+971 4 447 3839 </p>
              <p className="font-body-md text-on-surface-variant">Available 24/7 for residents.</p>
            </div>
            <div className="p-8 bg-surface-container luxury-shadow flex flex-col gap-4">
              <span className="material-symbols-outlined text-secondary text-4xl">mail</span>
              <h3 className="font-title-md text-on-surface">Email Us</h3>
              <p className="font-body-md text-on-surface-variant">inquiry@chainofhotels.com</p>
              <p className="font-body-md text-on-surface-variant">Replies within 2 business hours.</p>
            </div>
            <div className="p-8 bg-surface-container luxury-shadow flex flex-col gap-4">
              <span className="material-symbols-outlined text-secondary text-4xl">location_on</span>
              <h3 className="font-title-md text-on-surface">Head Office</h3>
              <p className="font-body-md text-on-surface-variant">
                HDS Tower JLT
                <br />
                JLT, UAE,DUBAI
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8 bg-surface-container-high p-8 md:p-16 luxury-shadow">
           <h2 className="font-headline-lg-mobile md:font-headline-lg mb-12">
  Get in Touch
</h2>

<p className="text-on-surface-variant mb-10">
  Have a question about your stay, room availability, group bookings, or special
  requests? Fill out the form below and our hospitality team will respond as soon as
  possible.
</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FloatingField id="name" label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <FloatingField id="email" label="Email Address" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              </div>

              <FloatingField id="phone" label="Phone Number" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />

              <FloatingField
                id="message"
                label="How may we assist you?"
                textarea
                rows={4}
                value={form.message}
                onChange={(v) => setForm((f) => ({ ...f, message: v }))}
              />

              {status === "success" && <p className="text-secondary text-sm">{statusMessage}</p>}
             {status === "error" && <p className="text-error text-sm">{statusMessage}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="self-start bg-secondary text-on-secondary px-12 py-4 font-label-caps tracking-widest hover:bg-on-secondary-container transition-colors duration-300 uppercase disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Send Request"}
              </button>
            </form>
          </div>
        </section>

        {/* Map */}
        <section className="w-full h-[500px] relative overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-all duration-1000">
          <div className="absolute inset-0 w-full h-full bg-surface-container-lowest">
            <div
              className="w-full h-full bg-cover bg-center opacity-60"
              role="img"
              aria-label="Stylized map of Downtown Dubai"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjlTYX-uuQcaB6QPCareioWofFeK-COXmtlTDgerN7wU8TbZoZJRf3pmANUHCg8cfqlyRv_nrYvTC_GU7MgtANQUwMHhtJhhtP7-lJWv2C0qDpxD-h4PG8owpNPjaiJJe2sPpxoYRXme66pXw-S-Jl9bo0ev0UFD6OIqFu9y1rPtP1_wL-mrrax3HaeI079PjY8H2PMGUmvKRM0pSiebB1rG8zt_BJxpS3e5xYVHmylSTgVcugBRenig')",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-secondary p-4 rounded-full animate-pulse shadow-[0_0_30px_rgba(230,195,100,0.5)]">
                <span className="material-symbols-outlined text-on-secondary text-3xl">location_on</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}