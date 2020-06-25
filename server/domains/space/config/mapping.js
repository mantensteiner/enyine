
module.exports = {
  index_name: "space",
  type_names: ["space"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "space": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "txnId": {"type" : "keyword" },
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "missionStatement" : {"type" : "text" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "description": { "type" : "text" },
      "users": {
        "properties" : {
          "id" : {"type" : "keyword"},
          "username" : {"type" : "keyword" },
          "admin" : {"type" : "boolean" },
        }
      },
      // depricated, now provided as system wide domain 
      /*"units": {
        "properties" : {
          "id": {"type" : "string" },
          "name" : {
            "type" : "string",
            "fields": {
              "raw": { "type": "string" }
            }
          },
          "symbol" : {"type" : "string" },
          "factors": {
            "properties" : {
              "factor" : {"type" : "integer" },
              "symbol" : {"type" : "string" }
            }
          }
        }
      },*/
      "status": {
        "properties" : {
          "id": {"type" : "keyword" },
          "sourceId": {"type" : "keyword" },
          // human readable id
          "key": {"type" : "keyword" },
          "name" : {
            "type" : "text",
            "fields": {
              "raw": { "type": "keyword" }
            }
          },
          "order" : {"type" : "integer"},
          "limit" : {"type" : "integer"},
          "active" : {"type" : "integer"}
        }
      },
      "priorities": {
        "properties" : {
          "id": {"type" : "keyword" },
          "sourceId": {"type" : "keyword" },
          // human readable id
          "key": {"type" : "keyword" },
          "name" : {
            "type" : "text",
            "fields": {
              "raw": { "type": "keyword" }
            }
          },
          "order" : {"type" : "integer"},
          "active" : {"type" : "integer"}
        }
      }
    }
  }
}
