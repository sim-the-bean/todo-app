import React, { useState, useRef, useMemo, useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../index.css';
import { DeviceContext } from '../App';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

/**
 * A wrapper component that represents an existing item on the todo list or a new item.
 */
export const TodoBox = UI.withPopupMenu(
    (props) => (
        <UI.MenuButton
            buttonRef={props.buttonRef}
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={`my-1 ${props.className ?? ''} ${props.popup ? "mr-2" : ""}`}
            popup={props.popup}
            onClick={props.onClick}
        />
    ),
    (props) => {
        const device = useContext(DeviceContext);

        const popup = props.popup;
        const baseClassName = "relative p-2 bg-zinc-50 dark:bg-gray-800 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 dark:outline-gray-700 dark:hover:outline-slate-600";
        let className = baseClassName;
        if (props.isDragging) {
            className = `${baseClassName} opacity-40`;
        }
        return (
            <popup.Parent
                role={props.role}
                className={className}
                divProps={{ ref: props.dragPreview, 'data-handler-id': props.dataHandlerId }}
            >
                <UI.ReorderButton className="ml-1 my-1" drag={props.drag} isDragging={props.isDragging} />
                {props.children}
                <popup.Wrapper>
                    <popup.PopupButton className="ml-2" />
                    {
                        popup.showPopup && <popup.PopupMenu vertical={device.mobile} className={device.mobile ? "w-12 p-2 -ml-1 -mt-2" : "h-12 p-2 -ml-1 -mt-2"}>
                            <popup.PopupButton className="ml-1" popup />
                            {
                                LABELS.map((color) => {
                                    const checked = props.labels.includes(color);
                                    return <UI.LabelButton
                                        key={color}
                                        role="menuitemcheckbox"
                                        aria-label={`Toggle ${color} label`}
                                        aria-checked={checked}
                                        color={color}
                                        faded={!checked}
                                        onClick={() => {
                                            props.toggleLabel(color);
                                            if (device.mobile) {
                                                popup.setShowPopup(false);
                                            }
                                        }}
                                    />;
                                })
                            }
                            <UI.DeleteButton
                                role="menuitem"
                                className={device.mobile ? "ml-1 mt-1" : "ml-2 mr-2 my-1"}
                                onClick={() => {
                                    props.deleteItem();
                                    if (device.mobile) {
                                        popup.setShowPopup(false);
                                    }
                                }}
                            />
                        </popup.PopupMenu>
                    }
                </popup.Wrapper>
            </popup.Parent>
        );
    },
);

/** 
 * A component that represents a new item to be added to the list.
 * @param {{item: Item, name: string, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, setOrder: (key: number, otherKey: number) => void}} props 
 */
export function TodoItem(props) {
    /** @typedef {{key: number, name: string}} DragItem */

    const device = useContext(DeviceContext);

    const type = useMemo(() => `Item-${props.name}`, [props.name]);
    const [expanded, setExpanded] = useState(false);

    const refDrag = useRef(null);
    const refDragPreview = useRef(null);

    const [{ handlerId }, drop] = useDrop(
        () => ({
            accept: type,
            /** @param {DragItem} dragItem */
            hover: (dragItem, monitor) => {
                const self = props.item.key;

                if (dragItem.key === self) {
                    return;
                }

                if (monitor.canDrop()) {
                    props.setOrder(dragItem.key, self);
                }
            },
            /** @param {DragItem} dragItem */
            canDrop: (dragItem, _monitor) => {
                const self = props.name;

                return dragItem.name === self;
            },
            collect: (monitor) => ({
                handlerId: monitor.getHandlerId(),
            }),
        }),
        [type, props.item.key, props.name, props.setOrder],
    );

    const [{ isDragging }, drag, dragPreview] = useDrag(
        () => ({
            type: type,
            item: () => ({ key: props.item.key, name: props.name }),
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [type, props.item.key, props.name],
    );

    const item = props.item;

    drag(refDrag);
    dragPreview(drop(refDragPreview));

    return (
        <TodoBox
            id={`todoItem${props.item.key}`}
            role="listitem"
            isDragging={isDragging}
            deleteItem={() => props.deleteItem(item.key)}
            labels={item.labels}
            toggleLabel={(label) => props.toggleLabel(item.key, label)}
            drag={refDrag}
            dragPreview={refDragPreview}
            dataHandlerId={handlerId}
        >
            <input
                aria-label={item.status ? "Mark as in-progress" : "Mark as finished"}
                className="flex-none h-4 w-5 mx-4 outline outline-2 outline-transparent focus:outline-blue-500 dark:focus:outline-blue-400"
                type="checkbox"
                checked={item.status}
                onChange={(event) => props.setItemStatus(item.key, event.target.checked)}
            />
            <span
                className={`flex-1 text-zinc-700 dark:text-gray-400 font-medium text-base tablet:text-lg ${expanded ? 'text-justify py-0.5' : 'truncate'}`}
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
                onClick={device.mobile ? () => setExpanded((value) => !value) : null}
            >
                {item.description}
            </span>
            {
                item.labels.map((color, index) => {
                    return (
                        <span key={index} className="flex-none w-5">
                            <UI.Tag color={color} />
                        </span>
                    );
                })
            }
        </TodoBox>
    );
}

export default TodoItem;