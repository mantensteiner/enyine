
module.exports = {
  index_name: "message",
  type_names: ["message"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "message": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "spaceId": {"type" : "keyword" },
      
      // key to classify the message, e.g. system, comment, ...
      "typeId" : {"type" : "keyword"},
      
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword"},
      "modifiedBy" : {"type" : "keyword"},
      "content" : {"type" : "text" },
      "relations": {
        "properties" : {
          "id" : {"type" : "keyword"},
          "entity" : {"type" : "keyword"}
        }
      },
      "shares": {
        "properties" : {
          "id" : {"type" : "keyword"},
          "username" : {"type" : "keyword"}
        }
      },
      "tags": {
        properties: {
          "id": {"type" : "keyword" },
          "createdOn" : { "type" : "date" },
          "createdBy" : { "type" : "keyword"},
          "inherited": {
            properties: {
              "id": {"type" : "keyword"},
              // different types can be tagged, eg. items, values, messages, notes,...
              "typeId": { "type" : "keyword" }, 
              "createdOn" : { "type" : "date" },
              "createdBy" : { "type" : "keyword" }
            }
          },
          "typeId": {"type" : "keyword"},
          "classId": {"type" : "keyword"},
          "keyId": {"type" : "keyword"},
          "privileges": {
            properties: {
              "userId": {"type" : "keyword"},
              "r": {"type" : "boolean" },
              "w": { "type" : "boolean"  }, 
              "d" : { "type" : "boolean" },
              "s" : { "type" : "boolean" }
            }
          }
        }
      }
    }
    
  }
}
