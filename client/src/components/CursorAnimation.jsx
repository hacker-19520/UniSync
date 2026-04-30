import { useEffect, useRef, useState } from 'react';

export default function CursorAnimation() {
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);
  const cursorGlow = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const onMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorDot.current) {
        cursorDot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'LABEL' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('label') ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('card') ||
        target.classList.contains('sidebar-item')
      ) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'LABEL' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('label') ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('card') ||
        target.classList.contains('sidebar-item')
      ) {
        setIsHovering(false);
      }
    };

    const animate = () => {
      const ease = 0.15;
      const glowEase = 0.08;

      ringPos.current.x += (pos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * ease;

      glowPos.current.x += (pos.current.x - glowPos.current.x) * glowEase;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * glowEase;

      if (cursorRing.current) {
        cursorRing.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      if (cursorGlow.current) {
        cursorGlow.current.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px)`;
      }

      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>
      {/* Main dot */}
      <div
        ref={cursorDot}
        className="cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isClicking ? '6px' : isHovering ? '10px' : '8px',
          height: isClicking ? '6px' : isHovering ? '10px' : '8px',
          backgroundColor: isHovering ? '#2563eb' : '#3b82f6',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-50%, -50%)',
          marginLeft: isClicking ? '-3px' : isHovering ? '-5px' : '-4px',
          marginTop: isClicking ? '-3px' : isHovering ? '-5px' : '-4px',
          transition: 'width 0.15s ease, height 0.15s ease, background-color 0.15s ease, margin 0.15s ease',
          mixBlendMode: 'difference',
        }}
      />
      {/* Trailing ring */}
      <div
        ref={cursorRing}
        className="cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '48px' : '32px',
          height: isHovering ? '48px' : '32px',
          border: isHovering ? '2px solid rgba(37, 99, 235, 0.5)' : '2px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-50%, -50%)',
          marginLeft: isHovering ? '-24px' : '-16px',
          marginTop: isHovering ? '-24px' : '-16px',
          transition: 'width 0.25s ease, height 0.25s ease, border 0.25s ease, margin 0.25s ease',
        }}
      />
      {/* Outer glow */}
      <div
        ref={cursorGlow}
        className="cursor-glow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '80px' : '64px',
          height: isHovering ? '80px' : '64px',
          background: isHovering
            ? 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99997,
          transform: 'translate(-50%, -50%)',
          marginLeft: isHovering ? '-40px' : '-32px',
          marginTop: isHovering ? '-40px' : '-32px',
          transition: 'width 0.35s ease, height 0.35s ease, background 0.35s ease, margin 0.35s ease',
        }}
      />
    </>
  );
}

