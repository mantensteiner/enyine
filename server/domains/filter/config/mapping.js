
module.exports = {
  index_name: "filter",
  type_names: ["filter"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "filter": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },
      
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
      "filter": {
        "properties" : {
          "text" : {"type" : "keyword" },
          "itemTypeIds" : {"type": "keyword"  }
        }
      }
    }
  }
}
