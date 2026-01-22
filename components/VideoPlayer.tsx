import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, onClose, autoplay = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detectar o tipo de vídeo e converter para URL embed
  const getVideoEmbedUrl = (url: string): string => {
    console.log('VideoPlayer - URL original:', url);
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&modestbranding=1&rel=0`;
      console.log('VideoPlayer - YouTube embed:', embedUrl);
      return embedUrl;
    }
    
    // YouTube curto (youtu.be)
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&modestbranding=1&rel=0`;
      console.log('VideoPlayer - YouTube short embed:', embedUrl);
      return embedUrl;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&title=0&byline=0&portrait=0`;
      console.log('VideoPlayer - Vimeo embed:', embedUrl);
      return embedUrl;
    }
    
    // Google Drive - melhor tratamento
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      console.log('VideoPlayer - Google Drive preview:', previewUrl);
      return previewUrl;
    }
    
    // Direct video files (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
      console.log('VideoPlayer - Direct video:', url);
      return url;
    }
    
    // Se não for nenhum formato suportado, retorna a URL original
    console.log('VideoPlayer - Unsupported format, using original:', url);
    return url;
  };

  // Verificar se é um vídeo direto (não embed)
  const isDirectVideo = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|avi|mov)$/i) !== null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);
  const isDirect = isDirectVideo(embedUrl);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Erro ao carregar o vídeo. Verifique se a URL está correta.');
  };

  useEffect(() => {
    if (videoRef.current && autoplay && isDirect) {
      videoRef.current.play().catch(() => {
        // Autoplay pode ser bloqueado pelo navegador
        console.log('Autoplay bloqueado pelo navegador');
      });
    }
  }, [autoplay, isDirect]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-black/80 backdrop-blur-lg rounded-2xl max-w-4xl w-full border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <h3 className="font-bold text-white text-lg truncate flex-1 mr-4">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-black rounded-b-2xl overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white/60 text-center">
                <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Carregando vídeo...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white/60 text-center p-6">
                <i className="fa-solid fa-exclamation-triangle text-3xl mb-3 text-red-400"></i>
                <p className="text-sm mb-2">{error}</p>
                <p className="text-xs text-white/40">URL: {videoUrl}</p>
              </div>
            </div>
          )}

          {isDirect ? (
            // Vídeo direto (HTML5 video)
            <video
              ref={videoRef}
              src={embedUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay={autoplay}
              onLoadStart={handleVideoLoad}
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              playsInline
            />
          ) : (
            // Embed (YouTube, Vimeo, Google Drive)
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoad}
              onError={handleVideoError}
            />
          )}
        </div>

        {/* Footer com informações */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-play-circle"></i>
                Player Integrado
              </span>
              {isDirect && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-video"></i>
                  Vídeo Direto
                </span>
              )}
              {embedUrl.includes('drive.google.com') && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <i className="fa-solid fa-external-link-alt"></i>
                  Google Drive
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {embedUrl.includes('drive.google.com') && (
                <button
                  onClick={() => window.open(videoUrl, '_blank')}
                  className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                >
                  Abrir em Nova Aba
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;
