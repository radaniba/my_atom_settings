(function() {
  var nPrefix, sanitizeContent, toc, uslug;

  uslug = require('uslug');

  nPrefix = function(str, n) {
    var i, j, output, ref;
    output = '';
    for (i = j = 0, ref = n; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      output += str;
    }
    return output;
  };

  sanitizeContent = function(content) {
    var match, offset, output, r;
    output = '';
    offset = 0;
    r = /\!?\[([^\]]*)\]\(([^)]*)\)|<([^>]*)>([^<]*)<\/([^>]*)>|\[\^([^\]]*)\]/g;
    match = null;
    while (match = r.exec(content)) {
      output += content.slice(offset, match.index);
      offset = match.index + match[0].length;
      if (match[0][0] === '<') {
        output += match[4];
      } else if (match[0][0] === '[' && match[0][1] === '^') {
        output += '';
      } else if (match[0][0] !== '!') {
        output += match[1];
      } else {
        output += match[0];
      }
    }
    output += content.slice(offset, content.length);
    return output;
  };


  /*
  opt =
    ordered: boolean
    depthFrom: number, default 1
    depthTo: number, default 6
    tab: string, default '\t'
   */

  toc = function(tokens, opt) {
    var content, depthFrom, depthTo, i, j, k, level, listItem, ordered, outputArr, ref, ref1, slug, smallestLevel, tab, tocTable, token;
    if (opt == null) {
      opt = {};
    }
    if (!tokens || !tokens.length) {
      return {
        content: '',
        array: []
      };
    }
    ordered = opt.ordered;
    depthFrom = opt.depthFrom || 1;
    depthTo = opt.depthTo || 6;
    tab = opt.tab || '\t';
    tokens = tokens.filter(function(token) {
      return token.level >= depthFrom && token.level <= depthTo;
    });
    outputArr = [];
    tocTable = {};
    smallestLevel = tokens[0].level;
    for (i = j = 0, ref = tokens.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (tokens[i].level < smallestLevel) {
        smallestLevel = tokens[i].level;
      }
    }
    for (i = k = 0, ref1 = tokens.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      token = tokens[i];
      content = token.content;
      level = token.level;
      slug = uslug(content);
      if (tocTable[slug] >= 0) {
        tocTable[slug] += 1;
        slug += '-' + tocTable[slug];
      } else {
        tocTable[slug] = 0;
      }
      listItem = "" + (nPrefix(tab, level - smallestLevel)) + (ordered ? "1." : '*') + " [" + (sanitizeContent(content)) + "](#" + slug + ")";
      outputArr.push(listItem);
    }
    return {
      content: outputArr.join('\n'),
      array: outputArr
    };
  };

  module.exports = toc;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi90b2MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBRVIsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLENBQU47QUFDUixRQUFBO0lBQUEsTUFBQSxHQUFTO0FBQ1QsU0FBUywwRUFBVDtNQUNFLE1BQUEsSUFBVTtBQURaO0FBRUEsV0FBTztFQUpDOztFQWlCVixlQUFBLEdBQWtCLFNBQUMsT0FBRDtBQUNoQixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBQSxHQUFTO0lBTVQsQ0FBQSxHQUFJO0lBQ0osS0FBQSxHQUFRO0FBQ1IsV0FBTSxLQUFBLEdBQVEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQLENBQWQ7TUFDRSxNQUFBLElBQVUsT0FBTyxDQUFDLEtBQVIsQ0FBYyxNQUFkLEVBQXNCLEtBQUssQ0FBQyxLQUE1QjtNQUNWLE1BQUEsR0FBUyxLQUFLLENBQUMsS0FBTixHQUFjLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQztNQUVoQyxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQVQsS0FBZSxHQUFsQjtRQUNFLE1BQUEsSUFBVSxLQUFNLENBQUEsQ0FBQSxFQURsQjtPQUFBLE1BRUssSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFULEtBQWUsR0FBZixJQUF1QixLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFULEtBQWUsR0FBekM7UUFDSCxNQUFBLElBQVUsR0FEUDtPQUFBLE1BRUEsSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFULEtBQWUsR0FBbEI7UUFDSCxNQUFBLElBQVUsS0FBTSxDQUFBLENBQUEsRUFEYjtPQUFBLE1BQUE7UUFHSCxNQUFBLElBQVUsS0FBTSxDQUFBLENBQUEsRUFIYjs7SUFSUDtJQWFBLE1BQUEsSUFBVSxPQUFPLENBQUMsS0FBUixDQUFjLE1BQWQsRUFBc0IsT0FBTyxDQUFDLE1BQTlCO0FBQ1YsV0FBTztFQXhCUzs7O0FBMEJsQjs7Ozs7Ozs7RUFPQSxHQUFBLEdBQU0sU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNKLFFBQUE7O01BRGEsTUFBSTs7SUFDakIsSUFBRyxDQUFDLE1BQUQsSUFBVyxDQUFDLE1BQU0sQ0FBQyxNQUF0QjtBQUNFLGFBQU87UUFBQyxPQUFBLEVBQVMsRUFBVjtRQUFjLEtBQUEsRUFBTyxFQUFyQjtRQURUOztJQUdBLE9BQUEsR0FBVSxHQUFHLENBQUM7SUFDZCxTQUFBLEdBQVksR0FBRyxDQUFDLFNBQUosSUFBaUI7SUFDN0IsT0FBQSxHQUFVLEdBQUcsQ0FBQyxPQUFKLElBQWU7SUFDekIsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQUFKLElBQVc7SUFFakIsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBQyxLQUFEO2FBQ3JCLEtBQUssQ0FBQyxLQUFOLElBQWUsU0FBZixJQUE2QixLQUFLLENBQUMsS0FBTixJQUFlO0lBRHZCLENBQWQ7SUFHVCxTQUFBLEdBQVk7SUFDWixRQUFBLEdBQVc7SUFDWCxhQUFBLEdBQWdCLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQztBQUcxQixTQUFTLHNGQUFUO01BQ0UsSUFBRyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBVixHQUFrQixhQUFyQjtRQUNFLGFBQUEsR0FBZ0IsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BRDVCOztBQURGO0FBSUEsU0FBUywyRkFBVDtNQUNFLEtBQUEsR0FBUSxNQUFPLENBQUEsQ0FBQTtNQUNmLE9BQUEsR0FBVSxLQUFLLENBQUM7TUFDaEIsS0FBQSxHQUFRLEtBQUssQ0FBQztNQUNkLElBQUEsR0FBTyxLQUFBLENBQU0sT0FBTjtNQUVQLElBQUcsUUFBUyxDQUFBLElBQUEsQ0FBVCxJQUFrQixDQUFyQjtRQUNFLFFBQVMsQ0FBQSxJQUFBLENBQVQsSUFBa0I7UUFDbEIsSUFBQSxJQUFRLEdBQUEsR0FBTSxRQUFTLENBQUEsSUFBQSxFQUZ6QjtPQUFBLE1BQUE7UUFJRSxRQUFTLENBQUEsSUFBQSxDQUFULEdBQWlCLEVBSm5COztNQU1BLFFBQUEsR0FBVyxFQUFBLEdBQUUsQ0FBQyxPQUFBLENBQVEsR0FBUixFQUFhLEtBQUEsR0FBTSxhQUFuQixDQUFELENBQUYsR0FBc0MsQ0FBSSxPQUFILEdBQWdCLElBQWhCLEdBQTBCLEdBQTNCLENBQXRDLEdBQXFFLElBQXJFLEdBQXdFLENBQUMsZUFBQSxDQUFnQixPQUFoQixDQUFELENBQXhFLEdBQWtHLEtBQWxHLEdBQXVHLElBQXZHLEdBQTRHO01BQ3ZILFNBQVMsQ0FBQyxJQUFWLENBQWUsUUFBZjtBQWJGO0FBZUEsV0FBTztNQUNMLE9BQUEsRUFBUyxTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsQ0FESjtNQUVMLEtBQUEsRUFBTyxTQUZGOztFQXBDSDs7RUF5Q04sTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3RmpCIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyAgQXMgdGhlIG1hcmtkb3duLXRvYyBsaWJyYXJ5IGlzIHZlcnkgaGFyZCB0byB1c2VcbiMgIEkgZGVjaWRlIHRvIHdyaXRlIGEgbWFya2Rvd24tdG9jIGxpYnJhcnkgYnkgbXlzZWxmXG4jXG51c2x1ZyA9IHJlcXVpcmUgJ3VzbHVnJ1xuXG5uUHJlZml4ID0gKHN0ciwgbiktPlxuICBvdXRwdXQgPSAnJ1xuICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgb3V0cHV0ICs9IHN0clxuICByZXR1cm4gb3V0cHV0XG5cblxuI1xuIyBlZzpcbiNcbiMgSGFoYSBbQV0od3d3LmEuY29tKSB4eHggW0JdKHd3dy5iLmNvbSlcbiMgIHNob3VsZCBiZWNvbWVcbiMgSGFoYSBBIHh4eCBCXG4jXG4jIGNoZWNrIGlzc3VlICM0MVxuI1xuXG5zYW5pdGl6ZUNvbnRlbnQgPSAoY29udGVudCktPlxuICBvdXRwdXQgPSAnJ1xuICBvZmZzZXQgPSAwXG5cbiAgIyB0ZXN0ICFbLi4uXSguLi4pXG4gICMgdGVzdCBbLi4uXSguLi4pXG4gICMjIDxhIG5hbWU9XCJteUFuY2hvclwiPjwvYT5BbmNob3IgSGVhZGVyXG4gICMgdGVzdCBbXmZvb3Rub3RlXVxuICByID0gL1xcIT9cXFsoW15cXF1dKilcXF1cXCgoW14pXSopXFwpfDwoW14+XSopPihbXjxdKik8XFwvKFtePl0qKT58XFxbXFxeKFteXFxdXSopXFxdL2dcbiAgbWF0Y2ggPSBudWxsXG4gIHdoaWxlIG1hdGNoID0gci5leGVjKGNvbnRlbnQpXG4gICAgb3V0cHV0ICs9IGNvbnRlbnQuc2xpY2Uob2Zmc2V0LCBtYXRjaC5pbmRleClcbiAgICBvZmZzZXQgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aFxuXG4gICAgaWYgbWF0Y2hbMF1bMF0gPT0gJzwnXG4gICAgICBvdXRwdXQgKz0gbWF0Y2hbNF1cbiAgICBlbHNlIGlmIG1hdGNoWzBdWzBdID09ICdbJyBhbmQgbWF0Y2hbMF1bMV0gPT0gJ14nICMgZm9vdG5vdGVcbiAgICAgIG91dHB1dCArPSAnJ1xuICAgIGVsc2UgaWYgbWF0Y2hbMF1bMF0gIT0gJyEnXG4gICAgICBvdXRwdXQgKz0gbWF0Y2hbMV1cbiAgICBlbHNlICMgaW1hZ2VcbiAgICAgIG91dHB1dCArPSBtYXRjaFswXVxuXG4gIG91dHB1dCArPSBjb250ZW50LnNsaWNlKG9mZnNldCwgY29udGVudC5sZW5ndGgpXG4gIHJldHVybiBvdXRwdXRcblxuIyMjXG5vcHQgPVxuICBvcmRlcmVkOiBib29sZWFuXG4gIGRlcHRoRnJvbTogbnVtYmVyLCBkZWZhdWx0IDFcbiAgZGVwdGhUbzogbnVtYmVyLCBkZWZhdWx0IDZcbiAgdGFiOiBzdHJpbmcsIGRlZmF1bHQgJ1xcdCdcbiMjI1xudG9jID0gKHRva2Vucywgb3B0PXt9KS0+XG4gIGlmICF0b2tlbnMgb3IgIXRva2Vucy5sZW5ndGhcbiAgICByZXR1cm4ge2NvbnRlbnQ6ICcnLCBhcnJheTogW119XG5cbiAgb3JkZXJlZCA9IG9wdC5vcmRlcmVkXG4gIGRlcHRoRnJvbSA9IG9wdC5kZXB0aEZyb20gb3IgMVxuICBkZXB0aFRvID0gb3B0LmRlcHRoVG8gb3IgNlxuICB0YWIgPSBvcHQudGFiIG9yICdcXHQnXG5cbiAgdG9rZW5zID0gdG9rZW5zLmZpbHRlciAodG9rZW4pLT5cbiAgICB0b2tlbi5sZXZlbCA+PSBkZXB0aEZyb20gYW5kIHRva2VuLmxldmVsIDw9IGRlcHRoVG9cblxuICBvdXRwdXRBcnIgPSBbXVxuICB0b2NUYWJsZSA9IHt9XG4gIHNtYWxsZXN0TGV2ZWwgPSB0b2tlbnNbMF0ubGV2ZWxcblxuICAjIGdldCBzbWFsbGVzdExldmVsXG4gIGZvciBpIGluIFswLi4udG9rZW5zLmxlbmd0aF1cbiAgICBpZiB0b2tlbnNbaV0ubGV2ZWwgPCBzbWFsbGVzdExldmVsXG4gICAgICBzbWFsbGVzdExldmVsID0gdG9rZW5zW2ldLmxldmVsXG5cbiAgZm9yIGkgaW4gWzAuLi50b2tlbnMubGVuZ3RoXVxuICAgIHRva2VuID0gdG9rZW5zW2ldXG4gICAgY29udGVudCA9IHRva2VuLmNvbnRlbnRcbiAgICBsZXZlbCA9IHRva2VuLmxldmVsXG4gICAgc2x1ZyA9IHVzbHVnKGNvbnRlbnQpXG5cbiAgICBpZiB0b2NUYWJsZVtzbHVnXSA+PSAwXG4gICAgICB0b2NUYWJsZVtzbHVnXSArPSAxXG4gICAgICBzbHVnICs9ICctJyArIHRvY1RhYmxlW3NsdWddXG4gICAgZWxzZVxuICAgICAgdG9jVGFibGVbc2x1Z10gPSAwXG5cbiAgICBsaXN0SXRlbSA9IFwiI3tuUHJlZml4KHRhYiwgbGV2ZWwtc21hbGxlc3RMZXZlbCl9I3tpZiBvcmRlcmVkIHRoZW4gXCIxLlwiIGVsc2UgJyonfSBbI3tzYW5pdGl6ZUNvbnRlbnQoY29udGVudCl9XSgjI3tzbHVnfSlcIlxuICAgIG91dHB1dEFyci5wdXNoKGxpc3RJdGVtKVxuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogb3V0cHV0QXJyLmpvaW4oJ1xcbicpLFxuICAgIGFycmF5OiBvdXRwdXRBcnJcbiAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvY1xuIl19
