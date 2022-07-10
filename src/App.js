import React, { useState, useMemo, useEffect } from 'react';
import './index.css';
import * as UI from './ui/ui';
import SearchBar from './todo/SearchBar';
import TodoList from './todo/TodoList';
import JsonStorage, { TODO_KEY } from './misc/json-storage';
import { useVersion, VERSION } from './version'

function Title() {
    return <h1 className="p-4 font-mono font-semibold text-4xl text-zinc-800">
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
        <div className="grid grid-cols-1 justify-center columns-1 w-full min-h-screen bg-stone-50">
            <main className="flex-1 justify-self-center w-5/6 tablet:w-1/2 desktop:w-128 m-4 mt-12 mb-0 py-4 space-y-4">
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
            <footer className="flex-1 place-self-center mt-2 p-4 text-justify text-base tablet:text-lg text-zinc-700 font-medium">
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

function App() {
    useVersion();

    return <TodoApp />;
}

export default App;
