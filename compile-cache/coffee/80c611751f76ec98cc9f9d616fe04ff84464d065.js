(function() {
  var Directory, ebookConvert, execFile, path, processAppearance, processEPub, processMetadata, processPDF;

  path = require('path');

  execFile = require('child_process').execFile;

  Directory = require('atom').Directory;

  processMetadata = function(config, args) {
    var title;
    if (config == null) {
      config = {};
    }
    title = config.title || 'No Title';
    args.push('--title', title);
    if (config['authors']) {
      args.push('--authors', config['authors']);
    }
    if (config['cover']) {
      args.push('--cover', config['cover']);
    }
    if (config['comment']) {
      args.push('--comments', config['comments']);
    }
    if (config['publisher']) {
      args.push('--publisher', config['publisher']);
    }
    if (config['book-producer']) {
      args.push('--book-producer', config['book-producer']);
    }
    if (config['pubdate']) {
      args.push('--pubdate', config['pubdate']);
    }
    if (config['language']) {
      args.push('--language', config['language']);
    }
    if (config['isbn']) {
      args.push('--isbn', config['isbn']);
    }
    if (config['tags']) {
      args.push('--tags', config['tags']);
    }
    if (config['series']) {
      args.push('--series', config['series']);
    }
    if (config['rating']) {
      return args.push('--rating', config['rating']);
    }
  };

  processAppearance = function(config, args) {
    var margin, marginBottom, marginLeft, marginRight, marginTop;
    if (config == null) {
      config = {};
    }
    if (config['asciiize']) {
      args.push('--asciiize');
    }
    if (config['base-font-size']) {
      args.push('--base-font-size=' + config['base-font-size']);
    }
    if (config['disable-font-rescaling']) {
      args.push('--disable-font-rescaling');
    }
    if (config['line-height']) {
      args.push('--line-height=' + config['line-height']);
    }
    marginTop = 72;
    marginRight = 72;
    marginBottom = 72;
    marginLeft = 72;
    if (config['margin']) {
      margin = config['margin'];
      if (margin.constructor === Array) {
        if (margin.length === 1) {
          marginTop = margin[0];
          marginBottom = margin[0];
          marginLeft = margin[0];
          marginRight = margin[0];
        } else if (margin.length === 2) {
          marginTop = margin[0];
          marginBottom = margin[0];
          marginLeft = margin[1];
          marginRight = margin[1];
        } else if (margin.length === 4) {
          marginTop = margin[0];
          marginRight = margin[1];
          marginBottom = margin[2];
          marginLeft = margin[3];
        }
      } else if (typeof margin === 'number') {
        marginTop = margin;
        marginBottom = margin;
        marginLeft = margin;
        marginRight = margin;
      }
    } else {
      if (config['margin-top']) {
        marginTop = config['margin-top'];
      }
      if (config['margin-right']) {
        marginRight = config['margin-right'];
      }
      if (config['margin-bottom']) {
        marginBottom = config['margin-bottom'];
      }
      if (config['margin-left']) {
        marginLeft = config['margin-left'];
      }
    }
    args.push('--margin-top=' + marginTop);
    args.push('--margin-bottom=' + marginBottom);
    args.push('--margin-left=' + marginLeft);
    return args.push('--margin-right=' + marginRight);
  };

  processEPub = function(config, args) {
    if (config == null) {
      config = {};
    }
    if (config['no-default-epub-cover']) {
      args.push('--no-default-epub-cover');
    }
    if (config['no-svg-cover']) {
      args.push('--no-svg-cover');
    }
    if (config['pretty-print']) {
      return args.push('--pretty-print');
    }
  };

  processPDF = function(config, args) {
    if (config == null) {
      config = {};
    }
    if (config['paper-size']) {
      args.push('--paper-size', config['paper-size']);
    }
    if (config['default-font-size']) {
      args.push('--pdf-default-font-size=' + config['default-font-size']);
    }
    if (config['header-template']) {
      args.push('--pdf-header-template', config['header-template']);
    }
    if (config['footer-template']) {
      args.push('--pdf-footer-template', config['footer-template']);
    }
    if (config['page-numbers']) {
      args.push('--pdf-page-numbers');
    }
    if (config['pretty-print']) {
      return args.push('--pretty-print');
    }
  };

  ebookConvert = function(src, dest, config, callback) {
    var args, authors, bookProducer, cover, directory, ebookArgs, epubTOCAtEnd, format, isbn, marginBottom, marginLeft, marginRight, marginTop, pubdate, publisher, title;
    if (config == null) {
      config = {};
    }
    title = config.title || 'No Title';
    authors = config.authors || null;
    publisher = config.publisher || null;
    bookProducer = config['book-producer'] || null;
    pubdate = config['pubdate'] || null;
    isbn = config['isbn'] || null;
    cover = config['cover'] || null;
    epubTOCAtEnd = config['epub-toc-at-end'] || false;
    marginTop = config['margin-top'] || 72;
    marginRight = config['margin-right'] || 72;
    marginBottom = config['margin-bottom'] || 72;
    marginLeft = config['margin-left'] || 72;
    args = [src, dest, '--level1-toc', '//*[@ebook-toc-level-1]/@heading', '--level2-toc', '//*[@ebook-toc-level-2]/@heading', '--level3-toc', '//*[@ebook-toc-level-3]/@heading', '--no-chapters-in-toc'];
    processMetadata(config, args);
    processAppearance(config, args);
    format = path.extname(dest).slice(1);
    if (format === 'epub') {
      processEPub(config['epub'], args);
    } else if (format === 'pdf') {
      processPDF(config['pdf'], args);
    }
    ebookArgs = config.args || [];
    ebookArgs.forEach(function(arg) {
      return args.push(arg);
    });
    directory = new Directory(path.dirname(dest));
    return directory.create().then(function(flag) {
      return execFile('ebook-convert', args, callback);
    });
  };

  module.exports = ebookConvert;


  /*
   * Example
  
  ebookConvert 'test.html', 'test.epub', {title: 'hehe', authors: 'shd101wyy'}, (error)->
    if error
      console.log error
    else
      console.log 'done'
   */

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9lYm9vay1jb252ZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFdBQVksT0FBQSxDQUFRLGVBQVI7O0VBQ1osWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFJZCxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFZLElBQVo7QUFDaEIsUUFBQTs7TUFEaUIsU0FBTzs7SUFDeEIsS0FBQSxHQUFRLE1BQU0sQ0FBQyxLQUFQLElBQWdCO0lBQ3hCLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixLQUFyQjtJQUVBLElBQUcsTUFBTyxDQUFBLFNBQUEsQ0FBVjtNQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixNQUFPLENBQUEsU0FBQSxDQUE5QixFQURGOztJQUdBLElBQUcsTUFBTyxDQUFBLE9BQUEsQ0FBVjtNQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixNQUFPLENBQUEsT0FBQSxDQUE1QixFQURGOztJQUdBLElBQUcsTUFBTyxDQUFBLFNBQUEsQ0FBVjtNQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVixFQUF3QixNQUFPLENBQUEsVUFBQSxDQUEvQixFQURGOztJQUdBLElBQUcsTUFBTyxDQUFBLFdBQUEsQ0FBVjtNQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixFQUF5QixNQUFPLENBQUEsV0FBQSxDQUFoQyxFQURGOztJQUdBLElBQUcsTUFBTyxDQUFBLGVBQUEsQ0FBVjtNQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsaUJBQVYsRUFBNkIsTUFBTyxDQUFBLGVBQUEsQ0FBcEMsRUFERjs7SUFHQSxJQUFHLE1BQU8sQ0FBQSxTQUFBLENBQVY7TUFDRSxJQUFJLENB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SCxFQUVtQixrQ0FGbkIsRUFHRyxjQUhILEVBR21CLGtDQUhuQixFQUlHLGNBSkgsRUFJbUIsa0NBSm5CLEVBS0csc0JBTEg7SUFRUCxlQUFBLENBQWdCLE1BQWhCLEVBQXdCLElBQXhCO0lBQ0EsaUJBQUEsQ0FBa0IsTUFBbEIsRUFBMEIsSUFBMUI7SUFHQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLENBQWtCLENBQUMsS0FBbkIsQ0FBeUIsQ0FBekI7SUFDVCxJQUFHLE1BQUEsS0FBVSxNQUFiO01BQ0UsV0FBQSxDQUFZLE1BQU8sQ0FBQSxNQUFBLENBQW5CLEVBQTRCLElBQTVCLEVBREY7S0FBQSxNQUVLLElBQUcsTUFBQSxLQUFVLEtBQWI7TUFDSCxVQUFBLENBQVcsTUFBTyxDQUFBLEtBQUEsQ0FBbEIsRUFBMEIsSUFBMUIsRUFERzs7SUFJTCxTQUFBLEdBQVksTUFBTSxDQUFDLElBQVAsSUFBZTtJQUMzQixTQUFTLENBQUMsT0FBVixDQUFrQixTQUFDLEdBQUQ7YUFDaEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWO0lBRGdCLENBQWxCO0lBS0EsU0FBQSxHQUFnQixJQUFBLFNBQUEsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsQ0FBVjtXQUNoQixTQUFTLENBQUMsTUFBVixDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBQyxJQUFEO2FBQ3RCLFFBQUEsQ0FBUyxlQUFULEVBQ1UsSUFEVixFQUVVLFFBRlY7SUFEc0IsQ0FBeEI7RUF6Q2E7O0VBOENmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7QUFFakI7Ozs7Ozs7OztBQWhMQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xue2V4ZWNGaWxlfSA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG57RGlyZWN0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG4jIGVib29rLWNvbnZlcnQgaXMgcmVxdWllZCAoY2FsaWJyZSksIHdoaWNoIGNhbiBiZSBnb3QgZnJvbSBodHRwczovL2NhbGlicmUtZWJvb2suY29tL2Rvd25sb2FkXG4jIHhwYXRoIGh0dHA6Ly93d3cudzNzY2hvb2xzLmNvbS94c2wveHBhdGhfc3ludGF4LmFzcFxuXG5wcm9jZXNzTWV0YWRhdGEgPSAoY29uZmlnPXt9LCBhcmdzKS0+XG4gIHRpdGxlID0gY29uZmlnLnRpdGxlIHx8ICdObyBUaXRsZSdcbiAgYXJncy5wdXNoICctLXRpdGxlJywgdGl0bGVcblxuICBpZiBjb25maWdbJ2F1dGhvcnMnXVxuICAgIGFyZ3MucHVzaCAnLS1hdXRob3JzJywgY29uZmlnWydhdXRob3JzJ11cblxuICBpZiBjb25maWdbJ2NvdmVyJ11cbiAgICBhcmdzLnB1c2ggJy0tY292ZXInLCBjb25maWdbJ2NvdmVyJ11cblxuICBpZiBjb25maWdbJ2NvbW1lbnQnXVxuICAgIGFyZ3MucHVzaCAnLS1jb21tZW50cycsIGNvbmZpZ1snY29tbWVudHMnXVxuXG4gIGlmIGNvbmZpZ1sncHVibGlzaGVyJ11cbiAgICBhcmdzLnB1c2ggJy0tcHVibGlzaGVyJywgY29uZmlnWydwdWJsaXNoZXInXVxuXG4gIGlmIGNvbmZpZ1snYm9vay1wcm9kdWNlciddXG4gICAgYXJncy5wdXNoICctLWJvb2stcHJvZHVjZXInLCBjb25maWdbJ2Jvb2stcHJvZHVjZXInXVxuXG4gIGlmIGNvbmZpZ1sncHViZGF0ZSddXG4gICAgYXJncy5wdXNoICctLXB1YmRhdGUnLCBjb25maWdbJ3B1YmRhdGUnXVxuXG4gIGlmIGNvbmZpZ1snbGFuZ3VhZ2UnXVxuICAgIGFyZ3MucHVzaCAnLS1sYW5ndWFnZScsIGNvbmZpZ1snbGFuZ3VhZ2UnXVxuXG4gIGlmIGNvbmZpZ1snaXNibiddXG4gICAgYXJncy5wdXNoICctLWlzYm4nLCBjb25maWdbJ2lzYm4nXVxuXG4gIGlmIGNvbmZpZ1sndGFncyddXG4gICAgYXJncy5wdXNoICctLXRhZ3MnLCBjb25maWdbJ3RhZ3MnXVxuXG4gIGlmIGNvbmZpZ1snc2VyaWVzJ11cbiAgICBhcmdzLnB1c2ggJy0tc2VyaWVzJywgY29uZmlnWydzZXJpZXMnXVxuXG4gIGlmIGNvbmZpZ1sncmF0aW5nJ11cbiAgICBhcmdzLnB1c2ggJy0tcmF0aW5nJywgY29uZmlnWydyYXRpbmcnXVxuXG5wcm9jZXNzQXBwZWFyYW5jZSA9IChjb25maWc9e30sIGFyZ3MpLT5cbiAgaWYgY29uZmlnWydhc2NpaWl6ZSddXG4gICAgYXJncy5wdXNoICctLWFzY2lpaXplJ1xuXG4gIGlmIGNvbmZpZ1snYmFzZS1mb250LXNpemUnXVxuICAgIGFyZ3MucHVzaCgnLS1iYXNlLWZvbnQtc2l6ZT0nK2NvbmZpZ1snYmFzZS1mb250LXNpemUnXSlcblxuICBpZiBjb25maWdbJ2Rpc2FibGUtZm9udC1yZXNjYWxpbmcnXVxuICAgIGFyZ3MucHVzaCgnLS1kaXNhYmxlLWZvbnQtcmVzY2FsaW5nJylcblxuICBpZiBjb25maWdbJ2xpbmUtaGVpZ2h0J11cbiAgICBhcmdzLnB1c2goJy0tbGluZS1oZWlnaHQ9Jytjb25maWdbJ2xpbmUtaGVpZ2h0J10pXG5cbiAgbWFyZ2luVG9wID0gNzJcbiAgbWFyZ2luUmlnaHQgPSA3MlxuICBtYXJnaW5Cb3R0b20gPSA3MlxuICBtYXJnaW5MZWZ0ID0gNzJcbiAgaWYgY29uZmlnWydtYXJnaW4nXVxuICAgIG1hcmdpbiA9IGNvbmZpZ1snbWFyZ2luJ11cbiAgICBpZiBtYXJnaW4uY29uc3RydWN0b3IgPT0gQXJyYXlcbiAgICAgIGlmIG1hcmdpbi5sZW5ndGggPT0gMVxuICAgICAgICBtYXJnaW5Ub3AgPSBtYXJnaW5bMF1cbiAgICAgICAgbWFyZ2luQm90dG9tID0gbWFyZ2luWzBdXG4gICAgICAgIG1hcmdpbkxlZnQgPSBtYXJnaW5bMF1cbiAgICAgICAgbWFyZ2luUmlnaHQgPSBtYXJnaW5bMF1cbiAgICAgIGVsc2UgaWYgbWFyZ2luLmxlbmd0aCA9PSAyXG4gICAgICAgIG1hcmdpblRvcCA9IG1hcmdpblswXVxuICAgICAgICBtYXJnaW5Cb3R0b20gPSBtYXJnaW5bMF1cbiAgICAgICAgbWFyZ2luTGVmdCA9IG1hcmdpblsxXVxuICAgICAgICBtYXJnaW5SaWdodCA9IG1hcmdpblsxXVxuICAgICAgZWxzZSBpZiBtYXJnaW4ubGVuZ3RoID09IDRcbiAgICAgICAgbWFyZ2luVG9wID0gbWFyZ2luWzBdXG4gICAgICAgIG1hcmdpblJpZ2h0ID0gbWFyZ2luWzFdXG4gICAgICAgIG1hcmdpbkJvdHRvbSA9IG1hcmdpblsyXVxuICAgICAgICBtYXJnaW5MZWZ0ID0gbWFyZ2luWzNdXG4gICAgZWxzZSBpZiB0eXBlb2YobWFyZ2luKSA9PSAnbnVtYmVyJ1xuICAgICAgbWFyZ2luVG9wID0gbWFyZ2luXG4gICAgICBtYXJnaW5Cb3R0b20gPSBtYXJnaW5cbiAgICAgIG1hcmdpbkxlZnQgPSBtYXJnaW5cbiAgICAgIG1hcmdpblJpZ2h0ID0gbWFyZ2luXG4gIGVsc2VcbiAgICBpZiBjb25maWdbJ21hcmdpbi10b3AnXVxuICAgICAgbWFyZ2luVG9wID0gY29uZmlnWydtYXJnaW4tdG9wJ11cbiAgICBpZiBjb25maWdbJ21hcmdpbi1yaWdodCddXG4gICAgICBtYXJnaW5SaWdodCA9IGNvbmZpZ1snbWFyZ2luLXJpZ2h0J11cbiAgICBpZiBjb25maWdbJ21hcmdpbi1ib3R0b20nXVxuICAgICAgbWFyZ2luQm90dG9tID0gY29uZmlnWydtYXJnaW4tYm90dG9tJ11cbiAgICBpZiBjb25maWdbJ21hcmdpbi1sZWZ0J11cbiAgICAgIG1hcmdpbkxlZnQgPSBjb25maWdbJ21hcmdpbi1sZWZ0J11cbiAgYXJncy5wdXNoKCctLW1hcmdpbi10b3A9JyttYXJnaW5Ub3ApXG4gIGFyZ3MucHVzaCgnLS1tYXJnaW4tYm90dG9tPScrbWFyZ2luQm90dG9tKVxuICBhcmdzLnB1c2goJy0tbWFyZ2luLWxlZnQ9JyttYXJnaW5MZWZ0KVxuICBhcmdzLnB1c2goJy0tbWFyZ2luLXJpZ2h0PScrbWFyZ2luUmlnaHQpXG5cblxucHJvY2Vzc0VQdWIgPSAoY29uZmlnPXt9LCBhcmdzKS0+XG4gIGlmIGNvbmZpZ1snbm8tZGVmYXVsdC1lcHViLWNvdmVyJ11cbiAgICBhcmdzLnB1c2ggJy0tbm8tZGVmYXVsdC1lcHViLWNvdmVyJ1xuICBpZiBjb25maWdbJ25vLXN2Zy1jb3ZlciddXG4gICAgYXJncy5wdXNoICctLW5vLXN2Zy1jb3ZlcidcbiAgaWYgY29uZmlnWydwcmV0dHktcHJpbnQnXVxuICAgIGFyZ3MucHVzaCAnLS1wcmV0dHktcHJpbnQnXG5cbnByb2Nlc3NQREYgPSAoY29uZmlnPXt9LCBhcmdzKS0+XG4gIGlmIGNvbmZpZ1sncGFwZXItc2l6ZSddXG4gICAgYXJncy5wdXNoICctLXBhcGVyLXNpemUnLCBjb25maWdbJ3BhcGVyLXNpemUnXVxuXG4gIGlmIGNvbmZpZ1snZGVmYXVsdC1mb250LXNpemUnXVxuICAgIGFyZ3MucHVzaCgnLS1wZGYtZGVmYXVsdC1mb250LXNpemU9Jytjb25maWdbJ2RlZmF1bHQtZm9udC1zaXplJ10pXG5cbiAgaWYgY29uZmlnWydoZWFkZXItdGVtcGxhdGUnXVxuICAgIGFyZ3MucHVzaCgnLS1wZGYtaGVhZGVyLXRlbXBsYXRlJywgY29uZmlnWydoZWFkZXItdGVtcGxhdGUnXSlcblxuICBpZiBjb25maWdbJ2Zvb3Rlci10ZW1wbGF0ZSddXG4gICAgYXJncy5wdXNoKCctLXBkZi1mb290ZXItdGVtcGxhdGUnLCBjb25maWdbJ2Zvb3Rlci10ZW1wbGF0ZSddKVxuXG4gIGlmIGNvbmZpZ1sncGFnZS1udW1iZXJzJ11cbiAgICBhcmdzLnB1c2goJy0tcGRmLXBhZ2UtbnVtYmVycycpXG5cbiAgaWYgY29uZmlnWydwcmV0dHktcHJpbnQnXVxuICAgIGFyZ3MucHVzaCgnLS1wcmV0dHktcHJpbnQnKVxuXG4jIEFzeW5jIGNhbGxcbiMgc3JjOiBsaW5rIHRvIC5odG1sIGZpbGVcbiMgZGVzdDogb3V0cHV0IHBhdGhcbmVib29rQ29udmVydCA9IChzcmMsIGRlc3QsIGNvbmZpZz17fSwgY2FsbGJhY2spLT5cbiAgIyBjb25maWdcbiAgdGl0bGUgPSBjb25maWcudGl0bGUgfHwgJ05vIFRpdGxlJ1xuICBhdXRob3JzID0gY29uZmlnLmF1dGhvcnMgfHwgbnVsbFxuICBwdWJsaXNoZXIgPSBjb25maWcucHVibGlzaGVyIHx8IG51bGxcbiAgYm9va1Byb2R1Y2VyID0gY29uZmlnWydib29rLXByb2R1Y2VyJ10gfHwgbnVsbFxuICBwdWJkYXRlID0gY29uZmlnWydwdWJkYXRlJ10gfHwgbnVsbFxuICBpc2JuID0gY29uZmlnWydpc2JuJ10gfHwgbnVsbFxuICBjb3ZlciA9IGNvbmZpZ1snY292ZXInXSB8fCBudWxsXG4gIGVwdWJUT0NBdEVuZCA9IGNvbmZpZ1snZXB1Yi10b2MtYXQtZW5kJ10gfHwgZmFsc2VcbiAgbWFyZ2luVG9wID0gY29uZmlnWydtYXJnaW4tdG9wJ10gfHwgNzJcbiAgbWFyZ2luUmlnaHQgPSBjb25maWdbJ21hcmdpbi1yaWdodCddIHx8IDcyXG4gIG1hcmdpbkJvdHRvbSA9IGNvbmZpZ1snbWFyZ2luLWJvdHRvbSddIHx8IDcyXG4gIG1hcmdpbkxlZnQgPSBjb25maWdbJ21hcmdpbi1sZWZ0J10gfHwgNzJcblxuICBhcmdzID0gWyAgc3JjLFxuICAgICAgICAgICAgZGVzdCxcbiAgICAgICAgICAgICctLWxldmVsMS10b2MnLCAnLy8qW0BlYm9vay10b2MtbGV2ZWwtMV0vQGhlYWRpbmcnLFxuICAgICAgICAgICAgJy0tbGV2ZWwyLXRvYycsICcvLypbQGVib29rLXRvYy1sZXZlbC0yXS9AaGVhZGluZycsXG4gICAgICAgICAgICAnLS1sZXZlbDMtdG9jJywgJy8vKltAZWJvb2stdG9jLWxldmVsLTNdL0BoZWFkaW5nJyxcbiAgICAgICAgICAgICctLW5vLWNoYXB0ZXJzLWluLXRvYydcbiAgICAgICAgICBdXG5cbiAgcHJvY2Vzc01ldGFkYXRhKGNvbmZpZywgYXJncylcbiAgcHJvY2Vzc0FwcGVhcmFuY2UoY29uZmlnLCBhcmdzKVxuXG4gICMgb3V0cHV0IGZvcm1hdHNcbiAgZm9ybWF0ID0gcGF0aC5leHRuYW1lKGRlc3QpLnNsaWNlKDEpXG4gIGlmIGZvcm1hdCA9PSAnZXB1YidcbiAgICBwcm9jZXNzRVB1Yihjb25maWdbJ2VwdWInXSwgYXJncylcbiAgZWxzZSBpZiBmb3JtYXQgPT0gJ3BkZidcbiAgICBwcm9jZXNzUERGKGNvbmZpZ1sncGRmJ10sIGFyZ3MpXG5cbiAgIyBhcmd1bWVudHNcbiAgZWJvb2tBcmdzID0gY29uZmlnLmFyZ3MgfHwgW11cbiAgZWJvb2tBcmdzLmZvckVhY2ggKGFyZyktPlxuICAgIGFyZ3MucHVzaChhcmcpXG5cbiAgIyBlYm9vay1jb252ZXJ0IHdpbGwgY2F1c2UgZXJyb3IgaWYgZGlyZWN0b3J5IGRvZXNuJ3QgZXhpc3QsXG4gICMgdGhlcmVmb3JlIEkgd2lsbCBjcmVhdGUgZGlyZWN0b3J5IGZpcnN0LlxuICBkaXJlY3RvcnkgPSBuZXcgRGlyZWN0b3J5KHBhdGguZGlybmFtZShkZXN0KSlcbiAgZGlyZWN0b3J5LmNyZWF0ZSgpLnRoZW4gKGZsYWcpLT5cbiAgICBleGVjRmlsZSAnZWJvb2stY29udmVydCcsXG4gICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgIGNhbGxiYWNrXG5cbm1vZHVsZS5leHBvcnRzID0gZWJvb2tDb252ZXJ0XG5cbiMjI1xuIyBFeGFtcGxlXG5cbmVib29rQ29udmVydCAndGVzdC5odG1sJywgJ3Rlc3QuZXB1YicsIHt0aXRsZTogJ2hlaGUnLCBhdXRob3JzOiAnc2hkMTAxd3l5J30sIChlcnJvciktPlxuICBpZiBlcnJvclxuICAgIGNvbnNvbGUubG9nIGVycm9yXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyAnZG9uZSdcbiMjI1xuIl19
