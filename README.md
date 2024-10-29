# GSheetsORM
A lightweight yet powerful library to turn Google Sheets into a Object Relationship Mapper
Ou comment utiliser Google Sheets comme une base de données relationnelle ?

#Introduction



Google Sheets est un tableur. A ce titre il propose d'enregistrer la donnée dans des tableaux. 

Avec un peu d'organisation, on peut facilement le transformer en base de données relationnelle.

Une base de données relationnelle est organisée de façon à pouvoir stocker des informations de manière cohérente. 
Ainsi, un enregistrement dans la base est appelé un tuple ou enregistrement. 
En SQL, on parlera de ligne. Chaque ligne comporte plusieurs colonnes ou champs. Un ensemble de lignes s'appelle une table ou une relation.

On remarque alors une similitude évidente entre un tableur et une base de données relationnelle. En effet, un tableur est organisé de la façon suivante :

* La cellule (cell) est le plus petit élément du tableur
* La ligne (row) est un ensemble de une ou plusieurs cellules découpé en colonnes (columns)
* Une feuille (sheet) est un ensemble de lignes et colonnes
* Un classeur (spreadsheet) est un ensemble de feuilles





Par exemple, imaginons qu'on cherche à enregistrer nos personnages de jeux vidéos préférés. 

On crée alors un classeur (spreadsheet) qu'on appelle "Game characters".

Afin d'organiser nos personnages, on décide de créer une feuille (sheet) pour chaque type de jeu, ici RPG et FPS.

Dans la feuille RPG, on définit 4 colonnes, chacune correspondant à un attribut du personnage.

Enfin, on a ici 3 personnages, chacun étant décrit sur une ligne individuelle. C'est plus clair ?

Sheet explanations.png



GSheetsOrm.lib



GSheetsORM est une librairie Google Apps Script dont l'objectif est de permettre de lire et d'écrire des objets dans un classeur GSheets aussi simplement qu'avec un ORM classique. Voyons comment elle fonctionne.

La librairies est découpée en 3 fichiers :

* ORM_Read.gs
* ORM_Write.gs
* ORM_Utilities.gs

ORM_Read.gs



Deux méthodes sont à utiliser pour lire des objets depuis un sheet : readObjectsFromSheets et readObjectsFromSheet.

La premières prend un tableau de sheets en paramètres alors que la seconde ne prend qu'un sheet en entrée. Toutes les deux retournent un tableau d'objet tels que définis dans le sheet

ORM_read.png

ORM_Write.gs



La méthode writeObjectsOnSheet() permet d'écrire un tableau d'objets sur une sheet donnée. Elle prend trois paramètres en arguments :

* sheet    : le sheet sur lequel on veut écrire
* objects : un tableau d'objets à écrire
* options : un objet d'options (optionnel)
  * keys : un tableau de clefs correspondant aux clef de l'objet qu'il faut imprimer sur le sheet
  * nestedObject : si on veut afficher un objet nested, on donne la clef ici
  * nestedKeys   : un tableau de clefs correspondant aux clef du nestedObject qu'on veut imprimer

ORM_Utilities



Un ensemble de fonctions utiles pour travailler avec les namedRanges d'un sheet. Comportement assez proche de celui de ColumnTools (code source) 

Exemples d'utilisation



Pour lire des objets depuis une sheet "aSheet"

const spreadsheet = SpreadsheetApp.getActive()
const sheet       = spreadhseet.getSheetByName("aSheet")
const objects     = readObjectsFromSheet(sheet)
return objects

Pour écrire des objets sur la sheet "aSheet"

const spreadsheet = SpreadsheetApp.getActive()
const sheet       = spreadhseet.getSheetByName("aSheet")
const objects     = [{a:1,b:2,c:{foo:"z",bar:"y"}},{a:3,b:4,c:{foo:"w",bar:"v"}}]
const options     = {keys: ["a","b","c"], nestedObject: "c", nestedKeys: ["foo","bar"]}
return writeObjectsOnSheet(sheet, objects, options)x
