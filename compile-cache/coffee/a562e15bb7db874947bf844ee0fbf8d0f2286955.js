
/*
Very simple synchronous Hook library
For async, please use Emitter

eg:

  hook = new Hook()
  hook.on 'add', (num)->
    num+1
  hook.on 'add', (num)->
    num+2

  hook.chain 'add', 3  # => 6
 */

(function() {
  var Hook;

  Hook = (function() {
    function Hook() {
      this.subcriptions = {};
    }

    Hook.prototype.on = function(name, callback) {
      if (this.subcriptions[name]) {
        return this.subcriptions[name].push(callback);
      } else {
        return this.subcriptions[name] = [callback];
      }
    };

    Hook.prototype.chain = function(name, args) {
      var func, funcs, i, len, value;
      if (this.subcriptions[name]) {
        funcs = this.subcriptions[name];
        value = args;
        for (i = 0, len = funcs.length; i < len; i++) {
          func = funcs[i];
          value = func(value);
        }
        return value;
      } else {
        return args;
      }
    };

    Hook.prototype.dispose = function() {
      return this.subcriptions = null;
    };

    return Hook;

  })();

  module.exports = Hook;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9ob29rLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsTUFBQTs7RUFnQk07SUFDUyxjQUFBO01BQ1gsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFETDs7bUJBR2IsRUFBQSxHQUFJLFNBQUMsSUFBRCxFQUFPLFFBQVA7TUFDRixJQUFHLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxDQUFqQjtlQUNFLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQSxDQUFLLENBQUMsSUFBcEIsQ0FBeUIsUUFBekIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsWUFBYSxDQUFBLElBQUEsQ0FBZCxHQUFzQixDQUFDLFFBQUQsRUFIeEI7O0lBREU7O21CQU1KLEtBQUEsR0FBTyxTQUFDLElBQUQsRUFBTyxJQUFQO0FBQ0wsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxJQUFBLENBQWpCO1FBQ0UsS0FBQSxHQUFRLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQTtRQUN0QixLQUFBLEdBQVE7QUFDUixhQUFBLHVDQUFBOztVQUNFLEtBQUEsR0FBUSxJQUFBLENBQUssS0FBTDtBQURWO2VBRUEsTUFMRjtPQUFBLE1BQUE7ZUFPRSxLQVBGOztJQURLOzttQkFVUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBRFQ7Ozs7OztFQUdYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdkNqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuVmVyeSBzaW1wbGUgc3luY2hyb25vdXMgSG9vayBsaWJyYXJ5XG5Gb3IgYXN5bmMsIHBsZWFzZSB1c2UgRW1pdHRlclxuXG5lZzpcblxuICBob29rID0gbmV3IEhvb2soKVxuICBob29rLm9uICdhZGQnLCAobnVtKS0+XG4gICAgbnVtKzFcbiAgaG9vay5vbiAnYWRkJywgKG51bSktPlxuICAgIG51bSsyXG5cbiAgaG9vay5jaGFpbiAnYWRkJywgMyAgIyA9PiA2XG5cbiMjI1xuXG5jbGFzcyBIb29rXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBzdWJjcmlwdGlvbnMgPSB7fVxuXG4gIG9uOiAobmFtZSwgY2FsbGJhY2spLT5cbiAgICBpZiBAc3ViY3JpcHRpb25zW25hbWVdXG4gICAgICBAc3ViY3JpcHRpb25zW25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICBlbHNlXG4gICAgICBAc3ViY3JpcHRpb25zW25hbWVdID0gW2NhbGxiYWNrXVxuXG4gIGNoYWluOiAobmFtZSwgYXJncyktPlxuICAgIGlmIEBzdWJjcmlwdGlvbnNbbmFtZV1cbiAgICAgIGZ1bmNzID0gQHN1YmNyaXB0aW9uc1tuYW1lXVxuICAgICAgdmFsdWUgPSBhcmdzXG4gICAgICBmb3IgZnVuYyBpbiBmdW5jc1xuICAgICAgICB2YWx1ZSA9IGZ1bmModmFsdWUpXG4gICAgICB2YWx1ZVxuICAgIGVsc2VcbiAgICAgIGFyZ3NcblxuICBkaXNwb3NlOiAtPlxuICAgIEBzdWJjcmlwdGlvbnMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gSG9va1xuIl19
