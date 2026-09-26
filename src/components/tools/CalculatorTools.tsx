import React, { useState } from 'react';
import {
  Percent,
  Calendar,
  Receipt,
  CalendarDays,
  Dices,
  Copy,
  Check,
  RefreshCw,
  Calculator as CalcIcon
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface CalculatorToolsProps {
  tool: ToolDefinition;
}

export const CalculatorTools: React.FC<CalculatorToolsProps> = ({ tool }) => {
  const { success, error } = useToast();

  // Percentage calculator states
  const [percMode, setPercMode] = useState<'of' | 'increase' | 'what'>('of');
  const [percA, setPercA] = useState<number>(15);
  const [percB, setPercB] = useState<number>(200);

  // Age calculator states
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');

  // Tax/GST states
  const [taxAmount, setTaxAmount] = useState<number>(100);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [taxMode, setTaxMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  // Date difference states
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  // Random number states
  const [rngMin, setRngMin] = useState<number>(1);
  const [rngMax, setRngMax] = useState<number>(100);
  const [rngCount, setRngCount] = useState<number>(5);
  const [rngUnique, setRngUnique] = useState<boolean>(true);
  const [rngResults, setRngResults] = useState<number[]>([]);

  // 1. Percentage calculation logic
  const percentageResult = React.useMemo(() => {
    if (percMode === 'of') {
      const res = (percA / 100) * percB;
      return {
        formula: `${percA}% of ${percB}`,
        answer: res.toFixed(2),
        explanation: `(${percA} ÷ 100) × ${percB} = ${res.toFixed(2)}`,
      };
    } else if (percMode === 'increase') {
      if (percA === 0) return { formula: 'Change', answer: '0%', explanation: 'Base cannot be 0' };
      const diff = percB - percA;
      const pct = (diff / percA) * 100;
      return {
        formula: `Change from ${percA} to ${percB}`,
        answer: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
        explanation: `((${percB} - ${percA}) ÷ ${percA}) × 100 = ${pct.toFixed(2)}% (${diff >= 0 ? 'Increase' : 'Decrease'})`,
      };
    } else {
      if (percB === 0) return { formula: 'Proportion', answer: '0%', explanation: 'Denominator cannot be 0' };
      const res = (percA / percB) * 100;
      return {
        formula: `${percA} is what % of ${percB}`,
        answer: `${res.toFixed(2)}%`,
        explanation: `(${percA} ÷ ${percB}) × 100 = ${res.toFixed(2)}%`,
      };
    }
  }, [percMode, percA, percB]);

  // 2. Age calculation logic
  const ageResult = React.useMemo(() => {
    if (!birthDate) return null;
    const b = new Date(birthDate);
    const now = new Date();
    if (isNaN(b.getTime()) || b > now) return null;

    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;

    // Next birthday
    let nextBday = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (nextBday < now) {
      nextBday = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays, totalHours, daysToNextBday };
  }, [birthDate]);

  // 3. Tax / GST calculation logic
  const taxResult = React.useMemo(() => {
    const amt = taxAmount || 0;
    const rate = taxRate || 0;

    if (taxMode === 'exclusive') {
      const tax = (amt * rate) / 100;
      const total = amt + tax;
      return { net: amt, tax, total };
    } else {
      const net = (amt * 100) / (100 + rate);
      const tax = amt - net;
      return { net, tax, total: amt };
    }
  }, [taxAmount, taxRate, taxMode]);

  // 4. Date difference calculation logic
  const dateDiffResult = React.useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;

    const diffMs = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    // Business days (Mon-Fri)
    let cur = new Date(Math.min(s.getTime(), e.getTime()));
    const finish = new Date(Math.max(s.getTime(), e.getTime()));
    let businessDays = 0;
    while (cur <= finish) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) businessDays++;
      cur.setDate(cur.getDate() + 1);
    }

    return { totalDays, weeks, remDays, businessDays };
  }, [startDate, endDate]);

  // 5. Random numbers logic
  const generateRandomNumbers = () => {
    const results: number[] = [];
    const min = Math.min(rngMin, rngMax);
    const max = Math.max(rngMin, rngMax);
    const range = max - min + 1;

    if (rngUnique && rngCount > range) {
      error(`Range (${range}) is smaller than requested unique count (${rngCount}).`);
      return;
    }

    const set = new Set<number>();
    while (results.length < rngCount) {
      const rand = Math.floor(Math.random() * range) + min;
      if (rngUnique) {
        if (!set.has(rand)) {
          set.add(rand);
          results.push(rand);
        }
      } else {
        results.push(rand);
      }
    }
    setRngResults(results);
    success(`Generated ${rngCount} random numbers!`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* Percentage Calculator */}
      {tool.id === 'percentage-calculator' && (
        <div className="space-y-5">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            {[
              { id: 'of', label: 'What is X% of Y?' },
              { id: 'increase', label: '% Increase / Decrease' },
              { id: 'what', label: 'X is what % of Y?' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPercMode(tab.id as any)}
                className={`py-2.5 px-4 border-b-2 transition-colors ${
                  percMode === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {percMode === 'of' ? 'Percentage (X%)' : percMode === 'increase' ? 'Initial Value (From)' : 'Value (X)'}:
              </label>
              <input
                type="number"
                value={percA}
                onChange={(e) => setPercA(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {percMode === 'of' ? 'Total (Y)' : percMode === 'increase' ? 'Final Value (To)' : 'Total (Y)'}:
              </label>
              <input
                type="number"
                value={percB}
                onChange={(e) => setPercB(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Calculation Result
            </span>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {percentageResult.answer}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono pt-1">
              Formula: {percentageResult.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Age Calculator */}
      {tool.id === 'age-calculator' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Date of Birth:
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
            />
          </div>

          {ageResult && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {ageResult.years}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Years Lived</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {ageResult.months}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Months</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {ageResult.days}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                  {ageResult.totalDays.toLocaleString()}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Total Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
                <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                  {ageResult.totalHours.toLocaleString()}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Total Hours</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {ageResult.daysToNextBday} days
                </span>
                <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                  Next Birthday 🎂
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GST / Tax Calculator */}
      {tool.id === 'gst-tax-calculator' && (
        <div className="space-y-5">
          <div className="flex gap-2">
            <button
              onClick={() => setTaxMode('exclusive')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                taxMode === 'exclusive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Add Tax (Tax Exclusive)
            </button>
            <button
              onClick={() => setTaxMode('inclusive')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                taxMode === 'inclusive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Remove Tax (Tax Inclusive)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Amount ($ / Currency):
              </label>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tax / GST Rate (%):
              </label>
              <div className="flex gap-2">
                {[5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setTaxRate(rate)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      taxRate === rate
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="block text-xs font-semibold text-zinc-500 uppercase">Net Amount</span>
              <span className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                ${taxResult.net.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-indigo-500 uppercase">Tax Amount ({taxRate}%)</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                ${taxResult.tax.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-emerald-500 uppercase">Gross Total</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ${taxResult.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Date Difference Calculator */}
      {tool.id === 'date-difference-calculator' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
          </div>

          {dateDiffResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {dateDiffResult.totalDays}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Calendar Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {dateDiffResult.weeks} w, {dateDiffResult.remDays} d
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Weeks & Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {dateDiffResult.businessDays}
                </span>
                <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                  Business Days
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200">
                  {(dateDiffResult.totalDays * 24).toLocaleString()}
                </span>
                <span className="block text-xs font-semibold text-zinc-500 mt-1">Total Hours</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Random Number Generator */}
      {tool.id === 'random-number-generator' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Minimum:
              </label>
              <input
                type="number"
                value={rngMin}
                onChange={(e) => setRngMin(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Maximum:
              </label>
              <input
                type="number"
                value={rngMax}
                onChange={(e) => setRngMax(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Count:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={rngCount}
                onChange={(e) => setRngCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={rngUnique}
                  onChange={(e) => setRngUnique(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Unique Numbers</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateRandomNumbers}
              className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" />
              <span>Generate Random Numbers</span>
            </button>
            <button
              onClick={() => {
                setRngMin(1);
                setRngMax(6);
                setRngCount(2);
                setRngUnique(false);
              }}
              className="px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Roll 2 Dice (2d6)
            </button>
          </div>

          {rngResults.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Generated Random Set
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {rngResults.map((num, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md animate-in zoom-in-50"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
