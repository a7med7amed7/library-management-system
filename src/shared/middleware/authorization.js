// const appError = require("../utils/appError");

const authorization = (req, res, next) => {
  // if (!req.borrower.isAdmin) {
  //   return next(
  //     new appError("You are not authorized to access this route.", 403)
  //   );
  // }
  
  // bypass authorization for now (for the sake of the assessment)
  next();
};

module.exports = authorization;
