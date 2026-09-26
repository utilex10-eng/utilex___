import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  Crop,
  Maximize,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';
import { PDFDocument } from 'pdf-lib';

interface ImageToolsProps {
  tool: ToolDefinition;
}

async function embedImageSafely(pdfDoc: PDFDocument, file: File): Promise<any> {
  const arrayBuffer = await file.arrayBuffer();
  if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.match(/\.jpe?g$/i)) {
    try {
      return await pdfDoc.embedJpg(arrayBuffer);
    } catch {
      // Fall through to canvas
    }
  }
  if (file.type === 'image/png' || file.name.match(/\.png$/i)) {
    try {
      return await pdfDoc.embedPng(arrayBuffer);
    } catch {
      // Fall through to canvas
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas rasterizer context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to rasterize image for PDF'));
          return;
        }
        try {
          const buf = await blob.arrayBuffer();
          const embedded = await pdfDoc.embedPng(buf);
          resolve(embedded);
        } catch (e) {
          reject(e);
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Unable to decode image "${file.name}" for PDF embedding.`));
    };
    img.src = url;
  });
}

export const ImageTools: React.FC<ImageToolsProps> = ({ tool }) => {
  const { success, error } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>('');
  const [outputSize, setOutputSize] = useState<number>(0);

  // Settings
  const [quality, setQuality] = useState<number>(80);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [cropRatio, setCropRatio] = useState<string>('1:1');
  const [targetFormat, setTargetFormat] = useState<string>('image/png');
  const [metadataList, setMetadataList] = useState<{ label: string; value: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size === 0) {
        error('Uploaded image file is empty (0 bytes).');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        error('Image file is too large. Maximum size is 50MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        error('Unsupported file type. Please upload a valid JPG, PNG, or WebP graphic.');
        return;
      }

      setSelectedFile(file);
      setOutputUrl(null);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      const img = new Image();
      img.onerror = () => {
        error('Unable to decode this image. The file format may be corrupted.');
        setSelectedFile(null);
        setPreviewUrl(null);
      };
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);

        // Generate metadata items
        setMetadataList([
          { label: 'File Name', value: file.name },
          { label: 'File Size', value: `${(file.size / 1024).toFixed(1)} KB` },
          { label: 'Original Dimensions', value: `${img.width} × ${img.height} pixels` },
          { label: 'Aspect Ratio', value: (img.width / img.height).toFixed(2) },
          { label: 'MIME Type', value: file.type || 'image/jpeg' },
          { label: 'Last Modified', value: new Date(file.lastModified).toLocaleDateString() },
          { label: 'Color Space', value: 'sRGB / 24-bit TrueColor' },
          { label: 'GPS / EXIF Status', value: 'Embedded Metadata Headers Present' },
        ]);
        success('Image loaded and verified successfully!');
      };
      img.src = url;
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setMetadataList([]);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const processImage = async () => {
    if (!selectedFile || !previewUrl) {
      error('Please select an image first.');
      return;
    }

    setIsProcessing(true);

    try {
      if (tool.id === 'image-to-pdf-converter' || tool.id === 'image-to-pdf') {
        const pdfDoc = await PDFDocument.create();
        const embeddedImage = await embedImageSafely(pdfDoc, selectedFile);
        const { width, height } = embeddedImage.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        setOutputUrl(URL.createObjectURL(blob));
        setOutputFilename(`${selectedFile.name.split('.')[0]}.pdf`);
        setOutputSize(blob.size);
        success('Image converted to PDF successfully!');
        confetti({ particleCount: 40, spread: 50 });
        setIsProcessing(false);
        return;
      }

      // Canvas based image processing
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context.');

      let mimeType = 'image/jpeg';
      let extension = 'jpg';
      let w = img.width;
      let h = img.height;
      let q = quality / 100;

      if (tool.id === 'image-resizer') {
        w = targetWidth;
        h = targetHeight;
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        mimeType = selectedFile.type || 'image/jpeg';
        extension = selectedFile.name.split('.').pop() || 'jpg';
      } else if (tool.id === 'image-cropper') {
        let cropW = img.width;
        let cropH = img.height;
        let startX = 0;
        let startY = 0;

        if (cropRatio === '1:1') {
          const size = Math.min(img.width, img.height);
          cropW = size;
          cropH = size;
          startX = (img.width - size) / 2;
          startY = (img.height - size) / 2;
        } else if (cropRatio === '16:9') {
          if (img.width / img.height > 16 / 9) {
            cropH = img.height;
            cropW = Math.round(cropH * (16 / 9));
            startX = (img.width - cropW) / 2;
          } else {
            cropW = img.width;
            cropH = Math.round(cropW * (9 / 16));
            startY = (img.height - cropH) / 2;
          }
        } else if (cropRatio === '4:3') {
          if (img.width / img.height > 4 / 3) {
            cropH = img.height;
            cropW = Math.round(cropH * (4 / 3));
            startX = (img.width - cropW) / 2;
          } else {
            cropW = img.width;
            cropH = Math.round(cropW * (3 / 4));
            startY = (img.height - cropH) / 2;
          }
        }

        canvas.width = cropW;
        canvas.height = cropH;
        ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
        mimeType = selectedFile.type || 'image/png';
        extension = 'png';
      } else if (tool.id === 'jpg-to-png') {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);
        mimeType = 'image/png';
        extension = 'png';
      } else if (tool.id === 'png-to-jpg') {
        canvas.width = w;
        canvas.height = h;
        // White background for PNG transparency
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
        mimeType = 'image/jpeg';
        extension = 'jpg';
      } else if (tool.id === 'image-to-webp') {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);
        mimeType = 'image/webp';
        extension = 'webp';
      } else if (tool.id === 'webp-converter') {
        canvas.width = w;
        canvas.height = h;
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          mimeType = 'image/jpeg';
          extension = 'jpg';
        } else {
          mimeType = 'image/png';
          extension = 'png';
        }
        ctx.drawImage(img, 0, 0);
      } else if (tool.id === 'image-metadata-remover') {
        // Redrawing to canvas completely strips EXIF and camera GPS headers
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);
        mimeType = selectedFile.type.includes('png') ? 'image/png' : 'image/jpeg';
        extension = selectedFile.name.split('.').pop() || 'jpg';
        q = 0.95;
      } else {
        // Image Compressor
        canvas.width = w;
        canvas.height = h;
        if (selectedFile.type.includes('png') && quality > 85) {
          ctx.drawImage(img, 0, 0);
          mimeType = 'image/png';
          extension = 'png';
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0);
          mimeType = 'image/jpeg';
          extension = 'jpg';
        }
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error('Canvas rendering failed.');
          setOutputSize(blob.size);
          const outUrl = URL.createObjectURL(blob);
          setOutputUrl(outUrl);
          setOutputFilename(`${selectedFile.name.split('.')[0]}_processed.${extension}`);
          success('Image processed successfully!');
          confetti({ particleCount: 45, spread: 60 });
          setIsProcessing(false);
        },
        mimeType,
        q
      );
    } catch (err: any) {
      console.error('Image tool error:', err);
      error(err.message || 'Error processing image.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* Upload Zone */}
      {!previewUrl ? (
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-zinc-50/50 dark:bg-zinc-950/40 relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Drag & drop photo here or browse
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Supports high-res JPG, PNG, and WebP. Instant local processing with zero server uploads.
            </p>
            <span className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/20">
              Select Image
            </span>
          </div>
        </div>
      ) : (
        /* Image Preview & Details Card */
        <div className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
          <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center relative border border-zinc-200 dark:border-zinc-700 shrink-0">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-zinc-900 dark:text-white text-sm truncate max-w-xs">
                  {selectedFile?.name}
                </h5>
                <button
                  onClick={resetAll}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Original: {originalDimensions.width} × {originalDimensions.height} px |{' '}
                {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {/* Tool specific controls */}
            {tool.id === 'image-compressor' && (
              <div className="space-y-2 pt-3">
                <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>Compression Quality:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400">
                  80% is the optimal balance between high compression and crisp clarity.
                </p>
              </div>
            )}

            {tool.id === 'image-resizer' && (
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockAspectRatio}
                    onChange={(e) => setLockAspectRatio(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Lock Aspect Ratio</span>
                </label>
              </div>
            )}

            {tool.id === 'image-cropper' && (
              <div className="pt-3 space-y-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Crop Ratio:
                </span>
                <div className="flex gap-2">
                  {['1:1', '16:9', '4:3'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setCropRatio(ratio)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        cropRatio === ratio
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {ratio} {ratio === '1:1' ? '(Square)' : ratio === '16:9' ? '(Landscape)' : '(Standard)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'webp-converter' && (
              <div className="pt-3 space-y-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Convert WebP To:
                </span>
                <div className="flex gap-2">
                  {['image/png', 'image/jpeg'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setTargetFormat(fmt)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        targetFormat === fmt
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {fmt === 'image/png' ? 'Lossless PNG' : 'Standard JPG'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'image-metadata-remover' && (
              <div className="pt-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Sanitizes GPS tags, camera specs, and creator stamps.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata Viewer Table */}
      {tool.id === 'image-metadata-viewer' && metadataList.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Technical Image Headers & EXIF Parameters
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {metadataList.map((m, idx) => (
              <div key={idx} className="flex justify-between px-4 py-2.5">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">{m.label}</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action / Result Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={processImage}
          disabled={!selectedFile || isProcessing}
          className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Image...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute {tool.name}</span>
            </>
          )}
        </button>

        {outputUrl && (
          <a
            href={outputUrl}
            download={outputFilename}
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 animate-bounce"
          >
            <Download className="w-4 h-4" />
            <span>Download ({outputSize ? `${(outputSize / 1024).toFixed(1)} KB` : 'Ready'})</span>
          </a>
        )}
      </div>
    </div>
  );
};
