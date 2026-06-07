import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ParticleEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      size: number;
      speed: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];

    const colors = ['#D4A574', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B', '#6366F1'];

    // 创建汇聚粒子
    const createParticle = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 300 + 100;

      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        targetX: centerX + Math.cos(angle) * (Math.random() * 50 + 20),
        targetY: centerY + Math.sin(angle) * (Math.random() * 50 + 20),
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 100 + 50,
      });
    };

    // 初始创建粒子
    for (let i = 0; i < 80; i++) {
      createParticle();
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 添加新的粒子
      if (particles.length < 100 && Math.random() > 0.9) {
        createParticle();
      }

      particles.forEach((particle, index) => {
        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0, 1 - particle.life / particle.maxLife);
        ctx.fill();

        // 添加光晕效果
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0, 0.3 - particle.life / particle.maxLife * 0.3);
        ctx.fill();

        // 更新位置（向中心汇聚）
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        particle.x += dx * 0.02;
        particle.y += dy * 0.02;

        // 更新生命值
        particle.life++;

        // 移除死亡的粒子
        if (particle.life >= particle.maxLife) {
          particles.splice(index, 1);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleEffect;