const jwt = require('jsonwebtoken');
const router = require('express').Router();
const service = require('./serives/service');
const Service = new service();

//  let auth = Service.login(req,res,next);
let auth = async (req, res, next) => {
    try {
        let token = req.header("auth");
        let decode = jwt.verify(token, 'secret');
        if (!decode.id) throw new Error("Token get expired, please login again.")
        req.user = await Service.getUser(decode.id);
        return next();
    } catch (error) {
        throw new Error("somthing went wrong with the server, please try after some time.");
    }
};

/**
 *  Function to register user to system.
 * @returns {object} success - returns the success message with userId.
 */
router.post('/registeruser', async (req, res) => {
    try {
        // const user = await UserModel.create({ name: req.body.name });
        let { name, email, image, password } = req.body;
        const { userId } = await Service.registerUser(name, email, password, image);
        return res.send({ message: `User created successfully with userId: ${userId}.` });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to update the user info.
 * @returns {object} success - returns the success message.
 */
router.put('/updateuser', auth, async (req, res) => {
    try {
        const { name, image } = req.body;
        await Service.updateUser(req.body.userId, name, image);
        return res.send({ message: "User updated successfully." });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to get user from the system.
 * @returns {object} success - returns the success message with user data.
 */
router.get('/getuser', auth, async (req, res) => {
    try {
        const user = await Service.getUser(req.body.userId);
        return res.send({ message: "Got user details successfully.", data: user });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to post users stories.
 * @returns {object} success - returns the success message with data.
 */
router.post('/addfeeds', auth, async (req, res) => {
    try {
        const { image, title, description } = req.body;
        const feed = await Service.addFeeds(image, title, description, req.body.userId);
        return res.send({ message: "Your story has been successfully posted.", data: feed });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to get feeds list based on filters.
 * @returns {Object} success - returns the success message with feeds list.
 */
router.get('/getfeeds', auth, async (req, res) => {
    try {
        const feedsList = await Service.getFeeds(req.body.onlyMyFeeds, req.body.userId);
        return res.send({ message: "Got list of feeds successfully.", data: feedsList });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to get post by id.
 * @returns {Object} success - returns list of users in the system.
 */
router.get('/getfeeds/:id', auth, async (req, res) => {
    try {
        const post = await Service.getFeedsById(req.params.id);
        return res.send({ message: "Got selected post successfully.", data: post });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to delete the post.
 * @returns {Object} success - returns the success message.
 */
router.delete('/deletefeeds/:id', auth, async (req, res) => {
    try {
        await Service.deleteFeeds(req.params.id, req.body.userId);
        return res.send({ message: "Post deleted successfully." });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

/**
 *  Function to update the post
 * @returns {Array} usersList - returns the success message.
 */
router.put('/updatefeeds/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const updatedFeed = await Service.updateFeeds(req.params.id, req.body.userId, title, description);
        return res.send({ message: "Post updated successfully." });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

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

router.post('/sendfile', async (req, res) => {
    try {
        const data = await Service.sendFile();
        return res.send({ data });
    } catch (error) {
        return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
    }
})

module.exports = router;