(function() {
  var path;

  path = require('path');

  module.exports = {
    loadMathJax: function(document, callback) {
      var script;
      if (typeof MathJax === 'undefined') {
        script = document.createElement('script');
        script.addEventListener('load', function() {
          var block, error, inline;
          inline = [['$', '$']];
          block = [['$$', '$$']];
          try {
            inline = JSON.parse(atom.config.get('markdown-preview-enhanced.indicatorForMathRenderingInline')).filter(function(x) {
              return x.length === 2;
            });
            block = JSON.parse(atom.config.get('markdown-preview-enhanced.indicatorForMathRenderingBlock')).filter(function(x) {
              return x.length === 2;
            });
          } catch (error1) {
            error = error1;
            atom.notifications.addError('Failed to parse math delimiters');
          }
          MathJax.Hub.Config({
            extensions: ['tex2jax.js'],
            jax: ['input/TeX', 'output/HTML-CSS'],
            showMathMenu: false,
            messageStyle: 'none',
            tex2jax: {
              inlineMath: inline,
              displayMath: block,
              processEscapes: true,
              processEnvironments: atom.config.get('markdown-preview-enhanced.mathJaxProcessEnvironments')
            },
            TeX: {
              extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
            },
            'HTML-CSS': {
              availableFonts: ['TeX']
            },
            skipStartupTypeset: true
          });
          MathJax.Hub.Configured();
          return typeof callback === "function" ? callback() : void 0;
        });
        script.type = 'text/javascript';
        script.src = path.resolve(__dirname, '../dependencies/mathjax/MathJax.js?delayStartupUntil=configured');
        return document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        return typeof callback === "function" ? callback() : void 0;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXRoamF4LXdyYXBwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFdBQUEsRUFBYSxTQUFDLFFBQUQsRUFBVyxRQUFYO0FBQ1gsVUFBQTtNQUFBLElBQUcsT0FBTyxPQUFQLEtBQW1CLFdBQXRCO1FBQ0UsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO1FBQ1QsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFNBQUE7QUFDOUIsY0FBQTtVQUFBLE1BQUEsR0FBUyxDQUFDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBRDtVQUNULEtBQUEsR0FBUSxDQUFDLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBRDtBQUVSO1lBQ0UsTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJEQUFoQixDQUFYLENBQXdGLENBQUMsTUFBekYsQ0FBZ0csU0FBQyxDQUFEO3FCQUFLLENBQUMsQ0FBQyxNQUFGLEtBQVU7WUFBZixDQUFoRztZQUNULEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwREFBaEIsQ0FBWCxDQUF1RixDQUFDLE1BQXhGLENBQStGLFNBQUMsQ0FBRDtxQkFBSyxDQUFDLENBQUMsTUFBRixLQUFVO1lBQWYsQ0FBL0YsRUFGVjtXQUFBLGNBQUE7WUFHTTtZQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsaUNBQTVCLEVBSkY7O1VBT0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLENBQW1CO1lBQ2pCLFVBQUEsRUFBWSxDQUFDLFlBQUQsQ0FESztZQUVqQixHQUFBLEVBQUssQ0FBQyxXQUFELEVBQWMsaUJBQWQsQ0FGWTtZQUdqQixZQUFBLEVBQWMsS0FIRztZQUlqQixZQUFBLEVBQWMsTUFKRztZQUtqQixPQUFBLEVBQVM7Y0FDUCxVQUFBLEVBQVksTUFETDtjQUVQLFdBQUEsRUFBYSxLQUZOO2NBR1AsY0FBQSxFQUFnQixJQUhUO2NBSVAsbUJBQUEsRUFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNEQUFoQixDQUpkO2FBTFE7WUFhakIsR0FBQSxFQUFLO2NBQ0gsVUFBQSxFQUFZLENBQUMsWUFBRCxFQUFlLGVBQWYsRUFBZ0MsYUFBaEMsRUFBK0MsZ0JBQS9DLENBRFQ7YUFiWTtZQWdCakIsVUFBQSxFQUFZO2NBQUUsY0FBQSxFQUFnQixDQUFDLEtBQUQsQ0FBbEI7YUFoQks7WUFpQmpCLGtCQUFBLEVBQW9CLElBakJIO1dBQW5CO1VBb0JBLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBWixDQUFBO2tEQUNBO1FBaEM4QixDQUFoQztRQWtDQSxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsaUVBQXhCO2VBRWIsUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBekMsQ0FBcUQsTUFBckQsRUF2Q0Y7T0FBQSxNQUFBO2dEQTBDRSxvQkExQ0Y7O0lBRFcsQ0FBYjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlKCdwYXRoJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICBsb2FkTWF0aEpheDogKGRvY3VtZW50LCBjYWxsYmFjayktPlxuICAgIGlmIHR5cGVvZihNYXRoSmF4KSA9PSAndW5kZWZpbmVkJ1xuICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICAgIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyICdsb2FkJywgKCktPlxuICAgICAgICBpbmxpbmUgPSBbWyckJywgJyQnXV1cbiAgICAgICAgYmxvY2sgPSBbWyckJCcsICckJCddXVxuXG4gICAgICAgIHRyeVxuICAgICAgICAgIGlubGluZSA9IEpTT04ucGFyc2UoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmluZGljYXRvckZvck1hdGhSZW5kZXJpbmdJbmxpbmUnKSkuZmlsdGVyICh4KS0+eC5sZW5ndGg9PTJcbiAgICAgICAgICBibG9jayA9IEpTT04ucGFyc2UoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmluZGljYXRvckZvck1hdGhSZW5kZXJpbmdCbG9jaycpKS5maWx0ZXIgKHgpLT54Lmxlbmd0aD09MlxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHRvIHBhcnNlIG1hdGggZGVsaW1pdGVycycpXG5cbiAgICAgICAgIyAgY29uZmlnIE1hdGhKYXhcbiAgICAgICAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICAgICAgICBleHRlbnNpb25zOiBbJ3RleDJqYXguanMnXSxcbiAgICAgICAgICBqYXg6IFsnaW5wdXQvVGVYJywgJ291dHB1dC9IVE1MLUNTUyddLFxuICAgICAgICAgIHNob3dNYXRoTWVudTogZmFsc2UsXG4gICAgICAgICAgbWVzc2FnZVN0eWxlOiAnbm9uZScsXG4gICAgICAgICAgdGV4MmpheDoge1xuICAgICAgICAgICAgaW5saW5lTWF0aDogaW5saW5lLFxuICAgICAgICAgICAgZGlzcGxheU1hdGg6IGJsb2NrLFxuICAgICAgICAgICAgcHJvY2Vzc0VzY2FwZXM6IHRydWUsXG4gICAgICAgICAgICBwcm9jZXNzRW52aXJvbm1lbnRzOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWF0aEpheFByb2Nlc3NFbnZpcm9ubWVudHMnKSxcbiAgICAgICAgICAgICMgcHJldmlldzogJ25vbmUnLFxuICAgICAgICAgICAgIyBza2lwVGFnczogW1wic2NyaXB0XCIsXCJub3NjcmlwdFwiLFwic3R5bGVcIixcInRleHRhcmVhXCJdXG4gICAgICAgICAgfSxcbiAgICAgICAgICBUZVg6IHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IFsnQU1TbWF0aC5qcycsICdBTVNzeW1ib2xzLmpzJywgJ25vRXJyb3JzLmpzJywgJ25vVW5kZWZpbmVkLmpzJ11cbiAgICAgICAgICB9LFxuICAgICAgICAgICdIVE1MLUNTUyc6IHsgYXZhaWxhYmxlRm9udHM6IFsnVGVYJ10gfSxcbiAgICAgICAgICBza2lwU3RhcnR1cFR5cGVzZXQ6IHRydWVcbiAgICAgICAgfSlcblxuICAgICAgICBNYXRoSmF4Lkh1Yi5Db25maWd1cmVkKClcbiAgICAgICAgY2FsbGJhY2s/KClcblxuICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0J1xuICAgICAgc2NyaXB0LnNyYyA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9kZXBlbmRlbmNpZXMvbWF0aGpheC9NYXRoSmF4LmpzP2RlbGF5U3RhcnR1cFVudGlsPWNvbmZpZ3VyZWQnKVxuXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdClcblxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrPygpXG4iXX0=
