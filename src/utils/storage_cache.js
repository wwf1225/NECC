 // 使用LocalStorage缓存数据

const localStorage = window.localStorage;

const LocalCache = {
    isSupported: !!localStorage,
    set: function (key, value) {
        if (!LocalCache.isSupported) return false;

        try {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    },
    get: function (key) {
        if (!LocalCache.isSupported) return null;

        let value = localStorage.getItem(key);
        try {
            value = JSON.parse(value);
            return value;
        } catch (e) {
            return null;
        }
    },
    remove: function (key) {
        if (!LocalCache.isSupported) return false;

        if (key === undefined || key === null) {
            localStorage.clear();
            return true;
        }

        localStorage.removeItem(key);

        return true;
    }
};

export default LocalCache;
