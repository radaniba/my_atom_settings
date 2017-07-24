(function() {
  var Dialog, FlowDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = FlowDialog = (function(superClass) {
    extend(FlowDialog, superClass);

    function FlowDialog() {
      return FlowDialog.__super__.constructor.apply(this, arguments);
    }

    FlowDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Workflow - GitFlow');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Git Flow ');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowType',
              change: 'flowTypeChange'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowAction',
              change: 'flowActionChange'
            });
            _this.label('Branch Name:', {
              outlet: 'labelBranchName'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'branchName'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'branchChoose'
            });
            _this.label('Message:', {
              outlet: 'labelMessage'
            });
            _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'message'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'checkbox',
              outlet: 'noTag',
              id: 'noTag'
            });
            return _this.label('No Tag', {
              outlet: 'labelNoTag',
              "for": 'noTag'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'flow'
            }, function() {
              _this.i({
                "class": 'icon flow'
              });
              return _this.span('Ok');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    FlowDialog.prototype.activate = function(branches) {
      var current;
      current = git.getLocalBranch();
      this.branches = branches;
      this.flowType.find('option').remove();
      this.flowType.append("<option value='feature'>feature</option>");
      this.flowType.append("<option value='release'>release</option>");
      this.flowType.append("<option value='hotfix'>hotfix</option>");
      this.flowType.append("<option value='init'>init</option>");
      this.flowAction.find('option').remove();
      this.flowAction.append("<option value='start'>start</option>");
      this.flowAction.append("<option value='finish'>finish</option>");
      this.flowAction.append("<option value='publish'>publish</option>");
      this.flowAction.append("<option value='pull'>pull</option>");
      this.flowTypeChange();
      this.flowActionChange();
      return FlowDialog.__super__.activate.call(this);
    };

    FlowDialog.prototype.flow = function() {
      var actionSelected, branchSelected;
      this.deactivate();
      if (this.flowType.val() === "init") {
        this.parentView.flow(this.flowType.val(), '-d', '');
      } else {
        branchSelected = this.branchName.val() !== '' ? this.branchName.val() : this.branchChoose.val();
        actionSelected = this.flowAction.val();
        if ((branchSelected != null) && branchSelected !== '') {
          if (actionSelected === "finish") {
            if (this.message.val() !== '') {
              actionSelected += ' -m "' + this.message.val() + '"';
            }
            if (this.noTag.prop('checked')) {
              actionSelected += ' -n';
            }
          }
          this.parentView.flow(this.flowType.val(), actionSelected, branchSelected);
        } else {
          git.alert("> No branches selected... Git flow action not valid.");
        }
      }
    };

    FlowDialog.prototype.checkMessageNeeded = function() {
      this.message.val("");
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.message.show();
        this.labelMessage.show();
      } else {
        this.message.hide();
        this.labelMessage.hide();
      }
    };

    FlowDialog.prototype.checkNoTagNeeded = function() {
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.noTag.show();
        this.labelNoTag.show();
      } else {
        this.noTag.hide();
        this.labelNoTag.hide();
      }
    };

    FlowDialog.prototype.flowTypeChange = function() {
      if (this.flowType.val() === "init") {
        this.flowAction.hide();
        this.branchName.hide();
        this.branchChoose.hide();
        this.labelBranchName.hide();
      } else {
        this.flowAction.show();
        this.flowActionChange();
        this.labelBranchName.show();
      }
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
    };

    FlowDialog.prototype.flowActionChange = function() {
      var branch, i, len, ref, value;
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
      if (this.flowAction.val() !== "start") {
        this.branchName.hide();
        this.branchName.val('');
        this.branchChoose.find('option').remove();
        ref = this.branches;
        for (i = 0, len = ref.length; i < len; i++) {
          branch = ref[i];
          if (branch.indexOf(this.flowType.val()) !== -1) {
            value = branch.replace(this.flowType.val() + '/', '');
            this.branchChoose.append("<option value='" + value + "'>" + value + "</option>");
          }
        }
        if (this.branchChoose.find('option').length <= 0) {
          this.branchChoose.append("<option value=''> --no " + this.flowType.val() + " branches--</option>");
        }
        return this.branchChoose.show();
      } else {
        this.branchName.show();
        this.branchChoose.val('');
        return this.branchChoose.hide();
      }
    };

    return FlowDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9mbG93LWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxvQkFBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8sV0FBUDtZQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLE1BQUEsRUFBUSxVQUF0QztjQUFrRCxNQUFBLEVBQVEsZ0JBQTFEO2FBQVI7WUFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixNQUFBLEVBQVEsWUFBdEM7Y0FBb0QsTUFBQSxFQUFRLGtCQUE1RDthQUFS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QyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQUEsQ0FBMUIsR0FBMEMsc0JBQS9ELEVBREY7O2VBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQUEsRUFWRjtPQUFBLE1BQUE7UUFZRSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQTtRQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixFQUFsQjtlQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUFBLEVBZEY7O0lBSGdCOzs7O0tBbEdLO0FBTHpCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmxvd0RpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJywgY2xpY2s6ICdjYW5jZWwnXG4gICAgICAgIEBzdHJvbmcgJ1dvcmtmbG93IC0gR2l0RmxvdydcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGxhYmVsICdHaXQgRmxvdyAnXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnZmxvd1R5cGUnLCBjaGFuZ2U6ICdmbG93VHlwZUNoYW5nZSdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdmbG93QWN0aW9uJywgY2hhbmdlOiAnZmxvd0FjdGlvbkNoYW5nZSdcbiAgICAgICAgQGxhYmVsICdCcmFuY2ggTmFtZTonLCBvdXRsZXQ6ICdsYWJlbEJyYW5jaE5hbWUnXG4gICAgICAgIEBpbnB1dCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCB0eXBlOiAndGV4dCcsIG91dGxldDogJ2JyYW5jaE5hbWUnXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnYnJhbmNoQ2hvb3NlJ1xuICAgICAgICBAbGFiZWwgJ01lc3NhZ2U6Jywgb3V0bGV0OiAnbGFiZWxNZXNzYWdlJ1xuICAgICAgICBAdGV4dGFyZWEgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnbWVzc2FnZSdcbiAgICAgICAgQGlucHV0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycsIHR5cGU6ICdjaGVja2JveCcsIG91dGxldDogJ25vVGFnJywgaWQ6ICdub1RhZydcbiAgICAgICAgQGxhYmVsICdObyBUYWcnLCBvdXRsZXQ6ICdsYWJlbE5vVGFnJywgZm9yOiAnbm9UYWcnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ2Zsb3cnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBmbG93J1xuICAgICAgICAgIEBzcGFuICdPaydcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICBhY3RpdmF0ZTogKGJyYW5jaGVzKSAtPlxuICAgIGN1cnJlbnQgPSBnaXQuZ2V0TG9jYWxCcmFuY2goKVxuICAgIEBicmFuY2hlcyA9IGJyYW5jaGVzO1xuXG4gICAgQGZsb3dUeXBlLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpXG4gICAgQGZsb3dUeXBlLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9J2ZlYXR1cmUnPmZlYXR1cmU8L29wdGlvbj5cIlxuICAgIEBmbG93VHlwZS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdyZWxlYXNlJz5yZWxlYXNlPC9vcHRpb24+XCJcbiAgICBAZmxvd1R5cGUuYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0naG90Zml4Jz5ob3RmaXg8L29wdGlvbj5cIlxuICAgIEBmbG93VHlwZS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdpbml0Jz5pbml0PC9vcHRpb24+XCJcblxuICAgIEBmbG93QWN0aW9uLmZpbmQoJ29wdGlvbicpLnJlbW92ZSgpXG4gICAgQGZsb3dBY3Rpb24uYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nc3RhcnQnPnN0YXJ0PC9vcHRpb24+XCJcbiAgICBAZmxvd0FjdGlvbi5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdmaW5pc2gnPmZpbmlzaDwvb3B0aW9uPlwiXG4gICAgQGZsb3dBY3Rpb24uYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0ncHVibGlzaCc+cHVibGlzaDwvb3B0aW9uPlwiXG4gICAgQGZsb3dBY3Rpb24uYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0ncHVsbCc+cHVsbDwvb3B0aW9uPlwiXG5cbiAgICBAZmxvd1R5cGVDaGFuZ2UoKVxuICAgIEBmbG93QWN0aW9uQ2hhbmdlKClcblxuICAgIHJldHVybiBzdXBlcigpXG5cbiAgZmxvdzogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgI2luaXQgd2l0aCBkZWZhdWx0IGJyYW5jaCBuYW1lXG4gICAgaWYgKEBmbG93VHlwZS52YWwoKSA9PSBcImluaXRcIilcbiAgICAgIEBwYXJlbnRWaWV3LmZsb3coQGZsb3dUeXBlLnZhbCgpLCctZCcsJycpXG4gICAgZWxzZVxuICAgICAgYnJhbmNoU2VsZWN0ZWQgPSBpZiAoQGJyYW5jaE5hbWUudmFsKCkgIT0gJycpIHRoZW4gQGJyYW5jaE5hbWUudmFsKCkgZWxzZSBAYnJhbmNoQ2hvb3NlLnZhbCgpO1xuICAgICAgYWN0aW9uU2VsZWN0ZWQgPSBAZmxvd0FjdGlvbi52YWwoKVxuICAgICAgaWYoYnJhbmNoU2VsZWN0ZWQ/ICYmIGJyYW5jaFNlbGVjdGVkICE9ICcnKVxuICAgICAgICBpZihhY3Rpb25TZWxlY3RlZCA9PSBcImZpbmlzaFwiKVxuICAgICAgICAgIGlmKEBtZXNzYWdlLnZhbCgpIT0gJycpXG4gICAgICAgICAgICBhY3Rpb25TZWxlY3RlZCArPSAnIC1tIFwiJytAbWVzc2FnZS52YWwoKSsnXCInO1xuICAgICAgICAgIGlmKEBub1RhZy5wcm9wKCdjaGVja2VkJykpXG4gICAgICAgICAgICBhY3Rpb25TZWxlY3RlZCArPSAnIC1uJztcbiAgICAgICAgQHBhcmVudFZpZXcuZmxvdyhAZmxvd1R5cGUudmFsKCksYWN0aW9uU2VsZWN0ZWQsYnJhbmNoU2VsZWN0ZWQpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5hbGVydCBcIj4gTm8gYnJhbmNoZXMgc2VsZWN0ZWQuLi4gR2l0IGZsb3cgYWN0aW9uIG5vdCB2YWxpZC5cIlxuICAgIHJldHVyblxuXG4gIGNoZWNrTWVzc2FnZU5lZWRlZDogLT5cbiAgICBAbWVzc2FnZS52YWwoXCJcIilcbiAgICBpZihAZmxvd0FjdGlvbi52YWwoKSA9PSBcImZpbmlzaFwiICYmIChAZmxvd1R5cGUudmFsKCkgPT0gXCJyZWxlYXNlXCIgfHwgQGZsb3dUeXBlLnZhbCgpID09IFwiaG90Zml4XCIgKSApXG4gICAgICBAbWVzc2FnZS5zaG93KClcbiAgICAgIEBsYWJlbE1lc3NhZ2Uuc2hvdygpXG4gICAgZWxzZVxuICAgICAgQG1lc3NhZ2UuaGlkZSgpXG4gICAgICBAbGFiZWxNZXNzYWdlLmhpZGUoKVxuICAgIHJldHVyblxuXG4gIGNoZWNrTm9UYWdOZWVkZWQ6IC0+XG4gICAgaWYoQGZsb3dBY3Rpb24udmFsKCkgPT0gXCJmaW5pc2hcIiAmJiAoQGZsb3dUeXBlLnZhbCgpID09IFwicmVsZWFzZVwiIHx8IEBmbG93VHlwZS52YWwoKSA9PSBcImhvdGZpeFwiICkgKVxuICAgICAgQG5vVGFnLnNob3coKVxuICAgICAgQGxhYmVsTm9UYWcuc2hvdygpXG4gICAgZWxzZVxuICAgICAgQG5vVGFnLmhpZGUoKVxuICAgICAgQGxhYmVsTm9UYWcuaGlkZSgpXG4gICAgcmV0dXJuXG5cbiAgZmxvd1R5cGVDaGFuZ2U6IC0+XG4gICAgaWYgKEBmbG93VHlwZS52YWwoKSA9PSBcImluaXRcIilcbiAgICAgIEBmbG93QWN0aW9uLmhpZGUoKVxuICAgICAgQGJyYW5jaE5hbWUuaGlkZSgpXG4gICAgICBAYnJhbmNoQ2hvb3NlLmhpZGUoKVxuICAgICAgQGxhYmVsQnJhbmNoTmFtZS5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAZmxvd0FjdGlvbi5zaG93KClcbiAgICAgIEBmbG93QWN0aW9uQ2hhbmdlKClcbiAgICAgIEBsYWJlbEJyYW5jaE5hbWUuc2hvdygpXG4gICAgQGNoZWNrTWVzc2FnZU5lZWRlZCgpXG4gICAgQGNoZWNrTm9UYWdOZWVkZWQoKVxuICAgIHJldHVyblxuXG4gIGZsb3dBY3Rpb25DaGFuZ2U6IC0+XG4gICAgQGNoZWNrTWVzc2FnZU5lZWRlZCgpXG4gICAgQGNoZWNrTm9UYWdOZWVkZWQoKVxuICAgIGlmIChAZmxvd0FjdGlvbi52YWwoKSAhPSBcInN0YXJ0XCIpXG4gICAgICBAYnJhbmNoTmFtZS5oaWRlKClcbiAgICAgIEBicmFuY2hOYW1lLnZhbCgnJylcbiAgICAgIEBicmFuY2hDaG9vc2UuZmluZCgnb3B0aW9uJykucmVtb3ZlKClcbiAgICAgIGZvciBicmFuY2ggaW4gQGJyYW5jaGVzXG4gICAgICAgIGlmIChicmFuY2guaW5kZXhPZihAZmxvd1R5cGUudmFsKCkpICE9IC0xIClcbiAgICAgICAgICB2YWx1ZSA9IGJyYW5jaC5yZXBsYWNlKEBmbG93VHlwZS52YWwoKSsnLycsJycpXG4gICAgICAgICAgQGJyYW5jaENob29zZS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje3ZhbHVlfSc+I3t2YWx1ZX08L29wdGlvbj5cIlxuICAgICAgaWYgKEBicmFuY2hDaG9vc2UuZmluZCgnb3B0aW9uJykubGVuZ3RoIDw9IDApXG4gICAgICAgIEBicmFuY2hDaG9vc2UuYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nJz4gLS1ubyBcIitAZmxvd1R5cGUudmFsKCkrXCIgYnJhbmNoZXMtLTwvb3B0aW9uPlwiXG4gICAgICBAYnJhbmNoQ2hvb3NlLnNob3coKVxuICAgIGVsc2VcbiAgICAgIEBicmFuY2hOYW1lLnNob3coKVxuICAgICAgQGJyYW5jaENob29zZS52YWwoJycpXG4gICAgICBAYnJhbmNoQ2hvb3NlLmhpZGUoKVxuIl19
