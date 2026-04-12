import React, { useRef, useState, useEffect } from "react";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(5);
  const [bgColor, setBgColor] = useState("#ffffff");

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = penColor;
    context.lineWidth = penSize;
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    context.strokeStyle = penColor;
    context.lineWidth = penSize;
  }, [penColor, penSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = bgColor;
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleBgColorChange = (e) => {
    setBgColor(e.target.value);
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = e.target.value;
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleEraser = () => {
    contextRef.current.strokeStyle = bgColor;
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2">
          🎨 Pen Color:
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2">
          🖌️ Pen Size:
          <input
            type="range"
            min="1"
            max="50"
            value={penSize}
            onChange={(e) => setPenSize(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2">
          🧱 Board Color:
          <input
            type="color"
            value={bgColor}
            onChange={handleBgColorChange}
          />
        </label>
        <button
          onClick={handleClear}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Clear
        </button>
        <button
          onClick={handleEraser}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Eraser
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border rounded shadow w-full h-[80vh] cursor-crosshair"
      />
    </div>
  );
};

export default Whiteboard;
