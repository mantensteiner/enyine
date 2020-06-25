
module.exports = {
  index_name: "billing",
  type_names: ["plan","payment","status"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "billing": {
    plan: {
      properties : {
        "id": {"type" : "keyword"  },
        "name": {"type" : "text" }, // Small, Medium,...
        "type": {"type" : "keyword" }, // monthly, annual
        "price": {"type" : "integer" },
        "projects": {"type" : "integer" },
        "currency": {"type" : "keyword" }
      }
    },
    payment: {
      properties : {
        "id": {"type" : "keyword" },
        "name": {"type" : "text" } // Paypal, Card (Stripe)
      }
    },
    status: {
      properties : {
        "id": {"type" : "keyword" },
        "name" : {"type" : "text" }
      }
    }
  }
}
