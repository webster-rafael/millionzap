interface WhatsAppPreviewProps {
  title?: string | null;
  body: string;
  footer?: string | null;
  imageUrl?: string | null;
}

export function WhatsAppPreview({
  title,
  body,
  footer,
  imageUrl,
}: WhatsAppPreviewProps) {
  const formattedBody = body.replace(
    /{contactName}/g,
    '<span class="font-semibold text-blue-400">[Nome do Contato]</span>',
  );

  return (
    <div className="flex w-full flex-col items-center rounded-lg bg-[#E5DDD5] p-4">
      <div className="w-full max-w-[320px] rounded-lg bg-white p-1 shadow-md">
        {/* Balão de mensagem do WhatsApp */}
        <div className="rounded-md bg-[#DCF8C6] p-2 text-sm text-gray-800">
          {/* Imagem */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mb-2 h-auto w-full rounded-md object-cover"
            />
          )}

          {/* Título */}
          {title && <p className="font-bold">{title}</p>}

          {/* Corpo da Mensagem com HTML renderizado */}
          <p
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formattedBody }}
          />

          {/* Rodapé */}
          {footer && <p className="mt-1 text-xs text-gray-500">{footer}</p>}

          {/* Horário da mensagem */}
          <div className="mt-1 text-right text-[10px] text-gray-400">20:15</div>
        </div>
      </div>
    </div>
  );
}
