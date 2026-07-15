export default function BottomNav({ price }: { price?: string | number }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 md:hidden bg-surface-container-highest border-t border-secondary/10 shadow-2xl">
      <div className="flex flex-col items-start justify-center text-on-surface">
        <span className="font-label-caps text-[10px] text-secondary">STARTING FROM</span>
        <span className="font-title-md">${price ?? "1,200"}</span>
      </div>
      <button className="flex flex-col items-center justify-center bg-secondary text-on-secondary rounded-full px-8 py-3 scale-95 active:scale-90 transition-transform">
        <span className="font-label-caps">RESERVE</span>
      </button>
    </nav>
  );
}