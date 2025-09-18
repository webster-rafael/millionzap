// components/RecordingTimer.tsx

import { useEffect, useRef } from "react";

// Função para formatar o tempo (pode ser movida para um arquivo de utilidades)
const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
  const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

interface RecordingTimerProps {
  isRecording: boolean;
}

export function RecordingTimer({ isRecording }: RecordingTimerProps) {
  const timeDisplayRef = useRef<HTMLSpanElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      const timeDisplay = timeDisplayRef.current;

      if (timeDisplay) {
        // Inicia o intervalo para atualizar o tempo
        intervalRef.current = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          timeDisplay.textContent = formatTime(elapsedTime);
        }, 500); // Atualiza a cada 500ms para parecer mais fluido
      }
    } else {
      // Limpa o intervalo quando a gravação para
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Reseta o display
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = "00:00";
      }
    }

    // Função de limpeza para garantir que o intervalo seja limpo
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]); // Roda apenas quando isRecording muda

  return (
    <span ref={timeDisplayRef} className="font-mono text-sm text-gray-700">
      00:00
    </span>
  );
}