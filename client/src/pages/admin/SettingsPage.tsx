import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE, headers, authFetch } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <div>
          <Label className="text-stone-400">Site Name</Label>
          <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Kazan Restaurant" className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500" />
        </div>
        <div>
          <Label className="text-stone-400">Footer Text</Label>
          <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Thank you for visiting" className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500" />
        </div>
        <div>
          <Label className="text-stone-400">Contact Text</Label>
          <Input value={contactText} onChange={(e) => setContactText(e.target.value)} placeholder="Phone, address..." className="bg-[var(--color-app-bg)] border-[var(--color-border)] text-stone-100 placeholder:text-stone-500" />
        </div>
        <Button
          onClick={() => updateMu.mutate()}
          disabled={updateMu.isPending}
        >
          {updateMu.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
