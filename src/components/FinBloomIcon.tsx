import finBloomIcon from "@/assets/finbloom-icon.svg";

interface FinBloomIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

const FinBloomIcon = ({ className = "", size = "md" }: FinBloomIconProps) => (
  <img
    src={finBloomIcon}
    alt="FinBloom"
    className={`${sizeClasses[size]} ${className}`}
  />
);

export default FinBloomIcon;
