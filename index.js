const express = require('express');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const passport = require('passport');
const multer = require('multer');
const download = require('image-downloader');

const _port = process.env.PORT || 3300;
const options = {
    url: "",
    dest: './uploads/'
}
let filename;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        console.log(file);
        cb(null, filename = file.fieldname + Date.now() + file.originalname);
        console.log(filename);
    }
});

const upload = multer({ storage: storage });


const cors = require('cors');
require('./config/config');
require('./db');
require('./config/passportConfig');
const fileHandler = require('./upload');



const app = express();
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(bodyParser.json());

app.use(passport.initialize());

const userController = require('./controllers/userController');
const topicController = require('./controllers/topicController');
const postsRoute = require('./controllers/postController');



//handle validation errors within the application
app.use((err, req, res, next) => {
    if (err.name == 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors);
    }
});







app.listen(_port, (err) => {
    if (err) { throw err; }
    console.log(`Server started at port: ${_port}`)
});

app.use('/users', userController);
app.use('/topics', topicController);
app.use('/posts', postsRoute);

app.post('/images', upload.single('image'), function(req, res, next) {
    console.log("Upload successful.");
    
        res.json({
            'success' : 1,
            "file": {
                "url": "http://3.34.76.182:3300/uploads/" + filename
            }
        })
    
});

app.post('/images/url', (req, res, next) => {
    
    // Download image to server
    download.image({
        url: req.body.url,
        dest: options.dest
    })
        .then(({ filename }) => {
            console.log('Saved to ', filename)
            res.json({ 
                success: 1,
                file: {
                    url : "http://3.34.76.182:3300/uploads/" + (filename.slice(8, filename.length))
                }
             })
        })
        .catch((err) => console.error(err));
        
} );