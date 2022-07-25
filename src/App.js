import React, { useState, useMemo, useEffect, useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { createDragDropManager } from 'dnd-core';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';
import * as UI from './ui/ui';
import SearchBar from './todo/SearchBar';
import TodoList from './todo/TodoList';
import JsonStorage, { TODO_KEY } from './misc/json-storage';
import { useVersion, VERSION } from './version'

function Title() {
    return (
        <div className="flex-1 w-full">
            <h1 className="p-2 tablet:p-4 font-mono font-semibold text-3xl tablet:text-4xl text-zinc-800 dark:text-gray-300">
                Todo
                <span className="animate-pulse">
                    <span className="text-zinc-600 dark:text-gray-500">
                        .
                    </span>
                    <span className="text-zinc-500 dark:text-gray-600">
                        .
                    </span>
                    <span className="text-zinc-400 dark:text-gray-700">
                        .
                    </span>
                </span>
            </h1>
        </div>
    );
}

function TodoApp() {
    const { darkMode, setDarkMode } = useContext(DarkModeContext);

    const [todoList, setTodoList] = useState(() => JsonStorage.get(TODO_KEY) ?? []);
    const [filterWords, setFilterWords] = useState([]);
    const [filterLabel, setFilterLabel] = useState(null);

    const nextKey = useMemo(() => todoList.length === 0 ? 1 : todoList[todoList.length - 1].key + 1, [todoList]);

    useEffect(
        () => JsonStorage.set(TODO_KEY, todoList),
        [todoList]
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
        <div className="grid grid-cols-1 justify-center columns-1 w-full min-h-screen bg-stone-50 dark:bg-slate-900">
            <main className="flex-1 justify-self-center w-5/6 tablet:w-2/3 desktop:w-128 m-4 mt-12 mb-0 py-4 space-y-4">
                <div className="flex justify-end items-baseline">
                    <Title />
                    <div className="flex items-center">
                        <label
                            id="darkModeLabel"
                            htmlFor="darkModeSwitch"
                            className="flex mr-2 text-base tablet:text-lg text-zinc-700 dark:text-gray-400 font-semibold"
                        >
                            Dark mode
                        </label>
                        <div className="flex-none">
                            <UI.Switch id="darkModeSwitch" aria-labelledby="darkModeLabel" checked={darkMode} onClick={() => setDarkMode(!darkMode)} />
                        </div>
                    </div>
                </div>
                <SearchBar
                    id="searchBar"
                    onSearch={(text) => setFilterWords(text.toLowerCase().split(/\s+/))}
                    filter={filterLabel}
                    onFilter={setFilterLabel}
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
            </main>
            <footer className="flex-1 place-self-center mt-2 p-4 text-justify text-base tablet:text-lg text-zinc-700 dark:text-gray-400 font-medium">
                <p className="flex-1 place-self-center">
                    Todo&#8230; v{VERSION}
                </p>
                <p className="flex-1 place-self-center">
                    Copyright 2022 &copy; Simone Walter<br />
                    <UI.Link href="https://github.com/soycan-sim/todo-app">
                        soycan-sim/todo-app
                    </UI.Link>
                </p>
            </footer>
        </div>
    );
}

/** @readonly */
const TOUCH_KEY = 'isTouchDevice';

/** @readonly */
const DARK_KEY = 'darkMode';

/**
 * @type {{[device: string]: { mobile: bool }}}
 * @readonly
 */
const devices = {
    desktop: { mobile: false, dragDropManager: createDragDropManager(HTML5Backend) },
    mobile: { mobile: true, dragDropManager: createDragDropManager(TouchBackend) },
};

/** @readonly */
export const DeviceContext = React.createContext(devices.desktop);

/**
 * @type {React.Context<{darkMode: bool, setDarkMode: React.Dispatch<bool>}>}
 * @readonly
 * */
export const DarkModeContext = React.createContext(null);

function App() {
    useVersion();

    const desktopMinWidth = 1024;

    const [touch, setTouch] = useState(() => JsonStorage.get(TOUCH_KEY) ?? window.screen.width < desktopMinWidth);
    const device = useMemo(() => touch ? devices.mobile : devices.desktop, [touch]);

    useEffect(() => JsonStorage.set(TOUCH_KEY, touch), [touch]);

    /** @type {[bool, React.Dispatch<bool>} */
    const [darkMode, setDarkMode] = useState(() => JsonStorage.get(DARK_KEY) ?? window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [darkModeValue, darkModeClass] = useMemo(() => [{ darkMode, setDarkMode }, darkMode ? "dark" : ""], [darkMode]);

    useEffect(() => JsonStorage.set(DARK_KEY, darkMode), [darkMode]);

    return (
        <div onPointerDownCapture={(event) => setTouch(event.pointerType === 'touch')}>
            <DeviceContext.Provider value={device}>
                <DndProvider manager={device.dragDropManager}>
                    <DarkModeContext.Provider value={darkModeValue}>
                        <div className={darkModeClass}>
                            <TodoApp />
                        </div>
                    </DarkModeContext.Provider>
                </DndProvider>
            </DeviceContext.Provider>
        </div>
    );
}

export default App;
