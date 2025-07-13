import React, { useState, useRef, useEffect } from 'react';
import './Panel.css';

const Panel: React.FC = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    }
  };

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      className="container"
      onMouseDown={onMouseDown}
      style={{ top: position.y, left: position.x }}
    >
      <h1>Dev Tools Panel</h1>
      {/* ... existing panel content ... */}
    </div>
  );
};

export default Panel;
