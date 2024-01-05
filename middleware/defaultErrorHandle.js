module.exports = (err, req, res, nxt) => {
    const message = err?.message || `Server Error Occered!`;
    const status = err.status || 500;
    res.status(status).json({
        isSuccess: false,
        message,
    });
};
