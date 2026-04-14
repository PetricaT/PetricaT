import React from "react";
import "../../css/section.css";

type FencedSectionProps = {
  icon?: string;           // emoji / image url
  title: string;
  color: string;           // CSS color
  textColor?: string;       // CSS color
  children?: React.ReactNode;
};
const getContrastColor = (color: string): string => {
  const luminance = getLuminanceFromColor(color);
  return luminance < 0.5 ? "#fff" : "#000";
};

const getLuminanceFromColor = (color: string): number => {
  const rgb = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)?.slice(1).map(c => parseInt(c, 16));
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

export const Section = ({ icon, title, color, textColor, children }: FencedSectionProps) => {
  const knownImageFormats = /\.(png|svg|gif|jpg|jpeg|bmp|webp)$/i;
  const iconElement = knownImageFormats.test(icon) ? (
    <img src={icon} alt={title} className="fenced-tab-icon" style={{ width: "1em", height: "1em" }} />
  ) : (
    <span className="fenced-tab-icon">{icon}</span>
  );

  return (
    <div
      className="fenced-section"
      style={{
        borderColor: color,
        backgroundColor: colorWithAlpha(color, 0.08),
      }}
    >
      <div className="fenced-tab" style={{ 
        backgroundColor: color,
        color:  textColor || getContrastColor(color),
        }}>
        {iconElement}
        <span className="fenced-tab-title">{title}</span>
      </div>

      <div className="fenced-content">
        {children}
      </div>
    </div>
  );
};

/**
 * Converts any CSS color string + alpha into rgba().
 * Handles hex (#rgb, #rrggbb) and passes rgb/rgba/named colors through a canvas trick.
 */
function colorWithAlpha(color: string, alpha: number): string {
  // Hex shorthand: #abc -> #aabbcc
  const hex3 = /^#([a-f\d])([a-f\d])([a-f\d])$/i;
  const hex6 = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

  let r: number, g: number, b: number;

  const m3 = color.match(hex3);
  if (m3) {
    r = parseInt(m3[1] + m3[1], 16);
    g = parseInt(m3[2] + m3[2], 16);
    b = parseInt(m3[3] + m3[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  const m6 = color.match(hex6);
  if (m6) {
    r = parseInt(m6[1], 16);
    g = parseInt(m6[2], 16);
    b = parseInt(m6[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}
