const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();

let uploadDirName = './uploads';
let downloadDirName = './downloads';

if (!fs.existsSync(uploadDirName)) {
    fs.mkdirSync(uploadDirName);
}

if (!fs.existsSync(downloadDirName)) {
    fs.mkdirSync(downloadDirName);
}

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

            let videofilename = fileid + '-' + videofile.name;

            videofile.mv('./uploads/' + videofilename);

            convertVideoToGif(videofilename);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: videofile.name,
                    mimetype: videofile.mimetype,
                    size: videofile.size
                },
                download_url: '/download/' + videofilename.replace(/\.[^/.]+$/, "") + '.gif'
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/download/:filename', (req, res) => {
    console.log('test');
    console.log(req.params.filename);
    try {
        res.download('./downloads/' + req.params.filename);
        console.log('downloading...');
    } catch (error) {
        console.log(error);
    }

});

function convertVideoToGif(videofilename) {

    try {
        var convertCommand = spawn('ffmpeg', ['-i', process.cwd() + '/uploads/' + videofilename, '-s', '320x240', '-r', '5', 'downloads/' + videofilename.replace(/\.[^/.]+$/, "") + '.gif']);
    } catch (error) {
        console.log(error);
    }

    convertCommand.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    convertCommand.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    convertCommand.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

}