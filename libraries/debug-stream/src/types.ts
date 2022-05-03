import type { AsyncStackTrace } from "./stack.js";
import type { UnderlyingSource, UnderlyingSink } from "web-streams-polyfill";

export interface New {
    isNew: boolean;
}

export interface Operation {
    name?: string | undefined;
    data?: any;
    result?: any;
    stack: AsyncStackTrace;
}

export interface LinkState {
    creation: Operation;
    operation?: Operation;
}

export interface ReaderState {
    creation: Operation;
    operation?: Operation;
}

export interface StreamState {
    tag: string;
    creation: Operation;
    links: Record<string, LinkState>;
    externalOperation?: Operation;
    internalOperation?: Operation;
}

export interface ReadableStreamState extends StreamState {
    source?: UnderlyingSource<any> | undefined;
    reader?: ReaderState;
}

export interface WritableStreamState extends StreamState {
    sink: UnderlyingSink<any>;
    writer?: ReaderState;
}
