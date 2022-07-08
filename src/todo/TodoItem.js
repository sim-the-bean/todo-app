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
    (props) => <UI.MenuButton className={`${props.className ?? ''} ${props.popup ? "mr-2" : ""}`} popup={props.popup} onClick={props.onClick} />,
    (props) => {
        const popup = props.popup;
        return (
            <popup.Parent className="relative h-9 p-2 bg-zinc-50 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300">
                <UI.ReorderButton onMouseDown={props.onDragDown} onMouseUp={props.onDragUp} />
                {props.children}
                <popup.Wrapper>
                    <popup.PopupButton />
                    {
                        popup.showPopup && <popup.PopupMenu className="h-9 p-2 -ml-2 -mt-2">
                            <popup.PopupButton popup />
                            {
                                LABELS.map((color) => (
                                    <UI.LabelButton
                                        key={color}
                                        color={color}
                                        faded={!props.labels.includes(color)}
                                        onClick={() => props.toggleLabel(color)}
                                    />
                                ))
                            }
                            {props.deleteItem && <UI.DeleteButton className="ml-2" onClick={props.deleteItem} />}
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
            deleteItem={() => props.deleteItem(item.key)}
            labels={item.labels}
            toggleLabel={(label) => props.toggleLabel(item.key, label)}
            onDragDown={props.onDragDown}
            onDragUp={props.onDragUp}
        >
            <input
                className="flex-none w-5 mx-4 rounded-md"
                type="checkbox"
                checked={item.status}
                onChange={(event) => props.setItemStatus(item.key, event.target.checked)}
            />
            <span className="flex-1 text-zinc-700 font-medium">{item.description}</span>
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