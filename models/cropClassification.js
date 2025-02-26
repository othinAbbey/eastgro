// const tf = require('@tensorflow/tfjs-node');
// const mobilenet = require('@tensorflow-models/mobilenet');
import tf from '@tensorflow/tfjs-node';
import mobilenet from '@tensorflow-models/mobilenet';
const classifyCrop = async (imageBuffer) => {
  const model = await mobilenet.load();
  const image = tf.node.decodeImage(imageBuffer);
  const predictions = await model.classify(image);
  return predictions;
};

export default classifyCrop;