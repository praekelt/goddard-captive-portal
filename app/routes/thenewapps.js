
'use strict';

var url = require('url');
var http = require('http');

var thenewappsPath = __dirname + '/../../test/fixtures/thenewapps.json';
var media = url.parse(process.env.NODE_HOST_MEDIA || 'http://127.0.0.1:8080/media');
var path = process.env.NODE_THENEWAPPS_JSON || 'http://127.0.0.1:8080/thenewapps.json';
var thenewapps = require(thenewappsPath);
var route = process.env.NODE_THENEWAPPS_ROUTE || '/thenewapps';

var heads = 0, finished = 0;

function rewriteManifest() {
  fs.unlink(thenewappsPath, function(err) {
    if (err) return done(err);
    fs.writeFile(thenewappsPath, JSON.stringify(thenewapps), function(err) {
      if (err) return done(err);
      done();
    });
  });
}

function checkMediaAvailability() {
  var requests = [];
  this.get('thenewapps.content.dontHaveCategories').forEach(function(category, i) {
    category.media.forEach(function(medium, k) {
      heads += 1;
      requests.push(http.request({
        hostname: media.hostname,
        path: [media.path, category.uri, medium.uri].join('/'),
        method: 'head'
      }, function(res) {
        process.emit('head:response', i, k, res.headers['content-length']);
      }));
    });
  });
  this.get('thenewapps.content.haveCategories').forEach(function(category, i) {
    category.media.forEach(function(medium, k) {
      heads += 1;
      requests.push(http.request({
        hostname: media.hostname,
        path: [media.path, category.uri, medium.uri].join('/'),
        method: 'head'
      }, function(res) {
        process.emit('head:response', i, k, res.headers['content-length']);
      }));
    });
  });

  requests.forEach(function(request) {
    request.end();
  });
}

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

function init(manifest) {
  collate.call(this, manifest);
  registerAllParentCategories.call(this);
  registerAllTopLevelCategories.call(this);
  this.all(route, function(req, res) {
    res.render('thenewapps_home', {
      category: {name: 'mamaconnect', uri: route},
      menu: this.get('thenewapps.content.menu')
    });
  }.bind(this));
}

module.exports = function(app) {
  process.on('head:response', function(categoryIndex, mediaIndex, size) {
    var medium = thenewapps.categories[categoryIndex].media[mediaIndex];
    medium.available = size >= medium.size;
    if (++finished !== heads) return;
    heads = 0, finished = 0;
    rewriteManifest(function(err) {
      if (err) console.log(err);
      thenewapps = require(thenewappsPath);
      init.call(app, thenewapps);
    });
  });

  init.call(app, thenewapps);

  // ready to test once we have a host web server to use
  // setInterval(checkMediaAvailability.bind(app), 90000);
};
