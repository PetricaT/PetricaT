import "../../css/card-item.css";

type CardItemProps = {
  image: string;         // image src URL
  imageAlt?: string;
  title: string;
  description?: string;
  href?: string;         // if provided, opens this URL
  onClick?: () => void;  // alternatively, a click handler
};

export const CardItem = ({ image, imageAlt = "", title, description, href, onClick }: CardItemProps) => {
  const handleClick = () => {
    if (href) window.open(href, "_blank", "noopener noreferrer");
    else onClick?.();
  };

  return (
    <div className="card-item" onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <img className="card-item-image" src={image} alt={imageAlt} />
      <div className="card-item-body">
        <span className="card-item-title">{title}</span>
        {description && <span className="card-item-description">{description}</span>}
      </div>
      <span className="card-item-arrow">&gt;</span>
    </div>
  );
};