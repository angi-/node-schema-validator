module.exports = (input) => new Promise((resolve) => {
    setTimeout(() => {
        resolve(input === 'exists@domain.com');
    }, 100);
});
