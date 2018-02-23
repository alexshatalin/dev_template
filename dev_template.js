document.addEventListener('DOMContentLoaded', function(event){
	(function(){
		"use strict";  
		//Make global variables
		let devObj = {};
		//devObj.tmplVisibility = false;
		//devObj.modalVisibility = false;
		//devObj.tmplZindex = false;
		devObj.tmplFragment = document.createDocumentFragment();
		//devObj.fieldTimer = null;
		//devObj.storageArray = [];
		//devObj.imageArray = [];
		//devObj.cssPropArray = ['height', 'background-size', 'background-image'];
		devObj.head = document.getElementsByTagName('head')[0];
		devObj.bodyTag = document.body.firstChild;
		//devObj.savedStorage = JSON.parse(sessionStorage.getItem('templateContainer'));
		//devObj.counter = 0;
		devObj.style = null;

		// Basic app functions
		function setAttributes(element, attrs) {
			for( let key in attrs ){
				element.setAttribute(key, attrs[key]);
			}
		}

		function insertAfter(newNode, referenceNode) {
		    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}

		function addElement(element, attributes, insertLocation, referenceNode) {

			let newElement = document.createElement(element);

			if( typeof attributes === 'function' ) {
				attributes(newElement);
			} 

			if( typeof insertLocation === 'function' ) {
				insertLocation(newElement, referenceNode);
			}
		}

		function hideElement(element){
			document.getElementById(element).style.display = 'none';
		}

		function showElement(element){
			document.getElementById(element).style.display = 'block';
		}

		// ---------------------------------------------------------------------------------------------------
		let dbGlobals = {}; // Store all indexedDB related objects in a global object called "dbGlobals".
		dbGlobals.db = null; // The database object will eventually be stored here.    
		dbGlobals.description = "This database is used to store files locally."; // The description of the database.
		dbGlobals.name = "localFileStorage"; // The name of the database.
		dbGlobals.version = 1; // Must be >= 1. Be aware that a database of a given name may only have one version at a time, on the client machine.     
		dbGlobals.storeName = "fileObjects"; // The name of the database's object store. Each object in the object store is a file object.
		dbGlobals.message = ""; // When useful, contains one or more HTML strings to display to the user in the 'messages' DIV box.
		dbGlobals.empty = true; // Indicates whether or not there's one or more records in the database object store. The object store is initially empty, so set this to true.


		function displayMessage(message) {
		  document.getElementById('_dbActionDialogue_').innerHTML = message;
		} // displayMessage

		// ---------------------------------------------------------------------------------------------------

		function openDB() {
		  console.log("openDB()");
		  displayMessage("<p>Your request has been queued.</p>"); // Normally, this will instantly blown away by the next displayMessage().

		  if (!window.indexedDB.open) {
		    console.log("window.indexedDB.open is null in openDB()");
		    return;
		  } // if

		  try {
		    var openRequest = window.indexedDB.open(dbGlobals.name, dbGlobals.version); // Also passing an optional version number for this database.

		    openRequest.onerror = function(evt) {
		      console.log("openRequest.onerror fired in openDB() - error: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
		    } // Some browsers may only support the errorCode property.
		    openRequest.onblocked = openDB_onblocked; // Called if the database is opened via another process, or similar.
		    openRequest.onupgradeneeded = openDB_onupgradeneeded; // Called if the database doesn't exist or the database version values don't match.
		    openRequest.onsuccess = openDB_onsuccess; // Attempts to open an existing database (that has a correctly matching version value).        
		  } catch (ex) {
		    console.log("window.indexedDB.open exception in openDB() - " + ex.message);
		  }
		} // openDB

		// ---------------------------------------------------------------------------------------------------

		function openDB_onblocked(evt) {
		  console.log("openDB_onupgradeneeded()");

		  var message = "<p>The database is blocked - error code: " + (evt.target.error ? evt.target.error : evt.target.errorCode) + "</p>";
		  message += "</p>If this page is open in other browser windows, close these windows.</p>";

		  displayMessage(message);
		}

		// ---------------------------------------------------------------------------------------------------

		function openDB_onupgradeneeded(evt) {
		  console.log("openDB_onupgradeneeded()");
		  displayMessage("<p>Your request has been queued.</p>"); // Normally, this will instantly be blown away be the next displayMessage().

		  var db = dbGlobals.db = evt.target.result; // A successfully opened database results in a database object, which we place in our global IndexedDB variable.

		  if (!db) {
		    console.log("db (i.e., evt.target.result) is null in openDB_onupgradeneeded()");
		    return;
		  } // if

		  try {
		    db.createObjectStore(dbGlobals.storeName, {
		      keyPath: "ID",
		      autoIncrement: true
		    }); // Create the object store such that each object in the store will be given an "ID" property that is auto-incremented monotonically. Thus, files of the same name can be stored in the database.
		  } catch (ex) {
		    console.log("Exception in openDB_onupgradeneeded() - " + ex.message);
		    return;
		  }

		  dbGlobals.message = "<p>The database has been created.</p>"; // A means of communicating this information to the openDB_onsuccess handler.
		} // openDB_onupgradeneeded

		// ---------------------------------------------------------------------------------------------------

		function openDB_onsuccess(evt) {
		  console.log("openDB_onsuccess()");
		  displayMessage("<p>Your request has been queued.</p>"); // Normally, this will be instantly blown away by the next displayMessage().

		  var db = dbGlobals.db = evt.target.result; // A successfully opened database results in a database object, which we place in our global IndexedDB variable.

		  if (!db) {
		    console.log("db (i.e., evt.target.result) is null in openDB_onsuccess()");
		    return;
		  } // if

		  dbGlobals.message += "<p>The database has been opened.</p>";
		  displayMessage(dbGlobals.message);
		  dbGlobals.message = ""; // The message has been delivered to the user, "zero" it out just to be safe.
		  document.getElementById('_dbActions_').className += ' _opened';
		} // openDBsuccess

		// ---------------------------------------------------------------------------------------------------

		function handleFileSelection(evt) {
		  console.log("handleFileSelection()");

		  var files = evt.target.files; // The files selected by the user (as a FileList object).
		  if (!files) {
		    displayMessage("<p>At least one selected file is invalid - do not select any folders.</p><p>Please reselect and try again.</p>");
		    return;
		  }

		  var db = dbGlobals.db;
		  if (!db) {
		    console.log("db (i.e., dbGlobals.db) is null in handleFileSelection()");
		    return;
		  } // if

		  try {
		    var transaction = db.transaction(dbGlobals.storeName, (IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : 'readwrite')); // This is either successful or it throws an exception. Note that the ternary operator is for browsers that only support the READ_WRITE value.
		  } // try
		  catch (ex) {
		    console.log("db.transaction exception in handleFileSelection() - " + ex.message);
		    return;
		  } // catch

		  transaction.onerror = function(evt) {
		    console.log("transaction.onerror fired in handleFileSelection() - error code: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
		  }
		  transaction.onabort = function() {
		    console.log("transaction.onabort fired in handleFileSelection()");
		  }
		  transaction.oncomplete = function() {
		    console.log("transaction.oncomplete fired in handleFileSelection()");
		  }

		  try {
		    var objectStore = transaction.objectStore(dbGlobals.storeName); // Note that multiple put()'s can occur per transaction.

		    for (var i = 0, file; file = files[i]; i++) {
		      var putRequest = objectStore.put(file); // The put() method will update an existing record, whereas the add() method won't.
		      putRequest.onsuccess = function() {
		        dbGlobals.empty = false;
		      } // There's at least one object in the database's object store. This info (i.e., dbGlobals.empty) is used in displayDB().
		      putRequest.onerror = function(evt) {
		        console.log("putRequest.onerror fired in handleFileSelection() - error code: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
		      }
		    } // for            
		  } // try
		  catch (ex) {
		    console.log("Transaction and/or put() exception in handleFileSelection() - " + ex.message);
		    return;
		  } // catch
		  	document.getElementById('_fileSelector_').style.display = 'none'; // An attempt has already been made to select file(s) so hide the "file picker" dialog box.
			document.getElementById('_displayDb_').style.display = 'block';
			document.getElementById('_deleteDb_').style.display = 'block';
		} // handleFileSelection

		// ---------------------------------------------------------------------------------------------------

		function populateDB() {
		  console.log("populateDB()");

		  if (!dbGlobals.db) {
		    displayMessage("<p>The database hasn't been opened/created yet.</p>");
		    console.log("db (i.e., dbGlobals.db) is null in populateDB()");
		    return;
		  }

		  document.getElementById('_fileSelector_').style.display = "block"; // Now that we have a valid database, allow the user to put file(s) in it.

		  var message = "<p>Using the below <strong>Browse</strong> button, select one or more files to store in the database.</p>";
		  message += "<p>Then, click the <strong>Display DB</strong> button to display what's currently in the database.</p>";
		  displayMessage(message);
		} // populateDB

		// ---------------------------------------------------------------------------------------------------

		function displayDB() {
		  console.log("displayDB()");

		  var db = dbGlobals.db;

		  if (!db) {
		    displayMessage("<p>There's no database to display.</p>");
		    console.log("db (i.e., dbGlobals.db) is null in displayDB()");
		    return;
		  } // if

		  try {
		    var transaction = db.transaction(dbGlobals.storeName, (IDBTransaction.READ_ONLY ? IDBTransaction.READ_ONLY : 'readonly')); // This is either successful or it throws an exception. Note that the ternary operator is for browsers that only support the READ_ONLY value.
		  } // try
		  catch (ex) {
		    console.log("db.transaction() exception in displayDB() - " + ex.message);
		    return;
		  } // catch

		  try {
		    var objectStore = transaction.objectStore(dbGlobals.storeName);

		    try {
		      var cursorRequest = objectStore.openCursor();

		      cursorRequest.onerror = function(evt) {
		        console.log("cursorRequest.onerror fired in displayDB() - error code: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
		      }

		      var fileListHTML = "<p><strong>File(s) in database:</strong></p><ul style='margin: -0.5em 0 1em -1em;'>"; // Be aware that if the database is empty, this variable never gets used.

		      cursorRequest.onsuccess = function(evt) {
		        console.log("cursorRequest.onsuccess fired in displayDB()");

		        var cursor = evt.target.result; // Get an object from the object store.
		        console.log(cursor);
		        if (cursor) {
		          dbGlobals.empty = false; // If we're here, there's at least one object in the database's object store (i.e., the database is not empty).
		          fileListHTML += "<li>" + cursor.value.name;
		          fileListHTML += "<p style='margin: 0 0 0 0.75em;'>" + cursor.value.lastModifiedDate + "</p>";
		          fileListHTML += "<p style='margin: 0 0 0 0.75em;'>" + cursor.value.size + " bytes</p>";
		          cursor.continue(); // Move to the next object (that is, file) in the object store.
		        } else {
		          fileListHTML += "</ul>";
		          displayMessage(fileListHTML);
		        }

		        if (dbGlobals.empty) {
		          displayMessage("<p>The database is empty &amp;ndash; there's nothing to display.</p>");
		        }
		      } // cursorRequest.onsuccess
		    } // inner try
		    catch (innerException) {
		      console.log("Inner try exception in displayDB() - " + innerException.message);
		    } // inner catch
		  } // outer try
		  catch (outerException) {
		    console.log("Outer try exception in displayDB() - " + outerException.message);
		  } // outer catch
		} // displayDB

		// ---------------------------------------------------------------------------------------------------

		function deleteDB() {
		  console.log("deletedDB()");
		  displayMessage("<p>Your request has been queued.</p>"); // This normally gets instantly blown away by the next displayMessage().

		  try {
		    if (dbGlobals.db) {
		      dbGlobals.db.close(); // If the database is open, you must first close the database connection before deleting it. Otherwise, the delete request waits (possibly forever) for the required close request to occur.
		    }

		    var deleteRequest = window.indexedDB.deleteDatabase(dbGlobals.name); // Note that we already checked for the availability of the deleteDatabase() method in the above feature detection code.

		    deleteRequest.onerror = function(evt) {
		      console.log("deleteRequest.onerror fired in deleteDB() - " + (evt.target.error ? evt.target.error : evt.target.errorCode));
		    }
		    deleteRequest.onsuccess = function() {
		      dbGlobals.db = null;
		      dbGlobals.empty = true;
		      dbGlobals.message = "";
		      displayMessage("<p>The database has been deleted.</p>");
		    } // deleteRequest.onsuccess
		  } // try
		  catch (ex) {
		    console.log("Exception in deleteDB() - " + ex.message);
		  } // catch 
		} // deleteDB
		// ---------------------------------------------------------------------------------------------------
		// Add dev template styles
		devObj.style = document.createElement('style');
		devObj.defaultStyles = `
			div {
				position: relative;
			}
			._dev_modal_ * {
				box-sizing: border-box;
			}
			._dev_modal_ div,._dev_modal_ input,._dev_modal_ label {
					position: relative;
					font-family: sans-serif;
				}
				._dev_image_ { 
					position: absolute;
					left: 0;
					top:0;
					z-index: 999;
					background-repeat: no-repeat;
					background-position: center top;
					width: 100%;
				  	opacity: 0.4;
					display:none;
				}
				._dev_modal_ {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translateX(-50%) translateY(-50%);
					z-index: 9999;
					background: black;
					width: 20em;
				}
				.dev_form {
					padding: 0.5em;
				}
				._dev_modal_ input,._dev_modal_ label,._add_files_ {
					display: block;
				   	margin-bottom: 0.5em;
				   	border: 1px solid black;
				   	padding: 0.5em;
				   	background: white;	
				   	width: 100%;
				   	font-size: 1.1em;
				   	box-shadow: inset 0px 0px 0px 0px black;
				}
				._add_files_ {
					margin: 0;
					cursor: pointer;
				}
				._add_files_ span {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateX(-50%) translateY(-50%);
					color: #ef2222;
				}
				._dev_modal_ label{
					margin: 0;
					cursor: pointer;
				}
				._dev_modal_ input[type="submit"] {
					margin-top: 0.5em;
					margin-bottom: 0;
					color: #ce3e48;
					text-transform: uppercase;
					font-weight: bold;
					-webkit-appearance: button;
					cursor: pointer;
				}
				::-webkit-input-placeholder { 
				  color: black;
				}
				._dev_modal_ input[type="file"] {
					display: none;
				}
				._dev_modal_ ul {
					margin: 0;
					padding: 0;
					list-style-type: none;
					background: white;
				}
				._dev_modal_ li {
					display: block;
					padding: 0.5em;
					border: 1px solid black;
					color: #0079c9;
					font-size: 0.85em;
					font-weight: 500;
					text-transform: lowercase;
					cursor: pointer;
				}
				._dev_modal_ p {
					margin: 0;
					padding: 0.5em 0;
					background: #ef2222;
					color: white;
					font-size: 0.85em;
					text-align: center;
				}
				._db_actions_ ul {
					display: none;
				}
				._db_actions_._opened ul{
					display: block;
				}
				._db_actions_._opened span {
					transform: translateX(-50%) translateY(-50%) rotate(180deg);
				}
				._db_action_dialogue_ {
					border: 1px solid black;
				}
				#_displayDb_,#_deleteDb_ {
					display: none;
				}
				
		`;
		// Add style tag to the head	
		if (devObj.style.styleSheet) {
			devObj.style.styleSheet.cssText = devObj.defaultStyles;
		} else {
			devObj.style.appendChild(document.createTextNode(devObj.defaultStyles));
		}
		devObj.head.appendChild(devObj.style);


		// Creating containers to handle tasks
		// Template containes image and modal window to handle user inputs	
		addElement('div', function(newElement){
			setAttributes(newElement, {
				'id': '_devImage_',
				'class': '_dev_image_'
			});
		}, function(newElement, referenceNode){
			devObj.bodyTag.parentNode.insertBefore(newElement, devObj.bodyTag);
		});

		addElement('div', function(newElement){
			setAttributes(newElement, {
				'id': '_devModal_',
				'class': '_dev_modal_'
			});
		}, function(newElement){
			insertAfter(newElement, document.getElementById('_devImage_'));
		});

		// Create form to accept user inputs 
		addElement('div', function(newElement){
			setAttributes(newElement, {
				'id': '_devForm_',
				'class': 'dev_form'
			});
		}, function(newElement){
			document.getElementById('_devModal_').appendChild(newElement);
		});

		addElement('input', function(newElement){
			setAttributes(newElement, {
				'id': '_devHeight_',
				'type': 'text',
				'placeholder': 'height'
			});
		}, function(newElement){
			document.getElementById('_devForm_').appendChild(newElement);
		});

		addElement('input', function(newElement){
			setAttributes(newElement, {
				'id': '_devWidth_',
				'type': 'text',
				'placeholder': 'width'
			});
		}, function(newElement){
			document.getElementById('_devForm_').appendChild(newElement);
		});

		addElement('div', function(newElement){
			newElement.innerHTML = '<div id="_openDb_" class="_add_files_">Create/Open DB<span>&#9662;</span></div>';
			setAttributes(newElement, {
				'id': '_dbActions_',
				'class': '_db_actions_'
			});
		}, function(newElement){
			document.getElementById('_devForm_').appendChild(newElement);
		});

		addElement('ul', function(newElement){
			setAttributes(newElement, {
				'id': '_dbButtons_'
			});
		}, function(newElement){
			document.getElementById('_dbActions_').appendChild(newElement);
		});

		//Create db action buttons array
		devObj.dbButtons = ['_populateDb_', '_displayDb_', '_deleteDb_'];

		for( let i = 0; i < devObj.dbButtons.length; i++ ) {
			addElement('li', function(newElement){
				devObj.buttonText = document.createTextNode(devObj.dbButtons[i].slice(1,-3));
				newElement.appendChild(devObj.buttonText);
				setAttributes(newElement, {
					'id': devObj.dbButtons[i]
				});
			}, function(newElement){
				devObj.tmplFragment.appendChild(newElement);
			});
		} 
		document.getElementById('_dbButtons_').appendChild(devObj.tmplFragment);
		devObj.tmplFragment = '';
		
		// Create file uploader
		addElement('input', function(newElement){
			setAttributes(newElement, {
				'type': 'file',
				'multiple': '',
				'id': '_fileSelector_',
				'class': '_file_selector_'
			});
		}, function(newElement){
			document.getElementById('_dbActions_').appendChild(newElement);
		});
		// Create db dialogue 
		addElement('div', function(newElement){
			setAttributes(newElement, {
				'id': '_dbActionDialogue_',
				'class': '_db_action_dialogue_'
			});
		}, function(newElement){
			document.getElementById('_dbActions_').appendChild(newElement);
		});

		document.getElementById('_openDb_').addEventListener('click', openDB, false);
		document.getElementById('_populateDb_').addEventListener('click', populateDB, false);
		document.getElementById('_displayDb_').addEventListener('click', displayDB, false);
		document.getElementById('_deleteDb_').addEventListener('click', deleteDB, false);
		document.getElementById('_fileSelector_').addEventListener('change', handleFileSelection, false);
	}());
});