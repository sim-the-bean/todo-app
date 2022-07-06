import React, { useState, useMemo, useRef } from 'react';
import Cookies from 'js-cookie';
import "./index.css";
import { PlusCircleIcon, MenuIcon, PencilIcon, TrashIcon, ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/react/outline'

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

/** 
 * A mapping from label colour to the unicode character that represents that label.
 * @readonly */
const TAGS = {
    red: "\uD83D\uDD34",
    blue: "\uD83D\uDD35",
    orange: "\uD83D\uDFE0",
    yellow: "\uD83D\uDFE1",
    green: "\uD83D\uDFE2",
    purple: "\uD83D\uDFE3",
    brown: "\uD83D\uDFE4",
};

/**
 * List of labels that are presented to the user.
 * @readonly */
const LABELS = ['red', 'green', 'blue', 'yellow'];

/** @readonly */
const TODO_COOKIE = 'todoList';

/** @readonly */
const CONSENT_COOKIE = 'essentialCookiesConsent';

/** @todo Replace unicode characters with icons. */
function Tag(props) {
    return <>{TAGS[props.color]}</>;
}

/** @param {{color: ?string, className: ?string}} props */
function HorizontalDivider(props) {
    return <div className={`w-3/5 place-self-center outline outline-1 outline-${props.color || 'zinc-200'} ${props.className || ''}`}></div>;
}

/** 
 * A component that adds a new item to the list when clicked.
 * @param {{onClick: () => void, className: ?string}} props */
function AddItemButton(props) {
    return <button onClick={props.onClick}>
        <PlusCircleIcon className={`flex-none h-5 text-slate-400 hover:text-slate-900 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that deletes the selected item when clicked.
 * @param {{onClick: () => void, className: ?string}} props */
function DeleteButton(props) {
    return <button onClick={props.onClick}>
        <TrashIcon className={`flex-none h-5 text-red-900 hover:text-red-700 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that edits the selected item when clicked. Unused.
 * @param {{onClick: () => void, className: ?string}} props */
function EditButton(props) {
    return <button onClick={props.onClick}>
        <PencilIcon className={`flex-none h-5 text-blue-300 hover:text-sky-700 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that toggles a label on the selected item when clicked.
 * @param {{color: string, onClick: (color: string) => void}} props */
function LabelButton(props) {
    let className;

    if (props.active) {
        className = "transition ease-in-out delay-150 hover:scale-110 hover:animate-pulse";
    } else {
        className = "scale-75 translate-y-1 transition ease-in-out delay-150 hover:scale-125 hover:translate-y-0 hover:animate-pulse";
    }

    return <button className={className} onClick={() => props.onClick(props.color)}>
        <Tag color={props.color} />
    </button>;
}

/** 
 * A component that opens or closes the side menu on each item.
 * @param {{sideMenu: bool, onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: bool) => void, className: ?string}} props */
function MenuButton(props) {
    return <button className={props.sideMenu ? "mr-2" : ""} onClick={(event) => props.onClick(event, !props.sideMenu)}>
        <MenuIcon className={`flex-none h-5 text-slate-400 hover:text-slate-900 ${props.className || ''}`} />
    </button>;
}

/**
 * A component that reorders list items visually.
 * @param {{onClick: (direction: 'up'|'down') => void}} props */
function ReorderButton(props) {
    return (
        <div className="flex">
            <button className="accent-transparent" onClick={() => props.onClick('up')}>
                <ArrowNarrowUpIcon className="flex-none h-5 -ml-1 -mt-1 text-slate-400 hover:text-slate-900" />
            </button>
            <button className="accent-transparent" onClick={() => props.onClick('down')}>
                <ArrowNarrowDownIcon className="flex-none h-5 -ml-1 -mb-1 text-slate-400 hover:text-slate-900" />
            </button>
        </div>
    );
}

/**
 * Displays a floating cookie notice.
 * @param {{onClick: () => void}} props */
function CookieNotice(props) {
    return (
        <div className="block absolute z-40 bottom-8 w-1/3 p-4 space-y-4 bg-zinc-100 rounded-3xl outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0">
            <h1 className="block font-mono font-semibold text-3xl text-zinc-800">Cookie Notice</h1>
            <p className="block text-justify text-lg">
                We use cookies necessary for proper function of this website. They don't contain
                any personal data other than what you enter in the forms on this site, and they
                are never accessible to parties other than yourself. <br />
                By clicking the button below, you consent to the use of cookies by this website
                and this notice won't appear again.
            </p>
            <div className="flex items-center justify-center w-full">
                <button
                    className="flex-none place-self-center h-9 py-1 px-3 bg-zinc-50 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
                    onClick={props.onClick}
                >
                    <span className="hover:font-semibold">Accept essential cookies</span>
                </button>
            </div>
        </div>
    );
}

/** 
 * A component that allows the user to search for a phrase or filter by label.
 * @param {{type: string, onSearch: (text: string) => void, onFilter: (label: ?Label) => void}} props */
function SearchBar(props) {
    return (
        <div className="flex items-center w-full space-x-1">
            <input
                className="flex-1 h-8 p-2 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
                type={props.type || "text"}
                placeholder="Search..."
                onChange={(event) => props.onSearch(event.target.value)}
            />
            <select
                className="flex-none h-9 w-12 hover:drop-shadow-sm rounded-lg bg-zinc-200 hover:bg-gray-300"
                name="tags"
                id="tags"
                onChange={(event) => props.onFilter(event.target.value === 'none' ? null : event.target.value)}
            >
                {
                    ['none', ...LABELS].map((color, index) => {
                        return <option value={color} key={index}>
                            {color !== 'none' && <Tag color={color} />}
                        </option>;
                    })
                }
            </select>
        </div>
    );
}

/**
 * A component that represents the set of actions that can be performed to edit an existing item or an item being created.
 * @param {{labels: string[], editItem: () => void, deleteItem: () => void, toggleLabel: () => void, showSideMenu: () => void}} props */
function SideMenu(props) {
    return <div className="absolute z-10 flex items-center h-9 p-2 -ml-2 -mt-2 space-x-1 bg-zinc-200 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300">
        <MenuButton sideMenu onClick={props.showSideMenu} />
        {LABELS.map((color) => <LabelButton key={color} color={color} active={props.labels.includes(color)} onClick={props.toggleLabel} />)}
        {props.editItem && <EditButton className="ml-2" onClick={props.editItem} />}
        {props.deleteItem && <DeleteButton onClick={props.deleteItem} />}
    </div>;
}

/** 
 * A wrapper component that represents an existing item on the todo list or a new item.
 * @param {{showMenu: bool, showSideMenu: () => void, labels: Label[], editItem: ?() => void, deleteItem: ?() => void, toggleLabel: () => void, setTodoOrdering: ?(direction: 'up'|'down') => void, className: ?string}} props */
function TodoBox(props) {
    const [showMenu1, setShowMenu1] = useState(false);
    const timeout = useRef(null);

    // The 'show menu' state can be overriden by the parent component.
    // If this is the case, the state is still updated on this component, but it's not used.
    const showMenu = props.showMenu !== undefined ? props.showMenu : showMenu1;
    const setShowMenu = (value) => {
        if (props.showSideMenu) {
            props.showSideMenu(value);
        }
        setShowMenu1(value);
    };

    const className = `relative flex items-center w-full h-9 p-2 space-x-1 bg-zinc-50 \
        hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 \
        outline-offset-0 ${props.className || ''}`;

    const showSideMenu = (event, value) => {
        setShowMenu(value);
        event.preventDefault();
    };

    // If the mouse leaves the box (not the side menu), we disappear the box after 1 second.
    // If during this time the mouse re-enters the box, we clear the timeout.
    const onMouseLeave = () => timeout.current = setTimeout(() => setShowMenu(false), 1000);
    const onMouseEnter = () => {
        if (timeout.current) {
            clearTimeout(timeout.current);
            timeout.current = null;
        }
    };

    return (
        <div className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {props.setTodoOrdering && <ReorderButton onClick={props.setTodoOrdering} />}
            {props.children}
            <div className="flex static">
                <MenuButton onClick={showSideMenu} />
                {showMenu && <SideMenu {...props} showSideMenu={showSideMenu} />}
            </div>
        </div>
    );
}

/** 
 * A component that represents an existing item on the todo list.
 * @param {{addNewItem: (description: string, labels: Label[]) => void}} props */
function TodoNew(props) {
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState([]);
    const [showMenu, setShowMenu] = useState(false);

    const addNew = () => {
        // Don't add if the description is empty or only contains whitespaces.
        if (!description.match(/^\s*$/)) {
            props.addNewItem(description, labels);
            setDescription('');
            setLabels([]);
            setShowMenu(false);
        }
    };

    return (
        <TodoBox
            className="my-2"
            showMenu={showMenu}
            showSideMenu={setShowMenu}
            labels={labels}
            toggleLabel={(label) => {
                if (labels.includes(label)) {
                    // A new set of labels with 'label' removed.
                    setLabels(labels.filter((l) => l !== label));
                } else {
                    setLabels([...labels, label]);
                }
            }}
        >
            <AddItemButton className="mr-4" onClick={addNew} />
            <input
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
        </TodoBox>
    );
}

/** 
 * A component that represents a new item to be added to the list.
 * @param {{item: Item, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, setTodoOrdering: (key: number, direction: 'up'|'down') => void}} props */
function TodoItem(props) {
    const item = props.item;

    return (
        <TodoBox
            deleteItem={() => props.deleteItem(item.key)}
            labels={item.labels}
            toggleLabel={(label) => props.toggleLabel(item.key, label)}
            setTodoOrdering={(direction) => props.setTodoOrdering(item.key, direction)}
        >
            <input
                className="flex-none w-5 mx-4 rounded-md"
                type="checkbox"
                checked={item.status}
                onChange={(event) => props.setItemStatus(item.key, event.target.checked)}
            />
            <span className="flex-1">{item.description}</span>
            {
                item.labels.map((color, index) => {
                    return (
                        <span key={index} className="flex-none w-5">
                            <Tag color={color} />
                        </span>
                    );
                })
            }
        </TodoBox>
    );
}

/** 
 * A component that represents all items on the list, sorts them by status, and filters and/or searches.
 * @param {{list: Map<number, Item>, filter: {words: string[], label: ?Label}, addNewItem: (description: string, labels: Label[]) => void, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, setTodoOrdering: (key: number, direction: 'up'|'down') => void}} props */
function TodoList(props) {
    const items = new Array(...props.list.values());
    const filtered = items
        // filter by label
        .filter((item) => {
            return !props.filter.label || item.labels.includes(props.filter.label);
        })
        // filter by search
        .filter((item) => {
            const desc = item.description.toLowerCase();
            return props.filter.words.every((word) => desc.includes(word));
        })
        .sort((a, b) => a.order - b.order)
        .map((item) => {
            return [
                item,
                <TodoItem
                    key={item.key}
                    item={item}
                    setItemStatus={props.setItemStatus}
                    deleteItem={props.deleteItem}
                    toggleLabel={props.toggleLabel}
                    setTodoOrdering={props.setTodoOrdering}
                />
            ];
        });

    // checks if all items have the same 'status' flag
    const [allStatus] = filtered.reduce(([all, prev], [item]) => {
        if (!all) {
            return [false, null];
        } else if (prev === null) {
            return [all, item.status];
        } else {
            return [prev === item.status, item.status];
        }
    }, [true, null]);

    return (
        <div className="grid grid-cols-1 gap-2 w-full justify-center">
            <TodoNew addNewItem={props.addNewItem} />
            {
                // items in progress
                filtered
                    .filter(([item, _]) => !item.status)
                    .map(([_, element]) => element)
            }
            {!allStatus && <HorizontalDivider className="my-4" />}
            {
                // completed items
                filtered
                    .filter(([item, _]) => item.status)
                    .map(([_, element]) => element)
            }
        </div>
    );
}

function Title() {
    return <h1 className="font-mono font-semibold text-3xl text-zinc-800">
        Todo
        <span className="animate-pulse">
            <span className="text-zinc-600">
                .
            </span>
            <span className="text-zinc-500">
                .
            </span>
            <span className="text-zinc-400">
                .
            </span>
        </span>
    </h1>;
}

function App() {
    const [cookiesAccepted, setCookiesAccepted1] = useState(() => Cookies.get(CONSENT_COOKIE) === '1');

    const [todoList, setTodoList1] = useState(() => {
        const todoList = Cookies.get(TODO_COOKIE);
        if (todoList) {
            return new Map(JSON.parse(todoList));
        } else {
            return new Map();
        }
    });
    const [filterWords, setFilterWords] = useState([]);
    const [filterLabel, setFilterLabel] = useState(null);

    const nextKey = useMemo(() => {
        let max = 0;
        for (const key of todoList.keys()) {
            if (key > max) {
                max = key;
            }
        }
        return max + 1;
    }, [todoList]);

    /** @param {Map<number, Item>} list */
    const setTodoList = (list) => {
        setTodoList1(list);
        if (cookiesAccepted) {
            Cookies.set(TODO_COOKIE, JSON.stringify(new Array(...list.entries())), { expires: 365, path: '', sameSite: 'Lax' });
        }
    };

    /** @param {bool} value */
    const setCookiesAccepted = (value) => {
        setCookiesAccepted1(value);
        if (value) {
            Cookies.set(CONSENT_COOKIE, '1', { expires: 365, path: '', sameSite: 'Lax' });
        }
    };

    /** 
     * @param {string} field
     * @return {(key: number, value: any) => void} */
    const setTodoField = (field) => (key, value) => {
        const newList = new Map(todoList.entries());
        newList.set(key, { ...newList.get(key), [field]: value });
        setTodoList(newList);
    }

    const setTodoLabels = setTodoField('labels');

    /** 
     * @param {number} key
     * @param {'up'|'down'} direction */
    const setTodoOrdering = (key, direction) => {
        const newList = new Map(todoList.entries());

        const self = newList.get(key);
        let other = null;

        switch (direction) {
            case 'up':
                // search for the item with the highest ordering that's less than 'self' ordering
                for (const item of todoList.values()) {
                    // only consider items with the same status
                    if (item.status === self.status && item.order < self.order) {
                        if (!other || item.order > other.order) {
                            other = item;
                        }
                    }
                }
                break;
            case 'down':
                // search for the item with the lowest ordering that's greater than 'self' ordering
                for (const item of todoList.values()) {
                    if (item.status === self.status && item.order > self.order) {
                        if (!other || item.order < other.order) {
                            other = item;
                        }
                    }
                }
                break;
            default:
                break;
        }

        // swap if possible
        if (other) {
            newList.set(self.key, { ...self, order: other.order });
            newList.set(other.key, { ...other, order: self.order });
        }

        setTodoList(newList);
    }

    return (
        <div className="flex justify-center w-full h-screen bg-stone-50">
            <div className="flex-none place-self-center w-96 h-3/4 space-y-4">
                <Title />
                <SearchBar
                    onSearch={(text) => setFilterWords(text.toLowerCase().split(/\s+/))}
                    onFilter={(label) => setFilterLabel(label)}
                />
                <TodoList
                    list={todoList}
                    filter={{ words: filterWords, label: filterLabel }}
                    addNewItem={(description, labels) => {
                        const newList = new Map(todoList.entries());
                        newList.set(nextKey, {
                            key: nextKey,
                            order: todoList.size,
                            description: description,
                            labels: labels,
                            status: false,
                        });
                        setTodoList(newList);
                    }}
                    deleteItem={(key) => {
                        const newList = new Map(todoList.entries());
                        newList.delete(key);
                        setTodoList(newList);
                    }}
                    setItemStatus={setTodoField('status')}
                    toggleLabel={(key, label) => {
                        const labels = todoList.get(key).labels;
                        if (labels.includes(label)) {
                            setTodoLabels(key, labels.filter((l) => l !== label));
                        } else {
                            setTodoLabels(key, [...labels, label]);
                        }
                    }}
                    setTodoOrdering={setTodoOrdering}
                />
            </div>
            {!cookiesAccepted && <CookieNotice onClick={() => setCookiesAccepted(true)} />}
        </div>
    );
}

export default App;
