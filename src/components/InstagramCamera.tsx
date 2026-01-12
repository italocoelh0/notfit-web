
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstagramCameraProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
    onGalleryClick: () => void;
}

const InstagramCamera: React.FC<InstagramCameraProps> = ({ onCapture, onClose, onGalleryClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [error, setError] = useState<string | null>(null);
    const [flashEffect, setFlashEffect] = useState(false);

    // Zoom State
    const [zoom, setZoom] = useState(1);
    const [maxZoom, setMaxZoom] = useState(3); // Default max
    const [isZooming, setIsZooming] = useState(false);

    // Flash State
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');

    // Tools State
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    
    // Layout Mode State
    const [layoutGrid, setLayoutGrid] = useState<number | null>(null); // 2, 4, 6
    const [layoutImages, setLayoutImages] = useState<(string | null)[]>([]);
    const [currentLayoutIdx, setCurrentLayoutIdx] = useState(0);

    // Boomerang State
    const [isBoomerangRecording, setIsBoomerangRecording] = useState(false);
    const [boomerangFrames, setBoomerangFrames] = useState<string[]>([]);
    const [isBoomerangPreview, setIsBoomerangPreview] = useState(false);

    // Text Mode State
    const [isTextMode, setIsTextMode] = useState(false);
    const [textContent, setTextContent] = useState('');

    // --- CAMERA SETUP ---

    const getCameraStream = async (mode: 'user' | 'environment') => {
        const constraints: MediaStreamConstraints = {
            video: { 
                facingMode: mode,
                width: { ideal: 1920 }, 
                height: { ideal: 1920 }, // 1:1 aspect ratio preference or high res
            },
            audio: false
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
    };

    const applyZoom = async (zoomValue: number) => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();

            // @ts-ignore
            if ('zoom' in capabilities) {
                try {
                    // @ts-ignore
                    await track.applyConstraints({ advanced: [{ zoom: zoomValue }] });
                } catch (e) {
                    console.warn("Zoom constraint failed", e);
                }
            }
        }
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const z = parseFloat(e.target.value);
        setZoom(z);
        applyZoom(z);
        setIsZooming(true);
        setTimeout(() => setIsZooming(false), 2000);
    };

    const toggleFlash = async () => {
        const nextMode = flashMode === 'off' ? 'on' : flashMode === 'on' ? 'auto' : 'off';
        setFlashMode(nextMode);

        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            // @ts-ignore
            if (capabilities.torch) {
                try {
                    // @ts-ignore
                    await track.applyConstraints({ advanced: [{ torch: nextMode === 'on' }] });
                } catch (e) {
                    console.warn("Torch failed", e);
                }
            }
        }
    };

    const startCamera = useCallback(async () => {
        setIsStreaming(false);
        setError(null);

        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            const stream = await getCameraStream(facingMode);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', 'true');
                await videoRef.current.play();
                
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                // @ts-ignore
                if ('zoom' in capabilities) {
                    // @ts-ignore
                    setMaxZoom(capabilities.zoom.max || 3);
                }

                setIsStreaming(true);
            }
        } catch (err: any) {
            console.error("Camera Error:", err);
            setError("Erro ao acessar câmera. Verifique permissões.");
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);


    // --- CAPTURE LOGIC ---

    const captureFrame = (video: HTMLVideoElement): string => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.9);
    };

    const handleShutter = async () => {
        if (!videoRef.current) return;

        // Simular flash de tela se não for hardware
        if (flashMode === 'on' || flashMode === 'auto') {
            setFlashEffect(true);
            setTimeout(() => setFlashEffect(false), 200);
        }

        // 1. Text Mode
        if (isTextMode) {
            const canvas = document.createElement('canvas');
            canvas.width = 1080; canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const grd = ctx.createLinearGradient(0, 0, 0, 1920);
                grd.addColorStop(0, "#833ab4"); grd.addColorStop(1, "#fcb045");
                ctx.fillStyle = grd; ctx.fillRect(0, 0, 1080, 1920);
                ctx.fillStyle = "white"; ctx.font = "bold 80px sans-serif";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                const lines = textContent.split('\n');
                lines.forEach((line, i) => ctx.fillText(line, 540, 960 + (i * 90) - ((lines.length - 1) * 45)));
                onCapture(canvas.toDataURL('image/jpeg', 0.9));
            }
            return;
        }

        // 2. Boomerang Mode
        if (activeTool === 'Boomerang') {
            if (isBoomerangRecording) return; 
            setIsBoomerangRecording(true);
            const frames: string[] = [];
            const maxFrames = 20; // 2 seconds approx
            let count = 0;
            
            const interval = setInterval(() => {
                if (videoRef.current && count < maxFrames) {
                    frames.push(captureFrame(videoRef.current));
                    count++;
                } else {
                    clearInterval(interval);
                    setIsBoomerangRecording(false);
                    setBoomerangFrames(frames);
                    setIsBoomerangPreview(true);
                }
            }, 100); 
            return;
        }

        // 3. Layout Mode
        if (layoutGrid) {
            const frame = captureFrame(videoRef.current);
            const newLayout = [...layoutImages];
            newLayout[currentLayoutIdx] = frame;
            setLayoutImages(newLayout);
            
            // Find next empty slot
            const nextIdx = currentLayoutIdx + 1;
            if (nextIdx < layoutGrid) {
                setCurrentLayoutIdx(nextIdx);
            }
            return;
        }

        // 4. Normal Photo
        const img = captureFrame(videoRef.current);
        onCapture(img);
    };

    const handleFinishLayout = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920; 
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const rows = layoutGrid === 4 ? 2 : layoutGrid === 6 ? 3 : 2;
        const cols = layoutGrid === 4 ? 2 : layoutGrid === 6 ? 2 : 1;
        
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;

        layoutImages.forEach((src, idx) => {
            if (!src) return;
            const img = new Image();
            img.src = src;
            
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            
            // Center crop calculation
            const ratio = Math.max(cellW / img.width, cellH / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            const cx = (cellW - w) / 2;
            const cy = (cellH - h) / 2;

            ctx.save();
            ctx.beginPath();
            ctx.rect(c * cellW, r * cellH, cellW, cellH);
            ctx.clip();
            ctx.drawImage(img, (c * cellW) + cx, (r * cellH) + cy, w, h);
            ctx.restore();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        });

        onCapture(canvas.toDataURL('image/jpeg', 0.9));
    };

    const handleFinishBoomerang = () => {
        if (boomerangFrames.length > 0) {
            onCapture(boomerangFrames[0]); // For now, capture first frame to editor
        }
    };

    const handleToolClick = (toolName: string) => {
        if (toolName === 'Criar') {
            setIsTextMode(!isTextMode);
            setActiveTool(isTextMode ? null : 'Criar');
        } else if (toolName === 'Layout') {
            if (layoutGrid) {
                setLayoutGrid(null);
                setActiveTool(null);
            } else {
                setLayoutGrid(2);
                setActiveTool('Layout');
                setLayoutImages(new Array(6).fill(null));
                setCurrentLayoutIdx(0);
            }
        } else if (toolName === 'Mais') {
            setIsMenuExpanded(!isMenuExpanded);
        } else if (toolName === 'Flash') {
            toggleFlash();
        } else {
            setActiveTool(activeTool === toolName ? null : toolName);
            setLayoutGrid(null);
            setIsTextMode(false);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    // --- RENDERERS ---

    const renderLayoutGrid = () => {
        if (!layoutGrid) return null;
        const rows = layoutGrid === 4 ? 2 : layoutGrid === 6 ? 3 : 2;
        const cols = layoutGrid === 4 ? 2 : layoutGrid === 6 ? 2 : 1;

        return (
            <div className="absolute inset-0 z-10 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                {Array.from({ length: layoutGrid }).map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`relative border border-white/50 overflow-hidden ${idx === currentLayoutIdx ? 'ring-4 ring-yellow-400 z-20' : ''}`}
                    >
                        {layoutImages[idx] ? (
                            <img src={layoutImages[idx]!} className="w-full h-full object-cover" />
                        ) : idx !== currentLayoutIdx && (
                            <div className="w-full h-full bg-black/40"></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const BoomerangPreview = () => {
        const [frameIdx, setFrameIdx] = useState(0);
        useEffect(() => {
            // Forward-Reverse Loop
            let direction = 1;
            const interval = setInterval(() => {
                setFrameIdx(prev => {
                    let next = prev + direction;
                    if (next >= boomerangFrames.length) {
                        direction = -1;
                        next = boomerangFrames.length - 2;
                    } else if (next < 0) {
                        direction = 1;
                        next = 1;
                    }
                    return next;
                });
            }, 80);
            return () => clearInterval(interval);
        }, []);

        return (
            <div className="absolute inset-0 z-50 bg-black flex flex-col">
                <img src={boomerangFrames[frameIdx]} className="w-full h-full object-cover" />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                    <button onClick={() => { setIsBoomerangPreview(false); setBoomerangFrames([]); }} className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <i className="fa-solid fa-trash"></i>
                    </button>
                    <button onClick={handleFinishBoomerang} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-bold">
                        <i className="fa-solid fa-check"></i>
                    </button>
                </div>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans text-white overflow-hidden touch-manipulation select-none">
            {/* Flash Overlay */}
            <div className={`absolute inset-0 bg-white z-[110] pointer-events-none transition-opacity duration-100 ease-out ${flashEffect ? 'opacity-80' : 'opacity-0'}`}></div>

            {/* --- CAMERA PREVIEW --- */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#121212] z-0">
                {error ? (
                    <div className="text-center px-8 z-10">
                        <p className="text-gray-300 text-sm mb-4">{error}</p>
                        <button onClick={() => startCamera()} className="bg-white/10 px-6 py-2 rounded-full">Tentar Novamente</button>
                    </div>
                ) : (
                    <video 
                        ref={videoRef}
                        autoPlay playsInline muted
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        style={{ transform: `scale(${zoom})` }} // Digital zoom preview
                    />
                )}
                
                {renderLayoutGrid()}
                {isBoomerangPreview && <BoomerangPreview />}

                {/* Text Mode Background */}
                {isTextMode && (
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-purple-600 via-red-500 to-orange-400 flex items-center justify-center p-8">
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Toque para digitar..."
                            className="bg-transparent text-white text-4xl font-bold text-center w-full h-full resize-none focus:outline-none placeholder-white/50"
                            autoFocus
                        />
                    </div>
                )}
            </div>

            {/* --- UI LAYER --- */}
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-20 flex justify-between items-start pointer-events-none">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center pointer-events-auto drop-shadow-md">
                    <i className="fa-solid fa-xmark text-3xl text-white"></i>
                </button>
            </div>

            {/* Right Side - Zoom Slider */}
            {!isTextMode && !layoutGrid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-64 flex flex-col items-center pointer-events-auto">
                    <input
                        type="range"
                        min="1"
                        max={maxZoom}
                        step="0.1"
                        value={zoom}
                        onChange={handleZoomChange}
                        className="h-full -rotate-180 appearance-none bg-white/30 rounded-full backdrop-blur-sm"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '6px' }}
                    />
                    {isZooming && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-mono border border-white/10">
                            {zoom.toFixed(1)}x
                        </div>
                    )}
                </div>
            )}

            {/* Left Sidebar Tools */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6 px-4">
                {[
                    { id: 'Criar', icon: <span className="font-bold text-lg font-serif">Aa</span>, label: 'Criar' },
                    { id: 'Boomerang', icon: <i className="fa-solid fa-infinity text-xl"></i>, label: 'Boomerang' },
                    { id: 'Layout', icon: <i className="fa-solid fa-table-cells-large text-xl"></i>, label: 'Layout' },
                    { id: 'Flash', icon: <i className={`fa-solid ${flashMode === 'off' ? 'fa-bolt' : flashMode === 'auto' ? 'fa-bolt-auto' : 'fa-bolt text-yellow-400'} text-xl`}></i>, label: '' },
                    { id: 'Mais', icon: <i className={`fa-solid fa-angle-down text-xl transition-transform ${isMenuExpanded ? 'rotate-180' : ''}`}></i>, label: '' }
                ].map((tool, idx) => (
                    <div 
                        key={idx} 
                        className="flex flex-col items-center gap-1 group cursor-pointer drop-shadow-md pointer-events-auto relative"
                        onClick={() => handleToolClick(tool.id)}
                    >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${activeTool === tool.id || (tool.id === 'Layout' && layoutGrid) || (tool.id === 'Criar' && isTextMode) ? 'bg-white text-black' : 'bg-black/20 backdrop-blur-sm text-white'}`}>
                            {tool.icon}
                        </div>
                        {/* Submenu for Layout */}
                        {tool.id === 'Layout' && activeTool === 'Layout' && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                className="absolute left-12 top-0 flex gap-2"
                            >
                                {[2, 4, 6].map(g => (
                                    <button key={g} onClick={(e) => { e.stopPropagation(); setLayoutGrid(g); setCurrentLayoutIdx(0); setLayoutImages(new Array(g).fill(null)); }} className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${layoutGrid === g ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white'}`}>
                                        {g}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe pt-12 pointer-events-none">
                
                {/* Layout Controls */}
                {layoutGrid && (
                    <div className="flex justify-center gap-6 mb-6 pointer-events-auto">
                         <button onClick={() => {
                             if (currentLayoutIdx > 0) {
                                 const newLayout = [...layoutImages];
                                 newLayout[currentLayoutIdx] = null;
                                 // If current was empty, verify previous
                                 if(!layoutImages[currentLayoutIdx]) {
                                    newLayout[currentLayoutIdx-1] = null;
                                    setCurrentLayoutIdx(currentLayoutIdx - 1);
                                 }
                                 setLayoutImages(newLayout);
                             }
                         }} className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-white"><i className="fa-solid fa-undo"></i></button>
                         
                         <button onClick={handleFinishLayout} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black shadow-lg"><i className="fa-solid fa-check text-2xl"></i></button>
                    </div>
                )}

                {/* Normal Shutter Row */}
                {!layoutGrid && (
                    <div className="flex justify-between items-center px-8 mb-8 pointer-events-auto">
                        <button onClick={onGalleryClick} className="w-10 h-10 rounded-lg border-2 border-white/80 overflow-hidden bg-gray-800 active:scale-95 transition-transform shadow-lg">
                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                <i className="fa-solid fa-image text-white text-lg"></i>
                            </div>
                        </button>

                        <button 
                            onPointerDown={activeTool === 'Boomerang' ? handleShutter : undefined}
                            onPointerUp={activeTool === 'Boomerang' ? () => setIsBoomerangRecording(false) : undefined}
                            onClick={activeTool !== 'Boomerang' ? handleShutter : undefined}
                            className={`w-20 h-20 rounded-full border-[5px] border-white/60 flex items-center justify-center p-1 cursor-pointer active:scale-90 transition-transform duration-100 shadow-lg ${isBoomerangRecording ? 'scale-110 border-red-500' : ''}`}
                        >
                            {activeTool === 'Boomerang' ? (
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                    <i className="fa-solid fa-infinity text-black text-2xl"></i>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-white rounded-full"></div>
                            )}
                        </button>

                        <button onClick={toggleCamera} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:rotate-180 transition-transform duration-500 shadow-lg border border-white/20">
                            <i className="fa-solid fa-rotate text-lg text-white"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstagramCamera;
