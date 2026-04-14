import "../css/navbar.css";
import type { Page } from "../App";

type NavbarProps = {
  activePage: Page;
  setActivePage: (page: Page) => void;
};

export const Navbar = ({ activePage, setActivePage }: NavbarProps) => {
  return (
    <nav className="navbar frame">
      <button
        className={activePage === "home" ? "active" : ""}
        onClick={() => setActivePage("home")}
      >
        // Home
      </button>
      <button
        className={activePage === "useful-stuff" ? "active" : ""}
        onClick={() => setActivePage("useful-stuff")}
      >
        // Useful Stuff
      </button>
      <button
        className={activePage === "memorium" ? "active" : ""}
        onClick={() => setActivePage("memorium")}
      >
        // Memorium
      </button>
    </nav>
  );
};