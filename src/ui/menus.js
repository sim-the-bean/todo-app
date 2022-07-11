import React, { useState, useRef, useMemo, useCallback } from 'react';
import '../index.css';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {(props: {className: ?string, children: JSX.Element[]}) => JSX.Element} ParentComponent */
/** @typedef {(props: any) => JSX.Element} GenericComponent */
/** @typedef {{popup: bool, onClick: () => void}} PopupButtonProps */
/** @typedef {{hideTimeout: ?number}} PopupOptions */
/** @typedef {{Parent: ParentComponent, Wrapper: ParentComponent, PopupButton: GenericComponent, PopupMenu: ParentComponent}} PopupRender */

/**
 * HOC that creates a popup component.
 * @param {(props: PopupButtonProps) => JSX.Element} Button
 * @param {GenericComponent} Render
 * @param {?PopupOptions} options
 * @returns {GenericComponent}
 */
export function withPopupMenu(Button, Render, options) {
    const { hideTimeout } = { hideTimeout: 1000, ...(options ?? {}) };
    return (props) => {
        const [showPopup, setShowPopup] = useState(false);
        const timeout = useRef(null);
        const popupId = useMemo(() => `${props.id}-popup`, [props.id]);

        const Parent = useCallback((props) => {
            // If the mouse leaves the box (not the side menu), we disappear the box after 1 second.
            // If during this time the mouse re-enters the box, we clear the timeout.
            const onMouseLeave = () => {
                timeout.current = setTimeout(() => {
                    setShowPopup(false);
                    timeout.current = null;
                }, hideTimeout);
            };
            const onMouseEnter = () => {
                if (timeout.current) {
                    clearTimeout(timeout.current);
                    timeout.current = null;
                }
            };

            return (
                <div
                    role={props.role}
                    className={`flex items-center w-full space-x-1 ${props.className ?? ''}`}
                    onMouseEnter={hideTimeout !== 0 && onMouseEnter}
                    onMouseLeave={hideTimeout !== 0 && onMouseLeave}
                    {...props.divProps}
                >
                    {props.children}
                </div>
            );
        }, []);

        const Wrapper = useCallback((props) => (
            <div className={`flex static ${props.className ?? ''}`}>
                {props.children}
            </div>
        ), []);

        const PopupButton = useCallback((props) => (
            <Button
                aria-label={props['aria-label'] ?? "Toggle popup menu"}
                aria-haspopup="menu"
                aria-expanded={props.popup}
                aria-checked={props['aria-checked']}
                aria-controls={popupId}
                className={props.className}
                popup={props.popup}
                onClick={() => setShowPopup(!props.popup)}
            />
        ), [popupId]);

        const PopupMenu = useCallback((props) => (
            <div
                id={popupId}
                role="menu"
                aria-orientation="horizontal"
                className={`absolute z-10 flex items-center space-x-1 bg-zinc-200 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300 ${props.className ?? ''}`}>
                {props.children}
            </div>
        ), [popupId]);

        const popup = useMemo(
            () => ({ showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu }),
            [showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu]);

        return <Render {...props} popup={popup} />
    };
}