import StackTrace from 'stacktracey';

export interface AsyncStackTrace {
    stack: StackTrace;
    promise: Promise<StackTrace>;
}

export function createStackTrace(offset: number = 0) {
    const stack = new StackTrace(undefined, offset + 1);
    const result: any = { stack };
    result.promise = stack.withSourcesAsync()
        .then(stack => {
            result.stack = stack;
            result.promise = undefined;
        });
    return result as AsyncStackTrace;
}
