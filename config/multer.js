const multerS3 = require('multer-s3');
const aws = require('aws-sdk')
const crypto = require('crypto');

module.exports = {
    storage: multerS3({
        s3: new aws.S3(),
        bucket: process.env.S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (request, file, callback) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) callback(err);

                const fileName = `${hash.toString("hex")}-${file.originalname}`;
                callback(null, fileName);
            });
        }
    }),
    fileFilter: (request, file, callback) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/pjpeg',
            'image/png'
        ];

        if(allowedMimes.includes(file.mimetype)){
            callback(null, true);

        } else{
            callback(new Error("Tipo de imagem inválido."));
        }
    },

};