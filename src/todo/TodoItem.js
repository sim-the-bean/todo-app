import React, { useState, useRef, useMemo, useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../index.css';
import { DeviceContext } from '../App';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

/** 
 * A component that represents a new item to be added to the list.
 * @param {{item: Item, name: string, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, setOrder: (key: number, otherKey: number) => void}} props 
 */
function TodoItem(props) {
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

    const className = "flex flex-auto w-0 items-start space-x-1 p-2 bg-zinc-50 dark:bg-gray-800 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 dark:outline-gray-700 dark:hover:outline-slate-600";

    return (
        <div className="flex flex-none w-full items-start space-x-2">
            <div
                ref={refDragPreview}
                data-handler-id={handlerId}
                className={isDragging ? `${className} opacity-40` : className}
            >
                <UI.ReorderButton className="ml-1 my-1" drag={refDrag} isDragging={isDragging} />
                <input
                    aria-label={item.status ? "Mark as in-progress" : "Mark as finished"}
                    className="flex-none h-4 w-5 mx-4 my-2 outline outline-2 outline-transparent focus:outline-blue-500 dark:focus:outline-blue-400"
                    type="checkbox"
                    checked={item.status}
                    onChange={(event) => props.setItemStatus(item.key, event.target.checked)}
                />
                <span
                    className={`text-zinc-700 dark:text-gray-400 font-medium text-base tablet:text-lg py-0.5 ${expanded ? 'text-justify' : 'truncate'}`}
                    onMouseEnter={() => setExpanded(true)}
                    onMouseLeave={() => setExpanded(false)}
                    onClick={device.mobile ? () => setExpanded((value) => !value) : null}
                >
                    {item.description}
                </span>
                <div className="flex flex-1 w-full justify-end my-1 space-x-1">
                    {
                        item.labels.map((color, index) => {
                            return (
                                <span key={index} className="flex-none mr-1 w-5">
                                    <UI.Tag color={color} />
                                </span>
                            );
                        })
                    }
                </div>
            </div>
            <UI.PopupMenu Button={UI.MenuButton}>
                {
                    LABELS.map((color) => {
                        const checked = item.labels.includes(color);
                        return <UI.LabelButton
                            key={color}
                            role="menuitemcheckbox"
                            aria-label={`Toggle ${color} label`}
                            aria-checked={checked}
                            color={color}
                            faded={!checked}
                            onClick={() => props.toggleLabel(item.key, color)}
                        />;
                    })
                }
                <UI.DeleteButton
                    role="menuitem"
                    className="ml-2 mr-2 my-1"
                    onClick={() => props.deleteItem(item.key)}
                />
            </UI.PopupMenu>
        </div>
    );
}

export default TodoItem;