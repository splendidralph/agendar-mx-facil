import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerData {
  id: string;
  text_primary: string;
  text_secondary: string | null;
  animation_type: string;
  background_color: string | null;
  text_color: string | null;
  link_url: string | null;
  is_dismissible: boolean;
}

export const AnimatedBanner = () => {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Fetch active banner
    const fetchBanner = async () => {
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No active banner found');
        return;
      }

      if (data) {
        setBanner(data);
      }
    };

    fetchBanner();
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('banner-dismissed', 'true');
    setIsDismissed(true);
  };

  if (!banner || isDismissed) {
    return null;
  }

  const animationClass = {
    marquee: 'animate-[scroll_20s_linear_infinite]',
    fade: 'animate-[fade-in_1s_ease-in-out_infinite_alternate]',
    pulse: 'animate-pulse',
    none: ''
  }[banner.animation_type] || '';

  const content = (
    <div className="flex items-center justify-center gap-4 px-4 py-3 relative">
      <span className="font-semibold text-sm sm:text-base">{banner.text_primary}</span>
      {banner.text_secondary && (
        <span className="text-sm sm:text-base opacity-90">{banner.text_secondary}</span>
      )}
      {banner.is_dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const style = {
    backgroundColor: banner.background_color || 'hsl(var(--primary))',
    color: banner.text_color || 'hsl(var(--primary-foreground))',
  };

  if (banner.link_url) {
    return (
      <a
        href={banner.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('block w-full cursor-pointer hover:opacity-90 transition-opacity', animationClass)}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={cn('w-full', animationClass)} style={style}>
      {content}
    </div>
  );
};
