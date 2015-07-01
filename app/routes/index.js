
module.exports = function(app, callback) {

  require('./status')(app);
  require('./apps')(app);
  require('./logs')(app);

  return callback(app);
};
