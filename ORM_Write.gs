/**
* @author Gregoire Lopez
* A bunch a functions to write objects to a Sheet
**/

/**
* Write a list of objects on a given sheet.
* Some options can be added to specify the object type, object keys, nested object and nested object keys 
* @param  {Sheet}    sheet           - The name of the sheet you want to print the objects on
* @param  {[Object]} objects         - An array of objects to print
* @param  {Options}  options         - (optional) An options object 
{
  keys:["k1","k2",...,"kn"],
  nestedObject:"..", 
  nestedKeys:".."
}
* @return {Sheet}                    The sheet we wrote the objects on
**/
function writeObjectsOnSheet (sheet, objects, options) {
  // If options is not given in parameters we initialise it
  options = options || {}
  
  const nested = options.nestedObject ? pickFirstExistingNestedObjectFromObjects(options.nestedObject, objects) : null
  
  const opts = {
    // If type is not given in options, the type is the name of the sheet
    //type         : (options.type || sheet.getName()).concat(options.nestedObject ? "_" + options.nestedObject : ""),
    // If keys are not given in options, we get all the keys available in the object
    keys         : options.keys  || Object.keys(objects[0] || [{error:"ORM_WriteOnSheet:> No object given"}]),
    // If no nestedObject is given in options, we do nothing
    nestedObject : options.nestedObject || null,
    // If the nestedObject exists
    nestedKeys   : nested ? 
        // If nestedKeys are given in options,
        (options.nestedKeys 
         // Then, we copy those nestedKeys
         ? options.nestedKeys 
         // Else, we read all the keys from nestedObject   
         : Object.keys(nested)) 
    : false,
  }
  // We clear the sheet and get its parent spreadsheet
  const spreadsheet = sheet.clear().clearNotes().getParent()
  
  const header = opts.keys.concat(nested ? 
                                  opts.nestedKeys.map(function (nestedKey){
                                    return opts.nestedObject+"_"+nestedKey})
                                  : []   ) 
  // We create the array to write, starting with its header
  const arrayToWrite = [header]
  // We add the proper objects (with dates formated to DateString()) to that array to print
  .concat(objectsToArray(formatDatesOnObjects(objects), opts.keys, opts.nestedObject, opts.nestedKeys))
  
  // Create and printe the result range
  sheet.getRange(1,1,arrayToWrite.length, arrayToWrite[0].length).setValues(arrayToWrite)
  // We refresh the named Ranges on Sheet and we return the sheet for chaining
  return updateNamedRangesOnSheet(sheet)
}

function pickFirstExistingNestedObjectFromObjects(nestedObject, objects){
  const nestedObjects = objects.reduce(function(acc, object){
    // Si object a un nested object, on le renvoie
    acc = acc.concat(object[nestedObject] || [])
    return acc
  },[])
  return nestedObjects.length > 0 ? nestedObjects[0] : null
} 

function formatDatesOnObjects(objects){
  return objects.map(formatDatesOnObject)
}

function formatDatesOnObject(object){
  return Object.keys(object).reduce(formatDateOnObjectValue(object),{})
}

function formatDateOnObjectValue(object){
  return function (acc,key) {
    acc[key] = object[key] instanceof Date ? object[key].toDateString() : object[key]
    return acc
  }
}


/**
* Return an Array that contains a list of [object,child]
* This Array could be directly displayed on a Sheet
* @param {[Object]} objects      - A list of object you want to turn into arrays
* @param {[String]} objectKeys   - A list of attribute in objects you want to print
* @param {String}   childkey     - Optional, if you want to print a child object next to object, give its key here
* @param {[String]} childkey     - Optional, if childKey is given, childKeys contains the keys belonging to child object
* @param {[String]}              a list of Array ready to be displayed on sheet
**/
function objectsToArray(objects, objectKeys, childKey, childKeys){
  return objects.reduce(function (acc, object) {
    return acc.concat(objectToArray(object,objectKeys, childKey, childKeys))
  },[])
}

/**
* Return an Array that contains either an [object] displayed as a string array
* or a list of [[object,child1],[object,child2],[object,child3]]
* This Array could be directly displayed on a Sheet
* @param {Object} object         - A list of object you want to turn into arrays
* @param {[String]} objectKeys   - A list of attribute in objects you want to print
* @param {String}   childkey     - Optional, if you want to print a child object next to object, give its key here
* @param {[String]} childkey     - Optional, if childKey is given, childKeys contains the keys belonging to child object
* @param {[String]}              an Array representing the given object ready to be printed on sheet
**/
function objectToArray(object, objectKeys, childKey, childKeys){
  return (childKey ? objectExtendedToArray(object, objectKeys, childKey, childKeys) : [ objectAloneToArray(object, objectKeys) ])
}

/**
* Turns an object into a line of its values
**/
function objectAloneToArray (object, objectKeys){
  return objectKeys.map(function (key){
    return (object[key] ? (typeof object[key] =="object" ? JSON.stringify(object[key]) : object[key] )  : "")            
  })
}

/**
* Whether the childKey is a single value or an array, we launch the corresponding function
**/
function objectExtendedToArray (object, objectKeys, childKey, childKeys) {
  return object[childKey] 
  ? ( Array.isArray(object[childKey]) 
     ? objectAndChildrenToArray(object, objectKeys, childKey, childKeys) 
     : objectAndChildToArray(object, objectKeys, childKey, childKeys)
    ) 
  : [objectAloneToArray(object,objectKeys.concat(childKeys))]
}

/**
* If the child object is an array
**/
function objectAndChildrenToArray(object, objectKeys, childKey, childKeys){
  return object[childKey].map(function (child){ 
    return objectAloneToArray(object, objectKeys).concat(objectAloneToArray(child, childKeys))
  })
}

/**
* if the child object is a single object
**/
function objectAndChildToArray(object, objectKeys, childKey, childKeys) {
  return [objectAloneToArray(object, objectKeys).concat(objectAloneToArray(object[childKey], childKeys))]
}

