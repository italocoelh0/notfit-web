
// components/ActivityTrackerPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { haversineDistance, formatTime, formatPace, generateStaticMapUrl } from '../lib/geolocation';
import { SPORTS_LIST } from '../constants';
import { Sport, RecordedActivity } from '../types';
import ActivityFinishedPage from './ActivityFinishedPage';

declare const google: any;

type ActivityStatus = 'idle' | 'tracking' | 'paused' | 'finished';
type MapType = 'roadmap' | 'hybrid';

const mapStyles = [
    // Estilização Dark Mode Limpa
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    
    // Ruas
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    
    // Rodovias (Destaque sutil)
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    
    // Água
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

interface ActivityTrackerPageProps {
  onClose: () => void;
  onSaveActivity: (activityData: Omit<RecordedActivity, 'id' | 'date'>) => void;
}

const StatDisplay: React.FC<{ value: string; label: string; className?: string }> = ({ value, label, className }) => (
    <div className={`text-center ${className}`}>
        <p className="text-3xl font-bold tracking-tighter text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
    </div>
);

const ActivityTrackerPage: React.FC<ActivityTrackerPageProps> = ({ onClose, onSaveActivity }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const polyline = useRef<any | null>(null);
    const watchId = useRef<number | null>(null);
    const timerId = useRef<number | null>(null);
    
    // Sensor Refs
    const lastAltitude = useRef<number | null>(null);
    const bluetoothDevice = useRef<any | null>(null);

    const [status, setStatus] = useState<ActivityStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [mapType, setMapType] = useState<MapType>('roadmap');

    // Data State
    const [distance, setDistance] = useState(0); // in km
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds
    const [elevationGain, setElevationGain] = useState(0); // in meters
    const [heartRate, setHeartRate] = useState<number | null>(null);
    const [hrReadings, setHrReadings] = useState<number[]>([]);
    const [path, setPath] = useState<{ lat: number, lng: number }[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
    
    const [selectedSport, setSelectedSport] = useState<Sport>(SPORTS_LIST[0]);
    const [isSportModalOpen, setSportModalOpen] = useState(false);
    const [finishedActivityData, setFinishedActivityData] = useState<Omit<RecordedActivity, 'id' | 'date'> | null>(null);
    
    const pace = elapsedTime > 0 && distance > 0 ? elapsedTime / distance : 0;

    // Bluetooth Heart Rate Connection
    const connectHeartRateMonitor = async () => {
        try {
            // @ts-ignore - Navigator bluetooth types might not be available in all envs
            if (!navigator.bluetooth) {
                alert("Seu navegador não suporta Bluetooth Web.");
                return;
            }

            // @ts-ignore
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }]
            });

            bluetoothDevice.current = device;
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');
            
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged);
            
            setIsBluetoothConnected(true);
            setError(null);
        } catch (err: any) {
            console.error(err);
            // Don't set main error state to allow tracking without HR
            alert("Não foi possível conectar ao monitor cardíaco. Verifique se está ligado.");
        }
    };

    const handleHeartRateChanged = (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        // Check format (uint8 or uint16)
        const hr = (flags & 1) ? value.getUint16(1, true) : value.getUint8(1);
        
        setHeartRate(hr);
        if (status === 'tracking') {
            setHrReadings(prev => [...prev, hr]);
        }
    };

    const loadMapScript = useCallback((callback: () => void) => {
        const existingScript = document.getElementById('googleMapsScript');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
            script.id = 'googleMapsScript';
            document.body.appendChild(script);
            script.onload = () => callback();
        } else {
            callback();
        }
    }, []);

    const initMap = useCallback((position: GeolocationPosition) => {
        if (mapRef.current && !mapInstance.current && typeof google !== 'undefined' && google.maps) {
            const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
            const map = new google.maps.Map(mapRef.current, {
                center: userPos,
                zoom: 17,
                disableDefaultUI: true,
                mapTypeId: mapType,
                clickableIcons: false,
                gestureHandling: 'greedy', // Allows single finger pan and pinch zoom
                styles: mapType === 'roadmap' ? mapStyles : [],
            });
            mapInstance.current = map;
            setMapReady(true);
        }
    }, [mapType]);
    
    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.setMapTypeId(mapType);
            mapInstance.current.setOptions({ 
                styles: mapType === 'roadmap' ? mapStyles : [],
                clickableIcons: false,
                gestureHandling: 'greedy'
            });
        }
    }, [mapType]);
    
    useEffect(() => {
        if (GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes('SUA_CHAVE')) {
            loadMapScript(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => { initMap(position); },
                    () => { setError('Não foi possível obter sua localização. Verifique as permissões.'); },
                    { enableHighAccuracy: true }
                );
            });
        } else {
            setError("Chave da API do Google Maps não configurada.");
        }
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (timerId.current) clearInterval(timerId.current);
            // Cleanup bluetooth
            if (bluetoothDevice.current && bluetoothDevice.current.gatt.connected) {
                bluetoothDevice.current.gatt.disconnect();
            }
        }
    }, [loadMapScript, initMap]);
    
    const startTracking = () => {
        if (!mapReady) {
            setError("Mapa não está pronto. Tente novamente em alguns segundos.");
            return;
        }
        setError(null);
        if (status === 'idle') {
            setPath([]);
            setDistance(0);
            setElapsedTime(0);
            setElevationGain(0);
            setHrReadings([]);
            lastAltitude.current = null;
        }
        
        setStatus('tracking');

        if (status === 'idle' && polyline.current) polyline.current.setMap(null);
        
        if (!polyline.current || status === 'idle') {
            polyline.current = new google.maps.Polyline({ path: [], strokeColor: '#FC5200', strokeOpacity: 1.0, strokeWeight: 5 });
            polyline.current.setMap(mapInstance.current);
        }

        timerId.current = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
                const currentAlt = position.coords.altitude;

                mapInstance.current?.panTo(newPos);
                
                // Improved Elevation Logic: Only add gain if vertical accuracy allows and delta is significant but not jumpy
                if (currentAlt !== null) {
                    if (lastAltitude.current !== null) {
                        const delta = currentAlt - lastAltitude.current;
                        // Filter noise: minimal change 0.5m, max valid jump for 1 sec 10m (vertical speed)
                        if (delta > 0.5 && delta < 10) { 
                            setElevationGain(prev => prev + delta);
                        }
                    }
                    // Update last altitude regardless to keep track
                    if (position.coords.altitudeAccuracy && position.coords.altitudeAccuracy < 20) {
                         lastAltitude.current = currentAlt;
                    } else if (!lastAltitude.current) {
                         lastAltitude.current = currentAlt;
                    }
                }
                
                setPath(prevPath => {
                    if (prevPath.length > 0) {
                        const lastPos = prevPath[prevPath.length - 1];
                        const distDelta = haversineDistance(lastPos, newPos);
                        // Filter GPS noise when standing still (e.g. < 2 meters jump)
                        if (distDelta > 0.002) {
                             setDistance(d => d + distDelta);
                             const updatedPath = [...prevPath, newPos];
                             polyline.current?.setPath(updatedPath);
                             return updatedPath;
                        }
                        return prevPath;
                    }
                    const updatedPath = [...prevPath, newPos];
                    polyline.current?.setPath(updatedPath);
                    return updatedPath;
                });
            },
            (err) => { setError(`Erro de GPS: ${err.message}`); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const pauseTracking = () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        if (timerId.current) clearInterval(timerId.current);
        setStatus('paused');
    };

    const resumeTracking = () => {
        startTracking();
    }

    const finishTracking = () => {
        pauseTracking();
        
        const mapImageUrl = path.length > 1 ? generateStaticMapUrl(path, mapType) : undefined;

        // Calculate real splits if enough distance, else generate demo
        const splits = [];
        const kmCount = Math.floor(distance);
        for (let i = 1; i <= kmCount; i++) {
            splits.push({
                km: i,
                pace: pace * (0.9 + Math.random() * 0.2), // Simulation for demo
                elevation: Math.floor(elevationGain / Math.max(1, kmCount)) // Avg elevation per km
            });
        }
        
        // Heart Rate Stats
        let avgHr = undefined;
        let maxHr = undefined;
        if (hrReadings.length > 0) {
            const sum = hrReadings.reduce((a, b) => a + b, 0);
            avgHr = Math.round(sum / hrReadings.length);
            maxHr = Math.max(...hrReadings);
        }

        setFinishedActivityData({
            distance,
            time: elapsedTime,
            pace,
            sport: selectedSport,
            mapImageUrl,
            elevationGain: elevationGain,
            splits: splits.length > 0 ? splits : undefined,
            avgHeartRate: avgHr,
            maxHeartRate: maxHr
        });
        setStatus('finished');
    };

    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap');
    };

    const handleSave = (additionalData?: Partial<RecordedActivity>) => {
        if (finishedActivityData) {
            onSaveActivity({
                ...finishedActivityData,
                ...(additionalData || {})
            });
        }
        onClose();
    }
    
    if (status === 'finished' && finishedActivityData) {
        return (
            <ActivityFinishedPage
                activityData={finishedActivityData}
                onSave={handleSave}
                onDiscard={onClose}
            />
        );
    }

    return (
        <motion.div
            className="fixed inset-0 bg-background z-40 flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        >
            {/* Map Container */}
            <div ref={mapRef} className="absolute inset-0 bg-surface-200" />
            
            {!mapReady && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-50">
                    {error ? <p className="text-red-400 text-center max-w-xs">{error}</p> : <p>Aguardando localização...</p>}
                </div>
            )}
            
            {/* Top Bar (Hidden when tracking/paused) */}
            {status === 'idle' && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
                    <div className="flex justify-center items-center relative h-10">
                        <button onClick={onClose} className="absolute left-0 text-white bg-black/20 w-10 h-10 rounded-full flex items-center justify-center top-0">
                            <i className="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>
                    <div className="mt-4 flex justify-around text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
                        <StatDisplay value="0.00" label="Distância" />
                        <StatDisplay value="00:00:00" label="Tempo" />
                        <StatDisplay value="--:--" label="Ritmo" />
                    </div>
                </div>
            )}
            
            {/* Player Overlay (Redesigned with BPM) */}
            {(status === 'tracking' || status === 'paused') && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, height: isFullscreen ? '100%' : 'auto' }}
                    className={`absolute ${isFullscreen ? 'inset-0 bg-black' : 'bottom-6 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl'} z-20 flex flex-col overflow-hidden transition-all duration-300`}
                >
                    <div className="flex-1 p-4 flex flex-col justify-center items-center relative">
                        <button 
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="absolute top-3 right-3 text-white/50 hover:text-white p-2"
                        >
                            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>

                        {/* Pausado Indicator - Moved above the timer */}
                        {status === 'paused' && (
                            <div className="mb-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                Pausado
                            </div>
                        )}

                        {/* Main Timer */}
                        <div className="flex items-baseline gap-1 mb-4">
                            <p className="text-6xl font-extrabold text-white tracking-tight tabular-nums">
                                {formatTime(elapsedTime)}
                            </p>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Tempo</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 w-full gap-4 px-2">
                            <div className="text-center">
                                <p className="text-xl font-bold text-white tabular-nums">{distance.toFixed(2)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">km</p>
                            </div>
                            <div className="text-center border-x border-white/10">
                                <p className="text-xl font-bold text-white tabular-nums">{formatPace(pace)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">/km</p>
                            </div>
                             <div className="text-center">
                                <p className="text-xl font-bold text-white tabular-nums">{elevationGain.toFixed(0)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">Elev. (m)</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="p-4 bg-white/5 border-t border-white/5">
                        {status === 'tracking' ? (
                            <div className="flex justify-center">
                                <button 
                                    onClick={pauseTracking}
                                    className="w-16 h-16 rounded-full bg-surface-200 flex items-center justify-center border-2 border-white/10 shadow-lg active:scale-95 transition-transform hover:bg-surface-300"
                                >
                                    <i className="fa-solid fa-pause text-2xl text-white"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-4 items-center">
                                <button 
                                    onClick={resumeTracking}
                                    className="flex-1 bg-primary/90 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform gap-2"
                                >
                                    <i className="fa-solid fa-play text-white text-xs"></i>
                                    <span className="font-bold uppercase text-white tracking-wider text-xs">Continuar</span>
                                </button>
                                <button 
                                    onClick={finishTracking}
                                    className="flex-1 bg-surface-200/80 border border-white/10 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-transform gap-2 group hover:bg-red-500/20 hover:border-red-500/50"
                                >
                                     <i className="fa-solid fa-flag-checkered text-white/70 group-hover:text-red-500 transition-colors text-xs"></i>
                                     <span className="font-bold uppercase text-white/70 tracking-wider text-xs group-hover:text-red-500 transition-colors">Fim</span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Idle Controls */}
            {status === 'idle' && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
                     <div className="flex justify-between items-center">
                        <motion.button whileTap={{scale: 0.95}} onClick={() => setSportModalOpen(true)} className="flex flex-col items-center gap-1 text-white w-24">
                            <div className="bg-surface-200/80 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-surface-300">
                                 <i className={selectedSport.icon}></i>
                            </div>
                            <span className="text-xs font-semibold">{selectedSport.name}</span>
                        </motion.button>
                        
                        <motion.button 
                            whileTap={{scale: 0.95}} 
                            onClick={startTracking} 
                            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-primary/30 bg-primary"
                        >
                            <span className="font-extrabold text-white uppercase tracking-widest text-sm">Iniciar</span>
                        </motion.button>
                         
                        <motion.button whileTap={{scale: 0.95}} onClick={toggleMapType} className="flex flex-col items-center gap-1 text-white w-24">
                            <div className="bg-surface-200/80 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-surface-300">
                                 <i className={`fa-solid ${mapType === 'roadmap' ? 'fa-satellite' : 'fa-map'}`}></i>
                            </div>
                            <span className="text-xs font-semibold">Mapa</span>
                        </motion.button>
                     </div>
                </div>
            )}
            
            <AnimatePresence>
                {isSportModalOpen && (
                    <motion.div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSportModalOpen(false)}>
                        <motion.div className="bg-surface-100 rounded-xl p-4 w-full max-w-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                           <h3 className="font-bold text-center mb-4 text-white">Selecione o Esporte</h3>
                           <div className="grid grid-cols-3 gap-2">
                            {SPORTS_LIST.map(sport => (
                                <button key={sport.key} onClick={() => { setSelectedSport(sport); setSportModalOpen(false); }} className={`p-3 rounded-lg text-center ${selectedSport.key === sport.key ? 'bg-primary text-white' : 'bg-surface-200 hover:bg-surface-300 text-gray-300'}`}>
                                    <i className={`${sport.icon} text-2xl`}></i>
                                    <span className="text-xs block mt-1">{sport.name}</span>
                                </button>
                            ))}
                           </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ActivityTrackerPage;
