var express = require("express");
var router = express.Router();
const fs = require("fs");
var path = require("path");

router.get("/", function (req, res, next) {
  const pictures = fs.readdirSync(path.join(__dirname, "../pictures/"));
  res.render("pictures", { pictures: pictures });
});

router.post("/", function (req, res, next) {
  const file = req.files.file;
  try {
    fs.writeFileSync(
      path.join(__dirname, "../pictures/", file.name),
      file.data
    );
    console.log("File saved successfully");
    res.end();
  } catch (err) {
    console.error("Error saving file:", err);
    res.status(500).send("Error saving file");
  }
});

module.exports = router;
