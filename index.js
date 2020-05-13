const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

//start app 
const port = process.env.PORT || 8585;

app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);

app.get('/', function(req, res) {
    res.send('system running!');
});

app.post('/generate-gif', async(req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let videofile = req.files.videofile;
            let fileid = uuidv4();

            videofile.mv('./uploads/' + fileid + '-' + videofile.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: videofile.name,
                    mimetype: videofile.mimetype,
                    size: videofile.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});