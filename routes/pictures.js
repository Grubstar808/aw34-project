var express = require("express");
var router = express.Router();
const fs = require("fs");
var path = require("path");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { requiresAuth } = require("express-openid-connect");

router.get("/", requiresAuth(), async function (req, res, next) {
  var params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Delimiter: "/",
    Prefix: req.oidc.user.email + "/",
  };
  var allObjects = await s3.listObjects(params).promise();
  var keys = allObjects?.Contents.map((x) => x.Key);
  const pictures = await Promise.all(
    keys.map(async (key) => {
      let my_file = await s3
        .getObject({
          Bucket: process.env.CYCLIC_BUCKET_NAME,
          Key: key,
        })
        .promise();
      return {
        src: Buffer.from(my_file.Body).toString("base64"),
        name: key.split("/").pop(),
      };
    })
  );
  res.render("pictures", {
    pictures: pictures,
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

router.get("/:fileName", requiresAuth(), async function (req, res, next) {
  const fileName = req.params.fileName;

  const key = req.oidc.user.email + "/" + fileName;

  const params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: key,
  };

  const my_file = await s3.getObject(params).promise();

  const picture = {
    src: Buffer.from(my_file.Body).toString("base64"),
    name: fileName,
  };

  res.render("pictures", {
    pictures: [picture],
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

router.post("/", requiresAuth(), async function (req, res, next) {
  const file = req.files.file;
  await s3
    .putObject({
      Body: file.data,
      Bucket: process.env.CYCLIC_BUCKET_NAME,
      Key: req.oidc.user.email + "/" + file.name,
    })
    .promise();
  console.log("File saved successfully");
  res.end();
});

module.exports = router;
