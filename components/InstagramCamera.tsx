
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstagramCameraProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
    onGalleryClick: () => void;
}

const InstagramCamera: React.FC<InstagramCameraProps> = ({ onCapture, onClose, onGalleryClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [error, setError] = useState<string | null>(null);
    const [flashEffect, setFlashEffect] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [maxZoom, setMaxZoom] = useState(3);
    const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');

    const getCameraStream = async (mode: 'user' | 'environment') => {
        const constraints: MediaStreamConstraints = {
            video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1920 } },
            audio: false
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
    };

    const startCamera = useCallback(async () => {
        setIsStreaming(false); setError(null);
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        try {
            const stream = await getCameraStream(facingMode);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                const track = stream.getVideoTracks()[0];
                const caps = track.getCapabilities();
                // @ts-ignore
                if (caps.zoom) setMaxZoom(caps.zoom.max || 3);
                setIsStreaming(true);
            }
        } catch (err) { setError("Erro ao acessar câmera."); }
    }, [facingMode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const handleShutter = () => {
        if (!videoRef.current) return;
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 200);

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        // Capturamos em alta resolução mas respeitando 3:4
        const captureW = video.videoWidth;
        const captureH = (video.videoWidth * 4) / 3;
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            const ratio = Math.max(1080 / video.videoWidth, 1440 / video.videoHeight);
            const w = video.videoWidth * ratio;
            const h = video.videoHeight * ratio;
            ctx.drawImage(video, (1080-w)/2, (1440-h)/2, w, h);
            onCapture(canvas.toDataURL('image/jpeg', 0.9));
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden touch-manipulation select-none">
            <div className={`absolute inset-0 bg-white z-[110] pointer-events-none transition-opacity duration-100 ${flashEffect ? 'opacity-80' : 'opacity-0'}`}></div>

            {/* Viewport 3:4 Overlay */}
            <div className="relative w-full aspect-[3/4] max-w-[500px] overflow-hidden bg-[#121212] border-y border-white/10">
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">{error}</div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} style={{ transform: `scale(${zoom})` }} />
                )}
            </div>

            {/* Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white"><i className="fa-solid fa-xmark text-3xl"></i></button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 pb-safe flex justify-between items-center bg-gradient-to-t from-black to-transparent">
                <button onClick={onGalleryClick} className="w-12 h-12 rounded-xl border-2 border-white/50 overflow-hidden bg-surface-200"><i className="fa-solid fa-image text-white text-xl"></i></button>
                <button onClick={handleShutter} className="w-20 h-20 rounded-full border-[6px] border-white/40 flex items-center justify-center p-1 active:scale-90 transition-transform"><div className="w-full h-full bg-white rounded-full"></div></button>
                <button onClick={() => setFacingMode(p => p==='user'?'environment':'user')} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><i className="fa-solid fa-rotate text-xl text-white"></i></button>
            </div>
        </div>
    );
};

export default InstagramCamera;
