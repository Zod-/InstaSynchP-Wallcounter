// ==UserScript==
// @name        InstaSynchP Wallcounter
// @namespace   InstaSynchP
// @description Summarizes the lengths of each users video walls

// @version     1.0.3
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

Wall.prototype.createFormat = function (name, duration, videoCount) {
  "use strict";
  return name + '[' + duration + ' - ' + videoCount + ']';
};

Wall.prototype.format = function (name, duration, videoCount) {
  "use strict";
  var th = this,
    format = th.createFormat(name, duration, videoCount);

  return format.format(
    th.username,
    window.utils.secondsToTime(th.duration),
    th.videoCount
  );
};

function Wallcounter() {
  "use strict";
  this.version = '1.0.3';
  this.name = 'InstaSynchP Wallcounter';
  this.walls = {};
  this.userWall = undefined;
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
    'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Wallcounter/9bc2c3c08d1560ce1253d8bb858ebe29ff645ec8/dist/wallcounter.css',
    'autoload': true
  }];
  this.Wall = Wall;
}

Wallcounter.prototype.resetVariables = function () {
  "use strict";
  this.userWall = undefined;
  this.walls = {};
};

Wallcounter.prototype.updateOwnDisplay = function () {
  "use strict";
  var th = this;
  $('#playlist_wallcounter').empty().append(
    th.userWall.format('Wallcounter', '{1}', '{2}')
  );
};

Wallcounter.prototype.key = function (key) {
  "use strict";
  return key.toLowerCase();
};

Wallcounter.prototype.increase = function (username, video) {
  "use strict";
  this.walls[this.key(username)].add(video);
};

Wallcounter.prototype.decrease = function (username, video) {
  "use strict";
  this.walls[this.key(username)].remove(video);
};

Wallcounter.prototype.create = function (username) {
  "use strict";
  this.walls[this.key(username)] = new this.Wall(username);
};

Wallcounter.prototype.createIfNotExists = function (username) {
  "use strict";
  var th = this;
  if (th.walls.hasOwnProperty(th.key(username))) {
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

Wallcounter.prototype.initUserWall = function () {
  "use strict";
  var th = this;
  th.userWall = new Wall(thisUser().username);
  th.walls[th.key(th.userWall.username)] = th.userWall;
};

Wallcounter.prototype.isAddVideoMessage = function (user, message) {
  "use strict";
  return (user.username === '' && message === 'Video added successfully.');
};

Wallcounter.prototype.getAddVideoMessage = function () {
  "use strict";
  var th = this;
  return 'Video added successfully {0}'.format(th.userWall.format('', '{1}', '{2}'));
};

Wallcounter.prototype.writeAddVideoMessage = function () {
  "use strict";
  addSystemMessage(this.getAddVideoMessage());
};

Wallcounter.prototype.hideLastMessage = function () {
  "use strict";
  $('#chat_messages >:last-child').hide();
};

Wallcounter.prototype.bindAddMessage = function () {
  "use strict";
  var th = this;
  events.on(th, 'AddMessage', function (user, message) {
    if (th.isAddVideoMessage(user, message)) {
      th.hideLastMessage();
      th.writeAddVideoMessage();
    }
  });
};

Wallcounter.prototype.executeOnce = function () {
  "use strict";
  var th = this;
  th.bindUpdates();

  events.on(th, 'Joined', th.initUserWall);

  th.bindAddMessage();
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

Wallcounter.prototype.postfixForIndex = function (index, max) {
  "use strict";
  if (index === max - 1) {
    return '';
  } else if (index % 2 === 1) {
    return '<br>';
  } else {
    return ' - ';
  }
};

Wallcounter.prototype.formatOutput = function (walls) {
  "use strict";
  var th = this,
    output = "Wallcounter<br>";

  walls.forEach(function (wall, index) {
    output += wall.format('{0}', '<b>{1}</b>', '{2}');
    output += th.postfixForIndex(index, walls.length);
  });

  return output;
};

Wallcounter.prototype.getWallsForUsernames = function (usernames) {
  "use strict";
  var th = this,
    walls = [];
  usernames.forEach(function (username) {
    if (th.walls.hasOwnProperty(th.key(username)) &&
      th.walls[th.key(username)].videoCount !== 0) {
      walls.push(th.walls[th.key(username)]);
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
    walls = th.getWallsForUsernames(Object.keys(th.walls));
  }

  walls.sort(function (c1, c2) {
    return c2.duration - c1.duration;
  });

  addSystemMessage(th.formatOutput(walls));
};

window.plugins = window.plugins || {};
window.plugins.wallcounter = new Wallcounter();
