"use client";

import { useEffect } from "react";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: string[];
  selectedLocations: string[];
  onToggleLocation: (loc: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: number;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  locations,
  selectedLocations,
  onToggleLocation,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onApply,
  onReset,
}: FilterDrawerProps) {
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-all duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-surface-container-high border-l border-secondary/10 shadow-2xl transform transition-transform duration-500 p-10 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-headline-lg-mobile text-secondary">Refine Search</h2>
          <button className="material-symbols-outlined text-secondary text-3xl" onClick={onClose}>
            close
          </button>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto pr-4">
          {/* Price */}
          <div>
            <h3 className="font-label-caps text-on-surface mb-6">PRICE RANGE</h3>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={minPrice || 0}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full accent-secondary bg-surface-variant h-1 rounded-full appearance-none"
            />
            <div className="flex justify-between mt-4 font-body-md text-on-surface-variant italic">
              <span>AED {minPrice || 0}</span>
              <span>AED {maxPrice}+</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-label-caps text-on-surface mb-6">LOCATION</h3>
            <div className="space-y-4">
              {locations.map((loc) => {
                const active = selectedLocations.includes(loc);
                return (
                  <label key={loc} className="flex items-center gap-4 group cursor-pointer">
                    <div
                      className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                        active ? "border-secondary" : "border-secondary/40 group-hover:border-secondary"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-secondary text-sm ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        check
                      </span>
                    </div>
                    <span
                      className={active ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"}
                      onClick={() => onToggleLocation(loc)}
                    >
                      {loc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-10 flex gap-4">
          <button
            onClick={onReset}
            className="flex-1 py-4 border border-secondary/40 font-label-caps text-secondary hover:bg-secondary/5"
          >
            RESET
          </button>
          <button
            onClick={onApply}
            className="flex-[2] py-4 bg-secondary text-on-secondary font-label-caps"
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </div>
  );
}