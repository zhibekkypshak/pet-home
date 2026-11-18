class StorageManager {
    constructor(key, defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);

            if (raw === null) {
                return this.copyDefault();
            }

            const value = JSON.parse(raw);

            if (Array.isArray(this.defaultValue) && !Array.isArray(value)) {
                return this.copyDefault();
            }

            if (this.isPlainObject(this.defaultValue) && !this.isPlainObject(value)) {
                return this.copyDefault();
            }

            return value;
        } catch (error) {
            console.warn(`Invalid data in localStorage "${this.key}", using default.`);
            return this.copyDefault();
        }
    }

    save(value) {
        try {
            localStorage.setItem(this.key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Could not save "${this.key}" to localStorage.`);
            return false;
        }
    }

    clear() {
        localStorage.removeItem(this.key);
    }

    isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    copyDefault() {
        return JSON.parse(JSON.stringify(this.defaultValue));
    }
}
