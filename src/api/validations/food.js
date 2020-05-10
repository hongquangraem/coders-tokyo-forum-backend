const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom')


let validatePOST = (req, res, next) => {
  let schema = Joi.object().keys({
    topic: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    banner: Joi.object().required(),
    food: Joi.object().keys({
      restaurant: Joi.string().required(),
      url: Joi.string().optional(),
      stars: Joi.number().optional(),
      country: Joi.string().optional(),
      priceAverage: Joi.string().allow('').optional(),
      quality: Joi.number().required(),
      price: Joi.number().required(),
      service: Joi.number().required(),
      space: Joi.number().optional(),
      stars: Joi.number().required(),
      location: Joi.string().allow('').optional(),
      openTime: Joi.string().allow('').optional(),
      foodPhotos: Joi.array().required(),
    }).required(),
    type: Joi.string().optional()
  })
  
  let reqData = req.body;
  const { error } = schema.validate(reqData)
  if (error) {
    throw Boom.badRequest(error.message)
  }

  return next()
}

let validatePUT = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    throw Boom.badRequest('Atleast 1 field required')
  }
  let schema = Joi.object().keys({
    topic: Joi.string().optional(),
    description: Joi.string().allow('').optional(),
    content: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    coverImage: Joi.object().optional(),
    food: Joi.object().keys({
      foodName: Joi.string().required(),
      url: Joi.string().optional(),
      price: Joi.string().required(),
      location: Joi.string().optional(),
      star: Joi.number().optional()
    }).optional(),
    foodPhotos: Joi.array().optional(),
    type: Joi.string().optional()
  })
  
  let reqData = req.body;
  if (req.files.coverImage) {
    reqData.coverImage = req.files['coverImage'][0]
  }

  if (req.files.foodPhotos) {
    reqData.foodPhotos = req.files['foodPhotos'].map(photo => photo)
  }
  const { error } = schema.validate(reqData)
  if (error) {
    throw Boom.badRequest(error.message)
  }

  return next()
}

module.exports = {
  validatePOST,
  validatePUT
};