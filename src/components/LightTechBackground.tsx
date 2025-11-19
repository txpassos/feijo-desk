import { useEffect, useRef } from 'react';

const LightTechBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Partículas roxas
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // Snippets de código
    const codeSnippets: Array<{
      x: number;
      y: number;
      text: string;
      opacity: number;
      fadeDirection: number;
    }> = [];

    const codeLines = [
      'const future = await AI.create();',
      'function innovate() { return true; }',
      'if (tech === advanced) { deploy(); }',
      'while (learning) { evolve(); }',
      'React.useEffect(() => {})',
      'const data = fetch("/api/v2");',
      'import { Neural } from "brain";',
      'export default Intelligence;',
      'async function process() {}',
      'let quantum = superposition();'
    ];

    // Inicializar partículas
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    // Inicializar snippets de código
    for (let i = 0; i < 15; i++) {
      codeSnippets.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        text: codeLines[Math.floor(Math.random() * codeLines.length)],
        opacity: Math.random() * 0.4 + 0.1,
        fadeDirection: Math.random() > 0.5 ? 1 : -1
      });
    }

    // Linhas de conexão
    const lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      progress: number;
    }> = [];

    for (let i = 0; i < 8; i++) {
      lines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        progress: 0
      });
    }

    const drawGrid = () => {
      const gridSize = 50;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'; // Roxo mais forte
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Pontos de interseção brilhantes
      ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          if (Math.random() > 0.95) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(20, 15, 30, 0.1)'; // Escuro com transparência
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      // Desenhar linhas animadas
      lines.forEach(line => {
        line.progress += 0.005;
        if (line.progress > 1) {
          line.progress = 0;
          line.x1 = Math.random() * canvas.width;
          line.y1 = Math.random() * canvas.height;
          line.x2 = Math.random() * canvas.width;
          line.y2 = Math.random() * canvas.height;
        }

        const currentX = line.x1 + (line.x2 - line.x1) * line.progress;
        const currentY = line.y1 + (line.y2 - line.y1) * line.progress;

        ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * (1 - line.progress)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      });

      // Animar e desenhar snippets de código
      codeSnippets.forEach(snippet => {
        snippet.opacity += snippet.fadeDirection * 0.003;
        
        if (snippet.opacity > 0.5 || snippet.opacity < 0.05) {
          snippet.fadeDirection *= -1;
        }

        if (snippet.opacity < 0.05) {
          snippet.text = codeLines[Math.floor(Math.random() * codeLines.length)];
          snippet.x = Math.random() * canvas.width;
          snippet.y = Math.random() * canvas.height;
        }

        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = `rgba(168, 85, 247, ${snippet.opacity})`; // Roxo forte
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(snippet.text, snippet.x, snippet.y);
        ctx.shadowBlur = 0;
      });

      // Animar partículas
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(to bottom, #1a0f2e, #0f0a1f, #1a0f2e)'
      }}
    />
  );
};

export default LightTechBackground;