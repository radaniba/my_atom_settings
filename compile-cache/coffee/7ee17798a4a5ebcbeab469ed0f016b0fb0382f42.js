(function() {
  var Beautifiers, Handlebars, beautifier, beautifierName, beautifierOptions, beautifiers, context, exampleConfig, fs, languageOptions, linkifyTitle, lo, optionDef, optionGroup, optionGroupTemplate, optionGroupTemplatePath, optionName, optionTemplate, optionTemplatePath, optionsPath, optionsTemplate, optionsTemplatePath, packageOptions, result, sortKeysBy, sortSettings, template, _, _i, _len, _ref, _ref1;

  Handlebars = require('handlebars');

  Beautifiers = require("../src/beautifiers");

  fs = require('fs');

  _ = require('lodash');

  console.log('Generating options...');

  beautifier = new Beautifiers();

  languageOptions = beautifier.options;

  packageOptions = require('../src/config.coffee');

  beautifierOptions = {};

  for (lo in languageOptions) {
    optionGroup = languageOptions[lo];
    _ref = optionGroup.properties;
    for (optionName in _ref) {
      optionDef = _ref[optionName];
      beautifiers = (_ref1 = optionDef.beautifiers) != null ? _ref1 : [];
      for (_i = 0, _len = beautifiers.length; _i < _len; _i++) {
        beautifierName = beautifiers[_i];
        if (beautifierOptions[beautifierName] == null) {
          beautifierOptions[beautifierName] = {};
        }
        beautifierOptions[beautifierName][optionName] = optionDef;
      }
    }
  }

  console.log('Loading options template...');

  optionsTemplatePath = __dirname + '/options-template.md';

  optionTemplatePath = __dirname + '/option-template.md';

  optionGroupTemplatePath = __dirname + '/option-group-template.md';

  optionsPath = __dirname + '/options.md';

  optionsTemplate = fs.readFileSync(optionsTemplatePath).toString();

  optionGroupTemplate = fs.readFileSync(optionGroupTemplatePath).toString();

  optionTemplate = fs.readFileSync(optionTemplatePath).toString();

  console.log('Building documentation from template and options...');

  Handlebars.registerPartial('option', optionTemplate);

  Handlebars.registerPartial('option-group', optionGroupTemplate);

  template = Handlebars.compile(optionsTemplate);

  linkifyTitle = function(title) {
    var p, sep;
    title = title.toLowerCase();
    p = title.split(/[\s,+#;,\/?:@&=+$]+/);
    sep = "-";
    return p.join(sep);
  };

  Handlebars.registerHelper('linkify', function(title, options) {
    return new Handlebars.SafeString("[" + (options.fn(this)) + "](\#" + (linkifyTitle(title)) + ")");
  });

  exampleConfig = function(option) {
    var c, d, json, k, namespace, t;
    t = option.type;
    d = (function() {
      switch (false) {
        case option["default"] == null:
          return option["default"];
        case t !== "string":
          return "";
        case t !== "integer":
          return 0;
        case t !== "boolean":
          return false;
        default:
          return null;
      }
    })();
    json = {};
    namespace = option.language.namespace;
    k = option.key;
    c = {};
    c[k] = d;
    json[namespace] = c;
    return "```json\n" + (JSON.stringify(json, void 0, 4)) + "\n```";
  };

  Handlebars.registerHelper('example-config', function(key, option, options) {
    var results;
    results = exampleConfig(key, option);
    return new Handlebars.SafeString(results);
  });

  sortKeysBy = function(obj, comparator) {
    var keys;
    keys = _.sortBy(_.keys(obj), function(key) {
      if (comparator) {
        return comparator(obj[key], key);
      } else {
        return key;
      }
    });
    return _.zipObject(keys, _.map(keys, function(key) {
      return obj[key];
    }));
  };

  sortSettings = function(settings) {
    var r;
    r = _.mapValues(settings, function(op) {
      if (op.type === "object" && op.properties) {
        op.properties = sortSettings(op.properties);
      }
      return op;
    });
    r = sortKeysBy(sortKeysBy(r), function(op) {
      return op.order;
    });
    return r;
  };

  context = {
    packageOptions: sortSettings(packageOptions),
    languageOptions: sortSettings(languageOptions),
    beautifierOptions: sortSettings(beautifierOptions)
  };

  result = template(context);

  console.log('Writing documentation to file...');

  fs.writeFileSync(optionsPath, result);

  console.log('Done.');

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L2RvY3MvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLGlaQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVIsQ0FEZCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUhKLENBQUE7O0FBQUEsRUFLQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaLENBTEEsQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUEsQ0FOakIsQ0FBQTs7QUFBQSxFQU9BLGVBQUEsR0FBa0IsVUFBVSxDQUFDLE9BUDdCLENBQUE7O0FBQUEsRUFRQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxzQkFBUixDQVJqQixDQUFBOztBQUFBLEVBVUEsaUJBQUEsR0FBb0IsRUFWcEIsQ0FBQTs7QUFXQSxPQUFBLHFCQUFBO3NDQUFBO0FBQ0U7QUFBQSxTQUFBLGtCQUFBO21DQUFBO0FBQ0UsTUFBQSxXQUFBLHFEQUFzQyxFQUF0QyxDQUFBO0FBQ0EsV0FBQSxrREFBQTt5Q0FBQTs7VUFDRSxpQkFBa0IsQ0FBQSxjQUFBLElBQW1CO1NBQXJDO0FBQUEsUUFDQSxpQkFBa0IsQ0FBQSxjQUFBLENBQWdCLENBQUEsVUFBQSxDQUFsQyxHQUFnRCxTQURoRCxDQURGO0FBQUEsT0FGRjtBQUFBLEtBREY7QUFBQSxHQVhBOztBQUFBLEVBa0JBLE9BQU8sQ0FBQyxHQUFSLENBQVksNkJBQVosQ0FsQkEsQ0FBQTs7QUFBQSxFQW1CQSxtQkFBQSxHQUFz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

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/docs/index.coffee
