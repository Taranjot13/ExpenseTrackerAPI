// ESM module example for utility functions
export function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

export function isPositiveNumber(num) {
    return typeof num === 'number' && num > 0;
}
