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
      beforeEach(function() {
        return this.scope = 'sass';
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
    itParses('color(#fd0cc7 tint(66%))').asColor(254, 172, 236);
    itParses('COLOR(#fd0cc7 tint(66%))').asColor(254, 172, 236);
    itParses('cOlOr(#fd0cc7 tint(66%))').asColor(254, 172, 236);
    itParses('color(var(--foo) tint(66%))').withContext({
      'var(--foo)': asColor('#fd0cc7')
    }).asColor(254, 172, 236);
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
    return describe('latex support', function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXBhcnNlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLE9BQUEsQ0FBUSxvQkFBUixDQUFBLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVIsQ0FMWCxDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsb0NBQUE7QUFBQSxJQUFDLFNBQVUsS0FBWCxDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7YUFBWSxRQUFBLEdBQVEsTUFBcEI7SUFBQSxDQUZWLENBQUE7QUFBQSxJQUlBLFNBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLE1BQUEsT0FBQSxHQUFjLElBQUEsWUFBQSxtQkFBYSxVQUFVO0FBQUEsUUFBQyxVQUFBLFFBQUQ7T0FBdkIsQ0FBZCxDQUFBO2FBQ0EsT0FBTyxDQUFDLE9BRkU7SUFBQSxDQUpaLENBQUE7QUFBQSxJQVFBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNUO0FBQUEsUUFBQSxXQUFBLEVBQWEsRUFBYjtBQUFBLFFBQ0EsT0FBQSxFQUFTLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxHQUFBO0FBQ1AsY0FBQSxPQUFBOztZQURjLElBQUU7V0FDaEI7QUFBQSxVQUFBLE9BQUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-parser-spec.coffee
