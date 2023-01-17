var multer = require("multer");
const path = require("path");

const getUploadMiddleware = (uploadPath) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "public/" + uploadPath));
    },
    filename: function (req, file, cb) {
      const fileName =
        file.fieldname + "-" + Date.now() + "-" + file.originalname;
      cb(null, fileName);
    },
  });

  var upload = multer({ storage });
  return upload.any();
};

const getExtendUploadWithFilenameMiddleware =
  (uploadPath) => (req, res, next) => {
    if (req.method === "POST" && req.originalUrl === "/files") {
      // req.body.createdAt = Date.now()
      req.body.filename = "/" + uploadPath + "/" + req.files[0].filename;
    }
    // Continue to JSON Server router
    next();
  };

module.exports = {
  getUploadMiddleware,
  getExtendUploadWithFilenameMiddleware,
};
