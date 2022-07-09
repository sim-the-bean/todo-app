import React from 'react';
import '../index.css';
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
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={`my-1 ${props.className ?? ''} ${props.popup ? "mr-2" : ""}`}
            popup={props.popup}
            onClick={props.onClick} />
    ),
    (props) => {
        const popup = props.popup;
        return (
            <popup.Parent
                role={props.role}
                className="relative h-12 p-2 bg-zinc-50 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-300"
            >
                <UI.ReorderButton className="ml-1 my-1" onMouseDown={props.onDragDown} onMouseUp={props.onDragUp} />
                {props.children}
                <popup.Wrapper>
                    <popup.PopupButton className="ml-2" />
                    {
                        popup.showPopup && <popup.PopupMenu className="h-12 p-2 -ml-1 -mt-2">
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
                                        onClick={() => props.toggleLabel(color)}
                                    />;
                                })
                            }
                            <UI.DeleteButton
                                role="menuitem"
                                className="ml-2 mr-2 my-1"
                                onClick={props.deleteItem}
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
 * @param {{item: Item, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, onDragDown: () => void, onDragUp: () => void}} props 
 */
export function TodoItem(props) {
    const item = props.item;

    return (
        <TodoBox
            id={`todoItem${props.item.key}`}
            role="listitem"
            deleteItem={() => props.deleteItem(item.key)}
            labels={item.labels}
            toggleLabel={(label) => props.toggleLabel(item.key, label)}
            onDragDown={props.onDragDown}
            onDragUp={props.onDragUp}
        >
            <input
                aria-label={item.status ? "Mark as in-progress" : "Mark as finished"}
                className="flex-none h-4 w-5 mx-4"
                type="checkbox"
                checked={item.status}
                onChange={(event) => props.setItemStatus(item.key, event.target.checked)}
            />
            <span className="flex-1 text-zinc-700 font-medium text-lg">{item.description}</span>
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