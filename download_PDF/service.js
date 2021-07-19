"use strict"

const pdf = require('html-pdf');

class Services {

    async downloadHtmlToPDF(html, filename) {
        try {
            let options = {
                "type": "pdf",
                "height": "1140px",
                "width": "800px",
                "renderDelay": 1000
            };
            return new Promise((resolve, reject) => {
                pdf.create(html, options).toFile("./downloads/temp.pdf", (err, file) => {
                    if (err) throw new Error(err.message);
                    return resolve(file.filename);
                });
            });
        } catch (error) {
            console.log(error.message);
            return res.send({ errorCode: 500, errorMessage: error.message });
        }
    }

}
