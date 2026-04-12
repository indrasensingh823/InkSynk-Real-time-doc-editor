import React, { useRef, useState, useEffect } from "react";
import '../styles/whiteboard.css';
import Sidebar from '../components/Sidebar';

const Whiteboard = () => {
    const [open, setOpen] = useState(true);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(5);
  const [bgColor, setBgColor] = useState("#ffffff");

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.whiteboard-container');
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${Math.random() * 8 + 4}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        container.appendChild(particle);
      }
    };
    createParticles();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.85;
    canvas.height = window.innerHeight * 0.75;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
  }, [penColor, penSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    canvasRef.current.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='${penColor.replace('#', '%23')}' opacity='0.8'/%3E%3C/svg%3E") 12 12, crosshair`;
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
    canvasRef.current.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='8' fill='${penColor.replace('#', '%23')}' opacity='0.8'/%3E%3C/svg%3E") 12 12, crosshair`;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.fillStyle = bgColor;
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add click animation
    const clearBtn = document.querySelector('.clear-button');
    clearBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      clearBtn.style.transform = '';
    }, 150);
  };

  const handleBgChange = (e) => {
    const newColor = e.target.value;
    setBgColor(newColor);
    const canvas = canvasRef.current;
    ctxRef.current.fillStyle = newColor;
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `whiteboard-${new Date().getTime()}.png`;
    link.click();
    
    // Add success animation
    const exportBtn = document.querySelector('.export-button');
    exportBtn.classList.add('export-success');
    setTimeout(() => exportBtn.classList.remove('export-success'), 600);
  };

  return (
    <div className="whiteboard-container">
             {/* Sidebar with toggle props */}
            <Sidebar open={open} setOpen={setOpen} />
      <div className="whiteboard-content">
        <div className="whiteboard-header">
          <h1 className="whiteboard-title">🎨 Digital Whiteboard</h1>
          <p className="whiteboard-subtitle">Create, draw, and express your ideas freely</p>
        </div>

        <div className="controls-container">
          <div className="control-group">
            <span className="control-label">
              <span className="icon">✏️</span>
              Pen Color
            </span>
            <div className="color-input-wrapper">
              <input 
                type="color" 
                value={penColor} 
                onChange={(e) => setPenColor(e.target.value)}
                className="color-input"
              />
            </div>
            <div className="tooltip">Choose your drawing color</div>
          </div>

          <div className="control-group">
            <span className="control-label">
              <span className="icon">📏</span>
              Pen Size
            </span>
            <div className="range-group">
              <input
                type="range"
                min="1"
                max="30"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value))}
                className="range-input"
              />
              <span className="range-value">{penSize}px</span>
            </div>
            <div className="tooltip">Adjust pen thickness</div>
          </div>

          <div className="control-group">
            <span className="control-label">
              <span className="icon">🎨</span>
              Background
            </span>
            <div className="color-input-wrapper">
              <input 
                type="color" 
                value={bgColor} 
                onChange={handleBgChange}
                className="color-input"
              />
            </div>
            <div className="tooltip">Change canvas background</div>
          </div>

          <div className="action-buttons">
            <button onClick={handleClear} className="action-button clear-button">
              <span className="icon">🧹</span>
              Clear
            </button>
            <button onClick={handleExport} className="action-button export-button">
              <span className="icon">⬇️</span>
              Export
            </button>
          </div>
        </div>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="whiteboard-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY,
              });
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              const mouseEvent = new MouseEvent("mouseup", {});
              canvasRef.current.dispatchEvent(mouseEvent);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;