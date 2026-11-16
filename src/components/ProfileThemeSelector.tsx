import { useState } from 'react';
import {
  UiTheme,
  applyTheme,
  getSavedTheme,
} from '../utils/themeManager';
import { Palette, CheckCircle2 } from 'lucide-react';

interface ThemeOption {
  id: UiTheme;
  name: string;
  tag: string;
  description: string;
  swatchClasses: [string, string, string];
  swatchLabels: string[];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'editorial-cream',
    name: 'Editorial Cream (Default)',
    tag: 'LIGHT EDITORIAL',
    description: 'Warm Cream paper, crisp Ink Black borders, and Burnt Orange accents.',
    swatchClasses: [
      'theme-swatch-cream-bg',
      'theme-swatch-cream-ink',
      'theme-swatch-cream-accent',
    ],
    swatchLabels: ['#F3EEE3', '#111111', '#D9541E'],
  },
  {
    id: 'jet-cherry',
    name: 'Jet Black & Cherry',
    tag: 'DARK EDITORIAL',
    description: 'Jet Black canvas, Smoke Grey structural borders, and Cherry Red accents.',
    swatchClasses: [
      'theme-swatch-jet-bg',
      'theme-swatch-jet-smoke',
      'theme-swatch-jet-accent',
    ],
    swatchLabels: ['#0B0B0C', '#8A8D93', '#C8102E'],
  },
];

export default function ProfileThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<UiTheme>(() =>
    getSavedTheme()
  );

  const handleSelectTheme = (theme: UiTheme) => {
    setSelectedTheme(theme);
    applyTheme(theme);
  };

  return (
    <section
      className="editorial-card p-6 flex flex-col gap-5"
      id="profile-theme-selector"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#D9541E]" />
            <h3 className="text-lg font-extrabold text-[#111111] tracking-tight">
              Appearance &amp; Color Theme
            </h3>
          </div>
          <p className="text-xs text-[#524E48] mt-1">
            Choose your workspace palette. Defaults to Editorial Cream.
          </p>
        </div>

        <span className="font-mono text-[11px] font-bold px-3 py-1 rounded border-2 border-[#111111] bg-[#E6DFD1] text-[#111111] self-start sm:self-center">
          {selectedTheme === 'editorial-cream'
            ? 'Editorial Cream'
            : 'Jet Black & Cherry'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEME_OPTIONS.map((option) => {
          const isActive = selectedTheme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectTheme(option.id)}
              aria-pressed={isActive}
              className={`p-5 rounded-xl border-2 border-[#111111] text-left flex flex-col justify-between gap-4 cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#F3EEE3] shadow-[4px_4px_0px_#111111] ring-2 ring-[#D9541E] ring-offset-2'
                  : 'bg-[#FAF7F0] hover:bg-[#E6DFD1]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#524E48]">
                    {option.tag}
                  </span>
                  <h4 className="text-base font-extrabold text-[#111111] mt-0.5">
                    {option.name}
                  </h4>
                </div>

                {isActive && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#D9541E] text-[#FAF7F0] border border-[#111111] font-mono text-[10px] font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-[#524E48] leading-relaxed">
                {option.description}
              </p>

              {/* Color Swatches */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#111111]/20">
                <div className="flex items-center gap-2">
                  {option.swatchClasses.map((swatchClass, idx) => (
                    <span
                      key={swatchClass}
                      title={option.swatchLabels[idx]}
                      className={`w-6 h-6 rounded-full border-2 border-[#111111] shrink-0 ${swatchClass}`}
                    />
                  ))}
                </div>

                <span className="font-mono text-[10px] font-bold text-[#524E48] tabular-nums">
                  {option.swatchLabels.join(' · ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
