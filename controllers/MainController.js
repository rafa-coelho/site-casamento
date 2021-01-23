module.exports = (app) => {

    // Home
    app.get(`/`, (req, res) => {
        res.sendFile(ROOT + '/pages/index.html');
    });

};