// // src/middleware/validators/auth.validators.js
// // express-validator chains for auth routes.

// const { body } = require("express-validator");

// const registerValidation = [
//   body("role")
//     .trim()
//     .notEmpty().withMessage("Role is required.")
//     .isIn(["admin", "faculty"]).withMessage("Role must be 'admin' or 'faculty'."),

//   body("name")
//     .trim()
//     .notEmpty().withMessage("Name is required.")
//     .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

//   body("email")
//     .trim()
//     .notEmpty().withMessage("Email is required.")
//     .isEmail().withMessage("Must be a valid email address.")
//     .normalizeEmail(),

//   body("password")
//     .notEmpty().withMessage("Password is required.")
//     .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

//   // Role-specific fields
//   body("facultyId")
//     .if(body("role").equals("faculty"))
//     .trim()
//     .notEmpty().withMessage("Faculty ID is required for role 'faculty'."),

//   body("adminId")
//     .if(body("role").equals("admin"))
//     .trim()
//     .notEmpty().withMessage("Admin ID is required for role 'admin'."),

//   body("department")
//     .if(body("role").equals("faculty"))
//     .trim()
//     .notEmpty().withMessage("Department is required for faculty."),
// ];

// const loginValidation = [
//   body("email")
//     .trim()
//     .notEmpty().withMessage("Email is required.")
//     .isEmail().withMessage("Must be a valid email address.")
//     .normalizeEmail(),

//   body("password")
//     .notEmpty().withMessage("Password is required."),

//   body("role")
//     .trim()
//     .notEmpty().withMessage("Role is required.")
//     .isIn(["admin", "faculty"]).withMessage("Role must be 'admin' or 'faculty'."),
// ];

// module.exports = { registerValidation, loginValidation };






// src/middleware/validators/auth.validators.js
// express-validator chains for auth routes.

// const { body } = require("express-validator");

// const registerValidation = [
//   body("role")
//     .trim()
//     .notEmpty().withMessage("Role is required.")
//     .isIn(["admin", "faculty", "student", "superadmin"])
//     .withMessage("Role must be 'admin', 'faculty' or 'student'."),

//   body("name")
//     .trim()
//     .notEmpty().withMessage("Name is required.")
//     .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

//   body("email")
//     .trim()
//     .notEmpty().withMessage("Email is required.")
//     .isEmail().withMessage("Must be a valid email address.")
//     .normalizeEmail(),

//   body("password")
//     .notEmpty().withMessage("Password is required.")
//     .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

//   // Role-specific fields (only enforced when that role is chosen)
//   body("facultyId")
//     .if(body("role").equals("faculty"))
//     .trim()
//     .notEmpty().withMessage("Faculty ID is required for role 'faculty'."),

//   body("adminId")
//     .if(body("role").equals("admin"))
//     .trim()
//     .notEmpty().withMessage("Admin ID is required for role 'admin'."),

//   body("department")
//     .if(body("role").equals("faculty"))
//     .trim()
//     .notEmpty().withMessage("Department is required for faculty."),

//   // Student-specific optional fields (do not break other roles)
//   body("studentId")
//     .if(body("role").equals("student"))
//     .optional()
//     .trim(),

//   body("semester")
//     .if(body("role").equals("student"))
//     .optional()
//     .isInt({ min: 1, max: 8 })
//     .withMessage("Semester must be between 1 and 8."),
// ];

// const loginValidation = [
//   body("email")
//     .trim()
//     .notEmpty().withMessage("Email is required.")
//     .isEmail().withMessage("Must be a valid email address.")
//     .normalizeEmail(),

//   body("password")
//     .notEmpty().withMessage("Password is required."),

//   body("role")
//     .trim()
//     .notEmpty().withMessage("Role is required.")
//     .isIn(["admin", "faculty", "student", "superadmin"])
//     .withMessage("Role must be 'admin', 'faculty' or 'student'."),
// ];

// module.exports = {
//   registerValidation,
//   loginValidation,
//   // aliases used by some route files
//   loginRules: loginValidation,
//   registerRules: registerValidation,
// };











// src/middleware/validators/auth.validators.js
// express-validator chains for auth routes.

const { body } = require("express-validator");

const registerValidation = [
  body("role")
    .trim()
    .notEmpty().withMessage("Role is required.")
    .isIn(["admin", "faculty", "student", "superadmin"])
    .withMessage("Role must be 'admin', 'faculty' or 'student'."),

  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  // Role-specific fields (enforced conditionally)
  body("facultyId")
    .if(body("role").equals("faculty"))
    .trim()
    .notEmpty().withMessage("Faculty ID is required for role 'faculty'."),

  body("adminId")
    .if(body("role").equals("admin"))
    .trim()
    .notEmpty().withMessage("Admin ID is required for role 'admin'."),

  body("department")
    .if(body("role").equals("faculty"))
    .trim()
    .notEmpty().withMessage("Department is required for faculty."),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),

  body("role")
    .trim()
    .notEmpty().withMessage("Role is required.")
    .isIn(["admin", "faculty", "student", "superadmin"])
    .withMessage("Role must be 'admin', 'faculty' or 'student'."),
];

module.exports = {
  registerValidation,
  loginValidation,
  loginRules: loginValidation,
  registerRules: registerValidation,
};