/** @readonly */
export const TODO_KEY = 'todoList';

/** @readonly */
export const ORDER_KEY = 'todoOrder';

const JsonStorage = {
    /**
     * @param {string} name 
     * @return {?any}
     */
    get: function (name) {
        const value = window.localStorage.getItem(name);
        return value && JSON.parse(value);
    },
    /**
     * @param {string} name 
     * @param {any} value
     */
    set: function (name, value) {
        window.localStorage.setItem(name, JSON.stringify(value));
    },
}

export default JsonStorage;
