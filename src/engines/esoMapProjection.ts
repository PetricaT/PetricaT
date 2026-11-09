import type { Marker } from "./m0rmarkers";
import type { TrialMap } from "../generated/marker-map-assets";

export function chooseBestMapForMarker(
	marker: Pick<Marker, "x" | "y" | "z">,
	maps: readonly TrialMap[],
): TrialMap | null {
	const matchingMaps = maps.filter((map) => {
		const [minX, maxX, minZ, maxZ] = map.worldBounds;
		return marker.x >= minX && marker.x <= maxX && marker.z >= minZ && marker.z <= maxZ;
	});

	return matchingMaps.sort((left, right) => {
		const leftHasHeight = left.y === undefined ? 1 : 0;
		const rightHasHeight = right.y === undefined ? 1 : 0;
		if (leftHasHeight !== rightHasHeight) return leftHasHeight - rightHasHeight;

		const leftHeightDelta = left.y === undefined ? Infinity : Math.abs(marker.y - left.y);
		const rightHeightDelta = right.y === undefined ? Infinity : Math.abs(marker.y - right.y);
		if (leftHeightDelta !== rightHeightDelta) return leftHeightDelta - rightHeightDelta;

		const leftArea = (left.worldBounds[1] - left.worldBounds[0]) * (left.worldBounds[3] - left.worldBounds[2]);
		const rightArea = (right.worldBounds[1] - right.worldBounds[0]) * (right.worldBounds[3] - right.worldBounds[2]);
		return leftArea - rightArea;
	})[0] ?? null;
}

export function projectMarkerToMap(
	marker: Pick<Marker, "x" | "z">,
	map: TrialMap,
): { left: number; top: number } {
	const [minX, maxX, minZ, maxZ] = map.worldBounds;
	return {
		left: ((marker.x - minX) / (maxX - minX)) * 100,
		top: ((marker.z - minZ) / (maxZ - minZ)) * 100,
	};
}