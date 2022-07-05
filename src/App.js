import React, { useState, useMemo, useRef } from 'react';
import Cookies from 'js-cookie';
import "./index.css";
import { SelectorIcon, PlusCircleIcon, MenuIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline'

const TAGS = {
    red: "\uD83D\uDD34",
    blue: "\uD83D\uDD35",
    orange: "\uD83D\uDFE0",
    yellow: "\uD83D\uDFE1",
    green: "\uD83D\uDFE2",
    purple: "\uD83D\uDFE3",
    brown: "\uD83D\uDFE4",
};

function Tag(props) {
    return <>{TAGS[props.color]}</>;
}

function SearchBar(props) {
    return (
        <div className="flex items-center w-full space-x-1">
            <input
                className="flex-1 h-8 p-2 rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
                type={props.type || "text"}
                placeholder="Search..."
                onChange={props.onChange}
            />
            <select
                className="flex-none h-9 w-12 rounded-lg bg-zinc-200 hover:bg-gray-300"
                name="tags"
                id="tags"
                onChange={props.onSelect}
            >
                {
                    ['none', 'red', 'green', 'blue', 'yellow'].map((color, index) => {
                        return <option value={color} key={index}>
                            {color !== 'none' && <Tag color={color} />}
                        </option>;
                    })
                }
            </select>
        </div>
    );
}

function TodoBox(props) {
    const [showMenu1, setShowMenu1] = useState(false);
    const timeout = useRef(null);

    const showMenu = props.showMenu !== undefined ? props.showMenu : showMenu1;
    const setShowMenu = (value) => {
        if (props.onShowMenu) {
            props.onShowMenu(value);
        }
        setShowMenu1(value);
    };

    const className = `relative flex items-center w-full h-9 p-2 space-x-1 bg-zinc-50 \
        rounded-lg outline outline-2 outline-zinc-200 hover:outline-slate-300 \
        outline-offset-0 ${props.className || ''}`;

    const onMenuShow = (value) => (event) => {
        setShowMenu(value);
        event.preventDefault();
    };

    const onMouseLeave = () => timeout.current = setTimeout(() => setShowMenu(false), 1000);
    const onMouseEnter = () => {
        if (timeout.current) {
            clearTimeout(timeout);
            timeout.current = null;
        }
    };

    return (
        <div className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {props.selectable && <SelectorIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />}
            {props.children}
            <div className="flex static">
                <button onClick={onMenuShow(true)}>
                    <MenuIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
                </button>
                {
                    showMenu && <div className="absolute z-10 flex items-center h-9 p-2 -ml-2 -mt-2 space-x-1 bg-zinc-200 rounded-lg outline outline-2 outline-zinc-400 hover:outline-slate-500">
                        <button onClick={onMenuShow(false)}>
                            <MenuIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
                        </button>
                        <button>
                            <PencilIcon className="flex-none h-5 text-blue-300 hover:text-sky-700" />
                        </button>
                        <button>
                            <TrashIcon className="flex-none h-5 text-red-900 hover:text-red-700" />
                        </button>
                    </div>
                }
            </div>
        </div>
    );
}

function TodoItem(props) {
    const item = props.item;

    return (
        <TodoBox selectable>
            <input
                className="flex-none w-5 mx-4 rounded-md"
                type="checkbox"
                checked={props.done}
                onChange={(event) => props.onDone(item.key, event.target.checked)}
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

function TodoNew(props) {
    const [description, setDescription] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    const addNew = () => {
        if (!description.match(/^\s*$/)) {
            props.onNew(description);
            setDescription('');
            setShowMenu(false);
        }
    };

    return (
        <TodoBox className="my-2" showMenu={showMenu} onShowMenu={setShowMenu}>
            <button onClick={addNew}>
                <PlusCircleIcon className="flex-none h-5 mr-4 text-slate-400 hover:text-slate-900" />
            </button>
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

function TodoList(props) {
    const items = new Array(...props.list.values());
    const filtered = items
        .filter((item) => {
            return !props.filter.label || item.labels.includes(props.filter.label);
        })
        .filter((item) => {
            const desc = item.description.toLowerCase();
            return props.filter.words.every((word) => desc.includes(word));
        });

    return (
        <div className="grid grid-cols-1 gap-2 w-full justify-center">
            <TodoNew onNew={props.onNew} />
            {
                filtered
                    .filter((item) => !item.done)
                    .map((item) => {
                        return <TodoItem
                            key={item.key}
                            item={item}
                            onDone={props.onDone}
                        />;
                    })
            }
            <div className="w-3/5 my-4 place-self-center outline outline-1 outline-zinc-200 outline-offset-0"></div>
            {
                filtered
                    .filter((item) => item.done)
                    .map((item) => {
                        return <TodoItem
                            done
                            key={item.key}
                            item={item}
                            onDone={props.onDone}
                        />;
                    })
            }
        </div>
    );
}

function App() {
    const [todoList, setTodoList1] = useState(() => {
        return new Map(JSON.parse(Cookies.get('todoList')));
    });
    const [filterWords, setFilterWords] = useState([]);
    const [filterLabel, setFilterLabel] = useState(null);

    const nextKey = useRef(todoList.size + 1);
    const filter = useMemo(() => {
        return {
            words: filterWords,
            label: filterLabel,
        };
    }, [filterLabel, filterWords]);

    const setTodoList = (list) => {
        setTodoList1(list);
        Cookies.set('todoList', JSON.stringify(new Array(...list.entries())), { expires: 365, path: '', sameSite: 'Lax' });
    };

    const setTodoField = (field) => (key, value) => {
        const newList = new Map(todoList.entries());
        newList.set(key, { ...newList.get(key), [field]: value });
        setTodoList(newList);
    }

    return (
        <div className="flex justify-center w-full h-screen bg-stone-50">
            <div className="flex-none place-self-center w-96 h-3/4 space-y-4">
                <h1 className="font-mono font-semibold text-3xl text-zinc-800">
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
                </h1>
                <SearchBar
                    onChange={(event) => setFilterWords(event.target.value.toLowerCase().split(/\s+/))}
                    onSelect={(event) => setFilterLabel(event.target.value === 'none' ? null : event.target.value)}
                />
                <TodoList
                    list={todoList}
                    filter={filter}
                    onNew={(item) => {
                        const newList = new Map(todoList.entries());
                        newList.set(nextKey.current, {
                            key: nextKey.current,
                            description: item,
                            labels: [],
                            done: false,
                        });
                        setTodoList(newList);
                        nextKey.current += 1;
                    }}
                    onDone={setTodoField('done')}
                />
            </div>
        </div>
    );
}

export default App;
