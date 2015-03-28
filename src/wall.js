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
