
'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var async = require('async');

//
// arbitrary benching
var bench;


//
// this is the endpoint we're going to use for checking media availability
var media = url.parse(process.env.NODE_HOST_MEDIA || 'http://127.0.0.1:8080/media');

var thenewappsPath = __dirname + '/../../test/fixtures/thenewapps.json';
var path = process.env.NODE_THENEWAPPS_JSON || 'http://127.0.0.1:8080/thenewapps.json';
var thenewapps = require(thenewappsPath);
var route = process.env.NODE_THENEWAPPS_ROUTE || '/thenewapps';

function rewriteManifest(init) {
  fs.unlink(thenewappsPath, function(err) {
    if (err) return console.log(err);
    fs.writeFile(thenewappsPath, JSON.stringify(thenewapps, null, '  '), function(err) {
      if (err) console.log(err);
      else {
        if (!init) return;
        process.emit('init');
      }
    });
  });
}

function checkMediaAvailability() {
  console.log('running head requests on media resources');
  bench = process.hrtime();
  function head(done) {
    return http.request({
      hostname: media.hostname,
      path: [media.path, this.uri].join('/'),
      method: 'head'
    }, function(res) {
      var headResponse = '';
      res.on('data', function(data) {
        headResponse += data;
      }).on('end', function() {
        this.available = parseInt(
          res.headers['content-length'], 10
        ) >= this.size;
        done(null, this.available);
      }.bind(this));
    }.bind(this)).on('error', done.bind(done)).end();
  }
  var headRequests = [];
  thenewapps.categories.forEach(function(category) {
    (category.media || []).forEach(function(medium) {
      if (medium.available) return;
      headRequests.push(head.bind(medium));
    });
    (category.categories || []).forEach(function(category) {
      category.media.forEach(function(medium) {
        if (medium.available) return;
        headRequests.push(head.bind(medium));
      });
    });
  });
  async.parallel(headRequests, function(err, results) {
    var finished = process.hrtime(bench);
    var nanoseconds = finished[0] * 1e9 + finished[1];
    console.log('requests took', nanoseconds, 'ns');
    if (err) console.log('head requests error:', err);
    else rewriteManifest(true);
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
  process.on('init', function() {
    console.log('manifest was rewritten. reloading...');
    thenewapps = require(thenewappsPath);
    init.call(app, thenewapps);
  });

  //
  // run the media availability check every fifteen minutes
  setInterval(
    checkMediaAvailability.bind(app),
    (1000 * 60) * 15
  );

  // run it once, immediately
  checkMediaAvailability(true);
};
