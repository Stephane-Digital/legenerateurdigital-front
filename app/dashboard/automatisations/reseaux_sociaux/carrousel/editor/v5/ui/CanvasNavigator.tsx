"use client";

import { useCallback, useRef, useState } from "react";
import { Stage } from "react-konva";

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

export default function CanvasNavigator({ width, height, children }: Props) {
  const stageRef = useRef<any>();
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  /* 🔍 ZOOM */
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
    const oldScale = scale;
    const mousePointTo = {
      x: e.evt.offsetX / oldScale - pos.x / oldScale,
      y: e.evt.offsetY / oldScale - pos.y / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setPos({
      x: -(mousePointTo.x - e.evt.offsetX / newScale),
      y: -(mousePointTo.y - e.evt.offsetY / newScale),
    });
  }, [scale, pos]);

  /* 🖱️ PAN = clic droit + drag */
  const handleMouseDown = (e: any) => {
    if (e.evt.buttons === 2) stageRef.current.isDragging(true);
  };

  const handleMouseUp = () => {
    stageRef.current.isDragging(false);
  };

  const handleDragMove = () => {
    const { x, y } = stageRef.current.position();
    setPos({ x, y });
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      x={pos.x}
      y={pos.y}
      scaleX={scale}
      scaleY={scale}
      draggable
      onDragMove={handleDragMove}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="rounded-xl shadow-2xl bg-black border border-yellow-500/20"
    >
      {children}
    </Stage>
  );
}
