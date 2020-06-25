
module.exports = {
  index_name: "int_slack",
  type_names: ["enyine", "github"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "int_slack": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "spaceId": {"type" : "keyword" },
      "webHookUrl": {"type" : "keyword" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "postNewValue" : {"type" : "boolean" },

      // github
      "postIssueComment" : {"type" : "boolean" },
      "postIssuePush" : {"type" : "boolean" },

    }
  }
}
