const router = require('express').Router();
const addToWallet = require('./services/addToWallet');
const registerUser = require("./services/registerUser");
const registerAdmin = require("./services/registerAdmin");

router.all('/', (req, res) => res.send('You get into the Pharma Supply Chain App.'));

app.post('/:org/addToWallet', async (req, res) => {
    try {
        let data = await addToWallet(
            req.params.org,
            req.body.certificatePath,
            req.body.privateKeyPath,
            req.body.fabricUserName,
            req.body.mspName
        );
        res.status(200).json({ status: 'success', message: 'User credentials added to wallet', data });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Failed', error });
    }
});

app.post('/:org/registerUser', async (req, res) => {
    try {
        let data = await registerUser.execute(req.params.org, req.body.fabricUserName);
        res.status(200).json({ status: 'success', message: 'User credentials added to wallet', data });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Failed', error });
    }
});

app.post('/:org/registerAdmin', (req, res) => {
    try {
        let data = await registerAdmin.execute(req.params.org);
        res.status(200).json({ status: 'success', message: 'User credentials added to wallet', data });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Failed', error });
    }
});