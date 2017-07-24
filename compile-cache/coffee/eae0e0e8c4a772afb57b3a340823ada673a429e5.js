(function() {
  var Dialog, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.prototype.activate = function() {
      this.addClass('active');
    };

    Dialog.prototype.deactivate = function() {
      this.removeClass('active');
    };

    Dialog.prototype.cancel = function() {
      this.deactivate();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxZQUFBO0lBQUE7OztFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7cUJBQ0osUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7SUFEUTs7cUJBSVYsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsV0FBRCxDQUFhLFFBQWI7SUFEVTs7cUJBSVosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsVUFBRCxDQUFBO0lBRE07Ozs7S0FUVztBQUhyQiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWFsb2cgZXh0ZW5kcyBWaWV3XG4gIGFjdGl2YXRlOiAtPlxuICAgIEBhZGRDbGFzcygnYWN0aXZlJylcbiAgICByZXR1cm5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEByZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICByZXR1cm5cblxuICBjYW5jZWw6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIHJldHVyblxuIl19
