var elasticsearch = require('elasticsearch'),
    q = require('q'),
    idGen = require('./idGen'),
    _ = require('underscore'),
    log = require('./logger'),
    EsRepoError = require('./errors').ElasticsearchRepoError,
    typeHelper = require('./typeHelper'),
    config = require('../config')();

// ElasticsearchRepository 
var ElasticsearchRepository = function(esConfig) { 
  
  // ES client
  this.client = new elasticsearch.Client(esConfig);
  
  // provide all indexes which are available for global search requests
  this.indexSearchWhitelist = function() {
    return config.globalSearchDomainsWhitelist.toString(); // CSV-index list
  }
  
  // Authorization: a cached filter to reduce the result set
  this.setAuth =  function(auth, type) {
    var filter = [];
  
    // Convention: objects in auth come in an array named the target filtered field in plural
    // with each object having an id field
    // eg auth:{spaces:[{id:'123'},{id:'456'}]}
    // result: filter.or[{spaceId:123},{spaceId:456}]
    if(auth) {
      _.each(Object.keys(auth), function(key) {
        var elems = auth[key];
        _.each(elems, function(el) {
          var clause ={};
          // remove plural
          var targetType = key.substring(0, key.length-1);
          // if type fits use id-field directly
          if(type === targetType) {
            clause["id"] = el.id;
          }
          else {
            // use typeId, eg spaceId 
            clause[targetType + "Id"] = el.id;
          }
          
          filter.push({
            match: clause
          });
        });
      });
    }
  
    return filter;
  }

  // Authorization: a cached filter to reduce the result set
  this.setAuthQueryString =  function(auth, type) {
    var qs = '*';
  
    // Convention: objects in auth come in an array named the target filtered field in plural
    // with each object having an id field
    // eg auth:{spaces:[{id:'123'},{id:'456'}]}
    // result: filter.or[{spaceId:123},{spaceId:456}]
    if(auth) {
      qs = '';

      _.each(Object.keys(auth), function(key) {
        var elems = auth[key];
        _.each(elems, function(el) {
          if(qs !== '') {
            qs += " OR ";
          }
          var clause ={};
          // remove plural
          var targetType = key.substring(0, key.length-1);
          // if type fits use id-field directly
          if(type === targetType) {
            qs += "id:"+el.id;
          }
          else {
            // use typeId, eg spaceId 
            qs += targetType + "Id:" + el.id;
          }
        });
      });
    }
  
    return qs;
  }
  
  // buildSearchConfig - config for the SEARCH API
  // fields: index, type, query, aggs, skip, take, sortField, sortDir, fields, auth
  this.buildSearchConfig = function(queryConfig) {
    if(!queryConfig.index) 
      queryConfig.index = this.indexSearchWhitelist();
      
    var queryStringQuery = '';
    if(typeHelper.getTypeName(queryConfig.query) === 'string') {
      queryStringQuery = queryConfig.query;
    }
    else if(typeHelper.getTypeName(queryConfig.query) === 'object') {
      _.each(_.keys(queryConfig.query), function(key) {
        if(queryConfig.query[key]) {
          queryStringQuery += (key + ':' + queryConfig.query[key].toString() + ' AND ');
        }
      });
      queryStringQuery = queryStringQuery.substring(0, queryStringQuery.length-5);
    }
    
    var _query = {
      query_string: {
        query: queryStringQuery
      }
    }
  
    if(!queryConfig.skip)
      queryConfig.skip = 0;
    if(!queryConfig.take)
      queryConfig.take = 20;
  
    var sortString = null;
    if(queryConfig.sortField) {
      if(queryConfig.sortDir)
        sortString = queryConfig.sortField + ":" + queryConfig.sortDir;
      else
        sortString = queryConfig.sortField + ":asc";
    }
  
    // Authorization filter
    //var filter = this.setAuth(queryConfig.auth, queryConfig.type);
    var queryStringAuth = this.setAuthQueryString(queryConfig.auth, queryConfig.type);
  
    var searchConfig = {
      index: queryConfig.index ? queryConfig.index : undefined,
      //type: queryConfig.type ? queryConfig.type : undefined,
      type: undefined, // ES7
      from: queryConfig.skip * queryConfig.take,
      size: queryConfig.take,
      sort: sortString,
      _sourceInclude: queryConfig.fields ? queryConfig.fields : undefined, 
      body: {
        query: {
          bool: {
            must : _query,
            filter: [{query_string:{query:queryStringAuth}}, 
                {query_string:{query: "type:" + queryConfig.type}}]
          }
        }
      }
    }
  
    if(queryConfig.aggs) {
      if(queryConfig.aggs.only) {
        searchConfig.size = 0;
        delete queryConfig.aggs.only;
      }
  
      searchConfig.body.aggs = queryConfig.aggs;
    }
  
    return searchConfig;
  }
}

// create - fails if the record-id already exists
ElasticsearchRepository.prototype.create = function(createConfig) {
  var self = this;
  var defer = q.defer();
  if(!createConfig.index || !createConfig.type || !createConfig.record) {
    var msg = "Fields, 'index', 'type' and 'record' are mandatory for operation 'save";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.create', createConfig: createConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  if(!createConfig.record.id)  
    createConfig.record.id = idGen();

  // Post ES6 mapping
  if(!createConfig.record.type)
    createConfig.record.type = createConfig.type;
    
  self.client.create({
    index: createConfig.index,
    //type: createConfig.type,
    id: createConfig.record.id,
    body: createConfig.record,
    refresh: createConfig.refresh === true ? true : false
  })
  .then(function (resp) {
    createConfig.record.id = resp._id;
    return defer.resolve(createConfig.record);
  }, function(err) {
    if(err.status === 409) {
      log.error(err, {name: 'elasticsearch.repository.create', 
        data: createConfig.record, message: 'document already exists'}); 
      return defer.reject(err);
    }
    
  	log.error(err, {name: 'elasticsearch.repository.create', 
      data: createConfig.record, message: 'client.create failed'}); 
    return defer.reject(err);
  });
  
  return defer.promise;
}

// save - on create (no id provided) use INDEX API, on update use UPDATE API
// the UPDATE API merges the provided document with the existing one
ElasticsearchRepository.prototype.save = function(saveConfig) {
  var self = this;
  var defer = q.defer();
  
  if(!saveConfig.index || !saveConfig.type || !saveConfig.record) {
    var msg = "Fields, 'index', 'type' and 'record' are mandatory for operation 'save";
    log.error(new EsRepoError(msg), {name: 'elasticsearch.repository.save', saveConfig: saveConfig}); 
    return q.fcall(function () { throw new EsRepoError(msg); });
  }
  
  var isUpdate = false;
  if(!saveConfig.record.id) {
    // no object id - this must be a index-operation (write document, replace if exists)
    saveConfig.record.id = idGen();
  } else {
    // if the object has an id an 'update' is assumed, 
    // but a replace (index-operation) of the document can be forced 
    if(!saveConfig.forceIndex)
      isUpdate = true;
  }
  
  // Post ES6 mapping
  if(!saveConfig.record.type)
      saveConfig.record.type = saveConfig.type;

  if(!isUpdate) { // create
    self.client.index({    // Index API
      index: saveConfig.index,
      //type: saveConfig.type,
      id: saveConfig.record.id,
      body: saveConfig.record,
      refresh: saveConfig.refresh === true ? true : false
    })
    .then(function(resp) {
      saveConfig.record.id = resp._id;
      return defer.resolve(saveConfig.record);
    }, function(err) {
  		log.error(err, {name: 'elasticsearch.repository.save', data: saveConfig.record, 
        message: 'client.index failed'}); 
      return defer.reject(err);
    });
  }
  else { // update
    self.client.update({   // Update API
      index: saveConfig.index,
      //type: saveConfig.type,
      id: saveConfig.record.id,
      refresh: saveConfig.refresh === true ? true : false,
      body: {
        doc: saveConfig.record,
        detect_noop: true // skip operation if document is unchanged 
      }
    })
    .then(function(resp){
      saveConfig.record.id = resp._id;
      return defer.resolve(saveConfig.record);
    }, function(err) {
      log.error(err, {name: 'elasticsearch.repository.save', data: saveConfig.record, 
        message: 'client.update failed'}); 
      return defer.reject(err);
    });
  }
  
  return defer.promise;    
}

// getById - using GET API (client.get) guarantees immediate record availability 
ElasticsearchRepository.prototype.getById = function(queryConfig) {
  var defer = q.defer();
  
  if(!queryConfig.index || !queryConfig.type || !queryConfig.id) {
    var msg = "Fields, 'index', 'type' and 'id' are mandatory for operation 'getById";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.getById', queryConfig: queryConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  var searchConfig = {
    index: queryConfig.index,
    //type: queryConfig.type,
    id: queryConfig.id,
    _source: true,
    _sourceInclude: queryConfig.fields ? queryConfig.fields : undefined,
    _sourceExclude: queryConfig.fieldsExclude ? queryConfig.fieldsExclude : undefined,
  };
  
  this.client.getSource(searchConfig)
  .then(function(result) {
    if(!result) return defer.resolve(null);
    return defer.resolve(result);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.getById', config: searchConfig,
     message: 'client.getSource failed'}); 
    return defer.reject(err);
  });
  
  return defer.promise;
}

// findOne - return exactly one element or fail by a search query
// availability is not guarateed (immediately after writes, see index.refresh)
ElasticsearchRepository.prototype.findOne = function(queryConfig) {
  var defer = q.defer();
  
  if(!queryConfig.query) {
    var msg = "Field, 'query' is mandatory for operation 'findOne";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.findOne', queryConfig: queryConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  var searchConfig = this.buildSearchConfig(queryConfig);
  
  this.client.search(searchConfig)
  .then(function(result) {
    if(result.hits.total.value == 0) {
      return defer.resolve(null);
    }

    if(result.hits.total.value > 1) {
      var msg = "Expected exactly 1, but found " + result.hits.total.value + " record.";
      log.error(new EsRepoError(msg), {name: 'elasticsearch.repository.findOne', config: searchConfig}); 
      return defer.reject(msg);
    }
    
    return defer.resolve(result.hits.hits[0]._source);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.findOne', config: searchConfig, message: 'client.search failed'}); 
    return defer.reject(err);
  });

  return defer.promise;
}


// get - records for a index/type, returns only the hits without metadata,
// uses SEARCH API with query '*'
ElasticsearchRepository.prototype.get = function(queryConfig) {
  var self = this;
  var defer = q.defer();  
  // index, type, skip, take, sortField, sortDir, fields, auth
  if(!queryConfig.index || !queryConfig.type) {
    var msg = "Field, 'index','type' are mandatory for operation 'get";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.get', queryConfig: queryConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  queryConfig.query = '*';
  var searchConfig = this.buildSearchConfig(queryConfig);

  this.client.search(searchConfig)
  .then(function(results) {
    if(results.hits.total == 0) {
      return defer.resolve([]);
    }

    return defer.resolve(self.unwrapResultRecords(results));
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.get', message: 'client.search failed'}); 
    return defer.reject(err);
  });

  return defer.promise;  
}

// search - returns hits, total & aggs with metadata
ElasticsearchRepository.prototype.search = function(queryConfig) {
  var defer = q.defer();
  
  if(!queryConfig.query) {
    var msg = "Field, 'query' is mandatory for operation 'search";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.get', queryConfig: queryConfig}); 
    return q.fcall(function () { throw err; });
  }

  var searchConfig = this.buildSearchConfig(queryConfig);

  this.client.search(searchConfig)
  .then(function(result) {
    if(result.hits.total.value == 0) {
      return defer.resolve({hits:{hits:[], total: 0}});
    }

    var resultObj = {
      hits: {
        hits: result.hits.hits,
        total: result.hits.total.value
      }
    }

    if(result.aggregations) {
      resultObj.aggs = result.aggregations;
    }

    return defer.resolve(resultObj);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.search', config: searchConfig, message: 'client.search failed'});
    return defer.reject(err);
  });

  return defer.promise; 
}

// delete by ID
ElasticsearchRepository.prototype.delete = function(deleteConfig) {
  var defer = q.defer();
  
  if(!deleteConfig.index || !deleteConfig.type || !deleteConfig.id) {
    var msg = "Fields 'index', 'type', 'id' are mandatory for operation 'delete";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.delete', deleteConfig: deleteConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  this.client.delete({
    index: deleteConfig.index,
    //type: deleteConfig.type,
    id: deleteConfig.id,
    refresh: deleteConfig.refresh === true ? true : false
  })
  .then(function() {
    return defer.resolve(deleteConfig.id);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.delete', deleteConfig: deleteConfig,
      message: 'client.delete failed'});
    return defer.reject(err);
  });

  return defer.promise;  
}

// delete by QUERY, resticted on index+type for safety 
ElasticsearchRepository.prototype.deleteBulk = function(deleteConfig) {
  var defer = q.defer();
  
  if(!deleteConfig.index || !deleteConfig.type || !deleteConfig.query) {
    var msg = "Fields 'index', 'type', 'id' are mandatory for operation 'deleteBulk";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.deleteBulk', deleteConfig: deleteConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  this.client.deleteByQuery({
      index: deleteConfig.index,
      type: deleteConfig.type,
      q: deleteConfig.query
    })
  .then(function() {
    return defer.resolve(deleteConfig.query);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.deleteBulk', deleteConfig: deleteConfig});
    return defer.reject(err);
  });

  return defer.promise;  
}

// suggester, e.g. autocomplete
ElasticsearchRepository.prototype.autoComplete = function(autoCompleteConfig) {
  var defer = q.defer();
  
  if(!autoCompleteConfig.index || !autoCompleteConfig.type || !autoCompleteConfig.text || !autoCompleteConfig.field) {
    var msg = "Fields 'index', 'type', 'text', 'field' are mandatory for operation 'autoComplete";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.autoComplete', autoCompleteConfig: autoCompleteConfig}); 
    return q.fcall(function () { throw err; });
  }
  
  this.client.suggest({
    index: autoCompleteConfig.index,
    type: autoCompleteConfig.type,
    body: {
      suggester: {
        text: autoCompleteConfig.text,
        completion : {
            "field" : autoCompleteConfig.field
        }
      }
    }
  })
  .then(function(result) {
    return defer.resolve(result);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.autoComplete',   autoCompleteConfig: autoCompleteConfig});
    return defer.reject(err);
  });

  return defer.promise;
}

// count - number of records 
ElasticsearchRepository.prototype.count = function(countConfig) {
  var defer = q.defer();
  
  if(!countConfig.index && !countConfig.type && !countConfig.query) {
    var msg = "At least one field 'index', 'type', 'query' is mandatory for operation 'count";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.count', countConfig: countConfig}); 
    return q.fcall(function () { throw err; });
  }


  // ES7 => countConfig query with type
  
  this.client.count({
    index: countConfig.index ? countConfig.index : undefined,
    type: countConfig.type ? countConfig.type : undefined,
    q: countConfig.query ? countConfig.query : undefined,
  })
  .then(function(result) {
    return defer.resolve(result.count);
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.count', countConfig: countConfig});
    return defer.reject(err);
  });

  return defer.promise;  
}

// nextNumber - store a counter by type to implement a sequence generator
ElasticsearchRepository.prototype.nextNumber = function(typeId) {
  var self = this;
  var defer = q.defer();
  
  if(!typeId) {
    var msg = "Parameter 'typeId' of type string is mandatory for operation 'nextNumber";
    var err = new EsRepoError(msg);
    log.error(err, {name: 'elasticsearch.repository.nextNumber'}); 
    return q.fcall(function () { throw err; });
  }
  
  var getConfig = {
      index: 'system', 
      type: typeId, 
      query: '_id:' + typeId // + " AND type:" + typeId
      //id: typeId 
    };
  
  self.findOne(getConfig)
  .then(function(result) {
    if(!result) {
      // First index
      self.client.index({    
        index: 'system',
        //type: typeId,
        id: typeId,
        body: { counter: 1, type: typeId }
      })
      .then(function(resp) {
        return defer.resolve(1);
      }, function(err) {
        log.error(err, { name: 'elasticsearch.repository.nextNumber.first', typeId:typeId, 
          message: 'client.index failed'});
        return defer.reject(err);
      });
    }
    else {
      var next = result.counter ? result.counter + 1 : 1;
      
      // Save increment
      self.client.index({   
        index: 'system',
        //type: typeId,
        id: typeId,
        body:  { counter: next, type: typeId }
      })
      .then(function(resp) {
        return defer.resolve(next);
      }, function(err) {
        log.error(err, {name: 'elasticsearch.repository.nextNumber.increment', typeId:typeId, 
          message: 'client.index failed'});
        return defer.reject(err);
      });
    }
  }, function(err) {
    log.error(err, {name: 'elasticsearch.repository.nextNumber',  typeId:typeId, 
      message: 'client.search failed'});
    return defer.reject(err);
  });

  return defer.promise;
}

// extract field data only (from _source) 
ElasticsearchRepository.prototype.unwrapRecord = function(record) {
  if(record._source)
    return record._source;
  return record;
}

// extract field data only from a result list
ElasticsearchRepository.prototype.unwrapResultRecords = function(results) {
  var self = this;
  if(results.hits && results.hits.hits) {
    return _.map(results.hits.hits, function(hit) {
      return self.unwrapRecord(hit);
    })
  }
  return results;
}

var cachedRepo = null;

// return single instance per default
module.exports = function(repoConfig) {
  var esConfig = {
    host: config.elasticsearch.host,
    log: config.elasticsearch.logLevel
  };
  
  if(!repoConfig) {
    return getCachedRepo();   
  }
  else if(repoConfig.newInstance !== undefined) {
    if(repoConfig.newInstance === true)
      return new ElasticsearchRepository(esConfig);
    else
      return getCachedRepo();   
  }
  else
    throw new Error('Invalid repoConfig');
    
  function getCachedRepo() {
    if(!cachedRepo)
      cachedRepo = new ElasticsearchRepository(esConfig);
    return cachedRepo; 
  }
}
  
