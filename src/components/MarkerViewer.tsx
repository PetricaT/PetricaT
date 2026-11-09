import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import { createMarker, parseColoredText, parseMarkers, plainText, serializeMarkers, type Marker, type MarkerSet } from "../engines/m0rmarkers";
import { chooseBestMapForMarker, projectMarkerToMap } from "../engines/esoMapProjection";
import type { MarkerCardData } from "../generated/markers-db";
import { trialMaps, type TrialMap } from "../generated/marker-map-assets";
import { m0rTextureOptions, resolveM0rTexture } from "./markerMapAssets";
import "../css/marker-viewer.css";

type MarkerViewerProps = {
  markerSet: MarkerCardData;
  onBack: () => void;
};

type PositionedMarker = {
  marker: Marker;
  index: number;
  left: number;
  top: number;
};

type Viewport = {
  zoom: number;
  x: number;
  y: number;
};

type DragStart = {
  pointerId: number;
  clientX: number;
  clientY: number;
  x: number;
  y: number;
  markerIndex: number | null;
};

type CoordinateAxis = "x" | "y" | "z";

type CoordinateScrub = {
  pointerId: number;
  markerIndex: number;
  axis: CoordinateAxis;
  clientX: number;
  value: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
function updateMarkerOrigin(markerSet: MarkerSet, markers: Marker[]): MarkerSet {
  if (markers.length === 0) return { ...markerSet, markers };

  return {
    ...markerSet,
    markers,
    ref: [
      Math.min(...markers.map((marker) => marker.x)),
      Math.min(...markers.map((marker) => marker.y)),
      Math.min(...markers.map((marker) => marker.z)),
    ],
  };
}

function projectMarkers(
  markers: Array<{ marker: Marker; index: number }>,
  map: TrialMap,
): PositionedMarker[] {
  return markers.map(({ marker, index }) => ({
    marker,
    index,
    ...projectMarkerToMap(marker, map),
  }));
}

export const MarkerViewer = ({ markerSet, onBack }: MarkerViewerProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<DragStart | null>(null);
  const coordinateScrub = useRef<CoordinateScrub | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isScrubbingCoordinate, setIsScrubbingCoordinate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "copied" | "error">("idle");
  const [textColorChoice, setTextColorChoice] = useState("#ffffff");
  const [parsedSet, setParsedSet] = useState(() => parseMarkers(markerSet.markers));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const maps = trialMaps
    .filter((map) => map.zoneId === Number(parsedSet.id))
    .sort((left, right) => left.mapId - right.mapId);
  const assignments = parsedSet.markers.map((marker, index) => ({
    marker,
    index,
    map: chooseBestMapForMarker(marker, maps),
  }));
  const mapCounts = new Map<number, number>();
  for (const assignment of assignments) {
    if (assignment.map) {
      mapCounts.set(assignment.map.mapId, (mapCounts.get(assignment.map.mapId) ?? 0) + 1);
    }
  }
  const defaultMap = [...maps].sort((left, right) =>
    (mapCounts.get(right.mapId) ?? 0) - (mapCounts.get(left.mapId) ?? 0) || left.mapId - right.mapId,
  )[0] ?? null;
  const map = maps.find((entry) => entry.mapId === selectedMapId) ?? defaultMap;
  const activeAssignments = map
    ? assignments.filter((assignment) => assignment.map?.mapId === map.mapId)
    : [];
  const unmappedCount = assignments.filter((assignment) => assignment.map === null).length;
  const activeSelectedIndex = activeAssignments.some((assignment) => assignment.index === selectedIndex)
    ? selectedIndex
    : activeAssignments[0]?.index ?? null;
  const selectedMarker = activeSelectedIndex === null ? null : parsedSet.markers[activeSelectedIndex] ?? null;
  const mapSize = 100 / 30;
  const positions = map ? projectMarkers(activeAssignments, map) : [];

  const updateMarker = (index: number, updates: Partial<Marker>) => {
    setExportStatus("idle");
    setParsedSet((current) => updateMarkerOrigin(
      current,
      current.markers.map((marker, markerIndex) =>
        markerIndex === index ? { ...marker, ...updates } : marker,
      ),
    ));
  };

  const coordinateRange = (axis: CoordinateAxis, value: number): [number, number] => {
    const min = axis === "x" ? map?.worldBounds[0] ?? 0 : axis === "z" ? map?.worldBounds[2] ?? 0 : 0;
    const max = axis === "x" ? map?.worldBounds[1] ?? 200000 : axis === "z" ? map?.worldBounds[3] ?? 200000 : 200000;
    return [Math.min(min, value), Math.max(max, value)];
  };

  const updateCoordinate = (index: number, axis: CoordinateAxis, value: number) => {
    const marker = parsedSet.markers[index];
    if (!marker) return;
    const [min, max] = coordinateRange(axis, marker[axis]);
    const nextValue = Math.max(min, Math.min(max, Math.round(value)));
    if (axis === "x") updateMarker(index, { x: nextValue });
    else if (axis === "y") updateMarker(index, { y: nextValue });
    else updateMarker(index, { z: nextValue });
  };

  const startCoordinateScrub = (
    event: PointerEvent<HTMLButtonElement>,
    axis: CoordinateAxis,
    markerIndex: number,
    value: number,
  ) => {
    if (!isEditing || event.button !== 0) return;
    event.preventDefault();
    coordinateScrub.current = { pointerId: event.pointerId, markerIndex, axis, clientX: event.clientX, value };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsScrubbingCoordinate(true);
  };

  const moveCoordinateScrub = (event: PointerEvent<HTMLButtonElement>) => {
    const scrub = coordinateScrub.current;
    if (!scrub || scrub.pointerId !== event.pointerId) return;
    const unitsPerPixel = event.shiftKey ? 1 : 25;
    updateCoordinate(scrub.markerIndex, scrub.axis, scrub.value + (event.clientX - scrub.clientX) * unitsPerPixel);
  };

  const finishCoordinateScrub = (event: PointerEvent<HTMLButtonElement>) => {
    if (coordinateScrub.current?.pointerId !== event.pointerId) return;
    coordinateScrub.current = null;
    setIsScrubbingCoordinate(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCoordinateKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    axis: CoordinateAxis,
    markerIndex: number,
    value: number,
  ) => {
    if (!isEditing || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : 25;
    updateCoordinate(markerIndex, axis, value + (event.key === "ArrowRight" ? step : -step));
  };

  useEffect(() => {
    const colorCode = selectedMarker?.content.match(/\|c([0-9a-f]{6})/i)?.[1];
    setTextColorChoice(colorCode ? `#${colorCode}` : "#ffffff");
  }, [activeSelectedIndex, map?.mapId]);

  const handleTextColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTextColorChoice(event.currentTarget.value);
  };

  const applyTextColor = () => {
    if (activeSelectedIndex === null || !selectedMarker) return;
    const textarea = textEditorRef.current;
    const start = textarea?.selectionStart ?? selectedMarker.content.length;
    const end = textarea?.selectionEnd ?? start;
    const selection = selectedMarker.content.slice(start, end);
    const colorStart = `|c${textColorChoice.slice(1).toUpperCase()}`;
    const replacement = selection ? `${colorStart}${selection}|r` : `${colorStart}|r`;
    const content = selectedMarker.content.slice(0, start) + replacement + selectedMarker.content.slice(end);
    updateMarker(activeSelectedIndex, { content });

    const caret = start + colorStart.length + (selection ? selection.length + 2 : 0);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(caret, caret);
    });
  };

  const constrainPan = (x: number, y: number, zoom: number) => {
    const map = mapRef.current;
    const stage = stageRef.current;
    if (!map || !stage) return { x, y };

    const maxX = Math.max(0, (map.offsetWidth * zoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (map.offsetHeight * zoom - stage.clientHeight) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const zoomBy = (factor: number) => {
    setViewport((current) => {
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current.zoom * factor));
      return { ...constrainPan(current.x, current.y, zoom), zoom };
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const markerElement = (event.target as HTMLElement).closest<HTMLElement>("[data-marker-index]");
    if (markerElement) {
      if (!isEditing) return;
      const markerIndex = Number(markerElement.dataset.markerIndex);
      if (!Number.isInteger(markerIndex) || !parsedSet.markers[markerIndex]) return;

      event.preventDefault();
      dragStart.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x: viewport.x,
        y: viewport.y,
        markerIndex,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setSelectedIndex(markerIndex);
      setIsDragging(true);
      return;
    }

    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    dragStart.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: viewport.x,
      y: viewport.y,
      markerIndex: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    if (start.markerIndex !== null && mapRef.current && map) {
      const bounds = mapRef.current.getBoundingClientRect();
      const [minX, maxX, minZ, maxZ] = map.worldBounds;
      const xRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const zRatio = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      updateMarker(start.markerIndex, {
        x: Math.round(minX + xRatio * (maxX - minX)),
        z: Math.round(minZ + zRatio * (maxZ - minZ)),
      });
      return;
    }

    setViewport((current) => ({
      ...current,
      ...constrainPan(
        start.x + event.clientX - start.clientX,
        start.y + event.clientY - start.clientY,
        current.zoom,
      ),
    }));
  };

  const finishPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId !== event.pointerId) return;
    dragStart.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resetViewport = () => setViewport({ zoom: 1, x: 0, y: 0 });

  const handleMapChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMapId(Number(event.currentTarget.value));
    setSelectedIndex(null);
    resetViewport();
  };

  const handleMapContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isEditing || !map || (event.target as HTMLElement).closest("button")) return;
    event.preventDefault();

    const bounds = mapRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const [minX, maxX, minZ, maxZ] = map.worldBounds;
    const xRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const zRatio = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const marker = createMarker({
      x: Math.round(minX + xRatio * (maxX - minX)),
      y: map.y ?? selectedMarker?.y ?? parsedSet.ref[1],
      z: Math.round(minZ + zRatio * (maxZ - minZ)),
      c: "^1",
      color: "ffffff",
    });
    const index = parsedSet.markers.length;
    setParsedSet((current) => updateMarkerOrigin(current, [...current.markers, marker]));
    setExportStatus("idle");
    setSelectedIndex(index);
  };

  const exportMarkers = async () => {
    try {
      await navigator.clipboard.writeText(serializeMarkers(parsedSet));
      setExportStatus("copied");
    } catch {
      setExportStatus("error");
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = mapRef.current?.getBoundingClientRect();
      if (!bounds) return;

      setViewport((current) => {
        const zoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, current.zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15)),
        );
        const ratio = zoom / current.zoom;
        const anchorX = event.clientX - (bounds.left + bounds.width / 2);
        const anchorY = event.clientY - (bounds.top + bounds.height / 2);
        const limited = constrainPan(
          current.x + anchorX * (1 - ratio),
          current.y + anchorY * (1 - ratio),
          zoom,
        );
        return { ...limited, zoom };
      });
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <section className="marker-viewer frame" aria-label={`${markerSet.name} marker preview`}>
      <header className="marker-viewer__header">
        <button type="button" className="marker-viewer__back" onClick={onBack}>
          <span aria-hidden="true">&lt;</span> Markers DB
        </button>
        <div className="marker-viewer__heading">
          <span className="marker-viewer__eyebrow">{markerSet.zone}</span>
          <h1>{markerSet.name}</h1>
        </div>
        <div className="marker-viewer__modes" role="group" aria-label="Viewer mode">
          <button
            type="button"
            className={!isEditing ? "is-active" : ""}
            aria-pressed={!isEditing}
            onClick={() => setIsEditing(false)}
          >
            Preview
          </button>
          <button
            type="button"
            className={isEditing ? "is-active" : ""}
            aria-pressed={isEditing}
            title="Right-click the map to add a marker"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
      </header>

      <div className="marker-viewer__body">
        <div
          ref={stageRef}
          className={`marker-viewer__stage${isDragging ? " is-dragging" : ""}${isEditing ? " is-editing" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onContextMenu={handleMapContextMenu}
        >
          {map ? (
            <div
              ref={mapRef}
              className="marker-viewer__map"
              role="group"
              aria-label={`${markerSet.zone} map`}
              style={{ transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})` }}
            >
              <div
                className="marker-viewer__tiles"
                style={{
                  gridTemplateColumns: `repeat(${map.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${map.columns}, minmax(0, 1fr))`,
                }}
                aria-hidden="true"
              >
                {map.tiles.map((tile, index) => (
                  <img key={index} src={tile} alt="" draggable={false} />
                ))}
              </div>
              {positions.map(({ marker, index, left, top }) => {
                const texture = resolveM0rTexture(marker.c);
                const size = mapSize * (1 + (Number(marker.a) || 1) / 8) / viewport.zoom;
                return (
                  <button
                    type="button"
                    key={index}
                    data-marker-index={index}
                    className={`marker-viewer__marker${activeSelectedIndex === index ? " is-selected" : ""}`}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${size}%`,
                      height: `${size}%`,
                      color: marker.color ? `#${marker.color}` : "#ffffff",
                      fontSize: `${12 / viewport.zoom}px`,
                    }}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Marker ${index + 1}: ${plainText(marker.content).trim() || "No label"}`}
                    aria-pressed={activeSelectedIndex === index}
                    title={plainText(marker.content).trim() || `Marker ${index + 1}`}
                  >
                    <span
                      className="marker-viewer__marker-icon"
                      style={{
                        backgroundColor: "currentColor",
                        maskImage: `url("${texture}")`,
                        WebkitMaskImage: `url("${texture}")`,
                      }}
                    />
                    <span className="marker-viewer__marker-label">
                      {parseColoredText(marker.content).map((segment, segmentIndex) => (
                        <span key={segmentIndex} style={{ color: segment.color ? `#${segment.color}` : undefined }}>
                          {segment.text}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="marker-viewer__unavailable">
              <strong>Map unavailable</strong>
              <span>No calibrated map is registered for {markerSet.zone}.</span>
            </div>
          )}
          {map && (
            <div className="marker-viewer__zoom-controls" role="group" aria-label="Map zoom controls">
              <button type="button" onClick={() => zoomBy(1 / 1.25)} disabled={viewport.zoom <= MIN_ZOOM} aria-label="Zoom out">-</button>
              <output>{Math.round(viewport.zoom * 100)}%</output>
              <button type="button" onClick={() => zoomBy(1.25)} disabled={viewport.zoom >= MAX_ZOOM} aria-label="Zoom in">+</button>
              <button type="button" onClick={resetViewport} disabled={viewport.zoom === 1 && viewport.x === 0 && viewport.y === 0}>Reset</button>
            </div>
          )}
        </div>

        <aside className="marker-viewer__inspector" aria-label="Marker details">
          <div className="marker-viewer__summary">
            <span className="marker-viewer__eyebrow">PREVIEW</span>
            {map && <h2 className="marker-viewer__map-name">{map.name}</h2>}
            {maps.length > 1 && (
              <label className="marker-viewer__map-select">
                <span>Map area</span>
                <select value={map?.mapId ?? ""} onChange={handleMapChange}>
                  {maps.map((mapOption) => (
                    <option key={mapOption.mapId} value={mapOption.mapId}>
                      {mapOption.name} ({mapCounts.get(mapOption.mapId) ?? 0})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="marker-viewer__stat">
              <span>Markers on map</span>
              <strong>{activeAssignments.length}</strong>
            </div>
            <span className="marker-viewer__date">{parsedSet.markers.length} total</span>
            <span className="marker-viewer__date">Updated {markerSet.date}</span>
            {unmappedCount > 0 && (
              <span className="marker-viewer__warning">
                {unmappedCount} marker{unmappedCount === 1 ? "" : "s"} fall outside calibrated maps.
              </span>
            )}
          </div>

          <section className="marker-viewer__selection" aria-live="polite">
            <h2>{selectedMarker && activeSelectedIndex !== null ? `Marker ${activeSelectedIndex + 1}` : "No marker selected"}</h2>
            {selectedMarker && activeSelectedIndex !== null && (
              <>
                <p className="marker-viewer__content">{plainText(selectedMarker.content) || "No label"}</p>
                <dl className="marker-viewer__coordinates">
                  {(["x", "y", "z"] as const).map((axis) => {
                    const value = selectedMarker[axis];
                    const [min, max] = coordinateRange(axis, value);
                    return (
                      <div key={axis}>
                        <dt>{axis.toUpperCase()}</dt>
                        <dd>
                          {isEditing ? (
                            <button
                              type="button"
                              className={`marker-viewer__coordinate-value${isScrubbingCoordinate ? " is-scrubbing" : ""}`}
                              role="slider"
                              aria-label={`${axis.toUpperCase()} coordinate`}
                              aria-valuemin={min}
                              aria-valuemax={max}
                              aria-valuenow={value}
                              title="Drag left or right to adjust; hold Shift for fine adjustment"
                              onPointerDown={(event) => startCoordinateScrub(event, axis, activeSelectedIndex!, value)}
                              onPointerMove={moveCoordinateScrub}
                              onPointerUp={finishCoordinateScrub}
                              onPointerCancel={finishCoordinateScrub}
                              onKeyDown={(event) => handleCoordinateKeyDown(event, axis, activeSelectedIndex!, value)}
                            >
                              {value.toString()}
                            </button>
                          ) : value.toString()}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {isEditing && (
                  <div className="marker-viewer__edit-controls">
                    <h3>Marker</h3>
                    <label className="marker-viewer__edit-field">
                      <span>Icon</span>
                      <select
                        value={m0rTextureOptions.some((option) => option.value === selectedMarker.c) ? selectedMarker.c! : "^7"}
                        onChange={(event) => updateMarker(activeSelectedIndex!, { c: event.currentTarget.value })}
                      >
                        {m0rTextureOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="marker-viewer__edit-field">
                      <span>Icon color</span>
                      <input
                        type="color"
                        value={/^([0-9a-f]{6})$/i.test(selectedMarker.color ?? "") ? `#${selectedMarker.color}` : "#ffffff"}
                        onChange={(event) => updateMarker(activeSelectedIndex!, { color: event.currentTarget.value.slice(1) })}
                        aria-label="Marker icon color"
                      />
                    </label>

                    <h3>Text</h3>
                    <div className="marker-viewer__text-editor-wrap">
                      <textarea
                        ref={textEditorRef}
                        value={selectedMarker.content}
                        onChange={(event) => {
                          const content = event.currentTarget.value;
                          updateMarker(activeSelectedIndex!, { content });
                          const colorCode = content.match(/\|c([0-9a-f]{6})/i)?.[1];
                          if (colorCode) setTextColorChoice(`#${colorCode}`);
                        }}
                        aria-label="Marker text"
                      />
                      <span className="marker-viewer__text-color-swatch" style={{ backgroundColor: textColorChoice }} />
                    </div>
                    <div className="marker-viewer__text-color-tools">
                      <label className="marker-viewer__edit-field">
                        <span>Text color</span>
                        <input
                          type="color"
                          value={textColorChoice}
                          onChange={handleTextColorChange}
                          aria-label="Choose text color"
                        />
                      </label>
                      <button type="button" className="marker-viewer__apply-color" onClick={applyTextColor}>
                        Apply to selection
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          <div className="marker-viewer__export-footer">
            <span className="marker-viewer__export-status" role="status" aria-live="polite">
              {exportStatus === "copied" ? "Marker data copied to clipboard." :
                exportStatus === "error" ? "Clipboard access failed. Check browser permissions." : ""}
            </span>
            <button type="button" className="marker-viewer__export-button" onClick={exportMarkers}>
              {exportStatus === "copied" ? "Copied" : "Export markers"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};