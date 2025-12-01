
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

    // Tools State
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [isGridActive, setIsGridActive] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [textContent, setTextContent] = useState('');

    // Função auxiliar para obter stream com fallback e ALTA RESOLUÇÃO
    const getCameraStream = async (mode: 'user' | 'environment') => {
        // Solicita resolução 4K (ou a máxima disponível próxima disso)
        const highResConstraints: MediaStreamConstraints = {
            video: { 
                facingMode: mode,
                width: { ideal: 4096 }, 
                height: { ideal: 2160 } 
            },
            audio: false
        };

        try {
            // Tentativa 1: Modo solicitado com Alta Resolução
            return await navigator.mediaDevices.getUserMedia(highResConstraints);
        } catch (err) {
            console.warn(`Falha ao acessar câmera ${mode} em alta resolução, tentando configuração padrão...`);
            try {
                // Tentativa 2: Tenta qualquer resolução no modo solicitado
                return await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode },
                    audio: false
                });
            } catch (err2) {
                // Tentativa 3: Qualquer câmera de vídeo disponível (fallback final)
                return await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
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

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Câmera não suportada neste navegador.");
            return;
        }

        try {
            const stream = await getCameraStream(facingMode);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Importante: playsInline é necessário para iOS não abrir fullscreen
                videoRef.current.setAttribute('playsinline', 'true'); 
                await videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err: any) {
            console.error("Erro fatal de câmera:", err);
            if (err.name === 'NotAllowedError') {
                setError("Acesso negado. Permita o uso da câmera nas configurações.");
            } else if (err.name === 'NotFoundError') {
                setError("Nenhuma câmera encontrada no dispositivo.");
            } else {
                setError("Erro ao abrir câmera. Verifique se outro app está usando.");
            }
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();

        // Cleanup function
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const handleCapture = () => {
        if (isTextMode) {
            // Modo Texto: Renderizar em ALTA resolução (quase 4K vertical)
            const canvas = document.createElement('canvas');
            canvas.width = 2160; 
            canvas.height = 3840;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Fundo gradiente
                const grd = ctx.createLinearGradient(0, 0, 0, 3840);
                grd.addColorStop(0, "#833ab4");
                grd.addColorStop(0.5, "#fd1d1d");
                grd.addColorStop(1, "#fcb045");
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 2160, 3840);
                
                // Texto
                ctx.fillStyle = "white";
                ctx.font = "bold 160px sans-serif"; // Fonte maior para resolução maior
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const lines = textContent.split('\n');
                lines.forEach((line, i) => {
                    ctx.fillText(line, 1080, 1920 + (i * 180) - ((lines.length - 1) * 90));
                });
                
                onCapture(canvas.toDataURL('image/jpeg', 0.95)); // Qualidade JPEG alta
            }
            return;
        }

        if (videoRef.current && canvasRef.current) {
            setFlashEffect(true);
            setTimeout(() => setFlashEffect(false), 150);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Configura o canvas com a resolução nativa do vídeo (que agora é alta)
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Espelhar se for câmera frontal
                if (facingMode === 'user') {
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                try {
                    // Exportar com qualidade máxima (0.95 a 1.0)
                    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                    onCapture(imageDataUrl);
                } catch (e) {
                    console.error("Erro ao processar imagem", e);
                    setError("Erro ao processar a foto.");
                }
            }
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    // Double tap to flip
    let lastTap = 0;
    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap < 300) {
            toggleCamera();
        }
        lastTap = now;
    };

    const handleToolClick = (toolName: string) => {
        if (toolName === 'Criar') {
            setIsTextMode(!isTextMode);
            setActiveTool(isTextMode ? null : 'Criar');
        } else if (toolName === 'Layout') {
            setIsGridActive(!isGridActive);
            setActiveTool(isGridActive ? null : 'Layout');
        } else if (toolName === 'Mais') {
            setIsMenuExpanded(!isMenuExpanded);
        } else {
            setActiveTool(activeTool === toolName ? null : toolName);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans text-white overflow-hidden touch-manipulation">
            {/* Flash Overlay */}
            <div className={`absolute inset-0 bg-white z-[110] pointer-events-none transition-opacity duration-100 ease-out ${flashEffect ? 'opacity-90' : 'opacity-0'}`}></div>

            {/* Video Layer - The Native Camera Feed */}
            <div 
                className="absolute inset-0 flex items-center justify-center bg-[#121212] z-0"
                onClick={handleDoubleTap}
            >
                {!isStreaming && !error && (
                    <div className="flex flex-col items-center gap-2 text-gray-500 animate-pulse">
                        <i className="fa-solid fa-camera text-4xl"></i>
                        <span className="text-xs font-bold uppercase tracking-wider">Iniciando...</span>
                    </div>
                )}
                
                {/* Text Mode Gradient Background */}
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

                {/* Grid Overlay */}
                {isGridActive && !isTextMode && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="w-full h-full border border-white/20 flex flex-col">
                            <div className="flex-1 border-b border-white/20 flex">
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1"></div>
                            </div>
                            <div className="flex-1 border-b border-white/20 flex">
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1"></div>
                            </div>
                            <div className="flex-1 flex">
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1 border-r border-white/20"></div>
                                <div className="flex-1"></div>
                            </div>
                        </div>
                    </div>
                )}
                
                {error ? (
                    <div className="text-center px-8 z-10 flex flex-col items-center">
                        <i className="fa-solid fa-triangle-exclamation text-4xl mb-4 text-red-500"></i>
                        <p className="text-gray-300 text-sm mb-6 text-center">{error}</p>
                        <button onClick={() => startCamera()} className="bg-white/10 px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-colors uppercase tracking-wider">
                            Tentar Novamente
                        </button>
                    </div>
                ) : (
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* --- UI LAYER --- */}
            
            {/* Top Bar (Close) */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent h-32 pointer-events-none">
                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center pointer-events-auto drop-shadow-md">
                    <i className="fa-solid fa-xmark text-3xl text-white"></i>
                </button>
                
                {!isTextMode && (
                    <button className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center mt-2">
                        <i className="fa-solid fa-bolt text-white text-sm"></i>
                    </button>
                )}
            </div>

            {/* Left Sidebar Tools */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6 px-4">
                {[
                    { id: 'Criar', icon: <span className="font-bold text-xl font-serif">Aa</span>, label: 'Criar' },
                    { id: 'Boomerang', icon: <i className="fa-solid fa-infinity text-xl"></i>, label: 'Boomerang' },
                    { id: 'Layout', icon: <i className="fa-solid fa-table-cells-large text-xl"></i>, label: 'Layout' },
                    { id: 'MaosLivres', icon: <i className="fa-solid fa-stopwatch text-xl"></i>, label: 'Mãos livres' },
                    { id: 'Mais', icon: <i className={`fa-solid fa-angle-down text-xl transition-transform ${isMenuExpanded ? 'rotate-180' : ''}`}></i>, label: '' }
                ].map((tool, idx) => (
                    <div 
                        key={idx} 
                        className="flex flex-col items-start gap-1 group cursor-pointer drop-shadow-md pointer-events-auto"
                        onClick={() => handleToolClick(tool.id)}
                    >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${activeTool === tool.id || (tool.id === 'Layout' && isGridActive) || (tool.id === 'Criar' && isTextMode) ? 'bg-white text-black' : 'bg-black/0 group-hover:bg-black/20 text-white'}`}>
                            {tool.icon}
                        </div>
                        {tool.label && (activeTool === tool.id || idx === 0) && (
                            <span className="text-[10px] font-medium ml-1 bg-black/50 px-1 rounded backdrop-blur-sm">{tool.label}</span>
                        )}
                    </div>
                ))}

                {/* Expanded Menu Items */}
                <AnimatePresence>
                    {isMenuExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-6"
                        >
                             <div className="flex flex-col items-start gap-1 group cursor-pointer pointer-events-auto">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/20 text-white">
                                    <i className="fa-solid fa-bolt text-xl"></i>
                                </div>
                            </div>
                             <div className="flex flex-col items-start gap-1 group cursor-pointer pointer-events-auto">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/20 text-white">
                                    <i className="fa-solid fa-moon text-xl"></i>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pb-safe bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-24 pointer-events-none">
                
                {/* Shutter Row */}
                <div className="flex justify-between items-center px-8 mb-8 pointer-events-auto">
                    {/* Gallery Thumbnail */}
                    <button 
                        onClick={onGalleryClick}
                        className="w-10 h-10 rounded-lg border-2 border-white/80 overflow-hidden bg-gray-800 active:scale-95 transition-transform shadow-lg"
                    >
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                             <i className="fa-solid fa-image text-white text-lg"></i>
                        </div>
                    </button>

                    {/* Shutter Button */}
                    <button 
                        onClick={handleCapture}
                        className="w-20 h-20 rounded-full border-[5px] border-white/50 flex items-center justify-center p-1 cursor-pointer active:scale-90 transition-transform duration-100 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                    >
                        {activeTool === 'MaosLivres' ? (
                             <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                                 <div className="w-4 h-4 bg-white rounded-sm"></div>
                             </div>
                        ) : (
                             <div className="w-full h-full bg-white rounded-full"></div>
                        )}
                    </button>

                    {/* Flip Camera */}
                    <button 
                        onClick={toggleCamera}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:rotate-180 transition-transform duration-500 shadow-lg border border-white/20"
                    >
                        <i className="fa-solid fa-rotate text-lg text-white"></i>
                    </button>
                </div>

                {/* Mode Selector - Only POST */}
                <div className="flex justify-center items-center pb-6 select-none pointer-events-auto">
                     <button 
                        className="transition-all duration-300 px-4 py-1 rounded-full text-white bg-black/40 backdrop-blur-md shadow-sm text-xs font-bold tracking-widest uppercase"
                    >
                        POST
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstagramCamera;
