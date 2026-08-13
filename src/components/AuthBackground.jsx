import { useEffect, useRef } from 'react';
import {
  Film, Tv2, Star, Clapperboard, Play, Ticket,
  MonitorPlay, Camera, Award, Heart, Popcorn, Video,
  Aperture, Mic2, Music2,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useTheme } from '../context/ThemeContext';

// Icon pool
const ICON_POOL = [
  Film, Tv2, Star, Clapperboard, Play, Ticket,
  MonitorPlay, Camera, Award, Heart, Popcorn, Video,
  Aperture, Mic2, Music2,
];

// Scattered positions across the viewport
const LAYOUT = [
  { top: '6%',  left: '4%',  size: 34, baseRot: -12 },
  { top: '10%', left: '22%', size: 22, baseRot:  8  },
  { top: '4%',  left: '42%', size: 42, baseRot: -4  },
  { top: '8%',  left: '63%', size: 26, baseRot:  18 },
  { top: '5%',  left: '82%', size: 38, baseRot: -9  },
  { top: '32%', left: '2%',  size: 46, baseRot:  14 },
  { top: '38%', left: '18%', size: 20, baseRot: -18 },
  { top: '35%', left: '48%', size: 30, baseRot:  6  },
  { top: '42%', left: '70%', size: 24, baseRot: -14 },
  { top: '36%', left: '90%', size: 40, baseRot:  20 },
  { top: '68%', left: '6%',  size: 30, baseRot: -6  },
  { top: '72%', left: '28%', size: 42, baseRot:  10 },
  { top: '65%', left: '52%', size: 22, baseRot: -16 },
  { top: '74%', left: '76%', size: 36, baseRot:  4  },
  { top: '78%', left: '94%', size: 28, baseRot: -22 },
];

export default function AuthBackground() {
  const refs  = useRef([]);
  const { isDark } = useTheme();

  useEffect(() => {
    const els = refs.current.filter(Boolean);
    if (!els.length) return;

    // Kill any previous tweens
    gsap.killTweensOf(els);

    const targetOpacity = isDark ? 0.14 : 0.07;

    els.forEach((el, i) => {
      // Entrance
      gsap.fromTo(el,
        { opacity: 0, scale: 0.4 },
        {
          opacity: targetOpacity,
          scale: 1,
          duration: 0.7,
          delay: i * 0.06,
          ease: 'back.out(1.5)',
        }
      );

      // Continuous float (up ↕ down)
      gsap.to(el, {
        y: -(10 + (i % 5) * 5),
        duration: 2.4 + (i % 5) * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.12,
      });

      // Slow drift rotation
      gsap.to(el, {
        rotation: `${i % 2 === 0 ? '+' : '-'}=${12 + (i % 4) * 4}`,
        duration: 5 + (i % 4) * 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.18,
      });

      // Subtle opacity breathe
      gsap.to(el, {
        opacity: targetOpacity * 0.45,
        duration: 3 + (i % 3) * 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.22,
      });
    });

    return () => gsap.killTweensOf(els);
  }, [isDark]);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      {LAYOUT.map(({ top, left, size, baseRot }, i) => {
        const Icon = ICON_POOL[i % ICON_POOL.length];
        return (
          <div
            key={i}
            ref={el => { refs.current[i] = el; }}
            style={{
              position: 'absolute',
              top,
              left,
              transform: `rotate(${baseRot}deg)`,
              color: 'var(--accent)',
              // Blue glow only in dark mode
              filter: isDark
                ? `drop-shadow(0 0 ${6 + (i % 4) * 3}px rgba(59,130,246,0.65))`
                : 'none',
              willChange: 'transform, opacity',
            }}
          >
            <Icon size={size} strokeWidth={1.25} />
          </div>
        );
      })}
    </div>
  );
}
