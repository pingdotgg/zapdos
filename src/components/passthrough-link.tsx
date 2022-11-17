import type { AnchorHTMLAttributes } from "react";
import type { LinkProps } from "next/link";
import NextLink from "next/link";

type PassthroughLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Creates a Next Link and passes the additional props to the a tag
 * This whole component might be a bad idea
 * @see https://headlessui.dev/react/menu#integrating-with-next-js
 */
export const PassthroughLink: React.FC<PassthroughLinkProps> = (props) => {
  let { href, children, ...rest } = props;
  return (
    <NextLink {...props}>
      <a {...rest}>{children}</a>
    </NextLink>
  );
};
