(function() {
  var fs, header, io_port, io_socket, kernel_file_name, kernel_file_path, kernel_info, shell_port, shell_socket, zmq, _,
    __slice = [].slice;

  fs = require('fs');

  zmq = require('zmq');

  _ = require('lodash');

  shell_socket = zmq.socket('dealer');

  io_socket = zmq.socket('sub');

  shell_socket.identity = 'dealer' + process.pid;

  io_socket.identity = 'sub' + process.pid;

  shell_socket.on('message', function() {
    var msg;
    msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log("new shell message");
    return _.forEach(msg, function(item) {
      return console.log("shell received:", item.toString('utf8'));
    });
  });

  io_socket.on('message', function() {
    var msg;
    msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log("new IO message");
    return _.forEach(msg, function(item) {
      return console.log("io received:", item.toString('utf8'));
    });
  });

  kernel_file_name = 'kernel-5666.json';

  kernel_file_path = '/Users/will/Library/Jupyter/runtime/' + kernel_file_name;

  kernel_info = JSON.parse(fs.readFileSync(kernel_file_path));

  shell_port = kernel_info.shell_port;

  io_port = kernel_info.iopub_port;

  shell_socket.connect('tcp://127.0.0.1:' + shell_port);

  io_socket.connect('tcp://127.0.0.1:' + io_port);

  io_socket.subscribe('');

  header = JSON.stringify({
    msg_id: 0,
    username: "will",
    session: "00000000-0000-0000-0000-000000000000",
    msg_type: "execute_request",
    version: "5.0"
  });

  shell_socket.send([
    '<IDS|MSG>', '', header, '{}', '{}', JSON.stringify({
      code: "a - 4",
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false
    })
  ]);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi90ZXN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpSEFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUROLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FGSixDQUFBOztBQUFBLEVBSUEsWUFBQSxHQUFlLEdBQUcsQ0FBQyxNQUFKLENBQVcsUUFBWCxDQUpmLENBQUE7O0FBQUEsRUFLQSxTQUFBLEdBQWUsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFYLENBTGYsQ0FBQTs7QUFBQSxFQU9BLFlBQVksQ0FBQyxRQUFiLEdBQXdCLFFBQUEsR0FBVyxPQUFPLENBQUMsR0FQM0MsQ0FBQTs7QUFBQSxFQVFBLFNBQVMsQ0FBQyxRQUFWLEdBQXFCLEtBQUEsR0FBUSxPQUFPLENBQUMsR0FSckMsQ0FBQTs7QUFBQSxFQVVBLFlBQVksQ0FBQyxFQUFiLENBQWdCLFNBQWhCLEVBQTJCLFNBQUEsR0FBQTtBQUN2QixRQUFBLEdBQUE7QUFBQSxJQUR3Qiw2REFDeEIsQ0FBQTtBQUFBLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtQkFBWixDQUFBLENBQUE7V0FDQSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsRUFBYyxTQUFDLElBQUQsR0FBQTthQUNOLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVosRUFBK0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkLENBQS9CLEVBRE07SUFBQSxDQUFkLEVBRnVCO0VBQUEsQ0FBM0IsQ0FWQSxDQUFBOztBQUFBLEVBZUEsU0FBUyxDQUFDLEVBQVYsQ0FBYSxTQUFiLEVBQXdCLFNBQUEsR0FBQTtBQUNwQixRQUFBLEdBQUE7QUFBQSxJQURxQiw2REFDckIsQ0FBQTtBQUFBLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWixDQUFBLENBQUE7V0FDQSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsRUFBZSxTQUFDLElBQUQsR0FBQTthQUNYLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixFQUE0QixJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQsQ0FBNUIsRUFEVztJQUFBLENBQWYsRUFGb0I7RUFBQSxDQUF4QixDQWZBLENBQUE7O0FBQUEsRUFxQkEsZ0JBQUEsR0FBbUIsa0JBckJuQixDQUFBOztBQUFBLEVBc0JBLGdCQUFBLEdBQW1CLHNDQUFBLEdBQXlDLGdCQXRCNUQsQ0FBQTs7QUFBQSxFQXVCQSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFFLENBQUMsWUFBSCxDQUFnQixnQkFBaEIsQ0FBWCxDQXZCZCxDQUFBOztBQUFBLEVBeUJBLFVBQUEsR0FBYSxXQUFXLENBQUMsVUF6QnpCLENBQUE7O0FBQUEsRUEwQkEsT0FBQSxHQUFVLFdBQVcsQ0FBQyxVQTFCdEIsQ0FBQTs7QUFBQSxFQTRCQSxZQUFZLENBQUMsT0FBYixDQUFxQixrQkFBQSxHQUFxQixVQUExQyxDQTVCQSxDQUFBOztBQUFBLEVBNkJBLFNBQVMsQ0FBQyxPQUFWLENBQWtCLGtCQUFBLEdBQXFCLE9BQXZDLENBN0JBLENBQUE7O0FBQUEsRUE4QkEsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsRUFBcEIsQ0E5QkEsQ0FBQTs7QUFBQSxFQWtDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQUwsQ0FBZTtBQUFBLElBQ1osTUFBQSxFQUFRLENBREk7QUFBQSxJQUVaLFFBQUEsRUFBVSxNQUZFO0FBQUEsSUFHWixPQUFBLEVBQVMsc0NBSEc7QUFBQSxJQUlaLFFBQUEsRUFBVSxpQkFKRTtBQUFBLElBS1osT0FBQSxFQUFTLEtBTEc7R0FBZixDQWxDVCxDQUFBOztBQUFBLEVBMENBLFlBQVksQ0FBQyxJQUFiLENBQ0k7SUFDSSxXQURKLEVBRUksRUFGSixFQUdJLE1BSEosRUFJSSxJQUpKLEVBS0ksSUFMSixFQU1JLElBQUksQ0FBQyxTQUFMLENBQWU7QUFBQSxNQUNQLElBQUEsRUFBTSxPQURDO0FBQUEsTUFFUCxNQUFBLEVBQVEsS0FGRDtBQUFBLE1BR1AsYUFBQSxFQUFlLElBSFI7QUFBQSxNQUlQLGdCQUFBLEVBQWtCLEVBSlg7QUFBQSxNQUtQLFdBQUEsRUFBYSxLQUxOO0tBQWYsQ0FOSjtHQURKLENBMUNBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/test.coffee
