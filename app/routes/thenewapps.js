
'use strict';

var path = process.env.NODE_THENEWAPPS_JSON || 'http://127.0.0.1:8080/thenewapps.json';
var thenewapps = require('../../test/fixtures/thenewapps.json');
var route = process.env.NODE_THENEWAPPS_ROUTE || '/thenewapps';

function collate(manifest) {
  this.set('thenewapps.content.menu', manifest.categories.map(function(category) {
    return {name: category.name, uri: route + '/' + category.uri};
  }));
  this.set('thenewapps.content.haveCategories', manifest.categories.filter(function(category) {
    return !!category.categories;
  }));
  this.set('thenewapps.content.dontHaveCategories', manifest.categories.filter(function(category) {
    return !category.categories;
  }));
}

function registerAllParentCategories() {
  var haveCategories = this.get('thenewapps.content.haveCategories');
  var menu = this.get('thenewapps.content.menu');
  haveCategories.forEach(function(listing) {
    var uri = [route, listing.uri].join('/');
    this.all(uri, function(req, res) {
      res.render('thenewapps_listing', {
        menu: menu,
        category: listing,
        parent: route,
        categories: listing.categories
      });
    });
    listing.categories.forEach(function(category) {
      registerChildCategory.call(this, category, uri);
    }, this);
  }, this);
}

function registerAllTopLevelCategories() {
  var dontHave = this.get('thenewapps.content.dontHaveCategories');
  dontHave.forEach(function(category) {
    registerChildCategory.call(this, category, route);
  }, this);
}

function registerChildCategory(category, parentUri) {
  var menu = this.get('thenewapps.content.menu');
  this.all([parentUri, category.uri].join('/'), function(req, res) {
    res.render('thenewapps_category', {
      menu: menu,
      parent: parentUri,
      category: category
    });
  });
}

module.exports = function(app) {
  collate.call(app, thenewapps);
  registerAllParentCategories.call(app);
  registerAllTopLevelCategories.call(app);
  app.all(route, function(req, res) {
    res.render('thenewapps_home', {
      category: {name: 'mamaconnect', uri: route},
      menu: app.get('thenewapps.content.menu')
    });
  });
};
