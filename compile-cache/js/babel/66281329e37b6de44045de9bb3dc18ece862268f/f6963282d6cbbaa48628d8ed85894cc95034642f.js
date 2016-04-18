Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _main = require('../main');

var _main2 = _interopRequireDefault(_main);

var _canvasLayer = require('../canvas-layer');

var _canvasLayer2 = _interopRequireDefault(_canvasLayer);

/**
 * The `CanvasDrawer` mixin is responsible for the rendering of a `Minimap`
 * in a `canvas` element.
 *
 * This mixin is injected in the `MinimapElement` prototype, so all these
 * methods  are available on any `MinimapElement` instance.
 */
'use babel';

var CanvasDrawer = (function (_Mixin) {
  _inherits(CanvasDrawer, _Mixin);

  function CanvasDrawer() {
    _classCallCheck(this, CanvasDrawer);

    _get(Object.getPrototypeOf(CanvasDrawer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CanvasDrawer, [{
    key: 'initializeCanvas',

    /**
     * Initializes the canvas elements needed to perform the `Minimap` rendering.
     */
    value: function initializeCanvas() {
      /**
      * The main canvas layer where lines are rendered.
      * @type {CanvasLayer}
      */
      this.tokensLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations below the text.
      * @type {CanvasLayer}
      */
      this.backLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations above the text.
      * @type {CanvasLayer}
      */
      this.frontLayer = new _canvasLayer2['default']();

      if (!this.pendingChanges) {
        /**
         * Stores the changes from the text editor.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingChanges = [];
      }

      if (!this.pendingBackDecorationChanges) {
        /**
         * Stores the changes from the minimap back decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingBackDecorationChanges = [];
      }

      if (!this.pendingFrontDecorationChanges) {
        /**
         * Stores the changes from the minimap front decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingFrontDecorationChanges = [];
      }
    }

    /**
     * Returns the uppermost canvas in the MinimapElement.
     *
     * @return {HTMLCanvasElement} the html canvas element
     */
  }, {
    key: 'getFrontCanvas',
    value: function getFrontCanvas() {
      return this.frontLayer.canvas;
    }

    /**
     * Attaches the canvases into the specified container.
     *
     * @param  {HTMLElement} parent the canvases' container
     * @access private
     */
  }, {
    key: 'attachCanvases',
    value: function attachCanvases(parent) {
      this.backLayer.attach(parent);
      this.tokensLayer.attach(parent);
      this.frontLayer.attach(parent);
    }

    /**
     * Changes the size of all the canvas layers at once.
     *
     * @param {number} width the new width for the three canvases
     * @param {number} height the new height for the three canvases
     * @access private
     */
  }, {
    key: 'setCanvasesSize',
    value: function setCanvasesSize(width, height) {
      this.backLayer.setSize(width, height);
      this.tokensLayer.setSize(width, height);
      this.frontLayer.setSize(width, height);
    }

    /**
     * Performs an update of the rendered `Minimap` based on the changes
     * registered in the instance.
     */
  }, {
    key: 'updateCanvas',
    value: function updateCanvas() {
      var firstRow = this.minimap.getFirstVisibleScreenRow();
      var lastRow = this.minimap.getLastVisibleScreenRow();

      this.updateTokensLayer(firstRow, lastRow);
      this.updateBackDecorationsLayers(firstRow, lastRow);
      this.updateFrontDecorationsLayers(firstRow, lastRow);

      this.pendingChanges = [];
      this.pendingBackDecorationChanges = [];
      this.pendingFrontDecorationChanges = [];

      /**
       * The first row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenFirstRow = firstRow;
      /**
       * The last row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenLastRow = lastRow;
    }

    /**
     * Performs an update of the tokens layer using the pending changes array.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateTokensLayer',
    value: function updateTokensLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges);

      this.redrawRangesOnLayer(this.tokensLayer, intactRanges, firstRow, lastRow, this.drawLines);
    }

    /**
     * Performs an update of the back decorations layer using the pending changes
     * and the pending back decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateBackDecorationsLayers',
    value: function updateBackDecorationsLayers(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges.concat(this.pendingBackDecorationChanges));

      this.redrawRangesOnLayer(this.backLayer, intactRanges, firstRow, lastRow, this.drawBackDecorationsForLines);
    }

    /**
     * Performs an update of the front decorations layer using the pending changes
     * and the pending front decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateFrontDecorationsLayers',
    value: function updateFrontDecorationsLayers(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges.concat(this.pendingFrontDecorationChanges));

      this.redrawRangesOnLayer(this.frontLayer, intactRanges, firstRow, lastRow, this.drawFrontDecorationsForLines);
    }

    /**
     * Routine used to render changes in specific ranges for one layer.
     *
     * @param  {CanvasLayer} layer the layer to redraw
     * @param  {Array<Object>} intactRanges an array of the ranges to leave intact
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @param  {Function} method the render method to use for the lines drawing
     * @access private
     */
  }, {
    key: 'redrawRangesOnLayer',
    value: function redrawRangesOnLayer(layer, intactRanges, firstRow, lastRow, method) {
      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;

      layer.clearCanvas();

      if (intactRanges.length === 0) {
        method.call(this, firstRow, lastRow, 0);
      } else {
        for (var j = 0, len = intactRanges.length; j < len; j++) {
          var intact = intactRanges[j];

          layer.copyPartFromOffscreen(intact.offscreenRow * lineHeight, (intact.start - firstRow) * lineHeight, (intact.end - intact.start) * lineHeight);
        }
        this.drawLinesForRanges(method, intactRanges, firstRow, lastRow);
      }

      layer.resetOffscreenSize();
      layer.copyToOffscreen();
    }

    /**
     * Renders the lines between the intact ranges when an update has pending
     * changes.
     *
     * @param  {Function} method the render method to use for the lines drawing
     * @param  {Array<Object>} intactRanges the intact ranges in the minimap
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @access private
     */
  }, {
    key: 'drawLinesForRanges',
    value: function drawLinesForRanges(method, ranges, firstRow, lastRow) {
      var currentRow = firstRow;
      for (var i = 0, len = ranges.length; i < len; i++) {
        var range = ranges[i];

        method.call(this, currentRow, range.start - 1, currentRow - firstRow);

        currentRow = range.end;
      }
      if (currentRow <= lastRow) {
        method.call(this, currentRow, lastRow, currentRow - firstRow);
      }
    }

    //     ######   #######  ##        #######  ########   ######
    //    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
    //    ##       ##     ## ##       ##     ## ##     ## ##
    //    ##       ##     ## ##       ##     ## ########   ######
    //    ##       ##     ## ##       ##     ## ##   ##         ##
    //    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
    //     ######   #######  ########  #######  ##     ##  ######

    /**
     * Returns the opacity value to use when rendering the `Minimap` text.
     *
     * @return {Number} the text opacity value
     */
  }, {
    key: 'getTextOpacity',
    value: function getTextOpacity() {
      return this.textOpacity;
    }

    /**
     * Returns the default text color for an editor content.
     *
     * The color value is directly read from the `TextEditorView` computed styles.
     *
     * @return {string} a CSS color
     */
  }, {
    key: 'getDefaultColor',
    value: function getDefaultColor() {
      var color = this.retrieveStyleFromDom(['.editor'], 'color', false, true);
      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the text color for the passed-in `token` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the token `scope` property.
     *
     * @param  {Object} token a `TextEditor` token
     * @return {string} the CSS color for the provided token
     */
  }, {
    key: 'getTokenColor',
    value: function getTokenColor(token) {
      var scopes = token.scopeDescriptor || token.scopes;
      var color = this.retrieveStyleFromDom(scopes, 'color');

      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the background color for the passed-in `decoration` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the decoration `scope` property unless the decoration provides
     * its own `color` property.
     *
     * @param  {Decoration} decoration the decoration to get the color for
     * @return {string} the CSS color for the provided decoration
     */
  }, {
    key: 'getDecorationColor',
    value: function getDecorationColor(decoration) {
      var properties = decoration.getProperties();
      if (properties.color) {
        return properties.color;
      }

      var scopeString = properties.scope.split(/\s+/);
      return this.retrieveStyleFromDom(scopeString, 'background-color', false);
    }

    /**
     * Converts a `rgb(...)` color into a `rgba(...)` color with the specified
     * opacity.
     *
     * @param  {string} color the CSS RGB color to transparentize
     * @param  {number} [opacity=1] the opacity amount
     * @return {string} the transparentized CSS color
     * @access private
     */
  }, {
    key: 'transparentize',
    value: function transparentize(color) {
      var opacity = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      return color.replace('rgb(', 'rgba(').replace(')', ', ' + opacity + ')');
    }

    //    ########  ########     ###    ##      ##
    //    ##     ## ##     ##   ## ##   ##  ##  ##
    //    ##     ## ##     ##  ##   ##  ##  ##  ##
    //    ##     ## ########  ##     ## ##  ##  ##
    //    ##     ## ##   ##   ######### ##  ##  ##
    //    ##     ## ##    ##  ##     ## ##  ##  ##
    //    ########  ##     ## ##     ##  ###  ###

    /**
     * Draws back decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawBackDecorationsForLines',
    value: function drawBackDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize.width;
      var canvasHeight = _tokensLayer$getSize.height;

      var renderData = {
        context: this.backLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'line': this.drawLineDecoration,
          'highlight-under': this.drawHighlightDecoration
        });
      }

      this.backLayer.context.fill();
    }

    /**
     * Draws front decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawFrontDecorationsForLines',
    value: function drawFrontDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize2 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize2.width;
      var canvasHeight = _tokensLayer$getSize2.height;

      var renderData = {
        context: this.frontLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'highlight-over': this.drawHighlightDecoration,
          'highlight-outline': this.drawHighlightOutlineDecoration
        });
      }

      renderData.context.fill();
    }

    /**
     * Draws lines on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawLines',
    value: function drawLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow);
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var displayCodeHighlights = this.displayCodeHighlights;
      var context = this.tokensLayer.context;

      var _tokensLayer$getSize3 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize3.width;

      var line = lines[0];
      var invisibleRegExp = this.getInvisibleRegExp(line);

      for (var i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        var yRow = (offsetRow + i) * lineHeight;
        var x = 0;

        if ((line != null ? line.tokens : void 0) != null) {
          var tokens = line.tokens;
          for (var j = 0, tokensCount = tokens.length; j < tokensCount; j++) {
            var token = tokens[j];
            var w = token.screenDelta;
            if (!token.isOnlyWhitespace()) {
              var color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor();

              var value = token.value;
              if (invisibleRegExp != null) {
                value = value.replace(invisibleRegExp, ' ');
              }
              x = this.drawToken(context, value, color, x, yRow, charWidth, charHeight);
            } else {
              x += w * charWidth;
            }

            if (x > canvasWidth) {
              break;
            }
          }
        }
      }

      context.fill();
    }

    /**
     * Returns the regexp to replace invisibles substitution characters
     * in editor lines.
     *
     * @param  {TokenizedLine} line a tokenized lize to read the invisible
     *                              characters
     * @return {RegExp} the regular expression to match invisible characters
     * @access private
     */
  }, {
    key: 'getInvisibleRegExp',
    value: function getInvisibleRegExp(line) {
      if (line != null && line.invisibles != null) {
        var invisibles = [];
        if (line.invisibles.cr != null) {
          invisibles.push(line.invisibles.cr);
        }
        if (line.invisibles.eol != null) {
          invisibles.push(line.invisibles.eol);
        }
        if (line.invisibles.space != null) {
          invisibles.push(line.invisibles.space);
        }
        if (line.invisibles.tab != null) {
          invisibles.push(line.invisibles.tab);
        }

        return RegExp(invisibles.filter(function (s) {
          return typeof s === 'string';
        }).map(_underscorePlus2['default'].escapeRegExp).join('|'), 'g');
      }
    }

    /**
     * Draws a single token on the given context.
     *
     * @param  {CanvasRenderingContext2D} context the target canvas context
     * @param  {string} text the token's text content
     * @param  {string} color the token's CSS color
     * @param  {number} x the x position of the token in the line
     * @param  {number} y the y position of the line in the minimap
     * @param  {number} charWidth the width of a character in the minimap
     * @param  {number} charHeight the height of a character in the minimap
     * @return {number} the x position at the end of the token
     * @access private
     */
  }, {
    key: 'drawToken',
    value: function drawToken(context, text, color, x, y, charWidth, charHeight) {
      context.fillStyle = color;

      var chars = 0;
      for (var j = 0, len = text.length; j < len; j++) {
        var char = text[j];
        if (/\s/.test(char)) {
          if (chars > 0) {
            context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
          }
          chars = 0;
        } else {
          chars++;
        }
        x += charWidth;
      }
      if (chars > 0) {
        context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
      }
      return x;
    }

    /**
     * Draws the specified decorations for the current `screenRow`.
     *
     * The `decorations` object contains all the decorations grouped by type and
     * then rows.
     *
     * @param  {number} screenRow the screen row index for which
     *                            render decorations
     * @param  {Object} decorations the object containing all the decorations
     * @param  {Object} renderData the object containing the render data
     * @param  {Object} types an object with the type to render as key and the
     *                        render method as value
     * @access private
     */
  }, {
    key: 'drawDecorations',
    value: function drawDecorations(screenRow, decorations, renderData, types) {
      var decorationsToRender = [];

      for (var i in types) {
        decorationsToRender = decorationsToRender.concat(decorations[i] != null ? decorations[i][screenRow] || [] : []);
      }

      decorationsToRender.sort(function (a, b) {
        return (renderData.orders[a.properties.plugin] || 0) - (renderData.orders[b.properties.plugin] || 0);
      });

      if (decorationsToRender != null ? decorationsToRender.length : void 0) {
        for (var i = 0, len = decorationsToRender.length; i < len; i++) {
          types[decorationsToRender[i].properties.type].call(this, decorationsToRender[i], renderData);
        }
      }
    }

    /**
     * Draws a line decoration.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawLineDecoration',
    value: function drawLineDecoration(decoration, data) {
      data.context.fillStyle = this.getDecorationColor(decoration);
      data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
    }

    /**
     * Draws a highlight decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightDecoration',
    value: function drawHighlightDecoration(decoration, data) {
      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        var colSpan = range.end.column - range.start.column;
        data.context.fillRect(range.start.column * data.charWidth, data.yRow, colSpan * data.charWidth, data.lineHeight);
      } else if (data.screenRow === range.start.row) {
        var x = range.start.column * data.charWidth;
        data.context.fillRect(x, data.yRow, data.canvasWidth - x, data.lineHeight);
      } else if (data.screenRow === range.end.row) {
        data.context.fillRect(0, data.yRow, range.end.column * data.charWidth, data.lineHeight);
      } else {
        data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
      }
    }

    /**
     * Draws a highlight outline decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightOutlineDecoration',
    value: function drawHighlightOutlineDecoration(decoration, data) {
      var bottomWidth = undefined,
          colSpan = undefined,
          width = undefined,
          xBottomStart = undefined,
          xEnd = undefined,
          xStart = undefined;
      var lineHeight = data.lineHeight;
      var charWidth = data.charWidth;
      var canvasWidth = data.canvasWidth;
      var screenRow = data.screenRow;

      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;
      var yStart = data.yRow;
      var yEnd = yStart + lineHeight;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        width = colSpan * charWidth;
        xStart = range.start.column * charWidth;
        xEnd = xStart + width;

        data.context.fillRect(xStart, yStart, width, 1);
        data.context.fillRect(xStart, yEnd, width, 1);
        data.context.fillRect(xStart, yStart, 1, lineHeight);
        data.context.fillRect(xEnd, yStart, 1, lineHeight);
      } else if (rowSpan === 1) {
        xStart = range.start.column * data.charWidth;
        xEnd = range.end.column * data.charWidth;

        if (screenRow === range.start.row) {
          width = data.canvasWidth - xStart;
          xBottomStart = Math.max(xStart, xEnd);
          bottomWidth = data.canvasWidth - xBottomStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xBottomStart, yEnd, bottomWidth, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else {
          width = canvasWidth - xStart;
          bottomWidth = canvasWidth - xEnd;

          data.context.fillRect(0, yStart, xStart, 1);
          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        }
      } else {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else if (screenRow === range.end.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        } else {
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
          if (screenRow === range.start.row + 1) {
            data.context.fillRect(0, yStart, xStart, 1);
          }
          if (screenRow === range.end.row - 1) {
            data.context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1);
          }
        }
      }
    }

    //    ########     ###    ##    ##  ######   ########  ######
    //    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
    //    ##     ##  ##   ##  ####  ## ##        ##       ##
    //    ########  ##     ## ## ## ## ##   #### ######    ######
    //    ##   ##   ######### ##  #### ##    ##  ##             ##
    //    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
    //    ##     ## ##     ## ##    ##  ######   ########  ######

    /**
     * Computes the ranges that are not affected by the current pending changes.
     *
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the intact ranges in the rendered region
     * @access private
     */
  }, {
    key: 'computeIntactRanges',
    value: function computeIntactRanges(firstRow, lastRow, changes) {
      if (this.offscreenFirstRow == null && this.offscreenLastRow == null) {
        return [];
      }

      // At first, the whole range is considered intact
      var intactRanges = [{
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        offscreenRow: 0
      }];

      for (var i = 0, len = changes.length; i < len; i++) {
        var change = changes[i];
        var newIntactRanges = [];

        for (var j = 0, intactLen = intactRanges.length; j < intactLen; j++) {
          var range = intactRanges[j];

          if (change.end < range.start && change.screenDelta !== 0) {
            // The change is above of the range and lines are either
            // added or removed
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow
            });
          } else if (change.end < range.start || change.start > range.end) {
            // The change is outside the range but didn't add
            // or remove lines
            newIntactRanges.push(range);
          } else {
            // The change is within the range, there's one intact range
            // from the range start to the change start
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                offscreenRow: range.offscreenRow
              });
            }
            if (change.end < range.end) {
              // The change ends within the range
              if (change.bufferDelta !== 0) {
                // Lines are added or removed, the intact range starts in the
                // next line after the change end plus the screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else if (change.screenDelta !== 0) {
                // Lines are added or removed in the display buffer, the intact
                // range starts in the next line after the change end plus the
                // screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else {
                // No lines are added, the intact range starts on the line after
                // the change end
                newIntactRanges.push({
                  start: change.end + 1,
                  end: range.end,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              }
            }
          }
        }
        intactRanges = newIntactRanges;
      }

      return this.truncateIntactRanges(intactRanges, firstRow, lastRow);
    }

    /**
     * Truncates the intact ranges so that they doesn't expand past the visible
     * area of the minimap.
     *
     * @param  {Array<Object>} intactRanges the initial array of ranges
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the array of truncated ranges
     * @access private
     */
  }, {
    key: 'truncateIntactRanges',
    value: function truncateIntactRanges(intactRanges, firstRow, lastRow) {
      var i = 0;
      while (i < intactRanges.length) {
        var range = intactRanges[i];

        if (range.start < firstRow) {
          range.offscreenRow += firstRow - range.start;
          range.start = firstRow;
        }

        if (range.end > lastRow) {
          range.end = lastRow;
        }

        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }

        i++;
      }

      return intactRanges.sort(function (a, b) {
        return a.offscreenRow - b.offscreenRow;
      });
    }
  }]);

  return CanvasDrawer;
})(_mixto2['default']);

exports['default'] = CanvasDrawer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL2NhbnZhcy1kcmF3ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OEJBRWMsaUJBQWlCOzs7O3FCQUNiLE9BQU87Ozs7b0JBQ1IsU0FBUzs7OzsyQkFDRixpQkFBaUI7Ozs7Ozs7Ozs7O0FBTHpDLFdBQVcsQ0FBQTs7SUFjVSxZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7OztlQUFaLFlBQVk7Ozs7OztXQUlkLDRCQUFHOzs7OztBQUtsQixVQUFJLENBQUMsV0FBVyxHQUFHLDhCQUFpQixDQUFBOzs7OztBQUtwQyxVQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFpQixDQUFBOzs7OztBQUtsQyxVQUFJLENBQUMsVUFBVSxHQUFHLDhCQUFpQixDQUFBOztBQUVuQyxVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTs7Ozs7O0FBTXhCLFlBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFBO09BQ3pCOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUU7Ozs7OztBQU10QyxZQUFJLENBQUMsNEJBQTRCLEdBQUcsRUFBRSxDQUFBO09BQ3ZDOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUU7Ozs7OztBQU12QyxZQUFJLENBQUMsNkJBQTZCLEdBQUcsRUFBRSxDQUFBO09BQ3hDO0tBQ0Y7Ozs7Ozs7OztXQU9jLDBCQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQTtLQUFFOzs7Ozs7Ozs7O1dBUXBDLHdCQUFDLE1BQU0sRUFBRTtBQUN0QixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM3QixVQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMvQixVQUFJLENBQUMsVUFBVSxD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Q0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FBRTs7QUFFN0QsU0FBQyxFQUFFLENBQUE7T0FDSjs7QUFFRCxhQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2pDLGVBQU8sQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtLQUNIOzs7U0Exd0JrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9jYW52YXMtZHJhd2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IE1peGluIGZyb20gJ21peHRvJ1xuaW1wb3J0IE1haW4gZnJvbSAnLi4vbWFpbidcbmltcG9ydCBDYW52YXNMYXllciBmcm9tICcuLi9jYW52YXMtbGF5ZXInXG5cbi8qKlxuICogVGhlIGBDYW52YXNEcmF3ZXJgIG1peGluIGlzIHJlc3BvbnNpYmxlIGZvciB0aGUgcmVuZGVyaW5nIG9mIGEgYE1pbmltYXBgXG4gKiBpbiBhIGBjYW52YXNgIGVsZW1lbnQuXG4gKlxuICogVGhpcyBtaXhpbiBpcyBpbmplY3RlZCBpbiB0aGUgYE1pbmltYXBFbGVtZW50YCBwcm90b3R5cGUsIHNvIGFsbCB0aGVzZVxuICogbWV0aG9kcyAgYXJlIGF2YWlsYWJsZSBvbiBhbnkgYE1pbmltYXBFbGVtZW50YCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzRHJhd2VyIGV4dGVuZHMgTWl4aW4ge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGNhbnZhcyBlbGVtZW50cyBuZWVkZWQgdG8gcGVyZm9ybSB0aGUgYE1pbmltYXBgIHJlbmRlcmluZy5cbiAgICovXG4gIGluaXRpYWxpemVDYW52YXMgKCkge1xuICAgIC8qKlxuICAgICogVGhlIG1haW4gY2FudmFzIGxheWVyIHdoZXJlIGxpbmVzIGFyZSByZW5kZXJlZC5cbiAgICAqIEB0eXBlIHtDYW52YXNMYXllcn1cbiAgICAqL1xuICAgIHRoaXMudG9rZW5zTGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKVxuICAgIC8qKlxuICAgICogVGhlIGNhbnZhcyBsYXllciBmb3IgZGVjb3JhdGlvbnMgYmVsb3cgdGhlIHRleHQuXG4gICAgKiBAdHlwZSB7Q2FudmFzTGF5ZXJ9XG4gICAgKi9cbiAgICB0aGlzLmJhY2tMYXllciA9IG5ldyBDYW52YXNMYXllcigpXG4gICAgLyoqXG4gICAgKiBUaGUgY2FudmFzIGxheWVyIGZvciBkZWNvcmF0aW9ucyBhYm92ZSB0aGUgdGV4dC5cbiAgICAqIEB0eXBlIHtDYW52YXNMYXllcn1cbiAgICAqL1xuICAgIHRoaXMuZnJvbnRMYXllciA9IG5ldyBDYW52YXNMYXllcigpXG5cbiAgICBpZiAoIXRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIC8qKlxuICAgICAgICogU3RvcmVzIHRoZSBjaGFuZ2VzIGZyb20gdGhlIHRleHQgZWRpdG9yLlxuICAgICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgICAqL1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IFtdXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMpIHtcbiAgICAgIC8qKlxuICAgICAgICogU3RvcmVzIHRoZSBjaGFuZ2VzIGZyb20gdGhlIG1pbmltYXAgYmFjayBkZWNvcmF0aW9ucy5cbiAgICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzKSB7XG4gICAgICAvKipcbiAgICAgICAqIFN0b3JlcyB0aGUgY2hhbmdlcyBmcm9tIHRoZSBtaW5pbWFwIGZyb250IGRlY29yYXRpb25zLlxuICAgICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgICAqL1xuICAgICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVwcGVybW9zdCBjYW52YXMgaW4gdGhlIE1pbmltYXBFbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MQ2FudmFzRWxlbWVudH0gdGhlIGh0bWwgY2FudmFzIGVsZW1lbnRcbiAgICovXG4gIGdldEZyb250Q2FudmFzICgpIHsgcmV0dXJuIHRoaXMuZnJvbnRMYXllci5jYW52YXMgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgY2FudmFzZXMgaW50byB0aGUgc3BlY2lmaWVkIGNvbnRhaW5lci5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHBhcmVudCB0aGUgY2FudmFzZXMnIGNvbnRhaW5lclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGF0dGFjaENhbnZhc2VzIChwYXJlbnQpIHtcbiAgICB0aGlzLmJhY2tMYXllci5hdHRhY2gocGFyZW50KVxuICAgIHRoaXMudG9rZW5zTGF5ZXIuYXR0YWNoKHBhcmVudClcbiAgICB0aGlzLmZyb250TGF5ZXIuYXR0YWNoKHBhcmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBzaXplIG9mIGFsbCB0aGUgY2FudmFzIGxheWVycyBhdCBvbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggdGhlIG5ldyB3aWR0aCBmb3IgdGhlIHRocmVlIGNhbnZhc2VzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgdGhlIG5ldyBoZWlnaHQgZm9yIHRoZSB0aHJlZSBjYW52YXNlc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHNldENhbnZhc2VzU2l6ZSAod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuYmFja0xheWVyLnNldFNpemUod2lkdGgsIGhlaWdodClcbiAgICB0aGlzLnRva2Vuc0xheWVyLnNldFNpemUod2lkdGgsIGhlaWdodClcbiAgICB0aGlzLmZyb250TGF5ZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgcmVuZGVyZWQgYE1pbmltYXBgIGJhc2VkIG9uIHRoZSBjaGFuZ2VzXG4gICAqIHJlZ2lzdGVyZWQgaW4gdGhlIGluc3RhbmNlLlxuICAgKi9cbiAgdXBkYXRlQ2FudmFzICgpIHtcbiAgICBjb25zdCBmaXJzdFJvdyA9IHRoaXMubWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGNvbnN0IGxhc3RSb3cgPSB0aGlzLm1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgdGhpcy51cGRhdGVUb2tlbnNMYXllcihmaXJzdFJvdywgbGFzdFJvdylcbiAgICB0aGlzLnVwZGF0ZUJhY2tEZWNvcmF0aW9uc0xheWVycyhmaXJzdFJvdywgbGFzdFJvdylcbiAgICB0aGlzLnVwZGF0ZUZyb250RGVjb3JhdGlvbnNMYXllcnMoZmlyc3RSb3csIGxhc3RSb3cpXG5cbiAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gW11cbiAgICB0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMgPSBbXVxuICAgIHRoaXMucGVuZGluZ0Zyb250RGVjb3JhdGlvbkNoYW5nZXMgPSBbXVxuXG4gICAgLyoqXG4gICAgICogVGhlIGZpcnN0IHJvdyBpbiB0aGUgbGFzdCByZW5kZXIgb2YgdGhlIG9mZnNjcmVlbiBjYW52YXMuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkZpcnN0Um93ID0gZmlyc3RSb3dcbiAgICAvKipcbiAgICAgKiBUaGUgbGFzdCByb3cgaW4gdGhlIGxhc3QgcmVuZGVyIG9mIHRoZSBvZmZzY3JlZW4gY2FudmFzLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5MYXN0Um93ID0gbGFzdFJvd1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgdG9rZW5zIGxheWVyIHVzaW5nIHRoZSBwZW5kaW5nIGNoYW5nZXMgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlVG9rZW5zTGF5ZXIgKGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgY29uc3QgaW50YWN0UmFuZ2VzID0gdGhpcy5jb21wdXRlSW50YWN0UmFuZ2VzKGZpcnN0Um93LCBsYXN0Um93LCB0aGlzLnBlbmRpbmdDaGFuZ2VzKVxuXG4gICAgdGhpcy5yZWRyYXdSYW5nZXNPbkxheWVyKHRoaXMudG9rZW5zTGF5ZXIsIGludGFjdFJhbmdlcywgZmlyc3RSb3csIGxhc3RSb3csIHRoaXMuZHJhd0xpbmVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgYmFjayBkZWNvcmF0aW9ucyBsYXllciB1c2luZyB0aGUgcGVuZGluZyBjaGFuZ2VzXG4gICAqIGFuZCB0aGUgcGVuZGluZyBiYWNrIGRlY29yYXRpb25zIGNoYW5nZXMgYXJyYXlzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZUJhY2tEZWNvcmF0aW9uc0xheWVycyAoZmlyc3RSb3csIGxhc3RSb3cpIHtcbiAgICBjb25zdCBpbnRhY3RSYW5nZXMgPSB0aGlzLmNvbXB1dGVJbnRhY3RSYW5nZXMoZmlyc3RSb3csIGxhc3RSb3csIHRoaXMucGVuZGluZ0NoYW5nZXMuY29uY2F0KHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcykpXG5cbiAgICB0aGlzLnJlZHJhd1Jhbmdlc09uTGF5ZXIodGhpcy5iYWNrTGF5ZXIsIGludGFjdFJhbmdlcywgZmlyc3RSb3csIGxhc3RSb3csIHRoaXMuZHJhd0JhY2tEZWNvcmF0aW9uc0ZvckxpbmVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgZnJvbnQgZGVjb3JhdGlvbnMgbGF5ZXIgdXNpbmcgdGhlIHBlbmRpbmcgY2hhbmdlc1xuICAgKiBhbmQgdGhlIHBlbmRpbmcgZnJvbnQgZGVjb3JhdGlvbnMgY2hhbmdlcyBhcnJheXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlRnJvbnREZWNvcmF0aW9uc0xheWVycyAoZmlyc3RSb3csIGxhc3RSb3cpIHtcbiAgICBjb25zdCBpbnRhY3RSYW5nZXMgPSB0aGlzLmNvbXB1dGVJbnRhY3RSYW5nZXMoZmlyc3RSb3csIGxhc3RSb3csIHRoaXMucGVuZGluZ0NoYW5nZXMuY29uY2F0KHRoaXMucGVuZGluZ0Zyb250RGVjb3JhdGlvbkNoYW5nZXMpKVxuXG4gICAgdGhpcy5yZWRyYXdSYW5nZXNPbkxheWVyKHRoaXMuZnJvbnRMYXllciwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5kcmF3RnJvbnREZWNvcmF0aW9uc0ZvckxpbmVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFJvdXRpbmUgdXNlZCB0byByZW5kZXIgY2hhbmdlcyBpbiBzcGVjaWZpYyByYW5nZXMgZm9yIG9uZSBsYXllci5cbiAgICpcbiAgICogQHBhcmFtICB7Q2FudmFzTGF5ZXJ9IGxheWVyIHRoZSBsYXllciB0byByZWRyYXdcbiAgICogQHBhcmFtICB7QXJyYXk8T2JqZWN0Pn0gaW50YWN0UmFuZ2VzIGFuIGFycmF5IG9mIHRoZSByYW5nZXMgdG8gbGVhdmUgaW50YWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBtZXRob2QgdGhlIHJlbmRlciBtZXRob2QgdG8gdXNlIGZvciB0aGUgbGluZXMgZHJhd2luZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlZHJhd1Jhbmdlc09uTGF5ZXIgKGxheWVyLCBpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93LCBtZXRob2QpIHtcbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgbGF5ZXIuY2xlYXJDYW52YXMoKVxuXG4gICAgaWYgKGludGFjdFJhbmdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGZpcnN0Um93LCBsYXN0Um93LCAwKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBqID0gMCwgbGVuID0gaW50YWN0UmFuZ2VzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGNvbnN0IGludGFjdCA9IGludGFjdFJhbmdlc1tqXVxuXG4gICAgICAgIGxheWVyLmNvcHlQYXJ0RnJvbU9mZnNjcmVlbihcbiAgICAgICAgICBpbnRhY3Qub2Zmc2NyZWVuUm93ICogbGluZUhlaWdodCxcbiAgICAgICAgICAoaW50YWN0LnN0YXJ0IC0gZmlyc3RSb3cpICogbGluZUhlaWdodCxcbiAgICAgICAgICAoaW50YWN0LmVuZCAtIGludGFjdC5zdGFydCkgKiBsaW5lSGVpZ2h0XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhd0xpbmVzRm9yUmFuZ2VzKG1ldGhvZCwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdylcbiAgICB9XG5cbiAgICBsYXllci5yZXNldE9mZnNjcmVlblNpemUoKVxuICAgIGxheWVyLmNvcHlUb09mZnNjcmVlbigpXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgbGluZXMgYmV0d2VlbiB0aGUgaW50YWN0IHJhbmdlcyB3aGVuIGFuIHVwZGF0ZSBoYXMgcGVuZGluZ1xuICAgKiBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gbWV0aG9kIHRoZSByZW5kZXIgbWV0aG9kIHRvIHVzZSBmb3IgdGhlIGxpbmVzIGRyYXdpbmdcbiAgICogQHBhcmFtICB7QXJyYXk8T2JqZWN0Pn0gaW50YWN0UmFuZ2VzIHRoZSBpbnRhY3QgcmFuZ2VzIGluIHRoZSBtaW5pbWFwXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdMaW5lc0ZvclJhbmdlcyAobWV0aG9kLCByYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgbGV0IGN1cnJlbnRSb3cgPSBmaXJzdFJvd1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByYW5nZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzW2ldXG5cbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGN1cnJlbnRSb3csIHJhbmdlLnN0YXJ0IC0gMSwgY3VycmVudFJvdyAtIGZpcnN0Um93KVxuXG4gICAgICBjdXJyZW50Um93ID0gcmFuZ2UuZW5kXG4gICAgfVxuICAgIGlmIChjdXJyZW50Um93IDw9IGxhc3RSb3cpIHtcbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGN1cnJlbnRSb3csIGxhc3RSb3csIGN1cnJlbnRSb3cgLSBmaXJzdFJvdylcbiAgICB9XG4gIH1cblxuICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMgICMjIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyMgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvcGFjaXR5IHZhbHVlIHRvIHVzZSB3aGVuIHJlbmRlcmluZyB0aGUgYE1pbmltYXBgIHRleHQuXG4gICAqXG4gICAqIEByZXR1cm4ge051bWJlcn0gdGhlIHRleHQgb3BhY2l0eSB2YWx1ZVxuICAgKi9cbiAgZ2V0VGV4dE9wYWNpdHkgKCkgeyByZXR1cm4gdGhpcy50ZXh0T3BhY2l0eSB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlZmF1bHQgdGV4dCBjb2xvciBmb3IgYW4gZWRpdG9yIGNvbnRlbnQuXG4gICAqXG4gICAqIFRoZSBjb2xvciB2YWx1ZSBpcyBkaXJlY3RseSByZWFkIGZyb20gdGhlIGBUZXh0RWRpdG9yVmlld2AgY29tcHV0ZWQgc3R5bGVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IGEgQ1NTIGNvbG9yXG4gICAqL1xuICBnZXREZWZhdWx0Q29sb3IgKCkge1xuICAgIGNvbnN0IGNvbG9yID0gdGhpcy5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJywgZmFsc2UsIHRydWUpXG4gICAgcmV0dXJuIHRoaXMudHJhbnNwYXJlbnRpemUoY29sb3IsIHRoaXMuZ2V0VGV4dE9wYWNpdHkoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0ZXh0IGNvbG9yIGZvciB0aGUgcGFzc2VkLWluIGB0b2tlbmAgb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgY29sb3IgdmFsdWUgaXMgcmVhZCBmcm9tIHRoZSBET00gYnkgY3JlYXRpbmcgYSBub2RlIHN0cnVjdHVyZSB0aGF0XG4gICAqIG1hdGNoIHRoZSB0b2tlbiBgc2NvcGVgIHByb3BlcnR5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHRva2VuIGEgYFRleHRFZGl0b3JgIHRva2VuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyBjb2xvciBmb3IgdGhlIHByb3ZpZGVkIHRva2VuXG4gICAqL1xuICBnZXRUb2tlbkNvbG9yICh0b2tlbikge1xuICAgIGNvbnN0IHNjb3BlcyA9IHRva2VuLnNjb3BlRGVzY3JpcHRvciB8fCB0b2tlbi5zY29wZXNcbiAgICBjb25zdCBjb2xvciA9IHRoaXMucmV0cmlldmVTdHlsZUZyb21Eb20oc2NvcGVzLCAnY29sb3InKVxuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNwYXJlbnRpemUoY29sb3IsIHRoaXMuZ2V0VGV4dE9wYWNpdHkoKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIGZvciB0aGUgcGFzc2VkLWluIGBkZWNvcmF0aW9uYCBvYmplY3QuXG4gICAqXG4gICAqIFRoZSBjb2xvciB2YWx1ZSBpcyByZWFkIGZyb20gdGhlIERPTSBieSBjcmVhdGluZyBhIG5vZGUgc3RydWN0dXJlIHRoYXRcbiAgICogbWF0Y2ggdGhlIGRlY29yYXRpb24gYHNjb3BlYCBwcm9wZXJ0eSB1bmxlc3MgdGhlIGRlY29yYXRpb24gcHJvdmlkZXNcbiAgICogaXRzIG93biBgY29sb3JgIHByb3BlcnR5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIHRvIGdldCB0aGUgY29sb3IgZm9yXG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIENTUyBjb2xvciBmb3IgdGhlIHByb3ZpZGVkIGRlY29yYXRpb25cbiAgICovXG4gIGdldERlY29yYXRpb25Db2xvciAoZGVjb3JhdGlvbikge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKVxuICAgIGlmIChwcm9wZXJ0aWVzLmNvbG9yKSB7IHJldHVybiBwcm9wZXJ0aWVzLmNvbG9yIH1cblxuICAgIGNvbnN0IHNjb3BlU3RyaW5nID0gcHJvcGVydGllcy5zY29wZS5zcGxpdCgvXFxzKy8pXG4gICAgcmV0dXJuIHRoaXMucmV0cmlldmVTdHlsZUZyb21Eb20oc2NvcGVTdHJpbmcsICdiYWNrZ3JvdW5kLWNvbG9yJywgZmFsc2UpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBgcmdiKC4uLilgIGNvbG9yIGludG8gYSBgcmdiYSguLi4pYCBjb2xvciB3aXRoIHRoZSBzcGVjaWZpZWRcbiAgICogb3BhY2l0eS5cbiAgICpcbiAgICogQHBhcmFtICB7c3RyaW5nfSBjb2xvciB0aGUgQ1NTIFJHQiBjb2xvciB0byB0cmFuc3BhcmVudGl6ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IFtvcGFjaXR5PTFdIHRoZSBvcGFjaXR5IGFtb3VudFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSB0cmFuc3BhcmVudGl6ZWQgQ1NTIGNvbG9yXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgdHJhbnNwYXJlbnRpemUgKGNvbG9yLCBvcGFjaXR5ID0gMSkge1xuICAgIHJldHVybiBjb2xvci5yZXBsYWNlKCdyZ2IoJywgJ3JnYmEoJykucmVwbGFjZSgnKScsIGAsICR7b3BhY2l0eX0pYClcbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAjIyMjIyMjIyAgICAgIyMjICAgICMjICAgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgIyMgICMjICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgICMjICAjIyAgIyMgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMgICAgICMjICMjICAjIyAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgIyMgICAjIyMjIyMjIyMgIyMgICMjICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAjIyAgIyMgICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICAgICMjICAjIyMgICMjI1xuXG4gIC8qKlxuICAgKiBEcmF3cyBiYWNrIGRlY29yYXRpb25zIG9uIHRoZSBjb3JyZXNwb25kaW5nIGxheWVyLlxuICAgKlxuICAgKiBUaGUgbGluZXMgcmFuZ2UgdG8gZHJhdyBpcyBzcGVjaWZpZWQgYnkgdGhlIGBmaXJzdFJvd2AgYW5kIGBsYXN0Um93YFxuICAgKiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gb2Zmc2V0Um93IHRoZSByZWxhdGl2ZSBvZmZzZXQgdG8gYXBwbHkgdG8gcm93cyB3aGVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmluZyB0aGVtXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0JhY2tEZWNvcmF0aW9uc0ZvckxpbmVzIChmaXJzdFJvdywgbGFzdFJvdywgb2Zmc2V0Um93KSB7XG4gICAgaWYgKGZpcnN0Um93ID4gbGFzdFJvdykgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFySGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldENoYXJIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFyV2lkdGggPSB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgZGVjb3JhdGlvbnMgPSB0aGlzLm1pbmltYXAuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cyhmaXJzdFJvdywgbGFzdFJvdylcbiAgICBjb25zdCB7d2lkdGg6IGNhbnZhc1dpZHRoLCBoZWlnaHQ6IGNhbnZhc0hlaWdodH0gPSB0aGlzLnRva2Vuc0xheWVyLmdldFNpemUoKVxuICAgIGNvbnN0IHJlbmRlckRhdGEgPSB7XG4gICAgICBjb250ZXh0OiB0aGlzLmJhY2tMYXllci5jb250ZXh0LFxuICAgICAgY2FudmFzV2lkdGg6IGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBjYW52YXNIZWlnaHQsXG4gICAgICBsaW5lSGVpZ2h0OiBsaW5lSGVpZ2h0LFxuICAgICAgY2hhcldpZHRoOiBjaGFyV2lkdGgsXG4gICAgICBjaGFySGVpZ2h0OiBjaGFySGVpZ2h0LFxuICAgICAgb3JkZXJzOiBNYWluLmdldFBsdWdpbnNPcmRlcigpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgc2NyZWVuUm93ID0gZmlyc3RSb3c7IHNjcmVlblJvdyA8PSBsYXN0Um93OyBzY3JlZW5Sb3crKykge1xuICAgICAgcmVuZGVyRGF0YS5yb3cgPSBvZmZzZXRSb3cgKyAoc2NyZWVuUm93IC0gZmlyc3RSb3cpXG4gICAgICByZW5kZXJEYXRhLnlSb3cgPSByZW5kZXJEYXRhLnJvdyAqIGxpbmVIZWlnaHRcbiAgICAgIHJlbmRlckRhdGEuc2NyZWVuUm93ID0gc2NyZWVuUm93XG5cbiAgICAgIHRoaXMuZHJhd0RlY29yYXRpb25zKHNjcmVlblJvdywgZGVjb3JhdGlvbnMsIHJlbmRlckRhdGEsIHtcbiAgICAgICAgJ2xpbmUnOiB0aGlzLmRyYXdMaW5lRGVjb3JhdGlvbixcbiAgICAgICAgJ2hpZ2hsaWdodC11bmRlcic6IHRoaXMuZHJhd0hpZ2hsaWdodERlY29yYXRpb25cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5iYWNrTGF5ZXIuY29udGV4dC5maWxsKClcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBmcm9udCBkZWNvcmF0aW9ucyBvbiB0aGUgY29ycmVzcG9uZGluZyBsYXllci5cbiAgICpcbiAgICogVGhlIGxpbmVzIHJhbmdlIHRvIGRyYXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZmlyc3RSb3dgIGFuZCBgbGFzdFJvd2BcbiAgICogcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9mZnNldFJvdyB0aGUgcmVsYXRpdmUgb2Zmc2V0IHRvIGFwcGx5IHRvIHJvd3Mgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmcgdGhlbVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdGcm9udERlY29yYXRpb25zRm9yTGluZXMgKGZpcnN0Um93LCBsYXN0Um93LCBvZmZzZXRSb3cpIHtcbiAgICBpZiAoZmlyc3RSb3cgPiBsYXN0Um93KSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGNoYXJIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0Q2hhckhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGNoYXJXaWR0aCA9IHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBkZWNvcmF0aW9ucyA9IHRoaXMubWluaW1hcC5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzKGZpcnN0Um93LCBsYXN0Um93KVxuICAgIGNvbnN0IHt3aWR0aDogY2FudmFzV2lkdGgsIGhlaWdodDogY2FudmFzSGVpZ2h0fSA9IHRoaXMudG9rZW5zTGF5ZXIuZ2V0U2l6ZSgpXG4gICAgY29uc3QgcmVuZGVyRGF0YSA9IHtcbiAgICAgIGNvbnRleHQ6IHRoaXMuZnJvbnRMYXllci5jb250ZXh0LFxuICAgICAgY2FudmFzV2lkdGg6IGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBjYW52YXNIZWlnaHQsXG4gICAgICBsaW5lSGVpZ2h0OiBsaW5lSGVpZ2h0LFxuICAgICAgY2hhcldpZHRoOiBjaGFyV2lkdGgsXG4gICAgICBjaGFySGVpZ2h0OiBjaGFySGVpZ2h0LFxuICAgICAgb3JkZXJzOiBNYWluLmdldFBsdWdpbnNPcmRlcigpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgc2NyZWVuUm93ID0gZmlyc3RSb3c7IHNjcmVlblJvdyA8PSBsYXN0Um93OyBzY3JlZW5Sb3crKykge1xuICAgICAgcmVuZGVyRGF0YS5yb3cgPSBvZmZzZXRSb3cgKyAoc2NyZWVuUm93IC0gZmlyc3RSb3cpXG4gICAgICByZW5kZXJEYXRhLnlSb3cgPSByZW5kZXJEYXRhLnJvdyAqIGxpbmVIZWlnaHRcbiAgICAgIHJlbmRlckRhdGEuc2NyZWVuUm93ID0gc2NyZWVuUm93XG5cbiAgICAgIHRoaXMuZHJhd0RlY29yYXRpb25zKHNjcmVlblJvdywgZGVjb3JhdGlvbnMsIHJlbmRlckRhdGEsIHtcbiAgICAgICAgJ2hpZ2hsaWdodC1vdmVyJzogdGhpcy5kcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbixcbiAgICAgICAgJ2hpZ2hsaWdodC1vdXRsaW5lJzogdGhpcy5kcmF3SGlnaGxpZ2h0T3V0bGluZURlY29yYXRpb25cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmVuZGVyRGF0YS5jb250ZXh0LmZpbGwoKVxuICB9XG4gIC8qKlxuICAgKiBEcmF3cyBsaW5lcyBvbiB0aGUgY29ycmVzcG9uZGluZyBsYXllci5cbiAgICpcbiAgICogVGhlIGxpbmVzIHJhbmdlIHRvIGRyYXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZmlyc3RSb3dgIGFuZCBgbGFzdFJvd2BcbiAgICogcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9mZnNldFJvdyB0aGUgcmVsYXRpdmUgb2Zmc2V0IHRvIGFwcGx5IHRvIHJvd3Mgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmcgdGhlbVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdMaW5lcyAoZmlyc3RSb3csIGxhc3RSb3csIG9mZnNldFJvdykge1xuICAgIGlmIChmaXJzdFJvdyA+IGxhc3RSb3cpIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgbGluZXMgPSB0aGlzLmdldFRleHRFZGl0b3IoKS50b2tlbml6ZWRMaW5lc0ZvclNjcmVlblJvd3MoZmlyc3RSb3csIGxhc3RSb3cpXG4gICAgY29uc3QgbGluZUhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhckhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRDaGFySGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhcldpZHRoID0gdGhpcy5taW5pbWFwLmdldENoYXJXaWR0aCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMudG9rZW5zTGF5ZXIuY29udGV4dFxuICAgIGNvbnN0IHt3aWR0aDogY2FudmFzV2lkdGh9ID0gdGhpcy50b2tlbnNMYXllci5nZXRTaXplKClcblxuICAgIGxldCBsaW5lID0gbGluZXNbMF1cbiAgICBjb25zdCBpbnZpc2libGVSZWdFeHAgPSB0aGlzLmdldEludmlzaWJsZVJlZ0V4cChsaW5lKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsaW5lID0gbGluZXNbaV1cbiAgICAgIGNvbnN0IHlSb3cgPSAob2Zmc2V0Um93ICsgaSkgKiBsaW5lSGVpZ2h0XG4gICAgICBsZXQgeCA9IDBcblxuICAgICAgaWYgKChsaW5lICE9IG51bGwgPyBsaW5lLnRva2VucyA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB0b2tlbnMgPSBsaW5lLnRva2Vuc1xuICAgICAgICBmb3IgKGxldCBqID0gMCwgdG9rZW5zQ291bnQgPSB0b2tlbnMubGVuZ3RoOyBqIDwgdG9rZW5zQ291bnQ7IGorKykge1xuICAgICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2pdXG4gICAgICAgICAgY29uc3QgdyA9IHRva2VuLnNjcmVlbkRlbHRhXG4gICAgICAgICAgaWYgKCF0b2tlbi5pc09ubHlXaGl0ZXNwYWNlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gZGlzcGxheUNvZGVIaWdobGlnaHRzID8gdGhpcy5nZXRUb2tlbkNvbG9yKHRva2VuKSA6IHRoaXMuZ2V0RGVmYXVsdENvbG9yKClcblxuICAgICAgICAgICAgbGV0IHZhbHVlID0gdG9rZW4udmFsdWVcbiAgICAgICAgICAgIGlmIChpbnZpc2libGVSZWdFeHAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoaW52aXNpYmxlUmVnRXhwLCAnICcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4ID0gdGhpcy5kcmF3VG9rZW4oY29udGV4dCwgdmFsdWUsIGNvbG9yLCB4LCB5Um93LCBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHggKz0gdyAqIGNoYXJXaWR0aFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh4ID4gY2FudmFzV2lkdGgpIHsgYnJlYWsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29udGV4dC5maWxsKClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWdleHAgdG8gcmVwbGFjZSBpbnZpc2libGVzIHN1YnN0aXR1dGlvbiBjaGFyYWN0ZXJzXG4gICAqIGluIGVkaXRvciBsaW5lcy5cbiAgICpcbiAgICogQHBhcmFtICB7VG9rZW5pemVkTGluZX0gbGluZSBhIHRva2VuaXplZCBsaXplIHRvIHJlYWQgdGhlIGludmlzaWJsZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJhY3RlcnNcbiAgICogQHJldHVybiB7UmVnRXhwfSB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIGludmlzaWJsZSBjaGFyYWN0ZXJzXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SW52aXNpYmxlUmVnRXhwIChsaW5lKSB7XG4gICAgaWYgKChsaW5lICE9IG51bGwpICYmIChsaW5lLmludmlzaWJsZXMgIT0gbnVsbCkpIHtcbiAgICAgIGNvbnN0IGludmlzaWJsZXMgPSBbXVxuICAgICAgaWYgKGxpbmUuaW52aXNpYmxlcy5jciAhPSBudWxsKSB7IGludmlzaWJsZXMucHVzaChsaW5lLmludmlzaWJsZXMuY3IpIH1cbiAgICAgIGlmIChsaW5lLmludmlzaWJsZXMuZW9sICE9IG51bGwpIHsgaW52aXNpYmxlcy5wdXNoKGxpbmUuaW52aXNpYmxlcy5lb2wpIH1cbiAgICAgIGlmIChsaW5lLmludmlzaWJsZXMuc3BhY2UgIT0gbnVsbCkgeyBpbnZpc2libGVzLnB1c2gobGluZS5pbnZpc2libGVzLnNwYWNlKSB9XG4gICAgICBpZiAobGluZS5pbnZpc2libGVzLnRhYiAhPSBudWxsKSB7IGludmlzaWJsZXMucHVzaChsaW5lLmludmlzaWJsZXMudGFiKSB9XG5cbiAgICAgIHJldHVybiBSZWdFeHAoaW52aXNpYmxlcy5maWx0ZXIoKHMpID0+IHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJ1xuICAgICAgfSkubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8JyksICdnJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgYSBzaW5nbGUgdG9rZW4gb24gdGhlIGdpdmVuIGNvbnRleHQuXG4gICAqXG4gICAqIEBwYXJhbSAge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dCB0aGUgdGFyZ2V0IGNhbnZhcyBjb250ZXh0XG4gICAqIEBwYXJhbSAge3N0cmluZ30gdGV4dCB0aGUgdG9rZW4ncyB0ZXh0IGNvbnRlbnRcbiAgICogQHBhcmFtICB7c3RyaW5nfSBjb2xvciB0aGUgdG9rZW4ncyBDU1MgY29sb3JcbiAgICogQHBhcmFtICB7bnVtYmVyfSB4IHRoZSB4IHBvc2l0aW9uIG9mIHRoZSB0b2tlbiBpbiB0aGUgbGluZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHkgcG9zaXRpb24gb2YgdGhlIGxpbmUgaW4gdGhlIG1pbmltYXBcbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaGFyV2lkdGggdGhlIHdpZHRoIG9mIGEgY2hhcmFjdGVyIGluIHRoZSBtaW5pbWFwXG4gICAqIEBwYXJhbSAge251bWJlcn0gY2hhckhlaWdodCB0aGUgaGVpZ2h0IG9mIGEgY2hhcmFjdGVyIGluIHRoZSBtaW5pbWFwXG4gICAqIEByZXR1cm4ge251bWJlcn0gdGhlIHggcG9zaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgdG9rZW5cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3VG9rZW4gKGNvbnRleHQsIHRleHQsIGNvbG9yLCB4LCB5LCBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yXG5cbiAgICBsZXQgY2hhcnMgPSAwXG4gICAgZm9yIChsZXQgaiA9IDAsIGxlbiA9IHRleHQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0W2pdXG4gICAgICBpZiAoL1xccy8udGVzdChjaGFyKSkge1xuICAgICAgICBpZiAoY2hhcnMgPiAwKSB7XG4gICAgICAgICAgY29udGV4dC5maWxsUmVjdCh4IC0gKGNoYXJzICogY2hhcldpZHRoKSwgeSwgY2hhcnMgKiBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpXG4gICAgICAgIH1cbiAgICAgICAgY2hhcnMgPSAwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFycysrXG4gICAgICB9XG4gICAgICB4ICs9IGNoYXJXaWR0aFxuICAgIH1cbiAgICBpZiAoY2hhcnMgPiAwKSB7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KHggLSAoY2hhcnMgKiBjaGFyV2lkdGgpLCB5LCBjaGFycyAqIGNoYXJXaWR0aCwgY2hhckhlaWdodClcbiAgICB9XG4gICAgcmV0dXJuIHhcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgc3BlY2lmaWVkIGRlY29yYXRpb25zIGZvciB0aGUgY3VycmVudCBgc2NyZWVuUm93YC5cbiAgICpcbiAgICogVGhlIGBkZWNvcmF0aW9uc2Agb2JqZWN0IGNvbnRhaW5zIGFsbCB0aGUgZGVjb3JhdGlvbnMgZ3JvdXBlZCBieSB0eXBlIGFuZFxuICAgKiB0aGVuIHJvd3MuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gc2NyZWVuUm93IHRoZSBzY3JlZW4gcm93IGluZGV4IGZvciB3aGljaFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXIgZGVjb3JhdGlvbnNcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkZWNvcmF0aW9ucyB0aGUgb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBkZWNvcmF0aW9uc1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IHJlbmRlckRhdGEgdGhlIG9iamVjdCBjb250YWluaW5nIHRoZSByZW5kZXIgZGF0YVxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHR5cGVzIGFuIG9iamVjdCB3aXRoIHRoZSB0eXBlIHRvIHJlbmRlciBhcyBrZXkgYW5kIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlciBtZXRob2QgYXMgdmFsdWVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3RGVjb3JhdGlvbnMgKHNjcmVlblJvdywgZGVjb3JhdGlvbnMsIHJlbmRlckRhdGEsIHR5cGVzKSB7XG4gICAgbGV0IGRlY29yYXRpb25zVG9SZW5kZXIgPSBbXVxuXG4gICAgZm9yIChsZXQgaSBpbiB0eXBlcykge1xuICAgICAgZGVjb3JhdGlvbnNUb1JlbmRlciA9IGRlY29yYXRpb25zVG9SZW5kZXIuY29uY2F0KFxuICAgICAgICBkZWNvcmF0aW9uc1tpXSAhPSBudWxsID8gZGVjb3JhdGlvbnNbaV1bc2NyZWVuUm93XSB8fCBbXSA6IFtdXG4gICAgICApXG4gICAgfVxuXG4gICAgZGVjb3JhdGlvbnNUb1JlbmRlci5zb3J0KChhLCBiKSA9PlxuICAgICAgKHJlbmRlckRhdGEub3JkZXJzW2EucHJvcGVydGllcy5wbHVnaW5dIHx8IDApIC0gKHJlbmRlckRhdGEub3JkZXJzW2IucHJvcGVydGllcy5wbHVnaW5dIHx8IDApXG4gICAgKVxuXG4gICAgaWYgKGRlY29yYXRpb25zVG9SZW5kZXIgIT0gbnVsbCA/IGRlY29yYXRpb25zVG9SZW5kZXIubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGVjb3JhdGlvbnNUb1JlbmRlci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB0eXBlc1tkZWNvcmF0aW9uc1RvUmVuZGVyW2ldLnByb3BlcnRpZXMudHlwZV0uY2FsbCh0aGlzLCBkZWNvcmF0aW9uc1RvUmVuZGVyW2ldLCByZW5kZXJEYXRhKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGxpbmUgZGVjb3JhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byByZW5kZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIHRoZSBkYXRhIG5lZWQgdG8gcGVyZm9ybSB0aGUgcmVuZGVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0xpbmVEZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgZGF0YS5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0RGVjb3JhdGlvbkNvbG9yKGRlY29yYXRpb24pXG4gICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgaGlnaGxpZ2h0IGRlY29yYXRpb24uXG4gICAqXG4gICAqIEl0IHJlbmRlcnMgb25seSB0aGUgcGFydCBvZiB0aGUgaGlnaGxpZ2h0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZFxuICAgKiByb3cuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdIaWdobGlnaHREZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmdldFNjcmVlblJhbmdlKClcbiAgICBjb25zdCByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuXG4gICAgZGF0YS5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0RGVjb3JhdGlvbkNvbG9yKGRlY29yYXRpb24pXG5cbiAgICBpZiAocm93U3BhbiA9PT0gMCkge1xuICAgICAgY29uc3QgY29sU3BhbiA9IHJhbmdlLmVuZC5jb2x1bW4gLSByYW5nZS5zdGFydC5jb2x1bW5cbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdChyYW5nZS5zdGFydC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aCwgZGF0YS55Um93LCBjb2xTcGFuICogZGF0YS5jaGFyV2lkdGgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2UgaWYgKGRhdGEuc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cpIHtcbiAgICAgIGNvbnN0IHggPSByYW5nZS5zdGFydC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aFxuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHgsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCAtIHgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2UgaWYgKGRhdGEuc2NyZWVuUm93ID09PSByYW5nZS5lbmQucm93KSB7XG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgZGF0YS55Um93LCByYW5nZS5lbmQuY29sdW1uICogZGF0YS5jaGFyV2lkdGgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGhpZ2hsaWdodCBvdXRsaW5lIGRlY29yYXRpb24uXG4gICAqXG4gICAqIEl0IHJlbmRlcnMgb25seSB0aGUgcGFydCBvZiB0aGUgaGlnaGxpZ2h0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZFxuICAgKiByb3cuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbiAoZGVjb3JhdGlvbiwgZGF0YSkge1xuICAgIGxldCBib3R0b21XaWR0aCwgY29sU3Bhbiwgd2lkdGgsIHhCb3R0b21TdGFydCwgeEVuZCwgeFN0YXJ0XG4gICAgY29uc3Qge2xpbmVIZWlnaHQsIGNoYXJXaWR0aCwgY2FudmFzV2lkdGgsIHNjcmVlblJvd30gPSBkYXRhXG4gICAgY29uc3QgcmFuZ2UgPSBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmdldFNjcmVlblJhbmdlKClcbiAgICBjb25zdCByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuICAgIGNvbnN0IHlTdGFydCA9IGRhdGEueVJvd1xuICAgIGNvbnN0IHlFbmQgPSB5U3RhcnQgKyBsaW5lSGVpZ2h0XG5cbiAgICBkYXRhLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcblxuICAgIGlmIChyb3dTcGFuID09PSAwKSB7XG4gICAgICBjb2xTcGFuID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtblxuICAgICAgd2lkdGggPSBjb2xTcGFuICogY2hhcldpZHRoXG4gICAgICB4U3RhcnQgPSByYW5nZS5zdGFydC5jb2x1bW4gKiBjaGFyV2lkdGhcbiAgICAgIHhFbmQgPSB4U3RhcnQgKyB3aWR0aFxuXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIHdpZHRoLCAxKVxuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhTdGFydCwgeUVuZCwgd2lkdGgsIDEpXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgIH0gZWxzZSBpZiAocm93U3BhbiA9PT0gMSkge1xuICAgICAgeFN0YXJ0ID0gcmFuZ2Uuc3RhcnQuY29sdW1uICogZGF0YS5jaGFyV2lkdGhcbiAgICAgIHhFbmQgPSByYW5nZS5lbmQuY29sdW1uICogZGF0YS5jaGFyV2lkdGhcblxuICAgICAgaWYgKHNjcmVlblJvdyA9PT0gcmFuZ2Uuc3RhcnQucm93KSB7XG4gICAgICAgIHdpZHRoID0gZGF0YS5jYW52YXNXaWR0aCAtIHhTdGFydFxuICAgICAgICB4Qm90dG9tU3RhcnQgPSBNYXRoLm1heCh4U3RhcnQsIHhFbmQpXG4gICAgICAgIGJvdHRvbVdpZHRoID0gZGF0YS5jYW52YXNXaWR0aCAtIHhCb3R0b21TdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgd2lkdGgsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4Qm90dG9tU3RhcnQsIHlFbmQsIGJvdHRvbVdpZHRoLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdChjYW52YXNXaWR0aCAtIDEsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZHRoID0gY2FudmFzV2lkdGggLSB4U3RhcnRcbiAgICAgICAgYm90dG9tV2lkdGggPSBjYW52YXNXaWR0aCAtIHhFbmRcblxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCB4U3RhcnQsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5RW5kLCB4RW5kLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB4U3RhcnQgPSByYW5nZS5zdGFydC5jb2x1bW4gKiBjaGFyV2lkdGhcbiAgICAgIHhFbmQgPSByYW5nZS5lbmQuY29sdW1uICogY2hhcldpZHRoXG4gICAgICBpZiAoc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cpIHtcbiAgICAgICAgd2lkdGggPSBjYW52YXNXaWR0aCAtIHhTdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgd2lkdGgsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KGNhbnZhc1dpZHRoIC0gMSwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfSBlbHNlIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLmVuZC5yb3cpIHtcbiAgICAgICAgd2lkdGggPSBjYW52YXNXaWR0aCAtIHhTdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5RW5kLCB4RW5kLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KGNhbnZhc1dpZHRoIC0gMSwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBpZiAoc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cgKyAxKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlTdGFydCwgeFN0YXJ0LCAxKVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLmVuZC5yb3cgLSAxKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhFbmQsIHlFbmQsIGNhbnZhc1dpZHRoIC0geEVuZCwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vICAgICMjIyMjIyMjICAgICAjIyMgICAgIyMgICAgIyMgICMjIyMjIyAgICMjIyMjIyMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICMjICAgIyMgIyMgICAjIyMgICAjIyAjIyAgICAjIyAgIyMgICAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICAjIyAgICMjICAjIyMjICAjIyAjIyAgICAgICAgIyMgICAgICAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjICAgICAjIyAjIyAjIyAjIyAjIyAgICMjIyMgIyMjIyMjICAgICMjIyMjI1xuICAvLyAgICAjIyAgICMjICAgIyMjIyMjIyMjICMjICAjIyMjICMjICAgICMjICAjIyAgICAgICAgICAgICAjI1xuICAvLyAgICAjIyAgICAjIyAgIyMgICAgICMjICMjICAgIyMjICMjICAgICMjICAjIyAgICAgICAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjICAjIyMjIyMgICAjIyMjIyMjIyAgIyMjIyMjXG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSByYW5nZXMgdGhhdCBhcmUgbm90IGFmZmVjdGVkIGJ5IHRoZSBjdXJyZW50IHBlbmRpbmcgY2hhbmdlcy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59IHRoZSBpbnRhY3QgcmFuZ2VzIGluIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjb21wdXRlSW50YWN0UmFuZ2VzIChmaXJzdFJvdywgbGFzdFJvdywgY2hhbmdlcykge1xuICAgIGlmICgodGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9PSBudWxsKSAmJiAodGhpcy5vZmZzY3JlZW5MYXN0Um93ID09IG51bGwpKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICAvLyBBdCBmaXJzdCwgdGhlIHdob2xlIHJhbmdlIGlzIGNvbnNpZGVyZWQgaW50YWN0XG4gICAgbGV0IGludGFjdFJhbmdlcyA9IFtcbiAgICAgIHtcbiAgICAgICAgc3RhcnQ6IHRoaXMub2Zmc2NyZWVuRmlyc3RSb3csXG4gICAgICAgIGVuZDogdGhpcy5vZmZzY3JlZW5MYXN0Um93LFxuICAgICAgICBvZmZzY3JlZW5Sb3c6IDBcbiAgICAgIH1cbiAgICBdXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2hhbmdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgY2hhbmdlID0gY2hhbmdlc1tpXVxuICAgICAgY29uc3QgbmV3SW50YWN0UmFuZ2VzID0gW11cblxuICAgICAgZm9yIChsZXQgaiA9IDAsIGludGFjdExlbiA9IGludGFjdFJhbmdlcy5sZW5ndGg7IGogPCBpbnRhY3RMZW47IGorKykge1xuICAgICAgICBjb25zdCByYW5nZSA9IGludGFjdFJhbmdlc1tqXVxuXG4gICAgICAgIGlmIChjaGFuZ2UuZW5kIDwgcmFuZ2Uuc3RhcnQgJiYgY2hhbmdlLnNjcmVlbkRlbHRhICE9PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGNoYW5nZSBpcyBhYm92ZSBvZiB0aGUgcmFuZ2UgYW5kIGxpbmVzIGFyZSBlaXRoZXJcbiAgICAgICAgICAvLyBhZGRlZCBvciByZW1vdmVkXG4gICAgICAgICAgbmV3SW50YWN0UmFuZ2VzLnB1c2goe1xuICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLnN0YXJ0ICsgY2hhbmdlLnNjcmVlbkRlbHRhLFxuICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICBvZmZzY3JlZW5Sb3c6IHJhbmdlLm9mZnNjcmVlblJvd1xuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoY2hhbmdlLmVuZCA8IHJhbmdlLnN0YXJ0IHx8IGNoYW5nZS5zdGFydCA+IHJhbmdlLmVuZCkge1xuICAgICAgICAgIC8vIFRoZSBjaGFuZ2UgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgYnV0IGRpZG4ndCBhZGRcbiAgICAgICAgICAvLyBvciByZW1vdmUgbGluZXNcbiAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaChyYW5nZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgY2hhbmdlIGlzIHdpdGhpbiB0aGUgcmFuZ2UsIHRoZXJlJ3Mgb25lIGludGFjdCByYW5nZVxuICAgICAgICAgIC8vIGZyb20gdGhlIHJhbmdlIHN0YXJ0IHRvIHRoZSBjaGFuZ2Ugc3RhcnRcbiAgICAgICAgICBpZiAoY2hhbmdlLnN0YXJ0ID4gcmFuZ2Uuc3RhcnQpIHtcbiAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgc3RhcnQ6IHJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgICBlbmQ6IGNoYW5nZS5zdGFydCAtIDEsXG4gICAgICAgICAgICAgIG9mZnNjcmVlblJvdzogcmFuZ2Uub2Zmc2NyZWVuUm93XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hhbmdlLmVuZCA8IHJhbmdlLmVuZCkge1xuICAgICAgICAgICAgLy8gVGhlIGNoYW5nZSBlbmRzIHdpdGhpbiB0aGUgcmFuZ2VcbiAgICAgICAgICAgIGlmIChjaGFuZ2UuYnVmZmVyRGVsdGEgIT09IDApIHtcbiAgICAgICAgICAgICAgLy8gTGluZXMgYXJlIGFkZGVkIG9yIHJlbW92ZWQsIHRoZSBpbnRhY3QgcmFuZ2Ugc3RhcnRzIGluIHRoZVxuICAgICAgICAgICAgICAvLyBuZXh0IGxpbmUgYWZ0ZXIgdGhlIGNoYW5nZSBlbmQgcGx1cyB0aGUgc2NyZWVuIGRlbHRhXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIGNoYW5nZS5zY3JlZW5EZWx0YSArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYW5nZS5zY3JlZW5EZWx0YSAhPT0gMCkge1xuICAgICAgICAgICAgICAvLyBMaW5lcyBhcmUgYWRkZWQgb3IgcmVtb3ZlZCBpbiB0aGUgZGlzcGxheSBidWZmZXIsIHRoZSBpbnRhY3RcbiAgICAgICAgICAgICAgLy8gcmFuZ2Ugc3RhcnRzIGluIHRoZSBuZXh0IGxpbmUgYWZ0ZXIgdGhlIGNoYW5nZSBlbmQgcGx1cyB0aGVcbiAgICAgICAgICAgICAgLy8gc2NyZWVuIGRlbHRhXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIGNoYW5nZS5zY3JlZW5EZWx0YSArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBObyBsaW5lcyBhcmUgYWRkZWQsIHRoZSBpbnRhY3QgcmFuZ2Ugc3RhcnRzIG9uIHRoZSBsaW5lIGFmdGVyXG4gICAgICAgICAgICAgIC8vIHRoZSBjaGFuZ2UgZW5kXG4gICAgICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdGFydDogY2hhbmdlLmVuZCArIDEsXG4gICAgICAgICAgICAgICAgZW5kOiByYW5nZS5lbmQsXG4gICAgICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3cgKyBjaGFuZ2UuZW5kICsgMSAtIHJhbmdlLnN0YXJ0XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbnRhY3RSYW5nZXMgPSBuZXdJbnRhY3RSYW5nZXNcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50cnVuY2F0ZUludGFjdFJhbmdlcyhpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KVxuICB9XG5cbiAgLyoqXG4gICAqIFRydW5jYXRlcyB0aGUgaW50YWN0IHJhbmdlcyBzbyB0aGF0IHRoZXkgZG9lc24ndCBleHBhbmQgcGFzdCB0aGUgdmlzaWJsZVxuICAgKiBhcmVhIG9mIHRoZSBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0gIHtBcnJheTxPYmplY3Q+fSBpbnRhY3RSYW5nZXMgdGhlIGluaXRpYWwgYXJyYXkgb2YgcmFuZ2VzXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+fSB0aGUgYXJyYXkgb2YgdHJ1bmNhdGVkIHJhbmdlc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHRydW5jYXRlSW50YWN0UmFuZ2VzIChpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgbGV0IGkgPSAwXG4gICAgd2hpbGUgKGkgPCBpbnRhY3RSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCByYW5nZSA9IGludGFjdFJhbmdlc1tpXVxuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQgPCBmaXJzdFJvdykge1xuICAgICAgICByYW5nZS5vZmZzY3JlZW5Sb3cgKz0gZmlyc3RSb3cgLSByYW5nZS5zdGFydFxuICAgICAgICByYW5nZS5zdGFydCA9IGZpcnN0Um93XG4gICAgICB9XG5cbiAgICAgIGlmIChyYW5nZS5lbmQgPiBsYXN0Um93KSB7IHJhbmdlLmVuZCA9IGxhc3RSb3cgfVxuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQgPj0gcmFuZ2UuZW5kKSB7IGludGFjdFJhbmdlcy5zcGxpY2UoaS0tLCAxKSB9XG5cbiAgICAgIGkrK1xuICAgIH1cblxuICAgIHJldHVybiBpbnRhY3RSYW5nZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIGEub2Zmc2NyZWVuUm93IC0gYi5vZmZzY3JlZW5Sb3dcbiAgICB9KVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/Rad/.atom/packages/minimap/lib/mixins/canvas-drawer.js
