const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const feedController = require('../controllers/feed');


router.get('/posts', isAuth, feedController.getPosts);

//adding validation to the post request
router.post('/post', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth,  feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], isAuth, feedController.updatePost);


router.delete('/post/:postId', isAuth, feedController.deletePost);

router.get('/status', isAuth, feedController.getStatus);

router.put('/status', [  
    body('status').trim().not().isEmpty(),
], isAuth, feedController.updateStatus);


module.exports = router;
