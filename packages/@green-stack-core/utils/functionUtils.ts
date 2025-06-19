
/** --- tryCatch() ----------------------------------------------------------------------------- */
/** -i- Attempts to execute a promise, wraps it with try / catch, but returns the error if it fail */
export const tryCatch = async <T>(promise: Promise<T>): Promise<{
    data?: T,
    error?: Error,
}> => {
    try {
        // Await the promise
        const data = await promise
        // Return the data
        return { data }
    } catch (error) {
        // Keep error objects as is
        if (error instanceof Error) return { error }
        // Deal with non Error throws by converting to Error object
        return { error: new Error(String(error)) }
    }
}
