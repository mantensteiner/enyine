var esRepo = require('../api/services/esRepo'),
    _ = require('underscore');

module.exports = function() {

  this.execute = function(cb) {
    debugger;

    // project enyine only
    var query = "+(*) +(projectId:96cc91b1bb93c1c6ba79555ab6bebf43)";

    esRepo.search("data.5", "topic", "*", null, 0, 1000000, null, null, null, null).then(
      function(_topics1){
        var _topics = _.map(_topics1.hits.hits, function(tpc){ return  tpc._source; });

        esRepo.search("data.5", "time", query, null, 0, 1000000, null, null, null, null).then(
          function(result) {
            var hits = result.hits.hits;
            var successes = 0;
            for(var i = 0; i < hits.length; i++) {
              var t = hits[i]._source;

              t.value = t.time;
              delete t.time;

              // Set unit
              t.unit = {
                id:'b5d26cce510bc8de949b75e4feb773cd', // Predefined unit in project
                symbol:'h'
              };

              var oldId = t.id;
              delete t.id;

              if(!t.topics || t.topics.length == 0) {
                esRepo.save("data.5", "value", t, oldId).then(
                  function(_res) {
                    successes++;
                    if(successes === hits.length)
                      cb();
                  },function(err) {
                    cb(err);
                  });
              }
              else {
                var newValueTopics = [];
                // Set label (find labels for topic and set in topics[])
                _.each(t.topics, function(topic) {
                  var _topic = _.findWhere(_topics,{id:topic.id});
                  if(_topic) {
                    var tLabels = _topic.labels;
                    if(tLabels && tLabels.length >  0) {
                      if(tLabels && tLabels.length > 0) {
                        _.each(tLabels, function(lId) {
                          newValueTopics.push({
                            id:_topic.id,
                            labelId:lId
                          })
                        });

                        t.topics = newValueTopics;
                      }

                      esRepo.save("data.5", "value", t, oldId).then(
                        function(_res) {
                          successes++;
                          if(successes === hits.length)
                            cb();
                        },function(err) {
                          cb(err);
                        });
                    }
                  }
                  else {
                    successes++;
                    esRepo.save("data.5", "value", t, oldId).then(
                      function(_res) {
                        successes++;
                        if(successes === hits.length)
                          cb();
                      },function(err) {
                        cb(err);
                      });
                  }
                });
              }

            }
          },
          function(err) {
            cb(err);
          });

      },
      function(err) {

      });


  };


  return this;
};
