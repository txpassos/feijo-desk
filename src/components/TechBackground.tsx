import { useEffect, useRef } from "react";

const TechBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajustar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Cores do tema (verde primário)
    const primaryColor = "rgba(34, 197, 94, 0.3)"; // green-500
    const accentColor = "rgba(34, 197, 94, 0.6)";
    const textColor = "rgba(34, 197, 94, 0.4)";

    // Grade/Grid com linhas hexagonais
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.08)";
      ctx.lineWidth = 1;

      const gridSize = 40;
      
      // Grade vertical
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Grade horizontal
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Pontos de intersecção brilhantes
      ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          if (Math.random() < 0.1) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    // Linhas cruzadas animadas
    class AnimatedLine {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = Math.random() * canvas.width;
        this.targetY = Math.random() * canvas.height;
        this.speed = 0.5 + Math.random() * 1.5;
      }

      update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          this.targetX = Math.random() * canvas.width;
          this.targetY = Math.random() * canvas.height;
        } else {
          this.x += (dx / distance) * this.speed;
          this.y += (dy / distance) * this.speed;
        }
      }

      draw() {
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.targetX, this.targetY);
        ctx.stroke();

        // Ponto brilhante
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Código sendo digitado
    class CodeSnippet {
      x: number;
      y: number;
      text: string;
      currentText: string;
      index: number;
      speed: number;
      opacity: number;
      fadeOut: boolean;

      constructor() {
        const codeLines = [
          "const AI = new Intelligence();",
          "function analyze() { return data; }",
          "if (system.active) { execute(); }",
          "class ServiceDesk extends TI {}",
          "await processRequest(protocol);",
          "for (let i = 0; i < tasks.length; i++)",
          "const response = await api.call();",
          "export default Dashboard;",
          "import { React } from 'react';",
          "sudo systemctl start service",
          "npm run build --production",
          "docker compose up -d",
          "git commit -m 'feat: update'",
          "SELECT * FROM requests WHERE status='active';",
          "UPDATE tickets SET priority='high';",
          "console.log('System initialized');",
          "throw new Error('Connection failed');",
          "try { connectDB(); } catch(e) {}",
          "const [state, setState] = useState();",
          "useEffect(() => { fetchData(); }, []);",
        ];
        
        this.x = Math.random() * (canvas.width - 400);
        this.y = 50 + Math.random() * (canvas.height - 150);
        this.text = codeLines[Math.floor(Math.random() * codeLines.length)];
        this.currentText = "";
        this.index = 0;
        this.speed = 2 + Math.random() * 3;
        this.opacity = 1;
        this.fadeOut = false;
      }

      update() {
        if (!this.fadeOut && this.index < this.text.length) {
          if (Math.random() < 0.1) {
            this.currentText = this.text.substring(0, this.index);
            this.index++;
          }
        } else if (!this.fadeOut && this.index >= this.text.length) {
          setTimeout(() => {
            this.fadeOut = true;
          }, 2000);
        } else if (this.fadeOut) {
          this.opacity -= 0.02;
        }
      }

      draw() {
        ctx.font = "bold 13px 'Courier New', 'Consolas', monospace";
        
        // Sombra verde brilhante
        ctx.shadowColor = "rgba(34, 197, 94, 0.8)";
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity * 0.7})`;
        ctx.fillText(this.currentText, this.x, this.y);
        
        // Resetar sombra
        ctx.shadowBlur = 0;
      }

      isDead() {
        return this.opacity <= 0;
      }
    }

    // Partículas flutuantes
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 1 + Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Criar elementos
    const lines: AnimatedLine[] = [];
    for (let i = 0; i < 8; i++) {
      lines.push(new AnimatedLine());
    }

    const codeSnippets: CodeSnippet[] = [];
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    // Loop de animação
    const animate = () => {
      // Fundo escuro com fade suave
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar grade
      drawGrid();

      // Atualizar e desenhar partículas
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Atualizar e desenhar linhas
      lines.forEach((line) => {
        line.update();
        line.draw();
      });

      // Gerenciar snippets de código (mais frequentes)
      if (Math.random() < 0.03 && codeSnippets.length < 12) {
        codeSnippets.push(new CodeSnippet());
      }

      codeSnippets.forEach((snippet, index) => {
        snippet.update();
        snippet.draw();
        if (snippet.isDead()) {
          codeSnippets.splice(index, 1);
        }
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
      className="fixed inset-0 -z-10 opacity-50"
      style={{ background: "linear-gradient(to bottom, #000000, #0a0a0a, #000000)" }}
    />
  );
};

export default TechBackground;
