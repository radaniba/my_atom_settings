
/*
  lib/utils.coffee
 */

(function() {
  var log,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, utils:'].concat(args));
  };

  module.exports = {
    getVisTopHgtBot: function() {
      var botScrnScrollRow, edtBotBnd, lineEle, lineEles, lineTopBnd, lines, pvwBotBnd, refLine, refRow, refTopBnd, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.editorView.getBoundingClientRect(), this.edtTopBnd = _ref.top, edtBotBnd = _ref.bottom;
      lineEles = this.editorView.shadowRoot.querySelectorAll('.lines .line[data-screen-row]');
      lines = [];
      for (_i = 0, _len = lineEles.length; _i < _len; _i++) {
        lineEle = lineEles[_i];
        lineTopBnd = lineEle.getBoundingClientRect().top;
        lines.push([+lineEle.getAttribute('data-screen-row'), lineTopBnd]);
      }
      if (lines.length === 0) {
        log('no visible lines in editor');
        this.scrnTopOfs = this.scrnBotOfs = this.pvwTopB = this.previewTopOfs = this.previewBotOfs = 0;
        return;
      }
      lines.sort();
      for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
        refLine = lines[_j];
        if (refLine[1] >= this.edtTopBnd) {
          break;
        }
      }
      refRow = refLine[0], refTopBnd = refLine[1];
      this.scrnTopOfs = (refRow * this.chrHgt) - (refTopBnd - this.edtTopBnd);
      this.scrnHeight = edtBotBnd - this.edtTopBnd;
      this.scrnBotOfs = this.scrnTopOfs + this.scrnHeight;
      botScrnScrollRow = this.editor.clipScreenPosition([9e9, 9e9]).row;
      this.scrnScrollHgt = (botScrnScrollRow + 1) * this.chrHgt;
      _ref1 = this.previewEle.getBoundingClientRect(), this.pvwTopBnd = _ref1.top, pvwBotBnd = _ref1.bottom;
      this.previewTopOfs = this.previewEle.scrollTop;
      return this.previewBotOfs = this.previewTopOfs + (pvwBotBnd - this.pvwTopBnd);
    },
    getEleTopHgtBot: function(ele, scrn) {
      var bot, eleBotBnd, eleTopBnd, hgt, top, _ref;
      if (scrn == null) {
        scrn = true;
      }
      _ref = ele.getBoundingClientRect(), eleTopBnd = _ref.top, eleBotBnd = _ref.bottom;
      top = scrn ? this.scrnTopOfs + (eleTopBnd - this.edtTopBnd) : this.previewTopOfs + (eleTopBnd - this.pvwTopBnd);
      hgt = eleBotBnd - eleTopBnd;
      bot = top + hgt;
      return [top, hgt, bot];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1zY3JvbGwtc3luYy9saWIvdXRpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLEdBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixRQUFBLElBQUE7QUFBQSxJQURLLDhEQUNMLENBQUE7V0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQyx5QkFBRCxDQUEyQixDQUFDLE1BQTVCLENBQW1DLElBQW5DLENBQTNCLEVBREk7RUFBQSxDQUpOLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxlQUFBLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsMElBQUE7QUFBQSxNQUFBLE9BQXVDLElBQUMsQ0FBQSxVQUFVLENBQUMscUJBQVosQ0FBQSxDQUF2QyxFQUFNLElBQUMsQ0FBQSxpQkFBTixHQUFELEVBQTBCLGlCQUFSLE1BQWxCLENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxnQkFBdkIsQ0FBd0MsK0JBQXhDLENBRFgsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLEVBRlIsQ0FBQTtBQUdBLFdBQUEsK0NBQUE7K0JBQUE7QUFDRSxRQUFNLGFBQWMsT0FBTyxDQUFDLHFCQUFSLENBQUEsRUFBbkIsR0FBRCxDQUFBO0FBQUEsUUFDQSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsQ0FBQSxPQUFRLENBQUMsWUFBUixDQUFxQixpQkFBckIsQ0FBRixFQUEyQyxVQUEzQyxDQUFYLENBREEsQ0FERjtBQUFBLE9BSEE7QUFNQSxNQUFBLElBQUcsS0FBSyxD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

//# sourceURL=/Users/Rad/.atom/packages/markdown-scroll-sync/lib/utils.coffee
