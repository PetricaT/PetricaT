import "../../css/card-item.css";
import fallbackImage from "../../../assets/icons/color/missing.svg";

type CardItemProps = {
  image: string;         // image src URL
  imageAlt?: string;
  title: string;
  description?: string;
  href?: string;         // if provided, opens this URL
  onClick?: () => void;  // alternatively, a click handler
  tooltip?: string;      // optional tooltip text
};

export const CardItem = ({ image, imageAlt = "", title, description, href, tooltip = "", onClick }: CardItemProps) => {
  const handleClick = () => {
    if (href) window.open(href, "_blank", "noopener noreferrer");
    else onClick?.();
  };

  const imageUrl = image === "" ? fallbackImage : image;
  const hasTooltip = tooltip !== "";

  return (
    <div
      className={`card-item${hasTooltip ? " card-item-faded" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      title={hasTooltip ? tooltip : undefined}
    >
      <img className="card-item-image" src={imageUrl} alt={imageAlt} />
      <div className="card-item-body">
        <span className="card-item-title">{title}</span>
        {description && <span className="card-item-description">{description}</span>}
      </div>
      <span className="card-item-arrow">&gt;</span>
    </div>
  );
};