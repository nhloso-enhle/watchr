import { useMemo } from 'react';

// Available styles on the DiceBear HTTP API v9
export const AVATAR_STYLES = [
  { key: 'adventurer',       label: 'Adventurer'    },
  { key: 'bottts',           label: 'Bottts'        },
  { key: 'fun-emoji',        label: 'Fun Emoji'     },
  { key: 'lorelei',          label: 'Lorelei'       },
  { key: 'micah',            label: 'Micah'         },
  { key: 'notionists',       label: 'Notionists'    },
  { key: 'open-peeps',       label: 'Open Peeps'    },
  { key: 'pixel-art',        label: 'Pixel Art'     },
];

/**
 * DiceBearAvatar
 * @param {string}  seed   — username or any string; same seed = same avatar
 * @param {string}  style  — one of the AVATAR_STYLES keys
 * @param {number}  size   — rendered px size (default 32)
 * @param {string}  className
 */
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
      // Graceful fallback — show a plain circle if the API is unreachable
      onError={e => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
