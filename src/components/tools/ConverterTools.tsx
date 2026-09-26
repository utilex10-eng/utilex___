import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Globe,
  Palette,
  Copy,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ConverterToolsProps {
  tool: ToolDefinition;
}

export const ConverterTools: React.FC<ConverterToolsProps> = ({ tool }) => {
  const { success } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Unit Converter state
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'storage' | 'speed'>('length');
  const [unitVal, setUnitVal] = useState<number>(100);
  const [unitFrom, setUnitFrom] = useState<string>('meter');
  const [unitTo, setUnitTo] = useState<string>('foot');

  // Time zone state
  const [tzBase, setTzBase] = useState<string>('UTC');
  const [tzTarget, setTzTarget] = useState<string>('America/New_York');

  // Color Converter state
  const [colorHex, setColorHex] = useState<string>('#4f46e5');

  const copyVal = (val: string, key = 'generic') => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Unit conversion logic
  const unitResult = React.useMemo(() => {
    let result = 0;
    const v = unitVal;

    if (unitCategory === 'length') {
      // Base in meters
      const toMeters: Record<string, number> = {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254,
      };
      const meters = v * (toMeters[unitFrom] || 1);
      result = meters / (toMeters[unitTo] || 1);
    } else if (unitCategory === 'weight') {
      // Base in grams
      const toGrams: Record<string, number> = {
        gram: 1,
        kilogram: 1000,
        milligram: 0.001,
        pound: 453.592,
        ounce: 28.3495,
        ton: 1000000,
      };
      const grams = v * (toGrams[unitFrom] || 1);
      result = grams / (toGrams[unitTo] || 1);
    } else if (unitCategory === 'temp') {
      let c = v;
      if (unitFrom === 'fahrenheit') c = ((v - 32) * 5) / 9;
      if (unitFrom === 'kelvin') c = v - 273.15;

      if (unitTo === 'celsius') result = c;
      else if (unitTo === 'fahrenheit') result = (c * 9) / 5 + 32;
      else if (unitTo === 'kelvin') result = c + 273.15;
    } else if (unitCategory === 'storage') {
      // Base in Megabytes
      const toMb: Record<string, number> = {
        byte: 1 / (1024 * 1024),
        kilobyte: 1 / 1024,
        megabyte: 1,
        gigabyte: 1024,
        terabyte: 1024 * 1024,
      };
      const mb = v * (toMb[unitFrom] || 1);
      result = mb / (toMb[unitTo] || 1);
    } else if (unitCategory === 'speed') {
      // Base in km/h
      const toKmh: Record<string, number> = {
        kmh: 1,
        mph: 1.60934,
        ms: 3.6,
        knot: 1.852,
      };
      const kmh = v * (toKmh[unitFrom] || 1);
      result = kmh / (toKmh[unitTo] || 1);
    }

    return result;
  }, [unitCategory, unitVal, unitFrom, unitTo]);

  // Unit Options Dictionary
  const unitOptions: Record<string, { id: string; label: string }[]> = {
    length: [
      { id: 'meter', label: 'Meter (m)' },
      { id: 'kilometer', label: 'Kilometer (km)' },
      { id: 'centimeter', label: 'Centimeter (cm)' },
      { id: 'millimeter', label: 'Millimeter (mm)' },
      { id: 'foot', label: 'Foot (ft)' },
      { id: 'inch', label: 'Inch (in)' },
      { id: 'yard', label: 'Yard (yd)' },
      { id: 'mile', label: 'Mile (mi)' },
    ],
    weight: [
      { id: 'kilogram', label: 'Kilogram (kg)' },
      { id: 'gram', label: 'Gram (g)' },
      { id: 'pound', label: 'Pound (lb)' },
      { id: 'ounce', label: 'Ounce (oz)' },
      { id: 'ton', label: 'Metric Ton (t)' },
    ],
    temp: [
      { id: 'celsius', label: 'Celsius (°C)' },
      { id: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { id: 'kelvin', label: 'Kelvin (K)' },
    ],
    storage: [
      { id: 'byte', label: 'Bytes (B)' },
      { id: 'kilobyte', label: 'Kilobytes (KB)' },
      { id: 'megabyte', label: 'Megabytes (MB)' },
      { id: 'gigabyte', label: 'Gigabytes (GB)' },
      { id: 'terabyte', label: 'Terabytes (TB)' },
    ],
    speed: [
      { id: 'kmh', label: 'Kilometers per Hour (km/h)' },
      { id: 'mph', label: 'Miles per Hour (mph)' },
      { id: 'ms', label: 'Meters per Second (m/s)' },
      { id: 'knot', label: 'Knots (kn)' },
    ],
  };

  // Color Converter math
  const colorData = React.useMemo(() => {
    let hex = colorHex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    // HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    // CMYK
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    const c = k === 1 ? 0 : (1 - rNorm - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - gNorm - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - bNorm - k) / (1 - k);

    return {
      hex: `#${hex}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      cmyk: `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`,
      r,
      g,
      b,
    };
  }, [colorHex]);

  // World Clocks
  const worldCities = [
    { city: 'London (UTC/BST)', tz: 'Europe/London' },
    { city: 'New York (EDT/EST)', tz: 'America/New_York' },
    { city: 'San Francisco (PDT)', tz: 'America/Los_Angeles' },
    { city: 'Dubai (GST)', tz: 'Asia/Dubai' },
    { city: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
    { city: 'Sydney (AEST)', tz: 'Australia/Sydney' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* 1. Unit Converter */}
      {tool.id === 'unit-converter' && (
        <div className="space-y-5">
          <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 text-xs font-semibold scrollbar-none">
            {[
              { id: 'length', label: 'Length' },
              { id: 'weight', label: 'Weight & Mass' },
              { id: 'temp', label: 'Temperature' },
              { id: 'storage', label: 'Digital Storage' },
              { id: 'speed', label: 'Speed' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setUnitCategory(cat.id as any);
                  const opts = unitOptions[cat.id];
                  setUnitFrom(opts[0].id);
                  setUnitTo(opts[1].id);
                }}
                className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
                  unitCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Value:
              </label>
              <input
                type="number"
                value={unitVal}
                onChange={(e) => setUnitVal(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                From Unit:
              </label>
              <select
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium"
              >
                {unitOptions[unitCategory]?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                To Unit:
              </label>
              <select
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium"
              >
                {unitOptions[unitCategory]?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Converted Result
            </span>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {Number(unitResult.toPrecision(7))}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {unitVal} {unitFrom} = {Number(unitResult.toPrecision(7))} {unitTo}
            </p>
          </div>
        </div>
      )}

      {/* 2. Time Zone Converter */}
      {tool.id === 'time-zone-converter' && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Live International World Clocks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {worldCities.map((item, idx) => {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-US', {
                timeZone: item.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateStr = now.toLocaleDateString('en-US', {
                timeZone: item.tz,
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-col justify-between"
                >
                  <span className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">
                    {item.city}
                  </span>
                  <div className="my-2">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                      {timeStr}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">{dateStr}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Color Converter */}
      {tool.id === 'color-converter' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div
              className="w-28 h-28 rounded-2xl shadow-inner border border-black/10 shrink-0 flex items-center justify-center"
              style={{ backgroundColor: colorData.hex }}
            >
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
                title="Click to pick color"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                Interactive Color Palette
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Click on the swatch to pick any color or type your exact HEX code below.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">HEX:</span>
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'HEX Code', value: colorData.hex },
              { label: 'RGB Code', value: colorData.rgb },
              { label: 'HSL Code', value: colorData.hsl },
              { label: 'CMYK (Print)', value: colorData.cmyk },
            ].map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    {c.label}
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {c.value}
                  </span>
                </div>
                <button
                  onClick={() => copyVal(c.value, `color_${i}`)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  {copiedKey === `color_${i}` ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
