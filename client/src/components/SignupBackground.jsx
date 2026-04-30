import { useEffect, useRef } from 'react';

export default function SignupBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles = [];
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? 220 : 260, // blue or purple
      });
    }

    // Floating orbs
    const orbs = [
      { x: 0.2, y: 0.3, r: 250, hue: 220, speed: 0.0003 },
      { x: 0.8, y: 0.7, r: 300, hue: 260, speed: 0.0002 },
      { x: 0.5, y: 0.2, r: 200, hue: 200, speed: 0.0004 },
      { x: 0.1, y: 0.8, r: 180, hue: 280, speed: 0.00035 },
      { x: 0.9, y: 0.1, r: 220, hue: 240, speed: 0.00025 },
    ];

    let time = 0;

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base gradient
      const baseGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      baseGradient.addColorStop(0, '#f0f4ff');
      baseGradient.addColorStop(0.5, '#f8f5ff');
      baseGradient.addColorStop(1, '#f0f9ff');
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated mesh gradient orbs
      orbs.forEach((orb, i) => {
        const ox = orb.x * canvas.width + Math.sin(time * orb.speed + i) * 80;
        const oy = orb.y * canvas.height + Math.cos(time * orb.speed * 1.3 + i) * 60;
        const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 75%, 0.45)`);
        gradient.addColorStop(0.4, `hsla(${orb.hue}, 70%, 70%, 0.2)`);
        gradient.addColorStop(1, `hsla(${orb.hue}, 60%, 65%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${p.opacity * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle dot grid
      ctx.fillStyle = 'rgba(100, 149, 237, 0.04)';
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const wave = Math.sin((x + time) * 0.01) * Math.cos((y + time) * 0.01) * 2;
          ctx.beginPath();
          ctx.arc(x + wave, y + wave, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

