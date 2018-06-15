/** Sleep for an amount of milliseconds. */
export async function wait(milliseconds) {
    return await new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}
