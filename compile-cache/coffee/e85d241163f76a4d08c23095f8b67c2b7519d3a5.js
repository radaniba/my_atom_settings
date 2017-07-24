(function() {
  var ColorContext, ColorExpression, ColorParser, registry;

  require('./helpers/matchers');

  ColorParser = require('../lib/color-parser');

  ColorContext = require('../lib/color-context');

  ColorExpression = require('../lib/color-expression');

  registry = require('../lib/color-expressions');

  describe('ColorParser', function() {
    var asColor, getParser, itParses, parser;
    parser = [][0];
    beforeEach(function() {
      var svgColorExpression;
      svgColorExpression = registry.getExpression('pigments:named_colors');
      return svgColorExpression.scopes = ['*'];
    });
    asColor = function(value) {
      return "color:" + value;
    };
    getParser = function(context) {
      context = new ColorContext(context != null ? context : {
        registry: registry
      });
      return context.parser;
    };
    itParses = function(expression) {
      return {
        description: '',
        asColor: function(r, g, b, a) {
          var context;
          if (a == null) {
            a = 1;
          }
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("parses '" + expression + "' as a color", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).toBeColor(r, g, b, a);
            });
          });
        },
        asUndefined: function() {
          var context;
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("does not parse '" + expression + "' and return undefined", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).toBeUndefined();
            });
          });
        },
        asInvalid: function() {
          var context;
          context = this.context;
          return describe(this.description, function() {
            beforeEach(function() {
              return parser = getParser(context);
            });
            return it("parses '" + expression + "' as an invalid color", function() {
              var _ref;
              return expect(parser.parse(expression, (_ref = this.scope) != null ? _ref : 'less')).not.toBeValid();
            });
          });
        },
        withContext: function(variables) {
          var colorVars, name, path, value, vars;
          vars = [];
          colorVars = [];
          path = "/path/to/file.styl";
          for (name in variables) {
            value = variables[name];
            if (value.indexOf('color:') !== -1) {
              value = value.replace('color:', '');
              vars.push({
                name: name,
                value: value,
                path: path
              });
              colorVars.push({
                name: name,
                value: value,
                path: path
              });
            } else {
              vars.push({
                name: name,
                value: value,
                path: path
              });
            }
          }
          this.context = {
            variables: vars,
            colorVariables: colorVars,
            registry: registry
          };
          this.description = "with variables context " + (jasmine.pp(variables)) + " ";
          return this;
        }
      };
    };
    itParses('@list-item-height').withContext({
      '@text-height': '@scale-b-xxl * 1rem',
      '@component-line-height': '@text-height',
      '@list-item-height': '@component-line-height'
    }).asUndefined();
    itParses('$text-color !default').withContext({
      '$text-color': asColor('cyan')
    }).asColor(0, 255, 255);
    itParses('c').withContext({
      'c': 'c'
    }).asUndefined();
    itParses('c').withContext({
      'c': 'd',
      'd': 'e',
      'e': 'c'
    }).asUndefined();
    itParses('#ff7f00').asColor(255, 127, 0);
    itParses('#f70').asColor(255, 119, 0);
    itParses('#ff7f00cc').asColor(255, 127, 0, 0.8);
    itParses('#f70c').asColor(255, 119, 0, 0.8);
    itParses('0xff7f00').asColor(255, 127, 0);
    itParses('0x00ff7f00').asColor(255, 127, 0, 0);
    describe('in context other than css and pre-processors', function() {
      beforeEach(function() {
        return this.scope = 'xaml';
      });
      return itParses('#ccff7f00').asColor(255, 127, 0, 0.8);
    });
    itParses('rgb(255,127,0)').asColor(255, 127, 0);
    itParses('rgb(255,127,0)').asColor(255, 127, 0);
    itParses('RGB(255,127,0)').asColor(255, 127, 0);
    itParses('RgB(255,127,0)').asColor(255, 127, 0);
    itParses('rGb(255,127,0)').asColor(255, 127, 0);
    itParses('rgb($r,$g,$b)').asInvalid();
    itParses('rgb($r,0,0)').asInvalid();
    itParses('rgb(0,$g,0)').asInvalid();
    itParses('rgb(0,0,$b)').asInvalid();
    itParses('rgb($r,$g,$b)').withContext({
      '$r': '255',
      '$g': '127',
      '$b': '0'
    }).asColor(255, 127, 0);
    itParses('rgba(255,127,0,0.5)').asColor(255, 127, 0, 0.5);
    itParses('rgba(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('RGBA(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('rGbA(255,127,0,.5)').asColor(255, 127, 0, 0.5);
    itParses('rgba(255,127,0,)').asUndefined();
    itParses('rgba($r,$g,$b,$a)').asInvalid();
    itParses('rgba($r,0,0,0)').asInvalid();
    itParses('rgba(0,$g,0,0)').asInvalid();
    itParses('rgba(0,0,$b,0)').asInvalid();
    itParses('rgba(0,0,0,$a)').asInvalid();
    itParses('rgba($r,$g,$b,$a)').withContext({
      '$r': '255',
      '$g': '127',
      '$b': '0',
      '$a': '0.5'
    }).asColor(255, 127, 0, 0.5);
    itParses('rgba(green, 0.5)').asColor(0, 128, 0, 0.5);
    itParses('rgba($c,$a,)').asUndefined();
    itParses('rgba($c,$a)').asInvalid();
    itParses('rgba($c,1)').asInvalid();
    itParses('rgba($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('rgba($c,$a)').withContext({
      '$c': asColor('green'),
      '$a': '0.5'
    }).asColor(0, 128, 0, 0.5);
    describe('css', function() {
      beforeEach(function() {
        return this.scope = 'css';
      });
      itParses('hsl(200,50%,50%)').asColor(64, 149, 191);
      itParses('hsl(200,50,50)').asColor(64, 149, 191);
      itParses('HSL(200,50,50)').asColor(64, 149, 191);
      itParses('hSl(200,50,50)').asColor(64, 149, 191);
      itParses('hsl(200.5,50.5,50.5)').asColor(65, 150, 193);
      itParses('hsl($h,$s,$l,)').asUndefined();
      itParses('hsl($h,$s,$l)').asInvalid();
      itParses('hsl($h,0%,0%)').asInvalid();
      itParses('hsl(0,$s,0%)').asInvalid();
      itParses('hsl(0,0%,$l)').asInvalid();
      return itParses('hsl($h,$s,$l)').withContext({
        '$h': '200',
        '$s': '50%',
        '$l': '50%'
      }).asColor(64, 149, 191);
    });
    describe('less', function() {
      beforeEach(function() {
        return this.scope = 'less';
      });
      itParses('hsl(285, 0.7, 0.7)').asColor('#cd7de8');
      return itParses('hsl(200,50%,50%)').asColor(64, 149, 191);
    });
    itParses('hsla(200,50%,50%,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50%,50%,.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('HSLA(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('HsLa(200,50,50,.5)').asColor(64, 149, 191, 0.5);
    itParses('hsla(200.5,50.5,50.5,.5)').asColor(65, 150, 193, 0.5);
    itParses('hsla(200,50%,50%,)').asUndefined();
    itParses('hsla($h,$s,$l,$a)').asInvalid();
    itParses('hsla($h,0%,0%,0)').asInvalid();
    itParses('hsla(0,$s,0%,0)').asInvalid();
    itParses('hsla(0,0%,$l,0)').asInvalid();
    itParses('hsla(0,0%,0%,$a)').asInvalid();
    itParses('hsla($h,$s,$l,$a)').withContext({
      '$h': '200',
      '$s': '50%',
      '$l': '50%',
      '$a': '0.5'
    }).asColor(64, 149, 191, 0.5);
    itParses('hsv(200,50%,50%)').asColor(64, 106, 128);
    itParses('HSV(200,50%,50%)').asColor(64, 106, 128);
    itParses('hSv(200,50%,50%)').asColor(64, 106, 128);
    itParses('hsb(200,50%,50%)').asColor(64, 106, 128);
    itParses('hsb(200,50,50)').asColor(64, 106, 128);
    itParses('hsb(200.5,50.5,50.5)').asColor(64, 107, 129);
    itParses('hsv($h,$s,$v,)').asUndefined();
    itParses('hsv($h,$s,$v)').asInvalid();
    itParses('hsv($h,0%,0%)').asInvalid();
    itParses('hsv(0,$s,0%)').asInvalid();
    itParses('hsv(0,0%,$v)').asInvalid();
    itParses('hsv($h,$s,$v)').withContext({
      '$h': '200',
      '$s': '50%',
      '$v': '50%'
    }).asColor(64, 106, 128);
    itParses('hsva(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200,50,50,0.5)').asColor(64, 106, 128, 0.5);
    itParses('HSVA(200,50,50,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsba(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('HsBa(200,50%,50%,0.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200,50%,50%,.5)').asColor(64, 106, 128, 0.5);
    itParses('hsva(200.5,50.5,50.5,.5)').asColor(64, 107, 129, 0.5);
    itParses('hsva(200,50%,50%,)').asUndefined();
    itParses('hsva($h,$s,$v,$a)').asInvalid();
    itParses('hsva($h,0%,0%,0)').asInvalid();
    itParses('hsva(0,$s,0%,0)').asInvalid();
    itParses('hsva(0,0%,$v,0)').asInvalid();
    itParses('hsva($h,$s,$v,$a)').withContext({
      '$h': '200',
      '$s': '50%',
      '$v': '50%',
      '$a': '0.5'
    }).asColor(64, 106, 128, 0.5);
    itParses('hcg(200,50%,50%)').asColor(64, 149, 191);
    itParses('HCG(200,50%,50%)').asColor(64, 149, 191);
    itParses('hcg(200,50,50)').asColor(64, 149, 191);
    itParses('hcg(200.5,50.5,50.5)').asColor(64, 150, 193);
    itParses('hcg($h,$c,$g,)').asUndefined();
    itParses('hcg($h,$c,$g)').asInvalid();
    itParses('hcg($h,0%,0%)').asInvalid();
    itParses('hcg(0,$c,0%)').asInvalid();
    itParses('hcg(0,0%,$g)').asInvalid();
    itParses('hcg($h,$c,$g)').withContext({
      '$h': '200',
      '$c': '50%',
      '$g': '50%'
    }).asColor(64, 149, 191);
    itParses('hcga(200,50%,50%,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200,50,50,0.5)').asColor(64, 149, 191, 0.5);
    itParses('HCGA(200,50,50,0.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200,50%,50%,.5)').asColor(64, 149, 191, 0.5);
    itParses('hcga(200.5,50.5,50.5,.5)').asColor(64, 150, 193, 0.5);
    itParses('hcga(200,50%,50%,)').asUndefined();
    itParses('hcga($h,$c,$g,$a)').asInvalid();
    itParses('hcga($h,0%,0%,0)').asInvalid();
    itParses('hcga(0,$c,0%,0)').asInvalid();
    itParses('hcga(0,0%,$g,0)').asInvalid();
    itParses('hcga($h,$c,$g,$a)').withContext({
      '$h': '200',
      '$c': '50%',
      '$g': '50%',
      '$a': '0.5'
    }).asColor(64, 149, 191, 0.5);
    itParses('hwb(210,40%,40%)').asColor(102, 128, 153);
    itParses('hwb(210,40,40)').asColor(102, 128, 153);
    itParses('HWB(210,40,40)').asColor(102, 128, 153);
    itParses('hWb(210,40,40)').asColor(102, 128, 153);
    itParses('hwb(210,40%,40%, 0.5)').asColor(102, 128, 153, 0.5);
    itParses('hwb(210.5,40.5,40.5)').asColor(103, 128, 152);
    itParses('hwb(210.5,40.5%,40.5%, 0.5)').asColor(103, 128, 152, 0.5);
    itParses('hwb($h,$w,$b,)').asUndefined();
    itParses('hwb($h,$w,$b)').asInvalid();
    itParses('hwb($h,0%,0%)').asInvalid();
    itParses('hwb(0,$w,0%)').asInvalid();
    itParses('hwb(0,0%,$b)').asInvalid();
    itParses('hwb($h,0%,0%,0)').asInvalid();
    itParses('hwb(0,$w,0%,0)').asInvalid();
    itParses('hwb(0,0%,$b,0)').asInvalid();
    itParses('hwb(0,0%,0%,$a)').asInvalid();
    itParses('hwb($h,$w,$b)').withContext({
      '$h': '210',
      '$w': '40%',
      '$b': '40%'
    }).asColor(102, 128, 153);
    itParses('hwb($h,$w,$b,$a)').withContext({
      '$h': '210',
      '$w': '40%',
      '$b': '40%',
      '$a': '0.5'
    }).asColor(102, 128, 153, 0.5);
    itParses('cmyk(0,0.5,1,0)').asColor('#ff7f00');
    itParses('CMYK(0,0.5,1,0)').asColor('#ff7f00');
    itParses('cMyK(0,0.5,1,0)').asColor('#ff7f00');
    itParses('cmyk(c,m,y,k)').withContext({
      'c': '0',
      'm': '0.5',
      'y': '1',
      'k': '0'
    }).asColor('#ff7f00');
    itParses('cmyk(c,m,y,k)').asInvalid();
    itParses('gray(100%)').asColor(255, 255, 255);
    itParses('gray(100)').asColor(255, 255, 255);
    itParses('GRAY(100)').asColor(255, 255, 255);
    itParses('gRaY(100)').asColor(255, 255, 255);
    itParses('gray(100%, 0.5)').asColor(255, 255, 255, 0.5);
    itParses('gray($c, $a,)').asUndefined();
    itParses('gray($c, $a)').asInvalid();
    itParses('gray(0%, $a)').asInvalid();
    itParses('gray($c, 0)').asInvalid();
    itParses('gray($c, $a)').withContext({
      '$c': '100%',
      '$a': '0.5'
    }).asColor(255, 255, 255, 0.5);
    itParses('yellowgreen').asColor('#9acd32');
    itParses('YELLOWGREEN').asColor('#9acd32');
    itParses('yellowGreen').asColor('#9acd32');
    itParses('YellowGreen').asColor('#9acd32');
    itParses('yellow_green').asColor('#9acd32');
    itParses('YELLOW_GREEN').asColor('#9acd32');
    itParses('>YELLOW_GREEN').asColor('#9acd32');
    itParses('darken(cyan, 20%)').asColor(0, 153, 153);
    itParses('darken(cyan, 20)').asColor(0, 153, 153);
    itParses('darken(#fff, 100%)').asColor(0, 0, 0);
    itParses('darken(cyan, $r)').asInvalid();
    itParses('darken($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('darken($c, $r)').withContext({
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(0, 153, 153);
    itParses('darken($a, $r)').withContext({
      '$a': asColor('rgba($c, 1)'),
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(0, 153, 153);
    itParses('lighten(cyan, 20%)').asColor(102, 255, 255);
    itParses('lighten(cyan, 20)').asColor(102, 255, 255);
    itParses('lighten(#000, 100%)').asColor(255, 255, 255);
    itParses('lighten(cyan, $r)').asInvalid();
    itParses('lighten($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('lighten($c, $r)').withContext({
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(102, 255, 255);
    itParses('lighten($a, $r)').withContext({
      '$a': asColor('rgba($c, 1)'),
      '$c': asColor('cyan'),
      '$r': '20%'
    }).asColor(102, 255, 255);
    itParses('transparentize(cyan, 50%)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, 50)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('transparentize(cyan, .5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fade-out(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fade_out(cyan, 0.5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, .5)').asColor(0, 255, 255, 0.5);
    itParses('fadeout(cyan, @r)').asInvalid();
    itParses('fadeout($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('fadeout(@c, @r)').withContext({
      '@c': asColor('cyan'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 0.5);
    itParses('fadeout(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('cyan'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 0.5);
    itParses('opacify(0x7800FFFF, 50%)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, 50)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('opacify(0x7800FFFF, .5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fade-in(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fade_in(0x7800FFFF, 0.5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, .5)').asColor(0, 255, 255, 1);
    itParses('fadein(0x7800FFFF, @r)').asInvalid();
    itParses('fadein($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('fadein(@c, @r)').withContext({
      '@c': asColor('0x7800FFFF'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 1);
    itParses('fadein(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('0x7800FFFF'),
      '@r': '0.5'
    }).asColor(0, 255, 255, 1);
    itParses('saturate(#855, 20%)').asColor(158, 63, 63);
    itParses('saturate(#855, 20)').asColor(158, 63, 63);
    itParses('saturate(#855, 0.2)').asColor(158, 63, 63);
    itParses('saturate(#855, @r)').asInvalid();
    itParses('saturate($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('saturate(@c, @r)').withContext({
      '@c': asColor('#855'),
      '@r': '0.2'
    }).asColor(158, 63, 63);
    itParses('saturate(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#855'),
      '@r': '0.2'
    }).asColor(158, 63, 63);
    itParses('desaturate(#9e3f3f, 20%)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, 20)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, 0.2)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, .2)').asColor(136, 85, 85);
    itParses('desaturate(#9e3f3f, @r)').asInvalid();
    itParses('desaturate($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('desaturate(@c, @r)').withContext({
      '@c': asColor('#9e3f3f'),
      '@r': '0.2'
    }).asColor(136, 85, 85);
    itParses('desaturate(@a, @r)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f'),
      '@r': '0.2'
    }).asColor(136, 85, 85);
    itParses('grayscale(#9e3f3f)').asColor(111, 111, 111);
    itParses('greyscale(#9e3f3f)').asColor(111, 111, 111);
    itParses('grayscale(@c)').asInvalid();
    itParses('grayscale($c)').withContext({
      '$c': asColor('hsv($h, $s, $v)')
    }).asInvalid();
    itParses('grayscale(@c)').withContext({
      '@c': asColor('#9e3f3f')
    }).asColor(111, 111, 111);
    itParses('grayscale(@a)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f')
    }).asColor(111, 111, 111);
    itParses('invert(#9e3f3f)').asColor(97, 192, 192);
    itParses('invert(@c)').asInvalid();
    itParses('invert($c)').withContext({
      '$c': asColor('hsv($h, $s, $v)')
    }).asInvalid();
    itParses('invert(@c)').withContext({
      '@c': asColor('#9e3f3f')
    }).asColor(97, 192, 192);
    itParses('invert(@a)').withContext({
      '@a': asColor('rgba(@c, 1)'),
      '@c': asColor('#9e3f3f')
    }).asColor(97, 192, 192);
    itParses('adjust-hue(#811, 45deg)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45deg)').asColor(136, 17, 106);
    itParses('adjust-hue(#811, 45%)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45%)').asColor(136, 17, 106);
    itParses('adjust-hue(#811, 45)').asColor(136, 106, 17);
    itParses('adjust-hue(#811, -45)').asColor(136, 17, 106);
    itParses('adjust-hue($c, $r)').asInvalid();
    itParses('adjust-hue($c, $r)').withContext({
      '$c': asColor('hsv($h, $s, $v)'),
      '$r': '1'
    }).asInvalid();
    itParses('adjust-hue($c, $r)').withContext({
      '$c': asColor('#811'),
      '$r': '-45deg'
    }).asColor(136, 17, 106);
    itParses('adjust-hue($a, $r)').withContext({
      '$a': asColor('rgba($c, 0.5)'),
      '$c': asColor('#811'),
      '$r': '-45deg'
    }).asColor(136, 17, 106, 0.5);
    itParses('mix(rgb(255,0,0), blue)').asColor(127, 0, 127);
    itParses('mix(red, rgb(0,0,255), 25%)').asColor(63, 0, 191);
    itParses('mix(#ff0000, 0x0000ff)').asColor('#7f007f');
    itParses('mix(#ff0000, 0x0000ff, 25%)').asColor('#3f00bf');
    itParses('mix(red, rgb(0,0,255), 25)').asColor(63, 0, 191);
    itParses('mix($a, $b, $r)').asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('hsv($h, $s, $v)'),
      '$b': asColor('blue'),
      '$r': '25%'
    }).asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('blue'),
      '$b': asColor('hsv($h, $s, $v)'),
      '$r': '25%'
    }).asInvalid();
    itParses('mix($a, $b, $r)').withContext({
      '$a': asColor('red'),
      '$b': asColor('blue'),
      '$r': '25%'
    }).asColor(63, 0, 191);
    itParses('mix($c, $d, $r)').withContext({
      '$a': asColor('red'),
      '$b': asColor('blue'),
      '$c': asColor('rgba($a, 1)'),
      '$d': asColor('rgba($b, 1)'),
      '$r': '25%'
    }).asColor(63, 0, 191);
    describe('stylus and less', function() {
      beforeEach(function() {
        return this.scope = 'styl';
      });
      itParses('tint(#fd0cc7,66%)').asColor(254, 172, 235);
      itParses('tint(#fd0cc7,66)').asColor(254, 172, 235);
      itParses('tint($c,$r)').asInvalid();
      itParses('tint($c, $r)').withContext({
        '$c': asColor('hsv($h, $s, $v)'),
        '$r': '1'
      }).asInvalid();
      itParses('tint($c,$r)').withContext({
        '$c': asColor('#fd0cc7'),
        '$r': '66%'
      }).asColor(254, 172, 235);
      itParses('tint($c,$r)').withContext({
        '$a': asColor('#fd0cc7'),
        '$c': asColor('rgba($a, 0.9)'),
        '$r': '66%'
      }).asColor(254, 172, 235, 0.966);
      itParses('shade(#fd0cc7,66%)').asColor(86, 4, 67);
      itParses('shade(#fd0cc7,66)').asColor(86, 4, 67);
      itParses('shade($c,$r)').asInvalid();
      itParses('shade($c, $r)').withContext({
        '$c': asColor('hsv($h, $s, $v)'),
        '$r': '1'
      }).asInvalid();
      itParses('shade($c,$r)').withContext({
        '$c': asColor('#fd0cc7'),
        '$r': '66%'
      }).asColor(86, 4, 67);
      return itParses('shade($c,$r)').withContext({
        '$a': asColor('#fd0cc7'),
        '$c': asColor('rgba($a, 0.9)'),
        '$r': '66%'
      }).asColor(86, 4, 67, 0.966);
    });
    describe('scss and sass', function() {
      describe('with compass implementation', function() {
        beforeEach(function() {
          return this.scope = 'sass:compass';
        });
        itParses('tint(#BADA55, 42%)').asColor('#e2efb7');
        itParses('tint(#BADA55, 42)').asColor('#e2efb7');
        itParses('tint($c,$r)').asInvalid();
        itParses('tint($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('tint($c,$r)').withContext({
          '$c': asColor('#BADA55'),
          '$r': '42%'
        }).asColor('#e2efb7');
        itParses('tint($c,$r)').withContext({
          '$a': asColor('#BADA55'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(226, 239, 183, 0.942);
        itParses('shade(#663399, 42%)').asColor('#2a1540');
        itParses('shade(#663399, 42)').asColor('#2a1540');
        itParses('shade($c,$r)').asInvalid();
        itParses('shade($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('shade($c,$r)').withContext({
          '$c': asColor('#663399'),
          '$r': '42%'
        }).asColor('#2a1540');
        return itParses('shade($c,$r)').withContext({
          '$a': asColor('#663399'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(0x2a, 0x15, 0x40, 0.942);
      });
      return describe('with bourbon implementation', function() {
        beforeEach(function() {
          return this.scope = 'sass:bourbon';
        });
        itParses('tint(#BADA55, 42%)').asColor(214, 233, 156);
        itParses('tint(#BADA55, 42)').asColor(214, 233, 156);
        itParses('tint($c,$r)').asInvalid();
        itParses('tint($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('tint($c,$r)').withContext({
          '$c': asColor('#BADA55'),
          '$r': '42%'
        }).asColor(214, 233, 156);
        itParses('tint($c,$r)').withContext({
          '$a': asColor('#BADA55'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(214, 233, 156, 0.942);
        itParses('shade(#663399, 42%)').asColor(59, 29, 88);
        itParses('shade(#663399, 42)').asColor(59, 29, 88);
        itParses('shade($c,$r)').asInvalid();
        itParses('shade($c, $r)').withContext({
          '$c': asColor('hsv($h, $s, $v)'),
          '$r': '1'
        }).asInvalid();
        itParses('shade($c,$r)').withContext({
          '$c': asColor('#663399'),
          '$r': '42%'
        }).asColor(59, 29, 88);
        return itParses('shade($c,$r)').withContext({
          '$a': asColor('#663399'),
          '$c': asColor('rgba($a, 0.9)'),
          '$r': '42%'
        }).asColor(59, 29, 88, 0.942);
      });
    });
    itParses('adjust-color(#102030, $red: -5, $blue: 5)', 11, 32, 53);
    itParses('adjust-color(hsl(25, 100%, 80%), $lightness: -30%, $alpha: -0.4)', 255, 106, 0, 0.6);
    itParses('adjust-color($c, $red: $a, $blue: $b)').asInvalid();
    itParses('adjust-color($d, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$d': asColor('rgba($c, 1)')
    }).asInvalid();
    itParses('adjust-color($c, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$c': asColor('#102030')
    }).asColor(11, 32, 53);
    itParses('adjust-color($d, $red: $a, $blue: $b)').withContext({
      '$a': '-5',
      '$b': '5',
      '$c': asColor('#102030'),
      '$d': asColor('rgba($c, 1)')
    }).asColor(11, 32, 53);
    itParses('scale-color(rgb(200, 150, 170), $green: -40%, $blue: 70%)').asColor(200, 90, 230);
    itParses('change-color(rgb(200, 150, 170), $green: 40, $blue: 70)').asColor(200, 40, 70);
    itParses('scale-color($c, $green: $a, $blue: $b)').asInvalid();
    itParses('scale-color($d, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$d': asColor('rgba($c, 1)')
    }).asInvalid();
    itParses('scale-color($c, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$c': asColor('rgb(200, 150, 170)')
    }).asColor(200, 90, 230);
    itParses('scale-color($d, $green: $a, $blue: $b)').withContext({
      '$a': '-40%',
      '$b': '70%',
      '$c': asColor('rgb(200, 150, 170)'),
      '$d': asColor('rgba($c, 1)')
    }).asColor(200, 90, 230);
    itParses('spin(#F00, 120)').asColor(0, 255, 0);
    itParses('spin(#F00, 120)').asColor(0, 255, 0);
    itParses('spin(#F00, 120deg)').asColor(0, 255, 0);
    itParses('spin(#F00, -120)').asColor(0, 0, 255);
    itParses('spin(#F00, -120deg)').asColor(0, 0, 255);
    itParses('spin(@c, @a)').withContext({
      '@c': asColor('#F00'),
      '@a': '120'
    }).asColor(0, 255, 0);
    itParses('spin(@c, @a)').withContext({
      '@a': '120'
    }).asInvalid();
    itParses('spin(@c, @a)').withContext({
      '@a': '120'
    }).asInvalid();
    itParses('spin(@c, @a,)').asUndefined();
    itParses('fade(#F00, 0.5)').asColor(255, 0, 0, 0.5);
    itParses('fade(#F00, 50%)').asColor(255, 0, 0, 0.5);
    itParses('fade(#F00, 50)').asColor(255, 0, 0, 0.5);
    itParses('fade(@c, @a)').withContext({
      '@c': asColor('#F00'),
      '@a': '0.5'
    }).asColor(255, 0, 0, 0.5);
    itParses('fade(@c, @a)').withContext({
      '@a': '0.5'
    }).asInvalid();
    itParses('fade(@c, @a)').withContext({
      '@a': '0.5'
    }).asInvalid();
    itParses('fade(@c, @a,)').asUndefined();
    itParses('contrast(#bbbbbb)').asColor(0, 0, 0);
    itParses('contrast(#333333)').asColor(255, 255, 255);
    itParses('contrast(#bbbbbb, rgb(20,20,20))').asColor(20, 20, 20);
    itParses('contrast(#333333, rgb(20,20,20), rgb(140,140,140))').asColor(140, 140, 140);
    itParses('contrast(#666666, rgb(20,20,20), rgb(140,140,140), 13%)').asColor(140, 140, 140);
    itParses('contrast(@base)').withContext({
      '@base': asColor('#bbbbbb')
    }).asColor(0, 0, 0);
    itParses('contrast(@base)').withContext({
      '@base': asColor('#333333')
    }).asColor(255, 255, 255);
    itParses('contrast(@base, @dark)').withContext({
      '@base': asColor('#bbbbbb'),
      '@dark': asColor('rgb(20,20,20)')
    }).asColor(20, 20, 20);
    itParses('contrast(@base, @dark, @light)').withContext({
      '@base': asColor('#333333'),
      '@dark': asColor('rgb(20,20,20)'),
      '@light': asColor('rgb(140,140,140)')
    }).asColor(140, 140, 140);
    itParses('contrast(@base, @dark, @light, @threshold)').withContext({
      '@base': asColor('#666666'),
      '@dark': asColor('rgb(20,20,20)'),
      '@light': asColor('rgb(140,140,140)'),
      '@threshold': '13%'
    }).asColor(140, 140, 140);
    itParses('contrast(@base)').asInvalid();
    itParses('contrast(@base)').asInvalid();
    itParses('contrast(@base, @dark)').asInvalid();
    itParses('contrast(@base, @dark, @light)').asInvalid();
    itParses('contrast(@base, @dark, @light, @threshold)').asInvalid();
    itParses('multiply(#ff6600, 0x666666)').asColor('#662900');
    itParses('multiply(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#662900');
    itParses('multiply(@base, @modifier)').asInvalid();
    itParses('screen(#ff6600, 0x666666)').asColor('#ffa366');
    itParses('screen(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ffa366');
    itParses('screen(@base, @modifier)').asInvalid();
    itParses('overlay(#ff6600, 0x666666)').asColor('#ff5200');
    itParses('overlay(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ff5200');
    itParses('overlay(@base, @modifier)').asInvalid();
    itParses('softlight(#ff6600, 0x666666)').asColor('#ff5a00');
    itParses('softlight(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#ff5a00');
    itParses('softlight(@base, @modifier)').asInvalid();
    itParses('hardlight(#ff6600, 0x666666)').asColor('#cc5200');
    itParses('hardlight(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#cc5200');
    itParses('hardlight(@base, @modifier)').asInvalid();
    itParses('difference(#ff6600, 0x666666)').asColor('#990066');
    itParses('difference(#ff6600,)()').asInvalid();
    itParses('difference(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#990066');
    itParses('difference(@base, @modifier)').asInvalid();
    itParses('exclusion(#ff6600, 0x666666)').asColor('#997a66');
    itParses('exclusion(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#997a66');
    itParses('exclusion(@base, @modifier)').asInvalid();
    itParses('average(#ff6600, 0x666666)').asColor('#b36633');
    itParses('average(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#b36633');
    itParses('average(@base, @modifier)').asInvalid();
    itParses('average(@gradient-b, @gradient-mean)').withContext({
      '@gradient-a': asColor('#00d38b'),
      '@gradient-b': asColor('#009285'),
      '@gradient-mean': asColor('average(@gradient-a, @gradient-b)')
    }).asColor('#00a287');
    itParses('negation(#ff6600, 0x666666)').asColor('#99cc66');
    itParses('negation(@base, @modifier)').withContext({
      '@base': asColor('#ff6600'),
      '@modifier': asColor('#666666')
    }).asColor('#99cc66');
    itParses('negation(@base, @modifier)').asInvalid();
    itParses('blend(rgba(#FFDE00,.42), 0x19C261)').asColor('#7ace38');
    itParses('blend(@top, @bottom)').withContext({
      '@top': asColor('rgba(#FFDE00,.42)'),
      '@bottom': asColor('0x19C261')
    }).asColor('#7ace38');
    itParses('blend(@top, @bottom)').asInvalid();
    itParses('complement(red)').asColor('#00ffff');
    itParses('complement(@base)').withContext({
      '@base': asColor('red')
    }).asColor('#00ffff');
    itParses('complement(@base)').asInvalid();
    itParses('transparentify(#808080)').asColor(0, 0, 0, 0.5);
    itParses('transparentify(#414141, black)').asColor(255, 255, 255, 0.25);
    itParses('transparentify(#91974C, 0xF34949, 0.5)').asColor(47, 229, 79, 0.5);
    itParses('transparentify(a)').withContext({
      'a': asColor('#808080')
    }).asColor(0, 0, 0, 0.5);
    itParses('transparentify(a, b, 0.5)').withContext({
      'a': asColor('#91974C'),
      'b': asColor('#F34949')
    }).asColor(47, 229, 79, 0.5);
    itParses('transparentify(a)').asInvalid();
    itParses('red(#000, 255)').asColor(255, 0, 0);
    itParses('red(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(255, 0, 0);
    itParses('red(a, b)').asInvalid();
    itParses('green(#000, 255)').asColor(0, 255, 0);
    itParses('green(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(0, 255, 0);
    itParses('green(a, b)').asInvalid();
    itParses('blue(#000, 255)').asColor(0, 0, 255);
    itParses('blue(a, b)').withContext({
      'a': asColor('#000'),
      'b': '255'
    }).asColor(0, 0, 255);
    itParses('blue(a, b)').asInvalid();
    itParses('alpha(#000, 0.5)').asColor(0, 0, 0, 0.5);
    itParses('alpha(a, b)').withContext({
      'a': asColor('#000'),
      'b': '0.5'
    }).asColor(0, 0, 0, 0.5);
    itParses('alpha(a, b)').asInvalid();
    itParses('hue(#00c, 90deg)').asColor(0x66, 0xCC, 0);
    itParses('hue(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '90deg'
    }).asColor(0x66, 0xCC, 0);
    itParses('hue(a, b)').asInvalid();
    itParses('saturation(#00c, 50%)').asColor(0x33, 0x33, 0x99);
    itParses('saturation(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '50%'
    }).asColor(0x33, 0x33, 0x99);
    itParses('saturation(a, b)').asInvalid();
    itParses('lightness(#00c, 80%)').asColor(0x99, 0x99, 0xff);
    itParses('lightness(a, b)').withContext({
      'a': asColor('#00c'),
      'b': '80%'
    }).asColor(0x99, 0x99, 0xff);
    itParses('lightness(a, b)').asInvalid();
    describe('CSS color function', function() {
      beforeEach(function() {
        return this.scope = 'css';
      });
      itParses('color(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      itParses('COLOR(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      itParses('cOlOr(#fd0cc7 tint(66%))').asColor(254, 172, 236);
      return itParses('color(var(--foo) tint(66%))').withContext({
        'var(--foo)': asColor('#fd0cc7')
      }).asColor(254, 172, 236);
    });
    describe('lua color', function() {
      beforeEach(function() {
        return this.scope = 'lua';
      });
      itParses('Color(255, 0, 0, 255)').asColor(255, 0, 0);
      itParses('Color(r, g, b, a)').withContext({
        'r': '255',
        'g': '0',
        'b': '0',
        'a': '255'
      }).asColor(255, 0, 0);
      return itParses('Color(r, g, b, a)').asInvalid();
    });
    describe('elm-lang support', function() {
      beforeEach(function() {
        return this.scope = 'elm';
      });
      itParses('rgba 255 0 0 1').asColor(255, 0, 0);
      itParses('rgba r g b a').withContext({
        'r': '255',
        'g': '0',
        'b': '0',
        'a': '1'
      }).asColor(255, 0, 0);
      itParses('rgba r g b a').asInvalid();
      itParses('rgb 255 0 0').asColor(255, 0, 0);
      itParses('rgb r g b').withContext({
        'r': '255',
        'g': '0',
        'b': '0'
      }).asColor(255, 0, 0);
      itParses('rgb r g b').asInvalid();
      itParses('hsla (degrees 200) 50 50 0.5').asColor(64, 149, 191, 0.5);
      itParses('hsla (degrees h) s l a').withContext({
        'h': '200',
        's': '50',
        'l': '50',
        'a': '0.5'
      }).asColor(64, 149, 191, 0.5);
      itParses('hsla (degrees h) s l a').asInvalid();
      itParses('hsla 3.49 50 50 0.5').asColor(64, 149, 191, 0.5);
      itParses('hsla h s l a').withContext({
        'h': '3.49',
        's': '50',
        'l': '50',
        'a': '0.5'
      }).asColor(64, 149, 191, 0.5);
      itParses('hsla h s l a').asInvalid();
      itParses('hsl (degrees 200) 50 50').asColor(64, 149, 191);
      itParses('hsl (degrees h) s l').withContext({
        'h': '200',
        's': '50',
        'l': '50'
      }).asColor(64, 149, 191);
      itParses('hsl (degrees h) s l').asInvalid();
      itParses('hsl 3.49 50 50').asColor(64, 149, 191);
      itParses('hsl h s l').withContext({
        'h': '3.49',
        's': '50',
        'l': '50'
      }).asColor(64, 149, 191);
      itParses('hsl h s l').asInvalid();
      itParses('grayscale 1').asColor(0, 0, 0);
      itParses('greyscale 0.5').asColor(127, 127, 127);
      itParses('grayscale 0').asColor(255, 255, 255);
      itParses('grayscale g').withContext({
        'g': '0.5'
      }).asColor(127, 127, 127);
      itParses('grayscale g').asInvalid();
      itParses('complement rgb 255 0 0').asColor('#00ffff');
      itParses('complement base').withContext({
        'base': asColor('red')
      }).asColor('#00ffff');
      return itParses('complement base').asInvalid();
    });
    describe('latex support', function() {
      beforeEach(function() {
        return this.scope = 'tex';
      });
      itParses('[gray]{1}').asColor('#ffffff');
      itParses('[rgb]{1,0.5,0}').asColor('#ff7f00');
      itParses('[RGB]{255,127,0}').asColor('#ff7f00');
      itParses('[cmyk]{0,0.5,1,0}').asColor('#ff7f00');
      itParses('[HTML]{ff7f00}').asColor('#ff7f00');
      itParses('{blue}').asColor('#0000ff');
      itParses('{blue!20}').asColor('#ccccff');
      itParses('{blue!20!black}').asColor('#000033');
      return itParses('{blue!20!black!30!green}').asColor('#00590f');
    });
    describe('qt support', function() {
      beforeEach(function() {
        return this.scope = 'qml';
      });
      return itParses('Qt.rgba(1.0,1.0,0,0.5)').asColor(255, 255, 0, 0.5);
    });
    return describe('qt cpp support', function() {
      beforeEach(function() {
        return this.scope = 'cpp';
      });
      return itParses('Qt.rgba(1.0,1.0,0,0.5)').asColor(255, 255, 0, 0.5);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXBhcnNlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLE9BQUEsQ0FBUSxvQkFBUixDQUFBLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FMWCxDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsb0NBQUE7QUFBQSxJQUFDLFNBQVUsS0FBWCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxrQkFBQTtBQUFBLE1BQUEsa0JBQUEsR0FBcUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsdUJBQXZCLENBQXJCLENBQUE7YUFDQSxrQkFBa0IsQ0FBQyxNQUFuQixHQUE0QixDQUFDLEdBQUQsRUFGbkI7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBTUEsT0FBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQVksUUFBQSxHQUFRLE1BQXBCO0lBQUEsQ0FOVixDQUFBO0FBQUEsSUFRQSxTQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLE9BQUEsR0FBYyxJQUFBLFlBQUEsbUJBQWEsVUFBVTtBQUFBLFFBQUMsVUFBQSxRQUFEO09BQXZCLENBQWQsQ0FBQTthQUNBLE9BQU8sQ0FBQyxPQUZFO0lBQUEsQ0FSWixDQUFBO0FBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-parser-spec.coffee
