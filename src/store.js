import { writable } from 'svelte/store';

export const weatherList = (() => {
    const { subscribe, update } = writable([]);

    return {
        subscribe,
        add: (weatherInfo) => update(wList => [...wList, weatherInfo]),
        remove: (cityName) => update(wList => {
            const index = wList.findIndex(item => item.name === cityName);
            if (index > -1) {
                wList.splice(index, 1);
            }
            return wList;
        }),
    }
})();
