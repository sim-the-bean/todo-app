import React, { useState, useRef, useMemo, useCallback, useContext } from 'react';
import '../index.css';
import { DeviceContext } from '../App';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {(props: {className: ?string, children: JSX.Element[]}) => JSX.Element} ParentComponent */
/** @typedef {(props: any) => JSX.Element} GenericComponent */
/** @typedef {{buttonRef: any, popup: bool, onClick: (event: React.MouseEvent) => void}} PopupButtonProps */
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
        const device = useContext(DeviceContext);

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

            const useMouseEvent = hideTimeout !== 0 && !device.mobile;

            return (
                <div
                    role={props.role}
                    className={`flex items-center w-full space-x-1 ${props.className ?? ''}`}
                    onMouseEnter={useMouseEvent ? onMouseEnter : null}
                    onMouseLeave={useMouseEvent ? onMouseLeave : null}
                    {...props.divProps}
                >
                    {props.children}
                </div>
            );
        }, [device.mobile]);

        const Wrapper = useCallback((props) => (
            <div className={`flex static ${props.className ?? ''}`}>
                {props.children}
            </div>
        ), []);

        const PopupButton = useCallback((props) => {
            return (
                <Button
                    aria-label={props['aria-label'] ?? "Toggle popup menu"}
                    aria-haspopup="menu"
                    aria-expanded={props.popup}
                    aria-checked={props['aria-checked']}
                    aria-controls={popupId}
                    className={props.className}
                    popup={props.popup}
                    onClick={(event) => {
                        event.preventDefault();
                        setShowPopup(!props.popup);
                    }}
                />
            );
        }, [popupId]);

        const PopupMenu = useCallback((props) => {
            const ariaOrientation = props.vertical ? "vertical" : "horizontal";
            let className;
            if (props.vertical) {
                className = "absolute z-10 grid grid-cols-1 gap-1 justify-center bg-zinc-200 dark:bg-slate-800 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300 dark:outline-gray-700 dark:hover:outline-slate-600";
            } else {
                className = "absolute z-10 flex items-center space-x-1 bg-zinc-200 dark:bg-slate-800 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300 dark:outline-gray-700 dark:hover:outline-slate-600";
            }
            className = `${className} ${props.className ?? ''}`;

            return <div
                id={popupId}
                role="menu"
                aria-orientation={ariaOrientation}
                className={className}>
                {props.children}
            </div>;
        }, [popupId]);

        const popup = useMemo(
            () => ({ showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu }),
            [showPopup, setShowPopup, Parent, Wrapper, PopupButton, PopupMenu]);

        return <Render {...props} popup={popup} />
    };
}