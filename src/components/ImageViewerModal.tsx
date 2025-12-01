import React from 'react';
import { motion } from 'framer-motion';

interface ImageViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.img
        layout
        src={imageUrl}
        alt="Expanded view"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
       <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl hover:opacity-80 transition-opacity" aria-label="Fechar visualizador de imagem">
        <i className="fa-solid fa-times"></i>
      </button>
    </motion.div>
  );
};

export default ImageViewerModal;
