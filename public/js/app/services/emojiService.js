enyine.service('emojiService', 
        ['$http',
function ($http) {  

  this.emojis = function() {
   return[
      ':smiley:',':satisfied:', ':joy:',':stuck_out_tongue_winking_eye:',':sweat_smile:', ':sunglasses:', ':metal:',
      ':sweat:',':cry:', ':sleeping:', ':tired_face:',':unamused:',':confused:',
      ':neutral_face:',':angry:', ':rage:',':monkey_face:', ':alien:'
    ];
  }
       

}]);