import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import "./index.css";
import { PlusCircleIcon, MenuIcon, PencilIcon, TrashIcon, SelectorIcon, TagIcon as TagIconOutline, XIcon } from '@heroicons/react/outline'
import { TagIcon as TagIconSolid, ExternalLinkIcon } from '@heroicons/react/solid'

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

/** 
 * A mapping from label colour to the unicode character that represents that label.
 * @type {{Label: {style: string, faded: string}}}
 * @readonly 
 */
const TAG_STYLES = {
    red: {
        style: "flex-none h-5 text-red-600",
        faded: "flex-none h-5 text-red-400 hover:text-red-600",
    },
    green: {
        style: "flex-none h-5 text-green-600",
        faded: "flex-none h-5 text-lime-200 hover:text-green-600",
    },
    blue: {
        style: "flex-none h-5 text-sky-600",
        faded: "flex-none h-5 text-blue-300 hover:text-sky-600",
    },
    yellow: {
        style: "flex-none h-5 text-amber-400",
        faded: "flex-none h-5 text-orange-200 hover:text-amber-400",
    },
};

/**
 * List of labels that are presented to the user.
 * @type {Label[]}
 * @readonly 
 */
const LABELS = ['red', 'green', 'blue', 'yellow'];

/** @readonly */
const TODO_COOKIE = 'todoList';

/** @readonly */
const ORDER_COOKIE = 'todoOrder';

/** @readonly */
const CONSENT_COOKIE = 'essentialCookiesConsent';

const _cookies = {
    /**
     * @private
     */
    ctx: Cookies.withAttributes({ expires: 365, path: '', sameSite: 'Lax' }),
    /**
     * @param {string} name 
     * @return {?any}
     */
    get: function (name) {
        const value = this.ctx.get(name);
        if (!value) {
            return null;
        }
        return JSON.parse(value);
    },
    /**
     * @param {string} name 
     * @param {any} value
     */
    set: function (name, value) { this.ctx.set(name, JSON.stringify(value)) },
};
/**
 * @type {React.Context<?{get: (name: string) => ?any, set: (name: string, value: any) => void}>}
 */
const CookieContext = React.createContext(null);

/**
 * @param {{label: Label, faded: bool}} props
 */
function Tag(props) {
    return <TagIconSolid className={props.faded ? TAG_STYLES[props.color].faded : TAG_STYLES[props.color].style} />;
}

/** @param {{color: ?string, className: ?string}} props */
function HorizontalDivider(props) {
    return <div className={`w-3/5 place-self-center outline outline-1 outline-${props.color || 'zinc-200'} ${props.className || ''}`}></div>;
}

/** 
 * A component that adds a new item to the list when clicked.
 * @param {{onClick: () => void, className: ?string}} props 
 */
function AddItemButton(props) {
    return <button onClick={props.onClick}>
        <PlusCircleIcon className={`flex-none h-5 text-slate-400 hover:text-slate-900 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that deletes the selected item when clicked.
 * @param {{onClick: () => void, className: ?string}} props 
 */
function DeleteButton(props) {
    return <button onClick={props.onClick}>
        <TrashIcon className={`flex-none h-5 text-red-800 hover:text-red-500 ${props.className || ''}`} />
    </button>;
}

/** 
 * A generic component to represent cancel.
 * @param {{onClick: () => void, className: ?string}} props 
 */
function CancelButton(props) {
    return <button onClick={props.onClick}>
        <XIcon className={`flex-none h-5 text-red-800 hover:text-red-500 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that edits the selected item when clicked. Unused.
 * @param {{onClick: () => void, className: ?string}} props 
 */
function EditButton(props) {
    return <button onClick={props.onClick}>
        <PencilIcon className={`flex-none h-5 text-blue-300 hover:text-sky-700 ${props.className || ''}`} />
    </button>;
}

/** 
 * A component that toggles a label on the selected item when clicked.
 * @param {{faded: bool, color: Label, onClick: (color: Label) => void}} props 
 */
function LabelButton(props) {
    let className;

    if (props.faded) {
        className = "scale-75 translate-y-1 transition ease-in-out delay-150 hover:scale-125 hover:translate-y-0 hover:animate-pulse";
    } else {
        className = "transition ease-in-out delay-50 hover:scale-110 hover:animate-pulse";
    }

    return <button className={className} onClick={() => props.onClick(props.color)}>
        <Tag faded={props.faded} color={props.color} />
    </button>;
}

/** 
 * A component that opens or closes the side menu on each item.
 * @param {{sideMenu: bool, onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: bool) => void, className: ?string}} props 
 */
function MenuButton(props) {
    return <button className={`${props.sideMenu ? 'mr-2' : ''} ${props.className || ''}`} onClick={(event) => props.onClick(event, !props.sideMenu)}>
        <MenuIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
    </button>;
}

/** 
 * A component that opens or closes the tag filter menu.
 * @param {{sideMenu: bool, onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, value: bool) => void, className: ?string}} props 
 */
function FilterButton(props) {
    return <button className={`${props.sideMenu ? 'mr-2' : ''} ${props.className || ''}`} onClick={(event) => props.onClick(event, !props.sideMenu)}>
        <TagIconOutline className="flex-none h-5 text-slate-400 hover:text-slate-900" />
    </button>;
}

/**
 * A component that reorders list items visually.
 * @param {{onMouseDown: () => void}} props 
 */
function ReorderButton(props) {
    return (
        <div className={`flex ${props.className}`}>
            <button className="accent-transparent" onMouseDown={props.onMouseDown}>
                <SelectorIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
            </button>
        </div>
    );
}

/**
 * Displays a floating cookie notice.
 * @param {{onClick: () => void}} props 
 */
function CookieNotice(props) {
    return (
        <div className="block absolute z-40 place-self-center left-16 bottom-16 w-1/3 p-4 space-y-4 bg-zinc-100 rounded-3xl outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0">
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
 * @param {{onSearch: (text: string) => void, filter: ?Label, onFilter: (label: ?Label) => void}} props 
 */
function SearchBar(props) {
    const [showMenu, setShowMenu] = useState(false);
    const timeout = useRef(null);

    const showTagMenu = (event, value) => {
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
        <div className="flex items-center w-full space-x-1" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <input
                className="flex-1 h-8 p-2 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
                type="search"
                placeholder="Search..."
                onChange={(event) => props.onSearch(event.target.value)}
            />
            <div className="flex static">
                <FilterButton
                    className="flex-none h-8 w-9 ml-2 p-2 hover:drop-shadow-sm rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
                    onClick={showTagMenu}
                />
                {
                    showMenu && <TagMenu
                        selected={props.filter}
                        selectLabel={(label) => props.onFilter(label === props.filter ? null : label)}
                        showTagMenu={showTagMenu}
                    />
                }
            </div>
        </div>
    );
}

/**
 * A component that represents the set of actions that can be performed to edit an existing item or an item being created.
 * @param {{selected: ?Label, selectLabel: (label: Label) => void, showTagMenu: (value: bool) => void}} props 
 */
function TagMenu(props) {
    return <div className="absolute z-10 flex items-center h-8 p-2 pt-3 ml-2 space-x-1 bg-zinc-200 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300">
        <FilterButton sideMenu onClick={props.showTagMenu} />
        {LABELS.map((color) => <LabelButton key={color} color={color} faded={color !== props.selected} onClick={props.selectLabel} />)}
        <CancelButton className="ml-1" onClick={() => props.selectLabel(null)} />
    </div>;
}

/**
 * A component that represents the set of actions that can be performed to edit an existing item or an item being created.
 * @param {{labels: Label[], editItem: () => void, deleteItem: () => void, toggleLabel: (label: Label) => void, showSideMenu: () => void}} props 
 */
function SideMenu(props) {
    return <div className="absolute z-10 flex items-center h-9 p-2 -ml-2 -mt-2 space-x-1 bg-zinc-200 hover:drop-shadow-lg rounded-lg outline outline-2 outline-zinc-300">
        <MenuButton sideMenu onClick={props.showSideMenu} />
        {LABELS.map((color) => <LabelButton key={color} color={color} faded={!props.labels.includes(color)} onClick={props.toggleLabel} />)}
        {props.editItem && <EditButton className="ml-2" onClick={props.editItem} />}
        {props.deleteItem && <DeleteButton className={props.editItem ? "" : "ml-2"} onClick={props.deleteItem} />}
    </div>;
}

/** 
 * A wrapper component that represents an existing item on the todo list or a new item.
 * @param {{showMenu: bool, showSideMenu: () => void, labels: Label[], editItem: ?() => void, deleteItem: ?() => void, toggleLabel: (label: Label) => void, onDragDown: ?() => void, className: ?string}} props 
 */
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
            {props.onDragDown && <ReorderButton onMouseDown={props.onDragDown} />}
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
 * @param {{addNewItem: (description: string, labels: Label[]) => void}} props 
 */
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
 * @param {{item: Item, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void, onDragDown: () => void}} props 
 */
function TodoItem(props) {
    const item = props.item;

    return (
        <TodoBox
            deleteItem={() => props.deleteItem(item.key)}
            labels={item.labels}
            toggleLabel={(label) => props.toggleLabel(item.key, label)}
            onDragDown={props.onDragDown}
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
                            <Tag color={color} />
                        </span>
                    );
                })
            }
        </TodoBox>
    );
}

/**
 * A wrapper component to represent a list of re-orderable buttons.
 * @param {{list: Item[], name: string}} props
 */
function TodoSection(props) {
    const cookies = useContext(CookieContext);
    const order_cookie = useMemo(() => `${ORDER_COOKIE}-${props.name}`, [props.name]);

    const [ordering, setOrdering] = useState(() => {
        const ordering = cookies?.get(order_cookie);
        if (ordering) {
            return ordering.map((key) => ({ key, draggable: false }));
        } else {
            return props.list.map((item) => ({ key: item.key, draggable: false }));
        }
    });
    const [dragging, setDragging] = useState(null);

    useEffect(
        () => cookies?.set(order_cookie, ordering.map(({ key }) => key)),
        [ordering, cookies, order_cookie],
    );

    useLayoutEffect(
        () => {
            setOrdering((ordering) => {
                return ordering
                    .filter((ord) => props.list.some((item) => item.key === ord.key))
                    .concat(props.list
                        .filter((item) => ordering.every((ord) => item.key !== ord.key))
                        .map((item) => ({ key: item.key, draggable: false })));
            });
        },
        [props.list],
    );

    /** 
     * @param {string} field
     * @return {(key: number, value: any) => void}
     */
    const setOrderableField = (field) => (key, value) => {
        const index = ordering.findIndex((ord) => ord.key === key);
        const newOrdering = ordering.slice();
        newOrdering[index] = { ...ordering[index], [field]: value };
        setOrdering(newOrdering);
    }

    const setDraggable = setOrderableField('draggable');

    /** 
     * @param {number} key
     * @return {number}
     */
    const getOrder = (key) => ordering.findIndex((ord) => ord.key === key);
    /** 
     * @param {number} key
     * @param {number} newIndex
     */
    const setOrder = (key, newIndex) => {
        const oldIndex = ordering.findIndex((ord) => ord.key === key);

        if (newIndex < oldIndex) {
            setOrdering([
                ...ordering.slice(0, newIndex),
                ordering[oldIndex],
                ...ordering.slice(newIndex, oldIndex),
                ...ordering.slice(oldIndex + 1),
            ]);
        } else if (newIndex > oldIndex) {
            setOrdering([
                ...ordering.slice(0, oldIndex),
                ...ordering.slice(oldIndex + 1, newIndex + 1),
                ordering[oldIndex],
                ...ordering.slice(newIndex + 1),
            ]);
        }
    };

    const list = useMemo(
        () => ordering
            .map((order) => [props.list.find((item) => item.key === order.key), order])
            .filter(([item]) => item),
        [ordering, props.list],
    );

    return (
        <div
            className="grid grid-cols-1 gap-2 w-full justify-center my-2"
            onDragOver={(event) => {
                if (dragging) {
                    event.preventDefault();
                }
            }}
        >
            {
                list.map(([item, order]) => {
                    return (
                        <div
                            key={item.key}
                            className={order.draggable ? "opacity-40" : undefined}
                            draggable={order.draggable}
                            onDragStart={() => setDragging(item.key)}
                            onDragEnd={() => {
                                setDragging(null);
                                setDraggable(item.key, false);
                            }}
                            onDragOver={(event) => {
                                if (dragging) {
                                    const newIndex = getOrder(item.key);
                                    setOrder(dragging, newIndex);
                                    event.preventDefault();
                                }
                            }}
                        >
                            <TodoItem
                                key={item.key}
                                item={item}
                                setItemStatus={props.setItemStatus}
                                deleteItem={props.deleteItem}
                                toggleLabel={props.toggleLabel}
                                onDragDown={() => setDraggable(item.key, true)}
                            />
                        </div>
                    );
                })
            }
        </div>
    )
}

/** 
 * A component that represents all items on the list, sorts them by status, and filters and/or searches.
 * @param {{list: Item[], filter: {words: string[], label: ?Label}, addNewItem: (description: string, labels: Label[]) => void, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void}} props 
 */
function TodoList(props) {
    const filtered = props.list
        // filter by label
        .filter((item) => {
            return !props.filter.label || item.labels.includes(props.filter.label);
        })
        // filter by search
        .filter((item) => {
            const desc = item.description.toLowerCase();
            return props.filter.words.every((word) => desc.includes(word));
        });

    // checks if all items have the same 'status' flag
    const [allStatus] = filtered.reduce(([all, prev], item) => {
        if (!all) {
            return [false, null];
        } else if (prev === null) {
            return [all, item.status];
        } else {
            return [prev === item.status, item.status];
        }
    }, [true, null]);

    return (
        <div className="grid grid-cols-1 gap-1 w-full justify-center">
            <TodoNew addNewItem={props.addNewItem} />
            <TodoSection
                name="in-progress"
                list={filtered.filter((item) => !item.status)}
                setItemStatus={props.setItemStatus}
                deleteItem={props.deleteItem}
                toggleLabel={props.toggleLabel}
            />
            {!allStatus && <HorizontalDivider className="my-2" />}
            <TodoSection
                name="completed"
                list={filtered.filter((item) => item.status)}
                setItemStatus={props.setItemStatus}
                deleteItem={props.deleteItem}
                toggleLabel={props.toggleLabel}
            />
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

function TodoApp() {
    const cookies = useContext(CookieContext);

    const [todoList, setTodoList] = useState(() => cookies?.get(TODO_COOKIE) ?? []);
    const [filterWords, setFilterWords] = useState([]);
    const [filterLabel, setFilterLabel] = useState(null);

    const nextKey = useMemo(() => todoList.length === 0 ? 1 : todoList[todoList.length - 1].key + 1, [todoList]);

    useEffect(
        () => cookies?.set(TODO_COOKIE, todoList),
        [todoList, cookies]
    );

    /** 
     * @param {string} field
     * @return {(key: number, value: any) => void} */
    const setTodoField = (field) => (key, value) => {
        const index = todoList.findIndex((item) => item.key === key);
        const newList = todoList.slice();
        newList[index] = { ...todoList[index], [field]: value };
        setTodoList(newList);
    }

    const setTodoLabels = setTodoField('labels');

    return (
        <div className="grid grid-cols-1 justify-center columns-1 w-full min-h-screen bg-stone-50">
            <div className="flex-1 justify-self-center w-96 m-4 mt-16 mb-0 py-4 space-y-4">
                <Title />
                <SearchBar
                    onSearch={(text) => setFilterWords(text.toLowerCase().split(/\s+/))}
                    filter={filterLabel}
                    onFilter={(label) => setFilterLabel(label)}
                />
                <TodoList
                    list={todoList}
                    filter={{ words: filterWords, label: filterLabel }}
                    addNewItem={(description, labels) => {
                        const newList = todoList.slice();
                        newList.push({
                            key: nextKey,
                            description: description,
                            labels: labels,
                            status: false,
                        });
                        setTodoList(newList);
                    }}
                    deleteItem={(key) => {
                        const index = todoList.findIndex((item) => item.key === key);
                        setTodoList([...todoList.slice(0, index), ...todoList.slice(index + 1)]);
                    }}
                    setItemStatus={setTodoField('status')}
                    toggleLabel={(key, label) => {
                        const index = todoList.findIndex((item) => item.key === key);
                        const labels = todoList[index].labels;
                        if (labels.includes(label)) {
                            setTodoLabels(key, labels.filter((l) => l !== label));
                        } else {
                            setTodoLabels(key, [...labels, label]);
                        }
                    }}
                />
            </div>
            <div className="flex-1 place-self-center mt-2 p-4">
                <p className="flex-1 place-self-center text-justify text-md text-zinc-700 font-medium">
                    Copyright &copy; Simone Walter<br />
                    <a className="text-indigo-900 hover:text-indigo-600" href="https://github.com/soycan-sim/todo-app">
                        <ExternalLinkIcon className="inline h-4" />
                        soycan-sim/todo-app
                    </a>
                </p>
            </div>
        </div>
    );
}

function App() {
    const [cookiesAccepted, setCookiesAccepted] = useState(() => _cookies.get(CONSENT_COOKIE) === true);

    useEffect(
        () => {
            if (cookiesAccepted) {
                _cookies.set(CONSENT_COOKIE, true);
            }
        },
        [cookiesAccepted],
    );

    return (
        <CookieContext.Provider value={cookiesAccepted ? _cookies : null}>
            <TodoApp />
            {!cookiesAccepted && <CookieNotice onClick={() => setCookiesAccepted(true)} />}
        </CookieContext.Provider>
    );
}

export default App;
