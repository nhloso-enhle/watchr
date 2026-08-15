import { useMemo } from 'react';

export const AVATAR_STYLES = [
  { key: 'adventurer', label: 'Adventurer' },
  { key: 'bottts',     label: 'Bottts'     },
  { key: 'fun-emoji',  label: 'Fun Emoji'  },
  { key: 'lorelei',    label: 'Lorelei'    },
  { key: 'micah',      label: 'Micah'      },
  { key: 'notionists', label: 'Notionists' },
  { key: 'open-peeps', label: 'Open Peeps' },
  { key: 'pixel-art',  label: 'Pixel Art'  },
];

export default function DiceBearAvatar({ seed = 'user', style = 'bottts', size = 32, className = '' }) {
  const src = useMemo(() => {
    const url = new URL(`https://api.dicebear.com/9.x/${style}/svg`);
    url.searchParams.set('seed', seed);
    url.searchParams.set('size', String(size));
    return url.href;
  }, [seed, style, size]);

  return (
    <img
      src={src}
      alt={`${seed}'s avatar`}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', display: 'block' }}
      onError={e => { e.currentTarget.style.display = 'none'; }}
    />
  );
}
