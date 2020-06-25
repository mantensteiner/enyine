
module.exports = {
  index_name: "bookmark",
  type_names: ["bookmark"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "bookmark": {
    bookmark: {
      "_meta" : {
        "version" : "1"
      },
      properties : {
        "id": {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "userId": {"type" : "string", "index" : "not_analyzed", "doc_values": true }, // private
        "spaceId": {"type" : "string", "index" : "not_analyzed", "doc_values": true }, // public in space
        "name" : {
          "type" : "string",
          "fields": {
            "raw": { "type": "string", "index": "not_analyzed", "doc_values": true }
          }
        },
        "uri" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "createdOn" : {"type" : "date", "doc_values": true },
        "modifiedOn" : {"type" : "date", "doc_values": true },
        "createdBy" : {"type" : "string", "index" : "not_analyzed", "doc_values": true },
        "modifiedBy" : {"type" : "string", "index" : "not_analyzed", "doc_values": true }
      }
    }
  }
}
