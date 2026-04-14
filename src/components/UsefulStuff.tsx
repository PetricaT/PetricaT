import "../css/center.css";
import { Section } from "./shared/Section";
import { CardItem } from "./shared/CardItem";

export const UsefulStuff = () => {
    return (
        <div className="center frame">
            <h1>Things I find useful...</h1>
            <Section icon="https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg" title="Blender" color="#b64e17">
                <CardItem
                    image="https://avatars.githubusercontent.com/u/60579014?v=4"
                    imageAlt="Blue cube with a fading effect townards on a white background"
                    title="Passivestar's quick menu"
                    description="Very handy blender quickmenu additions"
                    href="https://github.com/passivestar/quickmenu"
                />
                <CardItem
                    image="https://extensions.blender.org/media/images/83/83589db6f17e9dc7909ce8f603ec4eff21a9b3489e063b6d05c7e1bfef27d203.png"
                    title="Key Ops: Toolkit"
                    description="Mesh related tooling"
                    href="https://extensions.blender.org/add-ons/key-ops-toolkit/"
                />
            </Section>
            <Section icon="🌐" title="Cross Platform" color="#7fcc40">
                <CardItem
                    image="https://imhex.werwolv.net/favicon.ico"
                    title="ImHex"
                    description="Modern HEX editor"
                    href="https://imhex.werwolv.net/"
                />
            </Section>
            <Section icon="🐧" title="Linux" color="#ff8f20">
                <CardItem
                    image="https://www.chezmoi.io/assets/images/favicon.png"
                    title="Chezmoi"
                    description="A dotfile manager"
                    href="https://www.chezmoi.io/"
                />
            </Section>

            <Section icon="🪟" title="Windows" color="#0078D4">
                <CardItem
                    image="https://i.imgur.com/jAezl6H.png"
                    title="Posy's Cursors"
                    description="Michiel's custom cursor pack"
                    href="https://www.michieldb.nl/other/cursors/"
                />
            </Section>
        </div>
    );
};