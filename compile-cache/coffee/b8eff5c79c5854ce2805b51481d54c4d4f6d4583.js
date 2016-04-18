(function() {
  var CODE_REGEX, Entities, IMG_REGEX, LINK_REGEX, delimitCode, htmlEntities, marked, tidyInlineMarkdown;

  Entities = require('html-entities').AllHtmlEntities;

  marked = require('marked');

  delimitCode = require('./utils').delimitCode;

  htmlEntities = new Entities();

  IMG_REGEX = /<img src="([^"]*)"(?: alt="([^"]*)")?(?: title="([^"]*)")?>/g;

  LINK_REGEX = /<a href="([^"]*)"(?: title="([^"]*)")?>([^<]*)<\/a>/g;

  CODE_REGEX = /<code>([^<]+)<\/code>/g;

  tidyInlineMarkdown = function(token) {
    token.text = marked.inlineLexer(token.text, token.links || {}).replace(/\u2014/g, '--').replace(/\u2018|\u2019/g, '\'').replace(/\u201c|\u201d/g, '"').replace(/\u2026/g, '...').replace(/<\/?strong>/g, '**').replace(/<\/?em>/g, '_').replace(/<\/?del>/g, '~~').replace(CODE_REGEX, function(m, code) {
      return delimitCode(code, '`');
    }).replace(IMG_REGEX, function(m, url, alt, title) {
      if (url == null) {
        url = '';
      }
      if (alt == null) {
        alt = '';
      }
      if (title != null) {
        title = title.replace(/\\|"/g, function(m) {
          return "\\" + m;
        });
        url += " \"" + title + "\"";
      }
      return "![" + alt + "](" + url + ")";
    }).replace(LINK_REGEX, function(m, url, title, text) {
      if (url == null) {
        url = '';
      }
      if (text == null) {
        text = '';
      }
      if (title != null) {
        title = title.replace(/\\|"/g, function(m) {
          return "\\" + m;
        });
        url += " \"" + title + "\"";
      }
      if (url === text && url !== '') {
        return "<" + url + ">";
      } else {
        return "[" + text + "](" + url + ")";
      }
    });
    token.text = htmlEntities.decode(token.text);
    return token;
  };

  module.exports = tidyInlineMarkdown;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90aWR5LW1hcmtkb3duL25vZGVfbW9kdWxlcy90aWR5LW1hcmtkb3duL2xpYi90aWR5LWlubGluZS1tYXJrZG93bi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0dBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxlQUFwQyxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUdDLGNBQWUsT0FBQSxDQUFRLFNBQVIsRUFBZixXQUhELENBQUE7O0FBQUEsRUFLQSxZQUFBLEdBQW1CLElBQUEsUUFBQSxDQUFBLENBTG5CLENBQUE7O0FBQUEsRUFNQSxTQUFBLEdBQVksOERBTlosQ0FBQTs7QUFBQSxFQU9BLFVBQUEsR0FBYSxzREFQYixDQUFBOztBQUFBLEVBUUEsVUFBQSxHQUFhLHdCQVJiLENBQUE7O0FBQUEsRUFTQSxrQkFBQSxHQUFxQixTQUFDLEtBQUQsR0FBQTtBQUNuQixJQUFBLEtBQUssQ0FBQyxJQUFOLEdBQWEsTUFDWCxDQUFDLFdBRFUsQ0FDRSxLQUFLLENBQUMsSUFEUixFQUNjLEtBQUssQ0FBQyxLQUFOLElBQWUsRUFEN0IsQ0FFWCxDQUFDLE9BRlUsQ0FFRixTQUZFLEVBRVMsSUFGVCxDQUdYLENBQUMsT0FIVSxDQUdGLGdCQUhFLEVBR2dCLElBSGhCLENBSVgsQ0FBQyxPQUpVLENBSUYsZ0JBSkUsRUFJZ0IsR0FKaEIsQ0FLWCxDQUFDLE9BTFUsQ0FLRixTQUxFLEVBS1MsS0FMVCxDQU1YLENBQUMsT0FOVSxDQU1GLGNBTkUsRUFNYyxJQU5kLENBT1gsQ0FBQyxPQVBVLENBT0YsVUFQRSxFQU9VLEdBUFYsQ0FRWCxDQUFDLE9BUlUsQ0FRRixXQVJFLEVBUVcsSUFSWCxDQVNYLENBQUMsT0FUVSxDQVNGLFVBVEUsRUFTVSxTQUFDLENBQUQsRUFBSSxJQUFKLEdBQUE7YUFBYSxXQUFBLENBQVksSUFBWixFQUFrQixHQUFsQixFQUFiO0lBQUEsQ0FUVixDQVVYLENBQUMsT0FWVSxDQVVGLFNBVkUsRUFVUyxTQUFDLENBQUQsRUFBSSxHQUFKLEVBQVksR0FBWixFQUFvQixLQUFwQixHQUFBOztRQUFJLE1BQUk7T0FDMUI7O1FBRDhCLE1BQUk7T0FDbEM7QUFBQSxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZCxFQUF1QixTQUFDLENBQUQsR0FBQTtpQkFBUSxJQUFBLEdBQUksRUFBWjtRQUFBLENBQXZCLENBQVIsQ0FBQTtBQUFBLFFBQ0EsR0FBQSxJQUFRLEtBQUEsR0FBSyxLQUFMLEdBQVcsSUFEbkIsQ0FERjtPQUFBO0FBR0EsYUFBUSxJQUFBLEdBQUksR0FBSixHQUFRLElBQVIsR0FBWSxHQUFaLEdBQWdCLEdBQXhCLENBSmtCO0lBQUEsQ0FWVCxDQWVYLENBQUMsT0FmVSxDQWVGLFVBZkUsRUFlVSxTQUFDLENBQUQsRUFBSSxHQUFKLEVBQVksS0FBWixFQUFtQixJQUFuQixHQUFBOztRQUFJLE1BQUk7T0FDM0I7O1FBRHNDLE9BQUs7T0FDM0M7QUFBQSxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsT0FBZCxFQUF1QixTQUFDLENBQUQsR0FBQTtpQkFBUSxJQUFBLEdBQUksRUFBWjtRQUFBLENBQXZCLENBQVIsQ0FBQTtBQUFBLFFBQ0EsR0FBQSxJQUFRLEtBQUEsR0FBSyxLQUFMLEdBQVcsSUFEbkIsQ0FERjtPQUFBO0FBSUEsTUFBQSxJQUFHLEdBQUEsS0FBTyxJQUFQLElBQWdCLEdBQUEsS0FBUyxFQUE1QjtBQUNFLGVBQVEsR0FBQSxHQUFHLEdBQUgsR0FBTyxHQUFmLENBREY7T0FBQSxNQUFBO0FBR0UsZUFBUSxHQUFBLEdBQUcsSUFBSCxHQUFRLElBQVIsR0FBWSxHQUFaLEdBQWdCLEdBQXhCLENBSEY7T0FMbUI7SUFBQSxDQWZWLENBQWIsQ0FBQTtBQUFBLElBeUJBLEtBQUssQ0FBQyxJQUFOLEdBQWEsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsS0FBSyxDQUFDLElBQTFCLENBekJiLENBQUE7QUEwQkEsV0FBTyxLQUFQLENBM0JtQjtFQUFBLENBVHJCLENBQUE7O0FBQUEsRUFzQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsa0JBdENqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/tidy-markdown/node_modules/tidy-markdown/lib/tidy-inline-markdown.coffee
