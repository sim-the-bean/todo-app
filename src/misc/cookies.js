import React from 'react';
import Cookies from 'js-cookie';
import '../index.css';

/** @readonly */
export const TODO_COOKIE = 'todoList';

/** @readonly */
export const ORDER_COOKIE = 'todoOrder';

/** @readonly */
export const CONSENT_COOKIE = 'essentialCookiesConsent';

export const _cookies = {
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
     * @return {{[key: string]: any}}
     */
    getAll: function () {
        const all = {};
        const cookies = this.ctx.get();
        for (const [key, value] of Object.entries(cookies)) {
            try {
                all[key] = JSON.parse(value);
            } catch (_) {
                // ignore invalid cookies
            }
        }
        return all;
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
export const CookieContext = React.createContext(null);