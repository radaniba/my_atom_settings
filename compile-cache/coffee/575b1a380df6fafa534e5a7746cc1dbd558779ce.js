(function() {
  module.exports = {
    selector: ['.text.html.php'],
    id: 'aligner-php',
    config: {
      '=>-alignment': {
        title: 'Padding for =>',
        description: 'Pad left or right of the character',
        type: 'string',
        "enum": ['left', 'right'],
        "default": 'left'
      },
      '=>-leftSpace': {
        title: 'Left space for =>',
        description: 'Add 1 whitespace to the left',
        type: 'boolean',
        "default": true
      },
      '=>-rightSpace': {
        title: 'Right space for =>',
        description: 'Add 1 whitespace to the right',
        type: 'boolean',
        "default": true
      },
      '=-alignment': {
        title: 'Padding for :',
        description: 'Pad left or right of the character',
        type: 'string',
        "enum": ['left', 'right'],
        "default": 'left'
      },
      '=-leftSpace': {
        title: 'Left space for :',
        description: 'Add 1 whitespace to the left',
        type: 'boolean',
        "default": true
      },
      '=-rightSpace': {
        title: 'Right space for :',
        description: 'Add 1 whitespace to the right',
        type: 'boolean',
        "default": true
      }
    },
    privateConfig: {
      '=>-scope': 'key',
      '=-scope': 'assignment'
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hbGlnbmVyLXBocC9saWIvcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxDQUFDLGdCQUFELENBQVY7QUFBQSxJQUNBLEVBQUEsRUFBSSxhQURKO0FBQUEsSUFFQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGdCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsb0NBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxRQUZOO0FBQUEsUUFHQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsTUFKVDtPQURGO0FBQUEsTUFNQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxtQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLDhCQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLElBSFQ7T0FQRjtBQUFBLE1BV0EsZUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sb0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwrQkFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUhUO09BWkY7QUFBQSxNQWdCQSxhQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxlQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsb0NBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxRQUZOO0FBQUEsUUFHQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMsTUFKVDtPQWpCRjtBQUFBLE1Bc0JBLGFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGtCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsOEJBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtPQXZCRjtBQUFBLE1BMkJBLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsK0JBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtPQTVCRjtLQUhGO0FBQUEsSUFtQ0EsYUFBQSxFQUNFO0FBQUEsTUFBQSxVQUFBLEVBQVksS0FBWjtBQUFBLE1BQ0EsU0FBQSxFQUFXLFlBRFg7S0FwQ0Y7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/aligner-php/lib/provider.coffee
