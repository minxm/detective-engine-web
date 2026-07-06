import { resolveAssetUrl } from '@/utils/asset-url';

const SIZES = {
  sm: { outer: 'w-10 h-10', text: 'text-xs', px: 32 },
  md: { outer: 'w-16 h-16', text: 'text-base', px: 64 },
  lg: { outer: 'w-20 h-20', text: 'text-lg', px: 80 },
  xl: { outer: 'w-28 h-28', text: 'text-2xl', px: 112 },
} as const;

export function CharacterPortrait({
  name,
  imageUrl,
  size = 'md',
  glow = false,
}: {
  name: string;
  imageUrl?: string;
  size?: keyof typeof SIZES;
  glow?: boolean;
}) {
  const s = SIZES[size];
  const initial = name.charAt(0);
  const src = resolveAssetUrl(imageUrl);

  return (
    <div className={`hud-portrait ${s.outer} ${glow ? 'hud-portrait-glow' : ''}`}>
      <div className={`hud-portrait-inner w-full h-full flex items-center justify-center ${s.text} font-bold text-cyan-300/80`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          initial
        )}
      </div>
    </div>
  );
}
