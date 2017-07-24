(function() {
  var ColorExpression, ExpressionsRegistry, SVGColors, colorRegexp, colors, comma, elmAngle, float, floatOrPercent, hexadecimal, insensitive, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, registry, strip, variables, _ref, _ref1;

  _ref = require('./regexes'), int = _ref.int, float = _ref.float, percent = _ref.percent, optionalPercent = _ref.optionalPercent, intOrPercent = _ref.intOrPercent, floatOrPercent = _ref.floatOrPercent, comma = _ref.comma, notQuote = _ref.notQuote, hexadecimal = _ref.hexadecimal, ps = _ref.ps, pe = _ref.pe, variables = _ref.variables, namePrefixes = _ref.namePrefixes;

  _ref1 = require('./utils'), strip = _ref1.strip, insensitive = _ref1.insensitive;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  module.exports = registry = new ExpressionsRegistry(ColorExpression);

  registry.createExpression('pigments:css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", 1, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexRGBA = hexa;
  });

  registry.createExpression('pigments:argb_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 12 & 0xf) * 17;
    this.green = (colorAsInt >> 8 & 0xf) * 17;
    this.blue = (colorAsInt >> 4 & 0xf) * 17;
    return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
  });

  registry.createExpression('pigments:css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var colorAsInt, hexa, _;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 8 & 0xf) * 17;
    this.green = (colorAsInt >> 4 & 0xf) * 17;
    return this.blue = (colorAsInt & 0xf) * 17;
  });

  registry.createExpression('pigments:int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_rgb', strip("" + (insensitive('rgb')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_rgba', strip("" + (insensitive('rgba')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], a = match[2];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:css_hsl', strip("" + (insensitive('hsl')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['css', 'sass', 'scss', 'styl', 'stylus'], function(match, expression, context) {
    var h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:less_hsl', strip("hsl" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['less'], function(match, expression, context) {
    var h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloatOrPercent(s) * 100, context.readFloatOrPercent(l) * 100];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_hsla', strip("" + (insensitive('hsla')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsl, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hsv', strip("(?:" + (insensitive('hsv')) + "|" + (insensitive('hsb')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hsva', strip("(?:" + (insensitive('hsva')) + "|" + (insensitive('hsba')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, hsv, s, v, _;
    _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hcg', strip("(?:" + (insensitive('hcg')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var c, gr, h, hcg, _;
    _ = match[0], h = match[1], c = match[2], gr = match[3];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hcga', strip("(?:" + (insensitive('hcga')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var a, c, gr, h, hcg, _;
    _ = match[0], h = match[1], c = match[2], gr = match[3], a = match[4];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['*'], function(match, expression, context) {
    var a, h, l, s, _;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
  });

  registry.createExpression('pigments:hwb', strip("" + (insensitive('hwb')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), ['*'], function(match, expression, context) {
    var a, b, h, w, _;
    _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
    this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  registry.createExpression('pigments:cmyk', strip("" + (insensitive('cmyk')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    return this.cmyk = [context.readFloat(c), context.readFloat(m), context.readFloat(y), context.readFloat(k)];
  });

  registry.createExpression('pigments:gray', strip("" + (insensitive('gray')) + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, ['*'], function(match, expression, context) {
    var a, p, _;
    _ = match[0], p = match[1], a = match[2];
    p = context.readFloat(p) / 100 * 255;
    this.rgb = [p, p, p];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  colors = Object.keys(SVGColors.allCases);

  colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")\\b(?![ \\t]*[-\\.:=\\(])";

  registry.createExpression('pigments:named_colors', colorRegexp, [], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    this.colorExpression = this.name = name;
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, s, context.clampInt(l - amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, s, context.clampInt(l + amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = amount;
  });

  registry.createExpression('pigments:transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha - amount);
  });

  registry.createExpression('pigments:opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha + amount);
  });

  registry.createExpression('pigments:stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    return this[channel] = amount;
  });

  registry.createExpression('pigments:transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var alpha, bestAlpha, bottom, expr, processChannel, top, _, _ref2;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), top = _ref2[0], bottom = _ref2[1], alpha = _ref2[2];
    top = context.readColor(top);
    bottom = context.readColor(bottom);
    alpha = context.readFloatOrPercent(alpha);
    if (context.isInvalid(top)) {
      return this.invalid = true;
    }
    if ((bottom != null) && context.isInvalid(bottom)) {
      return this.invalid = true;
    }
    if (bottom == null) {
      bottom = new context.Color(255, 255, 255, 1);
    }
    if (isNaN(alpha)) {
      alpha = void 0;
    }
    bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
      var res;
      res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
      return res;
    }).sort(function(a, b) {
      return a < b;
    })[0];
    processChannel = function(channel) {
      if (bestAlpha === 0) {
        return bottom[channel];
      } else {
        return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
      }
    };
    if (alpha != null) {
      bestAlpha = alpha;
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    this.red = processChannel('red');
    this.green = processChannel('green');
    this.blue = processChannel('blue');
    return this.alpha = Math.round(bestAlpha * 100) / 100;
  });

  registry.createExpression('pigments:hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [amount % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, channel, subexpr, _;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    baseColor[channel] = amount;
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + amount) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:mix', "mix" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1], amount = _ref2[2];
    if (amount != null) {
      amount = context.readFloatOrPercent(amount);
    } else {
      amount = 0.5;
    }
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = context.mixColors(baseColor1, baseColor2, amount), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:stylus_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:stylus_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:compass_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(baseColor, white, amount).rgba;
  });

  registry.createExpression('pigments:compass_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(baseColor, black, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var amount, baseColor, subexpr, white, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var amount, baseColor, black, subexpr, _;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, context.clampInt(s - amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var amount, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, context.clampInt(s + amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [h, 0, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:invert', "invert" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var b, baseColor, g, r, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.rgb, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    this.rgb = [255 - r, 255 - g, 255 - b];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:complement', "complement" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var angle, baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1], angle = match[2];
    baseColor = context.readColor(subexpr);
    angle = context.readInt(angle);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(360 + h + angle) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var base, baseColor, dark, expr, light, res, threshold, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), base = _ref2[0], dark = _ref2[1], light = _ref2[2], threshold = _ref2[3];
    baseColor = context.readColor(base);
    dark = context.readColor(dark);
    light = context.readColor(light);
    if (threshold != null) {
      threshold = context.readPercent(threshold);
    }
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (dark != null ? dark.invalid : void 0) {
      return this.invalid = true;
    }
    if (light != null ? light.invalid : void 0) {
      return this.invalid = true;
    }
    res = context.contrast(baseColor, dark, light);
    if (context.isInvalid(res)) {
      return this.invalid = true;
    }
    return _ref3 = context.contrast(baseColor, dark, light, threshold), this.rgb = _ref3.rgb, _ref3;
  });

  registry.createExpression('pigments:contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var baseColor, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    return _ref2 = context.contrast(baseColor), this.rgb = _ref2.rgb, _ref2;
  });

  registry.createExpression('pigments:css_color_function', "(?:" + namePrefixes + ")(" + (insensitive('color')) + ps + "(" + notQuote + ")" + pe + ")", ['css'], function(match, expression, context) {
    var cssColor, e, expr, k, rgba, v, _, _ref2;
    try {
      _ = match[0], expr = match[1];
      _ref2 = context.vars;
      for (k in _ref2) {
        v = _ref2[k];
        expr = expr.replace(RegExp("" + (k.replace(/\(/g, '\\(').replace(/\)/g, '\\)')), "g"), v.value);
      }
      cssColor = require('css-color-function');
      rgba = cssColor.convert(expr.toLowerCase());
      this.rgba = context.readColor(rgba).rgba;
      return this.colorExpression = expr;
    } catch (_error) {
      e = _error;
      return this.invalid = true;
    }
  });

  registry.createExpression('pigments:sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] += context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var MAX_PER_COMPONENT, baseColor, param, params, res, subexpr, subject, _, _i, _len;
    MAX_PER_COMPONENT = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
      hue: 360,
      saturation: 100,
      lightness: 100
    };
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        var dif, result;
        value = context.readFloat(value) / 100;
        result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
        return baseColor[name] = result;
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var baseColor, param, params, res, subexpr, subject, _, _i, _len;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      context.readParam(param, function(name, value) {
        return baseColor[name] = context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
  });

  registry.createExpression('pigments:lua_rgba', strip("(?:" + namePrefixes + ")Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['lua'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readInt(a) / 255;
  });

  registry.createExpression('pigments:multiply', strip("multiply" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.MULTIPLY), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:screen', strip("screen" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.SCREEN), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:overlay', strip("overlay" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.OVERLAY), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:softlight', strip("softlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.SOFT_LIGHT), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:hardlight', strip("hardlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.HARD_LIGHT), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:difference', strip("difference" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.DIFFERENCE), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:exclusion', strip("exclusion" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.EXCLUSION), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:average', strip("average" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.AVERAGE), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:negation', strip("negation" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var baseColor1, baseColor2, color1, color2, expr, _, _ref2, _ref3;
    _ = match[0], expr = match[1];
    _ref2 = context.split(expr), color1 = _ref2[0], color2 = _ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return _ref3 = baseColor1.blend(baseColor2, context.BlendModes.NEGATION), this.rgba = _ref3.rgba, _ref3;
  });

  registry.createExpression('pigments:elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    return this.blue = context.readInt(b);
  });

  elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";

  registry.createExpression('pigments:elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var a, elmDegreesRegexp, h, hsl, l, m, s, _;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", ['elm'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = Math.floor(255 - context.readFloat(amount) * 255);
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:elm_complement', strip("complement\\s+(" + notQuote + ")"), ['elm'], function(match, expression, context) {
    var baseColor, h, l, s, subexpr, _, _ref2;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    _ref2 = baseColor.hsl, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:latex_gray', strip("\\[gray\\]\\{(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var amount, _;
    _ = match[0], amount = match[1];
    amount = context.readFloat(amount) * 255;
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:latex_html', strip("\\[HTML\\]\\{(" + hexadecimal + "{6})\\}"), ['tex'], function(match, expression, context) {
    var hexa, _;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:latex_rgb', strip("\\[rgb\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = Math.floor(context.readFloat(r) * 255);
    g = Math.floor(context.readFloat(g) * 255);
    b = Math.floor(context.readFloat(b) * 255);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_RGB', strip("\\[RGB\\]\\{(" + int + ")" + comma + "(" + int + ")" + comma + "(" + int + ")\\}"), ['tex'], function(match, expression, context) {
    var b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = context.readInt(r);
    g = context.readInt(g);
    b = context.readInt(b);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_cmyk', strip("\\[cmyk\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var c, k, m, y, _;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    c = context.readFloat(c);
    m = context.readFloat(m);
    y = context.readFloat(y);
    k = context.readFloat(k);
    return this.cmyk = [c, m, y, k];
  });

  registry.createExpression('pigments:latex_predefined', strip('\\{(black|blue|brown|cyan|darkgray|gray|green|lightgray|lime|magenta|olive|orange|pink|purple|red|teal|violet|white|yellow)\\}'), ['tex'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_predefined_dvipnames', strip('\\{(Apricot|Aquamarine|Bittersweet|Black|Blue|BlueGreen|BlueViolet|BrickRed|Brown|BurntOrange|CadetBlue|CarnationPink|Cerulean|CornflowerBlue|Cyan|Dandelion|DarkOrchid|Emerald|ForestGreen|Fuchsia|Goldenrod|Gray|Green|GreenYellow|JungleGreen|Lavender|LimeGreen|Magenta|Mahogany|Maroon|Melon|MidnightBlue|Mulberry|NavyBlue|OliveGreen|Orange|OrangeRed|Orchid|Peach|Periwinkle|PineGreen|Plum|ProcessBlue|Purple|RawSienna|Red|RedOrange|RedViolet|Rhodamine|RoyalBlue|RoyalPurple|RubineRed|Salmon|SeaGreen|Sepia|SkyBlue|SpringGreen|Tan|TealBlue|Thistle|Turquoise|Violet|VioletRed|White|WildStrawberry|Yellow|YellowGreen|YellowOrange)\\}'), ['tex'], function(match, expression, context) {
    var name, _;
    _ = match[0], name = match[1];
    return this.hex = context.DVIPnames[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_mix', strip('\\{([^!\\n\\}]+[!][^\\}\\n]+)\\}'), ['tex'], function(match, expression, context) {
    var expr, mix, nextColor, op, triplet, _;
    _ = match[0], expr = match[1];
    op = expr.split('!');
    mix = function(_arg) {
      var a, b, colorA, colorB, p;
      a = _arg[0], p = _arg[1], b = _arg[2];
      colorA = a instanceof context.Color ? a : context.readColor("{" + a + "}");
      colorB = b instanceof context.Color ? b : context.readColor("{" + b + "}");
      percent = context.readInt(p);
      return context.mixColors(colorA, colorB, percent / 100);
    };
    if (op.length === 2) {
      op.push(new context.Color(255, 255, 255));
    }
    nextColor = null;
    while (op.length > 0) {
      triplet = op.splice(0, 3);
      nextColor = mix(triplet);
      if (op.length > 0) {
        op.unshift(nextColor);
      }
    }
    return this.rgb = nextColor.rgb;
  });

  registry.createExpression('pigments:qt_rgba', strip("Qt\\.rgba" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['qml', 'c', 'cc', 'cpp'], 1, function(match, expression, context) {
    var a, b, g, r, _;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readFloat(r) * 255;
    this.green = context.readFloat(g) * 255;
    this.blue = context.readFloat(b) * 255;
    return this.alpha = context.readFloat(a);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItZXhwcmVzc2lvbnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRQQUFBOztBQUFBLEVBQUEsT0FjSSxPQUFBLENBQVEsV0FBUixDQWRKLEVBQ0UsV0FBQSxHQURGLEVBRUUsYUFBQSxLQUZGLEVBR0UsZUFBQSxPQUhGLEVBSUUsdUJBQUEsZUFKRixFQUtFLG9CQUFBLFlBTEYsRUFNRSxzQkFBQSxjQU5GLEVBT0UsYUFBQSxLQVBGLEVBUUUsZ0JBQUEsUUFSRixFQVNFLG1CQUFBLFdBVEYsRUFVRSxVQUFBLEVBVkYsRUFXRSxVQUFBLEVBWEYsRUFZRSxpQkFBQSxTQVpGLEVBYUUsb0JBQUEsWUFiRixDQUFBOztBQUFBLEVBZ0JBLFFBQXVCLE9BQUEsQ0FBUSxTQUFSLENBQXZCLEVBQUMsY0FBQSxLQUFELEVBQVEsb0JBQUEsV0FoQlIsQ0FBQTs7QUFBQSxFQWtCQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVIsQ0FsQnRCLENBQUE7O0FBQUEsRUFtQkEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FuQmxCLENBQUE7O0FBQUEsRUFvQkEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBcEJaLENBQUE7O0FBQUEsRUFzQkEsTUFBTSxDQUFDLE9BQVAsR0FDQSxRQUFBLEdBQWUsSUFBQSxtQkFBQSxDQUFvQixlQUFwQixDQXZCZixDQUFBOztBQUFBLEVBa0NBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixxQkFBMUIsRUFBa0QsSUFBQSxHQUFJLFdBQUosR0FBZ0IsbUJBQWxFLEVBQXNGLENBQXRGLEVBQXlGLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEIsRUFBd0IsUUFBeEIsRUFBa0MsTUFBbEMsRUFBMEMsTUFBMUMs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-expressions.coffee
