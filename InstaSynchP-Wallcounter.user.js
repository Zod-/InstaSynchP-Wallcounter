// ==UserScript==
// @name        InstaSynchP Wallcounter
// @namespace   InstaSynchP
// @description Summarizes the lengths of each users video walls

// @version     1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Wallcounter
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// ==/UserScript==

function Wallcounter(version) {
  "use strict";
  this.version = version;
  this.name = 'InstaSynchP Wallcounter';
  this.counter = {};
  this.commands = {
    "'wallcounter": {
      'hasArguments': true,
      'reference': this,
      'description': 'Summarizes the lengths of each users video walls or specific users',
      'callback': this.execute
    }
  };
}

Wallcounter.prototype.resetVariables = function () {
  "use strict";
  this.counter = {};
};

Wallcounter.prototype.executeOnce = function () {
  "use strict";
  var th = this;

  cssLoader.add({
    'name': 'wallcounter',
    'url': 'https://rawgit.com/Zod-/InstaSynchP-Wallcounter/f234bce65b1fe913f13672cb8507dfa3dcf767d1/wallcounter.css',
    'autoload': true
  });

  function count(video, duration, inc) {
    var name = video.addedby.toLowerCase();
    if (th.counter.hasOwnProperty(name)) {
      th.counter[name].duration += duration;
      th.counter[name].count += inc;
    } else {
      th.counter[name] = {
        duration: duration,
        count: 1,
        origName: video.addedby
      };
    }
    if (name === thisUser().username.toLowerCase()) {
      $('#playlist_wallcounter').text(
        'Wallcounter[{1} - {0}]'.format(th.counter[name].count,
          window.utils.secondsToTime(th.counter[name].duration))
      );
    }
  }

  events.on(th, "AddVideo", function (video) {
    count(video, video.duration, +1);
  });

  events.on(th, "RemoveVideo", function (ignore, video) {
    count(video, -video.duration, -1);
  });
};

Wallcounter.prototype.preConnect = function () {
  "use strict";
  $('.playlist-stats').append(
    $('<div>', {
      id: 'playlist_wallcounter'
    }).text('Wallcounter[00:00 - 0]')
  );
};

Wallcounter.prototype.formatOutput = function (counts) {
  "use strict";
  var output = "Wallcounter<br>";
  counts.forEach(function (count, index) {
    output += "{0}[<b>{2}</b> - {1}] - ".format(
      count.origName,
      count.count,
      utils.secondsToTime(count.duration)
    );
    if ((index+1) % 2 === 0) {
      output = output.substring(0, output.length - 3);
      output += '<br>';
    }
  });
  return output;
};

Wallcounter.prototype.execute = function (opts) {
  "use strict";
  var th = this,
    list = [];

  function addToList(username) {
    username = username.toLowerCase();
    if (!th.counter.hasOwnProperty(username) ||
      th.counter[username].count === 0) {
      return;
    }
    list.push(th.counter[username]);
  }

  function compareCount(c1, c2) {
    return c2.duration - c1.duration;
  }

  if (opts.usernames.length !== 0) {
    opts.usernames.forEach(addToList);
  } else {
    Object.keys(th.counter).forEach(addToList);
  }

  list.sort(compareCount);

  addSystemMessage(th.formatOutput(list));
};

window.plugins = window.plugins || {};
window.plugins.wallcounter = new Wallcounter('1');
