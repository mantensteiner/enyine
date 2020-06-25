
module.exports = {
  index_name: "notification",
  type_names: ["notification"],
  number_of_shards: 4,
  number_of_replicas: 0,  
  "notification": {
    properties: {
      "id": {"type": "keyword" },
      "type": {"type": "keyword" },
      "spaceId": {"type": "keyword" },
      "timestamp": {"type": "date" },
      "name": {"type": "keyword" },
      "typeId": {"type": "keyword" },
      "description": {"type": "keyword" }
      // ToDo
    }  
  }
}
