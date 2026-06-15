import { useState, useEffect } from 'react';

export default function AuthBackground() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    fetch('/api/public/carousel')
      .then(r => r.json())
      .then(data => setPosters(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (posters.length < 4) return null;

  // Split into 3 rows and double each for seamless infinite scroll
  const third = Math.ceil(posters.length / 3);
  const rows = [
    { imgs: posters.slice(0, third),         dir: 'left',  top: '3%',  opacity: 0.22, dur: '32s'  },
    { imgs: posters.slice(third, third * 2), dir: 'right', top: '37%', opacity: 0.15, dur: '42s'  },
    { imgs: posters.slice(third * 2),        dir: 'left',  top: '70%', opacity: 0.12, dur: '27s'  },
  ].filter(r => r.imgs.length > 0);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>

      {rows.map(({ imgs, dir, top, opacity, dur }, i) => {
        const doubled = [...imgs, ...imgs]; // duplicate for seamless loop
        const anim = dir === 'left'
          ? `scrollMarqueeLeft ${dur} linear infinite`
          : `scrollMarqueeRight ${dur} linear infinite`;

        return (
          <div key={i} style={{ position: 'absolute', top, left: 0, right: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '10px', width: 'max-content', animation: anim }}>
              {doubled.map((url, j) => (
                <img
                  key={j}
                  src={url}
                  alt=""
                  draggable={false}
                  style={{
                    height: '120px',
                    width: 'auto',
                    flexShrink: 0,
                    borderRadius: '8px',
                    objectFit: 'cover',
                    opacity,
                  }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Semi-transparent overlay using the theme background colour —
          this mutes the images while keeping them visible as a texture. */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', opacity: 0.8 }} />
    </div>
  );
}
