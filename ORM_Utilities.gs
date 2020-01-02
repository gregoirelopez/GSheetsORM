/**
* @author Gregoire Lopez
* A bunch a functions to work with a Spreadsheet or a sheet
**/

/**
* Refresh all Named Ranges on a given Spreadsheet
* @param  {Spreadsheet} - The spreadsheet you want to uodate
* @return {Spreadsheet} - The updated spreadsheet 
**/
function updateNamedRangesOnSpreadsheet(spreadsheet) {
  // We get all the sheets from the given spreadsheet
  return spreadsheet.getSheets()
  // We exclude all sheets which name starts with "#"
  .filter(function (sheet){return sheet.getName().slice(0, 1) !== "#"})
  // For each of those sheets
  .reduce(function(spreadsheet, sheet){
    // We update its named ranges
    updateNamedRangesOnSheet(sheet)
    // We return the spreadsheet for chaining
    return spreadsheet
  },spreadsheet) 
}

/**
* Refresh all Named Ranges on a given Sheet
* @param  {Sheet} - The sheet you want to update
* @return {Sheet} - The updated sheet
**/
function updateNamedRangesOnSheet(sheet){
  // We froze the first row = header
  sheet.setFrozenRows(1)
  // We get the parent spreadsheet of the sheet given in parameters
  // and we clean this sheet from its empty named ranges
  const spreadsheet = cleanNamedRanges(sheet).getParent()
  // We read the objects from the sheet
  const objects = readObjectsFromSheet(sheet)()
  // We get the range names from the keys of the first object in sheet 
  // (or an empty object if there is no object on sheet)
  const rangeNames = Object.keys(objects[0] || {})
  .map(
    function(key){
      // We process the key to remove any forbiden character
      return toJSFriendlyString(key)
    }
  )
  // We compute the size of the 
  const numRows    = objects.length
  const numColumns = rangeNames.length
  
  // If there is ligne to display,
  numRows > 0 
  // Then we create a namedRange for the whole content
  ? spreadsheet.setNamedRange(sheet.getName(), sheet.getRange(2,1,numRows,numColumns)) 
  // We log an error otherwise
  : Logger.log("refreshSheetNameRanges:> No range to name")
  
  // For each range name, we create the corresponding namedRange
  rangeNames.map(function (name, index) {
    spreadsheet.setNamedRange(name, sheet.getRange(2,index+1,numRows))
  }) 
  // We return the sheet for chaining
  return sheet
}

/**
* Clean named ranges referring to a deprecated range
* @param  {Spreadsheet||Sheet} - The spreadsheet or sheet you want to clean
* @return {Spreadsheet||Sheet} - The updated spreadsheet or sheet
**/
function cleanNamedRanges(object){
  // On récupère tous les namedRanges de l'objet (sheet ou spreadsheet) et on les parcourt
  return object.getNamedRanges().reduce(function(object,namedRange){
    // Si le namedRange ne fait pas référence à un range existant, on le supprime
    namedRange.getRange() ? null : namedRange.remove()
    // On renvoie l'object pour chainage pour chainage
    return object
  },object)
}

/**
* Reset all named ranges
* @param  {Spreadsheet||Sheet} - The spreadsheet or sheet you want to reset
* @return {Spreadsheet||Sheet} - The updated spreadsheet or sheet
**/
function resetNamedRanges(object){
  // On récupère tous les namedRanges de l'objet (sheet ou spreadsheet) et on les parcourt
  return object.getNamedRanges().reduce(function(object,namedRange){
    // On supprime le namedRange
    namedRange.remove()
    // On renvoie l'object pour chainage pour chainage
    return object
  },object)
}

/**
* Reset a sheet from its content, notes and namedRanges
* @param  {Sheet} - The sheet you want to reset
* @return {Sheet} - The reset sheet
**/
function resetSheet(sheet){
  // We return a cleaned version of the given sheet
  return resetNamedRanges(sheet).clean().cleanNotes()
}

/**
* Reset a spreadsheet from its sheets, content, notes and namedRanges
* @param  {Spreadsheet} - The sheet you want to reset
* @return {Spreadsheet} - The reset spreadsheet containing a blank 'DEFAULT' sheet
**/
function resetSpreadsheet(spreadsheet){
  // We reset all named Ranges
  return resetNamedRanges(spreadsheet)
  // We add a new 'DEFAULT' sheet in the spreadsheet
  .insertSheet("DEFAULT")
  // We get all the sheets that are not 'DEFAULT'
  .getParent().getSheets().filter(function(sheet){return sheet.getName() != "DEFAULT" ? true : false})
  // We iterate on those sheets
  .reduce(function(spreadsheet,sheet){
    // We delete the current sheet
    spreadsheet.deleteSheet(sheet)
    // We return the current spreadsheet for chaining
    return spreadsheet
  },spreadsheet)
}

/**
* Turns user input string into a JS Friendly string
* Pretty usefull when you want to des
**/
function toJSFriendlyString(string) {
  return string.replace(/\s/g,"_") //replace spaces with _
  .replace(/[^0-9a-zA-Z_]/g,"")    //get rid of non alphanum or _ 
  .replace(/^([0-9])/,"_$1")       //if starts with number, put underscore in front
  .replace(/^(true|false)/i,"_$1") //if starts with true/false, put underscore in front
}

