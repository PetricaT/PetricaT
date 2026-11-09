import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseMarkers } from "../engines/m0rmarkers";

type MarkerSetFile = {
	"$schema": string;
	name: string;
	zone: string;
	version: string;
	date: string;
	markers: string;
};

type MarkerCardData = MarkerSetFile & {
	id: string;
};

const markerDirectory = resolve(import.meta.dir, "../../assets/games/eso/markers");
const mapDirectory = resolve(import.meta.dir, "../../assets/games/eso/maps");
const generatedDirectory = resolve(import.meta.dir, "../generated");
const outputPath = resolve(generatedDirectory, "markers-db.ts");
const mapOutputPath = resolve(generatedDirectory, "marker-map-assets.ts");

function isMarkerSetFile(value: unknown): value is MarkerSetFile {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

	const record = value as Record<string, unknown>;
	return (
		typeof record["$schema"] === "string" &&
		typeof record.name === "string" && record.name.length > 0 &&
		typeof record.zone === "string" && record.zone.length > 0 &&
		typeof record.version === "string" && record.version.length > 0 &&
		typeof record.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
		typeof record.markers === "string" && record.markers.startsWith("<") && record.markers.endsWith(">")
	);
}

const filenames = (await readdir(markerDirectory))
	.filter((filename) => filename.endsWith(".json"))
	.sort((left, right) => left.localeCompare(right));

const cards: MarkerCardData[] = [];

for (const filename of filenames) {
	const filePath = resolve(markerDirectory, filename);
	const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));

	if (!isMarkerSetFile(parsed)) {
		throw new Error(`Invalid marker set metadata in ${filename}`);
	}

	try {
		parseMarkers(parsed.markers);
	} catch (error) {
		throw new Error(`Invalid marker payload in ${filename}: ${String(error)}`);
	}

	cards.push({
		id: filename.slice(0, -".json".length),
		...parsed,
	});
}

await mkdir(generatedDirectory, { recursive: true });
const generatedSource = `export type MarkerSetData = {
	"$schema": string;
	name: string;
	zone: string;
	version: string;
	date: string;
	markers: string;
};

export type MarkerCardData = MarkerSetData & {
	id: string;
};

export const markerSets: MarkerCardData[] = ${JSON.stringify(cards, null, 2)};
`;
await writeFile(outputPath, generatedSource);

type TrialMapMetadata = {
	folder: string;
	name: string;
	mapId: number;
	zoneId: number;
	slug: string;
	columns: number;
	worldBounds: [number, number, number, number];
	y?: number;
};

const metadataPath = resolve(mapDirectory, "map_metadata.json");
const metadata: { maps: TrialMapMetadata[] } = JSON.parse(await readFile(metadataPath, "utf8"));
const mapImports: string[] = [];
const mapEntries: Array<Record<string, unknown>> = [];
let tileImportId = 0;

for (const map of metadata.maps) {
	const expectedTileCount = map.columns ** 2;
	const tiles: string[] = [];

	for (let index = 0; index < expectedTileCount; index++) {
		const filename = `${map.slug}${index}.png`;
		const tilePath = resolve(mapDirectory, map.folder, filename);
		if (!(await Bun.file(tilePath).exists())) {
			throw new Error(`Missing tile ${map.folder}/${filename} for ${map.name}`);
		}

		const importName = `mapTile${tileImportId++}`;
		mapImports.push(`import ${importName} from "../../assets/games/eso/maps/${map.folder}/${filename}";`);
		tiles.push(importName);
	}

	mapEntries.push({ ...map, tiles });
}

const registeredMapSlugs = new Set(metadata.maps.map((map) => `${map.folder}/${map.slug}`));
const uncalibratedMapSlugs: string[] = [];
for (const entry of await readdir(mapDirectory, { withFileTypes: true })) {
	if (!entry.isDirectory() || entry.name === "cyrodiil") continue;
	for (const filename of await readdir(resolve(mapDirectory, entry.name))) {
		const match = /^(.*_)\d+\.png$/i.exec(filename);
		if (match && !registeredMapSlugs.has(`${entry.name}/${match[1]}`)) {
			uncalibratedMapSlugs.push(`${entry.name}/${match[1]}`);
		}
	}
}

const mapDataSource = JSON.stringify(mapEntries, null, 2).replace(/"(mapTile\d+)"/g, "$1");
const mapModule = `${mapImports.join("\n")}\n
export type TrialMap = {
	folder: string;
	name: string;
	mapId: number;
	zoneId: number;
	slug: string;
	columns: number;
	worldBounds: [number, number, number, number];
	y?: number;
	tiles: string[];
};

export const trialMaps: TrialMap[] = ${mapDataSource};
`;
await writeFile(mapOutputPath, mapModule);

console.log(`Generated ${cards.length} marker set(s) at ${outputPath}`);
console.log(`Generated ${metadata.maps.length} calibrated trial map(s) with ${tileImportId} tiles at ${mapOutputPath}`);
if (uncalibratedMapSlugs.length > 0) {
	console.warn(`Skipping map tiles without reference calibration: ${[...new Set(uncalibratedMapSlugs)].join(", ")}`);
}
