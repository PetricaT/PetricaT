import { useState } from "react";
import "../css/center.css";
import { MarkerCard } from "./shared/MarkersCard";

export const MarkersDB = () => {

  return (
    <div className="center frame">
      <h1>Markers Database</h1>
      <div className="card-container">
        <MarkerCard
          text="Stacking & Slayer positions."
          location="Kyne's Aegis"
          date="2026/11/08"
        />
      </div>
    </div>

  );
};