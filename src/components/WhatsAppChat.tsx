"use client";

interface WhatsAppChatProps {
  phone?: string;
  message?: string;
}

export default function WhatsAppChat({
  phone = "971502477593",
  message = `Hello! 👋

I'm looking to book a hotel and would like assistance from one of your hotel experts.

Could you please help me find the best available rooms, rates, and special offers?

Thank you!`,
}: WhatsAppChatProps) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with our Hotel Experts on WhatsApp"
      className="fixed bottom-24 right-6 z-[9999] group"
    >
      {/* Floating Message Card */}
      <div className="absolute bottom-20 right-0 w-80 rounded-2xl bg-white shadow-2xl border border-green-100 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg">
              H
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">
              Hotel Booking Experts
            </h4>
            <p className="text-xs text-green-600 font-medium">
              ● Online • Typically replies in a few minutes
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Need help finding the perfect hotel?
          <br />
          Chat with our hotel experts for:
        </p>

        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>🏨 Best hotel recommendations</li>
          <li>💰 Exclusive room rates & offers</li>
          <li>⭐ Luxury & family hotel bookings</li>
          <li>📅 Instant reservation assistance</li>
        </ul>

        <div className="mt-4 inline-flex items-center gap-2 text-[#25D366] font-semibold">
          Open WhatsApp →
        </div>
      </div>

      {/* Glow Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] blur-2xl opacity-50 animate-pulse"></span>

      {/* WhatsApp Button */}
      <div className="relative w-16 h-16 rounded-full bg-[#25D366] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center overflow-hidden">
        {/* Shine Animation */}
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute -left-12 top-0 h-full w-8 rotate-12 bg-white/40 animate-[shine_3s_linear_infinite]" />
        </span>

        {/* Ring Animation */}
        <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></span>

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="w-8 h-8 text-white relative z-10"
        >
          <path d="M19.11 17.38c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.38-.82-.73-1.37-1.64-1.53-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.32.43-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.46.07-.7.35-.24.28-.92.9-.92 2.2s.94 2.56 1.07 2.74c.14.18 1.85 2.82 4.49 3.95.63.27 1.13.43 1.52.55.64.2 1.22.17 1.68.1.51-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.06-.11-.24-.18-.52-.32z" />
          <path d="M16.02 3C8.84 3 3 8.82 3 15.99c0 2.53.74 4.98 2.13 7.08L3 29l6.13-2.09a13 13 0 006.89 1.97H16c7.18 0 13.02-5.82 13.02-13S23.18 3 16.02 3zm0 23.63c-2.09 0-4.04-.61-5.69-1.67l-.41-.26-3.64 1.24 1.22-3.55-.27-.43a10.67 10.67 0 01-1.64-5.67c0-5.9 4.8-10.69 10.71-10.69 5.9 0 10.7 4.79 10.7 10.69 0 5.89-4.8 10.68-10.69 10.68z" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-140px) rotate(20deg);
          }
          100% {
            transform: translateX(220px) rotate(20deg);
          }
        }
      `}</style>
    </a>
  );
}