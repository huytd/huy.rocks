export const base64_encode = (input: string): string => {
    if (Buffer) {
        return Buffer.from(input).toString('base64');
    } else if (window) {
        return window.atob(input);
    }
    return "";
};

export const base64_decode = (input_base64: string): string => {
    if (Buffer) {
        return Buffer.from(input_base64, 'base64').toString('utf8');
    } else if (window) {
        return window.btoa(input_base64);
    }
    return "";
};