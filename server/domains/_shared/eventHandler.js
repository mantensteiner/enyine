var ValidationError = require('../../utils/errors').ValidationError,
    _ = require('underscore');

module.exports = function (req, res, subscriptions, dataObject) {
  if(!req.body && !req.body.event) {
    return;
  }    
    
  if(!req.body.event) {
    return {
      formattedData: req.body
    }
  }
  
  var eventData = {
    event: req.body.event,
    snapshot: req.body.snapshot ?  req.body.snapshot  : null
  };
  
  if(subscriptions) {
    var subscription = _.findWhere(subscriptions.events, {namespace: eventData.event.namespace});
    var subscriptionsByNamespace = [];
    _.each(subscriptions.events, function(sub) {
      var i = _.indexOf(eventData.event.namespaces, sub.namespace);
      if(i >= 0 && !_.contains(subscriptionsByNamespace, sub))
        subscriptionsByNamespace.push(sub);
    });
    
    if(subscription)
      subscriptionsByNamespace.push(subscription);
    
  
    if(subscriptionsByNamespace.length === 0)
      throw new Error('No subscription found for namespace ' + eventData.event.namespace);
      
    if(subscriptionsByNamespace.length > 1)
      throw new Error('More than 1 subscription found for namespace ' + eventData.event.namespace);
     
    var execSubscription = subscriptionsByNamespace[0]; 
     
    if(execSubscription.targetFormatter) {
      eventData.formattedData = execSubscription.targetFormatter(eventData);
    }
    
    if(execSubscription.skipAuth) {
      eventData.skipAuth = execSubscription.skipAuth;
    }
    
    console.log(subscriptions.subscriberKey + ':' + execSubscription.namespace + '(' + execSubscription.description + ')');
  }
  
  if(eventData.event.meta)
    eventData.meta = JSON.parse(eventData.event.meta);
  
  dataObject = eventData.snapshot;
  
  return eventData;
}