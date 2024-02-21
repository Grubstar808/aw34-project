var express = require("express");
var router = express.Router();
const fs = require("fs");
var path = require("path");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { requiresAuth } = require("express-openid-connect");

router.get("/", requiresAuth(), function (req, res, next) {
  const pictures = fs.readdirSync(path.join(__dirname, "../pictures/"));
  res.render("pictures", { pictures: pictures });
});

router.get("/:fileName", function (req, res, next) {
  const fileName = req.params?.fileName;
  const pictures = fs.readdirSync(path.join(__dirname, "../pictures/"));
  const matchingPictures = pictures.filter((picture) => picture === fileName);
  res.render("pictures", { pictures: matchingPictures });
});

router.post("/", requiresAuth(), async function (req, res, next) {
  const file = req.files.file;
  try {
    await s3
      .putObject({
        Body: file.data,
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: "public/" + file.name,
      })
      .promise();
    console.log("File saved successfully");
    res.end();
  } catch (err) {
    console.error("Error saving file:", err);
    res.status(500).send("Error saving file");
  }
});

module.exports = router;
