import cache from 'memory-cache';

export const cachedFetch = async (url: string) => {
    const cachedResponse = cache.get(url);
    if (cachedResponse) {
        return cachedResponse;
    } else {
        const cacheTime = 12 * 60 * 60 * 1000;
        const response = await fetch(url);
        const data = await response.text();
        cache.put(url, data, cacheTime);
        return data;
    }
};