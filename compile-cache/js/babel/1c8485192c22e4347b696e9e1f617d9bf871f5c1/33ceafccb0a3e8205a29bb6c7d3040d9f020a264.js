'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * @access private
 */

var CanvasLayer = (function () {
  function CanvasLayer() {
    _classCallCheck(this, CanvasLayer);

    /**
     * The onscreen canvas.
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas');
    /**
     * The onscreen canvas context.
     * @type {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d');
    this.canvas.webkitImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    /**
    * The offscreen canvas.
    * @type {HTMLCanvasElement}
    * @access private
    */
    this.offscreenCanvas = document.createElement('canvas');
    /**
     * The offscreen canvas context.
     * @type {CanvasRenderingContext2D}
     * @access private
     */
    this.offscreenContext = this.offscreenCanvas.getContext('2d');
    this.offscreenCanvas.webkitImageSmoothingEnabled = false;
    this.offscreenContext.imageSmoothingEnabled = false;
  }

  _createClass(CanvasLayer, [{
    key: 'attach',
    value: function attach(parent) {
      if (this.canvas.parentNode) {
        return;
      }

      parent.appendChild(this.canvas);
    }
  }, {
    key: 'setSize',
    value: function setSize() {
      var width = arguments[0] === undefined ? 0 : arguments[0];
      var height = arguments[1] === undefined ? 0 : arguments[1];

      this.canvas.width = width;
      this.canvas.height = height;
      this.context.imageSmoothingEnabled = false;
      this.resetOffscreenSize();
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return {
        width: this.canvas.width,
        height: this.canvas.height
      };
    }
  }, {
    key: 'resetOffscreenSize',
    value: function resetOffscreenSize() {
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
      this.offscreenContext.imageSmoothingEnabled = false;
    }
  }, {
    key: 'copyToOffscreen',
    value: function copyToOffscreen() {
      this.offscreenContext.drawImage(this.canvas, 0, 0);
    }
  }, {
    key: 'copyFromOffscreen',
    value: function copyFromOffscreen() {
      this.context.drawImage(this.offscreenCanvas, 0, 0);
    }
  }, {
    key: 'copyPartFromOffscreen',
    value: function copyPartFromOffscreen(srcY, destY, height) {
      this.context.drawImage(this.offscreenCanvas, 0, srcY, this.offscreenCanvas.width, height, 0, destY, this.offscreenCanvas.width, height);
    }
  }, {
    key: 'clearCanvas',
    value: function clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }]);

  return CanvasLayer;
})();

exports['default'] = CanvasLayer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvY2FudmFzLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7SUFLVSxXQUFXO0FBQ2xCLFdBRE8sV0FBVyxHQUNmOzBCQURJLFdBQVc7Ozs7OztBQU01QixRQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7Ozs7O0FBSzlDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDM0MsUUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsR0FBRyxLQUFLLENBQUE7QUFDL0MsUUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUE7Ozs7Ozs7QUFPMUMsUUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7Ozs7QUFNdkQsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdELFFBQUksQ0FBQyxlQUFlLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxDQUFBO0FBQ3hELFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUE7R0FDcEQ7O2VBN0JrQixXQUFXOztXQStCdkIsZ0JBQUMsTUFBTSxFQUFFO0FBQ2QsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtBQUFFLGVBQU07T0FBRTs7QUFFdEMsWUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDaEM7OztXQUVPLG1CQUF3QjtVQUF2QixLQUFLLGdDQUFHLENBQUM7VUFBRSxNQUFNLGdDQUFHLENBQUM7O0FBQzVCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUN6QixVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDM0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUE7QUFDMUMsVUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7S0FDMUI7OztXQUVPLG1CQUFHO0FBQ1QsYUFBTztBQUNMLGFBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7QUFDeEIsY0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtPQUMzQixDQUFBO0tBQ0Y7OztXQUVrQiw4QkFBRztBQUNwQixVQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtBQUM5QyxVQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQTtBQUNoRCxVQUFJLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFBO0tBQ3BEOzs7V0FFZSwyQkFBRztBQUNqQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQ25EOzs7V0FFaUIsNkJBQUc7QUFDbkIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDbkQ7OztXQUVxQiwrQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUMxQyxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FDcEIsSUFBSSxDQUFDLGVBQWUsRUFDcEIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQzNDLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUM3QyxDQUFBO0tBQ0Y7OztXQUVXLHVCQUFHO0FBQ2IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ3BFOzs7U0EzRWtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvY2FudmFzLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzTGF5ZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgLyoqXG4gICAgICogVGhlIG9uc2NyZWVuIGNhbnZhcy5cbiAgICAgKiBAdHlwZSB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIC8qKlxuICAgICAqIFRoZSBvbnNjcmVlbiBjYW52YXMgY29udGV4dC5cbiAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAqL1xuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICB0aGlzLmNhbnZhcy53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxuICAgIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxuXG4gICAgLyoqXG4gICAgKiBUaGUgb2Zmc2NyZWVuIGNhbnZhcy5cbiAgICAqIEB0eXBlIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICAgIC8qKlxuICAgICAqIFRoZSBvZmZzY3JlZW4gY2FudmFzIGNvbnRleHQuXG4gICAgICogQHR5cGUge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNjcmVlbkNvbnRleHQgPSB0aGlzLm9mZnNjcmVlbkNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgdGhpcy5vZmZzY3JlZW5DYW52YXMud2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgICB0aGlzLm9mZnNjcmVlbkNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgfVxuXG4gIGF0dGFjaCAocGFyZW50KSB7XG4gICAgaWYgKHRoaXMuY2FudmFzLnBhcmVudE5vZGUpIHsgcmV0dXJuIH1cblxuICAgIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcbiAgfVxuXG4gIHNldFNpemUgKHdpZHRoID0gMCwgaGVpZ2h0ID0gMCkge1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgICB0aGlzLnJlc2V0T2Zmc2NyZWVuU2l6ZSgpXG4gIH1cblxuICBnZXRTaXplICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmNhbnZhcy5oZWlnaHRcbiAgICB9XG4gIH1cblxuICByZXNldE9mZnNjcmVlblNpemUgKCkge1xuICAgIHRoaXMub2Zmc2NyZWVuQ2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGhcbiAgICB0aGlzLm9mZnNjcmVlbkNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHRcbiAgICB0aGlzLm9mZnNjcmVlbkNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcbiAgfVxuXG4gIGNvcHlUb09mZnNjcmVlbiAoKSB7XG4gICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgMCwgMClcbiAgfVxuXG4gIGNvcHlGcm9tT2Zmc2NyZWVuICgpIHtcbiAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMub2Zmc2NyZWVuQ2FudmFzLCAwLCAwKVxuICB9XG5cbiAgY29weVBhcnRGcm9tT2Zmc2NyZWVuIChzcmNZLCBkZXN0WSwgaGVpZ2h0KSB7XG4gICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIHRoaXMub2Zmc2NyZWVuQ2FudmFzLFxuICAgICAgMCwgc3JjWSwgdGhpcy5vZmZzY3JlZW5DYW52YXMud2lkdGgsIGhlaWdodCxcbiAgICAgIDAsIGRlc3RZLCB0aGlzLm9mZnNjcmVlbkNhbnZhcy53aWR0aCwgaGVpZ2h0XG4gICAgKVxuICB9XG5cbiAgY2xlYXJDYW52YXMgKCkge1xuICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcbiAgfVxufVxuIl19