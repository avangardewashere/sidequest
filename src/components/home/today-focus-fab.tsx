"use client";

type TodayFocusFabProps = {
  onClick?: () => void;
};

export function TodayFocusFab({ onClick }: TodayFocusFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Quick add quest"
      className="fixed right-6 bottom-24 z-20 h-14 w-14 rounded-full text-2xl font-semibold"
      style={{ background: "var(--sq-button)", color: "var(--sq-button-text)" }}
    >
      +
    </button>
  );
}
