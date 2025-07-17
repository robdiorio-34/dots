const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Increase the max workers
config.maxWorkers = 4;



module.exports = config; 