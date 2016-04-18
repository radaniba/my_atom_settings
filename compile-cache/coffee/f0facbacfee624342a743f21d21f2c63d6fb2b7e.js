
/**
 * @param {String} x The string to be repeated
 * @param {String} n Number of times to repeat the string
 * @return {String} The result of repeating the string
 */

(function() {
  var delimitCode, longestStringInArray, stringRepeat;

  stringRepeat = function(x, n) {
    var s;
    s = '';
    while (true) {
      if (n & 1) {
        s += x;
      }
      n >>= 1;
      if (n) {
        x += x;
      } else {
        break;
      }
    }
    return s;
  };


  /**
   * Find the length of the longest string in an array
   * @param {String[]} array Array of strings
   */

  longestStringInArray = function(array) {
    var len, longest, str, _i, _len;
    longest = 0;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      str = array[_i];
      len = str.length;
      if (len > longest) {
        longest = len;
      }
    }
    return longest;
  };


  /**
   * Wrap code with delimiters
   * @param {String} code
   * @param {String} delimiter The delimiter to start with, additional backticks
     will be added if needed; like if the code contains a sequence of backticks
     that would end the code block prematurely.
   */

  delimitCode = function(code, delimiter) {
    while (RegExp("([^`]|^)" + delimiter + "([^`]|$)").test(code)) {
      delimiter += '`';
    }
    if (code[0] === '`') {
      code = ' ' + code;
    }
    if (code.slice(-1) === '`') {
      code += ' ';
    }
    return delimiter + code + delimiter;
  };

  module.exports = {
    stringRepeat: stringRepeat,
    longestStringInArray: longestStringInArray,
    delimitCode: delimitCode
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOzs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSwrQ0FBQTs7QUFBQSxFQUtBLFlBQUEsR0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDYixRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxFQUFKLENBQUE7QUFDQSxXQUFBLElBQUEsR0FBQTtBQUNFLE1BQUEsSUFBRyxDQUFBLEdBQUksQ0FBUDtBQUFjLFFBQUEsQ0FBQSxJQUFLLENBQUwsQ0FBZDtPQUFBO0FBQUEsTUFDQSxDQUFBLEtBQU0sQ0FETixDQUFBO0FBRUEsTUFBQSxJQUFHLENBQUg7QUFDRSxRQUFBLENBQUEsSUFBSyxDQUFMLENBREY7T0FBQSxNQUFBO0FBR0UsY0FIRjtPQUhGO0lBQUEsQ0FEQTtBQVFBLFdBQU8sQ0FBUCxDQVRhO0VBQUEsQ0FMZixDQUFBOztBQWdCQTtBQUFBOzs7S0FoQkE7O0FBQUEsRUFvQkEsb0JBQUEsR0FBdUIsU0FBQyxLQUFELEdBQUE7QUFDckIsUUFBQSwyQkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtBQUNBLFNBQUEsNENBQUE7c0JBQUE7QUFDRSxNQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLEdBQUEsR0FBTSxPQUFUO0FBQXNCLFFBQUEsT0FBQSxHQUFVLEdBQVYsQ0FBdEI7T0FGRjtBQUFBLEtBREE7QUFJQSxXQUFPLE9BQVAsQ0FMcUI7RUFBQSxDQXBCdkIsQ0FBQTs7QUEyQkE7QUFBQTs7Ozs7O0tBM0JBOztBQUFBLEVBa0NBLFdBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxTQUFQLEdBQUE7QUFDWixXQUFNLE1BQUEsQ0FBRyxVQUFBLEdBQVUsU0FBVixHQUFvQixVQUF2QixDQUFrQyxDQUFDLElBQW5DLENBQXdDLElBQXhDLENBQU4sR0FBQTtBQUlFLE1BQUEsU0FBQSxJQUFhLEdBQWIsQ0FKRjtJQUFBLENBQUE7QUFNQSxJQUFBLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLEdBQWQ7QUFBdUIsTUFBQSxJQUFBLEdBQU8sR0FBQSxHQUFNLElBQWIsQ0FBdkI7S0FOQTtBQU9BLElBQUEsSUFBRyxJQUFLLFVBQUwsS0FBZSxHQUFsQjtBQUEyQixNQUFBLElBQUEsSUFBUSxHQUFSLENBQTNCO0tBUEE7QUFRQSxXQUFPLFNBQUEsR0FBWSxJQUFaLEdBQW1CLFNBQTFCLENBVFk7RUFBQSxDQWxDZCxDQUFBOztBQUFBLEVBNkNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFBQyxjQUFBLFlBQUQ7QUFBQSxJQUFlLHNCQUFBLG9CQUFmO0FBQUEsSUFBcUMsYUFBQSxXQUFyQztHQTdDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/utils.coffee
