import '../css/left-sidebar.css';
import { QuoteBlock } from './shared/QuoteBlock';

export const LeftSidebar = () => {
    return (
        <div className="left-sidebar frame">
            <h1>
                &gt;&gt; News &lt;&lt;
            </h1>
            <QuoteBlock
                text="Memoriam is now up and running!"
                date="2026/04/15"
            />

            <QuoteBlock
                text="Memoriam is now officially work in progress!"
                date="2026/04/15"
            />

            <QuoteBlock
                text="Useful stuff (the page) has been implemented."
                date="2026/04/15"
            />

            <QuoteBlock
                text="New website redesign! Hope you like it ;)"
                date="2026/04/14"
            />
        </div>
    );
};
