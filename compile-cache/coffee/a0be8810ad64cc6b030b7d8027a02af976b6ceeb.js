(function() {
  module.exports = {
    CoffeeScript: {
      command: "coffee",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    JavaScript: {
      command: "node",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Ruby: {
      command: "ruby",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    RSpec: {
      command: "rspec",
      "File Based": function(filename) {
        return [filename];
      }
    },
    Perl: {
      command: "perl",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    PHP: {
      command: "php",
      "Selection Based": function(code) {
        return ['-r', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Python: {
      command: "python",
      "Selection Based": function(code) {
        return ['-c', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    'Shell Script (Bash)': {
      command: "bash",
      "Selection Based": function(code) {
        return ['-c', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Go: {
      command: "go",
      "File Based": function(filename) {
        return ['run', filename];
      }
    },
    'F#': {
      command: "fsharpi",
      "File Based": function(filename) {
        return ['--exec', filename];
      }
    },
    newLISP: {
      command: "newlisp",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Haskell: {
      command: "runhaskell",
      "File Based": function(filename) {
        return [filename];
      }
    },
    Erlang: {
      command: "erl",
      "Selection Based": function(code) {
        return ['-noshell', '-eval', code + ', init:stop().'];
      }
    },
    Elixir: {
      command: "elixir",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return ['-r', filename];
      }
    },
    Julia: {
      command: "julia",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Groovy: {
      command: "groovy",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Scala: {
      command: "scala",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Lua: {
      command: "lua",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    "CoffeeScript (Literate)": {
      command: "coffee",
      "Selection Based": function(code) {
        return ['-e', code];
      },
      "File Based": function(filename) {
        return [filename];
      }
    },
    Gherkin: {
      command: "cucumber",
      "File Based": function(filename) {
        return [filename];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFlBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLFFBQVQ7QUFBQSxNQUNBLGlCQUFBLEVBQW1CLFNBQUMsSUFBRCxHQUFBO2VBQVUsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFWO01BQUEsQ0FEbkI7QUFBQSxNQUVBLFlBQUEsRUFBYyxTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsUUFBRCxFQUFkO01BQUEsQ0FGZDtLQURGO0FBQUEsSUFLQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsTUFDQSxpQkFBQSxFQUFtQixTQUFDLElBQUQsR0FBQTtlQUFVLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBVjtNQUFBLENBRG5CO0FBQUEsTUFFQSxZQUFBLEVBQWMsU0FBQyxRQUFELEdBQUE7ZUFBYyxDQUFDLFFBQUQsRUFBZDtNQUFBLENBRmQ7S0FORjtBQUFBLElBVUEsSUFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLE1BQ0EsaUJBQUEsRUFBbUIsU0FBQyxJQUFELEdBQUE7ZUFBVSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVY7TUFBQSxDQURuQjtBQUFBLE1BRUEsWUFBQSxFQUFjLFNBQUMsUUFBRCxHQUFBO2VBQWMsQ0FBQyxRQUFELEVBQWQ7TUFBQSxDQUZkO0tBWEY7QUFBQSxJQWVBLEtBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxNQUVBLFlBQUEsRUFBYyxTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsUUFBRCxFQUFkO01BQUEsQ0FGZDtLQWhCRjtBQUFBLElBb0JBLElBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxNQUNBLGlCQUFB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
//# sourceURL=/Users/Rad/.atom/packages/script/lib/grammars.coffee