'use strict';
const angular = require('angular');

/*@ngInject*/
export function emailHistoryFilter() {
  return function(input) {
    var first = input[0];
    var result = input.map(history => {
      return "<li>" + formatHistory(history, first) + "</li>";
    });
    return "<ol>" + result.join("\n") + "</ol>";
  };
}

var formatHistory = function(history, first) {
  var date = new Date(first.date);
  if(history===first) {
    //first one
    return flagFormat(history.flags) + ":" + date.toDateString();
  }else {
    var historyDate = new Date(history.date);
    var delta = historyDate.getTime() - date.getTime();
    return flagFormat(history.flags) + ":" + msFormat(delta) ;
  }
};

var flagFormat = function(flags) {
  if (flags.length == 0) {
    return "NEW";
  } else {
    var result = flags.map(flag => {
      console.log(flag);
      if (flag == '\\Deleted') return 'D';
      else if (flag == "\\Seen") return 'R';
      else if (flag == '\\Flagged') return 'F';
      else return "NEW";
    });
    return result.join(",");
  }
};
var msFormat = function msToTime(duration) {
  var seconds = parseInt((duration/1000)%60)
    , minutes = parseInt((duration/(1000*60))%60)
    , hours = parseInt((duration/(1000*60*60))%24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + "h:" + minutes + "m:" + seconds + "s";
};

export default angular.module('truckingHubApp.emailHistory', [])
  .filter('emailHistory', emailHistoryFilter)
  .name;
