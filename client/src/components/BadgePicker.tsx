import { Leaf, Star } from 'lucide-react';

export const BADGE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  vegetarian: {
    icon: Leaf,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    label: 'Вегетарианское',
  },
  top: {
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/30',
    label: 'Топ',
  },
};

interface BadgePickerProps {
  value: string[];
  onChange: (badges: string[]) => void;
}

export function BadgePicker({ value, onChange }: BadgePickerProps) {
  const toggle = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((b) => b !== code));
    } else {
      onChange([...value, code]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(BADGE_CONFIG).map(([code, config]) => {
        const Icon = config.icon;
        const active = value.includes(code);
        return (
          <button
            key={code}
            type="button"
            onClick={() => toggle(code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              active
                ? `${config.bg} ${config.color}`
                : 'border-[var(--color-border)] text-stone-400 hover:text-stone-200 hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
