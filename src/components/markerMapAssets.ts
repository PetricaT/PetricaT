import circle from "../../assets/games/eso/icons/m0r/circle.svg";
import hexagon from "../../assets/games/eso/icons/m0r/hexagon.svg";
import square from "../../assets/games/eso/icons/m0r/square.svg";
import diamond from "../../assets/games/eso/icons/m0r/diamond.svg";
import octagon from "../../assets/games/eso/icons/m0r/octagon.svg";
import chevron from "../../assets/games/eso/icons/m0r/chevron.svg";
import blank from "../../assets/games/eso/icons/m0r/blank.png";
import sharkpog from "../../assets/games/eso/icons/m0r/sharkpog.png";
import aldmeri from "../../assets/games/eso/icons/m0r/alliancebadge_aldmeri.png";
import ebonheart from "../../assets/games/eso/icons/m0r/alliancebadge_ebonheart.png";
import daggerfall from "../../assets/games/eso/icons/m0r/alliancebadge_daggerfall.png";
import dps from "../../assets/games/eso/icons/m0r/lfg_roleicon_dps.png";
import tank from "../../assets/games/eso/icons/m0r/lfg_roleicon_tank.png";
import healer from "../../assets/games/eso/icons/m0r/lfg_roleicon_healer.png";
import dragonknight from "../../assets/games/eso/icons/m0r/gp_class_dragonknight.png";
import sorcerer from "../../assets/games/eso/icons/m0r/gp_class_sorcerer.png";
import nightblade from "../../assets/games/eso/icons/m0r/gp_class_nightblade.png";
import warden from "../../assets/games/eso/icons/m0r/gp_class_warden.png";
import necromancer from "../../assets/games/eso/icons/m0r/gp_class_necromancer.png";
import templar from "../../assets/games/eso/icons/m0r/gp_class_templar.png";
import arcanist from "../../assets/games/eso/icons/m0r/gp_class_arcanist.png";
import unknown from "../../assets/games/eso/icons/m0r/unknown.png";

const m0rTextures = [
	circle, hexagon, square, diamond, octagon, chevron, blank, sharkpog,
	aldmeri, ebonheart, daggerfall, dps, tank, healer, dragonknight, sorcerer,
	nightblade, warden, necromancer, templar, arcanist,
];

const m0rTextureLabels = [
	"Circle", "Hexagon", "Square", "Diamond", "Octagon", "Chevron", "Blank", "Sharkpog",
	"Aldmeri Alliance", "Ebonheart Pact", "Daggerfall Covenant", "DPS", "Tank", "Healer",
	"Dragonknight", "Sorcerer", "Nightblade", "Warden", "Necromancer", "Templar", "Arcanist",
];

export const m0rTextureOptions = m0rTextures.map((src, index) => ({
	value: `^${index + 1}`,
	label: m0rTextureLabels[index]!,
	src,
}));

const textureNames: Record<string, string> = {
	circle,
	hexagon,
	square,
	diamond,
	octagon,
	chevron,
	blank,
	sharkpog,
	alliancebadge_aldmeri: aldmeri,
	alliancebadge_ebonheart: ebonheart,
	alliancebadge_daggerfall: daggerfall,
	lfg_roleicon_dps: dps,
	lfg_roleicon_tank: tank,
	lfg_roleicon_healer: healer,
	gp_class_dragonknight: dragonknight,
	gp_class_sorcerer: sorcerer,
	gp_class_nightblade: nightblade,
	gp_class_warden: warden,
	gp_class_necromancer: necromancer,
	gp_class_templar: templar,
	gp_class_arcanist: arcanist,
};

export function resolveM0rTexture(texture: string | null): string {
	if (!texture) return unknown;
	const indexedTexture = /^\^(\d+)$/.exec(texture);
	if (indexedTexture) return m0rTextures[Number(indexedTexture[1]) - 1] ?? unknown;

	const filename = texture.split(/[\\/]/).pop()?.replace(/\.dds$/i, "").toLowerCase();
	return (filename && textureNames[filename]) || unknown;
}