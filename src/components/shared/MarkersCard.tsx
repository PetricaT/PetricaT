import "../../css/marker-card.css";
import missingImage from "../../../assets/games/eso/missing.jpg";


type MarkerCardProps = {
    text: string;
    location: string;
    date: string;
};

function ValidateLocation(os_path: string): boolean {
    //  check if the file actually exists on disk. if it doesn't, return missingImage
    try {
        const fs = require("fs");
        return fs.existsSync(os_path);
    } catch (err) {
        console.error("Error checking file existence:", err);
        return false;
    }
}

function ResolveLocation(location: string): string {
    const zones = ["Auridon", "Grahtwood", "Malabal Tor", "Reaper's March", "Stonefalls", 
        "Deshaan", "Shadowfen", "Eastmarch", "The Rift", "The Reach", "Bangkorai", 
        "Coldharbour", "Craglorn", "Gold Coast", "Murkmire", "Northern Elsweyr", 
        "Southern Elsweyr", "Western Skyrim", "Blackwood", "Vvardenfell", "Clockwork City", 
        "Summerset", "Cyrodiil", "Solstice"];
    const trials = ["Aetherian Archive", "Hel Ra Citadel", "Sanctum Ophidia", 
        "Maw of Lorkhaj", "Halls of Fabrication", "Asylum Sanctorium", "Cloudrest", 
        "Sunspire", "Kyne's Aegis", "Rockgrove", "Dreadsail Reef", "Sanity's Edge",
        "Lucent Citadel", "Ossein Cage", "Opulent Ordeal", "Crimson Veldt"];

    const normalizedLocation = location.replace(/ /g, "").replace(/'/g, "");

    if (zones.includes(location) || trials.includes(location)) {
        if (!ValidateLocation(`./assets/games/eso/${normalizedLocation}.png`)) {
            console.warn(`Image for location "${location}" not found. Using missing image.`);
            return missingImage;
        }
        return `./assets/games/eso/${normalizedLocation}.png`;
    } else {
        return missingImage;
    }
}

export const MarkerCard = ({ text, location, date }: MarkerCardProps) => {
    var card_image = ResolveLocation(location);
    
    return (
        <div className="marker-card">
            <img src={card_image} alt={location} className="marker-image" />
            <p className="marker-text marker-title">{text}</p>
            <div className="marker-info">
                <span className="marker-location">{location}</span>
                <span className="marker-date">{date}</span>
            </div>
        </div>
    );
};
