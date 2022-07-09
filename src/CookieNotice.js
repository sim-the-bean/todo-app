import React from 'react';
import './index.css';

/**
 * Displays a floating cookie notice.
 * @param {{onClick: () => void}} props 
 */
export default function CookieNotice(props) {
    return (
        <div
            role="alertdialog"
            aria-labelledby="cookieNoticeTitle"
            aria-describedby="cookieNoticeDesc"
            className="block absolute z-40 place-self-center left-16 bottom-16 w-1/3 p-4 space-y-4 bg-zinc-100 rounded-3xl outline outline-2 outline-zinc-200 hover:outline-slate-300 outline-offset-0"
        >
            <h1 id="cookieNoticeTitle" className="block font-mono font-semibold text-3xl text-zinc-800">Cookie Notice</h1>
            <p id="cookieNoticeDesc" className="block text-justify text-lg">
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