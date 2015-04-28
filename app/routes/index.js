
module.exports = function(app, callback) {

  require('./status')(app);
  require('./apps')(app);

  process.nextTick(function() {
    callback(app);
  });
};
