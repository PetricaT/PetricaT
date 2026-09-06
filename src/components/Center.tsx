import "../css/center.css";
import { Section } from "./shared/Section";
import { CardItem } from "./shared/CardItem";

let rng = Math.floor(Math.random() * 1000);
let has_hit_lucky_number = false;

const generateRandomGreeting = () => {
    if ([1, 42, 67, 69, 420].includes(rng)) {
        has_hit_lucky_number = true;
        return `Wow, you rolled ${rng}!`;
    }

    const greetings = ["Hey", "Hi,", "Hello", "Hey there", "Greetings,", "Tidings,", "Salutations,", "May you walk on warm sands,"];
    const names = ["friend", "buddy", "stranger", "traveler", "wanderer", 
        "kindred spirit", "space cowboy", "kind soul", "cursed one", 
        "dragonborn", "chosen one"
    ];
    const suffix = [".", ".", ".", ".", ".", "~", "!"];

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
                    I usually work on stuff to fix problems I encounter <i>(which is usually Linux never having a GUI app for anything)</i>, 
                    and you can find many of my projects on GitHub. Usually Python as it's so versatile :P, 
                    and I can make my stuff as <b>cross-platform</b> as possible, and C++ when performance is the goal.
                    <br/><br/>
                    <i> Hold no ties, use whatever you want.</i>
                </p>
                <h3>
                    Hey while you're here, check out some of my stuff!
                </h3>
                <Section icon="📔" title="Projects" color="#42425e">
                    <CardItem
                        image="https://avatars.githubusercontent.com/u/24418935?v=4"
                        title="Programming VTuber Logos (Addons)"
                        description="Growing collection of VTuber logos, made by me."
                        href="https://github.com/PetricaT/ProgrammingVTuberLogos-Addon"
                    />
                    <CardItem
                        image="https://raw.githubusercontent.com/GameModManager/Resources/a447549085e3f5e534067d73d4b12cbde7fe0344/icons/gmm-logo.ico"
                        title="GameModManager"
                        description="An all-in-one cross-platform manager meant to fill the gap MO2 left behind."
                        href="https://github.com/GameModManager/Core"
                    />
                    <CardItem
                        image="https://github.com/PetricaT/IsaacMM/blob/main/assets/icon.png?raw=true"
                        title="IsaacMM"
                        description="Simple mod manager for Isaac"
                        href="https://github.com/PetricaT/IsaacMM"
                        tooltip="This project is currently in maintenance mode, and is in the process of being replaced by GameModManager."
                    />
                    <CardItem
                        image="https://store.steampowered.com/favicon.ico"
                        title="Steam BBCode Editor"
                        description="Live editor and parser for Steam style BBCode"
                        href="https://github.com/PetricaT/SteamMarkdownEditor"
                    />
                    <CardItem
                        image="https://www.linux.fi/w/images/thumb/9/99/Wayland_Logo.svg/266px-Wayland_Logo.svg.png?20200927133655"
                        title="Wayland Peek"
                        description="A simple wayland Window Spy re-creation."
                        href="https://github.com/PetricaT/wayland-peek"
                    />
                    <CardItem
                        image="https://raw.githubusercontent.com/PetricaT/arsenal-i18n/refs/heads/main/assets/arsenal-i18n.svg"
                        title="Arsenal (Mod Manager) translations"
                        description="The community ran package"
                        href="https://github.com/PetricaT/arsenal-i18n"
                        tooltip="I think Crystal2K stopped trying to do translations? I have not seen any news on this in a while and the docs page is down."
                    />
                </Section>
                <br />
                I also like to collect pictures of the people I meet over time, and so, you can find a mini-collection over on the memoriam page
            </div>
        </div>
    );
};

