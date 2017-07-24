(function() {
  var algorithm, crypto, encrypt;

  crypto = require('crypto');

  algorithm = 'aes-256-ctr';

  encrypt = function(text) {
    var cipher, crypted;
    cipher = crypto.createCipher(algorithm, "jdasnfklq");
    crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  };

  module.exports = encrypt;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9lbmNyeXB0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULFNBQUEsR0FBWTs7RUFFWixPQUFBLEdBQVUsU0FBQyxJQUFEO0FBQ1IsUUFBQTtJQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFwQixFQUErQixXQUEvQjtJQUNULE9BQUEsR0FBVSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsRUFBb0IsTUFBcEIsRUFBNEIsS0FBNUI7SUFDVixPQUFBLElBQVcsTUFBTSxDQUFDLEtBQVAsQ0FBYSxLQUFiO1dBQ1g7RUFKUTs7RUFNVixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQVRqQiIsInNvdXJjZXNDb250ZW50IjpbImNyeXB0byA9IHJlcXVpcmUgJ2NyeXB0bydcbmFsZ29yaXRobSA9ICdhZXMtMjU2LWN0cidcblxuZW5jcnlwdCA9ICh0ZXh0KS0+XG4gIGNpcGhlciA9IGNyeXB0by5jcmVhdGVDaXBoZXIoYWxnb3JpdGhtLCBcImpkYXNuZmtscVwiKVxuICBjcnlwdGVkID0gY2lwaGVyLnVwZGF0ZSh0ZXh0LCAndXRmOCcsICdoZXgnKVxuICBjcnlwdGVkICs9IGNpcGhlci5maW5hbCgnaGV4JylcbiAgY3J5cHRlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IGVuY3J5cHQiXX0=
