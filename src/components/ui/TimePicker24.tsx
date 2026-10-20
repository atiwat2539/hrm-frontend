'use client';

import React from 'react';

interface TimePicker24Props {
  value?: string; // Format "HH:mm" e.g. "09:00", "14:30"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function TimePicker24({
  value = '09:00',
  onChange,
  className = '',
  disabled = false,
}: TimePicker24Props) {
  // Ensure valid "HH:mm" parsing
  const parts = (value || '09:00').split(':');
  const currentHour = parts[0] ? parts[0].padStart(2, '0') : '09';
  const currentMinute = parts[1] ? parts[1].padStart(2, '0') : '00';

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${currentMinute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${currentHour}:${newMinute}`);
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Hour Select (00 - 23) */}
      <select
        value={currentHour}
        onChange={(e) => handleHourChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
        aria-label="ชั่วโมง"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="text-gray-600 font-bold text-base select-none">:</span>

      {/* Minute Select (00 - 59) */}
      <select
        value={currentMinute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
        aria-label="นาที"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <span className="text-xs font-semibold text-gray-500 pl-0.5 select-none whitespace-nowrap">
        น.
      </span>
    </div>
  );
}
