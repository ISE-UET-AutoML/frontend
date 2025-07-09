export function snakeToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(snakeToCamel); // Xử lý mảng bằng cách áp dụng đệ quy cho từng phần tử
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()); // Chuyển snake_case sang camelCase
            acc[camelKey] = snakeToCamel(obj[key]); // Đệ quy để xử lý các giá trị lồng nhau
            return acc;
        }, {});
    }
    return obj;
}

export function camelToSnake(obj) {
    if (Array.isArray(obj)) {
        return obj.map(camelToSnake);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase -> snake_case
            acc[snakeKey] = camelToSnake(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

