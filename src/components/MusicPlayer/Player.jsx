import React, { useRef, useEffect } from 'react';

const Player = ({ activeSong, isPlaying, volume, seekTime, onEnded, onTimeUpdate, onLoadedData, repeat }) => {
  const ref = useRef(null);
  
    useEffect(() => {
    if (!ref.current) return;

    if (isPlaying) {
      ref.current.play().catch((err) => {        
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    } else {
      ref.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.pause(); 
    ref.current.load();
    ref.current.load(); 
    if (isPlaying) {
      ref.current.play().catch((err) =>{ 
        console.log('Audio play interrupted', err);
      });
    }
  }, [activeSong]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.currentTime = seekTime;
  }, [seekTime]);

  return (
    <audio
      ref={ref}
      src={
        activeSong?.preview || 
        activeSong?.hub?.actions?.[1]?.uri || 
        ""
      }
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
    />
  );
};

export default Player;
