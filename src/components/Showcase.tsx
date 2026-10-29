import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2, VolumeX, ZoomIn, X, Cpu
} from 'lucide-react';

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  duration: 5 + ((i * 3) % 5),
  delay: (i * 0.4) % 3,
  left: `${10 + ((i * 7) % 80)}%`,
  top: `${20 + ((i * 5) % 60)}%`,
  tz: (i * 2) % 30,
}));

const NeuralGrid3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 3D Grid Planes */}
      <div className="absolute inset-0 neural-grid opacity-20 [transform:rotateX(60deg)_translateZ(-50px)]" />
      <div className="absolute inset-0 neural-grid opacity-10 [transform:rotateX(60deg)_translateZ(50px)]" />
      
      {/* Volumetric Data Points */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          animate={{ 
            y: [0, -25, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay 
          }}
          className="absolute w-1 h-1 bg-[#00f0ff] rounded-full blur-[2px]"
          style={{ 
            left: p.left, 
            top: p.top,
            transform: `translateZ(${p.tz}px)` 
          }}
        />
      ))}
    </div>
  );
};

const Showcase = () => {
  // ── 6 CORE PLAYBACK STATES (EXACT SPECIFICATION) ──
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [restartOnReturn, setRestartOnReturn] = useState(false);
  const [interactionPlayback, setInteractionPlayback] = useState(false);

  // Video resolution / metadata
  const [videoMeta, setVideoMeta] = useState<{ width: number; height: number; is4K: boolean } | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized refs to guarantee zero stale closures in observers and async promises
  const isVisibleRef = useRef(false);
  const isMutedRef = useRef(true);
  const isPlayingRef = useRef(false);
  const restartOnReturnRef = useRef(false);
  const interactionPlaybackRef = useRef(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    restartOnReturnRef.current = restartOnReturn;
  }, [restartOnReturn]);

  useEffect(() => {
    interactionPlaybackRef.current = interactionPlayback;
  }, [interactionPlayback]);

  // Safe playback trigger handling browser policies and promise rejections
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    video.muted = isMutedRef.current;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromiseRef.current = playPromise;
      playPromise
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          playPromiseRef.current = null;
        })
        .catch((err) => {
          playPromiseRef.current = null;
          // Handle browser autoplay policy restrictions gracefully
          if (!isMutedRef.current) {
            console.warn('[VideoPlayer] Autoplay with audio restricted by browser, falling back to muted:', err);
            video.muted = true;
            setIsMuted(true);
            isMutedRef.current = true;
            video.play().then(() => {
              setIsPlaying(true);
              isPlayingRef.current = true;
            }).catch(() => {});
          }
        });
    }
  }, []);

  // Safe pause trigger awaiting in-flight play promises
  const safePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          video.pause();
          setIsPlaying(false);
          isPlayingRef.current = false;
        })
        .catch(() => {
          video.pause();
          setIsPlaying(false);
          isPlayingRef.current = false;
        });
    } else {
      video.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, []);

  // ── SCROLL-BASED PLAYBACK VIA INTERSECTION OBSERVER ──
  useEffect(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting;
          setIsVisible(inView);
          isVisibleRef.current = inView;

          const video = videoRef.current;
          if (!video) return;

          if (inView) {
            // Player returned to view
            if (restartOnReturnRef.current) {
              // Interrupted during interaction-triggered playback: restart from beginning
              video.currentTime = 0;
              setRestartOnReturn(false);
              restartOnReturnRef.current = false;
            }
            safePlay();
          } else {
            // Player left view: pause immediately
            if (interactionPlaybackRef.current && !video.ended && video.currentTime > 0) {
              setRestartOnReturn(true);
              restartOnReturnRef.current = true;
            }
            safePause();
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [safePlay, safePause]);

  // ── MUTE / UNMUTE BUTTON EXACT INTERACTION ──
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Toggle audio state
    const nextMuted = !isMutedRef.current;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    video.muted = nextMuted;

    // 2. Mark interaction-triggered playback mode (stop at end, loop disabled)
    setInteractionPlayback(true);
    interactionPlaybackRef.current = true;
    setRestartOnReturn(false);
    restartOnReturnRef.current = false;

    // 3. Restart video from the beginning
    video.currentTime = 0;

    // 4. Start playback from the beginning
    safePlay();
  };

  // ── ON ENDED HANDLER: STOP AT END IN INTERACTION MODE ──
  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    if (interactionPlaybackRef.current) {
      // Interaction-triggered playback ends: stop playback and reset timeline to zero
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      isPlayingRef.current = false;
      setRestartOnReturn(false);
      restartOnReturnRef.current = false;
    } else {
      // Default continuous autoplay mode: loop continuously
      video.currentTime = 0;
      safePlay();
    }
  };

  // ── METADATA & RECOVERY HANDLERS ──
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      setVideoMeta({
        width,
        height,
        is4K: width >= 3840 || height >= 2160,
      });
    }
  };

  const handleVideoError = () => {
    console.warn('[VideoPlayer] Playback anomaly detected, attempting seamless recovery...');
    const video = videoRef.current;
    if (!video) return;
    const time = video.currentTime || 0;
    video.load();
    video.currentTime = time;
    video.muted = isMutedRef.current;
    safePlay();
  };

  const handleStalled = () => {
    const video = videoRef.current;
    if (video && video.paused && isVisibleRef.current) {
      safePlay();
    }
  };

  // ── KEYBOARD & SCROLL LOCK FOR ZOOM MODAL ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  useEffect(() => {
    if (isZoomed) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isZoomed]);

  return (
    <section id="showcase" className="w-full py-16 sm:py-20 lg:py-24 px-6 relative bg-[#030305] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-widest mb-3 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Neural Engine :: Live Mesh Cam</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight text-white">
            SPATIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#a200ff] to-[#ff0055]">COMPUTING</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Interact with the core simulation in real-time. Our spatial engine redefines the boundaries of virtual architecture.
          </p>
        </div>

        {/* Outer Vault Container - Preserves exact layout dimensions so page never reflows */}
        <div
          ref={playerContainerRef}
          data-is-visible={isVisible}
          data-is-playing={isPlaying}
          data-is-muted={isMuted}
          data-is-zoomed={isZoomed}
          data-restart-on-return={restartOnReturn}
          data-interaction-playback={interactionPlayback}
          className="relative max-w-4xl lg:max-w-5xl mx-auto w-full aspect-video"
        >
          {/* Ambient Placeholder when expanded in Zoom modal */}
          {isZoomed && (
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-dashed border-[#00f0ff]/30 bg-black/60 flex flex-col items-center justify-center gap-3 backdrop-blur-sm pointer-events-none z-0">
              <div className="p-3 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
                <ZoomIn className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center font-mono">
                <p className="text-white text-xs font-bold tracking-wider uppercase">Active In Zoom Modal</p>
                <p className="text-gray-400 text-[11px] mt-0.5">Press Esc or click close to return</p>
              </div>
            </div>
          )}

          {/* Video Player Frame - Switches seamlessly between Inline and Centered Zoom Modal */}
          <div
            className={
              isZoomed
                ? 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl'
                : 'relative w-full h-full rounded-2xl sm:rounded-3xl border border-white/15 bg-black overflow-hidden shadow-2xl group isolate'
            }
            style={
              isZoomed
                ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                  }
                : {
                    borderRadius: '1.5rem',
                  }
            }
            onClick={(e) => {
              if (isZoomed && e.target === e.currentTarget) {
                setIsZoomed(false);
              }
            }}
          >
            {/* Modal Dialog Card (Centered, width: min(95vw, 1200px), max-height: 90vh, uncropped) */}
            <div
              className={
                isZoomed
                  ? 'relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-white/20 bg-black/95 shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden'
                  : 'relative w-full h-full overflow-hidden rounded-[inherit]'
              }
              style={
                isZoomed
                  ? {
                      width: 'min(95vw, 1200px)',
                      maxHeight: '90vh',
                      aspectRatio: videoMeta ? `${videoMeta.width}/${videoMeta.height}` : '16/9',
                    }
                  : {
                      width: '100%',
                      height: '100%',
                    }
              }
            >
              {/* Single Shared Video Element (Never unmounted, zero playback disruption) */}
              <video
                ref={videoRef}
                src="/mkv.mp4"
                autoPlay
                loop={!interactionPlayback}
                muted={isMuted}
                playsInline
                preload="auto"
                controls={false}
                onEnded={handleEnded}
                onPlay={() => {
                  setIsPlaying(true);
                  isPlayingRef.current = true;
                }}
                onPause={() => {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                }}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleVideoError}
                onStalled={handleStalled}
                onWaiting={handleStalled}
                className={`w-full h-full block rounded-[inherit] ${
                  isZoomed ? 'object-contain' : 'object-cover object-center'
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: isZoomed ? 'contain' : 'cover',
                  objectPosition: 'center',
                  borderRadius: 'inherit',
                  maxHeight: isZoomed ? '90vh' : undefined,
                }}
              >
                <source src="/mkv.mp4" type="video/mp4" />
                <source src="/mkv.mkv" type="video/x-matroska" />
                <source src="/mkv.mkv" />
                <source src="/showcase_mesh.mp4" type='video/mp4; codecs="avc1.64002a"' />
                <source src="/nextgen.mp4" type="video/mp4" />
                <source src="/video%20nextgen.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Clean Close Button in Top-Right Corner (When Zoomed) */}
              {isZoomed && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-2.5 rounded-full bg-black/80 hover:bg-white/20 text-gray-300 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 flex items-center justify-center group"
                  title="Close Modal (Esc)"
                  aria-label="Close Modal"
                >
                  <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </button>
              )}

              {/* Scanning Light Effect (Only in inline view) */}
              {!isZoomed && (
                <motion.div
                  animate={{ top: ['0%', '75%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 w-full h-1/4 bg-gradient-to-b from-transparent via-[#00f0ff15] to-transparent z-10 pointer-events-none"
                />
              )}

              {/* Subtle Ambient Depth Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none rounded-[inherit]" />

              {/* 3D Neural Grid Overlay (Only in inline view) */}
              {!isZoomed && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                  <NeuralGrid3D />
                </div>
              )}

              {/* Top HUD Telemetry Bar */}
              <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-black/75 border border-[#00f0ff]/30 backdrop-blur-xl shadow-lg">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#00f0ff]">
                      {isZoomed ? 'SPATIAL ENGINE :: EXPANDED' : 'SPATIAL COMPUTING'}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>
                        {videoMeta?.is4K ? '4K UHD @ 60FPS ACTIVE' : 'LIVE STREAM ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls Bar (No play/pause button, no progress bar) */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between pointer-events-auto rounded-b-[inherit]">
                {/* Left: Mute/Unmute button - The ONLY playback control on main player */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 ${
                      isMuted
                        ? 'bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    }`}
                    title={isMuted ? 'Click to Unmute and Restart Audio' : 'Click to Mute and Restart Audio'}
                    aria-label={isMuted ? 'Unmute Video' : 'Mute Video'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                        <span className="text-emerald-300">Mute</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: Clean, normal Zoom In button with standard magnifying glass icon */}
                {!isZoomed ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsZoomed(true)}
                      className="px-3.5 sm:px-4 py-2 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95 group"
                      title="Zoom In (Expanded View)"
                      aria-label="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4 text-white group-hover:text-[#00f0ff] transition-colors shrink-0" />
                      <span>Zoom In</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsZoomed(false)}
                      className="px-3.5 sm:px-4 py-2 rounded-xl font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
                      title="Exit Expanded View (Esc)"
                      aria-label="Exit Expanded View"
                    >
                      <X className="w-4 h-4 text-white shrink-0" />
                      <span>Close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
