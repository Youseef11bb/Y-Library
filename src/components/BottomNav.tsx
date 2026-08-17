import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: "home", label: "الرئيسية", end: true },
  { to: "/library", icon: "library_books", label: "المكتبة" },
  { to: "/search", icon: "search", label: "بحث" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
      <div className="glass-dock rounded-full px-6 py-3 flex gap-6 items-center pointer-events-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 transition-all ${
                isActive ? "text-primary scale-110" : "text-on-surface-variant opacity-70 hover:opacity-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={isActive ? ({ fontVariationSettings: "'FILL' 1" } as React.CSSProperties) : undefined}
                >
                  {item.icon}
                </span>
                <span className={`text-label-sm ${isActive ? "font-bold" : ""}`}>{item.label}</span>
                {isActive && <span className="w-1 h-1 bg-primary rounded-full" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
