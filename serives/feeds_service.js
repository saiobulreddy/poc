const fs = require('fs');
const pdf = require('html-pdf');
const bcrypt = require('bcryptjs');
const form_data = new (require('form-data'))();
const UserModel = require('../db_models/usersModel');
const feedsModel = require('../db_models/feedsModel');

class FeedsServices {

    constructor() { }

    async auth(req, res, next) {
        var _serviceInst = new LoginService();
        var token = req.cookies['auth'] || req.header("x-auth");

        let handler = new Handler();
        return _serviceInst.getUserByToken(token).then((user) => {
            req.user = user;
            if (user && user.sub_role && (user.sub_role === 1)) {
                return handler.serviceHandler(req, res, Promise.reject(new errors.Unauthorized()));
            }
            return next();

        }).catch((err) => {
            return handler.serviceHandler(req, res, Promise.reject(err));
        });
    };

    /**
     * 
     * @param {*} name 
     * @param {*} email 
     * @param {*} password 
     * @param {*} image 
     */
    async registerUser(name, email, password, image) {
        try {

            const exist = await UserModel.findOne({ email });
            // console.log(exist);
            if (exist != null) throw new Error("User alredy existed with this emailId.")
            // fs.WriteStream(()=>{

            // })
            const user = await UserModel.create({ name, email, password: bcrypt.hashSync(password, 8), image });
            return { userId: user._id };
        } catch (error) {
            throw error;
        }
    }

    async getUser(_id) {
        try {
            return await UserModel.findById({ _id }, { __v: 0, password: 0 });
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async login(email, password) {
        try {
            const user = await UserModel.findById({ email });
            if (user === null) throw new Error('User not existed with this email.');
            if (!bcrypt.compareSync(password, user.password)) throw new Error('Password is not matched.');
            const token = jwt.sign({ id: user._id, access: "auth" }, "secret", { expiresIn: 10000 }).toString();
            return { token };
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    /**
     * 
     * @param {*} userId 
     * @param {*} name 
     * @param {*} image 
     */
    async updateUser(userId, name, image) {
        try {
            const exist = await UserModel.findByIdAndUpdate({ _id: userId }, { $set: { name, image } });
            if (!exist) throw new Error('');
            return exist;
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    /**
     * 
     * @param {*} image 
     * @param {*} title 
     * @param {*} description 
     */
    async addFeeds(image, title, description, userId) {
        try {
            await feedsModel.create({ image, title, description, userId });
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async getFeeds(onlyMyFeeds = true, userId) {
        try {
            if (onlyMyFeeds) var feedsList = await feedsModel.find({ userId }, { __v: 0 });
            else feedsList = await feedsModel.find({}, { __v: 0 });
            return feedsList;
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async getFeedsById(_id) {
        try {
            return await feedsModel.findById({ _id }, { __v: 0 });
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async deleteFeeds(_id, userId) {
        try {
            let done = await feedsModel.findOneAndDelete({ _id, userId });
            console.log(done);

            return done;
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async updateFeeds(_id, userId, title, description) {
        try {
            let updatedFeed = await feedsModel.findByIdAndUpdate({ _id, userId }, { $set: { title, description } });
            return updatedFeed;
        } catch (error) {
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async downloadHtmlToPDF(html, filename) {
        try {
            let options = {
                "type": "pdf",
                "height": "1140px",
                "width": "800px",
                "renderDelay": 1000
            };
            // async createFile(html, filename) {
            //     let options = {
            //         format: 'Letter',
            //         directory: os.tmpdir(),
            //         orientation: 'landscape',
            //         filename: 'test.pdf'
            //     };
            //     let create = util.promisify(pdf.create);
            //     let creator = await create(html, options);
            // }

            return new Promise((resolve, reject) => {
                pdf.create(html, options).toFile(`./downloads/${filename}.pdf`, (err, stream) => {
                    if (err) {
                        console.log("error while converting html to pdf", err);
                        throw new Error(err.message);
                    }
                    return resolve(stream.filename);
                });
            });

        } catch (error) {
            console.log(error.message);
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }

    async sendFile() {
        try {
            form_data.append("myFile", "my value");
            form_data.append('my_logo', fs.createReadStream('your_image_location'));
            form_data.append('my_buffer', new Buffer(10));
            return form_data;
        } catch (error) {
            console.log(error.message);
            return res.send({ errorCode: 500, errorMessage: error.message || "somthing went wrong with the server, please try after some time." });
        }
    }
}

module.exports = FeedsServices;