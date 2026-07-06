import { resolveAssetUrl } from '@/utils/asset-url';

export default function SceneFrame({
  src,
  alt,
  label,
  subtitle,
  aspect = 'aspect-[16/7]',
  maxHeight,
}: {
  src: string;
  alt: string;
  label?: string;
  subtitle?: string;
  /** @deprecated use aspect instead */
  maxHeight?: string;
  aspect?: string;
}) {
  const resolvedSrc = resolveAssetUrl(src) ?? src;

  return (
    <div className={`hud-scene group ${aspect}`}>
      <img src={resolvedSrc} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      {label && (
        <div className="hud-scene-meta">
          {subtitle && <span>{subtitle}</span>}
          <p>{label}</p>
        </div>
      )}
    </div>
  );
}
