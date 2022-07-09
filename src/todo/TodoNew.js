import React, { useState } from 'react';
import '../index.css';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/**
 * A component that represents an existing item on the todo list.
 */
const TodoNew = UI.withPopupMenu(
    (props) => (
        <UI.MenuButton
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={`${props.className ?? ''} ${props.popup ? "mr-2" : ""}`}
            popup={props.popup}
            onClick={props.onClick} />
    ),
    (props) => {
        const popup = props.popup;

        const [description, setDescription] = useState('');
        const [labels, setLabels] = useState([]);

        const addNew = () => {
            // Don't add if the description is empty or only contains whitespaces.
            if (!description.match(/^\s*$/)) {
                props.addNewItem(description, labels);
                setDescription('');
                setLabels([]);
            }
        };

        return (
            <popup.Parent className="relative h-9 p-2 my-2 bg-zinc-50 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300">
                <UI.AddItemButton className="mr-4" onClick={addNew} />
                <input
                    tabindex="0"
                    aria-label="New item description"
                    className="flex-1 h-7 p-2 rounded-md outline outline-2 outline-transparent hover:outline-zinc-200 outline-offset-0"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    onKeyDown={(event) => {
                        if (!event.repeat && event.key === "Enter") {
                            addNew();
                        }
                    }}
                />
                <popup.Wrapper>
                    <popup.PopupButton />
                    {
                        popup.showPopup && <popup.PopupMenu className="h-9 p-2 -ml-2 -mt-2">
                            <popup.PopupButton popup />
                            {
                                LABELS.map((color) => {
                                    const checked = labels.includes(color);
                                    return <UI.LabelButton
                                        key={color}
                                        role="menuitemcheckbox"
                                        aria-label={`Toggle ${color} label`}
                                        aria-checked={checked}
                                        color={color}
                                        faded={!checked}
                                        onClick={() => {
                                            if (labels.includes(color)) {
                                                // A new set of labels with 'label' removed.
                                                setLabels(labels.filter((l) => l !== color));
                                            } else {
                                                setLabels([...labels, color]);
                                            }
                                        }}
                                    />;
                                })
                            }
                        </popup.PopupMenu>
                    }
                </popup.Wrapper>
            </popup.Parent>
        );
    },
);

export default TodoNew;