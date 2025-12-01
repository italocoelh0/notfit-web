
// components/ProfessionalCard.tsx
import React from 'react';
import { Professional } from '../types';
import { motion } from 'framer-motion';

interface ProfessionalCardProps {
  professional: Professional;
  onSelect: () => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onSelect }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onSelect}
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section */}
          <div className="relative w-full sm:w-40 h-48 sm:h-auto flex-shrink-0">
              <img 
                src={professional.coverImageUrl} 
                alt={professional.name} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/40"></div>
              
              {/* Avatar Overlay */}
              <div className="absolute bottom-3 left-3 w-14 h-14 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_15px_rgba(252,82,0,0.4)] z-10">
                  <img src={professional.avatarUrl} alt={professional.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent sm:hidden"></div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <h3 className="font-anton uppercase text-xl text-white tracking-wide group-hover:text-primary transition-colors leading-none mb-1">
                              {professional.name}
                          </h3>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {professional.specialty}
                          </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-white font-anton tracking-wider">
                            <span className="text-primary text-sm">🔥</span> 
                            <span className="text-xl">{professional.monthlyPrice}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Mensal</span>
                      </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {professional.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                      {professional.services.slice(0, 3).map((service, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-wider flex items-center gap-1">
                              <i className="fa-solid fa-check text-primary/50 text-[8px]"></i> {service}
                          </span>
                      ))}
                  </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
                   <div className="flex gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                       <span className="flex items-center gap-1 text-yellow-500"><i className="fa-solid fa-star"></i> 5.0</span>
                       <span className="text-gray-600">•</span>
                       <span>{professional.testimonials.length} Reviews</span>
                   </div>
                   <span className="text-xs font-anton uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform flex items-center gap-2">
                       Ver Perfil <i className="fa-solid fa-arrow-right text-primary"></i>
                   </span>
              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalCard;
