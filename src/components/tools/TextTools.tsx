import React, { useState, useMemo } from 'react';
import {
  Copy,
  Trash2,
  Check,
  FileSpreadsheet,
  ArrowDownAZ,
  Sparkles,
  Search,
  Repeat,
  Download
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface TextToolsProps {
  tool: ToolDefinition;
}

export const TextTools: React.FC<TextToolsProps> = ({ tool }) => {
  const { success, error } = useToast();
  const [inputText, setInputText] = useState<string>(
    tool.id === 'lorem-ipsum-generator'
      ? ''
      : 'UTILEX is a premier online utility suite created by Daniyal (utilex10). It provides lightning-fast tools for developers, designers, and students!'
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Settings
  const [findStr, setFindStr] = useState<string>('');
  const [replaceStr, setReplaceStr] = useState<string>('');
  const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);

  // Sorter / Cleaner options
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'length' | 'shuffle'>('asc');
  const [stripHtml, setStripHtml] = useState<boolean>(true);
  const [condenseSpaces, setCondenseSpaces] = useState<boolean>(true);

  // Lorem options
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [loremCount, setLoremCount] = useState<number>(3);

  // Repeater options
  const [repeatTimes, setRepeatTimes] = useState<number>(10);
  const [repeatSeparator, setRepeatSeparator] = useState<'newline' | 'space' | 'comma'>('newline');

  // Real-time Text Statistics
  const stats = useMemo(() => {
    const text = inputText.trim();
    if (!text) {
      return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: 0 };
    }
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = inputText.length;
    const charsNoSpaces = inputText.replace(/\s/g, '').length;
    const sentences = text ? (text.match(/[.!?]+(?:\s+|$)/g) || []).length || 1 : 0;
    const paragraphs = text ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
    const readingTime = Math.ceil(words / 200);

    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
  }, [inputText]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    success('File downloaded!');
  };

  // Case conversions
  const transformCase = (type: string) => {
    switch (type) {
      case 'upper':
        setInputText(inputText.toUpperCase());
        break;
      case 'lower':
        setInputText(inputText.toLowerCase());
        break;
      case 'title':
        setInputText(
          inputText.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
        );
        break;
      case 'sentence':
        setInputText(
          inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        );
        break;
      case 'camel':
        setInputText(
          inputText
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase())
        );
        break;
      case 'snake':
        setInputText(
          inputText
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
        );
        break;
      case 'kebab':
        setInputText(
          inputText
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '-')
        );
        break;
      case 'constant':
        setInputText(
          inputText
            .toUpperCase()
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
        );
        break;
    }
    success(`Transformed to ${type} case!`);
  };

  // Duplicate lines remover
  const removeDuplicates = () => {
    const lines = inputText.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];

    for (const line of lines) {
      const key = isCaseSensitive ? line.trim() : line.trim().toLowerCase();
      if (line.trim().length > 0 && !seen.has(key)) {
        seen.add(key);
        result.push(line);
      }
    }

    const removedCount = lines.length - result.length;
    setInputText(result.join('\n'));
    success(`Removed ${removedCount} duplicate / empty lines!`);
  };

  // Sorter
  const sortLines = () => {
    let lines = inputText.split('\n').filter((l) => l.trim().length > 0);
    if (sortOrder === 'asc') {
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    } else if (sortOrder === 'desc') {
      lines.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    } else if (sortOrder === 'length') {
      lines.sort((a, b) => a.length - b.length);
    } else if (sortOrder === 'shuffle') {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
    }
    setInputText(lines.join('\n'));
    success('Lines sorted successfully!');
  };

  // Cleaner
  const cleanText = () => {
    let res = inputText;
    if (stripHtml) {
      res = res.replace(/<[^>]*>?/gm, '');
    }
    if (condenseSpaces) {
      res = res.replace(/[ \t]+/g, ' ');
    }
    res = res.replace(/^\s+|\s+$/gm, '');
    setInputText(res);
    success('Text cleaned and normalized!');
  };

  // Find & Replace
  const executeFindReplace = () => {
    if (!findStr) return;
    try {
      let reg: RegExp;
      if (useRegex) {
        reg = new RegExp(findStr, isCaseSensitive ? 'g' : 'gi');
      } else {
        const escaped = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        reg = new RegExp(escaped, isCaseSensitive ? 'g' : 'gi');
      }
      const newText = inputText.replace(reg, replaceStr);
      setInputText(newText);
      success('Replaced all matching occurrences!');
    } catch {
      error('Invalid regular expression pattern.');
    }
  };

  // Lorem Generator
  const generateLorem = () => {
    const baseWords = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
      'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
      'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
      'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
      'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    if (loremType === 'words') {
      const generated: string[] = [];
      for (let i = 0; i < loremCount; i++) {
        generated.push(baseWords[i % baseWords.length]);
      }
      setInputText(generated.join(' ') + '.');
    } else if (loremType === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < loremCount; i++) {
        const sLen = 8 + (i % 6);
        const chunk = baseWords.slice((i * 3) % 20, (i * 3) % 20 + sLen);
        const s = chunk.join(' ');
        sentences.push(s.charAt(0).toUpperCase() + s.slice(1) + '.');
      }
      setInputText(sentences.join(' '));
    } else {
      // Paragraphs
      const paras: string[] = [];
      for (let p = 0; p < loremCount; p++) {
        paras.push(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        );
      }
      setInputText(paras.join('\n\n'));
    }
    success('Lorem Ipsum generated!');
  };

  // Repeater
  const executeRepeat = () => {
    const sep = repeatSeparator === 'newline' ? '\n' : repeatSeparator === 'comma' ? ', ' : ' ';
    const repeated = Array(repeatTimes).fill(inputText.trim()).join(sep);
    setInputText(repeated);
    success(`Repeated text ${repeatTimes} times!`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* Live Metrics Row (for word counter, character counter, sentence counter, etc.) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.words}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Words
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.chars}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Characters
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.charsNoSpaces}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            No Spaces
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.sentences}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Sentences
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.paragraphs}
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Paragraphs
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
            ~{stats.readingTime}m
          </span>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Reading
          </span>
        </div>
      </div>

      {/* Editor Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Input Content</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(inputText)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setInputText('')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => downloadText(inputText, `${tool.id}_output.txt`)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <textarea
          rows={9}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
        />
      </div>

      {/* Tool-specific Action Panels */}

      {/* Case Converter Panel */}
      {tool.id === 'case-converter' && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Convert To Case
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'UPPERCASE', id: 'upper' },
              { label: 'lowercase', id: 'lower' },
              { label: 'Title Case', id: 'title' },
              { label: 'Sentence case', id: 'sentence' },
              { label: 'camelCase', id: 'camel' },
              { label: 'snake_case', id: 'snake' },
              { label: 'kebab-case', id: 'kebab' },
              { label: 'CONSTANT_CASE', id: 'constant' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => transformCase(btn.id)}
                className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-semibold transition-all text-zinc-800 dark:text-zinc-200 text-center"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remove Duplicates Panel */}
      {tool.id === 'remove-duplicate-lines' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={(e) => setIsCaseSensitive(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span>Case Sensitive Matching</span>
          </label>
          <button
            onClick={removeDuplicates}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Purge Duplicates & Empty Lines
          </button>
        </div>
      )}

      {/* Text Sorter Panel */}
      {tool.id === 'text-sorter' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sort Mode:</span>
            {(['asc', 'desc', 'length', 'shuffle'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortOrder(mode)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  sortOrder === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {mode === 'asc' ? 'A → Z' : mode === 'desc' ? 'Z → A' : mode}
              </button>
            ))}
          </div>
          <button
            onClick={sortLines}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Apply Sorter
          </button>
        </div>
      )}

      {/* Text Cleaner Panel */}
      {tool.id === 'text-cleaner' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={stripHtml}
                onChange={(e) => setStripHtml(e.target.checked)}
                className="accent-indigo-600 rounded"
              />
              <span>Strip HTML Tags (&lt;div&gt;, &lt;p&gt;, etc.)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={condenseSpaces}
                onChange={(e) => setCondenseSpaces(e.target.checked)}
                className="accent-indigo-600 rounded"
              />
              <span>Condense Consecutive Spaces</span>
            </label>
          </div>
          <button
            onClick={cleanText}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Clean & Normalize Whitespace
          </button>
        </div>
      )}

      {/* Find & Replace Panel */}
      {tool.id === 'find-and-replace' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Find String / Pattern:
              </label>
              <input
                type="text"
                value={findStr}
                onChange={(e) => setFindStr(e.target.value)}
                placeholder="e.g. apple"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Replace With:
              </label>
              <input
                type="text"
                value={replaceStr}
                onChange={(e) => setReplaceStr(e.target.value)}
                placeholder="e.g. orange"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={isCaseSensitive}
                  onChange={(e) => setIsCaseSensitive(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={useRegex}
                  onChange={(e) => setUseRegex(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Use Regular Expression</span>
              </label>
            </div>
            <button
              onClick={executeFindReplace}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Lorem Generator Panel */}
      {tool.id === 'lorem-ipsum-generator' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Generate:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={loremCount}
              onChange={(e) => setLoremCount(parseInt(e.target.value, 10) || 1)}
              className="w-16 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
            <div className="flex gap-1.5">
              {(['paragraphs', 'sentences', 'words'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setLoremType(type)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    loremType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generateLorem}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Generate Dummy Text
          </button>
        </div>
      )}

      {/* Text Repeater Panel */}
      {tool.id === 'text-repeater' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Repeat Count:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={repeatTimes}
              onChange={(e) => setRepeatTimes(parseInt(e.target.value, 10) || 1)}
              className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Separator:</span>
            {(['newline', 'space', 'comma'] as const).map((sep) => (
              <button
                key={sep}
                onClick={() => setRepeatSeparator(sep)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  repeatSeparator === sep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {sep}
              </button>
            ))}
          </div>
          <button
            onClick={executeRepeat}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Execute Repeat
          </button>
        </div>
      )}
    </div>
  );
};
