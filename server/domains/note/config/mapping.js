
module.exports = {
  index_name: "note",
  type_names: ["note"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "note": {
    properties : {
      "id": {"type" : "keyword"  },
      "type": {"type" : "keyword" },

      "spaceId": {"type" : "keyword"  },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "createdOn" : {"type" : "date"  },
      "modifiedOn" : {"type" : "date"  },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "content" : {"type" : "text" },
      "shares": {
        "properties" : {
          "id" : {"type" : "keyword" },
          "username" : {"type" : "keyword" }
        }
      },
      "private" :  {"type": "boolean" },
      "tags": {
        properties: {
          "id": {"type" : "keyword" },
          "createdOn" : { "type" : "date" },
          "createdBy" : { "type" : "keyword" },
          "inherited": {
            properties: {
              "id": {"type" : "keyword" },
              // different types can be tagged, eg. items, values, messages, notes,...
              "typeId": { "type" : "keyword"  }, 
              "createdOn" : { "type" : "date" },
              "createdBy" : { "type" : "keyword" }
            }
          },
          "typeId": {"type" : "keyword" },
          "classId": {"type" : "keyword" },
          "keyId": {"type" : "keyword" },
          "privileges": {
            properties: {
              "userId": {"type" : "keyword" },
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
