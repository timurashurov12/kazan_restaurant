import { X } from 'lucide-react';
import { publicUploadUrl, type MenuItemDto } from '@/lib/api';
import { BADGE_ICONS, WINE_COLOR_MAP, getRegionFlag, priceLabel } from './item-visuals';

export function ItemModal({
  item,
  onClose,
  numberLocale,
  currencyLabel,
  locale,
}: {
  item: MenuItemDto;
  onClose: () => void;
  numberLocale: string;
  currencyLabel: string;
  locale: string;
}) {
  const img = publicUploadUrl(item.imagePath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[var(--color-border)] bg-[var(--color-app-panel)] animate-in">
        {img && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl sm:rounded-t-2xl bg-stone-950">
            <img src={img} alt="" className="h-full w-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-5 space-y-4">
          {!img && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[var(--color-app-bg)] text-stone-400 hover:text-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-stone-50">{item.name}</h2>
              {item.badges?.map((badge) => {
                const cfg = BADGE_ICONS[badge];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <span
                    key={badge}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
            {item.classification && (
              <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium uppercase tracking-wider text-stone-500 bg-stone-800/60 px-2 py-0.5 rounded">
                {WINE_COLOR_MAP[item.classification.code] && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${WINE_COLOR_MAP[item.classification.code].bg}`}
                    title={WINE_COLOR_MAP[item.classification.code].title}
                  />
                )}
                {item.classification.name}
              </span>
            )}
            {item.weightOrVolume && (
              <p className="mt-1 text-sm text-stone-500 uppercase tracking-wide">{item.weightOrVolume}</p>
            )}
            {item.region && (
              <p className="mt-1 text-xs text-stone-500">
                {getRegionFlag(item.region.name)} {item.region.name}
              </p>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-stone-400 leading-relaxed">{item.description}</p>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
            <span className="text-2xl font-bold tabular-nums text-[var(--color-app-accent)]">
              {Number(item.price).toLocaleString(numberLocale)} {currencyLabel}
            </span>
            {item.prices && Object.keys(item.prices).length > 0 && (
              <div className="space-y-1">
                {Object.entries(item.prices).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-stone-400">{priceLabel(key, locale)}</span>
                    <span className="font-medium text-stone-200 tabular-nums">
                      {Number(val).toLocaleString(numberLocale)} {currencyLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
