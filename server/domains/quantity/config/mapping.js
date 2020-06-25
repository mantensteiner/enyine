
module.exports = {
  index_name: "quantity",
  type_names: ["quantity"],
  number_of_shards: 4,
  number_of_replicas: 0,
  "quantity": {
    properties : {
      "id": {"type" : "keyword"  },
      "type": {"type" : "keyword"  },
      "txnId": {"type" : "keyword"  },
      "system": {"type" : "boolean"  },

      "createdOn" : {"type" : "date"  },
      "createdBy" : {"type" : "keyword" },
      "modifiedOn" : {"type" : "date"  },
      "modifiedBy" : {"type" : "keyword" },
      
      // name of the datatype, e.g. float, double, bool, date,...        
      // possible values (maps to fieldnames in other indices,types like 'value','target',...)
      /*
      "nr_float"
      "nr_double"
      "nr_long"
      "nr_integer"
      "nr_short"
      "nr_byte"
      "val_bool"
      "val_date"
      "val_geopoint"
      "val_ip"
      "val_keyword"
      "val_text"*/
      "dataTypeKey": {"type" : "keyword"  },
      
      // physical quantitiy, e.g. weight
      "name" : {
        "type" : "text",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      
      // units for the quantity, e.g. kg,lbs,g,mg,... 
      // the unit with factor 1 is the reference unit (SI-unit)
      "units": {
        "properties" : {
          "symbol" : {"type" : "keyword" },
          "desc" : {"type" : "keyword" },
          "factor" : {"type" : "half_float" }
        }
      }
    }
  }
}
