/* eslint-disable react/prop-types */
import { useRef } from "react";
import { GripHorizontal, MoveDiagonal2 } from "lucide-react";
import { canvasHeight, canvasWidth, fitPosition, panelPosition } from "../../utils/splDashboardDefinition";

export default function DashboardCanvas({ panels, layout, selectedId, onSelect, onPosition, renderPanel }) {
  const canvas = useRef(null);
  const gesture = useRef(null);
  const absolute = layout === "absolute";
  const height = absolute ? Math.max(320, ...panels.map((panel, index) => {
    const position = panelPosition(panel, index);
    return position.y + position.height + 12;
  })) : undefined;

  const start = (event, panel, position, resize) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(panel.id);
    gesture.current = { id: panel.id, position, resize, clientX: event.clientX, clientY: event.clientY, scale: canvasWidth / canvas.current.clientWidth };
  };
  const move = (event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !gesture.current) return;
    const { id, position, resize, clientX, clientY, scale } = gesture.current;
    const dx = (event.clientX - clientX) * scale;
    const dy = event.clientY - clientY;
    onPosition(id, fitPosition(resize
      ? { ...position, width: Math.min(position.width + dx, canvasWidth - position.x), height: Math.min(position.height + dy, canvasHeight - position.y) }
      : { ...position, x: position.x + dx, y: position.y + dy }));
  };
  const end = () => { gesture.current = null; };

  return <div className={absolute ? "overflow-x-auto rounded-lg border border-fuchsia-300/15 bg-black/15" : ""}>
    <div ref={canvas} style={{ height }} className={absolute ? "relative min-w-[620px]" : "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3"}>
      {panels.map((panel, index) => {
        const position = panelPosition(panel, index);
        const selected = selectedId === panel.id;
        const style = absolute ? {
          left: `${position.x / canvasWidth * 100}%`, top: position.y,
          width: `${position.width / canvasWidth * 100}%`, height: position.height, zIndex: selected ? 2 : 1,
        } : undefined;
        return <section key={panel.id} style={style} className={`${absolute ? "absolute flex flex-col" : ""} min-w-0 rounded-lg border bg-[#181322] ${selected ? "border-fuchsia-400" : "border-white/10"}`}>
          <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1">
            {absolute && onPosition && <button type="button" title="Drag to move" aria-label={`Move ${panel.title}. Use position fields for keyboard input.`} className="touch-none cursor-grab p-2 text-slate-400 active:cursor-grabbing" onPointerDown={(event) => start(event, panel, position, false)} onPointerMove={move} onLostPointerCapture={end} onClick={() => onSelect(panel.id)}><GripHorizontal size={16}/></button>}
            {onSelect ? <button type="button" className="min-w-0 flex-1 truncate py-2 text-left text-sm font-medium" aria-pressed={selected} title={panel.title} onClick={() => onSelect(panel.id)}>{panel.title}</button> : <h4 className="truncate p-2 text-sm font-medium" title={panel.title}>{panel.title}</h4>}
          </div>
          <div className={`min-w-0 p-3 ${absolute ? "min-h-0 flex-1 overflow-auto pb-7" : "overflow-x-auto"}`}>{renderPanel(panel)}</div>
          {absolute && onPosition && <button type="button" title="Drag to resize" aria-label={`Resize ${panel.title}. Use size fields for keyboard input.`} className="absolute bottom-0 right-0 touch-none cursor-nwse-resize rounded bg-[#211a2b] p-2 text-fuchsia-200" onPointerDown={(event) => start(event, panel, position, true)} onPointerMove={move} onLostPointerCapture={end} onClick={() => onSelect(panel.id)}><MoveDiagonal2 size={14}/></button>}
        </section>;
      })}
    </div>
  </div>;
}
