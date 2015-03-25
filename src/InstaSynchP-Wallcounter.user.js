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

function Wallcounter() {
  "use strict";
  this.version = '{{ VERSION }}';
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
  this.styles = [{
    'name': 'wallcounter',
    'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Wallcounter/{{ WALLCOUNTERCSSREV }}/dist/wallcounter.css',
    'autoload': true
  }];
}

Wallcounter.prototype.resetVariables = function () {
  "use strict";
  this.counter = {};
};

Wallcounter.prototype.executeOnce = function () {
  "use strict";
  var th = this;

  function count(video, duration, inc) {
    var name = video.addedby.toLowerCase();
    if (th.counter.hasOwnProperty(name)) {
      //update wallcounter
      th.counter[name].duration += duration;
      th.counter[name].count += inc;
    } else {
      //create wallcounter
      th.counter[name] = {
        duration: duration,
        count: 1,
        origName: video.addedby
      };
    }
    //update own wallcounter
    if (name === thisUser().username.toLowerCase()) {
      $('#playlist_wallcounter').text(
        'Wallcounter[{1} - {0}]'.format(th.counter[name].count,
          window.utils.secondsToTime(th.counter[name].duration))
      );
    }
  }

  events.on(th, "AddVideo", function (video) {
    count(video, video.duration, +1);
  }, true);

  events.on(th, "RemoveVideo", function (ignore, video) {
    count(video, -video.duration, -1);
  }, true);
};

Wallcounter.prototype.preConnect = function () {
  "use strict";
  //add own wallcounter below the playlist
  $('.playlist-stats').append(
    $('<div>', {
      id: 'playlist_wallcounter'
    }).text('Wallcounter[00:00 - 0]')
  );
};

//let other plugins overwrite this
Wallcounter.prototype.formatOutput = function (counts) {
  "use strict";
  var output = "Wallcounter<br>";
  counts.forEach(function (count, index) {
    output += "{0}[<b>{2}</b> - {1}] - ".format(
      count.origName,
      count.count,
      window.utils.secondsToTime(count.duration)
    );
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

  //collect users and their durations
  if (opts.usernames.length !== 0) {
    opts.usernames.forEach(addToList);
  } else {
    Object.keys(th.counter).forEach(addToList);
  }

  //sort by duration
  list.sort(compareCount);

  //display
  addSystemMessage(th.formatOutput(list));
};

window.plugins = window.plugins || {};
window.plugins.wallcounter = new Wallcounter();
