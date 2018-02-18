document.addEventListener('DOMContentLoaded', function(event){
	(function(){
		"use strict";  
		//Make global variables
		let devObj = {};
		devObj.tmplVisibility = false;
		devObj.modalVisibility = false;
		devObj.tmplZindex = false;
		devObj.tmplFragment = document.createDocumentFragment();
		devObj.fieldTimer = null;
		devObj.storageArray = [];
		devObj.imageArray = [];
		devObj.cssPropArray = ['height', 'background-size', 'background-image'];
		devObj.head = document.getElementsByTagName('head')[0];
		devObj.bodyTag = document.body.firstChild;
		devObj.savedStorage = JSON.parse(sessionStorage.getItem('templateContainer'));
		devObj.counter = 0;
		devObj.style = null;
		devObj.defaultStyles = null;

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
			element.style.display = 'none';
		}

		function showElement(element){
			element.style.display = 'block';
		}

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
				'class': '_dev_form_'
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
		});

		addElement('input', function(newElement){
			setAttributes(newElement, {
				'id': '_devWidth_',
				'type': 'text',
				'placeholder': 'width'
			});
		});


	}());
});