
module.exports = function(app) {
  require('./status')(app);
  require('./logs')(app);
  require('./apps')(app);
};
