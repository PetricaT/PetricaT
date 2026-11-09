import "../../css/marker-card.css";
import missingImage from "../../../assets/games/eso/missing.jpg";
import aetherianArchiveThumbnail from "../../../assets/games/eso/Aetherian_Archive_thumbnail.png";
import asylumSanctoriumThumbnail from "../../../assets/games/eso/Asylumn_Sanctorium_thumbnail.png";
import cloudrestThumbnail from "../../../assets/games/eso/Cloudrest_thumbnail.png";
import dreadsailReefThumbnail from "../../../assets/games/eso/Dreadsail_Reef_thumbnail.png";
import hallsOfFabricationThumbnail from "../../../assets/games/eso/Halls_of_Fabrication_thumbnail.png";
import helRaCitadelThumbnail from "../../../assets/games/eso/Hel_Ra_Citadel_thumbnail.png";
import kynesAegisThumbnail from "../../../assets/games/eso/Kynes_Aegis_thumbnail.png";
import lucentCitadelThumbnail from "../../../assets/games/eso/Lucent_Citadel_thumbnail.png";
import mawOfLorkhajThumbnail from "../../../assets/games/eso/Maw_of_Lorkhaj_thumbnail.png";
import opulentOrdealThumbnail from "../../../assets/games/eso/Opulent_Ordeal_thumbnail.webp";
import osseinCageThumbnail from "../../../assets/games/eso/Ossein_Cage_thumbnail.png";
import rockgroveThumbnail from "../../../assets/games/eso/Rockgrove_thumbnail.png";
import sanctumOphidiaThumbnail from "../../../assets/games/eso/Sanctum_Ophidia_thumbnail.png";
import sanitysEdgeThumbnail from "../../../assets/games/eso/Sanitys_Edge_thumbnail.png";
import sunspireThumbnail from "../../../assets/games/eso/Sunspire_thumbnail.png";
import type { MarkerCardData } from "../../generated/markers-db";


type MarkerCardProps = {
    markerSet: MarkerCardData;
    onSelect: (markerSet: MarkerCardData) => void;
};

const zones = ["Auridon", "Grahtwood", "Malabal Tor", "Reaper's March", "Stonefalls", 
    "Deshaan", "Shadowfen", "Eastmarch", "The Rift", "The Reach", "Bangkorai", 
    "Coldharbour", "Craglorn", "Gold Coast", "Murkmire", "Northern Elsweyr", 
    "Southern Elsweyr", "Western Skyrim", "Blackwood", "Vvardenfell", "Clockwork City", 
    "Summerset", "Cyrodiil", "Solstice"];
const trials = ["Aetherian Archive", "Hel Ra Citadel", "Sanctum Ophidia", 
    "Maw of Lorkhaj", "Halls of Fabrication", "Asylum Sanctorium", "Cloudrest", 
    "Sunspire", "Kyne's Aegis", "Rockgrove", "Dreadsail Reef", "Sanity's Edge",
    "Lucent Citadel", "Ossein Cage", "Opulent Ordeal", "Crimson Veldt"];

const trialThumbnails: Record<string, string> = {
    "Aetherian Archive": aetherianArchiveThumbnail,
    "Hel Ra Citadel": helRaCitadelThumbnail,
    "Sanctum Ophidia": sanctumOphidiaThumbnail,
    "Maw of Lorkhaj": mawOfLorkhajThumbnail,
    "Halls of Fabrication": hallsOfFabricationThumbnail,
    "Asylum Sanctorium": asylumSanctoriumThumbnail,
    Cloudrest: cloudrestThumbnail,
    Sunspire: sunspireThumbnail,
    "Kyne's Aegis": kynesAegisThumbnail,
    Rockgrove: rockgroveThumbnail,
    "Dreadsail Reef": dreadsailReefThumbnail,
    "Sanity's Edge": sanitysEdgeThumbnail,
    "Lucent Citadel": lucentCitadelThumbnail,
    "Ossein Cage": osseinCageThumbnail,
    "Opulent Ordeal": opulentOrdealThumbnail,
};

function ValidateLocation(os_path: string): boolean {
    try {
        const fs = require("fs");
        return fs.existsSync(os_path);
    } catch (err) {
        console.error("Error checking file existence:", err);
        return false;
    }
}

function ResolveLocation(location: string): string {
    if (trialThumbnails[location]) return trialThumbnails[location];

    const normalizedLocation = location.replace(/ /g, "").replace(/'/g, "");

    if (zones.includes(location) || trials.includes(location)) {
        if (!ValidateLocation(`./assets/games/eso/${normalizedLocation}.png`)) {
            console.warn(`Image for location "${location}" not found. Using missing image.`);
            return missingImage;
        }
        return `./assets/games/eso/${normalizedLocation}.png`;
    }
    return missingImage;
}

export const MarkerCard = ({ markerSet, onSelect }: MarkerCardProps) => {
    const cardImage = ResolveLocation(markerSet.zone);
    
    return (
        <button
            type="button"
            className="marker-card"
            onClick={() => onSelect(markerSet)}
            aria-label={`Open ${markerSet.name} for ${markerSet.zone}`}
        >
            <img src={cardImage} alt="" className="marker-image" />
            <span className="marker-text marker-title">{markerSet.name}</span>
            <span className="marker-info">
                <span className="marker-location">{markerSet.zone}</span>
                <span className="marker-date">{markerSet.date.replaceAll("-", "/")}</span>
            </span>
        </button>
    );
};
