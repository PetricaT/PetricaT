import { useState } from "react";
import "../css/center.css";
import "../css/memoriam.css";


// ─── Data types ───────────────────────────────────────────────────────────────

type MediaItem = {
    src: string;
    alt?: string;
    caption?: string;
};

type FriendPile = {
    friend: string;
    media: MediaItem[];
};

type GameSection = {
    id: string;
    title: string;
    piles: FriendPile[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const GAMES: GameSection[] = [
    {
        id: "eso",
        title: "ESO",
        piles: [
            {
                friend: "Rianellio_Ravan",
                media: [
                    {
                        src: "https://i.imgur.com/ka2h4RU.jpeg",
                        caption: "Best vampire in all of ESO",
                    },
                    {
                        src: "https://i.imgur.com/lw3SAZ5.jpeg",
                        caption: "We hitting poses.",
                    },
                    {
                        src: "https://i.imgur.com/NW6nRjw.jpeg",
                        caption: "He has reached his final form!!",
                    },
                ],
            },
            {
                friend: "KaptaienBohean",
                media: [
                    {
                        src: "https://i.imgur.com/lsovuvN.jpeg",
                        caption: "This Kaptain is a beast.",
                    },
                    {
                        src: "https://i.imgur.com/X7D4bD5.jpeg"
                    }
                ],
            },
        ],
    },
    {
        id: "placeholder",
        title: "Placeholder",
        piles: [
            {
                friend: "Unfinished",
                media: [
                    {
                        src: "./unfinished"
                    }
                ],
            },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv"];

function isVideo(src: string): boolean {
    const ext = src.split(".").pop()?.toLowerCase() ?? "";
    return VIDEO_EXTENSIONS.includes(ext);
}

function parseDateFromSrc(src: string): string {
    const filename = src.split("/").pop() ?? "";
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1].replace(/-/g, "/") : "";
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

type CarouselProps = {
    media: MediaItem[];
    startIndex: number;
    onClose: () => void;
};

const Carousel = ({ media, startIndex, onClose }: CarouselProps) => {
    const [index, setIndex] = useState(startIndex);

    const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);
    const next = () => setIndex((i) => (i + 1) % media.length);

    const item = media[index];
    const date = parseDateFromSrc(item.src);
    const video = isVideo(item.src);

    return (
        <div className="carousel-overlay" onClick={onClose}>
            <div className="carousel-box" onClick={(e) => e.stopPropagation()}>

                <button className="carousel-close" onClick={onClose}>✕</button>
                <button className="carousel-arrow left" onClick={prev}>&lt;</button>

                <div className="carousel-media">
                    {video ? (
                        <video
                            key={item.src}
                            controls
                            autoPlay
                            loop
                            className="carousel-video"
                        >
                            <source src={item.src} />
                            Your browser does not support this video format.
                        </video>
                    ) : (
                        <img src={item.src} alt={item.alt ?? ""} className="carousel-img" />
                    )}

                    <div className="carousel-meta">
                        {item.caption && <span className="carousel-caption">{item.caption}</span>}
                        {date && <span className="carousel-date">{date}</span>}
                    </div>
                </div>

                <button className="carousel-arrow right" onClick={next}>&gt;</button>

                <span className="carousel-counter">{index + 1} / {media.length}</span>
            </div>
        </div>
    );
};

// ─── Photo Pile ───────────────────────────────────────────────────────────────

type PhotoPileProps = {
    pile: FriendPile;
    onOpen: (media: MediaItem[], startIndex: number) => void;
};

const PILE_OFFSETS = [
    { rotate: "-6deg", translateX: "-6px", translateY: "3px" },
    { rotate: "4deg", translateX: "4px", translateY: "-2px" },
    { rotate: "-2deg", translateX: "0px", translateY: "1px" },
];

const PhotoPile = ({ pile, onOpen }: PhotoPileProps) => {
    const preview = pile.media.slice(0, 3);

    return (
        <div className="pile-wrapper" onClick={() => onOpen(pile.media, 0)}>
            <div className="pile-stack">
                {preview.map((item, i) => {
                    const off = PILE_OFFSETS[i] ?? PILE_OFFSETS[0];
                    const video = isVideo(item.src);
                    return video ? (
                        <div
                            key={i}
                            className="pile-photo pile-video-thumb"
                            style={{ zIndex: i, transform: `rotate(${off.rotate}) translate(${off.translateX}, ${off.translateY})` }}
                        >
                            ▶
                        </div>
                    ) : (
                        <img
                            key={i}
                            className="pile-photo"
                            src={item.src}
                            alt=""
                            style={{ zIndex: i, transform: `rotate(${off.rotate}) translate(${off.translateX}, ${off.translateY})` }}
                        />
                    );
                })}
            </div>
            <span className="pile-label">{pile.friend}</span>
            <span className="pile-count">{pile.media.length} item{pile.media.length !== 1 ? "s" : ""}</span>
        </div>
    );
};

// ─── Game Section ─────────────────────────────────────────────────────────────

type GameSectionProps = {
    game: GameSection;
    onOpen: (media: MediaItem[], startIndex: number) => void;
};

const GameSectionBlock = ({ game, onOpen }: GameSectionProps) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="game-section">
            <button className="game-header" onClick={() => setOpen((o) => !o)}>
                <span className="game-title">{game.title}</span>
                <span className="game-rule" />
                <span className="game-arrow">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
                <div className="game-piles">
                    {game.piles.map((pile) => (
                        <PhotoPile key={pile.friend} pile={pile} onOpen={onOpen} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Memoriam page ────────────────────────────────────────────────────────────

type CarouselState = { media: MediaItem[]; startIndex: number } | null;

export const Memoriam = () => {
    const [carousel, setCarousel] = useState<CarouselState>(null);

    const openCarousel = (media: MediaItem[], startIndex: number) =>
        setCarousel({ media, startIndex });

    const closeCarousel = () => setCarousel(null);

    return (
        <div className="center frame">
            <h1>Memories of days gone.</h1>
            <p>
                I've met many people online, so this is just a small collection of them.
            </p>
            <div className="memoriam-sections">
                {GAMES.map((game) => (
                    <GameSectionBlock key={game.id} game={game} onOpen={openCarousel} />
                ))}
            </div>

            {carousel && (
                <Carousel
                    media={carousel.media}
                    startIndex={carousel.startIndex}
                    onClose={closeCarousel}
                />
            )}
        </div>
    );
};