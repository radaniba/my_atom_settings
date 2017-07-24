(function() {
  var extractColumns, extractRows, formatHeaderSeparator, formatRow, getAttribute, getCellAlignment, getColumnWidths, isElementNode, isTextNode, joinColumns, longestStringInArray, pad, _, _ref;

  _ = require('lodash');

  pad = require('pad');

  getAttribute = require('./utils').getAttribute;

  _ref = require('./tree-adapter'), isTextNode = _ref.isTextNode, isElementNode = _ref.isElementNode;


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
   * Determines the alignment for a table cell by reading the style attribute
   * @return {String|null} One of 'right', 'left', 'center', or null
   */

  getCellAlignment = function(node) {
    var _ref1, _ref2;
    return ((_ref1 = getAttribute(node, 'style')) != null ? (_ref2 = _ref1.match(/text-align:\s*(right|left|center)/)) != null ? _ref2[1] : void 0 : void 0) || null;
  };


  /**
   * Join an array of cells (columns) from a single row.
   * @param {String[]} columns
   * @return {String} The joined row.
   */

  joinColumns = function(columns) {
    if (columns.length > 1) {
      return columns.join(' | ');
    } else {
      return '| ' + columns[0];
    }
  };

  extractColumns = function(row) {
    var alignments, column, columns, _i, _len, _ref1, _ref2;
    columns = [];
    alignments = [];
    _ref1 = row.childNodes;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      column = _ref1[_i];
      if ((_ref2 = column.tagName) === 'th' || _ref2 === 'td') {
        columns.push(column._replacement);
        alignments.push(getCellAlignment(column));
      } else if (isTextNode(column)) {
        throw new Error("Cannot handle " + column.tagName + " in table row");
      }
    }
    return {
      columns: columns,
      alignments: alignments
    };
  };

  extractRows = function(node) {
    var alignment, alignments, child, elem, i, inqueue, row, rows, _i, _j, _len, _len1, _ref1, _ref2;
    alignments = [];
    rows = [];
    inqueue = [node];
    while (inqueue.length > 0) {
      elem = inqueue.shift();
      _ref1 = elem.childNodes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        child = _ref1[_i];
        if (child.tagName === 'tr') {
          row = extractColumns(child);
          rows.push(row.columns);
          _ref2 = row.alignments;
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            alignment = _ref2[i];
            if (i + 1 > alignments.length) {
              alignments.push(alignment);
            }
            if (alignment !== alignments[i]) {
              throw new Error("Alignment in a table column " + i + " is not consistent");
            }
          }
        } else if (isElementNode(child)) {
          inqueue.push(child);
        }
      }
    }
    while (alignments.length > rows[0].length && alignments.slice(-1)[0] === null) {
      alignments.pop();
    }
    return {
      alignments: alignments,
      rows: rows
    };
  };

  formatRow = function(row, alignments, columnWidths) {
    var i, leftPadded, whitespace, _i, _ref1;
    for (i = _i = 0, _ref1 = row.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      row[i] = ((function() {
        switch (alignments[i]) {
          case 'right':
            return pad(columnWidths[i], row[i]);
          case 'center':
            whitespace = columnWidths[i] - row[i].length;
            leftPadded = pad(Math.floor(whitespace / 2) + row[i].length, row[i]);
            return pad(leftPadded, Math.ceil(whitespace / 2) + leftPadded.length);
          default:
            return pad(row[i], columnWidths[i]);
        }
      })());
    }
    return joinColumns(row).trimRight();
  };

  formatHeaderSeparator = function(alignments, columnWidths) {
    var columns, i, totalCols, _i;
    columns = [];
    totalCols = alignments.length;
    for (i = _i = 0; 0 <= totalCols ? _i < totalCols : _i > totalCols; i = 0 <= totalCols ? ++_i : --_i) {
      columns.push((function() {
        switch (alignments[i]) {
          case 'center':
            return ':' + pad('', columnWidths[i] - 2, '-') + ':';
          case 'left':
            return ':' + pad('', columnWidths[i] - 1, '-');
          case 'right':
            return pad('', columnWidths[i] - 1, '-') + ':';
          case null:
            return pad('', columnWidths[i], '-');
        }
      })());
    }
    return joinColumns(columns);
  };

  getColumnWidths = function(rows) {
    var column, columnWidths, i, row, totalCols, _i, _j, _len;
    columnWidths = [];
    totalCols = rows[0].length;
    for (i = _i = 0; 0 <= totalCols ? _i < totalCols : _i > totalCols; i = 0 <= totalCols ? ++_i : --_i) {
      column = [];
      for (_j = 0, _len = rows.length; _j < _len; _j++) {
        row = rows[_j];
        column.push(row[i] || '');
      }
      columnWidths.push(longestStringInArray(column));
    }
    return columnWidths;
  };

  module.exports = {
    extractRows: extractRows,
    formatHeaderSeparator: formatHeaderSeparator,
    formatRow: formatRow,
    getColumnWidths: getColumnWidths
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi90YWJsZXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBMQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUROLENBQUE7O0FBQUEsRUFHQyxlQUFnQixPQUFBLENBQVEsU0FBUixFQUFoQixZQUhELENBQUE7O0FBQUEsRUFJQSxPQUE4QixPQUFBLENBQVEsZ0JBQVIsQ0FBOUIsRUFBQyxrQkFBQSxVQUFELEVBQWEscUJBQUEsYUFKYixDQUFBOztBQU1BO0FBQUE7OztLQU5BOztBQUFBLEVBVUEsb0JBQUEsR0FBdUIsU0FBQyxLQUFELEdBQUE7QUFDckIsUUFBQSwyQkFBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtBQUNBLFNBQUEsNENBQUE7c0JBQUE7QUFDRSxNQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLEdBQUEsR0FBTSxPQUFUO0FBQXNCLFFBQUEsT0FBQSxHQUFVLEdBQVYsQ0FBdEI7T0FGRjtBQUFBLEtBREE7QUFJQSxXQUFPLE9BQVAsQ0FMcUI7RUFBQSxDQVZ2QixDQUFBOztBQWlCQTtBQUFBOzs7S0FqQkE7O0FBQUEsRUFxQkEsZ0JBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsUUFBQSxZQUFBO3NJQUVHLENBQUEsQ0FBQSxvQkFGSCxJQUVTLEtBSFE7RUFBQSxDQXJCbkIsQ0FBQTs7QUEwQkE7QUFBQTs7OztLQTFCQTs7QUFBQSxFQStCQSxXQUFBLEdBQWMsU0FBQyxPQUFELEdBQUE7QUFDWixJQUFB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

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/tables.coffee
