import { PassthroughLink } from "./passthrough-link";
import classNames from "clsx";
import type { ReactElement } from "react";
import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
import type { Placement } from "@popperjs/core";
import { Portal } from "react-portal";

export const POPPER_PLACEMENT_ORIGIN = {
  auto: "",
  "auto-start": "",
  "auto-end": "",
  top: "bottom",
  "top-start": "bottom left",
  "top-end": "bottom right",
  bottom: "top",
  "bottom-start": "top left",
  "bottom-end": "top right",
  right: "left",
  "right-start": "top left",
  "right-end": "bottom left",
  left: "right",
  "left-start": "top right",
  "left-end": "bottom right",
};

type DropdownItemCommon = {
  label: string | JSX.Element;
};

type DropdownItemButton = DropdownItemCommon & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

type DropdownItemLink = DropdownItemCommon & {
  href?: string;
};

type DropdownItem = DropdownItemButton | DropdownItemLink;

export type DropdownItems =
  | DropdownItem[]
  | DropdownItemWithIcon[]
  | GroupedDropdownItems[]
  | GroupedDropdownItemsWithIcon[];

type GroupedDropdownItems = {
  label: string;
  items: DropdownItem[];
};

type GroupedDropdownItemsWithIcon = {
  label: string;
  items: DropdownItemWithIcon[];
};

function isGrouped(items: DropdownItems): items is GroupedDropdownItems[] {
  const group = (items as GroupedDropdownItems[])[0];
  return group?.items !== undefined;
}

function isButton(
  item: DropdownItemButton | DropdownItemLink
): item is DropdownItemButton {
  return (item as DropdownItemButton).onClick !== undefined;
}

type DropdownItemWithIcon = {
  icon: ReactElement;
} & DropdownItem;

function hasIcon(
  item: DropdownItemWithIcon | DropdownItem
): item is DropdownItemWithIcon {
  return (item as DropdownItemWithIcon).icon !== undefined;
}

const Dropdown: React.FC<{
  children: React.ReactNode;
  placement?: Placement;
  items: DropdownItems;
  className?: string;
  noPortal?: Boolean;
}> = (props) => {
  const {
    placement = "top-start",
    children,
    items,
    className,
    noPortal,
  } = props;
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes, update, state } = usePopper(
    referenceElement,
    popperElement,
    {
      placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );
  return (
    <Menu as={Fragment}>
      <div ref={setReferenceElement} className={className}>
        <Menu.Button as={Fragment}>{children}</Menu.Button>
      </div>
      <Portal node={noPortal ? referenceElement : undefined}>
        <div
          ref={setPopperElement}
          style={{ zIndex: 100, ...styles.popper }}
          {...attributes.popper}
        >
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            beforeEnter={() => update?.()}
          >
            <div className="overflow-hidden rounded-md bg-gray-900 shadow-lg">
              <Menu.Items
                className="scroll-shadows max-h-[50vh] w-max overflow-y-auto overflow-x-hidden ring-1 ring-black/5 focus:outline-none"
                style={{
                  transformOrigin:
                    POPPER_PLACEMENT_ORIGIN[state?.placement || "top"],
                }}
              >
                {isGrouped(items) ? (
                  items.map((group) => (
                    <div key={group.label}>
                      <div className="flex w-full items-center py-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 first:pt-3 last:pb-3">
                        {group.label}
                      </div>
                      <DropdownItems items={group.items} />
                    </div>
                  ))
                ) : (
                  <DropdownItems items={items} />
                )}
              </Menu.Items>
            </div>
          </Transition>
        </div>
      </Portal>
    </Menu>
  );
};

export const DropdownItems: React.FC<{
  items: DropdownItem[] | DropdownItemWithIcon[];
}> = ({ items }) => {
  return (
    <>
      {items.map((item) => {
        const renderedIcon = hasIcon(item) && (
          <span className="mr-2 h-5 w-5" aria-hidden>
            {item.icon}
          </span>
        );

        const { label } = item;
        const commonClasses =
          "group flex items-center w-full px-4 py-2 text-sm first:pt-3 last:pb-3";

        if (isButton(item)) {
          return (
            <Menu.Item key={label.toString()}>
              {({ active }) => (
                <button
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={classNames(
                    {
                      "opacity-80 hover:cursor-not-allowed": item.disabled,
                    },
                    active ? "bg-gray-800" : "",
                    commonClasses
                  )}
                >
                  {renderedIcon}
                  {label}
                </button>
              )}
            </Menu.Item>
          );
        }

        return (
          <Menu.Item key={label.toString()}>
            {({ active }) =>
              item.href ? (
                <PassthroughLink
                  href={item.href}
                  className={classNames(
                    active ? "bg-gray-800" : "",
                    commonClasses
                  )}
                >
                  {renderedIcon}
                  {label}
                </PassthroughLink>
              ) : (
                <span
                  className={classNames(
                    active ? "bg-gray-800" : "",
                    commonClasses
                  )}
                >
                  {renderedIcon}
                  {label}
                </span>
              )
            }
          </Menu.Item>
        );
      })}
    </>
  );
};

export default Dropdown;
