
module.exports = function(app) {
  require('./status')(app);
  require('./apps')(app);
  require('./logs')(app);
  require('./thenewapps')(app);
};
