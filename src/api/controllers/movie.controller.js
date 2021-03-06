const Boom = require('@hapi/boom');
const Utils = require('@utils');
const { Post, File } = require('@models');
const Promise = require('bluebird');
const { FILE_REFERENCE_QUEUE } = require('@bull')

exports.createMovieReview = async (req, res, next) => {
  const type = 'movie'
  const {
    body: { tags, authors, cover, movie },
    user,
  } = req;

  try {
    const newMovieReview = new Post({
      user: user._id,
      ...req.body,
      type,
    });

    let blogTags = []
    if (tags) blogTags = await Utils.post.createTags(tags)

    let authorsCreated = await Utils.post.creatAuthors(authors)

    newMovieReview.cover = req.body.cover._id;
    if (blogTags.length) newMovieReview.tags = blogTags.map(tag => tag._id)
    newMovieReview.authors = authorsCreated.map(author => author._id)
    newMovieReview.movie = movie

    const promises = [
      newMovieReview.save(),
      File.findByIdAndUpdate(
        cover._id,
        {
          $set: { postId: newMovieReview._id }
        },
        { new: true }
      )
    ]

    const [createdMovieReview, _] = await Promise.all(promises)
    let dataRes = {
      _id: createdMovieReview.id,
      url: createdMovieReview.url,
      topic: createdMovieReview.topic,
      description: createdMovieReview.description,
      content: createdMovieReview.content,
      type: createdMovieReview.type,
      cover: req.body.cover,
      authors: authorsCreated,
      tags: blogTags,
      movie,
      createdAt: createdMovieReview.createdAt
    }

    return res.status(200).json({
      status: 200,
      data: dataRes,
    });
  } catch (error) {
    return next(error);
  }
};

exports.editMovieReview = async (req, res, next) => {
  const type = 'movie'
  const { topic,
    description,
    content,
    tags,
    authors,
    url,
    movie,
    cover,
  } = req.body;
  try {
    const movieReview = await Post.findOne({
      _id: req.params.postId,
      user: req.user._id,
      type,
    })
      .lean()
      .populate({ path: 'tags', select: '_id tagName' })
      .populate({ path: 'authors', select: '_id name type' });
    if (!movieReview) {
      throw Boom.badRequest('Not found food blog reivew, edit failed');
    }

    let query = { movie };
    if (topic) query.topic = topic;
    if (description) query.description = description;
    if (content) query.content = content;
    if (url) query.url = url;
    if (tags) {
      const newTags = await Utils.post.removeOldTagsAndCreatNewTags(
        movieReview,
        tags,
      );

      query.tags = newTags;
    }

    if (authors) {
      const newAuthors = await Utils.post.removeOldAuthorsAndCreateNewAuthors(
        movieReview,
        authors,
      );

      query.authors = newAuthors;
    }

    if (cover) query.cover = req.body.cover._id

    const upadatedBlog = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: query,
      },
      { new: true },
    )
      .lean()
      .populate([
        { path: 'tags', select: 'tagName' },
        { path: 'authors', select: 'name type' },
      ])
      .select('-__v -media');

    return res.status(200).json({
      status: 200,
      data: upadatedBlog,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteMovieReview = async (req, res, next, type) => {
  try {
    const movieReview = await Post.findOne({
      _id: req.params.postId,
      user: req.user._id,
      type,
    })
      .lean()
      .populate({ path: 'cover' })

    if (!movieReview) {
      throw Boom.badRequest('Not found movie blog review');
    }

    FILE_REFERENCE_QUEUE.deleteFile.add({ file: movieReview.cover })
    const isDeleted = await Post.findByIdAndDelete(movieReview._id)

    if (!isDeleted) {
      throw Boom.badRequest('Delete movie blog review failed')
    }

    return res.status(200).json({
      status: 200,
      message: `Delete movie blog review successfully`,
    });
  } catch (error) {
    return next(error);
  }
};
