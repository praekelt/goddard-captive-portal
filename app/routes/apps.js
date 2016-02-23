
'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var async = require('async');

var NODE_TRAVIS = process.env.NODE_TRAVIS || false;
var GODDARD_HOST_MEDIA = process.env.GODDARD_HOST_MEDIA || 'http://data.goddard.com/media';
var GODDARD_APPS_ROUTE = process.env.GODDARD_APPS_ROUTE || '/';

var media = url.parse(GODDARD_HOST_MEDIA);
var APPS_FIXTURE_PATH = __dirname + '/../../test/fixtures/apps.json';
var APPS = require(APPS_FIXTURE_PATH);

function rewriteManifest(init) {
  fs.unlink(APPS_FIXTURE_PATH, function(err) {
    if (err) console.log('unlink error', err);
    fs.writeFile(APPS_FIXTURE_PATH, JSON.stringify(APPS, null, '  '), function(err) {
      if (err) process.emit('console:log', 'error', err);
      else {
        if (!init) return;
        process.emit('init', APPS_FIXTURE_PATH);
      }
    });
  });
}

function checkMediaAvailability() {
  if (NODE_TRAVIS) return rewriteManifest(true);
  process.emit('console:log', 'running head requests on media resources');
  function head(medium, cidx, ccidx, midx, done) {
    return http.request({
      hostname: media.hostname,
      path: [media.path, medium.uri].join('/'),
      method: 'head'
    }, function(res) {
      var headResponse = '';
      res.on('data', function(data) {
        headResponse += data;
      }).on('end', function() {
        if (ccidx) {
          var media = APPS.categories[cidx].categories[ccidx].media;
          if (!media) return done();
          media[midx].available = (
            res.statusCode === 200 &&
            parseInt(
              res.headers['content-length'], 10
            ) >= media[midx].size
          );
        } else {
          var media = APPS.categories[cidx].media;
          if (!media) return done();
          media[midx].available = (
            res.statusCode === 200 &&
            parseInt(
              res.headers['content-length'], 10
            ) >= media[midx].size
          );
        }
        done();
      });
    }).on('error', done).end();
  }
  var headRequests = [];
  APPS.categories.forEach(function(category, cidx) {
    (category.media || []).forEach(function(medium, midx) {
      headRequests.push(head.bind(head, medium, cidx, null, midx));
    });
    (category.categories || []).forEach(function(category, ccidx) {
      category.media.forEach(function(medium, midx) {
        headRequests.push(head.bind(head, medium, cidx, ccidx, midx));
      });
    });
  });
  async.parallel(headRequests, function(err, results) {
    if (err) process.emit('console:log', 'error', err);
    else rewriteManifest(true);
  });
}

function collate(manifest) {
  this.set(
    'apps.content.haveCategories',
    manifest.categories.filter(function(category) {
      return !!category.categories;
    })
  );
  this.set(
    'apps.content.dontHaveCategories',
    manifest.categories.filter(function(category) {
      return !category.categories;
    })
  );
  this.set(
    'apps.content.menu',
    [{
      name: 'Start Page',
      uri: GODDARD_APPS_ROUTE
    }, {
      name: 'All Videos',
      uri: GODDARD_APPS_ROUTE + 'all-videos'
    }].concat(
      manifest.categories.map(function(category) {
        return {
          name: category.name,
          uri: GODDARD_APPS_ROUTE + category.uri,
          thumbnail: category.thumbnail
        };
      })
    )
  );
}

function registerAllParentCategories() {
  var haveCategories = this.get('apps.content.haveCategories');
  var menu = this.get('apps.content.menu');
  haveCategories.forEach(function(listing) {
    var uri = GODDARD_APPS_ROUTE + listing.uri;
    var childCategoryMenu = [
      {name: 'Start Page', uri: GODDARD_APPS_ROUTE /* <-- homepage, category --> `uri` */},
      {name: 'All Videos', uri: uri + '/all-videos'}
    ].concat(
      listing.categories.map(function(category) {
        return {name: category.name, uri: uri + '/' + category.uri};
      })
    );

    this.all(uri, function(req, res) {
      res.render('apps_parenthome', {
        mediaHost: GODDARD_HOST_MEDIA,
        menu: childCategoryMenu,
        notIndexPage: true,
        category: listing,
        current: uri,
        parent: GODDARD_APPS_ROUTE,
        categories: listing.categories,
        hcwt: APPS.hcwt[0],
        currentCategory: uri
      });
    });
    this.all(uri + '/all-videos', function(req, res) {
      res.render('apps_listing', {
        mediaHost: GODDARD_HOST_MEDIA,
        menu: childCategoryMenu,
        notIndexPage: true,
        category: listing,
        heading: listing.name,
        current: uri + '/all-videos',
        parent: uri,
        categories: listing.categories,
        currentCategory: uri + '/all-videos'
      });
    });
    listing.categories.forEach(function(category) {
      category.menu = childCategoryMenu;
      registerChildCategory.call(this, category, uri);
    }, this);
  }, this);
}

function registerAllTopLevelCategories() {
  var dontHave = this.get('apps.content.dontHaveCategories');
  var menu = this.get('apps.content.menu');
  dontHave.forEach(function(category) {
    registerCategoryMedia.call(this, category, GODDARD_APPS_ROUTE + category.uri);
    this.all(GODDARD_APPS_ROUTE + category.uri, function(req, res) {
      res.render('apps_category', {
        mediaHost: GODDARD_HOST_MEDIA,
        menu: menu,
        current: GODDARD_APPS_ROUTE + category.uri,
        parent: GODDARD_APPS_ROUTE,
        category: category,
        notIndexPage: true,
        currentCategory: GODDARD_APPS_ROUTE + category.uri
      });
    });
  }, this);
}

function registerChildCategory(category, parentUri) {
  var menu = this.get('apps.content.menu');
  var uri = parentUri + '/' + category.uri;
  registerCategoryMedia.call(this, category, uri);
  this.all(uri, function(req, res) {
    res.render('apps_category', {
      mediaHost: GODDARD_HOST_MEDIA,
      menu: category.menu || menu,
      notIndexPage: true,
      current: uri,
      parent: parentUri,
      category: category,
      currentCategory: uri
    });
  });
}

function registerCategoryMedia(category, parentUri) {
  var menu = this.get('apps.content.menu');
  (category.media || []).forEach(function(medium, i) {
    this.all(parentUri + '/video/' + i, function(req, res) {
      res.render('apps_medium', {
        mediaHost: GODDARD_HOST_MEDIA,
        menu: category.menu || menu,
        parent: parentUri,
        medium: medium,
        categoryName: category.name,
        notIndexPage: true,
        currentCategory: parentUri
      });
    });
  }, this);
}

function registerMediaListing() {
  var menu = this.get('apps.content.menu');
  var topLevelCategoriesWithMedia = this.get('apps.content.dontHaveCategories').filter(function(category) {
    return category.media && category.media.length;
  });
  this.all(GODDARD_APPS_ROUTE + 'all-videos', function(req, res) {
    res.render('apps_allvideos', {
      mediaHost: GODDARD_HOST_MEDIA,
      menu: menu,
      current: GODDARD_APPS_ROUTE + 'all-videos',
      categories: topLevelCategoriesWithMedia,
      parent: GODDARD_APPS_ROUTE,
      notIndexPage: true,
      currentCategory: GODDARD_APPS_ROUTE + 'all-videos'
    });
  });
}

function init(manifest, done) {
  collate.call(this, manifest);
  registerAllParentCategories.call(this);
  registerAllTopLevelCategories.call(this);
  registerMediaListing.call(this);
  this.all(GODDARD_APPS_ROUTE, function(req, res) {
    if (req.hostname.indexOf('goddard') !== -1) {
      return res.redirect('http://mamawifi.com');
    }
    res.render('apps_home', {
      mediaHost: GODDARD_HOST_MEDIA,
      dyk: manifest.dyk[0],
      current: GODDARD_APPS_ROUTE,
      notIndexPage: false,
      category: {name: 'mamaconnect', uri: GODDARD_APPS_ROUTE},
      menu: this.get('apps.content.menu'),
      currentCategory: GODDARD_APPS_ROUTE
    });
  }.bind(this));
  return typeof done === 'function' ? done : undefined;
}

module.exports = function(app) {
  process.on('init', function(manifest) {
    process.emit('console:log', 'manifest was rewritten. reloading...');
    APPS = require(manifest);
    process.emit('console:log', 'reloaded...');
    init.call(app, APPS, process.emit.bind(
      process,
      'console:log',
      'mamaconnect content sytem initialised!'
    ));
  });

  // run the media availability
  // check every fifteen minutes.
  setInterval(
    checkMediaAvailability.bind(app),
    (1000 * 60) * 15
  );
  // and run it once, immediately.
  checkMediaAvailability.call(app);
};
