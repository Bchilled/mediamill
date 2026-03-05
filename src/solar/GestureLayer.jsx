import { useState, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const PIPELINE = [
  { id: 'ideas',   type: 'Ideas',   color: '#7C6EFA', icon: '✦', title: '12 topics ready',      body: 'Trending stories in your niche. Throw left to skip, right to start.' },
  { id: 'scripts', type: 'Scripts', color: '#00DDB3', icon: '✎', title: '3 scripts drafted',     body: 'AI-written, ready for your voice. Review before recording.' },
  { id: 'voice',   type: 'Voice',   color: '#FFB020', icon: '◎', title: 'Voice ready',           body: 'ElevenLabs connected. 2 voices available for narration.' },
  { id: 'edit',    type: 'Edit',    color: '#FF6B9D', icon: '⬡', title: 'Auto-edit queued',      body: 'B-roll, captions, music — all automated. Review the cut.' },
  { id: 'publish', type: 'Publish', color: '#FF4757', icon: '▲', title: '1 video ready to go',   body: 'Title, thumbnail, description generated. Hit publish.' },
];

function Card({ item, style, onThrow, isTop }) {
  const [spring, api] = useSpring(() => ({
    x: 0, y: 0, rot: 0, scale: 1, opacity: 1,
  }));

  const bind = useDrag(({ active, movement: [mx, my], velocity: [vx], direction: [dx] }) => {
    if (active) {
      api.start({
        x: mx, y: my * 0.25,
        rot: mx / 14,
        scale: 1.04,
        opacity: Math.max(0.3, 1 - Math.abs(mx) / 500),
        immediate: true,
      });
    } else {
      const thrown = Math.abs(vx) > 0.35 || Math.abs(mx) > 160;
      if (thrown && isTop) {
        const dir = dx > 0 ? 1 : -1;
        api.start({
          x: dir * (window.innerWidth + 300),
          rot: dir * 40,
          opacity: 0,
          scale: 0.85,
          config: { tension: 160, friction: 18 },
          onRest: () => onThrow(item.id, dir),
        });
      } else {
        api.start({ x: 0, y: 0, rot: 0, scale: 1, opacity: 1, config: config.wobbly });
      }
    }
  }, { filterTaps: true });

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        position: 'absolute',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isTop ? 'grab' : 'default',
        x: spring.x,
        y: spring.y,
        rotate: spring.rot.to(r => `${r}deg`),
        scale: spring.scale,
        opacity: spring.opacity,
        ...style,
      }}
    >
      <div style={{
        width: 260,
        background: 'rgba(6,4,16,0.9)',
        border: `1px solid ${item.color}33`,
        borderRadius: 20,
        padding: '24px 26px 20px',
        backdropFilter: 'blur(30px)',
        boxShadow: `0 0 0 1px ${item.color}11, 0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${item.color}11`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: item.color + '18',
            border: `1px solid ${item.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: item.color,
          }}>{item.icon}</div>
          <div style={{ fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {item.type}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#EEEEFF', marginBottom: 8, lineHeight: 1.2 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(238,238,255,0.38)', lineHeight: 1.7, marginBottom: 18 }}>
          {item.body}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: 'rgba(238,238,255,0.15)', letterSpacing: '0.06em' }}>
            ← skip · action →
          </div>
          <button
            onPointerDown={e => e.stopPropagation()}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: item.color + '20',
              border: `1px solid ${item.color}44`,
              color: item.color, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Open
          </button>
        </div>
      </div>
    </animated.div>
  );
}

export default function GestureLayer() {
  const [deck, setDeck] = useState(PIPELINE);

  const handleThrow = useCallback((id, dir) => {
    setDeck(prev => {
      const thrown = prev.find(c => c.id === id);
      const rest = prev.filter(c => c.id !== id);
      // put thrown card at back of deck
      return thrown ? [...rest, thrown] : rest;
    });
  }, []);

  if (!deck.length) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 20,
    }}>
      {/* Render deck back-to-front so top card is last (highest z) */}
      {[...deck].reverse().map((item, ri) => {
        const i = deck.length - 1 - ri; // actual index (0 = top)
        const isTop = i === 0;
        const offset = i * 6;
        const scale = 1 - i * 0.05;
        return (
          <Card
            key={item.id}
            item={item}
            isTop={isTop}
            onThrow={handleThrow}
            style={{
              pointerEvents: isTop ? 'all' : 'none',
              zIndex: deck.length - i,
              transform: `translateY(${offset}px) scale(${scale})`,
              filter: i > 0 ? `brightness(${1 - i * 0.15})` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
