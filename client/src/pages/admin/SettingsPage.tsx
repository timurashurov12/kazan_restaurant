import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE, headers, authFetch } from './api';

type Settings = {
  siteName: string | null;
  footerText: string | null;
  contactText: string | null;
};

export function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async (): Promise<Settings> => {
      const res = await authFetch(`${API_BASE}/site-settings`, { headers: headers() });
      if (!res.ok) return { siteName: null, footerText: null, contactText: null };
      return res.json();
    },
  });

  const [siteName, setSiteName] = useState('');
  const [footerText, setFooterText] = useState('');
  const [contactText, setContactText] = useState('');

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setFooterText(settings.footerText || '');
      setContactText(settings.contactText || '');
    }
  }, [settings]);

  const updateMu = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${API_BASE}/site-settings`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ siteName, footerText, contactText }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="text-stone-400">Loading...</div>;

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold text-stone-100">Settings</h1>
      <div className="space-y-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">
        <Field label="Site Name" value={siteName} onChange={setSiteName} placeholder="Kazan Restaurant" />
        <Field label="Footer Text" value={footerText} onChange={setFooterText} placeholder="Thank you for visiting" />
        <Field label="Contact Text" value={contactText} onChange={setContactText} placeholder="Phone, address..." />
        <button
          onClick={() => updateMu.mutate()}
          disabled={updateMu.isPending}
          className="px-6 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--color-app-accent)', color: 'var(--color-app-bg)' }}
        >
          {updateMu.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-400 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border)] text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-accent)]/40" />
    </div>
  );
}
