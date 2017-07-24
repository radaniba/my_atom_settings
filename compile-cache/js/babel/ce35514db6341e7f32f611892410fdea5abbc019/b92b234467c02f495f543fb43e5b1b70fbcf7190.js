Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

// eslint-disable-line

var _pythonIndent = require("./python-indent");

var _pythonIndent2 = _interopRequireDefault(_pythonIndent);

"use babel";

exports["default"] = {
    config: {
        hangingIndentTabs: {
            type: "number",
            "default": 1,
            description: "Number of tabs used for _hanging_ indents",
            "enum": [1, 2]
        }
    },

    activate: function activate() {
        var _this = this;

        this.pythonIndent = new _pythonIndent2["default"]();
        this.subscriptions = new _atom.CompositeDisposable();
        this.subscriptions.add(atom.commands.add("atom-text-editor", { "editor:newline": function editorNewline() {
                return _this.pythonIndent.indent();
            } }));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07Ozs7NEJBQ2pCLGlCQUFpQjs7OztBQUgxQyxXQUFXLENBQUM7O3FCQUtHO0FBQ1gsVUFBTSxFQUFFO0FBQ0oseUJBQWlCLEVBQUU7QUFDZixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxDQUFDO0FBQ1YsdUJBQVcsRUFBRSwyQ0FBMkM7QUFDeEQsb0JBQU0sQ0FDRixDQUFDLEVBQ0QsQ0FBQyxDQUNKO1NBQ0o7S0FDSjs7QUFFRCxZQUFRLEVBQUEsb0JBQUc7OztBQUNQLFlBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQWtCLENBQUM7QUFDdkMsWUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxZQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFDdkQsRUFBRSxnQkFBZ0IsRUFBRTt1QkFBTSxNQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUU7YUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ2hFO0NBQ0oiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbmltcG9ydCBQeXRob25JbmRlbnQgZnJvbSBcIi4vcHl0aG9uLWluZGVudFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY29uZmlnOiB7XG4gICAgICAgIGhhbmdpbmdJbmRlbnRUYWJzOiB7XG4gICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgZGVmYXVsdDogMSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIk51bWJlciBvZiB0YWJzIHVzZWQgZm9yIF9oYW5naW5nXyBpbmRlbnRzXCIsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAyLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMucHl0aG9uSW5kZW50ID0gbmV3IFB5dGhvbkluZGVudCgpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFwiYXRvbS10ZXh0LWVkaXRvclwiLFxuICAgICAgICAgICAgeyBcImVkaXRvcjpuZXdsaW5lXCI6ICgpID0+IHRoaXMucHl0aG9uSW5kZW50LmluZGVudCgpIH0pKTtcbiAgICB9LFxufTtcbiJdfQ==