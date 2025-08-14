import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";

interface PhotoViewerProps {
  src: string;
  isAgent: boolean;
}

export function PhotoViewer({ src, isAgent }: PhotoViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const controlColor = isAgent ? "text-white" : "text-gray-600";
  const bgColor = isAgent ? "bg-white/20" : "bg-gray-100";

  return (
    <>
      <div className={`flex items-center justify-center rounded-md ${bgColor}`}>
        <div className="relative flex h-48 w-48 max-w-64 items-center justify-center overflow-hidden rounded-md">
          <img
            src={src}
            alt="Foto"
            className="h-full w-full cursor-zoom-in object-cover"
            onClick={() => setIsZoomed(true)}
          />
        </div>

        <Button
          onClick={() => setIsZoomed(true)}
          variant="ghost"
          size="icon"
          className={`absolute top-1 right-1 h-8 w-8 rounded-full ${controlColor}`}
        >
          <Maximize2 size={16} />
        </Button>
      </div>

      {isZoomed && (
        <div
          className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative w-full max-w-4xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt="Foto Ampliada"
              className="max-h-[90vh] w-full rounded-md object-contain shadow-lg"
            />

            <Button
              onClick={() => setIsZoomed(false)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
