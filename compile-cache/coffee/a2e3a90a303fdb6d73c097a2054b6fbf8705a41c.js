(function() {
  var AskStackApiClient, request;

  request = require('request');

  module.exports = AskStackApiClient = (function() {
    function AskStackApiClient() {}

    AskStackApiClient.question = '';

    AskStackApiClient.tag = '';

    AskStackApiClient.page = 1;

    AskStackApiClient.sort_by = 'votes';

    AskStackApiClient.search = function(callback) {
      var options;
      options = {
        uri: "https://api.stackexchange.com" + "/2.2/search/advanced?pagesize=5&" + ("page=" + this.page + "&") + "order=desc&" + ("sort=" + this.sort_by + "&") + ("q=" + (encodeURIComponent(this.question.trim())) + "&") + ("tagged=" + (encodeURIComponent(this.tag.trim())) + "&") + "site=stackoverflow&" + "filter=!b0OfNKD*3O569e",
        method: 'GET',
        gzip: true,
        headers: {
          'User-Agent': 'Atom-Ask-Stack'
        }
      };
      if (process.env.http_proxy != null) {
        options.proxy = process.env.http_proxy;
      }
      return request(options, function(error, res, body) {
        var response;
        if (!error && res.statusCode === 200) {
          try {
            return response = JSON.parse(body);
          } catch (_error) {
            console.log("Error: Invalid JSON");
            return response = null;
          } finally {
            callback(response);
          }
        } else {
          console.log("Error: " + error, "Result: ", res);
          return response = null;
        }
      });
    };

    AskStackApiClient.resetInputs = function() {
      this.question = '';
      this.tag = '';
      this.page = 1;
      return this.sort_by = 'votes';
    };

    return AskStackApiClient;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svbGliL2Fzay1zdGFjay1hcGktY2xpZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQkFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUFWLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQVNNO21DQUdKOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxRQUFELEdBQVksRUFBWixDQUFBOztBQUFBLElBQ0EsaUJBQUMsQ0FBQSxHQUFELEdBQU8sRUFEUCxDQUFBOztBQUFBLElBRUEsaUJBQUMsQ0FBQSxJQUFELEdBQVEsQ0FGUixDQUFBOztBQUFBLElBR0EsaUJBQUMsQ0FBQSxPQUFELEdBQVcsT0FIWCxDQUFBOztBQUFBLElBS0EsaUJBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEdBQUE7QUFDUCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLCtCQUFBLEdBQ0gsa0NBREcsR0FFSCxDQUFDLE9BQUEsR0FBTyxJQUFDLENBQUEsSUFBUixHQUFhLEdBQWQsQ0FGRyxHQUdILGFBSEcsR0FJSCxDQUFDLE9BQUEsR0FBTyxJQUFDLENBQUEsT0FBUixHQUFnQixHQUFqQixDQUpHLEdBS0gsQ0FBQyxJQUFBLEdBQUcsQ0FBQyxrQkFBQSxDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQSxDQUFuQixDQUFELENBQUgsR0FBeUMsR0FBMUMsQ0FMRyxHQU1ILENBQUMsU0FBQSxHQUFRLENBQUMsa0JBQUEsQ0FBbUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQUEsQ0FBbkIsQ0FBRCxDQUFSLEdBQXlDLEdBQTFDLENBTkcsR0FPSCxxQkFQRyxHQVFILHdCQVJGO0FBQUEsUUFTQSxNQUFBLEVBQVEsS0FUUjtBQUFBLFFBVUEsSUFBQSxFQUFNLElBVk47QUFBQSxRQVdBLE9BQUEsRUFDRTtBQUFBLFVBQUEsWUFBQSxFQUFjLGdCQUFkO1NBWkY7T0FERixDQUFBO0FBZUEsTUFBQSxJQUEwQyw4QkFBMUM7QUFBQSxRQUFBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBNUIsQ0FBQTtPQWZBO2FBaUJBLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLFNBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYSxJQUFiLEdBQUE7QUFDZixZQUFBLFFBQUE7QUFBQSxRQUFBLElBQUcsQ0FBQSxLQUFBLElBQWMsR0FBRyxDQUFDLFVBQUosS0FBa0IsR0FBbkM7QUFDRTttQkFDRSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBRGI7V0FBQSxjQUFBO0FBR0UsWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHFCQUFaLENBQUEsQ0FBQTttQkFDQSxRQUFBLEdBQVcsS0FKYjtXQUFBO0FBTUUsWUFBQSxRQUFBLENBQVMsUUFBVCxDQUFBLENBTkY7V0FERjtTQUFBLE1BQUE7QUFTRSxVQUFBLE9BQU8sQ0FBQyxHQUFSLENBQWEsU0FBQSxHQUFTLEtBQXRCLEVBQStCLFVBQS9CLEVBQTJDLEdBQTNDLENBQUEsQ0FBQTtpQkFDQSxRQUFBLEdBQVcsS0FWYjtTQURlO01BQUEsQ0FBakIsRUFsQk87SUFBQSxDQUxULENBQUE7O0FBQUEsSUFvQ0EsaUJBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQURQLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FGUixDQUFBO2FBR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUpDO0lBQUEsQ0FwQ2QsQ0FBQTs7NkJBQUE7O01BZEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/lib/ask-stack-api-client.coffee
