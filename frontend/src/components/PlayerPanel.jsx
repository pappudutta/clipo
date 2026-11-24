import { Eye, Loader2, Scissors, TriangleAlert } from "lucide-react";
import RangeSlider from "./RangeSlider.jsx";
import TimeField from "./TimeField.jsx";
import PixelSelect from "./PixelSelect.jsx";
import { FORMATS } from "../lib/formats.js";

export default function PlayerPanel({
  containerRef,
  playerError,
  duration,
  start,
  end,
  onRange,
  onStartChange,
  onEndChange,
  onSetStartNow,
  onSetEndNow,
  getCurrentTime,
  format,
  onFormatChange,
  isAudio,
  quality,
  onQualityChange,
  qualityOptions,
  qualityLoading,
  onPreview,
  onSubmit,
  submitting,
  formError,
}) {
  const invalid = end <= start;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto">
      {/* Player: fills the free height, always 16:9, never causes page scroll */}
      <div
        className="flex min-h-[150px] flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div
          className="relative border-2 border-ink-500 bg-black shadow-pixel"
          style={{
            width: "min(100cqw, calc(100cqh * 16 / 9))",
            aspectRatio: "16 / 9",
          }}
        >
          <div ref={containerRef} className="yt-host absolute inset-0" />
          {playerError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-900/95 px-6 text-center text-arcade-yellow">
              <TriangleAlert size={28} />
              <p className="text-xl leading-tight">{playerError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 space-y-3 border-2 border-ink-500 bg-ink-800 p-3 shadow-pixel">
        <RangeSlider
          duration={duration}
          start={start}
          end={end}
          onChange={onRange}
          getCurrentTime={getCurrentTime}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TimeField
            label="Start"
            value={start}
            onChange={onStartChange}
            onSetNow={onSetStartNow}
            max={duration}
            invalid={invalid}
          />
          <TimeField
            label="End"
            value={end}
            onChange={onEndChange}
            onSetNow={onSetEndNow}
            max={duration}
            invalid={invalid}
          />
          <PixelSelect label="Format" value={format} onChange={onFormatChange}>
            {FORMATS.map(f => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </PixelSelect>
          <PixelSelect
            label="Quality"
            value={isAudio ? "best" : quality}
            onChange={onQualityChange}
            disabled={isAudio || qualityLoading}
          >
            {isAudio ? (
              <option value="best">Best audio</option>
            ) : (
              <>
                <option value="best">
                  Best{qualityOptions[0] ? ` (${qualityOptions[0]}p)` : ""}
                </option>
                {qualityOptions.map(h => (
                  <option key={h} value={String(h)}>
                    {h}p
                  </option>
                ))}
              </>
            )}
          </PixelSelect>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPreview}
            disabled={invalid}
            className="flex h-12 items-center justify-center gap-2 border-2 border-arcade-cyan px-4 font-pixel text-[10px] uppercase text-arcade-cyan shadow-pixel-sm transition hover:bg-arcade-cyan hover:text-ink-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex h-12 flex-1 items-center justify-center gap-2 border-2 border-black bg-arcade-yellow px-4 font-pixel text-[10px] uppercase text-ink-900 shadow-pixel-yellow transition hover:brightness-110 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Scissors size={16} />
            )}
            Save &amp; Compile
          </button>
        </div>

        {formError && (
          <p className="flex items-start gap-2 text-xl leading-tight text-arcade-pink">
            <TriangleAlert size={16} className="mt-1 shrink-0" /> {formError}
          </p>
        )}
      </div>
    </section>
  );
}
