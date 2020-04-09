const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom')

let updateProfileValidate = (req, res, next) => {
  let schema = Joi.object().keys({
    path: Joi.string().required()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    throw Boom.badRequest(error.message)
  }

  const extension = ['jpeg', 'jpg', 'png']
  const imageExt = req.file.path.split('.')[1]
  if (!extension.includes(imageExt)) {
    throw Boom.badRequest('Invalid image extension')
  }
  return next()
}

let uploadAvatarValidate = (req, res, next) => {
  let schema = Joi.object().keys({
    username: Joi.string().optional(),
    sex: Joi.string().optional(),
    age: Joi.number().optional(),
    job: Joi.string().optional(),
    hobbies: Joi.array().items(Joi.string()).optional(),
    socialLinks: Joi.array().items(
      Joi.object(({
        type: Joi.string().required(),
        url: Joi.string().required()
      }))
    ).optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    throw Boom.badRequest(error.message)
  }

  console.log('here')
  return next()
}

module.exports = {
  uploadAvatarValidate,
  updateProfileValidate
};