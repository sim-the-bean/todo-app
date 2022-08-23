import React from 'react';
import { PlusCircleIcon, MenuIcon, PencilIcon, TrashIcon, SelectorIcon, TagIcon, XIcon } from '@heroicons/react/outline';
import '../index.css';
import { Tag } from './ui';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {(props: any) => JSX.Element} GenericComponent */
/** @typedef {{buttonRef: any, className: ?string, onClick: (event: React.MouseEvent) => void, onMouseDown: (event: React.MouseEvent) => void, onMouseUp: (event: React.MouseEvent) => void, onPointerDown: (event: React.PointerEvent) => void, onPointerUp: (event: React.PointerEvent) => void}} ButtonProps */
/** @typedef {(props: ButtonProps) => JSX.Element} ButtonComponent */
/** @typedef {{onClick: ?(event: React.MouseEvent) => void, additionalIconClass: ?string, ariaLabel: ?string}} ButtonOptions */
/** @typedef {{checked: bool, id: ?string, onClick: ?(event: React.MouseEvent) => void, className: ?string}} SwitchProps */

/**
 * @param {GenericComponent} Icon
 * @param {?ButtonOptions} options 
 * @returns {ButtonComponent}
 */
export function button(Icon, options) {
    const { onClick, additionalIconClass: additionalClass } = { additionalIconClass: "text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300", ...(options ?? {}) }
    return (props) => (
        <button
            ref={props.buttonRef}
            role={props.role}
            aria-label={props['aria-label'] ?? options.ariaLabel}
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={props.className}
            onClick={onClick ?? props.onClick}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onPointerDown={props.onPointerDown}
            onPointerUp={props.onPointerUp}
        >
            <Icon className={`flex-none h-6 outline outline-2 outline-transparent focus:outline-blue-500 dark:focus:outline-blue-400 ${additionalClass}`} />
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
export const DeleteButton = button(TrashIcon, { ariaLabel: "Delete", additionalIconClass: "text-red-800 hover:text-red-500 dark:text-red-600 dark:hover:text-red-400" });

/** 
 * A generic component to represent cancel.
 */
export const CancelButton = button(XIcon, { ariaLabel: "Cancel", additionalIconClass: "text-red-800 hover:text-red-500 dark:text-red-600 dark:hover:text-red-400" });

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
    const baseClassName = "h-6 mx-1 my-1 outline outline-2 outline-transparent focus:outline-blue-500 dark:focus:outline-blue-400";
    const className = props.faded ?
        `${baseClassName} scale-75 translate-y-1 transition ease-in-out delay-150 hover:scale-125 hover:translate-y-0 hover:animate-pulse` :
        `${baseClassName} transition ease-in-out delay-50 hover:scale-110 hover:animate-pulse`;

    return <button
        role={props.role}
        aria-label={props['aria-label']}
        className={className}
        onClick={props.onClick}
        onMouseDown={props.onMouseDown}
        onMouseUp={props.onMouseUp}
        onPointerDown={props.onPointerDown}
        onPointerUp={props.onPointerUp}
    >
        <Tag faded={props.faded} color={props.color} />
    </button>;
}

/**
 * A component that reorders list items visually.
 * @param {ButtonProps} props 
 */
export function ReorderButton(props) {
    return (
        <div
            tabIndex="0"
            aria-label="Drag to reorder"
            className={`outline outline-2 outline-transparent focus:outline-blue-500 dark:focus:outline-blue-400 ${props.isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${props.className ?? ''}`}
            ref={props.drag}
        >
            <SelectorIcon className="flex-none h-6 text-slate-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-gray-300" />
        </div>
    );
}

/**
 * A boolean switch.
 * @param {SwitchProps} props 
 * @returns {JSX.Element}
 */
export function Switch(props) {
    let className = "rounded-full h-6 w-10 hover:drop-shadow-md outline outline-2 outline-zinc-200 hover:outline-slate-400 focus:outline-blue-500 dark:outline-gray-700 dark:hover:outline-slate-600 dark:focus:outline-blue-400";
    let className2 = "rounded-full h-6 w-6 bg-zinc-50 dark:bg-slate-700 drop-shadow-lg hover:drop-shadow-xl outline outline-2 outline-transparent hover:outline-zinc-200 dark:outline-gray-600 dark:hover:outline-slate-400";
    if (props.checked) {
        className = `relative ${className} ${props.className ?? ''} bg-green-600`;
        className2 = `absolute ${className2} right-0`;
    } else {
        className = `relative ${className} ${props.className ?? ''} bg-red-600`;
    }
    return (
        <div
            id={props.id}
            tabIndex="0"
            role="switch"
            aria-label={props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
            aria-checked={props.checked}
            className={className}
            onClick={props.onClick}
        >
            <div className={className2}></div>
        </div>
    );
}