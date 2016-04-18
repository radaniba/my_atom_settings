
/*
  lib/scroll.coffee
 */

(function() {
  var log,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log.apply(console, ['markdown-scroll, scroll:'].concat(args));
    return args[0];
  };

  module.exports = {
    chkScroll: function(eventType, auto) {
      var cursorOfs, scrollFrac;
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      if (!this.editor.alive) {
        this.stopTracking();
        return;
      }
      if (eventType !== 'changed') {
        this.getVisTopHgtBot();
        if (this.scrnTopOfs !== this.lastScrnTopOfs || this.scrnBotOfs !== this.lastScrnBotOfs || this.previewTopOfs !== this.lastPvwTopOfs || this.previewBotOfs !== this.lastPvwBotOfs) {
          this.lastScrnTopOfs = this.scrnTopOfs;
          this.lastScrnBotOfs = this.scrnBotOfs;
          this.lastPvwTopOfs = this.previewTopOfs;
          this.lastPvwBotOfs = this.previewBotOfs;
          this.setMap(false);
        }
      }
      switch (eventType) {
        case 'init':
          cursorOfs = this.editor.getCursorScreenPosition().row * this.chrHgt;
          if ((this.scrnTopOfs <= cursorOfs && cursorOfs <= this.scrnBotOfs)) {
            return this.setScroll(cursorOfs);
          } else {
            return this.setScroll(this.scrnTopOfs);
          }
          break;
        case 'changed':
        case 'cursorMoved':
          this.setScroll(this.editor.getCursorScreenPosition().row * this.chrHgt);
          return this.ignoreScrnScrollUntil = Date.now() + 500;
        case 'newtop':
          if (this.ignoreScrnScrollUntil && Date.now() < this.ignoreScrnScrollUntil) {
            break;
          }
          this.ignoreScrnScrollUntil = null;
          scrollFrac = this.scrnTopOfs / (this.scrnScrollHgt - this.scrnHeight);
          this.setScroll(this.scrnTopOfs + (this.scrnHeight * scrollFrac));
          if (!auto) {
            return this.scrollTimeout = setTimeout(((function(_this) {
              return function() {
                return _this.chkScroll('newtop', true);
              };
            })(this)), 300);
          }
      }
    },
    setScroll: function(scrnPosPix) {
      var botPix, botRow, idx, lastBotPix, lastBotRow, lastMapping, mapping, pix1, pix2, pvwPosPix, row1, row2, spanFrac, topPix, topRow, visOfs, _i, _len, _ref;
      scrnPosPix = Math.max(0, scrnPosPix);
      lastMapping = null;
      _ref = this.map;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        mapping = _ref[idx];
        topPix = mapping[0], botPix = mapping[1], topRow = mapping[2], botRow = mapping[3];
        if (((topRow * this.chrHgt) <= scrnPosPix && scrnPosPix < ((botRow + 1) * this.chrHgt)) || idx === this.map.length - 1) {
          row1 = topRow;
          row2 = botRow + 1;
          pix1 = topPix;
          pix2 = botPix;
          break;
        } else {
          if (lastMapping == null) {
            lastMapping = mapping;
          }
          lastBotPix = lastMapping[1];
          lastBotRow = lastMapping[3] + 1;
          if (((lastBotRow * this.chrHgt) <= scrnPosPix && scrnPosPix < (topRow * this.chrHgt))) {
            row1 = lastBotRow;
            row2 = topRow;
            pix1 = lastBotPix;
            pix2 = topPix;
            break;
          }
        }
        lastMapping = mapping;
      }
      spanFrac = (scrnPosPix - (row1 * this.chrHgt)) / ((row2 - row1) * this.chrHgt);
      visOfs = scrnPosPix - this.scrnTopOfs;
      pvwPosPix = pix1 + ((pix2 - pix1) * spanFrac);
      return this.previewEle.scrollTop = pvwPosPix - visOfs;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1zY3JvbGwtc3luYy9saWIvc2Nyb2xsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxHQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFJQSxHQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osUUFBQSxJQUFBO0FBQUEsSUFESyw4REFDTCxDQUFBO0FBQUEsSUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQywwQkFBRCxDQUE0QixDQUFDLE1BQTdCLENBQW9DLElBQXBDLENBQTNCLENBQUEsQ0FBQTtXQUNBLElBQUssQ0FBQSxDQUFBLEVBRkQ7RUFBQSxDQUpOLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxTQUFBLEVBQVcsU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO0FBQ1QsVUFBQSxxQkFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtBQUNFLFFBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxhQUFkLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFEakIsQ0FERjtPQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsSUFBSyxDQUFBLE1BQU0sQ0FBQyxLQUFmO0FBQTBCLFFBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLENBQUE7QUFBaUIsY0FBQSxDQUEzQztPQUpBO0FBTUEsTUFBQSxJQUFHLFNBQUEsS0FBZSxTQUFsQjtBQUNFLFFBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUcsSUFBQyxDQUFBLFVBQUQsS0FBb0IsSUFBQyxDQUFBLGNBQXJCLElBQ0EsSUFBQyxDQUFB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

//# sourceURL=/Users/Rad/.atom/packages/markdown-scroll-sync/lib/scroll.coffee
