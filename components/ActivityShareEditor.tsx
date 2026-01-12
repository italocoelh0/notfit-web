// components/ActivityShareEditor.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatTime, formatPace } from '../lib/geolocation';

interface ActivityShareEditorProps {
    stats: { distance: number; time: number; pace: number; };
    onClose: () => void;
}

interface StatProps {
    value: string;
    label: string;
}

const DraggableStat: React.FC<StatProps> = ({ value, label }) => (
    <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        className="text-white text-center p-2 cursor-grab active:cursor-grabbing"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
        whileTap={{ scale: 1.1 }}
    >
        <p className="text-5xl font-bold">{value}</p>
        <p className="text-lg uppercase tracking-wider">{label}</p>
    </motion.div>
);

const ActivityShareEditor: React.FC<ActivityShareEditorProps> = ({ stats, onClose }) => {
    const [background, setBackground] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setBackground(e.target.result as string);
            reader.readAsDataURL(event.target.files[0]);
        }
    };
    
    const drawTextAndDownload = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!imageContainerRef.current) return;
    
        const statElements = Array.from(imageContainerRef.current.querySelectorAll('.draggable-stat'));
    
        statElements.forEach(statEl => {
            // FIX: Cast the element to HTMLElement to access properties like querySelector, style, and clientWidth.
            const el = statEl as HTMLElement;
            const valueEl = el.querySelector('p:first-child') as HTMLElement;
            const labelEl = el.querySelector('p:last-child') as HTMLElement;
            
            if (!valueEl || !labelEl) return;
    
            const transform = el.style.transform;
            const matrix = new DOMMatrix(transform);
            const x = matrix.m41;
            const y = matrix.m42;
    
            const valueStyle = window.getComputedStyle(valueEl);
            const labelStyle = window.getComputedStyle(labelEl);
            
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
    
            // Draw value
            ctx.font = `${valueStyle.fontWeight} ${valueStyle.fontSize} ${valueStyle.fontFamily}`;
            ctx.fillStyle = valueStyle.color;
            ctx.textAlign = 'center';
            ctx.fillText(valueEl.textContent || '', x + el.clientWidth / 2, y + valueEl.offsetTop + valueEl.clientHeight / 2);
    
            // Draw label
            ctx.font = `${labelStyle.fontWeight} ${labelStyle.fontSize} ${labelStyle.fontFamily}`;
            ctx.fillStyle = labelStyle.color;
            ctx.fillText(labelEl.textContent || '', x + el.clientWidth / 2, y + labelEl.offsetTop + labelEl.clientHeight / 2);
        });
    
        const link = document.createElement('a');
        link.download = 'moveon_activity.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    };


    const handleDownload = () => {
        if (!imageContainerRef.current) return;
    
        const container = imageContainerRef.current;
        const canvas = document.createElement('canvas');
        
        // Use a fixed resolution for better quality
        const aspectRatio = container.offsetWidth / container.offsetHeight;
        canvas.width = 1080;
        canvas.height = 1080 / aspectRatio;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        if (background) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                drawTextAndDownload(ctx, canvas);
            };
            img.onerror = () => {
                alert("Erro ao carregar imagem de fundo.");
            }
            img.src = background;
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawTextAndDownload(ctx, canvas);
        }
    };


    return (
        <motion.div
            className="fixed inset-0 bg-black z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div
                ref={imageContainerRef}
                className="flex-1 w-full relative overflow-hidden bg-black flex items-center justify-center"
            >
                {background ? (
                    <img src={background} className="w-full h-full object-cover" alt="Background"/>
                ) : (
                    <p className="text-on-surface-secondary">Carregue uma imagem de fundo</p>
                )}
                
                <div className="absolute inset-0">
                     <div className="absolute top-[10%] left-[50%] -translate-x-1/2 draggable-stat">
                        <DraggableStat value={stats.distance.toFixed(2)} label="Distância (km)" />
                     </div>
                     <div className="absolute top-[35%] left-[50%] -translate-x-1/2 draggable-stat">
                        <DraggableStat value={formatTime(stats.time)} label="Tempo" />
                     </div>
                      <div className="absolute top-[60%] left-[50%] -translate-x-1/2 draggable-stat">
                        <DraggableStat value={formatPace(stats.pace)} label="Ritmo (/km)" />
                     </div>
                </div>
            </div>

            <div className="bg-surface-100 p-4 flex justify-between items-center border-t border-surface-200">
                <button onClick={onClose} className="font-semibold text-on-surface-secondary">Cancelar</button>
                <div className="flex gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-surface-200 text-on-surface font-bold py-2 px-4 rounded-lg hover:bg-surface-300"
                    >
                        Carregar Fundo
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                        onClick={handleDownload}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90"
                    >
                        Baixar Imagem
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityShareEditor;