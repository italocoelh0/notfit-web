
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatPace } from '../lib/geolocation';

interface StatItem {
  id: string;
  value: string;
  label: string;
}

interface TextItem {
  id: string;
  text: string;
  font: string;
  color: string;
  backgroundColor?: string;
  textStyle: 'none' | 'fill' | 'neon';
  fontSize: number;
  align: 'left' | 'center' | 'right';
  rotation: number;
  scale: number;
}

interface ActivitySticker {
    id: string;
    stats: { distance: number; time: number; pace: number };
    variant: 'glass' | 'minimal' | 'orange';
}

interface LocationItem {
    id: string;
    text: string;
}

type EditorElementData = 
  | (StatItem & { type: 'stat' }) 
  | (TextItem & { type: 'text' })
  | (ActivitySticker & { type: 'activity-sticker' })
  | (LocationItem & { type: 'location' });

type EditorElement = EditorElementData & { position: { x: number; y: number } };

interface ImageEditorProps {
  mode: 'share' | 'edit' | 'photo-edit';
  stats?: { distance: number; time: number; pace: number; elevationGain?: number };
  baseImage?: string | null;
  onClose: () => void;
  onSave?: (imageData: string) => void;
  onPublish?: (imageData: string) => void;
}

const FONTS = [
    { id: 'font-anton', label: 'Moderno', family: 'Anton' },
    { id: 'font-bebas', label: 'Forte', family: '"Bebas Neue"' },
    { id: 'font-sans', label: 'Clássico', family: 'Inter' },
    { id: 'font-lobster', label: 'Cursiva', family: 'Lobster' },
    { id: 'font-pacifico', label: 'Brush', family: 'Pacifico' },
    { id: 'font-oswald', label: 'Condensado', family: 'Oswald' },
    { id: 'font-orbitron', label: 'Tech', family: 'Orbitron' },
];

const COLORS = [
    '#FFFFFF', '#000000', '#EF4444', '#F97316', '#F59E0B', 
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
];

const FILTERS = [
    { name: 'Normal', filter: 'none' },
    { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
    { name: 'B&W', filter: 'grayscale(100%) contrast(1.2)' },
    { name: 'Vintage', filter: 'sepia(0.5) contrast(0.9) brightness(1.1)' },
    { name: 'Cyber', filter: 'saturate(2) hue-rotate(10deg)' },
];

const DraggableItem: React.FC<{
  item: EditorElement;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onSelect: (item: EditorElement | null) => void;
  isSelected: boolean;
  onEdit: () => void;
}> = ({ item, onUpdate, onSelect, isSelected, onEdit }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchState = useRef({
      dist: 0, angle: 0, startX: 0, startY: 0, startPosX: 0, startPosY: 0,
      startRotation: 0, startScale: 1, isGesture: false, lastX: item.position.x, lastY: item.position.y
  });

  const handleTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      onSelect(item);
      const touch = e.touches[0];
      if (e.touches.length === 1) {
          touchState.current.isGesture = false;
          touchState.current.startX = touch.clientX;
          touchState.current.startY = touch.clientY;
          touchState.current.startPosX = item.position.x;
          touchState.current.startPosY = item.position.y;
      } else if (e.touches.length === 2) {
          touchState.current.isGesture = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          touchState.current.dist = Math.sqrt(dx * dx + dy * dy);
          touchState.current.angle = Math.atan2(dy, dx) * (180 / Math.PI);
          if(item.type === 'text') {
              touchState.current.startRotation = (item as TextItem).rotation;
              touchState.current.startScale = (item as TextItem).scale;
          }
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault(); e.stopPropagation();
      if (e.touches.length === 1 && !touchState.current.isGesture) {
          const dx = e.touches[0].clientX - touchState.current.startX;
          const dy = e.touches[0].clientY - touchState.current.startY;
          const newX = touchState.current.startPosX + dx;
          const newY = touchState.current.startPosY + dy;
          touchState.current.lastX = newX; touchState.current.lastY = newY;
          if (elementRef.current) {
              elementRef.current.style.left = `${newX}px`;
              elementRef.current.style.top = `${newY}px`;
          }
      } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const newDist = Math.sqrt(dx * dx + dy * dy);
          const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          if(item.type === 'text') {
              const scaleDelta = newDist / touchState.current.dist;
              const angleDelta = newAngle - touchState.current.angle;
              onUpdate(item.id, {
                  scale: Math.max(0.5, Math.min(3.0, touchState.current.startScale * scaleDelta)),
                  rotation: touchState.current.startRotation + angleDelta
              } as any);
          }
      }
  };

  const handleTouchEnd = () => {
      if (!touchState.current.isGesture) {
          onUpdate(item.id, { position: { x: touchState.current.lastX, y: touchState.current.lastY } } as any);
      }
      touchState.current.isGesture = false;
  }

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute', left: item.position.x, top: item.position.y,
        zIndex: isSelected ? 50 : 10,
        transform: `translate(-50%, -50%) rotate(${item.type === 'text' ? (item as TextItem).rotation : 0}deg) scale(${item.type === 'text' ? (item as TextItem).scale : 1})`,
        touchAction: 'none', width: 'max-content', cursor: 'move'
      }}
      className={`select-none ${isSelected && item.type !== 'text' ? 'ring-1 ring-white/50 rounded-lg' : ''}`}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      onClick={(e) => { e.stopPropagation(); onSelect(item); }}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(); }}
    >
      {item.type === 'stat' && (
        <div className="text-center p-2 text-white pointer-events-none">
            <p className="text-5xl font-bold font-bebas">{item.value}</p>
            <p className="text-lg uppercase tracking-wider font-sans font-bold">{item.label}</p>
        </div>
      )}
      {item.type === 'text' && (
          <div style={{
              color: (item as TextItem).textStyle === 'fill' ? ((item as TextItem).color === '#FFFFFF' ? '#000000' : '#FFFFFF') : (item as TextItem).color,
              fontSize: `${(item as TextItem).fontSize}px`,
              textAlign: (item as TextItem).align,
              textShadow: (item as TextItem).textStyle === 'neon' ? `0 0 10px ${(item as TextItem).color}, 0 0 20px ${(item as TextItem).color}` : 'none',
              fontFamily: FONTS.find(f => f.id === (item as TextItem).font)?.family,
              backgroundColor: (item as TextItem).textStyle === 'fill' ? (item as TextItem).color : 'transparent',
              padding: (item as TextItem).textStyle === 'fill' ? '8px 16px' : '0',
              borderRadius: (item as TextItem).textStyle === 'fill' ? '12px' : '0',
              display: 'inline-block', fontWeight: 'bold'
          }}>{(item as TextItem).text}</div>
      )}
      {item.type === 'activity-sticker' && (
          <div className={`p-4 rounded-2xl border flex gap-4 items-center shadow-xl ${(item as ActivitySticker).variant === 'orange' ? 'bg-gradient-to-br from-primary to-orange-600 border-primary/50' : 'bg-black/40 backdrop-blur-md border-white/10'}`}>
               <i className="fa-solid fa-person-running text-2xl text-white"></i>
               <div className="flex gap-4">
                   <div><p className="text-2xl font-anton text-white">{(item as ActivitySticker).stats.distance.toFixed(2)}</p><p className="text-[10px] uppercase font-bold text-white/60">km</p></div>
                   <div><p className="text-2xl font-anton text-white">{formatTime((item as ActivitySticker).stats.time)}</p><p className="text-[10px] uppercase font-bold text-white/60">Tempo</p></div>
               </div>
          </div>
      )}
    </div>
  );
};

const ImageEditor: React.FC<ImageEditorProps> = ({ mode, stats, baseImage, onClose, onSave, onPublish }) => {
  const [background, setBackground] = useState<string | null>(baseImage || null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [activeTool, setActiveTool] = useState<'none' | 'filters' | 'crop'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [bgTransform, setBgTransform] = useState({ scale: 1, x: 0, y: 0 });
  const bgTouchState = useRef({ dist: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startScale: 1 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const TARGET_WIDTH = 1080;
  const TARGET_HEIGHT = 1440;

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || mode === 'photo-edit') return;
    if (elements.length > 0) return;
    if (stats) {
      const centerX = container.offsetWidth / 2;
      setElements([
        { id: 'stat-dist', type: 'stat', value: stats.distance.toFixed(2), label: 'Distância (km)', position: { x: centerX, y: container.offsetHeight * 0.25 } } as EditorElement,
        { id: 'stat-time', type: 'stat', value: formatTime(stats.time), label: 'Tempo', position: { x: centerX, y: container.offsetHeight * 0.45 } } as EditorElement,
      ]);
    }
  }, [stats, mode, elements.length]);

  // FIX: Added handleUpdateElement to fix missing function error and handle type complexities
  const handleUpdateElement = (id: string, updates: Partial<any>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } as EditorElement : el)));
    if (selectedElement?.id === id) {
        setSelectedElement(prev => prev ? { ...prev, ...updates } as EditorElement : null);
    }
  };

  const generateImage = async (): Promise<string> => {
    const container = imageContainerRef.current;
    if (!container) throw new Error("Container not found");
    const canvas = document.createElement('canvas');
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");

    if (background) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
            img.onload = () => { 
                ctx.filter = activeFilter;
                ctx.save();
                const uiToFinalScale = TARGET_WIDTH / container.offsetWidth;
                ctx.translate(TARGET_WIDTH / 2 + (bgTransform.x * uiToFinalScale), TARGET_HEIGHT / 2 + (bgTransform.y * uiToFinalScale));
                ctx.scale(bgTransform.scale, bgTransform.scale);
                ctx.translate(-TARGET_WIDTH / 2, -TARGET_HEIGHT / 2);
                const ratio = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
                const cx = (TARGET_WIDTH - img.width * ratio) / 2;
                const cy = (TARGET_HEIGHT - img.height * ratio) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
                ctx.restore();
                ctx.filter = 'none'; 
                resolve(); 
            };
            img.onerror = reject;
            img.src = background;
        });
    }

    const scaleFactor = TARGET_WIDTH / container.offsetWidth;
    elements.forEach(el => {
        ctx.save();
        ctx.translate(el.position.x * scaleFactor, el.position.y * scaleFactor);
        ctx.scale(scaleFactor, scaleFactor);
        
        if (el.type === 'text') {
            const t = el as TextItem;
            ctx.rotate((t.rotation * Math.PI) / 180);
            ctx.scale(t.scale, t.scale);
            ctx.font = `bold ${t.fontSize}px ${FONTS.find(f => f.id === t.font)?.family || 'sans-serif'}`;
            ctx.textAlign = t.align; ctx.textBaseline = 'middle';
            const lines = t.text.split('\n');
            const lineHeight = t.fontSize * 1.2;
            if (t.textStyle === 'fill') {
                ctx.fillStyle = t.color;
                const maxW = Math.max(...lines.map(l => ctx.measureText(l).width));
                ctx.fillRect(-(maxW+30)/2, -((lines.length*lineHeight)+10)/2, maxW+30, (lines.length*lineHeight)+10);
                ctx.fillStyle = t.color === '#FFFFFF' ? '#000' : '#FFF';
            } else {
                ctx.fillStyle = t.color;
                if(t.textStyle === 'neon') { ctx.shadowColor = t.color; ctx.shadowBlur = 15; }
            }
            lines.forEach((line, i) => ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineHeight));
        } else if (el.type === 'stat') {
            ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.font = 'bold 50px "Bebas Neue"'; ctx.fillText(el.value, 0, 0);
            ctx.font = 'bold 15px Inter'; ctx.fillText(el.label.toUpperCase(), 0, 30);
        }
        ctx.restore();
    });

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  return (
    <motion.div className="fixed inset-0 bg-black z-[50] flex flex-col items-center justify-center overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-safe flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/20 backdrop-blur-md"><i className="fa-solid fa-xmark text-2xl"></i></button>
          <button onClick={async () => { setIsProcessing(true); const img = await generateImage(); onPublish ? onPublish(img) : onSave?.(img); setIsProcessing(false); }} className="h-10 px-6 bg-white text-black rounded-full font-anton uppercase tracking-widest text-sm shadow-xl flex items-center gap-2">
              {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Publicar'}
          </button>
      </div>

      {/* Canvas 3:4 Container */}
      <div 
        ref={imageContainerRef} 
        className="relative bg-[#121212] overflow-hidden shadow-2xl border border-white/5" 
        style={{ width: 'min(90vw, 400px)', aspectRatio: '3/4' }}
        onTouchStart={(e) => { if(activeTool==='crop'){ if(e.touches.length===1){ bgTouchState.current.startX=e.touches[0].clientX-bgTransform.x; bgTouchState.current.startY=e.touches[0].clientY-bgTransform.y;} else if(e.touches.length===2){ const dx=e.touches[0].clientX-e.touches[1].clientX; const dy=e.touches[0].clientY-e.touches[1].clientY; bgTouchState.current.dist=Math.sqrt(dx*dx+dy*dy); bgTouchState.current.startScale=bgTransform.scale; }}}}
        onTouchMove={(e) => { if(activeTool==='crop'){ e.preventDefault(); if(e.touches.length===1){ setBgTransform(p=>({...p, x:e.touches[0].clientX-bgTouchState.current.startX, y:e.touches[0].clientY-bgTouchState.current.startY})); } else if(e.touches.length===2){ const dx=e.touches[0].clientX-e.touches[1].clientX; const dy=e.touches[0].clientY-e.touches[1].clientY; const d=Math.sqrt(dx*dx+dy*dy); setBgTransform(p=>({...p, scale:Math.max(1, bgTouchState.current.startScale*(d/bgTouchState.current.dist))})); }}}}
      >
        {background && ( 
            <img src={background} className="w-full h-full object-cover pointer-events-none" alt="" 
                 style={{ filter: activeFilter, transform: `translate(${bgTransform.x}px, ${bgTransform.y}px) scale(${bgTransform.scale})` }} /> 
        )}
        <AnimatePresence>
            {/* FIX: Use handleUpdateElement for consistency and type safety */}
            {elements.map(el => (el.id !== editingTextId && <DraggableItem key={el.id} item={el} onUpdate={handleUpdateElement} onSelect={setSelectedElement} isSelected={el.id === selectedElement?.id} onEdit={() => el.type==='text' && setEditingTextId(el.id)} />))}
        </AnimatePresence>
      </div>

      {/* Bottom Tools */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe pt-6 bg-gradient-to-t from-black to-transparent flex flex-col">
          <div className="flex items-center justify-around px-6 pb-6">
              {/* FIX: Added as EditorElement cast to fix state update error */}
              <button onClick={() => { const id=`t-${Date.now()}`; setElements(p=>[...p, {id, type:'text', text:'Novo Texto', font:'font-anton', color:'#FFFFFF', textStyle:'none', fontSize:30, align:'center', rotation:0, scale:1, position:{x:200, y:260}} as EditorElement]); setEditingTextId(id); }} className="flex flex-col items-center gap-1 text-white">
                  <div className="w-12 h-12 bg-surface-200/50 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="font-anton text-2xl">Aa</span></div>
                  <span className="text-[10px] font-medium">Texto</span>
              </button>
              <button onClick={() => setActiveTool(activeTool==='crop'?'none':'crop')} className={`flex flex-col items-center gap-1 ${activeTool==='crop'?'text-primary':'text-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${activeTool==='crop'?'bg-white text-black':'bg-surface-200/50'}`}><i className="fa-solid fa-crop-simple text-xl"></i></div>
                  <span className="text-[10px] font-medium">Ajustar</span>
              </button>
              <button onClick={() => setActiveTool(activeTool==='filters'?'none':'filters')} className={`flex flex-col items-center gap-1 ${activeTool==='filters'?'text-primary':'text-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${activeTool==='filters'?'bg-white text-black':'bg-surface-200/50'}`}><i className="fa-solid fa-wand-magic-sparkles text-xl"></i></div>
                  <span className="text-[10px] font-medium">Filtros</span>
              </button>
          </div>
          {activeTool === 'filters' && (
             <div className="flex gap-4 overflow-x-auto px-6 pb-8 hide-scrollbar">
                {FILTERS.map(f => (
                    <button key={f.name} onClick={() => setActiveFilter(f.filter)} className="flex flex-col items-center gap-2 min-w-[60px]">
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${activeFilter === f.filter ? 'border-primary' : 'border-white/20'}`}><img src={background!} className="w-full h-full object-cover" style={{ filter: f.filter }} alt={f.name} /></div>
                        <span className="text-[10px] text-white font-bold">{f.name}</span>
                    </button>
                ))}
             </div>
          )}
      </div>
      
      {editingTextId && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col p-4 pt-safe">
              <div className="flex justify-end mb-10">
                  <button onClick={() => setEditingTextId(null)} className="text-white font-bold text-lg">Concluir</button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                  <textarea 
                    autoFocus 
                    className="bg-transparent border-none outline-none text-white text-4xl font-anton text-center w-full"
                    value={elements.find(e=>e.id===editingTextId)?.type==='text' ? (elements.find(e=>e.id===editingTextId) as TextItem).text : ''}
                    onChange={(e)=>handleUpdateElement(editingTextId!, {text: e.target.value})}
                  />
              </div>
          </div>
      )}
    </motion.div>
  );
};

export default ImageEditor;
