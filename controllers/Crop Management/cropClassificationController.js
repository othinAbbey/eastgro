// const express = require('express');
// const { classifyCrop } = require('./ai');
// const router = express.Router();

// router.post('/classify-crop', async (req, res) => {
//   const { imageBuffer } = req.body;
//   const predictions = await classifyCrop(imageBuffer);
//   res.json(predictions);
// });

// module.exports = router;

// const tf = require('@tensorflow/tfjs-node');
// const mobilenet = require('@tensorflow-models/mobilenet');
// import tf from '@tensorflow/tfjs-node';
// import mobilenet from '@tensorflow-models/mobilenet';
const classifyCrop = async (imageBuffer) => {
  const model = await mobilenet.load();
  const image = tf.node.decodeImage(imageBuffer);
  const predictions = await model.classify(image);
  return predictions;
};

export default classifyCrop;