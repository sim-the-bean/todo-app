import React, { useState } from 'react';
import '../index.css';

export function PopupMenu(props) {
    const [showPopup, setShowPopup] = useState(false);

    const classNameDefault = "flex-none h-12 w-12 ml-2 p-2 pl-3 pt-3 bg-zinc-50 dark:bg-gray-800 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 dark:outline-gray-700 dark:hover:outline-slate-600";
    const classNamePopup = "h-12 p-2 pr-3 bg-zinc-50 dark:bg-gray-800 hover:drop-shadow-sm rounded-xl outline outline-2 outline-zinc-200 hover:outline-slate-400 dark:outline-gray-700 dark:hover:outline-slate-600";

    if (showPopup) {
        return (
            <div className={classNamePopup}>
                {props.children}
                <props.Button
                    aria-haspopup={true}
                    aria-expanded={true}
                    onClick={() => setShowPopup(false)}
                />
            </div>
        );
    } else {
        return (
            <div className={classNameDefault}>
                <props.Button
                    aria-haspopup={true}
                    aria-expanded={false}
                    onClick={() => setShowPopup(true)}
                />
            </div>
        );
    }
}