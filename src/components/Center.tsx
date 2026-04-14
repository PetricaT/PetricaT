import "../css/center.css";

let rng = Math.floor(Math.random() * 1000);
let has_hit_lucky_number = false;

const generateRandomGreeting = () => {
    if ([1, 42, 67, 69, 420].includes(rng)) {
        has_hit_lucky_number = true;
        return `Wow, you rolled ${rng}!`;
    }

    const greetings = ["Hey", "Hi", "Hello", "Hey there", "Greetings,", "Tidings", "Salutations", "May you walk on warm sands,"];
    const names = ["friend", "buddy", "stranger"];
    const suffix = [".", ".", ".", "~", "!"];

    return `${greetings[Math.floor(Math.random() * greetings.length)]} ${names[Math.floor(Math.random() * names.length)]}${suffix[Math.floor(Math.random() * suffix.length)]}`;
};

export const Center = () => {
    return (
        <div className="center frame">
            <h1>{generateRandomGreeting()}</h1>
            <h4 className={has_hit_lucky_number ? "" : "invisible-text"}>
                "You hit the lucky number! That's a 1 in 1000 chance"
            </h4>
            <div className="center-text">
                <p>
                I usually work on stuff around my GitHub, so you can find many of my projects there. Mostly Python as it's so versatile :P, and I can make my stuff as cross-platform as possible, which is my primary goal as a programmer.
                Hold no ties, use whatever you want.
                </p><p>
                Hey while you're here, check out some of my stuff!
                </p>
                <ul>
                    <li>&gt; <a href="https://github.com/PetricaT/ProgrammingVTuberLogos-Addon">VTuber Style Logos</a></li>
                    <li>&gt; <a href="https://github.com/PetricaT/IsaacMM">Isaac Mod Manager</a> - Because the internal one isn't enough</li>
                    <li>&gt; <a href="https://github.com/PetricaT/SteamMarkdownEditor">Live Steam BBCode Editor</a> - So you can actually see your changes</li>
                    <li>&gt; <a href="https://github.com/PetricaT/wayland-peek">Wayland Peek</a> - A simple wayland Window Spy re-creation.</li>
                    <li>&gt; <a href="https://github.com/PetricaT/arsenal-i18n">Arsenal (Mod Manager) translations</a> - The community ran package</li>
                </ul>
            </div>
        </div>
    );
};

