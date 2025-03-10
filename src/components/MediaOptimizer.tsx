import React from "react";
import imageCompression from "browser-image-compression";
import ReactPlayer from "react-player";

interface MediaOrganizerProps {
  mediaUrl: string;
  onMediaChange: (url: string) => void;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export const MediaOrganizer: React.FC<MediaOrganizerProps> = ({
  mediaUrl,
  onMediaChange,
  maxSizeMB = 1,
  maxWidthOrHeight = 1920,
}) => {
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return "";
    const videoId = url.match(
      /(?:youtu\.be|youtube\.com(?:\/embed|\/v|\/watch\?v=|\/watch\?.+&v=))([^/&?\n]+)/,
    );
    return videoId
      ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=0`
      : "";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona solo archivos de imagen.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        preserveExif: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        onMediaChange(base64String);
        setIsProcessing(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error al comprimir imagen:", error);
      setError("Error al procesar la imagen. Intenta con otra.");
      setIsProcessing(false);
    }
  };

  const handleUrlInput = (url: string) => {
    if (isYouTubeUrl(url)) {
      const embedUrl = getYouTubeEmbedUrl(url);
      onMediaChange(embedUrl);
    } else {
      setError("URL no válida. Ingresa un enlace de YouTube válido.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Input para imágenes */}
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="media-input"
        />
        <label
          htmlFor="media-input"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isProcessing ? "Procesando..." : "Subir imagen"}
        </label>
      </div>

      {/* Input para URLs de YouTube */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Pega un enlace de YouTube"
          onChange={(e) => handleUrlInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Previsualización */}
      {mediaUrl && (
        <div className="relative rounded-lg overflow-hidden">
          {isYouTubeUrl(mediaUrl) ? (
            <div className="aspect-video">
              <ReactPlayer
                url={mediaUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={false}
                light={true} // Muestra thumbnail hasta que se reproduzca
                className="rounded-lg"
              />
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
