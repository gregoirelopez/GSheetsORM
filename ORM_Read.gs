/**
* @author Gregoire Lopez
* A bunch a functions to read objects from a Sheet
**/

/**
* Returns an object from a string entry & corresponding fields
* @param  {[String]} values - An array of values that will be associated to given keys to create an object where keys=values 
* @param  {[String]} keys   - An array of keys that will be the keys of the returned object
* @return {Object}          An object where keys = keys & values = entry
*/
function reduceArrayToObjectFromObjectKeys(values){
  return function (keys) {
    return function (mapping) {
      return objectMapper(keys.reduce(function (acc,key,index) {
          acc[key] =  toJSON(values[index]) || values[index]
          return acc
        },{})
      )(mapping)
    }
  }
}

/**
* Returns a list of flattened objects from a given range
* @param  {Range} range  - The sheet to read objects from 
* @return {[Object]}     A list of objects read from given Sheet 
**/
function readObjectsFromRange(range){
  return function (mapping) {
    const values = range.getValues()
    // First row contains object keys
    const keys   = values[0]
    // Proper object values start at line number 2
    const data   = values.slice(1)
    return data.map(function (entry){
      return reduceArrayToObjectFromObjectKeys(entry)(keys)(mapping)    
    })
  }
}

/**
* Returns a list of flattened objects from a given sheet
* @param  {Sheet} sheet  - The sheet to read objects from 
* @return {[Object]}      -A list of objects read from given sheet 
**/
function readObjectsFromSheet(sheet) {
  return function (mapping) {
    return readObjectsFromRange(sheet.getDataRange())(mapping)
  }
}

/**
* Reads Objects from multiple sheets. The content in sheets must match a similar object type 
* @param  {Sheet} sheet  - The sheet to read objects from 
* @return [{Object}]     - A list of objects read from given sheets 
**/
function readObjectsFromSheets(sheets) {
  return function (mapping){
    return sheets.reduce(function (acc, sheet){
      acc = acc.concat(readObjectsFromSheet(sheet)(mapping))
      return acc  
    },[])
  }
}

/**
* Return an object whether a string is a JSON or not
* @param  String string - The JSON as a string
* @return Object        - the object described in JSON string, null instead
**/
function toJSON(string){
  var json = null
  try {
    json = JSON.parse(string)
  }
  catch(e){}
  return json
}

/**
* Return a new version of object given in parameters. 
* @param  String string - The JSON as a string
* @return Object        - the object described in JSON string, null instead
**/
function objectMapper(object){
  return function (mapping) {
    return mapping ?
      Object.keys(mapping).reduce(function(acc, key){
        acc[key] = object[mapping[key]]
        return acc
      },{})
    : object
  }
}



