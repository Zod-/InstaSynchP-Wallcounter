//http://joquery.com/2012/string-format-for-javascript
if (typeof String.prototype.format !== 'function') {
  String.prototype.format = function () {
    'use strict';
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = this;
    var i;
    var regEx;

    // start with the second argument (i = 1)
    for (i = 0; i < arguments.length; i += 1) {
      // "gm" = RegEx options for Global search (more than one instance)
      // and for Multiline search
      regEx = new RegExp('\\{' + (i) + '\\}', 'gm');
      theString = theString.replace(regEx, arguments[i]);
    }
    return theString;
  };
}

window.utils = {
  secondsToTime: function (num) {
    'use strict';
    var hours = Math.floor(num / 3600);
    var minutes = Math.floor((num - (hours * 3600)) / 60);
    var seconds = num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    var time = '';
    if (!hours) {
      time += hours + ':';
    }
    time += minutes + ':' + seconds;
    return time;
  }
};
