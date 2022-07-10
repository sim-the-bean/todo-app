import React from 'react';
import '../index.css';
import * as UI from '../ui/ui';
import LABELS from '../misc/labels';

/**
 * A component that allows the user to search for a phrase or filter by label.
 */
const SearchBar = UI.withPopupMenu(
    (props) => {
        const classNameDefault = "flex-none h-full w-12 ml-2 p-2 pl-3 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-400 focus:outline-blue-500";
        const classNamePopup = "mr-2 ml-1 mb-1outline outline-2 outline-transparent focus:outline-blue-500";
        return <UI.FilterButton
            aria-haspopup={props['aria-haspopup']}
            aria-expanded={props['aria-expanded']}
            aria-checked={props['aria-checked']}
            className={`${props.className ?? ''} ${props.popup ? classNamePopup : classNameDefault}`}
            popup={props.popup}
            onClick={props.onClick}
        />;
    },
    (props) => {
        const popup = props.popup;
        return (
            <popup.Parent className="h-10">
                <input
                    tabIndex="0"
                    aria-label="Search list"
                    className="flex-1 h-full p-2 px-3 text-lg hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-400 focus:outline-blue-500"
                    type="search"
                    placeholder="Search..."
                    onChange={(event) => props.onSearch(event.target.value)}
                />
                <popup.Wrapper className="h-full">
                    <popup.PopupButton aria-label="Toggle filter menu" />
                    {
                        popup.showPopup && <popup.PopupMenu className="h-10 p-2 pt-3 ml-2">
                            <popup.PopupButton aria-label="Toggle filter menu" popup />
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
                        </popup.PopupMenu>
                    }
                </popup.Wrapper>
            </popup.Parent>
        );
    },
);

export default SearchBar;