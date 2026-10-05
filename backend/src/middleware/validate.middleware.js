// // src/middleware/validate.middleware.js
// // express-validator result handler.
// // Add this AFTER validation chains in any route definition.

// const { validationResult } = require("express-validator");
// const { sendError } = require("../utils/response.utils");

// const validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return sendError(res, 422, "Validation failed.", errors.array());
//   }
//   next();
// };

// module.exports = { validate };


const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('🚨 BACKEND VALIDATION FAILED FOR:', req.body)
    console.log('🚨 EXACT ERRORS:', JSON.stringify(errors.array(), null, 2))

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    })
  }
  next()
}

// Export both default and named to handle any import style
module.exports = validate
module.exports.validate = validate