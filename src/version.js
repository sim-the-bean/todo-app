import { useState, useMemo } from 'react';
import JsonStorage, { TODO_KEY } from './misc/json-storage';

/** @readonly */
const VERSION_KEY = 'version';

/** @readonly */
const UNKNOWN_VERSION = '0.0.0';

/** @readonly */
export const VERSION = '0.2.3';

// legacy constants
/** @readonly */
const consent_key = 'essentialCookiesConsent';

function getCookie(name) {
    if (!document.cookie) {
        return null;
    }

    const pair = document.cookie
        .split('; ')
        .map((cookie) => {
            const parts = cookie.split('=');
            return [parts[0], parts.slice(1).join('=')];
        })
        .find(([key]) => name === decodeURIComponent(key));

    if (!pair) {
        return null;
    }

    const value = pair[1];

    return JSON.parse(decodeURIComponent(value));
}

function getAllCookies() {
    if (!document.cookie) {
        return {};
    }

    const cookies = {};

    document.cookie
        .split('; ')
        .map((cookie) => {
            const parts = cookie.split('=');
            return [parts[0], parts.slice(1).join('=')];
        })
        .forEach(([key, value]) => cookies[key] = JSON.parse(decodeURIComponent(value)));

    return cookies;
}

function deleteAllCookies() {
    if (!document.cookie) {
        return;
    }

    document.cookie
        .split('; ')
        .map((cookie) => {
            const parts = cookie.split('=');
            return parts[0];
        })
        .forEach((key) => document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
}

/**
 * @param {string} version 
 * @returns {?{[key: string]: any}}
 */
function migrateLocalData(version) {
    let data = {};
    switch (version) {
        case VERSION:
        case '0.2.0':
            // current or recent version, no need to migrate
            return null;
        case '0.1.0': {
            // no data change, only migration to local storage
            data = getAllCookies();
            delete data[consent_key];
            delete data[VERSION_KEY];

            deleteAllCookies();
            break;
        }
        default: {
            const list = getCookie(TODO_KEY);
            if (!list) {
                return;
            }

            if (Array.isArray(list[0]) && list[0].length === 2) {
                const [index, object] = list[0];
                if (typeof index === 'number' && typeof object === 'object') {
                    // first public version (unnamed)
                    data[TODO_KEY] = list
                        .map(([index, object]) => ({
                            key: object.key ?? index,
                            description: object.description ?? '',
                            labels: object.labels?.slice() ?? [],
                            status: object.status ?? false,
                        }));
                }
            } else if (typeof list[0] === 'object') {
                // version 0.1.0 mistakenly didn't save the version cookie
                return migrateLocalData('0.1.0');
            }

            deleteAllCookies();
            break;
        }
    }
    return data;
}

export function useVersion() {
    /** @type string */
    const lastVersion = useMemo(() => JsonStorage.get(VERSION_KEY) ?? getCookie(VERSION_KEY) ?? UNKNOWN_VERSION, []);
    const [currentVersion, setCurrentVersion] = useState(lastVersion);

    if (currentVersion !== VERSION) {
        const newData = migrateLocalData(currentVersion);
        if (newData) {
            Object.entries(newData).forEach(([key, value]) => {
                JsonStorage.set(key, value);
            });
        }
        setCurrentVersion(VERSION);
        JsonStorage.set(VERSION_KEY, VERSION);
    }
}