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
            className={`my-1 ${props.className ?? ''} ${props.popup ? "mr-2" : ""}`}
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
            <popup.Parent className="relative h-12 p-2 mt-4 mb-3 bg-zinc-50 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300">
                <UI.AddItemButton className="mr-4 ml-1 my-1" onClick={addNew} />
                <input
                    tabindex="0"
                    aria-label="New item description"
                    className="flex-1 py-1 px-3 text-lg rounded-lg outline outline-2 outline-transparent hover:outline-zinc-200 outline-offset-0"
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
                    <popup.PopupButton className="ml-2" />
                    {
                        popup.showPopup && <popup.PopupMenu className="h-12 p-2 -ml-1 -mt-2">
                            <popup.PopupButton className="ml-1" popup />
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