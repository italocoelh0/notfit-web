import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntegratedVideoPlayer.css';

interface IntegratedVideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  autoplay?: boolean;
}

const IntegratedVideoPlayer: React.FC<IntegratedVideoPlayerProps> = ({ 
  videoUrl, 
  title, 
  onClose, 
  autoplay = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detectar o tipo de vídeo e obter URL direta
  const getDirectVideoUrl = (url: string): string => {
    console.log('IntegratedVideoPlayer - URL original:', url);
    
    // YouTube - extrair URL direta do vídeo (se possível)
    if (url.includes('youtube.com/watch?v=')) {
      console.log('IntegratedVideoPlayer - YouTube detectado, mas não suportado para player nativo');
      setError('Vídeos do YouTube não são suportados no player integrado. Use Vimeo, Google Drive ou vídeos diretos.');
      return '';
    }
    
    if (url.includes('youtu.be/')) {
      console.log('IntegratedVideoPlayer - YouTube curto detectado, mas não suportado');
      setError('Vídeos do YouTube não são suportados no player integrado. Use Vimeo, Google Drive ou vídeos diretos.');
      return '';
    }
    
    // Vimeo - tentar obter URL direta
    if (url.includes('vimeo.com/')) {
      console.log('IntegratedVideoPlayer - Vimeo detectado');
      // Para Vimeo, precisamos usar o embed, mas vamos tentar uma abordagem diferente
      return url; // Manter URL original para tratamento especial
    }
    
    // Google Drive - converter para URL de download
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      console.log('IntegratedVideoPlayer - Google Drive direct URL:', directUrl);
      return directUrl;
    }
    
    // Vídeos diretos (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      console.log('IntegratedVideoPlayer - Vídeo direto detectado:', url);
      return url;
    }
    
    console.log('IntegratedVideoPlayer - URL não suportada para player nativo:', url);
    setError('Formato de vídeo não suportado. Use vídeos diretos (.mp4), Vimeo ou Google Drive.');
    return '';
  };

  const directUrl = getDirectVideoUrl(videoUrl);
  const isVimeo = videoUrl.includes('vimeo.com/');

  // Controles do vídeo
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (autoplay && videoRef.current && directUrl) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [autoplay, directUrl]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-100/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full p-8 text-center"
        >
          <div className="text-red-400 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="text-white text-xl font-semibold mb-4">Erro no Vídeo</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.open(videoUrl, '_blank')}
              className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-opacity"
            >
              Abrir Vídeo Externamente
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[1000] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        className="bg-gradient-to-br from-surface-900/95 to-surface-800/95 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <i className="fas fa-play-circle text-primary"></i>
                  Player Integrado
                </span>
                {isVimeo && (
                  <span className="flex items-center gap-2 text-blue-400">
                    <i className="fab fa-vimeo"></i>
                    Vimeo
                  </span>
                )}
                {videoUrl.includes('drive.google.com') && (
                  <span className="flex items-center gap-2 text-green-400">
                    <i className="fab fa-google-drive"></i>
                    Google Drive
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          {isVimeo ? (
            // Para Vimeo, usar iframe com estilo personalizado
            <iframe
              src={`https://player.vimeo.com/video/${videoUrl.split('vimeo.com/')[1]?.split('?')[0]}?autoplay=${autoplay ? 1 : 0}&title=0&byline=0&portrait=0`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Para vídeos diretos, usar video element nativo
            <>
              <video
                ref={videoRef}
                src={directUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white text-sm">{formatTime(duration)}</span>
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <i className="fas fa-volume-up text-white"></i>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <i className="fas fa-expand"></i>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Player integrado Nowfit</span>
            <div className="flex gap-2">
              {videoUrl.includes('drive.google.com') && (
                <button
                  onClick={() => window.open(videoUrl, '_blank')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs"
                >
                  <i className="fas fa-external-link-alt mr-1"></i>
                  Abrir Original
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IntegratedVideoPlayer;
