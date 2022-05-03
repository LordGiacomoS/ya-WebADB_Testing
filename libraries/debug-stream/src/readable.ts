import { QueuingStrategy, ReadableStream, ReadableStreamBYOBReader, ReadableStreamDefaultReader, UnderlyingSource } from "web-streams-polyfill";
import { addReadable, addReader, setOperation } from "./hub.js";

export interface DebugReadableStreamOptions<R> extends QueuingStrategy<R> {
    tag?: string;
    name?: string;
}

export interface DebugReadableGetReaderOptions<R> {
    name?: string;
}

const ID_SYMBOL = Symbol('id');

export class DebugReadableStream<R> extends ReadableStream<R> {
    [ID_SYMBOL]: string;

    constructor(underlyingSource?: UnderlyingSource<R>, strategy?: DebugReadableStreamOptions<R>) {
        super(underlyingSource, strategy);
        this[ID_SYMBOL] = addReadable(underlyingSource, strategy?.tag, strategy?.name);
    }

    override getReader(options: { mode: 'byob'; } & DebugReadableGetReaderOptions<R>): ReadableStreamBYOBReader;
    override getReader(options?: DebugReadableGetReaderOptions<R>): ReadableStreamDefaultReader<R>;
    override getReader(options?: { mode?: 'byob'; } & DebugReadableGetReaderOptions<R>): ReadableStreamBYOBReader | ReadableStreamDefaultReader<R> {
        try {
            const result = super.getReader(options as any);
            addReader(this[ID_SYMBOL], options?.name, result);
            return result;
        } catch (e) {
            addReader(this[ID_SYMBOL], options?.name, e);
            throw e;
        }
    }

    override async cancel(reason?: any): Promise<void> {
        setOperation(this[ID_SYMBOL], false, 'cancel', reason);
        try {
            await super.cancel(reason);
            setOperation(this[ID_SYMBOL], false, 'cancel', reason, true);
        } catch (e) {
            setOperation(this[ID_SYMBOL], false, 'cancel', reason, e);
            throw e;
        }
    }
}
