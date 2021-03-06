Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atomTernjsHelper = require('../atom-ternjs-helper');

'use babel';

var index = 0;
var checkpoints = [];

function set(data) {

  checkpoints.length = 0;

  var editor = atom.workspace.getActiveTextEditor();
  var buffer = editor.getBuffer();
  var cursor = editor.getLastCursor();

  if (!cursor) {

    return false;
  }

  var marker = buffer.markPosition(cursor.getBufferPosition(), {});

  add(editor, marker);

  return true;
}

function append(editor, buffer, position) {

  var marker = buffer.markPosition(position, {});

  add(editor, marker);
}

function add(editor, marker) {

  index = checkpoints.push({

    marker: marker,
    editor: editor

  }) - 1;
}

function goTo(value) {

  var checkpoint = checkpoints[index + value];

  if (!checkpoint) {

    return;
  }

  index += value;

  (0, _atomTernjsHelper.openFileAndGoToPosition)(checkpoint.marker.getRange().start, checkpoint.editor.getURI());
}

exports['default'] = {

  set: set,
  append: append,
  goTo: goTo
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL3NlcnZpY2VzL25hdmlnYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztnQ0FJTyx1QkFBdUI7O0FBSjlCLFdBQVcsQ0FBQzs7QUFNWixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZCxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRXZCLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRTs7QUFFakIsYUFBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRXZCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUV0QyxNQUFJLENBQUMsTUFBTSxFQUFFOztBQUVYLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFbkUsS0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFcEIsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTs7QUFFeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRWpELEtBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDckI7O0FBRUQsU0FBUyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTs7QUFFM0IsT0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7O0FBRXZCLFVBQU0sRUFBRSxNQUFNO0FBQ2QsVUFBTSxFQUFFLE1BQU07O0dBRWYsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNSOztBQUVELFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRTs7QUFFbkIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQzs7QUFFOUMsTUFBSSxDQUFDLFVBQVUsRUFBRTs7QUFFZixXQUFPO0dBQ1I7O0FBRUQsT0FBSyxJQUFJLEtBQUssQ0FBQzs7QUFFZixpREFBd0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0NBQ3pGOztxQkFFYzs7QUFFYixLQUFHLEVBQUgsR0FBRztBQUNILFFBQU0sRUFBTixNQUFNO0FBQ04sTUFBSSxFQUFKLElBQUk7Q0FDTCIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi9zZXJ2aWNlcy9uYXZpZ2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7XG4gIG9wZW5GaWxlQW5kR29Ub1Bvc2l0aW9uXG59IGZyb20gJy4uL2F0b20tdGVybmpzLWhlbHBlcic7XG5cbmxldCBpbmRleCA9IDA7XG5jb25zdCBjaGVja3BvaW50cyA9IFtdO1xuXG5mdW5jdGlvbiBzZXQoZGF0YSkge1xuXG4gIGNoZWNrcG9pbnRzLmxlbmd0aCA9IDA7XG5cbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG5cbiAgaWYgKCFjdXJzb3IpIHtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG1hcmtlciA9IGJ1ZmZlci5tYXJrUG9zaXRpb24oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCksIHt9KTtcblxuICBhZGQoZWRpdG9yLCBtYXJrZXIpO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBhcHBlbmQoZWRpdG9yLCBidWZmZXIsIHBvc2l0aW9uKSB7XG5cbiAgY29uc3QgbWFya2VyID0gYnVmZmVyLm1hcmtQb3NpdGlvbihwb3NpdGlvbiwge30pO1xuXG4gIGFkZChlZGl0b3IsIG1hcmtlcik7XG59XG5cbmZ1bmN0aW9uIGFkZChlZGl0b3IsIG1hcmtlcikge1xuXG4gIGluZGV4ID0gY2hlY2twb2ludHMucHVzaCh7XG5cbiAgICBtYXJrZXI6IG1hcmtlcixcbiAgICBlZGl0b3I6IGVkaXRvclxuICAgIFxuICB9KSAtIDE7XG59XG5cbmZ1bmN0aW9uIGdvVG8odmFsdWUpIHtcblxuICBjb25zdCBjaGVja3BvaW50ID0gY2hlY2twb2ludHNbaW5kZXggKyB2YWx1ZV07XG5cbiAgaWYgKCFjaGVja3BvaW50KSB7XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBpbmRleCArPSB2YWx1ZTtcblxuICBvcGVuRmlsZUFuZEdvVG9Qb3NpdGlvbihjaGVja3BvaW50Lm1hcmtlci5nZXRSYW5nZSgpLnN0YXJ0LCBjaGVja3BvaW50LmVkaXRvci5nZXRVUkkoKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBzZXQsXG4gIGFwcGVuZCxcbiAgZ29Ub1xufTtcbiJdfQ==