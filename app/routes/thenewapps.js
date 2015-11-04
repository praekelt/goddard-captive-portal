
'use strict';

var fs = require('fs'), url = require('url'), http = require('http'), async = require('async');


//
// arbitrary benching
var bench;


//
// this is the endpoint we're going to use for checking media availability
// 'http://data.goddard.com/media' 'http://127.0.0.1:8080/media'
var media = url.parse(process.env.NODE_HOST_MEDIA || 'http://data.goddard.com/media');

var thenewappsPath = __dirname + '/../../test/fixtures/thenewapps.json';
var path = process.env.NODE_THENEWAPPS_JSON || 'http://127.0.0.1:8080/thenewapps.json';
var thenewapps = require(thenewappsPath);
var route = process.env.NODE_THENEWAPPS_ROUTE || '/thenewapps';

function rewriteManifest(init) {
  fs.unlink(thenewappsPath, function(err) {
    if (err) return process.emit('console:log', 'error', err);
    fs.writeFile(thenewappsPath, JSON.stringify(thenewapps, null, '  '), function(err) {
      if (err) process.emit('console:log', 'error', err);
      else {
        if (!init) return;
        process.emit('init');
      }
    });
  });
}

function checkMediaAvailability() {
  if (process.env.NODE_ENV.indexOf('test') !== -1) {
    process.emit('console:log', 'detected testing environment, skipping media availability check...');
    return rewriteManifest(true);
  }
  process.emit('console:log', 'running head requests on media resources');
  bench = process.hrtime();
  function head(done) {
    return http.request({
      hostname: media.hostname,
      path: [media.path, this.medium.uri].join('/'),
      method: 'head'
    }, function(res) {
      // do head requests need to fetch the entire
      // response to determine content-length, etc?
      var headResponse = '';
      res.on('data', function(data) {
        headResponse += data;
      }).on('end', function() {
        // if (res.statusCode === 404) { // god, this is ugly ._.
        //   if (!this.ccI) {
        //     if (!thenewapps.categories[this.cI].media) return done();
        //     thenewapps.categories[this.cI].media.splice(this.mI, 1);
        //   } else {
        //     thenewapps.categories[this.cI].categories[this.ccI].media.splice(this.mI, 1);
        //   }
        //   return done();
        // }
        if (this.ccI) {
          var media = thenewapps.categories[this.cI].categories[this.ccI].media;
          if (!media) return done();
          media[this.mI].available = parseInt(res.headers['content-length'], 10) >= media[this.mI].size;
        } else {
          var media = thenewapps.categories[this.cI].media;
          if (!media) return done();
          media[this.mI].available = parseInt(res.headers['content-length'], 10) >= media[this.mI].size;
        }
        // this.medium.available = parseInt(
        //   res.headers['content-length'], 10
        // ) >= this.size;
        done();
      }.bind(this));
    }.bind(this)).on('error', done.bind(done)).end();
  }
  var headRequests = [];
  thenewapps.categories.forEach(function(category, cI) {
    (category.media || []).forEach(function(medium, mI) {
      headRequests.push(head.bind({medium: medium, cI: cI, ccI: null, mI: mI}));
    });
    (category.categories || []).forEach(function(category, ccI) {
      category.media.forEach(function(medium, mI) {
        headRequests.push(head.bind({medium: medium, cI: cI, ccI: ccI, mI: mI}));
      });
    });
  });
  async.parallel(headRequests, function(err, results) {
    if (err) console.log('error', err);
    var finished = process.hrtime(bench);
    var nanoseconds = finished[0] * 1e9 + finished[1];
    process.emit('console:log', 'requests took', nanoseconds, 'ns');
    if (err) process.emit('console:log', 'error', err);
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
  var uri = [parentUri, category.uri].join('/');
  registerCategoryMedia.call(this, category.media || [], uri);
  this.all(uri, function(req, res) {
    res.render('thenewapps_category', {
      menu: menu,
      parent: parentUri,
      category: category
    });
  });
}

function registerCategoryMedia(media, parentUri) {
  var menu = this.get('thenewapps.content.menu');
  media.forEach(function(medium, i) {
    this.all([parentUri, 'video', i].join('/'), function(req, res) {
      res.render('thenewapps_medium', {
        menu: menu,
        parent: parentUri,
        medium: medium
      });
    });
  }, this);
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
    process.emit('console:log', 'manifest was rewritten. reloading...');
    thenewapps = require(thenewappsPath);
    process.emit('console:log', 'reloaded...');
    init.call(app, thenewapps);
    process.emit('console:log', 'mamaconnect content sytem initialised!');
  });

  //
  // run the media availability check every fifteen minutes
  setInterval(
    checkMediaAvailability.bind(app),
    (1000 * 60) * 15
  );

  // run it once, immediately
  checkMediaAvailability.call(app);
};
