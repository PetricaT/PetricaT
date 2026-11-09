import "../css/center.css";
import { MarkerCard } from "./shared/MarkersCard";
import { markerSets } from "../generated/markers-db";
import type { MarkerCardData } from "../generated/markers-db";

type MarkersDBProps = {
  onSelect: (markerSet: MarkerCardData) => void;
};

export const MarkersDB = ({ onSelect }: MarkersDBProps) => {

  return (
    <div className="center frame">
      <h1>Markers Database</h1>
      <div className="card-container">
        {markerSets.map((markerSet) => (
          <MarkerCard
            key={markerSet.id}
            markerSet={markerSet}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>

  );
};