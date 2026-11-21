import { useState, useEffect, useRef, useCallback } from 'react';

export interface ReadAloudState {
  isPlaying: boolean;
  isPaused: boolean;
  isSpeaking: boolean;
  voiceNotice: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
}

export function useReadAloud(textToRead: string, audioFilePath?: string): ReadAloudState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
      return;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const play = useCallback(() => {
    setVoiceNotice(null);

    // 1. Try pre-recorded audio file if specified
    if (audioFilePath) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioFilePath);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        audioRef.current.onerror = () => {
          // If audio file doesn't exist, fallback to SpeechSynthesis
          audioRef.current = null;
          fallbackToSpeechSynthesis();
        };
      }
      if (isPaused) {
        audioRef.current.play().catch(fallbackToSpeechSynthesis);
        setIsPlaying(true);
        setIsPaused(false);
        return;
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      }).catch(fallbackToSpeechSynthesis);
      return;
    }

    fallbackToSpeechSynthesis();

    function fallbackToSpeechSynthesis() {
      if (!('speechSynthesis' in window)) {
        setVoiceNotice('Text-to-speech is not supported in this browser.');
        return;
      }

      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        setIsPaused(false);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      // Look for Telugu voice (te-IN or te)
      const teluguVoice = voices.find(
        (v) => v.lang.toLowerCase().includes('te') || v.name.toLowerCase().includes('telugu')
      );

      if (teluguVoice) {
        utterance.voice = teluguVoice;
        utterance.lang = 'te-IN';
      } else {
        // Find Indian English or default
        const indianVoice = voices.find((v) => v.lang.toLowerCase().includes('en-in'));
        if (indianVoice) {
          utterance.voice = indianVoice;
          utterance.lang = 'en-IN';
        }
        setVoiceNotice(
          'Telugu voice is not installed on this device. You can install it in your device\'s text-to-speech settings.'
        );
      }

      utterance.rate = 0.95; // slightly slower for clarity

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        setIsPlaying(false);
        setIsPaused(false);
        if (e.error !== 'canceled') {
          setVoiceNotice('Could not play speech on this device.');
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [audioFilePath, isPaused, textToRead]);

  return {
    isPlaying,
    isPaused,
    isSpeaking: isPlaying && !isPaused,
    voiceNotice,
    play,
    pause,
    stop,
  };
}
