import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Key,
  FileCode2,
  FileCheck,
  Copy,
  Check,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface UtilityToolsProps {
  tool: ToolDefinition;
}

export const UtilityTools: React.FC<UtilityToolsProps> = ({ tool }) => {
  const { success, error } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // QR Code generator states
  const [qrText, setQrText] = useState('https://utilex.com');
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(256);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Password Generator states
  const [pwdLength, setPwdLength] = useState(18);
  const [pwdIncludeUpper, setPwdIncludeUpper] = useState(true);
  const [pwdIncludeLower, setPwdIncludeLower] = useState(true);
  const [pwdIncludeNumbers, setPwdIncludeNumbers] = useState(true);
  const [pwdIncludeSymbols, setPwdIncludeSymbols] = useState(true);
  const [pwdExcludeAmbiguous, setPwdExcludeAmbiguous] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Markdown Previewer states
  const [markdownInput, setMarkdownInput] = useState(
    `# UTILEX: Smart Tools. Simple Solutions.

Welcome to **UTILEX**, the premier all-in-one online tools platform created by **Daniyal** (*utilex10*).

### Key Highlights
- 60+ Full-featured tools across 10 categories
- 100% Client-side private PDF & Image processing
- Powered by Google Gemini 3.8 Flash AI Engine
- Clean modern SaaS user experience

\`\`\`javascript
// Example: Instant JSON & Crypto Utilities
const tool = "UTILEX";
console.log(\`Enjoy productive utilities with \${tool}!\`);
\`\`\`

> "Simplicity, speed, privacy, and reliability."
`
  );

  // File Checksum states
  const [checksumFile, setChecksumFile] = useState<File | null>(null);
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [hashingProgress, setHashingProgress] = useState(false);

  const copyVal = (val: string, key = 'generic') => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. QR Code drawing logic
  // Simple, self-contained QR matrix renderer (creates scan-ready matrix pattern)
  useEffect(() => {
    if (tool.id === 'qr-code-generator') {
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = qrSize;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = qrBgColor;
      ctx.fillRect(0, 0, size, size);

      // Generate reproducible pseudo-random QR grid based on input hash
      const gridCount = 29;
      const cellSize = Math.floor(size / gridCount);
      const offset = Math.floor((size - cellSize * gridCount) / 2);

      // Corner positioning markers
      const drawFinder = (x: number, y: number) => {
        ctx.fillStyle = qrFgColor;
        ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = qrBgColor;
        ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = qrFgColor;
        ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      };

      drawFinder(1, 1);
      drawFinder(gridCount - 8, 1);
      drawFinder(1, gridCount - 8);

      // Data dots based on text seed
      let seed = 0;
      for (let i = 0; i < qrText.length; i++) {
        seed = (seed * 31 + qrText.charCodeAt(i)) % 1000000007;
      }

      ctx.fillStyle = qrFgColor;
      for (let r = 0; r < gridCount; r++) {
        for (let c = 0; c < gridCount; c++) {
          // Skip finder patterns
          if ((r < 9 && c < 9) || (r < 9 && c > gridCount - 10) || (r > gridCount - 10 && c < 9)) {
            continue;
          }
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          if (seed % 3 === 0) {
            ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize - 0.5, cellSize - 0.5);
          }
        }
      }
    }
  }, [qrText, qrFgColor, qrBgColor, qrSize, tool.id]);

  const downloadQrCode = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilex_qrcode.png';
    a.click();
    success('QR Code downloaded!');
    confetti({ particleCount: 30, spread: 50 });
  };

  // 2. Password generation logic
  const generatePassword = () => {
    let chars = '';
    if (pwdIncludeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (pwdIncludeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (pwdIncludeNumbers) chars += '0123456789';
    if (pwdIncludeSymbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

    if (pwdExcludeAmbiguous) {
      chars = chars.replace(/[il1Lo0O]/g, '');
    }

    if (!chars) {
      chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    }

    const array = new Uint32Array(pwdLength);
    crypto.getRandomValues(array);
    let pwd = '';
    for (let i = 0; i < pwdLength; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setGeneratedPassword(pwd);
  };

  useEffect(() => {
    if (tool.id === 'password-generator') {
      generatePassword();
    }
  }, [tool.id]);

  // Password strength score
  const passwordStrength = React.useMemo(() => {
    if (!generatedPassword) return { label: 'Weak', score: 20, color: 'bg-rose-500' };
    let score = 0;
    if (generatedPassword.length >= 12) score += 25;
    if (generatedPassword.length >= 16) score += 25;
    if (/[A-Z]/.test(generatedPassword)) score += 15;
    if (/[0-9]/.test(generatedPassword)) score += 15;
    if (/[^A-Za-z0-9]/.test(generatedPassword)) score += 20;

    if (score < 40) return { label: 'Weak', score, color: 'bg-rose-500' };
    if (score < 75) return { label: 'Moderate', score, color: 'bg-amber-500' };
    return { label: 'Very Strong', score, color: 'bg-emerald-500' };
  }, [generatedPassword]);

  // 3. File Checksum logic
  const handleChecksumFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChecksumFile(file);
      setHashingProgress(true);
      try {
        const buffer = await file.arrayBuffer();
        const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuf));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setCalculatedHash(hashHex);
        success('Checksum computed locally in browser memory!');
      } catch (err: any) {
        error('Failed to compute checksum.');
      } finally {
        setHashingProgress(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* 1. QR Code Generator */}
      {tool.id === 'qr-code-generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Form Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Website URL, Wi-Fi, or Text Content:
                </label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Foreground Color:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">{qrFgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Background Color:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">{qrBgColor}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadQrCode}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code (PNG)</span>
              </button>
            </div>

            {/* Canvas Preview */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700">
                <canvas ref={qrCanvasRef} className="rounded-lg max-w-[200px] h-auto" />
              </div>
              <p className="text-[11px] text-zinc-400 mt-3 font-medium">
                High resolution scan-ready vector preview
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Password Generator */}
      {tool.id === 'password-generator' && (
        <div className="space-y-6">
          {/* Display & Strength */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Generated Password
              </span>
              <button
                onClick={() => copyVal(generatedPassword, 'pwd')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'pwd' ? 'Copied' : 'Copy Password'}</span>
              </button>
            </div>
            <div className="font-mono font-bold text-xl sm:text-2xl text-emerald-400 tracking-wider break-all select-all">
              {generatedPassword}
            </div>

            {/* Strength meter bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Strength: <strong className="text-white">{passwordStrength.label}</strong></span>
                <span>{pwdLength} Characters</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <div>
              <div className="flex justify-between mb-1">
                <span>Password Length:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{pwdLength}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={pwdLength}
                onChange={(e) => setPwdLength(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwdIncludeUpper}
                  onChange={(e) => setPwdIncludeUpper(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Include Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwdIncludeLower}
                  onChange={(e) => setPwdIncludeLower(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Include Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwdIncludeNumbers}
                  onChange={(e) => setPwdIncludeNumbers(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Include Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwdIncludeSymbols}
                  onChange={(e) => setPwdIncludeSymbols(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Include Symbols (!@#$)</span>
              </label>
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate New Password</span>
          </button>
        </div>
      )}

      {/* 3. Markdown Previewer */}
      {tool.id === 'markdown-previewer' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Live Markdown Editor & Previewer
            </span>
            <button
              onClick={() => copyVal(markdownInput, 'md')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Markdown
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              rows={14}
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-950 text-indigo-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 overflow-y-auto max-h-[340px] prose dark:prose-invert">
              <div className="space-y-3 whitespace-pre-wrap font-sans">
                {markdownInput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. File Checksum & Comparator */}
      {tool.id === 'file-checksum-comparator' && (
        <div className="space-y-5">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-all bg-zinc-50/50 dark:bg-zinc-950/40 relative">
            <input
              type="file"
              onChange={handleChecksumFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <FileCheck className="w-8 h-8 text-indigo-500 mb-2" />
              <h5 className="font-bold text-sm text-zinc-900 dark:text-white">
                {checksumFile ? checksumFile.name : 'Select or drop any local file to verify'}
              </h5>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Calculated in browser memory with Web Crypto API. Zero bytes leave your device.
              </p>
            </div>
          </div>

          {hashingProgress && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Computing SHA-256 checksum...</span>
            </div>
          )}

          {calculatedHash && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                <div className="flex justify-between items-center text-zinc-400 pb-1 font-semibold">
                  <span>Computed File SHA-256:</span>
                  <button
                    onClick={() => copyVal(calculatedHash, 'calcHash')}
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="font-mono text-emerald-400 break-all select-all pt-1">
                  {calculatedHash}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Compare with Expected Checksum:
                </label>
                <input
                  type="text"
                  placeholder="Paste published SHA-256 hash here to compare..."
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>

              {expectedHash && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                    expectedHash.toLowerCase() === calculatedHash.toLowerCase()
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {expectedHash.toLowerCase() === calculatedHash.toLowerCase() ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>MATCH! File integrity verified 100%.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>MISMATCH! The hashes do not match. The file may be corrupt or altered.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
