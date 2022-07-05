import React from 'react';
import "./index.css";
import { SelectorIcon, PlusCircleIcon, MenuIcon } from '@heroicons/react/outline'

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
                className="flex-1 h-8 p-2 rounded-lg outline outline-2 outline-slate-100 hover:outline-slate-300 outline-offset-0"
                type={props.type || "text"}
                placeholder="Search..."
            />
            <select className="flex-none h-9 w-12 rounded-lg bg-slate-100 hover:bg-slate-300" name="tags" id="tags">
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
    return (
        <div className="flex items-center w-full h-9 space-x-1 rounded-lg outline outline-2 outline-slate-100 hover:outline-slate-300 outline-offset-0 p-2">
            {props.selectable && <SelectorIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />}
            {props.children}
            <MenuIcon className="flex-none h-5 text-slate-400 hover:text-slate-900" />
        </div>
    );
}

function TodoItem(props) {
    const item = props.item;
    return (
        <TodoBox selectable>
            <input className="flex-none w-5 mx-4 rounded-md" type="checkbox" />
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
    return (
        <TodoBox>
            <PlusCircleIcon className="flex-none h-5 mr-4 text-slate-400 hover:text-slate-900" />
            <input
                className="flex-1 h-7 p-2 rounded-md outline outline-2 outline-transparent hover:outline-slate-200 outline-offset-0"
                type="text"
            >
            </input>
        </TodoBox>
    );
}

function TodoList(props) {
    const items = [
        {
            key: 1,
            description: "Finish the todo-app",
            labels: ["red"],
        },
        {
            key: 2,
            description: "Learn UI design",
            labels: ["red", "blue"],
        },
    ];
    return (
        <div className="grid grid-cols-1 gap-2 w-full">
            <TodoNew />
            {
                items.map((item) => {
                    return <TodoItem key={item.key} item={item} />;
                })
            }
        </div>
    );
}

function App() {
    return (
        <div className="flex justify-center w-full h-screen">
            <div className="flex-none place-self-center w-96 h-3/4 space-y-4">
                <h1 className="font-mono font-semibold text-3xl">Todo<span className="animate-pulse">...</span></h1>
                <SearchBar />
                <TodoList />
            </div>
        </div>
    );
}

export default App;
