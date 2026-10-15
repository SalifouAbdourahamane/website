import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { FigureSlot } from "@/components/FigureSlot";
import { lp, type Lang } from "./config";

/** Walks a post body: internal links get the page's language prefix, and figures get the language. */
export function localize(node: ReactNode, lang: Lang): ReactNode {
  return Children.map(node, child => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ href?: string; children?: ReactNode; lang?: Lang }>;
    if (el.type === FigureSlot) return cloneElement(el, { lang });
    const props: { href?: string; children?: ReactNode } = {};
    if (el.type === "a" && typeof el.props.href === "string") props.href = lp(lang, el.props.href);
    if (el.props.children !== undefined) props.children = localize(el.props.children, lang);
    return Object.keys(props).length ? cloneElement(el, props) : el;
  });
}
