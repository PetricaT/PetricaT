import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Center } from "./components/Center";
import { UsefulStuff } from "./components/UsefulStuff";
import { Memorium } from "./components/Memorium";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import "./index.css";

export type Page = "home" | "useful-stuff" | "memorium";

export function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  const renderCenter = () => {
    switch (activePage) {
      case "home":        return <Center />;
      case "useful-stuff": return <UsefulStuff />;
      case "memorium":    return <Memorium />;
    }
  };

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <LeftSidebar />
        {renderCenter()}
        <RightSidebar />
      </div>
    </div>
  );
}

export default App;