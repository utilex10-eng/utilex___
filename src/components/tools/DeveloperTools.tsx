import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Braces,
  Hash,
  Fingerprint,
  Code2,
  Clock,
  Download,
  Trash2
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface DeveloperToolsProps {
  tool: ToolDefinition;
}

export const DeveloperTools: React.FC<DeveloperToolsProps> = ({ tool }) => {
  const { success, error } = useToast();

  // JSON state
  const [jsonInput, setJsonInput] = useState<string>(
    '{"app":"UTILEX","founder":"Daniyal","tools":62,"features":["PDF","Image","AI","Dev"],"active":true}'
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Base64 state
  const [base64Plain, setBase64Plain] = useState<string>('Hello from UTILEX Developer Suite!');
  const [base64Encoded, setBase64Encoded] = useState<string>('SGVsbG8gZnJvbSBVVElMRVggRGV2ZWxvcGVyIFN1aXRlIQ==');

  // URL state
  const [urlPlain, setUrlPlain] = useState<string>('https://utilex.com/search?q=pdf tools&category=developer & ai');
  const [urlEncoded, setUrlEncoded] = useState<string>('');

  // UUID state
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);

  // Hash state
  const [hashInput, setHashInput] = useState<string>('UTILEX Secure Hash 2026');
  const [hashes, setHashes] = useState<{ sha256: string; sha512: string; sha384: string; sha1: string }>({
    sha256: '',
    sha512: '',
    sha384: '',
    sha1: '',
  });

  // Regex state
  const [regexPattern, setRegexPattern] = useState<string>('([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9._-]+)');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexText, setRegexText] = useState<string>(
    'Send inquiries to useful@utilex.com or founder at utilex10@gmail.com for priority assistance.'
  );

  // Timestamp state
  const [timestampInput, setTimestampInput] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [dateOutput, setDateOutput] = useState<{
    utc: string;
    local: string;
    iso: string;
    relative: string;
  }>({ utc: '', local: '', iso: '', relative: '' });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyVal = (val: string, key = 'generic') => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // JSON Formatter / Validator
  const formatJson = (spaces: number | 'tab') => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, spaces === 'tab' ? '\t' : spaces);
      setJsonInput(formatted);
      setJsonError(null);
      success('JSON formatted successfully!');
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError(null);
      success('JSON minified!');
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(jsonInput);
      setJsonError(null);
      success('Valid JSON syntax!');
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Base64 logic
  const handlePlainToBase64 = (plain: string) => {
    setBase64Plain(plain);
    try {
      const encoded = btoa(unescape(encodeURIComponent(plain)));
      setBase64Encoded(encoded);
    } catch {
      setBase64Encoded('');
    }
  };

  const handleBase64ToPlain = (encoded: string) => {
    setBase64Encoded(encoded);
    try {
      const plain = decodeURIComponent(escape(atob(encoded)));
      setBase64Plain(plain);
    } catch {
      // Invalid base64
    }
  };

  // URL logic
  useEffect(() => {
    if (tool.id === 'url-encoder' || tool.id === 'url-decoder') {
      try {
        setUrlEncoded(encodeURIComponent(urlPlain));
      } catch {}
    }
  }, [urlPlain, tool.id]);

  // UUID generator logic
  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      if (!uuidHyphens) u = u.replace(/-/g, '');
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
    success(`Generated ${uuidCount} UUID v4!`);
  };

  useEffect(() => {
    if (tool.id === 'uuid-generator' && uuids.length === 0) {
      generateUuids();
    }
  }, [tool.id]);

  // Hash calculation via Web Crypto
  useEffect(() => {
    if (tool.id === 'hash-generator') {
      const computeHashes = async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode(hashInput);

        const hashBufferToHex = (buffer: ArrayBuffer) => {
          const hashArray = Array.from(new Uint8Array(buffer));
          return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        };

        const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
          crypto.subtle.digest('SHA-256', data),
          crypto.subtle.digest('SHA-512', data),
          crypto.subtle.digest('SHA-384', data),
          crypto.subtle.digest('SHA-1', data),
        ]);

        setHashes({
          sha256: hashBufferToHex(sha256Buf),
          sha512: hashBufferToHex(sha512Buf),
          sha384: hashBufferToHex(sha384Buf),
          sha1: hashBufferToHex(sha1Buf),
        });
      };
      computeHashes().catch(() => {});
    }
  }, [hashInput, tool.id]);

  // Timestamp calculations
  useEffect(() => {
    if (tool.id === 'timestamp-converter') {
      let num = parseInt(timestampInput.trim(), 10);
      if (isNaN(num)) return;
      // Handle seconds vs milliseconds
      if (timestampInput.trim().length <= 10) {
        num = num * 1000;
      }
      const d = new Date(num);
      if (!isNaN(d.getTime())) {
        const diffSeconds = Math.round((Date.now() - d.getTime()) / 1000);
        let rel = `${Math.abs(diffSeconds)} seconds ${diffSeconds >= 0 ? 'ago' : 'from now'}`;
        if (Math.abs(diffSeconds) > 60) {
          rel = `${Math.round(Math.abs(diffSeconds) / 60)} minutes ${diffSeconds >= 0 ? 'ago' : 'from now'}`;
        }
        if (Math.abs(diffSeconds) > 3600) {
          rel = `${Math.round(Math.abs(diffSeconds) / 3600)} hours ${diffSeconds >= 0 ? 'ago' : 'from now'}`;
        }

        setDateOutput({
          utc: d.toUTCString(),
          local: d.toLocaleString(),
          iso: d.toISOString(),
          relative: rel,
        });
      }
    }
  }, [timestampInput, tool.id]);

  // Regex matches extraction
  const regexMatches = React.useMemo(() => {
    if (!regexPattern || !regexText) return [];
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexText.matchAll(re));
      return matches.map((m) => ({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      }));
    } catch {
      return [];
    }
  }, [regexPattern, regexFlags, regexText]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* 1. JSON Formatter / Validator */}
      {(tool.id === 'json-formatter' || tool.id === 'json-validator') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Format:</span>
              <button
                onClick={() => formatJson(2)}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white font-semibold transition-colors"
              >
                2 Spaces
              </button>
              <button
                onClick={() => formatJson(4)}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white font-semibold transition-colors"
              >
                4 Spaces
              </button>
              <button
                onClick={minifyJson}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white font-semibold transition-colors"
              >
                Minify
              </button>
              <button
                onClick={validateJson}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800"
              >
                Validate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyVal(jsonInput, 'json')}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-medium"
              >
                {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => setJsonInput('')}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 text-zinc-700 hover:text-rose-500 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {jsonError ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Syntax Error: {jsonError}</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>JSON is valid and properly formed</span>
            </div>
          )}

          <textarea
            rows={12}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              try {
                JSON.parse(e.target.value);
                setJsonError(null);
              } catch (err: any) {
                setJsonError(err.message);
              }
            }}
            className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-950 text-indigo-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>
      )}

      {/* 2. Base64 Encoder / Decoder */}
      {(tool.id === 'base64-encoder' || tool.id === 'base64-decoder') && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Plain Text (UTF-8):</span>
              <button
                onClick={() => copyVal(base64Plain, 'b64plain')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <textarea
              rows={4}
              value={base64Plain}
              onChange={(e) => handlePlainToBase64(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-mono text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Base64 Encoded Result:</span>
              <button
                onClick={() => copyVal(base64Encoded, 'b64enc')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <textarea
              rows={4}
              value={base64Encoded}
              onChange={(e) => handleBase64ToPlain(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-950 text-xs font-mono text-emerald-400"
            />
          </div>
        </div>
      )}

      {/* 3. URL Encoder / Decoder */}
      {(tool.id === 'url-encoder' || tool.id === 'url-decoder') && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Decoded / Human Readable URL:
            </label>
            <input
              type="text"
              value={urlPlain}
              onChange={(e) => setUrlPlain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Percent-Encoded URL Result:</span>
              <button
                onClick={() => copyVal(urlEncoded, 'url')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={urlEncoded}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-950 text-xs font-mono text-sky-400"
            />
          </div>
        </div>
      )}

      {/* 4. UUID Generator */}
      {tool.id === 'uuid-generator' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Quantity:</span>
              <select
                value={uuidCount}
                onChange={(e) => setUuidCount(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              >
                <option value={1}>1 UUID</option>
                <option value={5}>5 UUIDs</option>
                <option value={10}>10 UUIDs</option>
                <option value={25}>25 UUIDs</option>
                <option value={50}>50 UUIDs</option>
              </select>

              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={uuidHyphens}
                  onChange={(e) => setUuidHyphens(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Include Hyphens</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={uuidUppercase}
                  onChange={(e) => setUuidUppercase(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>UPPERCASE</span>
              </label>
            </div>

            <button
              onClick={generateUuids}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Generate Fresh UUIDs
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-zinc-400">
              <span>Generated UUID v4 ({uuids.length})</span>
              <button
                onClick={() => copyVal(uuids.join('\n'), 'uuids')}
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
            </div>
            {uuids.map((u, i) => (
              <div key={i} className="flex justify-between items-center py-1 text-emerald-400 group">
                <span>{u}</span>
                <button
                  onClick={() => copyVal(u, `u_${i}`)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Hash Generator */}
      {tool.id === 'hash-generator' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Source String to Hash:
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            {[
              { name: 'SHA-256 (Industry Standard)', value: hashes.sha256, color: 'text-indigo-400' },
              { name: 'SHA-512 (High Security)', value: hashes.sha512, color: 'text-emerald-400' },
              { name: 'SHA-384', value: hashes.sha384, color: 'text-sky-400' },
              { name: 'SHA-1 (Legacy / Git)', value: hashes.sha1, color: 'text-amber-400' },
            ].map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <div className="flex justify-between text-zinc-400 mb-1 font-semibold">
                  <span>{h.name}</span>
                  <button
                    onClick={() => copyVal(h.value, `hash_${i}`)}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className={`font-mono break-all ${h.color}`}>{h.value || 'Calculating...'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Regex Tester */}
      {tool.id === 'regex-tester' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Regular Expression Pattern:
              </label>
              <div className="flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 font-mono text-xs">
                <span className="text-zinc-400">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="w-full py-2 px-1 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                />
                <span className="text-zinc-400">/</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Flags:
              </label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                placeholder="g, i, m"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Test String:
            </label>
            <textarea
              rows={4}
              value={regexText}
              onChange={(e) => setRegexText(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-mono text-zinc-900 dark:text-white"
            />
          </div>

          {/* Regex Matches Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-zinc-400 pb-1 border-b border-zinc-800">
              <span className="font-semibold">Matching Results ({regexMatches.length})</span>
            </div>
            {regexMatches.length > 0 ? (
              regexMatches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 font-mono text-emerald-400 py-1">
                  <span className="text-zinc-500">#{i + 1} at index {m.index}:</span>
                  <span className="bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                    {m.match}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 italic">No matches found with current pattern.</p>
            )}
          </div>
        </div>
      )}

      {/* 7. Timestamp Converter */}
      {tool.id === 'timestamp-converter' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unix Timestamp (Seconds or Milliseconds):
              </label>
              <input
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-zinc-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setTimestampInput(Math.floor(Date.now() / 1000).toString())}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shrink-0"
            >
              Current Time
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            <div className="p-3 bg-white dark:bg-zinc-900 flex justify-between">
              <span className="font-semibold text-zinc-500">GMT / UTC:</span>
              <span className="font-mono text-zinc-900 dark:text-white">{dateOutput.utc}</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 flex justify-between">
              <span className="font-semibold text-zinc-500">Your Local Time:</span>
              <span className="font-mono text-zinc-900 dark:text-white">{dateOutput.local}</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 flex justify-between">
              <span className="font-semibold text-zinc-500">ISO-8601:</span>
              <span className="font-mono text-zinc-900 dark:text-white">{dateOutput.iso}</span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 flex justify-between">
              <span className="font-semibold text-zinc-500">Relative Offset:</span>
              <span className="font-mono text-indigo-500">{dateOutput.relative}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
