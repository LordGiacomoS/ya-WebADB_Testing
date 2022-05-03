import type { UnderlyingSource } from "web-streams-polyfill";
import { createStackTrace } from "./stack.js";
import type { ReadableStreamState, WritableStreamState } from "./types.js";

const UnamedTagIds: Record<string, number> = {};

const streams = {} as Record<string, ReadableStreamState | WritableStreamState>;
const snapshots = [] as Record<string, ReadableStreamState | WritableStreamState>[];

function clone<T>(object: T) {
    return JSON.parse(JSON.stringify(object));
}

const dirty = new Set<string>();
function createSnapshot(id: string) {
    if (dirty.has(id)) {
        snapshots.push(clone(streams));
        dirty.clear();
        return;
    }
    snapshots[snapshots.length - 1] = clone(streams);
    dirty.add(id);
}

export function addReadable(
    source?: UnderlyingSource<any>,
    tag?: string,
    name?: string,
) {
    if (!tag) {
        tag = 'untagged';
    }

    if (!name) {
        if (!UnamedTagIds[tag]) {
            UnamedTagIds[tag] = 0;
        }
        name = `unamed-${UnamedTagIds[tag]}`;
        UnamedTagIds[tag]++;
    }

    // 1. addReadable
    // 2. new DebugReadableStream
    const stack = createStackTrace(2);

    const id = `${tag}-${name}`;
    streams[id] = {
        tag,
        source,
        creation: {
            name: name!,
            stack
        },
        links: {},
    };
    return id;
}

export function addReader(id: string, name?: string, result?: any) {
    createSnapshot(id);

    // 1. addReader
    // 2. DebugReadableStream#getReader
    const stack = createStackTrace(2);

    (streams[id] as ReadableStreamState).reader = {
        creation: {
            name,
            result,
            stack
        },
    };
}

export function addLink(from: string, to: string, name: string, data: any, offset: number) {
    createSnapshot(from);

    // 1. addLink
    const stack = createStackTrace(offset + 1);

    streams[from]!.links[to] = {
        creation: {
            name,
            data,
            stack,
        },
    };
}

export function setOperation(id: string, internal: boolean, name?: string, data?: any, result?: any) {
    createSnapshot(id);
    streams[id]![internal ? 'internalOperation' : 'externalOperation'] = name
        ? { name, data, result, stack: createStackTrace() }
        : undefined;
}

export function setLinkOperation(from: string, to: string, name: string, data: any) {
    createSnapshot(from);
    streams[from]!.links[to]!.operation = {
        name,
        data,
        stack: createStackTrace(2),
    };
};
