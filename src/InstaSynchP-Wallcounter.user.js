// ==UserScript==
// @name        InstaSynchP Wallcounter
// @namespace   InstaSynchP
// @description Summarizes the lengths of each users video walls

// @version     {{ VERSION }}
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Wallcounter
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js?version=37716
// ==/UserScript==

function Wall(username) {
  "use strict";
  this.duration = 0;
  this.videoCount = 0;
  this.username = username;
}

Wall.prototype.add = function (video) {
  "use strict";
  this.videoCount++;
  this.duration += video.duration;
};

Wall.prototype.remove = function (video) {
  "use strict";
  this.videoCount--;
  this.duration -= video.duration;
};

Wall.prototype.format = function (format) {
  "use strict";
  var th = this;
  return format.format(
    th.username,
    window.utils.secondsToTime(th.duration),
    th.videoCount
  );
};

function Wallcounter() {
  "use strict";
  this.version = '{{ VERSION }}';
  this.name = 'InstaSynchP Wallcounter';
  this.counter = {};
  this.ownCounter = undefined;
  this.commands = {
    "'wallcounter": {
      'hasArguments': true,
      'reference': this,
      'description': 'Summarizes the lengths of each users video walls or specific users',
      'callback': this.execute
    }
  };
  this.styles = [{
    'name': 'wallcounter',
    'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Wallcounter/{{ WALLCOUNTERCSSREV }}/dist/wallcounter.css',
    'autoload': true
  }];
}

Wallcounter.prototype.resetVariables = function () {
  "use strict";
  this.ownCounter = undefined;
  this.counter = {};
};

Wallcounter.prototype.updateOwnDisplay = function () {
  "use strict";
  var th = this;
  $('#playlist_wallcounter').text(
    th.ownCounter.format('Wallcounter[{1} - {2}]')
  );
};

Wallcounter.prototype.key = function (key) {
  "use strict";
  return key.toLowerCase();
};

Wallcounter.prototype.increase = function (username, video) {
  "use strict";
  this.counter[this.key(username)].add(video);
};

Wallcounter.prototype.decrease = function (username, video) {
  "use strict";
  this.counter[this.key(username)].remove(video);
};

Wallcounter.prototype.create = function (username) {
  "use strict";
  this.counter[this.key(username)] = new Wall(username);
};

Wallcounter.prototype.createIfNotExists = function (username) {
  "use strict";
  var th = this;
  if (th.counter.hasOwnProperty(th.key(username))) {
    return;
  }
  th.create(username);
};

Wallcounter.prototype.bindUpdates = function () {
  "use strict";
  var th = this;

  function onAddVideo(video) {
    th.increase(video.addedby, video);
    th.updateOwnDisplay();
  }

  function onAddUser(user) {
    th.createIfNotExists(user.username);
  }

  function onLoadPlaylist(videos) {
    videos.forEach(function (video) {
      onAddUser({
        username: video.addedby
      });
      onAddVideo(video);
    });
    events.on(th, "AddVideo", onAddVideo, true);
  }

  //LoadPlaylist happens before LoadUserlist so the walls would not have been
  //created yet when recieving the AddVideo events
  events.on(th, 'LoadPlaylist', function () {
    events.unbind("AddVideo", onAddVideo);
  }, true);
  events.on(th, 'LoadPlaylist', onLoadPlaylist);

  events.on(th, "AddUser", onAddUser);

  events.on(th, "RemoveVideo", function (ignore, video) {
    th.decrease(video.addedby, video);
    th.updateOwnDisplay();
  }, true);
};

Wallcounter.prototype.executeOnce = function () {
  "use strict";
  var th = this;
  th.bindUpdates();
  events.on(th, 'Joined', function () {
    th.ownCounter = new Wall(thisUser().username);
    th.counter[th.key(th.ownCounter.username)] = th.ownCounter;
  });
};

Wallcounter.prototype.preConnect = function () {
  "use strict";
  //own wallcounter display below the playlist
  $('.playlist-stats').append(
    $('<div>', {
      id: 'playlist_wallcounter'
    }).text('Wallcounter[00:00 - 0]')
  );
};

Wallcounter.prototype.formatOutput = function (counts) {
  "use strict";
  //REFACTOR
  var output = "Wallcounter<br>";
  counts.forEach(function (count, index) {
    output += count.format('{0}[<b>{1}</b> - {2}] - ');
    //2 counters per line
    if ((index + 1) % 2 === 0) {
      //remove " - "
      output = output.substring(0, output.length - 3);
      output += '<br>';
    }
  });
  //remove " - "
  if (counts.length % 2 === 1) {
    output = output.substring(0, output.length - 3);
  }
  return output;
};

Wallcounter.prototype.getWallsForUsernames = function (usernames) {
  "use strict";
  var th = this,
    walls = [];
  usernames.forEach(function (username) {
    if (th.counter.hasOwnProperty(th.key(username)) &&
      th.counter[th.key(username)].videoCount !== 0) {
      walls.push(th.counter[th.key(username)]);
    }
  });
  return walls;
};

Wallcounter.prototype.execute = function (opts) {
  "use strict";
  var th = this,
    walls = [];

  if (opts.usernames.length !== 0) {
    walls = th.getWallsForUsernames(opts.usernames);
  } else {
    walls = th.getWallsForUsernames(Object.keys(th.counter));
  }

  walls.sort(function (c1, c2) {
    return c2.duration - c1.duration;
  });

  addSystemMessage(th.formatOutput(walls));
};

window.plugins = window.plugins || {};
window.plugins.wallcounter = new Wallcounter();
