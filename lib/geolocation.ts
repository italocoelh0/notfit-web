
// lib/geolocation.ts
import { GOOGLE_MAPS_API_KEY } from '../config';

interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine.
 * @param coord1 - A primeira coordenada {lat, lng}.
 * @param coord2 - A segunda coordenada {lat, lng}.
 * @returns A distância em quilômetros.
 */
export function haversineDistance(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formata o tempo em segundos para o formato HH:MM:SS.
 * @param totalSeconds - O tempo total em segundos.
 * @returns O tempo formatado como string.
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) {
      parts.push(hours < 10 ? '0' + hours : hours);
  }
  parts.push(minutes < 10 ? '0' + minutes : minutes);
  parts.push(seconds < 10 ? '0' + seconds : seconds);
  
  return parts.join(':');
}


/**
 * Formata o ritmo em segundos por quilômetro para o formato MM:SS.
 * @param secondsPerKm - O ritmo em segundos por km.
 * @returns O ritmo formatado como string.
 */
export function formatPace(secondsPerKm: number): string {
  if (!isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return '--:--';
  }
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

/**
 * Gera uma URL para a API do Google Static Maps com o traçado da rota.
 * @param path - Um array de coordenadas {lat, lng}.
 * @param mapType - Tipo do mapa ('roadmap', 'hybrid' - satélite com nomes).
 * @returns A URL da imagem do mapa em alta resolução.
 */
export function generateStaticMapUrl(path: LatLng[], mapType: 'roadmap' | 'hybrid' = 'roadmap'): string {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('SUA_CHAVE')) {
        console.error("Google Maps API Key não configurada.");
        return '';
    }

    // Style for dark mode map, but keeping icons (labels.icon) visible.
    // We only darken the geometry and labels text to match the app theme.
    const styles = [
        'element:geometry|color:0x242f3e',
        'element:labels.text.stroke|color:0x242f3e',
        'element:labels.text.fill|color:0x746855',
        'feature:road|element:geometry|color:0x38414e',
        'feature:road|element:geometry.stroke|color:0x212a37',
        'feature:water|element:geometry|color:0x17263c',
    ].join('&style=');

    // Se for híbrido, a linha deve ser mais visível
    const encodedPath = `color:0xfc5200ff|weight:5|${path.map(p => `${p.lat},${p.lng}`).join('|')}`;

    // scale=2 garante "retina" / alta resolução
    // size=600x600 é um bom tamanho base, com scale=2 vira 1200x1200px
    let url = `https://maps.googleapis.com/maps/api/staticmap?size=600x600&scale=2&maptype=${mapType}`;
    
    // Apenas adiciona estilos se for roadmap.
    if (mapType === 'roadmap') {
        url += `&style=${styles}`;
    }
    
    url += `&path=${encodeURIComponent(encodedPath)}&key=${GOOGLE_MAPS_API_KEY}`;

    return url;
}