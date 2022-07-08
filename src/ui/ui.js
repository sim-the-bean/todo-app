import React from 'react';
import { TagIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import '../index.css';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */

/** 
 * A mapping from label colour to the unicode character that represents that label.
 * @type {{Label: {style: string, faded: string}}}
 * @readonly 
 */
const TAG_STYLES = {
    red: {
        style: "flex-none h-5 text-red-600",
        faded: "flex-none h-5 text-red-400 hover:text-red-600",
    },
    green: {
        style: "flex-none h-5 text-green-600",
        faded: "flex-none h-5 text-lime-200 hover:text-green-600",
    },
    blue: {
        style: "flex-none h-5 text-sky-600",
        faded: "flex-none h-5 text-blue-300 hover:text-sky-600",
    },
    yellow: {
        style: "flex-none h-5 text-amber-400",
        faded: "flex-none h-5 text-orange-200 hover:text-amber-400",
    },
};

/**
 * @param {{label: Label, faded: bool}} props
 */
export function Tag(props) {
    return <TagIcon className={props.faded ? TAG_STYLES[props.color].faded : TAG_STYLES[props.color].style} />;
}

/** @param {{color: ?string, className: ?string}} props */
export function HorizontalDivider(props) {
    return <div className={`w-3/5 place-self-center outline outline-1 outline-${props.color || 'zinc-200'} ${props.className ?? ''}`}></div>;
}

export function Link(props) {
    return (
        <a className={`text-indigo-900 hover:text-indigo-600 ${props.className ?? ''}`} href={props.href}>
            <ExternalLinkIcon className="inline h-4" />
            {props.children}
        </a>
    );
}

export * from './buttons.js';
export * from './menus.js';