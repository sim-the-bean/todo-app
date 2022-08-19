import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import '../index.css';
import * as UI from '../ui/ui';
import JsonStorage, { ORDER_KEY } from '../misc/json-storage';
import TodoItem from './TodoItem';
import TodoNew from './TodoNew';

/** @typedef {'red'|'green'|'blue'|'yellow'} Label */
/** @typedef {{words: string[], label: ?Label}} Filter */
/** @typedef {{key: number, order: number, description: string, status: bool, labels: Label[]}} Item */

/**
 * A wrapper component to represent a list of re-orderable buttons.
 * @param {{list: Item[], name: string}} props
 */
export function TodoSection(props) {
    const order_key = useMemo(() => `${ORDER_KEY}-${props.name}`, [props.name]);

    const [ordering, setOrdering] = useState(() => {
        /** @type {number[]} */
        const ordering = JsonStorage.get(order_key);
        if (ordering) {
            return ordering;
        } else {
            return props.list.map((item) => item.key);
        }
    });

    useEffect(
        () => JsonStorage.set(order_key, ordering),
        [ordering, order_key],
    );

    useLayoutEffect(
        () => {
            setOrdering((ordering) => {
                return ordering
                    .filter((ord) => props.list.some((item) => item.key === ord))
                    .concat(props.list
                        .filter((item) => ordering.every((ord) => item.key !== ord))
                        .map((item) => item.key));
            });
        },
        [props.list],
    );

    /** 
     * @param {number} key
     * @return {?number}
     */
    const getOrder = (key) => ordering.findIndex((ord) => ord === key);
    /** 
     * @param {number} key
     * @param {number} otherKey
     */
    const setOrder = (key, otherKey) => {
        const oldIndex = getOrder(key);
        const newIndex = getOrder(otherKey);

        if (newIndex < oldIndex) {
            setOrdering((ordering) => [
                ...ordering.slice(0, newIndex),
                ordering[oldIndex],
                ...ordering.slice(newIndex, oldIndex),
                ...ordering.slice(oldIndex + 1),
            ]);
        } else if (newIndex > oldIndex) {
            setOrdering((ordering) => [
                ...ordering.slice(0, oldIndex),
                ...ordering.slice(oldIndex + 1, newIndex + 1),
                ordering[oldIndex],
                ...ordering.slice(newIndex + 1),
            ]);
        }
    };

    /** @type {Item[]} */
    const list = useMemo(
        () => ordering
            .map((order) => props.list.find((item) => item.key === order))
            .filter((item) => item),
        [ordering, props.list],
    );

    if (props.list.length === 0) {
        return null;
    }

    return (
        <div
            role="list"
            className="grid grid-cols-1 gap-3 w-full justify-center my-2"
        >
            {
                list.map((item) => {
                    return (
                        <TodoItem
                            key={item.key}
                            item={item}
                            name={props.name}
                            setItemStatus={props.setItemStatus}
                            deleteItem={props.deleteItem}
                            toggleLabel={props.toggleLabel}
                            setOrder={setOrder}
                        />
                    );
                })
            }
        </div>
    )
}

/** 
 * A component that represents all items on the list, sorts them by status, and filters and/or searches.
 * @param {{list: Item[], filter: Filter, addNewItem: (description: string, labels: Label[]) => void, deleteItem: () => void, toggleLabel: (key: number, label: Label) => void, setItemStatus: (key: number, status: bool) => void}} props 
 */
export function TodoList(props) {
    const filtered = useMemo(
        () => props.list
            // filter by label
            .filter((item) => {
                return !props.filter.label || item.labels.includes(props.filter.label);
            })
            // filter by search
            .filter((item) => {
                const desc = item.description.toLowerCase();
                return props.filter.words.every((word) => desc.includes(word));
            }),
        [props.list, props.filter.words, props.filter.label],
    );

    // checks if all items have the same 'status' flag
    const [allStatus] = useMemo(() =>
        filtered.reduce(([all, prev], item) => {
            if (!all) {
                return [false, null];
            } else if (prev === null) {
                return [all, item.status];
            } else {
                return [prev === item.status, item.status];
            }
        }, [true, null]),
        [filtered],
    );

    return (
        <div className="grid grid-cols-1 gap-1 w-full justify-center">
            <TodoNew
                id="todoNew"
                addNewItem={props.addNewItem}
            />
            <TodoSection
                name="in-progress"
                list={filtered.filter((item) => !item.status)}
                setItemStatus={props.setItemStatus}
                deleteItem={props.deleteItem}
                toggleLabel={props.toggleLabel}
            />
            {!allStatus && <UI.HorizontalDivider className="my-2" />}
            <TodoSection
                name="completed"
                list={filtered.filter((item) => item.status)}
                setItemStatus={props.setItemStatus}
                deleteItem={props.deleteItem}
                toggleLabel={props.toggleLabel}
            />
        </div>
    );
}

export default TodoList;