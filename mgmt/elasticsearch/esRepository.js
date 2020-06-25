var elasticsearch = require('elasticsearch'),
    q = require('q'),
    request = require('request'),
    config = require('../config')();

// ElasticsearchRepository definition
var ElasticsearchRepository = function() { 
  this.client = new elasticsearch.Client({
    host: config.elasticsearch.host,
    log: config.elasticsearch.logLevel
  });
}

// setTemplate
ElasticsearchRepository.prototype.setTemplate = function(mappingDefinition, indexName, cb) {
  var self = this;
  var index_name = indexName || mappingDefinition.index_name;
  var cfg = {
    name: 'enyine_' + index_name,
    body: {
      template: index_name+'.*',
      settings:{
        "number_of_shards" : mappingDefinition.number_of_shards,
        "number_of_replicas": mappingDefinition.number_of_replicas
      },
      aliases : {},
      mappings: mappingDefinition[index_name]
    }
  };
  cfg.body.aliases[index_name]={};

  self.client.indices.putTemplate(cfg)
  .then(function() {
    cb(null)
  }, function(err) {
    console.error(err);      
    cb(err);
  });
}

// deleteTemplate
ElasticsearchRepository.prototype.deleteTemplate = function(name, cb) {
  var self = this;
  var cfg = {
    name: name
  };
  
  self.client.indices.deleteTemplate(cfg)
  .then(function() {
    cb(null)
  }, function(err) {
    console.error(err);      
    cb(err);
  });  
}

// index exists
ElasticsearchRepository.prototype.indexExists = function(index) {
  var defer = q.defer();

  this.client.indices.exists({
      index: index
  })
  .then(function(exists) {
    defer.resolve(exists);
  }, function(err) {
    console.error(err);
    defer.reject(err);
  });

  return defer.promise; 
}

// create index
ElasticsearchRepository.prototype.createIndex = function(index) {
  var defer = q.defer();

  this.client.indices.create({
      index: index
  }).then(function() {
    defer.resolve(index);
  }, function(err) {
    console.error(err);
    defer.reject(err);
  });

  return defer.promise; 
}

// delete index
ElasticsearchRepository.prototype.deleteIndex = function(index) {
  var defer = q.defer();

  this.client.indices.delete({
      index: index
    }).then(function() {
      defer.resolve(index);
    }, function(err) {
      console.error(err);
      defer.reject(err);
    });

  return defer.promise; 
}

// putMapping
ElasticsearchRepository.prototype.putMapping = function(mappingDefinition, typeName, indexName, cb) {
  var self = this;
  
  var cfg = {
    index: indexName || mappingDefinition.index_name,
    type: typeName,
    body: mappingDefinition[mappingDefinition.index_name][typeName]
  };

  self.client.indices.putMapping(cfg)
  .then(function() {
    cb(null)
  }, function(err) {
    console.error(err);
    cb(err);
  });  
}

// deleteMapping
ElasticsearchRepository.prototype.deleteMapping = function(index, typeName, cb) {
  var self = this;

  var cfg = {
    index: index,
    type: typeName
  };

  self.client.indices.deleteMapping(cfg).then(function() {
    cb(null)
  }, function(err) {
    console.error(err);
    cb(err);
  });  
}


// setAlias
ElasticsearchRepository.prototype.setAlias = function(index, alias, cb) {
  var self = this;
  var defer = q.defer();
  var cfg = {
    index:  index,
    name: alias
  };

  self.client.indices.putAlias(cfg).then(function() {
    if(cb)
      cb(null);
    else
      return defer.resolve();
  }, function(err) {
    console.error(err);     
    if(cb)
      cb(err);
    else 
     return defer.reject(err);
  });
  return defer.promise;
}

// getAlias
ElasticsearchRepository.prototype.getAlias = function(index, alias, cb) {
  var self = this;
  var defer = q.defer();
  var cfg = {
    index:  index,
    name: alias
  };

  self.client.indices.getAlias(cfg).then(function(alias) {
    if(cb)
      cb(alias);
    else
      return defer.resolve(alias);
  }, function(err) {
    console.error(err);      
    if(cb)
      cb(err);
    else 
     return defer.reject(err);
  });
  return defer.promise;
}

// deleteAlias
ElasticsearchRepository.prototype.deleteAlias = function(index, alias, cb) {
  var self = this;
  var defer = q.defer();
  var cfg = {
    index:  index,
    name: alias
  };

  self.client.indices.deleteAlias(cfg).then(function() {
    if(cb)
      cb(null);
    else
      return defer.resolve();
  }, function(err) {
    console.error(err);      
    if(cb)
      cb(err);
    else 
     return defer.reject(err);
  });
  return defer.promise;
}

// getInfo
ElasticsearchRepository.prototype.getInfo = function(cb) {
  var self = this;
  var defer = q.defer();

  self.client.info().then(function(result) {
    if(cb)
      cb(null, result);
    else
      return defer.resolve(result);
  }, function(err) {
    if(cb)
      cb(err);
    else 
      return defer.reject(err);
  });
  return defer.promise;
}

module.exports = new ElasticsearchRepository();
