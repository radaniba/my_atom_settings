(function() {
  var fs, path, request, smAPI;

  request = require('request');

  fs = require('fs');

  path = require('path');

  smAPI = {};

  smAPI.uploadFile = function(filePath, callback) {
    return request.post({
      url: 'https://sm.ms/api/upload/',
      formData: {
        smfile: fs.createReadStream(filePath)
      }
    }, function(err, httpResponse, body) {
      body = JSON.parse(body);
      if (err) {
        return callback('Failed to upload image');
      } else if (body.code === 'error') {
        return callback(body.msg, null);
      } else {
        return callback(null, body.data.url);
      }
    });
  };


  /*
   * example of how to use this API
  smAPI.uploadFile '/Users/wangyiyi/Desktop/test.html', (err, url)->
    if err
      console.log err
    else
      console.log url
   */

  module.exports = smAPI;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9zbS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUdQLEtBQUEsR0FBUTs7RUFDUixLQUFLLENBQUMsVUFBTixHQUFtQixTQUFDLFFBQUQsRUFBVyxRQUFYO1dBQ2pCLE9BQU8sQ0FBQyxJQUFSLENBQWM7TUFBQSxHQUFBLEVBQUksMkJBQUo7TUFBaUMsUUFBQSxFQUFVO1FBQUMsTUFBQSxFQUFRLEVBQUUsQ0FBQyxnQkFBSCxDQUFvQixRQUFwQixDQUFUO09BQTNDO0tBQWQsRUFBa0csU0FBQyxHQUFELEVBQU0sWUFBTixFQUFvQixJQUFwQjtNQUNoRyxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYO01BQ1AsSUFBRyxHQUFIO2VBQ0UsUUFBQSxDQUFTLHdCQUFULEVBREY7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxPQUFoQjtlQUNILFFBQUEsQ0FBUyxJQUFJLENBQUMsR0FBZCxFQUFtQixJQUFuQixFQURHO09BQUEsTUFBQTtlQUdILFFBQUEsQ0FBUyxJQUFULEVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUF6QixFQUhHOztJQUoyRixDQUFsRztFQURpQjs7O0FBVW5COzs7Ozs7Ozs7RUFTQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXpCakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIHNtLm1zIGFwaVxucmVxdWVzdCA9IHJlcXVpcmUgJ3JlcXVlc3QnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiMgJy9Vc2Vycy93YW5neWl5aS9EZXNrdG9wL3Rlc3QucG5nJ1xuc21BUEkgPSB7fVxuc21BUEkudXBsb2FkRmlsZSA9IChmaWxlUGF0aCwgY2FsbGJhY2spLT5cbiAgcmVxdWVzdC5wb3N0ICB1cmw6J2h0dHBzOi8vc20ubXMvYXBpL3VwbG9hZC8nLCBmb3JtRGF0YToge3NtZmlsZTogZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCl9LCAoZXJyLCBodHRwUmVzcG9uc2UsIGJvZHkpLT5cbiAgICBib2R5ID0gSlNPTi5wYXJzZSBib2R5XG4gICAgaWYgZXJyXG4gICAgICBjYWxsYmFjayAnRmFpbGVkIHRvIHVwbG9hZCBpbWFnZSdcbiAgICBlbHNlIGlmIGJvZHkuY29kZSA9PSAnZXJyb3InXG4gICAgICBjYWxsYmFjayBib2R5Lm1zZywgbnVsbFxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrIG51bGwsIGJvZHkuZGF0YS51cmxcblxuIyMjXG4jIGV4YW1wbGUgb2YgaG93IHRvIHVzZSB0aGlzIEFQSVxuc21BUEkudXBsb2FkRmlsZSAnL1VzZXJzL3dhbmd5aXlpL0Rlc2t0b3AvdGVzdC5odG1sJywgKGVyciwgdXJsKS0+XG4gIGlmIGVyclxuICAgIGNvbnNvbGUubG9nIGVyclxuICBlbHNlXG4gICAgY29uc29sZS5sb2cgdXJsXG4jIyNcblxubW9kdWxlLmV4cG9ydHMgPSBzbUFQSVxuIl19
