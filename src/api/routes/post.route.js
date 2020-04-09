const express = require('express');
const multer = require('multer');
const { PostController } = require('@controllers');
const { checkAccessToken } = require('@middlewares/authorize');
const paginate = require('@middlewares/pagination');
const {
  createPostValidate,
} = require('../validations/post');

const router = express.Router();
var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.route('/').get(paginate(), PostController.getPosts);

router
  .route('/tags')
  .get(paginate(), PostController.getPostsByTagsName);

router.route('/:postId').get(PostController.getOnePost);

router
  .route('/')
  .post(
    checkAccessToken,
    upload.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'foodPhotos', maxCount: 10 },
    ]),
    PostController.createPost,
  );

router
  .route('/:postId')
  .put(
    checkAccessToken,
    upload.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'foodPhotos', maxCount: 10 },
    ]),
    PostController.editPost,
  );

router
  .route('/users/:userId')
  .get(paginate({ limit: 15 }), PostController.getPosts);

router
  .route('/saved-posts/users/:userId')
  .get(paginate({ limit: 15 }), PostController.getSavedPosts);

router
  .route('/:postId')
  .delete(checkAccessToken, PostController.deletePost);

router
  .route('/:postId/like')
  .post(checkAccessToken, PostController.likePost);

router
  .route('/:postId/unlike')
  .post(checkAccessToken, PostController.unlikePost);

router
  .route('/:postId/save')
  .post(checkAccessToken, PostController.savePost);

router
  .route('/:postId/unsave')
  .post(checkAccessToken, PostController.unsavePost);

module.exports = router;
