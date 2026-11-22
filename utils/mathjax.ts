// MathJax typesetting is asynchronous: commands such as \color or \cancel live
// in extensions that are fetched on first use, and the typeset pass restarts
// once they arrive. Running a second typeset while one is in flight makes the
// two passes fight over the same nodes (undefined macros rendered in red,
// "viewBox NaN" SVG errors, "Cannot read properties of null (reading
// 'replaceChild')"). Every typeset therefore goes through MathJax's startup
// promise, which queues it after the startup pass and any earlier request.
export const typesetMath = (element: HTMLElement): void => {
    const mathJax = window.MathJax;
    // MathJax hasn't loaded yet (window.MathJax is still the config object):
    // its startup pass will typeset the whole page once it does.
    if (!mathJax?.startup?.promise || !mathJax.typesetPromise) return;

    mathJax.startup.promise = mathJax.startup.promise
        .then(() => {
            mathJax.typesetClear?.([element]);
            return mathJax.typesetPromise!([element]);
        })
        .catch((error: unknown) => console.error('MathJax typeset failed:', error));
};
