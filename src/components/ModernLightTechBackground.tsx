import { useEffect, useRef } from "react";

const ModernLightTechBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Cores roxas para o tema claro
    const primaryColor = "rgba(147, 51, 234, 0.4)";
    const accentColor = "rgba(168, 85, 247, 0.7)";
    const glowColor = "rgba(147, 51, 234, 0.2)";

    class NeuralNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2 + Math.random() * 3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
        ctx.shadowBlur = 15;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class EnergyWave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 0;
        this.maxRadius = 100 + Math.random() * 100;
        this.opacity = 0.5;
      }

      update() {
        this.radius += 2;
        this.opacity -= 0.005;
      }

      draw() {
        ctx.strokeStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      isDead() {
        return this.opacity <= 0 || this.radius >= this.maxRadius;
      }
    }

    class HexCode {
      x: number;
      y: number;
      text: string;
      opacity: number;
      speed: number;

      constructor() {
        const hexChars = '0123456789ABCDEF';
        this.text = '0x' + Array.from({ length: 6 }, () => 
          hexChars[Math.floor(Math.random() * hexChars.length)]
        ).join('');
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.opacity = 0.6;
        this.speed = 0.3 + Math.random() * 0.5;
      }

      update() {
        this.y -= this.speed;
        this.opacity -= 0.003;
        
        if (this.y < -20) {
          this.y = canvas.height + 20;
          this.x = Math.random() * canvas.width;
          this.opacity = 0.6;
        }
      }

      draw() {
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.fillStyle = `rgba(147, 51, 234, ${this.opacity})`;
        ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, this.x, this.y);
        ctx.shadowBlur = 0;
      }
    }

    const drawModernGrid = () => {
      ctx.strokeStyle = "rgba(147, 51, 234, 0.08)";
      ctx.lineWidth = 1;

      const hexSize = 50;
      const hexHeight = hexSize * Math.sqrt(3);
      
      for (let y = -hexHeight; y < canvas.height + hexHeight; y += hexHeight * 0.75) {
        for (let x = -hexSize * 2; x < canvas.width + hexSize * 2; x += hexSize * 1.5) {
          const offsetX = (y / (hexHeight * 0.75)) % 2 === 0 ? 0 : hexSize * 0.75;
          drawHexagon(x + offsetX, y, hexSize);
        }
      }
    };

    const drawHexagon = (centerX: number, centerY: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      if (Math.random() < 0.02) {
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const nodes: NeuralNode[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push(new NeuralNode());
    }

    const waves: EnergyWave[] = [];
    const hexCodes: HexCode[] = [];
    for (let i = 0; i < 15; i++) {
      hexCodes.push(new HexCode());
    }

    const animate = () => {
      ctx.fillStyle = "rgba(15, 15, 25, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawModernGrid();

      nodes.forEach((node, i) => {
        node.update();
        node.draw();

        nodes.slice(i + 1).forEach(other => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      if (Math.random() < 0.02 && waves.length < 8) {
        waves.push(new EnergyWave());
      }

      waves.forEach((wave, index) => {
        wave.update();
        wave.draw();
        if (wave.isDead()) {
          waves.splice(index, 1);
        }
      });

      hexCodes.forEach(code => {
        code.update();
        code.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-60"
      style={{ background: "linear-gradient(to bottom, #0f0f19, #1a1a2e, #0f0f19)" }}
    />
  );
};

export default ModernLightTechBackground;
