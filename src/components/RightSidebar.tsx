import { Calendar } from "./Calendar";
import "../css/right-sidebar.css";
export const RightSidebar = () => {
    return (
        <div className="right-sidebar frame">
            <Calendar />
            <div className="divider"></div>
        </div>
    );
};
