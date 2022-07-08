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

            return <div className={`flex items-center w-full space-x-1 ${props.className ?? ''}`} onMouseEnter={hideTimeout !== null && onMouseEnter} onMouseLeave={hideTimeout !== null && onMouseLeave}>
                {props.children}
            </div>
        }, []);

        const Wrapper = useCallback((props) => (
            <div className={`flex static ${props.className ?? ''}`}>
                {props.children}
            </div>
        ), []);

        const PopupButton = useCallback((props) => (
            <Button className={props.className} popup={props.popup} onClick={() => setShowPopup(!props.popup)} />
        ), []);

        const PopupMenu = useCallback((props) => (
            <div className={`absolute z-10 flex items-center space-x-1 bg-zinc-200 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300 ${props.className ?? ''}`}>
                {props.children}
            </div>
        ), []);

        const popup = useMemo(
            () => ({ showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu }),
            [showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu]);

        return <Render {...props} popup={popup} />
    };
}