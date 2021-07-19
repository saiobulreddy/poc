const router = require('express').Router();
const service = require('./service');
const Service = new service();

/**
 * This is a POST api to download PDF file from HTML input.
 * @param {*} body - HTML as input in request body
 * @returns {File} PDF file to download
 */
router.post('/html-pdf', async (req, res) => {
    try {
        const pdf = await Service.downloadHtmlToPDF(req.body.toString() || '');
        return res.download(pdf);
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})
