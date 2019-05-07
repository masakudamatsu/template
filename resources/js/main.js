// jQuery
$(document).ready(function() {
  // Append a new HTML element
  var $parentElement = $('.CLASS');
  var newText = "TEXT";
  var $childElement = $('<TAG>' + newText + '</TAG>');
  $parentElement.append($childElement);
  // Here write event handers
  // For the list of jQuery methods, see http://api.jquery.com/

});
