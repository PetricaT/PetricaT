import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Center } from "./components/Center";
import { UsefulStuff } from "./components/UsefulStuff";
import { Memoriam } from "./components/Memoriam";
// import { ESOGuides } from "./components/ESOGuides";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { MarkersDB } from "./components/MarkersDB";
import { MarkerViewer } from "./components/MarkerViewer";
import type { MarkerCardData } from "./generated/markers-db";
import "./index.css";

export type Page = "home" | "useful-stuff" | "memoriam" | "eso-guides" | "markers-db" | "marker-viewer";

export function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [selectedMarkerSet, setSelectedMarkerSet] = useState<MarkerCardData | null>(null);

  const openMarkerSet = (markerSet: MarkerCardData) => {
    setSelectedMarkerSet(markerSet);
    setActivePage("marker-viewer");
  };

  const showMarkerDatabase = () => setActivePage("markers-db");

  const renderCenter = () => {
    switch (activePage) {
      case "home":        return <Center />;
      case "useful-stuff": return <UsefulStuff />;
      case "memoriam":    return <Memoriam />;
      // case "eso-guides":  return <ESOGuides />;
      case "markers-db":  return <MarkersDB onSelect={openMarkerSet} />;
      case "marker-viewer":
        return selectedMarkerSet ? (
          <MarkerViewer markerSet={selectedMarkerSet} onBack={showMarkerDatabase} />
        ) : (
          <MarkersDB onSelect={openMarkerSet} />
        );
    }
  };

  const isMarkerViewer = activePage === "marker-viewer";

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className={`main-content${isMarkerViewer ? " main-content--marker-viewer" : ""}`}>
        {!isMarkerViewer && <LeftSidebar />}
        {renderCenter()}
        {!isMarkerViewer && <RightSidebar />}
      </div>
    </div>
  );
}

export default App;