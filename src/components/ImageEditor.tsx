
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatPace } from '@lib/geolocation';
import { MusicTrack } from '../types';
import { api } from '@services/api';

interface StatItem {
  id: string;
  value: string;
  label: string;
}

interface TextItem {
  id: string;
  text: string;
  font: 'font-anton' | 'font-bebas' | 'font-sans';
  color: string;
  backgroundColor?: string;
  textStyle: 'none' | 'fill' | 'neon';
  fontSize: number;
  align: 'left' | 'center' | 'right';
}

interface MusicItem {
    id: string;
    track: MusicTrack;
}

interface LocationItem {
    id: string;
    text: string;
}

type EditorElementData = 
  | (StatItem & { type: 'stat' }) 
  | (TextItem & { type: 'text' })
  | (MusicItem & { type: 'music' })
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
    { id: 'font-sans', label: 'Clássico', family: 'Inter' },
    { id: 'font-anton', label: 'Moderno', family: 'Anton' },
    { id: 'font-bebas', label: 'Forte', family: '"Bebas Neue"' },
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

// --- Helper Functions ---
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// --- Sub-Components ---

const DraggableItem: React.FC<{
  item: EditorElement;
  onUpdatePosition: (id: string, offset: { x: number; y: number }) => void;
  onSelect: (item: EditorElement | null) => void;
  isSelected: boolean;
  onEdit: () => void;
  onResize: (id: string, delta: number) => void;
}> = ({ item, onUpdatePosition, onSelect, isSelected, onEdit, onResize }) => {
  
  const renderTextContent = (t: TextItem) => {
      const isFill = t.textStyle === 'fill';
      const isNeon = t.textStyle === 'neon';
      const baseStyle: React.CSSProperties = {
          color: isFill ? (t.color === '#FFFFFF' ? '#000000' : '#FFFFFF') : t.color,
          fontSize: `${t.fontSize}px`,
          textAlign: t.align,
          lineHeight: 1.4,
          textShadow: isNeon ? `0 0 10px ${t.color}, 0 0 20px ${t.color}` : 'none',
          fontFamily: FONTS.find(f => f.id === t.font)?.family,
          fontWeight: 'bold',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
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

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => onUpdatePosition(item.id, info.offset)}
      style={{
        position: 'absolute',
        left: item.position.x,
        top: item.position.y,
        zIndex: isSelected ? 50 : 10,
      }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      className={`cursor-grab active:cursor-grabbing touch-none ${isSelected ? 'ring-1 ring-white/50 rounded-lg' : ''}`}
      onTap={(e) => { e.stopPropagation(); onSelect(item); }}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(); }}
    >
      {isSelected && item.type === 'text' && (
          <motion.div
              className="absolute -bottom-3 -right-3 w-6 h-6 bg-white text-black rounded-full shadow-md border border-gray-300 flex items-center justify-center z-[60] cursor-nwse-resize"
              drag dragMomentum={false} dragElastic={0} dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              onDrag={(_, info) => onResize(item.id, info.delta.x + info.delta.y)}
              onPointerDown={(e) => e.stopPropagation()}
          >
              <i className="fa-solid fa-expand text-[10px]"></i>
          </motion.div>
      )}
      {item.type === 'stat' && (
        <div className="text-center p-2 select-none text-white">
            <p className="text-5xl font-bold font-bebas">{item.value}</p>
            <p className="text-lg uppercase tracking-wider font-sans font-bold">{item.label}</p>
        </div>
      )}
      {item.type === 'text' && <div className="select-none">{renderTextContent(item)}</div>}
      {item.type === 'music' && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 pr-4 flex items-center gap-3 border border-white/10 shadow-2xl select-none">
              <img src={item.track.albumArt} alt="Album" className="w-10 h-10 rounded-lg pointer-events-none" />
              <div className="pointer-events-none">
                  <p className="text-white font-bold text-sm whitespace-nowrap">{item.track.name}</p>
                  <p className="text-white/70 text-xs whitespace-nowrap">{item.track.artist}</p>
              </div>
              <div className="text-[#1DB954] text-lg ml-1 pointer-events-none"><i className="fa-brands fa-spotify"></i></div>
          </div>
      )}
      {item.type === 'location' && (
          <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg select-none group">
              <div className="text-red-500 text-lg"><i className="fa-solid fa-location-dot"></i></div>
              <p className="text-black font-bold text-sm font-sans uppercase tracking-wide whitespace-nowrap">{item.text}</p>
          </div>
      )}
    </motion.div>
  );
};

// --- Text Editor Overlay ---
interface TextEditingOverlayProps {
    initialText: string;
    initialColor: string;
    initialFont: string;
    initialStyle: 'none' | 'fill' | 'neon';
    initialSize: number;
    initialAlign: 'left' | 'center' | 'right';
    onDone: (text: string, color: string, font: string, style: 'none' | 'fill' | 'neon', size: number, align: 'left' | 'center' | 'right') => void;
    onCancel: () => void;
}

const TextEditingOverlay: React.FC<TextEditingOverlayProps> = (props) => {
    const [text, setText] = useState(props.initialText);
    const [color, setColor] = useState(props.initialColor);
    const [font, setFont] = useState(props.initialFont);
    const [style, setStyle] = useState(props.initialStyle);
    const [size, setSize] = useState(props.initialSize);
    const [align, setAlign] = useState(props.initialAlign);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(text.length, text.length);
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, []);

    const toggleStyle = () => style === 'none' ? setStyle('fill') : style === 'fill' ? setStyle('neon') : setStyle('none');
    const toggleAlign = () => align === 'center' ? setAlign('left') : align === 'left' ? setAlign('right') : setAlign('center');
    const isFill = style === 'fill';
    const isNeon = style === 'neon';

    const previewStyle: React.CSSProperties = {
        color: isFill ? (color === '#FFFFFF' ? '#000000' : '#FFFFFF') : color,
        fontFamily: FONTS.find(f => f.id === font)?.family,
        fontSize: `${size}px`,
        textAlign: align,
        textShadow: isNeon ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none',
        lineHeight: 1.4,
        fontWeight: 'bold',
    };
    const wrapperStyle: React.CSSProperties = {
        backgroundColor: isFill ? color : 'transparent',
        padding: isFill ? '8px 16px' : '0',
        borderRadius: '12px',
        display: 'inline-block',
        minWidth: '20px',
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-center p-4 pt-safe relative z-50">
                <div className="flex gap-4">
                    <button onClick={toggleAlign} className="w-10 h-10 flex items-center justify-center text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors">
                        <i className={`fa-solid fa-align-${align} text-lg`}></i>
                    </button>
                    <button onClick={toggleStyle} className="w-10 h-10 flex items-center justify-center text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors relative">
                        <span className="font-serif font-bold text-lg">A</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowColorPicker(!showColorPicker)} className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/50 transition-colors" style={{ backgroundColor: color }} />
                        <AnimatePresence>
                            {showColorPicker && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-4 bg-surface-100/90 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl grid grid-cols-3 gap-3 w-max">
                                    {COLORS.map(c => <button key={c} onClick={() => { setColor(c); setShowColorPicker(false); }} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-white/10'}`} style={{ backgroundColor: c }} />)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <button onClick={() => props.onDone(text, color, font, style, size, align)} className="text-white font-bold text-lg hover:text-primary px-2">Concluir</button>
            </div>
            <div className="flex-1 flex items-center justify-center relative w-full px-4 overflow-hidden" onClick={() => setShowColorPicker(false)}>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center h-64 w-8 z-40">
                    <input type="range" min="16" max="150" value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-full -rotate-180 appearance-none bg-white/20 rounded-full cursor-pointer" style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '6px' }} />
                </div>
                <div className="w-full flex flex-col items-center z-10">
                    <div style={{ width: '100%', textAlign: align }}>
                        <span style={wrapperStyle}>
                            <textarea ref={textareaRef} value={text} onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} className="bg-transparent border-none outline-none resize-none overflow-hidden p-0 m-0 block" style={{ ...previewStyle, minWidth: '1em', width: '100%', height: 'auto' }} rows={1} spellCheck={false} />
                        </span>
                    </div>
                </div>
            </div>
            <div className="pb-safe" onClick={() => setShowColorPicker(false)}>
                <div className="p-4 bg-gradient-to-t from-black to-transparent">
                    <div className="flex gap-4 justify-center overflow-x-auto pb-4 hide-scrollbar items-center">
                        {FONTS.map(f => (
                            <button key={f.id} onClick={() => setFont(f.id as any)} className={`w-12 h-12 rounded-full bg-white/10 border-2 flex items-center justify-center text-sm text-white font-bold ${font === f.id ? 'border-white bg-white/20 scale-110' : 'border-transparent text-gray-400'}`} style={{ fontFamily: f.family }}>Aa</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpotifyModal: React.FC<{ onClose: () => void; onSelect: (track: MusicTrack) => void }> = ({ onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (search.trim().length > 0) {
                setIsLoading(true);
                try {
                    const results = await api.music.search(search);
                    setTracks(results);
                } catch (error) { console.error(error); } finally { setIsLoading(false); }
            } else { setTracks([]); }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);
    
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 bg-surface-100 z-[60] flex flex-col">
            <div className="flex justify-between items-center p-6 pt-8 bg-surface-100 z-10">
                 <h3 className="text-white text-xl font-anton uppercase tracking-wide flex items-center gap-2"><i className="fa-brands fa-spotify text-[#1DB954]"></i> Trilha Sonora</h3>
                 <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center text-white"><i className="fa-solid fa-chevron-down"></i></button>
            </div>
            <div className="px-6 pb-4">
                <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/50"></i>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no Spotify..." className="w-full bg-surface-200 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-[#1DB954] text-sm placeholder-white/30 font-medium" autoFocus />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
                {isLoading && <div className="flex justify-center py-10"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#1DB954]"></i></div>}
                {tracks.map(track => (
                    <button key={track.id} onClick={() => onSelect(track)} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group">
                        <img src={track.albumArt} alt={track.name} className="w-12 h-12 rounded-md shadow-md" />
                        <div className="flex-1"><p className="text-white font-bold group-hover:text-[#1DB954] transition-colors text-sm">{track.name}</p><p className="text-white/60 text-xs">{track.artist}</p></div>
                        <i className="fa-solid fa-plus-circle text-white/20 group-hover:text-[#1DB954] text-xl transition-colors"></i>
                    </button>
                ))}
            </div>
        </motion.div>
    )
}

const ImageEditor: React.FC<ImageEditorProps> = ({ mode, stats, baseImage, onClose, onSave, onPublish }) => {
  const [background, setBackground] = useState<string | null>(baseImage || null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [activeTool, setActiveTool] = useState<'none' | 'filters'>('none');
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || mode === 'photo-edit') return;
    if (elements.length > 0) return;
    const initialElements: EditorElement[] = [];
    if (stats) {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const centerX = w / 2 - 100;
      initialElements.push(
        { id: 'stat-dist', type: 'stat', value: stats.distance.toFixed(2), label: 'Distância (km)', position: { x: centerX, y: h * 0.2 } },
        { id: 'stat-time', type: 'stat', value: formatTime(stats.time), label: 'Tempo', position: { x: centerX, y: h * 0.4 } },
        { id: 'stat-pace', type: 'stat', value: formatPace(stats.pace), label: 'Ritmo (/km)', position: { x: centerX, y: h * 0.6 } }
      );
    }
    setElements(initialElements);
  }, [stats, mode]);
  
  const handleUpdateElement = (id: string, updates: Partial<EditorElementData>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } as EditorElement : el)));
    setSelectedElement(prev => (prev && prev.id === id) ? { ...prev, ...updates } as EditorElement : prev);
  };
  
  const handleUpdatePosition = (id: string, offset: { x: number; y: number }) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, position: { x: el.position.x + offset.x, y: el.position.y + offset.y } } : el));
  };

  const handleResizeElement = (id: string, delta: number) => {
      setElements(prev => prev.map(el => el.id === id && el.type === 'text' ? { ...el, fontSize: Math.max(10, Math.min(300, el.fontSize + (delta * 0.5))) } : el));
  };

  const addTextElement = () => {
    const container = imageContainerRef.current;
    if (!container) return;
    const newText: EditorElement = {
      id: `text-${Date.now()}`, type: 'text', text: '', font: 'font-anton', color: '#FFFFFF', textStyle: 'none', fontSize: 40, align: 'center', position: { x: container.offsetWidth / 2 - 100, y: container.offsetHeight / 2 }
    };
    setElements(prev => [...prev, newText]);
    setEditingTextId(newText.id);
    setActiveTool('none');
  };
  
  const addMusicElement = (track: MusicTrack) => {
      const container = imageContainerRef.current;
      if (!container) return;
      setElements(prev => prev.filter(e => e.type !== 'music'));
      const newMusic: EditorElement = {
          id: `music-${Date.now()}`, type: 'music', track: track, position: { x: container.offsetWidth / 2 - 110, y: container.offsetHeight * 0.8 }
      };
      setElements(prev => [...prev, newMusic]);
      setSelectedElement(newMusic);
      setIsSpotifyOpen(false);
  }

  const deleteSelectedElement = () => {
      if (!selectedElement) return;
      setElements(prev => prev.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
      setActiveTool('none');
  }

  const handleEdit = (item: EditorElement) => {
      if (item.type === 'text') setEditingTextId(item.id);
  }

  const handleTextEditDone = (text: string, color: string, font: string, style: 'none' | 'fill' | 'neon', size: number, align: 'left' | 'center' | 'right') => {
      if (editingTextId) {
          if (text.trim() === '') setElements(prev => prev.filter(el => el.id !== editingTextId));
          else handleUpdateElement(editingTextId, { text, color, font: font as any, textStyle: style, fontSize: size, align: align });
          setEditingTextId(null);
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

    if (background) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
            img.onload = () => { 
                ctx.filter = activeFilter;
                const ratio = Math.max(container.offsetWidth / img.width, container.offsetHeight / img.height);
                const cx = (container.offsetWidth - img.width * ratio) / 2;
                const cy = (container.offsetHeight - img.height * ratio) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
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
    
    for (const el of elements) {
        ctx.save();
        const x = el.position.x;
        const y = el.position.y;
        if (el.type === 'stat') {
            ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
            ctx.font = `bold 50px "Bebas Neue", sans-serif`; ctx.fillText(el.value, x + 100, y + 50);
            ctx.font = `bold 16px Inter, sans-serif`; ctx.fillText(el.label.toUpperCase(), x + 100, y + 75);
        } else if (el.type === 'text') {
            const fontName = el.font === 'font-anton' ? 'Anton' : el.font === 'font-bebas' ? '"Bebas Neue"' : 'Inter';
            ctx.font = `bold ${el.fontSize}px ${fontName}, sans-serif`; ctx.textBaseline = 'top';
            const lines = el.text.split('\n'); const lineHeight = el.fontSize * 1.4;
            let maxLineWidth = 0; lines.forEach(l => { const m = ctx.measureText(l); if (m.width > maxLineWidth) maxLineWidth = m.width; });
            const totalHeight = lines.length * lineHeight; const pX = 16; const pY = 8;
            
            if (el.textStyle === 'fill') {
                ctx.fillStyle = el.color;
                roundedRect(ctx, x, y, maxLineWidth + (pX*2), totalHeight + (pY*2) - (lineHeight - el.fontSize), 12);
                ctx.fill();
                ctx.fillStyle = (el.color === '#FFFFFF' ? '#000000' : '#FFFFFF');
            } else {
                ctx.fillStyle = el.color;
                if (el.textStyle === 'neon') { ctx.shadowColor = el.color; ctx.shadowBlur = 20; }
            }
            const textStartX = el.textStyle === 'fill' ? x + pX : x;
            const textStartY = el.textStyle === 'fill' ? y + pY : y;
            lines.forEach((line, i) => {
                const m = ctx.measureText(line);
                let alignOffset = 0;
                if (el.align === 'center') alignOffset = (maxLineWidth - m.width) / 2;
                else if (el.align === 'right') alignOffset = maxLineWidth - m.width;
                ctx.fillText(line, textStartX + alignOffset, textStartY + (i * lineHeight));
            });
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
      <div ref={imageContainerRef} className="absolute inset-0 bg-[#121212] flex items-center justify-center z-0" onClick={() => { setSelectedElement(null); setActiveTool('none'); }}>
        {background ? ( <img src={background} className="w-full h-full object-cover" alt="Background" style={{ filter: activeFilter }} /> ) : ( <div className="text-white/30 text-center"><i className="fa-solid fa-image text-6xl"></i></div> )}
        <AnimatePresence>
            {elements.map(el => (el.id !== editingTextId && <DraggableItem key={el.id} item={el} onUpdatePosition={handleUpdatePosition} onSelect={(item) => { setSelectedElement(item); setActiveTool('none'); }} isSelected={el.id === selectedElement?.id} onEdit={() => handleEdit(el)} onResize={handleResizeElement} />))}
        </AnimatePresence>
      </div>

      {/* --- TOP BAR --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-safe flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all drop-shadow-lg"><i className="fa-solid fa-xmark text-3xl"></i></button>
          <div className="pointer-events-auto bg-black/50 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 border border-white/10">
              <img src="https://i.scdn.co/image/ab67616d0000b273b53a52c3175c57502705009b" className="w-6 h-6 rounded-full" alt="Music" />
              <div className="flex flex-col"><span className="text-[10px] text-white font-bold leading-none">Áudio sugerido</span><span className="text-[8px] text-gray-300 leading-none">Tribo da Periferia, DuckJay</span></div>
              <button onClick={() => setIsSpotifyOpen(true)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center ml-1"><i className="fa-solid fa-plus text-[10px] text-white"></i></button>
          </div>
          <div className="w-10"></div> {/* Spacer */}
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

          <div className="flex items-end justify-between px-6 pb-6">
              <div className="flex items-center gap-6">
                  <button onClick={() => setIsSpotifyOpen(true)} className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-surface-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-music text-white text-lg"></i></div><span className="text-[10px] font-medium text-white">Música</span></button>
                  <button onClick={addTextElement} className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-surface-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"><span className="font-anton text-white text-xl">Aa</span></div><span className="text-[10px] font-medium text-white">Texto</span></button>
                  <button onClick={() => {}} className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-surface-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"><i className="fa-regular fa-square-plus text-white text-lg"></i></div><span className="text-[10px] font-medium text-white">Sobreposição</span></button>
                  <button onClick={() => setActiveTool(prev => prev === 'filters' ? 'none' : 'filters')} className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-surface-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-wand-magic-sparkles text-white text-lg"></i></div><span className="text-[10px] font-medium text-white">Filtro</span></button>
                  <button onClick={() => {}} className="flex flex-col items-center gap-1"><div className="w-10 h-10 bg-surface-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"><i className="fa-solid fa-sliders text-white text-lg"></i></div><span className="text-[10px] font-medium text-white">Editar</span></button>
              </div>

              <button onClick={handleFinalize} disabled={isProcessing} className="bg-blue-600 text-white px-5 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-blue-500 transition-colors flex items-center gap-2">
                  {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <>Avançar <i className="fa-solid fa-arrow-right"></i></>}
              </button>
          </div>
      </div>

      {selectedElement && (
             <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-28 left-0 right-0 flex justify-center items-center z-30 pointer-events-none">
                 <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 pointer-events-auto shadow-2xl">
                     <button onClick={deleteSelectedElement} className="text-white hover:text-red-500 transition-colors"><i className="fa-solid fa-trash text-xl"></i></button>
                 </div>
             </motion.div>
      )}
      
      <AnimatePresence>
        {isSpotifyOpen && <SpotifyModal onClose={() => setIsSpotifyOpen(false)} onSelect={addMusicElement} />}
        {editingTextId && editingTextItem && <TextEditingOverlay initialText={editingTextItem.text} initialColor={editingTextItem.color} initialFont={editingTextItem.font} initialStyle={editingTextItem.textStyle} initialSize={editingTextItem.fontSize} initialAlign={editingTextItem.align} onDone={handleTextEditDone} onCancel={() => setEditingTextId(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageEditor;

