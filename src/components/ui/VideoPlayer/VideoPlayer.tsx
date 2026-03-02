'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { useInView, useReducedMotion } from '@/hooks';

type VideoPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9';
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  lazyLoad?: boolean;
};

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const aspectRatioMap = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
  '21/9': '42.86%',
};

const Container = styled.div<{ $aspectRatio: string }>`
  position: relative;
  width: 100%;
  padding-bottom: ${({ $aspectRatio }) =>
    aspectRatioMap[$aspectRatio as keyof typeof aspectRatioMap]};
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const VideoElement = styled.video<{ $isLoaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
  transition: opacity var(--duration-normal) var(--ease-default);
`;

const PosterImage = styled.div<{ $src: string; $isVisible: boolean }>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity var(--duration-normal) var(--ease-default);
`;

const LoadingOverlay = styled.div<{ $isLoading: boolean }>`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--color-bg-surface) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  opacity: ${({ $isLoading }) => ($isLoading ? 1 : 0)};
  transition: opacity var(--duration-normal) var(--ease-default);
  pointer-events: none;
`;

const PlayButton = styled.button<{ $isVisible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transition: all var(--duration-fast) var(--ease-default);
  animation: ${fadeIn} var(--duration-normal) var(--ease-default);

  &:hover {
    background-color: var(--color-interactive-primary);
    border-color: var(--color-interactive-primary);
    transform: translate(-50%, -50%) scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid var(--color-interactive-primary);
    outline-offset: 4px;
  }

  svg {
    margin-left: 4px;
  }
`;

const Controls = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-4);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity var(--duration-fast) var(--ease-default);
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) var(--ease-default);

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: var(--color-interactive-primary);
  border-radius: 2px;
  width: ${({ $progress }) => $progress}%;
  transition: width 0.1s linear;
`;

const TimeDisplay = styled.span`
  color: white;
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
  min-width: 80px;
  text-align: center;
`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const SmallPlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

const MuteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

export const VideoPlayer = ({
  src,
  poster,
  title,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  aspectRatio = '16/9',
  className,
  onPlay,
  onPause,
  onEnded,
  lazyLoad = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(muted);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);

  const { ref: inViewRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: false,
  });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (lazyLoad && inView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [inView, lazyLoad, shouldLoad]);

  useEffect(() => {
    if (
      autoPlay &&
      !reducedMotion &&
      inView &&
      videoRef.current &&
      shouldLoad
    ) {
      videoRef.current.play().catch(() => {});
    }
  }, [autoPlay, reducedMotion, inView, shouldLoad]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
      }
    },
    [duration]
  );

  const handleFullscreen = useCallback(() => {
    if (inViewRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        inViewRef.current.requestFullscreen();
      }
    }
  }, [inViewRef]);

  return (
    <Container
      ref={inViewRef}
      className={className}
      $aspectRatio={aspectRatio}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {shouldLoad && (
        <VideoElement
          ref={videoRef}
          src={src}
          poster={poster}
          muted={isMuted}
          loop={loop}
          playsInline
          preload="metadata"
          $isLoaded={isLoaded}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          aria-label={title}
        />
      )}

      {poster && (
        <PosterImage $src={poster} $isVisible={!isPlaying && !isLoaded} />
      )}

      <LoadingOverlay $isLoading={isLoading && shouldLoad} />

      {!isPlaying && isLoaded && (
        <PlayButton
          $isVisible={!isPlaying}
          onClick={togglePlay}
          aria-label="Play video"
        >
          <PlayIcon />
        </PlayButton>
      )}

      {controls && isLoaded && (
        <Controls $isVisible={showControls || !isPlaying}>
          <ControlButton
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <SmallPlayIcon />}
          </ControlButton>

          <ControlButton
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MuteIcon /> : <VolumeIcon />}
          </ControlButton>

          <ProgressBar
            onClick={handleProgressClick}
            role="slider"
            aria-label="Video progress"
          >
            <Progress $progress={progress} />
          </ProgressBar>

          <TimeDisplay>
            {formatTime(currentTime)} / {formatTime(duration)}
          </TimeDisplay>

          <ControlButton
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
          >
            <FullscreenIcon />
          </ControlButton>
        </Controls>
      )}
    </Container>
  );
};

export default VideoPlayer;
