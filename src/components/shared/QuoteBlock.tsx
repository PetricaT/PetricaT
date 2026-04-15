import "../../css/quote-block.css";
 
type QuoteBlockProps = {
  text: string;
  date: string;
};
 
export const QuoteBlock = ({ text, date }: QuoteBlockProps) => {
  return (
    <div className="quote-block">
      <p className="quote-text">{text}</p>
      <span className="quote-date">{date}</span>
    </div>
  );
};
 