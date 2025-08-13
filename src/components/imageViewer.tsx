import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface PhotoViewerProps {
  src: string;
  isAgent: boolean;
}

export function PhotoViewer({ src, isAgent }: PhotoViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  const controlColor = isAgent ? "text-white" : "text-gray-600";
  const bgColor = isAgent ? "bg-white/20" : "bg-gray-100";

  return (
    <div
      className={`flex items-center gap-2 rounded-md p-2 ${bgColor}`}
      style={{ maxWidth: isZoomed ? "100%" : "256px" }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={src}
          alt="Foto"
          className={`rounded-md transition-transform duration-300 ${
            isZoomed ? "scale-105 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={toggleZoom}
        />
      </div>

      <Button
        onClick={toggleZoom}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 shrink-0 rounded-full hover:bg-white/20 ${controlColor}`}
      >
        {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
    </div>
  );
}
