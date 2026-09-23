// src/components/ESOGuides.tsx
import { useState } from "react";
import "../css/center.css";
import { GuideItem } from "./shared/GuideItem";


export const ESOGuides = () => {
  // const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  return (
    <div className="center frame">
      <h1>ESO Guides</h1>
      <div className="card-container">
        <GuideItem
          title="Ossein Cage"
          image="https://assets.rpglogs.com/img/eso/zones/zone-19.png"
          description="I hate this place with a burning passion."
          tags={["newest", "hard mode", "wip"]}
        />
      </div>
    </div>

  );
};