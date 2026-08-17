import { useState } from "react";
import type { Category } from "../types";

interface Props {
  categories: Category[];
  activeId: string | "all" | "uncategorized";
  onSelect: (id: string | "all" | "uncategorized") => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryChips({ categories, activeId, onSelect, onAddCategory, onDeleteCategory }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function submit() {
    if (name.trim()) onAddCategory(name.trim());
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <Chip active={activeId === "all"} onClick={() => onSelect("all")}>
        الكل
      </Chip>
      {categories.map((cat) => (
        <div key={cat.id} className="relative group shrink-0">
          <Chip active={activeId === cat.id} onClick={() => onSelect(cat.id)}>
            {cat.name}
          </Chip>
          <button
            className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-error text-white text-[10px] hidden group-hover:flex items-center justify-center"
            title="حذف القسم"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`تحذف قسم "${cat.name}"؟ الكتب هترجع بدون تصنيف.`)) onDeleteCategory(cat.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
      <Chip active={activeId === "uncategorized"} onClick={() => onSelect("uncategorized")}>
        بدون تصنيف
      </Chip>

      {adding ? (
        <input
          autoFocus
          className="recessed-input px-4 py-2 text-label-sm w-32 shrink-0"
          placeholder="اسم القسم"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onBlur={submit}
        />
      ) : (
        <button
          className="glass-panel px-4 py-2 rounded-full text-label-sm text-primary flex items-center gap-1 shrink-0 hover:bg-white/80"
          onClick={() => setAdding(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            add
          </span>
          قسم جديد
        </button>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-label-sm whitespace-nowrap shrink-0 transition-colors ${
        active ? "bg-primary text-on-primary shadow-sm" : "glass-panel text-on-surface hover:bg-white/80"
      }`}
    >
      {children}
    </button>
  );
}
