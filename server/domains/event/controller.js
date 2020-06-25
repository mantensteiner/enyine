var Event = require('./models/event'),  
    EventInternal = require('./models/eventInternal'),
    Subscriber = require('./models/subscriber'),
    command = require('../_shared/command'),
    restful = require('../../restful'),
    errorObjBuilder = require('../_shared/errorObjBuilder'),
    searchQueryParser = require('../_shared/searchRequestQueryParser');

/**
 *  get
 */
module.exports.get = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Event({user: req.user})
    .get()
    .then(function(_events) {
      return res.json(_events);
    }, function(err) {
      return res.status(500).json(errorObjBuilder('get', 'Event', err));
    });
  }
}

/**
 *  getById
 */
module.exports.getById = function(req, res) {
  restful(req, res, {
    get: handleGet
  });
  
  function handleGet() {
    Event({user: req.user})
    .findOne({id:req.params.id})
    .then(function(_event) {
      return res.json(_event);
    }, function(err){
      return res.status(500).json(errorObjBuilder('getById', 'Event', err));
    });
  }  
}

/**
 *  getBySpace
 */
module.exports.getBySpace = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var event = Event({user: req.user, fields: req.body.fields});
    event.sortField = 'modifiedOn';
    event.sortDir = "desc";
    event.take = req.body.take ? req.body.take : 50;
    event.skip = req.body.skip ? req.body.skip : 0;
  
    var query = "+(spaceId:"+req.params.id + ")" + " +(_missing_:users OR users:" + req.user.id + ")";
    if(req.body.search) {
      query += " +(" + req.body.search + ")";
    }
  
    event.search(query)
    .then(function(_events) {
      return res.json(_events);
    }, function(err){
      return res.status(500).json(errorObjBuilder('getBySpace', 'Event', err));
    });
  }
}

/**
 *  search
 */
module.exports.search = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var event = Event({user: req.user});
    if(req.body.skip)
      event.skip = req.body.skip;
    if(req.body.take)
      event.take = req.body.take;
  
    var query = searchQueryParser(req);
  
    var aggs = req.body.aggs;
  
    event.search(query, aggs)
    .then(function(result) {
      return res.json(result);
    }, function(err){
      return res.status(500).json(errorObjBuilder('search', 'Event', err));
    });
  }
}


/**
 *  write
 */
module.exports.write = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var eventInternal = EventInternal({user: req.user, txnId: txnId}); 
        return eventInternal.validate(req.body)
        .then(function(eventData) {
          return eventInternal.write(eventData);
        });
      },
      success: function(result) {
        return res.json(result);
      },
      fail: function(err) {
        return res.status(500).json(errorObjBuilder('write', 'Event', err));  
      }
    });
  }
}

/**
 *  subscribe
 */
module.exports.subscribe = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var subscriber = Subscriber({user: req.user});
    subscriber.validate(req.body)
    .then(function(subscriber) {
      return subscriber.register(subscriber);
    })
    .then(function(subscription) {
      return res.json(subscription);
    })
    .fail(function(err) {
      return res.status(500).json(errorObjBuilder('subscribe', 'Event', err));
    });
  }
}

/**
 *  saveSubscriptions
 */
module.exports.saveSubscriptions = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    var subscriber = Subscriber({user: req.user});
    subscriber.validateSubscriptions(req.body)
    .then(function(subscriptionsConfig) {
      return subscriber.saveSubscriptions(subscriptionsConfig);
    })
    .then(function(subscriptions) {
      return res.json(subscriptions);
    })
    .fail(function(err) {
      return res.status(500).json(errorObjBuilder('saveSubscriptions', 'Event', err));
    });
  }
}

/**
 *  callInternalSubscribers
 */
module.exports.callInternalSubscribers = function(req, res) {
  restful(req, res, {
    post: handlePost
  });
  
  function handlePost() {
    command(req, res, {
      handler: function(txnId) {
        var subscriber = Subscriber({user: req.user, txnId: txnId}); 
        return subscriber.deliverInternal({
          event: req.body, 
          snapshot: req.body.sourceData
        });
      },
      success: function(deliveryResult) {
        return res.json(deliveryResult);
      },
      fail: function(err) {
        return res.status(500).json(errorObjBuilder('write', 'Event', err));  
      }
    });
  }
}


