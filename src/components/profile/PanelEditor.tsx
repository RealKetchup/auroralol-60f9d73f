import { useRef, useState } from "react";
import { Eye, EyeOff, GripVertical, Trash2, Plus } from "lucide-react";
import {
  BUILT_IN_TYPES,
  PANEL_LABELS,
  newPanelId,
  type PanelConfig,
  type PanelType,
} from "@/lib/panels";

type Props = {
  panels: PanelConfig[];
  accent: string;
  onChange: (next: PanelConfig[]) => void;
};

/** Click-to-select, drag-to-move, drag-edge-to-resize panel canvas. */
export function PanelEditor({ panels, accent, onChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const resize = useRef<{ id: string; startX: number; startW: number; col: number } | null>(null);

  const update = (id: string, p: Partial<PanelConfig>) =>
    onChange(panels.map(x => (x.id === id ? { ...x, ...p } : x)));

  const move = (from: string, to: string) => {
    if (from === to) return;
    const next = [...panels];
    const fi = next.findIndex(p => p.id === from);
    const ti = next.findIndex(p => p.id === to);
    if (fi < 0 || ti < 0) return;
    const [item] = next.splice(fi, 1);
    next.splice(ti, 0, item!);
    onChange(next);
  };

  const startResize = (e: React.PointerEvent, panel: PanelConfig) => {
    e.preventDefault();
    e.stopPropagation();
    const gw = gridRef.current?.clientWidth ?? 900;
    resize.current = { id: panel.id, startX: e.clientX, startW: panel.w, col: gw / 12 };
    const onMove = (ev: PointerEvent) => {
      const r = resize.current;
      if (!r) return;
      const delta = Math.round((ev.clientX - r.startX) / r.col);
      const w = Math.max(3, Math.min(12, r.startW + delta));
      update(r.id, { w });
    };
    const onUp = () => {
      resize.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const addPanel = (type: PanelType) => {
    const panel: PanelConfig = {
      id: newPanelId(type),
      type,
      w: type === "custom" ? 6 : 4,
      h: 0,
      hidden: false,
      ...(type === "custom" ? { title: "My panel", html: "<p>Write anything here.</p>" } : {}),
    };
    onChange([...panels, panel]);
    setSelected(panel.id);
  };

  const usedBuiltIns = new Set(panels.filter(p => p.type !== "custom").map(p => p.type));
  const sel = panels.find(p => p.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Drag a panel by its handle to reorder it, drag the right edge to resize, and click it to edit.
      </p>

      <div ref={gridRef} className="grid grid-cols-12 gap-2">
        {panels.map(p => (
          <div
            key={p.id}
            draggable
            onDragStart={() => setDragId(p.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragId) move(dragId, p.id); setDragId(null); }}
            onClick={() => setSelected(p.id)}
            className={`relative rounded-lg px-3 py-2.5 text-left select-none transition-all ${
              dragId === p.id ? "opacity-50" : ""
            } ${p.hidden ? "opacity-45" : ""}`}
            style={{
              gridColumn: `span ${p.w} / span ${p.w}`,
              minHeight: p.h ? Math.min(p.h, 240) : 62,
              border: selected === p.id ? `1px solid ${accent}` : "1px solid oklch(1 0 0 / 0.1)",
              background: selected === p.id ? `${accent}18` : "oklch(0.18 0.02 280 / 0.5)",
              boxShadow: selected === p.id ? `0 0 20px -8px ${accent}` : undefined,
            }}
          >
            <div className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 opacity-45 cursor-grab shrink-0" />
              <span className="text-xs font-medium truncate">
                {p.title || PANEL_LABELS[p.type]}
              </span>
              <span className="ml-auto text-[10px] font-mono opacity-50 shrink-0">{p.w}/12</span>
            </div>
            <div className="mt-1 text-[10px] font-mono opacity-45">{p.type}{p.hidden ? " · hidden" : ""}</div>
            <span
              onPointerDown={e => startResize(e, p)}
              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-lg hover:bg-foreground/10"
              aria-label="Resize panel"
            />
          </div>
        ))}
      </div>

      {sel && (
        <div className="rounded-lg p-3 space-y-3" style={{ border: `1px solid ${accent}55`, background: `${accent}0f` }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-70">Editing · {PANEL_LABELS[sel.type]}</span>
            <button onClick={() => update(sel.id, { hidden: !sel.hidden })}
                    className="ml-auto inline-flex items-center gap-1 text-xs glass-strong rounded-md px-2 py-1">
              {sel.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {sel.hidden ? "Hidden" : "Visible"}
            </button>
            <button onClick={() => { onChange(panels.filter(x => x.id !== sel.id)); setSelected(null); }}
                    className="inline-flex items-center gap-1 text-xs rounded-md px-2 py-1 text-destructive hover:bg-destructive/10">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>

          <label className="block">
            <div className="text-xs font-mono text-muted-foreground mb-1">Width · {sel.w}/12</div>
            <input type="range" min={3} max={12} step={1} value={sel.w} className="w-full accent-primary"
                   onChange={e => update(sel.id, { w: parseInt(e.target.value, 10) })} />
          </label>
          <label className="block">
            <div className="text-xs font-mono text-muted-foreground mb-1">
              Height · {sel.h ? `${sel.h}px` : "auto"}
            </div>
            <input type="range" min={0} max={900} step={20} value={sel.h} className="w-full accent-primary"
                   onChange={e => update(sel.id, { h: parseInt(e.target.value, 10) })} />
          </label>
          <label className="block">
            <div className="text-xs font-mono text-muted-foreground mb-1">Title</div>
            <input value={sel.title ?? ""} placeholder={PANEL_LABELS[sel.type]}
                   onChange={e => update(sel.id, { title: e.target.value })}
                   className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border" />
          </label>
          {sel.type === "custom" && (
            <label className="block">
              <div className="text-xs font-mono text-muted-foreground mb-1">Panel content (HTML)</div>
              <textarea value={sel.html ?? ""} rows={6}
                        onChange={e => update(sel.id, { html: e.target.value })}
                        className="w-full bg-input rounded-md px-3 py-2 text-xs font-mono border border-border" />
            </label>
          )}
        </div>
      )}

      <div>
        <div className="text-xs font-mono text-muted-foreground mb-1.5">Add a panel</div>
        <div className="flex flex-wrap gap-1.5">
          {BUILT_IN_TYPES.map(t => (
            <button key={t} onClick={() => addPanel(t)} disabled={usedBuiltIns.has(t)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-mono border border-border bg-input disabled:opacity-35">
              <Plus className="w-3 h-3 inline -mt-0.5 mr-1" />{PANEL_LABELS[t]}
            </button>
          ))}
          <button onClick={() => addPanel("custom")}
                  className="rounded-md px-2.5 py-1.5 text-xs font-mono border"
                  style={{ borderColor: accent, background: `${accent}1a` }}>
            <Plus className="w-3 h-3 inline -mt-0.5 mr-1" />Custom
          </button>
        </div>
      </div>
    </div>
  );
}
