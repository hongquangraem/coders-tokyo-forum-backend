const Boom = require('@hapi/boom');
const Utils = require('@utils');
const { Post } = require('@models');
const Promise = require('bluebird');

exports.createDiscussion = async (req, res, next) => {
  const type = 'discussion';

  const {
    body: { topic, tags, content },
    user,
  } = req;

  try {
    const discussion = {
      user: user._id,
      topic,
      content,
      type,
    };

    let discussionTags;
    if (tags) {
      discussionTags = await Utils.post.createTags(tags);
      discussion.tags = discussionTags.map((tag) => tag._id);
    }
    const createdDissucsion = await new Post(discussion).save();
    const resData = {
      _id: createdDissucsion._id,
      tags: discussionTags || [],
      topic,
      content,
      type,
      user: user._id,
      createdAt: createdDissucsion.createdAt,
    };
    return res.status(200).json({
      status: 200,
      data: resData,
    });
  } catch (error) {
    return next(error);
  }
};

exports.editDiscussion = async (req, res, next) => {
  const { topic, content, tags } = req.body;
  const type = 'discussion';

  try {
    const discussion = await Post.findOne({
      _id: req.params.postId,
      user: req.user._id,
      type,
    })
      .lean()
      .populate({ path: 'tags', select: 'tagName ' });

    if (!discussion) {
      throw Boom.badRequest('Not found discussion, edit discussion failed');
    }

    const query = {};
    if (topic) query.topic = topic;
    if (content) query.content = content;
    if (tags) {
      const newTags = await Utils.post.removeOldTagsAndCreatNewTags(
        discussion,
        tags,
      );

      query.tags = newTags;
    }

    const updatedDiscussion = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: query,
      },
      { new: true },
    )
      .lean()
      .populate({ path: 'tags', select: 'tagName ' })
      .select(' -__v -url -media -authors');

    return res.status(200).json({
      status: 200,
      data: updatedDiscussion,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteDiscussion = async (req, res, next, type) => {
  try {
    const isDeleted = await Post.findByIdAndDelete(req.params.postId);
    if (!isDeleted) throw Boom.badRequest('Delete post failed');

    return res.status(200).json({
      status: 200,
      message: 'Delete discussion successfully',
    });
  } catch (error) {
    return next(error);
  }
};
