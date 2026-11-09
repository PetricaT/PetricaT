/**
 * M0RMarkers engine: parse, edit and serialize M0RMarkers share strings.
 * Pure TypeScript, no DOM, no dependencies, safe to use from Bun or the browser.
 *
 * Wire format: `<` + 8 sections separated by `]` + markers + `>`
 *
 *   0  id         "1565"                 ESO zone id
 *   1  timestamp  "1778439410"           unix seconds
 *   2  ref        "96ad:88dd:8887"       minimum world x:y:z for the marker set
 *   3  groupA     "3:16,17;2:1,2,3"      marker size:marker indices
 *   4  groupB     "0:16,17,18,19"        pitch degrees:marker indices
 *   5  rotation   "225:19;45:16"         yaw degrees:marker indices
 *   6  color      "ad3cd6:6,19;ff8000:7" rrggbb:marker indices
 *   7  groupC     "^5:4,5,6;^1:1,2,3"    texture:marker indices
 *   8  markers    "x:y:z:content,..."    hex offsets from ref x:y:z, then marker content
 *
 * "content" is either text using ESO colour codes (|cRRGGBB...|r) or a short
 * texture code such as "f", "s1", "s2". It is stored raw so nothing is lost.
 *
 * Coordinates returned by parseMarkers are absolute world coordinates. The
 * encoded marker coordinates are offsets from ref, as in the addon importer.
 * Group keys are retained raw so serializeMarkers can preserve the source.
 */

export interface Marker {
  x: number;
  y: number;
  z: number;
  /** Raw content: colour-coded text or a texture code. Not trimmed or altered. */
  content: string;
  /** Hex colour "rrggbb" as written in the string, or null if none. */
  color: string | null;
  /** Rotation in degrees, or null if none. */
  rotation: number | null;
  /** Unconfirmed attribute groups (raw keys). */
  a: string | null;
  b: string | null;
  c: string | null;
}

export interface MarkerSet {
  id: string;
  timestamp: number;
  ref: [number, number, number];
  markers: Marker[];
  /** Original key order per section, so serialize() reproduces the source. */
  layout: SectionLayout;
}

type GroupSection = "a" | "b" | "rotation" | "color" | "c";
type SectionLayout = Record<GroupSection, string[]>;

const SECTION_INDEX: Record<GroupSection, number> = {
  a: 3,
  b: 4,
  rotation: 5,
  color: 6,
  c: 7,
};

const MARKER_SPLIT = /,(?=-?[0-9a-f]+:-?[0-9a-f]+:-?[0-9a-f]+:)/i;
const MARKER_RE = /^(-?[0-9a-f]+):(-?[0-9a-f]+):(-?[0-9a-f]+):([\s\S]*)$/i;
const hex = (s: string) => parseInt(s, 16);
const markerTextEscapes: Record<string, string> = {
  "\uE000": ":",
  "\uE001": ",",
  "\uE002": "]",
  "\uE003": ";",
  "\uE004": ">",
};

function unescapeMarkerText(text: string): string {
  return text.replace(/[\uE000-\uE004]/g, (escape) => markerTextEscapes[escape] ?? escape)
    .replace(/\\+n/g, "\n");
}

function escapeMarkerText(text: string): string {
  return text
    .replace(/:/g, "\uE000")
    .replace(/,/g, "\uE001")
    .replace(/\]/g, "\uE002")
    .replace(/;/g, "\uE003")
    .replace(/>/g, "\uE004")
    .replace(/\r?\n/g, "\\n");
}

function parseGroups(section: string): Array<[string, number[]]> {
  if (section === "") return [];
  return section.split(";").map((entry) => {
    const i = entry.indexOf(":");
    if (i < 0) throw new Error(`Bad group entry "${entry}"`);
    const indices = entry
      .slice(i + 1)
      .split(",")
      .filter((s) => s !== "")
      .map(Number);
    return [entry.slice(0, i), indices];
  });
}

export function parseMarkers(input: string): MarkerSet {
  const s = input.trim();
  if (!s.startsWith("<") || !s.endsWith(">")) {
    throw new Error("Not an M0RMarkers string: missing < > wrapper");
  }
  const body = s.slice(1, -1);

  const parts: string[] = [];
  let pos = 0;
  for (let i = 0; i < 8; i++) {
    const j = body.indexOf("]", pos);
    if (j < 0) throw new Error(`Expected 8 header sections, found ${i}`);
    parts.push(body.slice(pos, j));
    pos = j + 1;
  }
  const markerStr = body.slice(pos);

  const refParts = parts[2]!.split(":").map(hex);
  if (refParts.length !== 3 || refParts.some(Number.isNaN)) {
    throw new Error(`Bad ref section "${parts[2]}"`);
  }

  const markers: Marker[] =
    markerStr === ""
      ? []
      : markerStr.split(MARKER_SPLIT).map((raw, n) => {
          const m = MARKER_RE.exec(raw);
          if (!m) throw new Error(`Bad marker #${n + 1}: "${raw}"`);
          return {
            x: hex(m[1]!) + refParts[0]!,
            y: hex(m[2]!) + refParts[1]!,
            z: hex(m[3]!) + refParts[2]!,
            content: unescapeMarkerText(m[4]!),
            color: null,
            rotation: null,
            a: null,
            b: null,
            c: null,
          };
        });

  const layout: SectionLayout = { a: [], b: [], rotation: [], color: [], c: [] };
  for (const section of Object.keys(SECTION_INDEX) as GroupSection[]) {
    for (const [key, indices] of parseGroups(parts[SECTION_INDEX[section]]!)) {
      layout[section].push(key);
      for (const idx of indices) {
        const marker = markers[idx - 1];
        if (!marker) {
          throw new Error(`Section ${section}: index ${idx} out of range (${markers.length} markers)`);
        }
        if (section === "rotation") marker.rotation = Number(key);
        else marker[section] = key;
      }
    }
  }

  return {
    id: parts[0]!,
    timestamp: Number(parts[1]),
    ref: [refParts[0]!, refParts[1]!, refParts[2]!],
    markers,
    layout,
  };
}

function serializeGroups(
  set: MarkerSet,
  section: GroupSection,
): string {
  const groups = new Map<string, number[]>();
  set.markers.forEach((m, i) => {
    const key = section === "rotation" ? (m.rotation === null ? null : String(m.rotation)) : m[section];
    if (key === null) return;
    const list = groups.get(key);
    if (list) list.push(i + 1);
    else groups.set(key, [i + 1]);
  });
  const ordered = [
    ...set.layout[section].filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !set.layout[section].includes(k)),
  ];
  return ordered.map((k) => `${k}:${groups.get(k)!.join(",")}`).join(";");
}

export function serializeMarkers(set: MarkerSet): string {
  const h = (n: number) => n.toString(16);
  const parts = [
    set.id,
    String(set.timestamp),
    set.ref.map(h).join(":"),
    serializeGroups(set, "a"),
    serializeGroups(set, "b"),
    serializeGroups(set, "rotation"),
    serializeGroups(set, "color"),
    serializeGroups(set, "c"),
  ];
  const markers = set.markers
    .map((m) => `${h(m.x - set.ref[0])}:${h(m.y - set.ref[1])}:${h(m.z - set.ref[2])}:${escapeMarkerText(m.content)}`)
    .join(",");
  return `<${parts.join("]")}]${markers}>`;
}

export function createMarker(partial: Partial<Marker> & Pick<Marker, "x" | "y" | "z">): Marker {
  return { content: "", color: null, rotation: null, a: null, b: null, c: null, ...partial };
}

// ---------- display helpers (for the website preview) ----------

export interface TextSegment {
  text: string;
  /** "rrggbb" or null for the default colour. */
  color: string | null;
}

/** Splits ESO colour-coded text (|cRRGGBB ... |r) into coloured segments. Literal "\n" becomes a newline. */
export function parseColoredText(content: string): TextSegment[] {
  const out: TextSegment[] = [];
  const re = /\|c([0-9a-fA-F]{6})|\|r/g;
  const clean = (t: string) => t.replace(/\\+n/g, "\n");
  let color: string | null = null;
  let last = 0;
  for (const m of content.matchAll(re)) {
    if (m.index > last) out.push({ text: clean(content.slice(last, m.index)), color });
    color = m[1] ? m[1].toLowerCase() : null;
    last = m.index + m[0].length;
  }
  if (last < content.length) out.push({ text: clean(content.slice(last)), color });
  return out;
}

export function plainText(content: string): string {
  return parseColoredText(content)
    .map((s) => s.text)
    .join("");
}
