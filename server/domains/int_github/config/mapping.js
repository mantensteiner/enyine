
module.exports = {
  index_name: "int_github",
  type_names: ["repository"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "int_github": {
    properties : {
      "id": {"type" : "keyword" },
      "type": {"type" : "keyword" },

      "spaceId": {"type" : "keyword" },
      "createdOn" : {"type" : "date" },
      "modifiedOn" : {"type" : "date" },
      "createdBy" : {"type" : "keyword" },
      "modifiedBy" : {"type" : "keyword" },
      "repositoryFullName": {"type" : "keyword" },
      "repositorySecret": {"type" : "keyword" },
      "eventActiveIssue" : {"type" : "boolean" },
      "eventActiveIssueComment" : {"type" : "boolean" },
      "eventActivePush" : {"type" : "boolean" },
      "eventActivePushTimeUnitId" : {"type" : "keyword" }
    }  
  }
}
