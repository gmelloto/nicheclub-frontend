import { useRef, useState } from 'react';

export default function SwipeDelete({ children, onDelete, label = 'Excluir' }) {
  const ref = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const threshold = 80;

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };

  const onTouchMove = (e) => {
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    if (diff > 0) {
      setOffset(Math.min(diff, 100));
    } else if (swiped) {
      setOffset(Math.max(100 + (startX.current - currentX.current), 0));
    }
  };

  const onTouchEnd = () => {
    if (offset > threshold) {
      setOffset(100);
      setSwiped(true);
    } else {
      setOffset(0);
      setSwiped(false);
    }
  };

  const reset = () => {
    setOffset(0);
    setSwiped(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm && onDelete) {
      onDelete();
    }
    reset();
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      {/* Delete button behind */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 100,
        background: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0 12px 12px 0',
      }}>
        <button onClick={handleDelete}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            fontFamily: "'Inter', sans-serif", cursor: 'pointer', padding: '0 16px', height: '100%',
            display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          {label}
        </button>
      </div>

      {/* Card content */}
      <div
        ref={ref}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: offset === 0 || offset === 100 ? 'transform 0.25s ease' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
