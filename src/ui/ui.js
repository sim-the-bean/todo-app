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
        style: "flex-none h-6 text-red-600 dark:text-red-500",
        faded: "flex-none h-6 text-red-400 hover:text-red-600 dark:hover:text-red-500",
    },
    green: {
        style: "flex-none h-6 text-green-600 dark:text-green-500",
        faded: "flex-none h-6 text-lime-200 hover:text-green-600 dark:hover:text-green-500",
    },
    blue: {
        style: "flex-none h-6 text-sky-600 dark:text-sky-500",
        faded: "flex-none h-6 text-blue-300 hover:text-sky-600 dark:hover:text-sky-500",
    },
    yellow: {
        style: "flex-none h-6 text-amber-400",
        faded: "flex-none h-6 text-orange-200 hover:text-amber-400",
    },
};

/**
 * @param {{label: Label, faded: bool}} props
 */
export function Tag(props) {
    return <TagIcon className={props.faded ? TAG_STYLES[props.color].faded : TAG_STYLES[props.color].style} />;
}

/** @param {{className: ?string}} props */
export function HorizontalDivider(props) {
    return <div role="separator" className={`w-3/5 place-self-center outline outline-1 outline-zinc-200 dark:outline-gray-600 ${props.className ?? ''}`}></div>;
}

export function Link(props) {
    return (
        <a className={`text-indigo-900 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-800 ${props.className ?? ''}`} href={props.href}>
            <ExternalLinkIcon className="inline h-4" />
            {props.children}
        </a>
    );
}

export * from './buttons.js';
export * from './menus.js';