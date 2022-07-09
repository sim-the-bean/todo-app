import React, { useState, useMemo, useEffect, useContext } from 'react';
import './index.css';
import * as UI from './ui/ui';
import CookieNotice from './CookieNotice';
import SearchBar from './todo/SearchBar';
import TodoList from './todo/TodoList';
import { CookieContext, _cookies, TODO_COOKIE, CONSENT_COOKIE } from './misc/cookies';
import { useVersion, VERSION } from './version'

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

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
            <main className="flex-1 justify-self-center w-96 m-4 mt-16 mb-0 py-4 space-y-4">
                <Title />
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
            <footer className="flex-1 place-self-center mt-2 p-4">
                <p className="flex-1 place-self-center text-justify text-md text-zinc-700 font-medium">
                    Todo&#8230; v{VERSION} &mdash; Copyright 2022 &copy; Simone Walter<br />
                    <UI.Link href="https://github.com/soycan-sim/todo-app">
                        soycan-sim/todo-app
                    </UI.Link>
                </p>
            </footer>
        </div>
    );
}

function App() {
    useVersion();

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
