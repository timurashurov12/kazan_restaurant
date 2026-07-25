import { Plus, X } from 'lucide-react';

type PriceTier = { key: string; value: string };

interface PricesEditorProps {
  value: Record<string, number> | null;
  onChange: (prices: Record<string, number> | null) => void;
}

const SUGGESTED_KEYS = ['glass', 'shot', 'cup'];

export function PricesEditor({ value, onChange }: PricesEditorProps) {
  const tiers: PriceTier[] = value
    ? Object.entries(value).map(([key, val]) => ({ key, value: String(val) }))
    : [];

  const addTier = (key?: string) => {
    const newKey = key || `tier${tiers.length}`;
    const updated = [...tiers, { key: newKey, value: '' }];
    emitChange(updated);
  };

  const updateTier = (index: number, field: 'key' | 'value', val: string) => {
    const updated = tiers.map((t, i) => (i === index ? { ...t, [field]: val } : t));
    emitChange(updated);
  };

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    emitChange(updated);
  };

  const emitChange = (updated: PriceTier[]) => {
    const filtered = updated.filter((t) => t.key.trim());
    if (filtered.length === 0) {
      onChange(null);
    } else {
      const obj: Record<string, number> = {};
      for (const t of filtered) {
        const num = Number(t.value);
        if (!isNaN(num) && num > 0) obj[t.key.trim()] = num;
      }
      onChange(Object.keys(obj).length > 0 ? obj : null);
    }
  };

  const availableSuggestions = SUGGESTED_KEYS.filter(
    (k) => !tiers.some((t) => t.key === k)
  );

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={tier.key}
            onChange={(e) => updateTier(i, 'key', e.target.value)}
            placeholder="Label"
            className="w-24 px-3 py-1.5 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
          />
          <input
            type="number"
            value={tier.value}
            onChange={(e) => updateTier(i, 'value', e.target.value)}
            placeholder="0"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40"
          />
          <button
            type="button"
            onClick={() => removeTier(i)}
            className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => addTier()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-[var(--color-border)] transition"
        >
          <Plus className="w-3 h-3" />
          Добавить
        </button>
        {availableSuggestions.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => addTier(key)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-app-accent)] hover:bg-[var(--color-app-accent)]/10 border border-[var(--color-app-accent)]/30 transition"
          >
            + {key}
          </button>
        ))}
      </div>
    </div>
  );
}
