import { useState, useMemo } from 'react';
import { _cookies, CONSENT_COOKIE, TODO_COOKIE } from './misc/cookies';

/** @readonly */
const VERSION_COOKIE = 'version';

const UNKNOWN_VERSION = '0.0.0';

/** @readonly */
export const VERSION = '0.1.0';

/**
 * @param {string} version 
 * @returns {bool}
 */
function cookiesPermitted(version) {
    switch (version) {
        case '0.1.0':
            return _cookies.get(CONSENT_COOKIE) === true;
        default:
            return !!_cookies.get(CONSENT_COOKIE);
    }
}

/**
 * @param {string} version 
 * @param {{[key: string]: any}} localData
 * @param {(localData: {[key: string]: any}) => void} setLocalData
 * @returns {?{[key: string]: any}}
 */
function migrateLocalData(version, localData) {
    const data = {};
    switch (version) {
        case VERSION:
            // current version, no need to migrate
            return null;
        default: {
            const list = localData[TODO_COOKIE];
            if (Array.isArray(list[0]) && list[0].length === 2) {
                const [index, object] = list[0];
                if (typeof index === 'number' && typeof object === 'object') {
                    // first public version (unnamed)
                    data[TODO_COOKIE] = list
                        .map(([index, object]) => ({
                            key: object.key ?? index,
                            description: object.description ?? '',
                            labels: object.labels?.slice() ?? [],
                            status: object.status ?? false,
                        }));
                    data[CONSENT_COOKIE] = true;
                }
            }
        }
    }
    return data;
}

export function useVersion() {
    /** @type string */
    const lastVersion = useMemo(() => _cookies.get(VERSION_COOKIE) ?? UNKNOWN_VERSION, []);
    const [currentVersion, setCurrentVersion] = useState(lastVersion);

    if (currentVersion !== VERSION) {
        if (cookiesPermitted(currentVersion)) {
            const newData = migrateLocalData(currentVersion, _cookies.getAll());
            if (newData) {
                Object.entries(newData).forEach(([key, value]) => {
                    _cookies.set(key, value);
                });
            }
            setCurrentVersion(VERSION);
            _cookies.set(VERSION_COOKIE, VERSION);
        }
    }
}