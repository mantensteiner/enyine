
module.exports = {
  index_name: "tag",
  type_names: ["tag"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "tag": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "sourceId": {"type" : "keyword" },
      "spaceId": {"type" : "keyword" },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "relations": {
        properties: {
          "id": {"type" : "keyword" },
          // different types can be tagged, eg. topics, values, messages, notes,...
          "typeId": { "type" : "keyword"  }, 
          "createdOn" : { "type" : "date" },
          "createdBy" : { "type" : "keyword" }
        }
      },
      // content (user tagging), system (calculated, special widgets)
      "typeId": {"type" : "keyword" },
      // '', internal, customer, lead, share, rating, 
      "classId": {"type" : "keyword" },
      // foreign id (eg userId) 
      "keyId": {"type" : "keyword" },
      
      // in the tagged object also the 'privileges' and 'inherited' objects are embeddded
      
      // tag-inheritance: topics are parent, which inherit to values,messages,ressources,...
      // data-duplication in domains, but nececssary for analytics, search & security policies+sharing
      
      // privileges: implement a 'tag'-policy and individual 'sharing'-feature via tags,
      // because tags are inherited to sub-objects (values, ressources, messages,...)
      // and therefore this system can be used for the security must also inherit on related objects
      
      // inherited: {type, id} are embedden in tag-relation to assure that inherited tags can be kept
      // in sync with the parent (eg. value-object inherits tags from topic)
      
    }
  }
}
