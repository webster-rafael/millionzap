import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, X, FileText, Download } from "lucide-react";

interface FileViewerProps {
  src: string;
  name: string;
  isAgent: boolean;
}

export function FileViewer({ src, name, isAgent }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const controlColor = isAgent ? "text-white" : "text-gray-600";
  const bgColor = isAgent ? "bg-white/20" : "bg-gray-100";

  const isPDF = src.toLowerCase().endsWith(".pdf");

  return (
    <>
      <div
        className={`relative flex w-full items-center gap-2 rounded-md p-3 ${bgColor}`}
      >
        <FileText className={`${controlColor} h-10 w-10`} />
        <div className="mr-8 flex flex-1 flex-col">
          <span className="w-46 truncate text-sm">{name}</span>
          <div className="mt-1 flex gap-1">
            {isPDF && (
              <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                variant="ghost"
                className={`${controlColor} absolute top-0 right-0`}
              >
                <Maximize2 size={16} className="mr-1" />
              </Button>
            )}
            <a href={src} download target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className={controlColor}>
                <Download size={16} className="mr-1" /> Baixar
              </Button>
            </a>
          </div>
        </div>
      </div>

      {isOpen && isPDF && (
        <div
          className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative h-[90vh] w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={src}
              className="h-full w-full"
              title="Visualizador de Arquivo"
            />
            <Button
              onClick={() => setIsOpen(false)}
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
