import React from 'react';
import { PlusCircleIcon, MenuIcon, PencilIcon, TrashIcon, SelectorIcon, TagIcon, XIcon } from '@heroicons/react/outline';
import '../index.css';
import { Tag } from './ui';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {(props: any) => JSX.Element} GenericComponent */
/** @typedef {{className: ?string, onClick: (event: React.MouseEvent) => void}} ButtonProps */
/** @typedef {(props: ButtonProps) => JSX.Element} ButtonComponent */
/** @typedef {{onClick: ?(event: React.MouseEvent) => void, additionalIconClass: ?string, ariaLabel: ?string}} ButtonOptions */

/**
 * @param {GenericComponent} Icon
 * @param {?ButtonOptions} options 
 * @returns {ButtonComponent}
 */
export function button(Icon, options) {
    const { onClick, additionalIconClass: additionalClass } = { additionalIconClass: "text-slate-400 hover:text-slate-900", ...(options ?? {}) }
    return (props) => (
        <button
            role={props.role}
            aria-label={props['aria-label'] ?? options.ariaLabel}
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={props.className}
            onClick={onClick ?? props.onClick}
        >
            <Icon className={`flex-none h-5 ${additionalClass}`} />
        </button>
    );
}

/**
 * A component that adds a new item to the list when clicked.
 */
export const AddItemButton = button(PlusCircleIcon, { ariaLabel: "Add" });

/** 
 * A component that deletes the selected item when clicked.
 */
export const DeleteButton = button(TrashIcon, { ariaLabel: "Delete", additionalIconClass: "text-red-800 hover:text-red-500" });

/** 
 * A generic component to represent cancel.
 */
export const CancelButton = button(XIcon, { ariaLabel: "Cancel", additionalIconClass: "text-red-800 hover:text-red-500" });

/** 
 * A component that edits the selected item when clicked. Unused.
 */
export const EditButton = button(PencilIcon, { ariaLabel: "Edit", additionalIconClass: "text-blue-300 hover:text-sky-700" });

/** 
 * A component that opens or closes the side menu on each item.
 */
export const MenuButton = button(MenuIcon, { ariaLabel: "Toggle side menu" });

/** 
 * A component that opens or closes the tag filter menu.
 */
export const FilterButton = button(TagIcon, { ariaLabel: "Toggle filter menu" });

/** 
 * A component that toggles a label on the selected item when clicked.
 * @param {{faded: bool, color: Label, onClick: (event: React.MouseEvent) => void, ariaLabel: string}} props 
 */
export function LabelButton(props) {
    const className = props.faded ?
        "scale-75 translate-y-1 transition ease-in-out delay-150 hover:scale-125 hover:translate-y-0 hover:animate-pulse" :
        "transition ease-in-out delay-50 hover:scale-110 hover:animate-pulse";

    return <button role={props.role} aria-label={props['aria-label']} className={className} onClick={props.onClick}>
        <Tag faded={props.faded} color={props.color} />
    </button>;
}

/**
 * A component that reorders list items visually.
 * @param {{onMouseDown: (event: React.MouseEvent) => void}} props 
 */
export function ReorderButton(props) {
    return (
        <div className={`flex ${props.className ?? ''}`}>
            <button aria-label="Drag to reorder" className="accent-transparent" onMouseDown={props.onMouseDown} onMouseUp={props.onMouseUp}>
                <SelectorIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
            </button>
        </div>
    );
}