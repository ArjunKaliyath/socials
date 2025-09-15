const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const io = require('../socket'); //importing the io object to emit events to all connected clients

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .populate('creator') //to get the full user details instead of just the user id in the creator field of the post
                .skip((currentPage - 1) * perPage) //to skip the items
                .limit(perPage); //to limit the number of items per page
        })
        .then(posts => {
            res.status(200).json({ message: 'Fetched posts successfully.', posts: posts, totalItems: totalItems });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(422).json({ message: 'Validation failed, entered data is incorrect.', errors: errors.array() });
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const image = req.file.path.replace("\\", "/"); //to make it work on windows as well where the path separator is \ instead of / like in mac and linux
    if (!image) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        creator: req.userId,
        imageUrl: image
    });
    post.save()
        .then(result => {
            return User.findById(req.userId) //to get the user who created the post
        })
        .then(user => {
            user.posts.push(post); //adding the post to the user's posts array
            return user.save();
        })
        .then(result => {
            //
            io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: { _id: req.userId, name: result.name } } });//sending post data only without metadata like __v and _id using __doc and sending creator details 

            //emitting an event to all connected clients, 'posts' is the event name, we can choose any name
            //the second argument is the data we want to send with the event, here we are sending the action type and the post data
            //emit sends the event to all connected clients whereas broadcast sends the event to all connected clients except the one who triggered the event
            res.status(201).json({ //201 status code for successful post request
                message: 'Post created successfully!',
                post: post,
                creator: { _id: req.userId, name: result.name }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Post fetched.', post: post });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; //in case the image is not updated, we will get the old image url from the body, we have processed correct old image path in the frontend
    if (req.file) { //if image is updated, we will get the new image file from req.file
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new Error('No image file picked.');
        error.statusCode = 422; // 422 status code for validation error
        throw error;
    }
    Post.findById(postId).populate('creator')
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator._id.toString() !== req.userId) { //check if the logged in user is the creator of the post
                const error = new Error('Not authorized to edit this post.');
                error.statusCode = 403; //403 status code for forbidden
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl); //delete the old image file if the image is updated
            }

            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            io.getIO().emit('posts', { action: 'update', post: result });//emitting an event to all connected clients about the updated post
            res.status(200).json({ message: 'Post updated!', post: result }); //200 status code for successful put request
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500; //500 status code for server error
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) { //if post is undefined, this will happen when  findById will retrun null if not found
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }


            if (post.creator.toString() !== req.userId) { //check if the logged in user is the creator of the post
                const error = new Error('Not authorized to delete this post.');
                error.statusCode = 403; //403 status code for forbidden
                throw error;
            }
            //check logged in user
            clearImage(post.imageUrl); //delete the image file associated with the post
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId); //remove the post from the user's posts array
            return user.save();
        })
        .then(result => {
            io.getIO().emit('posts', { action: 'delete', post: postId });//emitting an event to all connected clients about the deleted post
            res.status(200).json({ message: 'Post deleted!' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updateStatus = (req, res, next) => {
    const newStatus = req.body.status;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }
            user.status = newStatus;
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'User status updated.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


//helper function to delete a file
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err)); //unlink is a method to delete a file
}
