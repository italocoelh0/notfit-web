
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
  font: string; // Changed to string to support dynamic fonts
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

// --- Constants ---

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

// --- Sub-Components ---

const DraggableItem: React.FC<{
  item: EditorElement;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onSelect: (item: EditorElement | null) => void;
  isSelected: boolean;
  onEdit: () => void;
}> = ({ item, onUpdate, onSelect, isSelected, onEdit }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Use refs for tracking to avoid re-renders during high-frequency drag events
  const touchState = useRef({
      dist: 0,
      angle: 0,
      startX: 0,
      startY: 0,
      startPosX: 0,
      startPosY: 0,
      startRotation: 0,
      startScale: 1,
      isGesture: false,
      lastX: item.position.x,
      lastY: item.position.y
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
          touchState.current.lastX = item.position.x;
          touchState.current.lastY = item.position.y;
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
      e.preventDefault();
      e.stopPropagation();

      if (e.touches.length === 1 && !touchState.current.isGesture) {
          // DIRECT DOM MANIPULATION
          const dx = e.touches[0].clientX - touchState.current.startX;
          const dy = e.touches[0].clientY - touchState.current.startY;
          
          const newX = touchState.current.startPosX + dx;
          const newY = touchState.current.startPosY + dy;
          
          touchState.current.lastX = newX;
          touchState.current.lastY = newY;

          if (elementRef.current) {
              elementRef.current.style.left = `${newX}px`;
              elementRef.current.style.top = `${newY}px`;
          }
      } else if (e.touches.length === 2) {
          // Gestures
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
              });
          }
      }
  };

  const handleTouchEnd = () => {
      if (!touchState.current.isGesture) {
          if (touchState.current.lastX !== touchState.current.startPosX || 
              touchState.current.lastY !== touchState.current.startPosY) {
              onUpdate(item.id, { 
                  position: { 
                      x: touchState.current.lastX, 
                      y: touchState.current.lastY 
                  } 
              });
          }
      }
      touchState.current.isGesture = false;
  }

  const toggleStickerVariant = () => {
      if (item.type !== 'activity-sticker') return;
      const variants: ('glass' | 'minimal' | 'orange')[] = ['glass', 'minimal', 'orange'];
      const currentIndex = variants.indexOf((item as ActivitySticker).variant);
      const nextVariant = variants[(currentIndex + 1) % variants.length];
      onUpdate(item.id, { variant: nextVariant } as any);
  };

  const renderTextContent = (t: TextItem) => {
      const isFill = t.textStyle === 'fill';
      const isNeon = t.textStyle === 'neon';
      const baseStyle: React.CSSProperties = {
          color: isFill ? (t.color === '#FFFFFF' ? '#000000' : '#FFFFFF') : t.color,
          fontSize: `${t.fontSize}px`,
          textAlign: t.align,
          lineHeight: 1.2,
          textShadow: isNeon ? `0 0 10px ${t.color}, 0 0 20px ${t.color}` : 'none',
          fontFamily: FONTS.find(f => f.id === t.font)?.family,
          fontWeight: 'normal', // Changed to normal to let fonts handle their own weight
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          pointerEvents: 'none',
      };
      const containerStyle: React.CSSProperties = {
          backgroundColor: isFill ? t.color : 'transparent',
          padding: isFill ? '8px 16px' : '0',
          borderRadius: isFill ? '12px' : '0',
          display: 'inline-block',
          minWidth: '10px',
      };
      return <div style={containerStyle}><div style={baseStyle}>{t.text}</div></div>;
  };

  const renderActivitySticker = (s: ActivitySticker) => {
      const { distance, time, pace } = s.stats;
      
      if (s.variant === 'minimal') {
          return (
              <div className="flex flex-col items-center select-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-anton text-white">{distance.toFixed(2)}</span>
                      <span className="text-sm font-bold text-primary uppercase">km</span>
                  </div>
                  <div className="flex gap-4 text-white/90 font-bold text-sm">
                      <span>{formatTime(time)}</span>
                      <span>{formatPace(pace)} /km</span>
                  </div>
              </div>
          );
      }

      const bgClass = s.variant === 'orange' 
          ? 'bg-gradient-to-br from-primary to-orange-600 border-primary/50' 
          : 'bg-black/40 backdrop-blur-md border-white/10';

      const textClass = 'text-white';
      const labelClass = 'text-white/60';

      return (
          <div className={`p-4 rounded-2xl border flex gap-4 items-center shadow-xl select-none ${bgClass}`}>
               <div className="flex flex-col items-center border-r border-white/10 pr-4">
                   <i className="fa-solid fa-person-running text-2xl mb-1 text-white"></i>
                   <span className="text-[10px] font-bold uppercase tracking-wider text-white">Run</span>
               </div>
               <div className="flex gap-4">
                   <div>
                       <p className={`text-2xl font-anton ${textClass}`}>{distance.toFixed(2)}</p>
                       <p className={`text-[10px] uppercase font-bold ${labelClass}`}>km</p>
                   </div>
                   <div>
                       <p className={`text-2xl font-anton ${textClass}`}>{formatTime(time)}</p>
                       <p className={`text-[10px] uppercase font-bold ${labelClass}`}>Tempo</p>
                   </div>
                   <div>
                       <p className={`text-2xl font-anton ${textClass}`}>{formatPace(pace)}</p>
                       <p className={`text-[10px] uppercase font-bold ${labelClass}`}>Pace</p>
                   </div>
               </div>
          </div>
      );
  };

  const rotation = item.type === 'text' ? item.rotation : 0;
  const scale = item.type === 'text' ? item.scale : 1;

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: item.position.x,
        top: item.position.y,
        zIndex: isSelected ? 50 : 10,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        touchAction: 'none',
        width: 'max-content',
        cursor: 'move'
      }}
      className={`select-none ${isSelected && item.type !== 'text' ? 'ring-1 ring-white/50 rounded-lg' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => { 
          e.stopPropagation(); 
          if (item.type === 'activity-sticker') toggleStickerVariant();
          onSelect(item); 
      }}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(); }}
    >
      {item.type === 'stat' && (
        <div className="text-center p-2 select-none text-white pointer-events-none">
            <p className="text-5xl font-bold font-bebas">{item.value}</p>
            <p className="text-lg uppercase tracking-wider font-sans font-bold">{item.label}</p>
        </div>
      )}
      {item.type === 'text' && renderTextContent(item as TextItem)}
      {item.type === 'activity-sticker' && renderActivitySticker(item as ActivitySticker)}
    </div>
  );
};

// --- WYSIWYG Text Editor Overlay ---
interface TextEditorOverlayProps {
    initialText: string;
    initialColor: string;
    initialFont: string;
    initialStyle: 'none' | 'fill' | 'neon';
    initialAlign: 'left' | 'center' | 'right';
    onDone: (text: string, color: string, font: string, style: 'none' | 'fill' | 'neon', align: 'left' | 'center' | 'right') => void;
}

const TextEditorOverlay: React.FC<TextEditorOverlayProps> = ({ initialText, initialColor, initialFont, initialStyle, initialAlign, onDone }) => {
    const [text, setText] = useState(initialText);
    const [color, setColor] = useState(initialColor);
    const [font, setFont] = useState(initialFont);
    const [style, setStyle] = useState(initialStyle);
    const [align, setAlign] = useState(initialAlign);
    
    // UI Helpers
    const toggleStyle = () => style === 'none' ? setStyle('fill') : style === 'fill' ? setStyle('neon') : setStyle('none');
    const toggleAlign = () => align === 'center' ? setAlign('left') : align === 'left' ? setAlign('right') : setAlign('center');
    
    // Preview Styles
    const isFill = style === 'fill';
    const isNeon = style === 'neon';
    const previewStyle: React.CSSProperties = {
        color: isFill ? (color === '#FFFFFF' ? '#000000' : '#FFFFFF') : color,
        fontFamily: FONTS.find(f => f.id === font)?.family,
        fontSize: `32px`, 
        textAlign: align,
        textShadow: isNeon ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none',
        fontWeight: 'normal',
        backgroundColor: isFill ? color : 'transparent',
        padding: isFill ? '8px 16px' : '0',
        borderRadius: '12px',
        width: 'auto',
        minWidth: '50px'
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-4 pt-safe">
                <div className="flex gap-4">
                    <button onClick={toggleAlign} className="w-10 h-10 flex items-center justify-center text-white border border-white/30 rounded-full"><i className={`fa-solid fa-align-${align}`}></i></button>
                    <button onClick={toggleStyle} className="w-10 h-10 flex items-center justify-center text-white border border-white/30 rounded-full font-serif font-bold">A</button>
                </div>
                <button onClick={() => onDone(text, color, font, style, align)} className="text-white font-bold text-lg">Concluir</button>
            </div>

            {/* Input Area (Centered) */}
            <div className="flex-1 flex items-center justify-center px-4">
                <textarea
                    autoFocus
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="bg-transparent border-none outline-none resize-none overflow-hidden"
                    style={previewStyle}
                    rows={Math.max(1, text.split('\n').length)}
                />
            </div>

            {/* Bottom Controls */}
            <div className="pb-safe">
                {/* Font Selector */}
                <div className="flex gap-4 justify-start overflow-x-auto p-4 hide-scrollbar">
                    {FONTS.map(f => (
                        <button key={f.id} onClick={() => setFont(f.id)} className={`flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold ${font === f.id ? 'ring-2 ring-white bg-white/20' : ''}`} style={{ fontFamily: f.family }}>Aa</button>
                    ))}
                </div>
                {/* Color Picker */}
                <div className="flex gap-3 justify-start overflow-x-auto p-4 pt-0 hide-scrollbar">
                    {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
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
  
  // Background Pan/Zoom State
  const [bgTransform, setBgTransform] = useState({ scale: 1, x: 0, y: 0 });
  const bgTouchState = useRef({ dist: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startScale: 1 });

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Stats
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || mode === 'photo-edit') return;
    if (elements.length > 0) return;
    const initialElements: EditorElement[] = [];
    if (stats) {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const centerX = w / 2;
      initialElements.push(
        { id: 'stat-dist', type: 'stat', value: stats.distance.toFixed(2), label: 'Distância (km)', position: { x: centerX, y: h * 0.2 } },
        { id: 'stat-time', type: 'stat', value: formatTime(stats.time), label: 'Tempo', position: { x: centerX, y: h * 0.4 } },
      );
    }
    setElements(initialElements);
  }, [stats, mode]);
  
  const handleUpdateElement = (id: string, updates: Partial<EditorElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } as EditorElement : el)));
  };

  const addTextElement = () => {
    const container = imageContainerRef.current;
    if (!container) return;
    const newText: EditorElement = {
      id: `text-${Date.now()}`, type: 'text', text: '', font: 'font-anton', color: '#FFFFFF', textStyle: 'none', fontSize: 30, align: 'center', rotation: 0, scale: 1, position: { x: container.offsetWidth / 2, y: container.offsetHeight / 2 }
    };
    setElements(prev => [...prev, newText]);
    setEditingTextId(newText.id);
  };

  const addActivityOverlay = () => {
      if (!stats) {
          alert("Nenhum dado de atividade disponível para sobrepor.");
          return;
      }
      const container = imageContainerRef.current;
      if (!container) return;

      // Remove existing overlay if any (to avoid clutter)
      setElements(prev => prev.filter(e => e.type !== 'activity-sticker'));

      const newOverlay: EditorElement = {
          id: `overlay-${Date.now()}`,
          type: 'activity-sticker',
          stats: {
              distance: stats.distance,
              time: stats.time,
              pace: stats.pace
          },
          variant: 'glass',
          position: { x: container.offsetWidth / 2, y: container.offsetHeight * 0.8 }
      };
      setElements(prev => [...prev, newOverlay]);
      setSelectedElement(newOverlay);
  };

  const handleBgTouchStart = (e: React.TouchEvent) => {
      if (activeTool !== 'crop') return;
      if (e.touches.length === 1) {
          bgTouchState.current.startX = e.touches[0].clientX - bgTransform.x;
          bgTouchState.current.startY = e.touches[0].clientY - bgTransform.y;
      } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          bgTouchState.current.dist = Math.sqrt(dx * dx + dy * dy);
          bgTouchState.current.startScale = bgTransform.scale;
      }
  };

  const handleBgTouchMove = (e: React.TouchEvent) => {
      if (activeTool !== 'crop') return;
      e.preventDefault();
      if (e.touches.length === 1) {
          const x = e.touches[0].clientX - bgTouchState.current.startX;
          const y = e.touches[0].clientY - bgTouchState.current.startY;
          setBgTransform(prev => ({ ...prev, x, y }));
      } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const newDist = Math.sqrt(dx * dx + dy * dy);
          const scaleDelta = newDist / bgTouchState.current.dist;
          setBgTransform(prev => ({ ...prev, scale: Math.max(1, bgTouchState.current.startScale * scaleDelta) }));
      }
  };

  const generateImage = async (): Promise<string> => {
    const container = imageContainerRef.current;
    if (!container) throw new Error("Container not found");
    const canvas = document.createElement('canvas');
    const scaleFactor = 2; 
    canvas.width = container.offsetWidth * scaleFactor;
    canvas.height = container.offsetHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");
    ctx.scale(scaleFactor, scaleFactor);

    // Draw Background
    if (background) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
            img.onload = () => { 
                ctx.filter = activeFilter;
                ctx.save();
                // Apply crop transform
                ctx.translate(container.offsetWidth / 2 + bgTransform.x, container.offsetHeight / 2 + bgTransform.y);
                ctx.scale(bgTransform.scale, bgTransform.scale);
                ctx.translate(-container.offsetWidth / 2, -container.offsetHeight / 2);
                
                const ratio = Math.max(container.offsetWidth / img.width, container.offsetHeight / img.height);
                const cx = (container.offsetWidth - img.width * ratio) / 2;
                const cy = (container.offsetHeight - img.height * ratio) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
                ctx.restore();
                ctx.filter = 'none'; 
                resolve(); 
            };
            img.onerror = reject;
            img.src = background;
        });
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, container.offsetWidth, container.offsetHeight);
    }
    
    // Draw Elements
    for (const el of elements) {
        ctx.save();
        ctx.translate(el.position.x, el.position.y);
        
        if (el.type === 'text') {
            ctx.rotate((el.rotation * Math.PI) / 180);
            ctx.scale(el.scale, el.scale);
            
            const t = el as TextItem;
            ctx.font = `bold ${t.fontSize}px ${FONTS.find(f => f.id === t.font)?.family || 'sans-serif'}`;
            ctx.textAlign = t.align;
            ctx.textBaseline = 'middle';
            
            const lines = t.text.split('\n');
            const lineHeight = t.fontSize * 1.2;
            
            if (t.textStyle === 'fill') {
                ctx.fillStyle = t.color;
                const maxW = Math.max(...lines.map(l => ctx.measureText(l).width));
                const w = maxW + 30;
                const h = (lines.length * lineHeight) + 10;
                ctx.fillRect(-w/2, -(h/2), w, h);
                ctx.fillStyle = t.color === '#FFFFFF' ? '#000' : '#FFF';
            } else {
                ctx.fillStyle = t.color;
                if(t.textStyle === 'neon') {
                    ctx.shadowColor = t.color;
                    ctx.shadowBlur = 15;
                }
            }
            lines.forEach((line, i) => {
                const yOffset = (i - (lines.length - 1) / 2) * lineHeight;
                ctx.fillText(line, 0, yOffset);
            });
        } 
        else if (el.type === 'activity-sticker') {
            const s = el as ActivitySticker;
            const { distance, time, pace } = s.stats;
            
            // Basic drawing logic for sticker - mimicking the HTML visual
            if (s.variant === 'minimal') {
                ctx.fillStyle = 'white';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 2;
                ctx.textAlign = 'center';
                
                ctx.font = 'bold 60px Anton';
                ctx.fillText(`${distance.toFixed(2)} km`, 0, -15);
                
                ctx.font = 'bold 20px Inter';
                ctx.fillText(`${formatTime(time)} • ${formatPace(pace)} /km`, 0, 25);
            } else {
                // Glass or Orange Box
                const w = 280;
                const h = 100;
                ctx.translate(-w/2, -h/2); // Center
                
                // Background
                if (s.variant === 'glass') {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                } else {
                    const grad = ctx.createLinearGradient(0, 0, w, h);
                    grad.addColorStop(0, '#FC5200');
                    grad.addColorStop(1, '#EA580C');
                    ctx.fillStyle = grad;
                }
                
                // Rounded Rect
                ctx.beginPath();
                ctx.roundRect(0, 0, w, h, 16);
                ctx.fill();
                
                // Content
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                
                // Icon Area
                ctx.font = '24px "Font Awesome 6 Free"'; // Basic fallback if loaded
                // ctx.fillText('\uf70c', 40, 40); // Running icon code
                
                // Stats
                ctx.textAlign = 'center';
                
                // Distance
                ctx.font = 'bold 24px Anton';
                ctx.fillText(distance.toFixed(2), 100, 45);
                ctx.font = 'bold 10px Inter';
                ctx.fillText('KM', 100, 65);
                
                // Time
                ctx.font = 'bold 24px Anton';
                ctx.fillText(formatTime(time), 180, 45);
                ctx.font = 'bold 10px Inter';
                ctx.fillText('TEMPO', 180, 65);

                // Divider lines
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(140, 20); ctx.lineTo(140, 80);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleFinalize = async () => {
      setIsProcessing(true);
      try {
          const imageDataUrl = await generateImage();
          if (onPublish) onPublish(imageDataUrl);
          else if (onSave) onSave(imageDataUrl);
      } catch (error) { alert("Erro ao gerar imagem."); } finally { setIsProcessing(false); }
  };

  const editingTextItem = elements.find(el => el.id === editingTextId) as TextItem | undefined;

  return (
    <motion.div className="fixed inset-0 bg-black z-[50] flex flex-col overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* --- CANVAS --- */}
      <div 
        ref={imageContainerRef} 
        className="absolute inset-0 bg-[#121212] overflow-hidden" 
        onTouchStart={handleBgTouchStart}
        onTouchMove={handleBgTouchMove}
        onClick={() => { setSelectedElement(null); setActiveTool('none'); }}
      >
        {background && ( 
            <img 
                src={background} 
                className="w-full h-full object-cover pointer-events-none" 
                alt="Background" 
                style={{ 
                    filter: activeFilter,
                    transform: `translate(${bgTransform.x}px, ${bgTransform.y}px) scale(${bgTransform.scale})`,
                    transformOrigin: 'center'
                }} 
            /> 
        )}
        
        <AnimatePresence>
            {elements.map(el => (el.id !== editingTextId && <DraggableItem key={el.id} item={el} onUpdate={handleUpdateElement} onSelect={setSelectedElement} isSelected={el.id === selectedElement?.id} onEdit={() => { if(el.type==='text') setEditingTextId(el.id); }} />))}
        </AnimatePresence>
      </div>

      {/* --- TOP BAR --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-safe flex justify-between items-start pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/20 backdrop-blur-md"><i className="fa-solid fa-xmark text-2xl"></i></button>
          
          {activeTool === 'crop' && <div className="bg-black/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white">Modo Zoom/Ajuste</div>}

          <button onClick={handleFinalize} disabled={isProcessing} className="pointer-events-auto h-10 px-6 bg-white text-black rounded-full font-anton uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2">
              {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : (onPublish ? 'Publicar' : 'Salvar')}
          </button>
      </div>

      {/* --- BOTTOM TOOLBAR --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe pt-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col pointer-events-auto">
          
          {activeTool === 'filters' && (
             <div className="flex gap-4 overflow-x-auto px-6 pb-4 hide-scrollbar justify-center mb-2">
                {FILTERS.map(f => (
                    <button key={f.name} onClick={() => setActiveFilter(f.filter)} className="flex flex-col items-center gap-2 group min-w-[60px]">
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${activeFilter === f.filter ? 'border-primary scale-110' : 'border-white/20'}`}>
                            {background ? <img src={background} className="w-full h-full object-cover" style={{ filter: f.filter }} /> : <div className="w-full h-full bg-surface-200"></div>}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white">{f.name}</span>
                    </button>
                ))}
             </div>
          )}

          <div className="flex items-center justify-around px-6 pb-6">
              <button onClick={addTextElement} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-surface-200/50 rounded-full flex items-center justify-center backdrop-blur-sm"><span className="font-anton text-white text-2xl">Aa</span></div>
                  <span className="text-[10px] font-medium text-white">Texto</span>
              </button>
              
              <button onClick={addActivityOverlay} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-surface-200/50 rounded-full flex items-center justify-center backdrop-blur-sm"><i className="fa-regular fa-square-plus text-white text-xl"></i></div>
                  <span className="text-[10px] font-medium text-white">Sobreposição</span>
              </button>

              <button onClick={() => setActiveTool(activeTool === 'crop' ? 'none' : 'crop')} className={`flex flex-col items-center gap-1 ${activeTool === 'crop' ? 'text-primary' : 'text-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${activeTool === 'crop' ? 'bg-white text-black' : 'bg-surface-200/50 text-white'}`}><i className="fa-solid fa-crop-simple text-xl"></i></div>
                  <span className="text-[10px] font-medium">Ajustar</span>
              </button>

              <button onClick={() => setActiveTool(activeTool === 'filters' ? 'none' : 'filters')} className={`flex flex-col items-center gap-1 ${activeTool === 'filters' ? 'text-primary' : 'text-white'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${activeTool === 'filters' ? 'bg-white text-black' : 'bg-surface-200/50 text-white'}`}><i className="fa-solid fa-wand-magic-sparkles text-xl"></i></div>
                  <span className="text-[10px] font-medium">Filtros</span>
              </button>
          </div>
      </div>

      {editingTextId && editingTextItem && (
          <TextEditorOverlay 
            initialText={editingTextItem.text}
            initialColor={editingTextItem.color}
            initialFont={editingTextItem.font}
            initialStyle={editingTextItem.textStyle}
            initialAlign={editingTextItem.align}
            onDone={(text, color, font, style, align) => {
                if (!text.trim()) setElements(prev => prev.filter(e => e.id !== editingTextId));
                else handleUpdateElement(editingTextId, { text, color, font: font as any, textStyle: style, align: align as any });
                setEditingTextId(null);
            }}
          />
      )}
      
      {/* Delete Button (Visible only when item selected) */}
      {selectedElement && (
           <div className="absolute top-1/2 left-4 z-30 pointer-events-auto">
               <button onClick={() => { setElements(prev => prev.filter(el => el.id !== selectedElement.id)); setSelectedElement(null); }} className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                   <i className="fa-solid fa-trash"></i>
               </button>
           </div>
      )}
    </motion.div>
  );
};

export default ImageEditor;
