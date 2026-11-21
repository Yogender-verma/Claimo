import React from 'react';
import { useReadAloud } from '../lib/readAloud';

interface ReadAloudButtonProps {
  textToRead: string;
  audioFilePath?: string;
  label?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  textToRead,
  audioFilePath,
  label = 'Listen / వినండి',
}) => {
  const { isPlaying, isPaused, voiceNotice, play, pause, stop } = useReadAloud(
    textToRead,
    audioFilePath
  );

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className="inline-flex items-center gap-1.5 bg-alt-bg dark:bg-dark-bg p-1 rounded-xl border border-border dark:border-dark-border">
        {!isPlaying ? (
          <button
            type="button"
            onClick={play}
            aria-label="Play audio read aloud"
            className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5 font-medium hover:border-teal text-teal dark:text-dark-teal"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>{label}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={isPaused ? play : pause}
              aria-label={isPaused ? 'Resume audio' : 'Pause audio'}
              className="py-1 px-2 text-xs rounded-lg font-semibold bg-teal text-white dark:bg-dark-teal dark:text-dark-bg"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Stop audio"
              className="py-1 px-2 text-xs rounded-lg text-muted hover:text-red-500"
            >
              ⏹ Stop
            </button>
          </div>
        )}
      </div>

      {voiceNotice && (
        <span className="text-[10px] text-amber-700 dark:text-amber-300 max-w-xs leading-tight">
          ℹ {voiceNotice}
        </span>
      )}
    </div>
  );
};

export default ReadAloudButton;
