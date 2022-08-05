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
        "rounded border border-gray-800 bg-gray-750 shadow",
        className
      )}
      {...rest}
    ></div>
  );
};
