const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const S3_BUCKET = process.env.S3_BUCKET;

exports.handler = async (event) => {
  console.log(`\n${JSON.stringify(event, null, 2)}`);
  console.log(`S3_BUCKET = ${S3_BUCKET}`);

  await s3.headBucket({Bucket: S3_BUCKET}).promise();

  return 'success';
};