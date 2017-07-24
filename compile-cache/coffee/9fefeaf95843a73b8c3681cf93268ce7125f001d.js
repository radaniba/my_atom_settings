(function() {
  var fs, less, loadPreviewTheme, mpeGithubSyntax, path, styleTemplate;

  styleTemplate = require('./style-template');

  path = require('path');

  fs = null;

  less = null;

  mpeGithubSyntax = null;

  loadPreviewTheme = function(previewTheme, changePreview, cb) {
    var atomStyles, data, head, i, indexLessPath, len, previewThemeElement, syntaxVariablesFile, theme, themePath, themes;
    if (changePreview == null) {
      changePreview = false;
    }
    previewThemeElement = document.getElementById('markdown-preview-enhanced-preview-theme');
    if ((previewThemeElement != null ? previewThemeElement.getAttribute('data-preview-theme') : void 0) === previewTheme && (previewThemeElement != null ? previewThemeElement.innerHTML.length : void 0)) {
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
    if (changePreview) {
      previewThemeElement.setAttribute('data-preview-theme', previewTheme);
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
      data = (mpeGithubSyntax + styleTemplate).replace('@import "styles/syntax-variables.less";', '');
      return less.render(data, {}, function(error, output) {
        var css;
        if (error) {
          return typeof cb === "function" ? cb(error) : void 0;
        }
        css = output.css.replace(/[^\.]atom-text-editor/g, '.markdown-preview-enhanced pre').replace(/:host/g, '.markdown-preview-enhanced .host').replace(/\.syntax\-\-/g, '.mpe-syntax--');
        if (changePreview) {
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
          data += styleTemplate;
          return less.render(data, {
            paths: [themePath, path.resolve(themePath, 'styles')]
          }, function(error, output) {
            var css;
            if (error) {
              return typeof cb === "function" ? cb(error) : void 0;
            }
            css = output.css.replace(/[^\.]atom-text-editor/g, '.markdown-preview-enhanced pre').replace(/:host/g, '.markdown-preview-enhanced .host').replace(/\.syntax\-\-/g, '.mpe-syntax--');
            if (changePreview) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9zdHlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUNoQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsRUFBQSxHQUFLOztFQUNMLElBQUEsR0FBTzs7RUFDUCxlQUFBLEdBQWtCOztFQUdsQixnQkFBQSxHQUFtQixTQUFDLFlBQUQsRUFBZSxhQUFmLEVBQW9DLEVBQXBDO0FBQ2pCLFFBQUE7O01BRGdDLGdCQUFjOztJQUM5QyxtQkFBQSxHQUFzQixRQUFRLENBQUMsY0FBVCxDQUF3Qix5Q0FBeEI7SUFDdEIsbUNBQW9ELG1CQUFtQixDQUFFLFlBQXJCLENBQWtDLG9CQUFsQyxXQUFBLEtBQTJELFlBQTNELG1DQUE0RSxtQkFBbUIsQ0FBRSxTQUFTLENBQUMsZ0JBQS9KO0FBQUEsd0NBQU8sR0FBSSxPQUFPLG1CQUFtQixDQUFDLG9CQUF0Qzs7SUFFQSxJQUFHLENBQUMsbUJBQUo7TUFDRSxtQkFBQSxHQUFzQixRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUN0QixtQkFBbUIsQ0FBQyxFQUFwQixHQUF5QjtNQUN6QixtQkFBbUIsQ0FBQyxZQUFwQixDQUFpQyxLQUFqQyxFQUF3QywyQkFBeEM7TUFDQSxJQUFBLEdBQU8sUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQTtNQUM3QyxVQUFBLEdBQWEsUUFBUSxDQUFDLG9CQUFULENBQThCLGFBQTlCLENBQTZDLENBQUEsQ0FBQTtNQUMxRCxJQUFJLENBQUMsWUFBTCxDQUFrQixtQkFBbEIsRUFBdUMsVUFBdkMsRUFORjs7SUFPQSxJQUF1RSxhQUF2RTtNQUFBLG1CQUFtQixDQUFDLFlBQXBCLENBQWlDLG9CQUFqQyxFQUF1RCxZQUF2RCxFQUFBOzs7TUFFQSxLQUFNLE9BQUEsQ0FBUSxJQUFSOzs7TUFDTixPQUFRLE9BQUEsQ0FBUSxNQUFSOztJQUNSLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQVosQ0FBQTtJQUVULElBQUcsWUFBQSxLQUFnQixtQkFBbkI7O1FBQ0Usa0JBQW1CLE9BQUEsQ0FBUSxxQ0FBUjs7TUFDbkIsSUFBQSxHQUFPLENBQUMsZUFBQSxHQUFrQixhQUFuQixDQUFpQyxDQUFDLE9BQWxDLENBQTBDLHlDQUExQyxFQUFxRixFQUFyRjtBQUNQLGFBQU8sSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLEVBQWtCLEVBQWxCLEVBQXNCLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFDM0IsWUFBQTtRQUFBLElBQXFCLEtBQXJCO0FBQUEsNENBQU8sR0FBSSxnQkFBWDs7UUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFYLENBQW1CLHdCQUFuQixFQUE2QyxnQ0FBN0MsQ0FDSSxDQUFDLE9BREwsQ0FDYSxRQURiLEVBQ3VCLGtDQUR2QixDQUVJLENBQUMsT0FGTCxDQUVhLGVBRmIsRUFFOEIsZUFGOUI7UUFJTixJQUF1QyxhQUF2QztVQUFBLG1CQUFtQixDQUFDLFNBQXBCLEdBQWdDLElBQWhDOztBQUNBLDBDQUFPLEdBQUksT0FBTztNQVBTLENBQXRCLEVBSFQ7O0FBYUEsU0FBQSx3Q0FBQTs7TUFDRSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsWUFBakI7UUFDRSxTQUFBLEdBQVksS0FBSyxDQUFDO1FBQ2xCLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGNBQXhCO1FBQ2hCLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixnQ0FBeEI7UUFHdEIsRUFBRSxDQUFDLFFBQUgsQ0FBWSxhQUFaLEVBQTJCO1VBQUMsUUFBQSxFQUFVLE9BQVg7U0FBM0IsRUFBZ0QsU0FBQyxLQUFELEVBQVEsSUFBUjtVQUM5QyxJQUFxQixLQUFyQjtBQUFBLDhDQUFPLEdBQUksZ0JBQVg7O1VBR0EsSUFBQSxHQUFPLENBQUMsSUFBQSxJQUFRLEVBQVQsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsZUFBckIsRUFBc0MsZUFBdEM7VUFDUCxJQUFBLElBQVE7aUJBRVIsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLEVBQWtCO1lBQUMsS0FBQSxFQUFPLENBQUMsU0FBRCxFQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixRQUF4QixDQUFaLENBQVI7V0FBbEIsRUFBMkUsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUN6RSxnQkFBQTtZQUFBLElBQXFCLEtBQXJCO0FBQUEsZ0RBQU8sR0FBSSxnQkFBWDs7WUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFYLENBQW1CLHdCQUFuQixFQUE2QyxnQ0FBN0MsQ0FDSSxDQUFDLE9BREwsQ0FDYSxRQURiLEVBQ3VCLGtDQUR2QixDQUVJLENBQUMsT0FGTCxDQUVhLGVBRmIsRUFFOEIsZUFGOUI7WUFJTixJQUF1QyxhQUF2QztjQUFBLG1CQUFtQixDQUFDLFNBQXBCLEdBQWdDLElBQWhDOztBQUNBLDhDQUFPLEdBQUksT0FBTztVQVB1RCxDQUEzRTtRQVA4QyxDQUFoRDtBQWVBLGVBckJGOztBQURGO0FBd0JBLHNDQUFPLEdBQUk7RUF0RE07O0VBd0RuQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLGtCQUFBLGdCQURlOztBQWhFakIiLCJzb3VyY2VzQ29udGVudCI6WyJzdHlsZVRlbXBsYXRlID0gcmVxdWlyZSAnLi9zdHlsZS10ZW1wbGF0ZSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5mcyA9IG51bGxcbmxlc3MgPSBudWxsXG5tcGVHaXRodWJTeW50YXggPSBudWxsXG5cbiMgY2IoZXJyb3IsIGNzcykgaXMgb3B0aW9uYWxcbmxvYWRQcmV2aWV3VGhlbWUgPSAocHJldmlld1RoZW1lLCBjaGFuZ2VQcmV2aWV3PWZhbHNlLCBjYiktPlxuICBwcmV2aWV3VGhlbWVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQtcHJldmlldy10aGVtZScpXG4gIHJldHVybiBjYj8oZmFsc2UsIHByZXZpZXdUaGVtZUVsZW1lbnQuaW5uZXJIVE1MKSBpZiBwcmV2aWV3VGhlbWVFbGVtZW50Py5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJldmlldy10aGVtZScpID09IHByZXZpZXdUaGVtZSBhbmQgcHJldmlld1RoZW1lRWxlbWVudD8uaW5uZXJIVE1MLmxlbmd0aCAjIHNhbWUgcHJldmlldyB0aGVtZSwgbm8gbmVlZCB0byBjaGFuZ2UuXG5cbiAgaWYgIXByZXZpZXdUaGVtZUVsZW1lbnRcbiAgICBwcmV2aWV3VGhlbWVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuaWQgPSAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC1wcmV2aWV3LXRoZW1lJ1xuICAgIHByZXZpZXdUaGVtZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdmb3InLCAnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCcpXG4gICAgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF1cbiAgICBhdG9tU3R5bGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2F0b20tc3R5bGVzJylbMF1cbiAgICBoZWFkLmluc2VydEJlZm9yZShwcmV2aWV3VGhlbWVFbGVtZW50LCBhdG9tU3R5bGVzKVxuICBwcmV2aWV3VGhlbWVFbGVtZW50LnNldEF0dHJpYnV0ZSAnZGF0YS1wcmV2aWV3LXRoZW1lJywgcHJldmlld1RoZW1lIGlmIGNoYW5nZVByZXZpZXdcblxuICBmcyA/PSByZXF1aXJlICdmcydcbiAgbGVzcyA/PSByZXF1aXJlICdsZXNzJ1xuICB0aGVtZXMgPSBhdG9tLnRoZW1lcy5nZXRMb2FkZWRUaGVtZXMoKVxuXG4gIGlmIHByZXZpZXdUaGVtZSA9PSAnbXBlLWdpdGh1Yi1zeW50YXgnXG4gICAgbXBlR2l0aHViU3ludGF4ID89IHJlcXVpcmUgJy4vbXBlLWdpdGh1Yi1zeW50YXgtdGVtcGxhdGUuY29mZmVlJ1xuICAgIGRhdGEgPSAobXBlR2l0aHViU3ludGF4ICsgc3R5bGVUZW1wbGF0ZSkucmVwbGFjZSgnQGltcG9ydCBcInN0eWxlcy9zeW50YXgtdmFyaWFibGVzLmxlc3NcIjsnLCAnJylcbiAgICByZXR1cm4gbGVzcy5yZW5kZXIgZGF0YSwge30sIChlcnJvciwgb3V0cHV0KS0+XG4gICAgICByZXR1cm4gY2I/KGVycm9yKSBpZiBlcnJvclxuICAgICAgY3NzID0gb3V0cHV0LmNzcy5yZXBsYWNlKC9bXlxcLl1hdG9tLXRleHQtZWRpdG9yL2csICcubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBwcmUnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC86aG9zdC9nLCAnLm1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQgLmhvc3QnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC5zeW50YXhcXC1cXC0vZywgJy5tcGUtc3ludGF4LS0nKVxuXG4gICAgICBwcmV2aWV3VGhlbWVFbGVtZW50LmlubmVySFRNTCA9IGNzcyBpZiBjaGFuZ2VQcmV2aWV3XG4gICAgICByZXR1cm4gY2I/KGZhbHNlLCBjc3MpXG5cbiAgIyB0cmF2ZXJzZSBhbGwgdGhlbWVzXG4gIGZvciB0aGVtZSBpbiB0aGVtZXNcbiAgICBpZiB0aGVtZS5uYW1lID09IHByZXZpZXdUaGVtZSAjIGZvdW5kIHRoZSB0aGVtZSB0aGF0IG1hdGNoIHByZXZpZXdUaGVtZVxuICAgICAgdGhlbWVQYXRoID0gdGhlbWUucGF0aFxuICAgICAgaW5kZXhMZXNzUGF0aCA9IHBhdGgucmVzb2x2ZSh0aGVtZVBhdGgsICcuL2luZGV4Lmxlc3MnKVxuICAgICAgc3ludGF4VmFyaWFibGVzRmlsZSA9IHBhdGgucmVzb2x2ZSh0aGVtZVBhdGgsICcuL3N0eWxlcy9zeW50YXgtdmFyaWFibGVzLmxlc3MnKVxuXG4gICAgICAjIGNvbXBpbGUgbGVzcyB0byBjc3NcbiAgICAgIGZzLnJlYWRGaWxlIGluZGV4TGVzc1BhdGgsIHtlbmNvZGluZzogJ3V0Zi04J30sIChlcnJvciwgZGF0YSktPlxuICAgICAgICByZXR1cm4gY2I/KGVycm9yKSBpZiBlcnJvclxuXG4gICAgICAgICMgcmVwbGFjZSBjc3MgdG8gY3NzLmxlc3M7IG90aGVyd2lzZSBpdCB3aWxsIGNhdXNlIGVycm9yLlxuICAgICAgICBkYXRhID0gKGRhdGEgb3IgJycpLnJlcGxhY2UoL1xcL2NzcyhcInwnKVxcOy9nLCAnXFwvY3NzLmxlc3MkMTsnKVxuICAgICAgICBkYXRhICs9IHN0eWxlVGVtcGxhdGVcblxuICAgICAgICBsZXNzLnJlbmRlciBkYXRhLCB7cGF0aHM6IFt0aGVtZVBhdGgsIHBhdGgucmVzb2x2ZSh0aGVtZVBhdGgsICdzdHlsZXMnKV19LCAoZXJyb3IsIG91dHB1dCktPlxuICAgICAgICAgIHJldHVybiBjYj8oZXJyb3IpIGlmIGVycm9yXG4gICAgICAgICAgY3NzID0gb3V0cHV0LmNzcy5yZXBsYWNlKC9bXlxcLl1hdG9tLXRleHQtZWRpdG9yL2csICcubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCBwcmUnKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkIC5ob3N0JylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcLnN5bnRheFxcLVxcLS9nLCAnLm1wZS1zeW50YXgtLScpXG5cbiAgICAgICAgICBwcmV2aWV3VGhlbWVFbGVtZW50LmlubmVySFRNTCA9IGNzcyBpZiBjaGFuZ2VQcmV2aWV3XG4gICAgICAgICAgcmV0dXJuIGNiPyhmYWxzZSwgY3NzKVxuICAgICAgcmV0dXJuXG5cbiAgcmV0dXJuIGNiPygndGhlbWUgbm90IGZvdW5kJykgIyBlcnJvciB0aGVtZSBub3QgZm91bmRcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWRQcmV2aWV3VGhlbWVcbn1cbiJdfQ==
