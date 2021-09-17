const router = require('express').Router();
const splitExpenses = require('./serives/split_expenses');
const splitExpensesService = new splitExpenses();

router.post('/splitter/dump_data/:roomId/:count', async (req, res) => {
    try {
        const data = await splitExpensesService.dumpDB(req.params.roomId, req.params.count);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).error({ errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

router.get('/splitter/room_mate/:roomId', async (req, res) => {
    try {
        const data = await splitExpensesService.getRoomMates(req.params.roomId);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).error({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

router.post('/splitter/room_mate/:roomId', async (req, res) => {
    try {
        const data = await splitExpensesService.addRoomMates(req.body.name, req.params.roomId);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({ errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

router.post('/splitter/split_amount/:roomMateName', async (req, res) => {
    try {
        const data = await splitExpensesService.splitAmount(req.body.name, req.body.amount);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).error({ errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

router.get('/splitter/split_amount/:roomMateName', async (req, res) => {
    try {
        const data = await splitExpensesService.getSplittedAmount(req.params.roomMateName);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({ errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

module.exports = router;