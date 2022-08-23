import React, { useState } from 'react';
import '../index.css';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/**
 * A component that represents an existing item on the todo list.
 */
function TodoNew(props) {
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
        <div className="flex flex-none w-full h-12 mb-2 items-start space-x-2">
            <div className="flex flex-auto w-0 h-12 items-start space-x-1 p-2 bg-zinc-50 dark:bg-gray-800 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 dark:outline-gray-700 dark:hover:outline-slate-600">
                <UI.AddItemButton className="mr-4 ml-1 my-1" onClick={addNew} />
                <input
                    tabIndex="0"
                    aria-label="New item description"
                    className="flex-1 w-full h-full py-1 px-3 text-lg dark:text-gray-400 dark:bg-slate-700 rounded-lg outline outline-2 outline-transparent hover:outline-zinc-200 focus:outline-blue-500 dark:outline-gray-600 dark:hover:outline-slate-400 dark:focus:outline-blue-400"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === "Accept") {
                            addNew();
                        }
                    }}
                />
            </div>
            <UI.PopupMenu Button={UI.MenuButton}>
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
            </UI.PopupMenu>
        </div>
    );
}

export default TodoNew;