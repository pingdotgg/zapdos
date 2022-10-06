import clsx from "clsx";
import { HTMLAttributes } from "react";

export const Card: React.FC<
  {
    className?: string;
  } & HTMLAttributes<HTMLDivElement>
> = ({ className, ...rest }) => {
  return (
    <div
      className={clsx(
        "rounded border border-gray-750 bg-gray-850 shadow",
        className
      )}
      {...rest}
    ></div>
  );
};
