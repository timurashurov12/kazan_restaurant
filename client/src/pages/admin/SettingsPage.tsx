import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = () => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'kazan-qr.png';
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

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

      <div className="space-y-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-app-panel)]">
        <h2 className="text-lg font-semibold text-stone-100">QR Code</h2>
        <p className="text-sm text-stone-400">
          Сканируйте для открытия главной страницы сайта
        </p>
        <div className="flex flex-col items-center gap-4">
          <div ref={qrRef} className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={siteUrl}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-stone-500 font-mono">{siteUrl}</p>
          <Button variant="outline" onClick={handleDownloadQr} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Скачать QR
          </Button>
        </div>
      </div>
    </div>
  );
}
