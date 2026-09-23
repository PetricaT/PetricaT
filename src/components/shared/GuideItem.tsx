import "../../css/guide-item.css";
import fallbackImage from "../../../assets/icons/color/missing.svg";

type GuideItemProps = {
  image: string;         // image src URL
  imageAlt?: string;
  title: string;
  description?: string;
  tags?: string[];       // optional tags for the guide
  href?: string;         // if provided, opens this URL
  onClick?: () => void;  // alternatively, a click handler
  tooltip?: string;      // optional tooltip text
};

export const GuideItem = ({ image, imageAlt = "", title, description, tags, href, tooltip = "", onClick }: GuideItemProps) => {
  const handleClick = () => {
    if (href) window.open(href, "_blank", "noopener noreferrer");
    else onClick?.();
  };

  const imageUrl = image === "" ? fallbackImage : image;
  const hasTooltip = tooltip !== "";

  return (
    <div
      className={`guide-item${hasTooltip ? " guide-item-faded" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      title={hasTooltip ? tooltip : undefined}
    >
      <img className="guide-item-image" src={imageUrl} alt={imageAlt} />
      <div className="guide-item-body">
        <span className="guide-item-title">{title}</span>
        {description && <span className="guide-item-description">{description}</span>}
        {tags && tags.length > 0 && (
          <div className="guide-item-tags">
            {tags.map((tag) => (
              <span key={tag} className="guide-item-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="guide-item-arrow">&gt;</span>
    </div>
  );
};