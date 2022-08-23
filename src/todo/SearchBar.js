import React from 'react';
import '../index.css';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/**
 * A component that allows the user to search for a phrase or filter by label.
 */
function SearchBar(props) {
    return (
        <div className="flex flex-none w-full h-12 mb-2 items-start space-x-2">
            <input
                tabIndex="0"
                aria-label="Search list"
                className="flex-1 w-full h-full p-2 px-3 text-lg hover:drop-shadow-sm dark:text-gray-400 dark:bg-slate-700 rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 focus:outline-blue-500 dark:outline-gray-600 dark:hover:outline-slate-400 dark:focus:outline-blue-400"
                type="search"
                placeholder="Search..."
                onChange={(event) => props.onSearch(event.target.value)}
            />
            <UI.PopupMenu Button={UI.FilterButton}>
                {
                    LABELS.map((color) => {
                        const checked = color === props.filter;
                        return <UI.LabelButton
                            key={color}
                            role="menuitemradio"
                            aria-label={`Filter by ${color} label`}
                            aria-checked={checked}
                            color={color}
                            faded={!checked}
                            onClick={() => props.onFilter(color !== props.filter ? color : null)}
                        />;
                    })
                }
                <UI.CancelButton
                    role="menuitem"
                    className="ml-2 mr-2 my-1"
                    onClick={() => props.onFilter(null)}
                />
            </UI.PopupMenu>
        </div>
    );
}

export default SearchBar;