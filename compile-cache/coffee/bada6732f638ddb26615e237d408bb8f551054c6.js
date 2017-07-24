(function() {
  var fs, less, loadPreviewTheme, mpeGithubSyntax, path, styleTemplate;

  styleTemplate = require('./style-template');

  path = require('path');

  fs = null;

  less = null;

  mpeGithubSyntax = null;

  loadPreviewTheme = function(previewTheme, arg, cb) {
    var atomStyles, changeStyleElement, data, head, i, indexLessPath, len, previewThemeElement, syntaxVariablesFile, theme, themePath, themes, whiteBackground;
    changeStyleElement = arg.changeStyleElement;
    if (changeStyleElement == null) {
      changeStyleElement = false;
    }
    whiteBackground = atom.config.get('markdown-preview-enhanced.whiteBackground');
    previewThemeElement = document.getElementById('markdown-preview-enhanced-preview-theme');
    if ((previewThemeElement != null ? previewThemeElement.getAttribute('data-preview-theme') : void 0) === previewTheme && (previewThemeElement != null ? previewThemeElement.innerHTML.length : void 0) && (previewThemeElement != null ? previewThemeElement.getAttribute('data-white-background') : void 0) === whiteBackground.toString()) {
      return typeof cb === "function" ? cb(false, previewThemeElement.innerHTML) : void 0;
    }
    if (!previewThemeElement) {
      previewThemeElement = document.createElement('style');
      previewThemeElement.id = 'markdown-preview-enhanced-preview-theme';
      previewThemeElement.setAttribute('for', 'markdown-preview-enhanced');
      head = document.getElementsByTagName('head')[0];
      atomStyles = document.getElementsByTagName('atom-styles')[0];
      head.insertBefore(previewThemeElement, atomStyles);
    }
    if (changeStyleElement) {
      previewThemeElement.setAttribute('data-preview-theme', previewTheme);
    }
    if (changeStyleElement) {
      previewThemeElement.setAttribute('data-white-background', whiteBackground.toString());
    }
    if (fs == null) {
      fs = require('fs');
    }
    if (less == null) {
      less = require('less');
    }
    themes = atom.themes.getLoadedThemes();
    if (previewTheme === 'mpe-github-syntax') {
      if (mpeGithubSyntax == null) {
        mpeGithubSyntax = require('./mpe-github-syntax-template.coffee');
      }
      data = mpeGithubSyntax + "@fg: #333;\n@bg: #fff;" + styleTemplate;
      return less.render(data, {}, function(error, output) {
        var css;
        if (error) {
          return typeof cb === "function" ? cb(error) : void 0;
        }
        css = output.css.replace(/[^\.]atom-text-editor/g, '.markdown-preview-enhanced pre').replace(/:host/g, '.markdown-preview-enhanced .host').replace(/\.syntax\-\-/g, '.mpe-syntax--');
        if (changeStyleElement) {
          previewThemeElement.innerHTML = css;
        }
        return typeof cb === "function" ? cb(false, css) : void 0;
      });
    }
    for (i = 0, len = themes.length; i < len; i++) {
      theme = themes[i];
      if (theme.name === previewTheme) {
        themePath = theme.path;
        indexLessPath = path.resolve(themePath, './index.less');
        syntaxVariablesFile = path.resolve(themePath, './styles/syntax-variables.less');
        fs.readFile(indexLessPath, {
          encoding: 'utf-8'
        }, function(error, data) {
          if (error) {
            return typeof cb === "function" ? cb(error) : void 0;
          }
          data = (data || '').replace(/\/css("|')\;/g, '\/css.less$1;');
          if (whiteBackground) {
            data += "@import \"styles/syntax-variables.less\";\n\n@fg: #333;\n@bg: #fff;" + styleTemplate;
          } else {
            data += "@import \"styles/syntax-variables.less\";\n@fg: @syntax-text-color;\n@bg: @syntax-background-color;" + styleTemplate;
          }
          return less.render(data, {
            paths: [themePath, path.resolve(themePath, 'styles')]
          }, function(error, output) {
            var css;
            if (error) {
              return typeof cb === "function" ? cb(error) : void 0;
            }
            css = output.css.replace(/[^\.]atom-text-editor/g, '.markdown-preview-enhanced pre').replace(/:host/g, '.markdown-preview-enhanced .host').replace(/\.syntax\-\-/g, '.mpe-syntax--');
            if (changeStyleElement) {
              previewThemeElement.innerHTML = css;
            }
            return typeof cb === "function" ? cb(false, css) : void 0;
          });
        });
        return;
      }
    }
    return typeof cb === "function" ? cb('theme not found') : void 0;
  };

  module.exports = {
    loadPreviewTheme: loadPreviewTheme
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9zdHlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUNoQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsRUFBQSxHQUFLOztFQUNMLElBQUEsR0FBTzs7RUFDUCxlQUFBLEdBQWtCOztFQUdsQixnQkFBQSxHQUFtQixTQUFDLFlBQUQsRUFBZSxHQUFmLEVBQXFDLEVBQXJDO0FBQ2pCLFFBQUE7SUFEaUMscUJBQUQ7O01BQ2hDLHFCQUFzQjs7SUFDdEIsZUFBQSxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkNBQWhCO0lBRWxCLG1CQUFBLEdBQXNCLFFBQVEsQ0FBQyxjQUFULENBQXdCLHlDQUF4QjtJQUN0QixtQ0FBb0QsbUJBQW1CLENBQUUsWUFBckIsQ0FBa0Msb0JBQWxDLFdBQUEsS0FBMkQsWUFBM0QsbUNBQTRFLG1CQUFtQixDQUFFLFNBQVMsQ0FBQyxnQkFBM0csbUNBQXNILG1CQUFtQixDQUFFLFlBQXJCLENBQWtDLHVCQUFsQyxXQUFBLEtBQThELGVBQWUsQ0FBQyxRQUFoQixDQUFBLENBQXhPO0FBQUEsd0NBQU8sR0FBSSxPQUFPLG1CQUFtQixDQUFDLG9CQUF0Qzs7SUFFQSxJQUFHLENBQUMsbUJBQUo7TUFDRSxtQkFBQSxHQUFzQixRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUN0QixtQkFBbUIsQ0FBQyxFQUFwQixHQUF5QjtNQUN6QixtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQyxLQUFqQyxFQUF3QywyQkFBeEM7TUFDQSxJQUFBLEdBQU8sUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQTtNQUM3QyxVQUFBLEdBQWEsUUFB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O0lBQ2Ysa0JBQUEsZ0JBRGU7O0FBbEZqQiIsInNvdXJjZXNDb250ZW50IjpbInN0eWxlVGVtcGxhdGUgPSByZXF1aXJlICcuL3N0eWxlLXRlbXBsYXRlJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmZzID0gbnVsbFxubGVzcyA9IG51bGxcbm1wZUdpdGh1YlN5bnRheCA9IG51bGxcblxuIyBjYihlcnJvciwgY3NzKSBpcyBvcHRpb25hbFxubG9hZFByZXZpZXdUaGVtZSA9IChwcmV2aWV3VGhlbWUsIHtjaGFuZ2VTdHlsZUVsZW1lbnR9LCBjYiktPlxuICBjaGFuZ2VTdHlsZUVsZW1lbnQgPz0gZmFsc2VcbiAgd2hpdGVCYWNrZ3JvdW5kID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLndoaXRlQmFja2dyb3VuZCdcblxuICBwcmV2aWV3VGhlbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQtcHJldmlldy10aGVtZScpXG4gIHJldHVybiBjYj8oZmFsc2UsIHByZXZpZXdUaGVtZUVsZW1lbnQuaW5uZXJIVE1MKSBpZiBwcmV2aWV3VGhlbWVFbGVtZW50Py5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJldmlldy10aGVtZScpID09IHByZXZpZXdUaGVtZSBhbmQgcHJldmlld1RoZW1lRWxlbWVudD8uaW5uZXJIVE1MLmxlbmd0aCBhbmQgcHJldmlld1RoZW1lRWxlbWVudD8uZ2V0QXR0cmlidXRlKCdkYXRhLXdoaXRlLWJhY2tncm91bmQnKSA9PSB3aGl0ZUJhY2tncm91bmQudG9TdHJpbmcoKSAjIHNhbWUgcHJldmlldyB0aGVtZSwgbm8gbmVlZCB0byBjaGFuZ2UuXG5cbiAgaWYgIXByZXZpZXdUaGVtZUVsZW1lbnRcbiAgICBwcmV2aWV3VGhlbWVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuaWQgPSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC1wcmV2aWV3LXRoZW1lJ1xuICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdmb3InLCAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCcpXG4gICAgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF1cbiAgICBhdG9tU3R5bGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2F0b20tc3R5bGVzJylbMF1cbiAgICBoZWFkLmluc2VydEJlZm9yZShwcmV2aWV3VGhlbWVFbGVtZW50LCBhdG9tU3R5bGVzKVxuICBwcmV2aWV3VGhlbWVFbGVtZW50LnNldEF0dHJpYnV0ZSAnZGF0YS1wcmV2aWV3LXRoZW1lJywgcHJldmlld1RoZW1lIGlmIGNoYW5nZVN0eWxlRWxlbWVudFxuICBwcmV2aWV3VGhlbWVFbGVtZW50LnNldEF0dHJpYnV0ZSAnZGF0YS13aGl0ZS1iYWNrZ3JvdW5kJywgd2hpdGVCYWNrZ3JvdW5kLnRvU3RyaW5nKCkgaWYgY2hhbmdlU3R5bGVFbGVtZW50XG5cbiAgZnMgPz0gcmVxdWlyZSAnZnMnXG4gIGxlc3MgPz0gcmVxdWlyZSAnbGVzcydcbiAgdGhlbWVzID0gYXRvbS50aGVtZXMuZ2V0TG9hZGVkVGhlbWVzKClcblxuICBpZiBwcmV2aWV3VGhlbWUgPT0gJ21wZS1naXRodWItc3ludGF4J1xuICAgIG1wZUdpdGh1YlN5bnRheCA/PSByZXF1aXJlICcuL21wZS1naXRodWItc3ludGF4LXRlbXBsYXRlLmNvZmZlZSdcbiAgICBkYXRhID0gbXBlR2l0aHViU3ludGF4ICsgXCJcIlwiXG4gICAgICBAZmc6ICMzMzM7XG4gICAgICBAYmc6ICNmZmY7XG4gICAgXCJcIlwiICsgc3R5bGVUZW1wbGF0ZVxuICAgIHJldHVybiBsZXNzLnJlbmRlciBkYXRhLCB7fSwgKGVycm9yLCBvdXRwdXQpLT5cbiAgICAgIHJldHVybiBjYj8oZXJyb3IpIGlmIGVycm9yXG4gICAgICBjc3MgPSBvdXRwdXQuY3NzLnJlcGxhY2UoL1teXFwuXWF0b20tdGV4dC1lZGl0b3IvZywgJy5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkIHByZScpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCAuaG9zdCcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLnN5bnRheFxcLVxcLS9nLCAnLm1wZS1zeW50YXgtLScpXG5cbiAgICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuaW5uZXJIVE1MID0gY3NzIGlmIGNoYW5nZVN0eWxlRWxlbWVudFxuICAgICAgcmV0dXJuIGNiPyhmYWxzZSwgY3NzKVxuXG4gICMgdHJhdmVyc2UgYWxsIHRoZW1lc1xuICBmb3IgdGhlbWUgaW4gdGhlbWVzXG4gICAgaWYgdGhlbWUubmFtZSA9PSBwcmV2aWV3VGhlbWUgIyBmb3VuZCB0aGUgdGhlbWUgdGhhdCBtYXRjaCBwcmV2aWV3VGhlbWVcbiAgICAgIHRoZW1lUGF0aCA9IHRoZW1lLnBhdGhcbiAgICAgIGluZGV4TGVzc1BhdGggPSBwYXRoLnJlc29sdmUodGhlbWVQYXRoLCAnLi9pbmRleC5sZXNzJylcbiAgICAgIHN5bnRheFZhcmlhYmxlc0ZpbGUgPSBwYXRoLnJlc29sdmUodGhlbWVQYXRoLCAnLi9zdHlsZXMvc3ludGF4LXZhcmlhYmxlcy5sZXNzJylcblxuICAgICAgIyBjb21waWxlIGxlc3MgdG8gY3NzXG4gICAgICBmcy5yZWFkRmlsZSBpbmRleExlc3NQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9LCAoZXJyb3IsIGRhdGEpLT5cbiAgICAgICAgcmV0dXJuIGNiPyhlcnJvcikgaWYgZXJyb3JcblxuICAgICAgICAjIHJlcGxhY2UgY3NzIHRvIGNzcy5sZXNzOyBvdGhlcndpc2UgaXQgd2lsbCBjYXVzZSBlcnJvci5cbiAgICAgICAgZGF0YSA9IChkYXRhIG9yICcnKS5yZXBsYWNlKC9cXC9jc3MoXCJ8JylcXDsvZywgJ1xcL2Nzcy5sZXNzJDE7JylcbiAgICAgICAgaWYgd2hpdGVCYWNrZ3JvdW5kXG4gICAgICAgICAgZGF0YSArPSBcIlwiXCJcbiAgICAgICAgICBAaW1wb3J0IFxcXCJzdHlsZXMvc3ludGF4LXZhcmlhYmxlcy5sZXNzXFxcIjtcXG5cbiAgICAgICAgICBAZmc6ICMzMzM7XG4gICAgICAgICAgQGJnOiAjZmZmO1xuICAgICAgICAgIFwiXCJcIiArIHN0eWxlVGVtcGxhdGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRhdGEgKz0gXCJcIlwiXG4gICAgICAgICAgQGltcG9ydCBcXFwic3R5bGVzL3N5bnRheC12YXJpYWJsZXMubGVzc1xcXCI7XG4gICAgICAgICAgQGZnOiBAc3ludGF4LXRleHQtY29sb3I7XG4gICAgICAgICAgQGJnOiBAc3ludGF4LWJhY2tncm91bmQtY29sb3I7XG4gICAgICAgICAgXCJcIlwiICsgc3R5bGVUZW1wbGF0ZVxuXG4gICAgICAgIGxlc3MucmVuZGVyIGRhdGEsIHtwYXRoczogW3RoZW1lUGF0aCwgcGF0aC5yZXNvbHZlKHRoZW1lUGF0aCwgJ3N0eWxlcycpXX0sIChlcnJvciwgb3V0cHV0KS0+XG4gICAgICAgICAgcmV0dXJuIGNiPyhlcnJvcikgaWYgZXJyb3JcbiAgICAgICAgICBjc3MgPSBvdXRwdXQuY3NzLnJlcGxhY2UoL1teXFwuXWF0b20tdGV4dC1lZGl0b3IvZywgJy5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkIHByZScpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC86aG9zdC9nLCAnLm1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgLmhvc3QnKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwuc3ludGF4XFwtXFwtL2csICcubXBlLXN5bnRheC0tJylcblxuICAgICAgICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuaW5uZXJIVE1MID0gY3NzIGlmIGNoYW5nZVN0eWxlRWxlbWVudFxuICAgICAgICAgIHJldHVybiBjYj8oZmFsc2UsIGNzcylcbiAgICAgIHJldHVyblxuXG4gIHJldHVybiBjYj8oJ3RoZW1lIG5vdCBmb3VuZCcpICMgZXJyb3IgdGhlbWUgbm90IGZvdW5kXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2FkUHJldmlld1RoZW1lXG59XG4iXX0=
