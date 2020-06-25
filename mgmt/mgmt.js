
// Set elasticsearch template
if(process.argv.indexOf("-settemplate") !== -1) {
  var indexName = process.argv[process.argv.indexOf("-settemplate") + 1];
  require('./elasticsearch/setTemplate')(indexName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'settemplate' for index '" + indexName + "'");
    exit();
  });
}

// Delete elasticsearch template
if(process.argv.indexOf("-deletetemplate") !== -1) {
  var indexName = process.argv[process.argv.indexOf("-deletetemplate") + 1];
  require('./elasticsearch/deleteTemplate')(indexName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'deletetemplate' for index '" + indexName + "'");
    exit();
  });
}

// Create index with alias
if(process.argv.indexOf("-createindex") !== -1) {
  var alias = process.argv[process.argv.indexOf("-createindex") + 1];
  var indexName = process.argv[process.argv.indexOf("-createindex") + 2];
  if(!indexName)
    indexName = alias+'.1';
  
  require('./elasticsearch/createIndex')(indexName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'createindex' for index '" + indexName + "'");
        
    // Check for 'alias' flag to create alias 
    if(process.argv.indexOf("-alias") !== -1 && !err) {
      require('./elasticsearch/setAlias')(indexName, alias, function(err) {
        err ? console.error(err) : console.log("Finished operation 'setAlias' for index '" + indexName + "'");
        exit();   
      });
    } 
    else {
      exit();       
    }
  });
}

// Delete index 
if(process.argv.indexOf("-deleteindex") !== -1) {
  var indexName = process.argv[process.argv.indexOf("-deleteindex") + 1];
  require('./elasticsearch/deleteIndex')(indexName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'deleteindex' for index '" + indexName + "'");
    exit();   
  });
}

// Set alias  
if(process.argv.indexOf("-setalias") !== -1) {
  var indexName = process.argv[process.argv.indexOf("-setalias") + 1];
  var alias = process.argv[process.argv.indexOf("-setalias") + 2];
  require('./elasticsearch/setAlias')(indexName, alias, function(err) {
    err ? console.error(err) : console.log("Finished operation 'setalias' for index '" + indexName + "'");
    exit();    
  });
}

// Delete alias 
if(process.argv.indexOf("-deletealias") !== -1) {
  var indexName = process.argv[process.argv.indexOf("-deletealias") + 1];
  var alias = process.argv[process.argv.indexOf("-deletealias") + 2];
  require('./elasticsearch/deleteAlias')(indexName, alias, function(err) {
    err ? console.error(err) : console.log("Finished operation 'deletealias' for index '" + indexName + "'");
    exit();
  });
}


// Set template to update 
/*
if(process.argv.indexOf("-updatemapping") !== -1) {
  var alias = process.argv[process.argv.indexOf("-updatemapping") + 1];
  var typeName = process.argv[process.argv.indexOf("-updatemapping") + 2];
  require('./elasticsearch/setTemplate')(alias, typeName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'updatemapping' for index '" + alias + "'");
    exit();
  });
}*/

// Set mapping
if(process.argv.indexOf("-setmapping") !== -1) {
  var domainName = process.argv[process.argv.indexOf("-setmapping") + 1];
  var indexName = process.argv[process.argv.indexOf("-setmapping") + 2];
  var typeName = process.argv[process.argv.indexOf("-setmapping") + 3];
  require('./elasticsearch/setMapping')(domainName, indexName, typeName, function(err) {
    err ? console.error(err) : console.log("Finished operation 'setmapping' for index '" + indexName + "'");
    exit();
  });
}

// // Migrate type to index
// if(process.argv.indexOf("-migratetypetoindex") !== -1) {
//   var i = process.argv.indexOf("-migratetypetoindex");
//   var oldIndex = process.argv[i+1];
//   var oldType = process.argv[i+2];
//   var newIndex = process.argv[i+3];
//   var newType = process.argv[i+4];
//   require('./maintenance/esTypeToIndex')(oldIndex, oldType, newIndex, newType, function(err) {
//     err ? console.error(err) : console.log("Finished operation 'migratetypetoindex' for new index '" + newIndex + "', new type '" + newType + "'");
//     exit();
//   });
// }

// Migrate type to index
if(process.argv.indexOf("-isready") !== -1) {
  var i = process.argv.indexOf("-isready");
  require('./elasticsearch/isReady')(function(err) {
    err ? console.error(err) : console.log("Finished operation 'isready'");
    exit();
  });
}

function exit() {
  process.exit();
}