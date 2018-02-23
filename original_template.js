document.addEventListener('DOMContentLoaded', function(event){
	(function(){

		// Set global object to preserve variables 
		let templateObj = {
			templateVisibility: false,
			modalVisibility: false,
			templateZindex: false,
			createTemplateFragment: document.createDocumentFragment(),
			fieldTimer: null,
			storageArray: [],
			imageArray: [],
			cssPropArray: ['height', 'background-size', 'background-image'],
			style: null,
			defaultStyles: null,
			head: document.getElementsByTagName('head')[0],
			bodyTag: document.body.firstChild,
			savedStorage: JSON.parse(sessionStorage.getItem('templateContainer')),
			counter: 0
		}

		// These funcitons provide basic methods for elements
 		// Create function that will set multiple attributes at a time
 		function setAttributes(element, attrs) {
			for( let key in attrs ){
				element.setAttribute(key, attrs[key]);
			}
		}

		function insertAfter(newNode, referenceNode) {
		    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}

		function hideElement(element){
			element.style.display = 'none';
		}

		function showElement(element){
			element.style.display = 'block';
		}

		// function handleFiles(e){
		// 	let templateFileListParent  = document.createElement('ul'),
		// 		fileList = this.files;	
		// 	setAttributes(templateFileListParent, {
		// 		'class': 'templateFileList'
		// 	});
		// 	insertAfter(templateFileListParent, templateUploadLabel);
		// 	for(let i = 0; i < fileList.length; i++) {
		// 		let parseFileName = fileList[i].name.replace(/[^0-9a-z-A-Z ]/g, '').replace(/ +/, ' '),
		// 			makeImg = document.createElement('img'),
		// 			li = document.createElement('li'),
		// 			imageName = document.createElement('span');
		// 			imageName.textContent = fileList[i].name;

		// 		li.setAttribute('data-id', parseFileName); 
		// 		templateFileListParent.appendChild(li);
		// 		li.appendChild(makeImg);
		// 		li.appendChild(imageName);

		// 		let targetImg = li.childNodes[0],
		// 			file = document.getElementById('templateFileName').files,
		// 			reader = new FileReader();

		// 		reader.addEventListener('load', function(){
		// 			targetImg.src = reader.result;
		// 			//targetImg.src = URL.createObjectURL(file[i]); // Temporary url
		// 		}, false);
		// 		if(file[i]) {
		// 			reader.readAsDataURL(file[i]);
		// 		}
		// 	}
		// 	document.getElementById('templateUpload').textContent = 'choose file from the list';
		// }	

		// Set template styles in head section 
		templateObj.style = document.createElement('style');
		templateObj.defaultStyles = `
			div {
				position: relative;
			}
			.templateModal * {
				box-sizing: border-box;
			}
			.templateModal div,.templateModal input,.templateModal label {
					position: relative;
					font-family: sans-serif;
				}
				.templateContainer { 
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
				.templateModal {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translateX(-50%) translateY(-50%);
					z-index: 9999;
					background: black;
					width: 20em;
					display: none;
				}
				.templateForm {
					padding: 0.5em;
				}
				.templateForm input,.templateForm label {
					display: block;
				   	margin-bottom: 0.5em;
				   	border: 1px solid black;
				   	padding: 0.5em;
				   	background: white;	
				   	width: 100%;
				   	font-size: 1.1em;
				   	box-shadow: inset 0px 0px 0px 0px black;
				}
				.templateForm label{
					margin: 0;
					cursor: pointer;
				}
				.templateForm input[type="submit"] {
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
				.templateForm input[type="file"] {
					position: absolute;
				    z-index: -1;
					opacity: 0;
				    overflow: hidden;
				}
				.templateForm img {
					display: none;
				}
				.templateForm ul {
					margin: 0;
					padding: 0;
					list-style-type: none;
					background: white;
				}
				.templateForm li {
					display: block;
					padding: 0.5em;
					border: 1px solid black;
					color: #0079c9;
					font-size: 0.85em;
					font-weight: 500;
					text-transform: lowercase;
					cursor: pointer;
				}
				
		`;

			// Check if session storage is empty
			if( templateObj.savedStorage != null ) {
				templateObj.defaultStyles += `
					.templateContainer {
						`+ templateObj.savedStorage +`
					}
				`;
				console.log('sessionStorage is not empty');
			} else {
				console.log('sessionStorage is empty');
			}
		
		// Add style tag to the head	
		if (templateObj.style.styleSheet) {
			templateObj.style.styleSheet.cssText = templateObj.defaultStyles;
		} else {
			templateObj.style.appendChild(document.createTextNode(templateObj.defaultStyles));
		}
		templateObj.head.appendChild(templateObj.style);

		// Create Template Container
		// TODO: need to clean up this area. Remove all global variables 
 		let templateNode = document.createElement('div');
 			templateNode.setAttribute('class', 'templateContainer');
 			templateObj.bodyTag.parentNode.insertBefore(templateNode, templateObj.bodyTag);

		// Create Template Modal 
		let templateModal = document.createElement('div');
			insertAfter(templateModal, templateNode);
			templateModal.setAttribute('class', 'templateModal');
		// Create Template Form 	
		let templateForm = 	document.createElement('div');
			templateModal.appendChild(templateForm);
			templateForm.setAttribute('class', 'templateForm');

		let templateHeight = document.createElement('input');
			setAttributes(templateHeight, {
				'id': 'templateHeight',
				'type': 'text',
				'placeholder': 'height'
			});

		let	templateWidth = document.createElement('input');
			setAttributes(templateWidth, {
				'id': 'templateWidth',
				'type': 'text',
				'placeholder': 'width'
			});

		// File uploader	
		// let fileUploadContainer = document.createElement('div');
		// 	setAttributes(fileUploadContainer, {
		// 		'class': 'templateUploadContainer'
		// 	});
		// Temporary solution untill I find way effectively load images to storage
		let templateBgInputList = document.createElement('input');	
			setAttributes(templateBgInputList, {
				'id': 'templateBgList',
				'type': 'text',
				'placeholder': 'image-name'
			});

		let templateFileListParent = document.createElement('ul');

		let templateUploadLabel = document.createElement('label'),
			labelText =	document.createTextNode('select files');
			setAttributes(templateUploadLabel, {
				'id': 'templateUpload'
			});
			// Disabled label for now to prevent file upload click
			//fileUploadContainer.appendChild(templateUploadLabel);
			templateUploadLabel.appendChild(labelText);

		let templateUploadInput = document.createElement('input');	
			setAttributes(templateUploadInput, {
				'id': 'templateFileName',
				'type': 'file',
				'accept': 'image/*',
				'multiple': ''
			});
			templateUploadLabel.appendChild(templateUploadInput);

		let	templateSubmit = document.createElement('input');
			setAttributes(templateSubmit, {
				'id': 'templateSubmit',
				'type': 'submit',
				'value': 'save'
			});	
		
		// Put input elements to the array to loop through	
		let templateFormElements = [templateHeight, templateWidth, templateBgInputList, templateFileListParent, templateSubmit];		
		
		// Append input elemnts to the form 	
		for(let i = 0; i < templateFormElements.length; i++) {
		  	templateObj.createTemplateFragment.appendChild(templateFormElements[i]); 
		}
		templateForm.appendChild(templateObj.createTemplateFragment);
		
		//templateUploadInput.addEventListener('change', handleFiles, false);

		templateForm.addEventListener('click', function(e){
			// Temporary comented out click on loaded li
			// let currentLiAttr = e.target.getAttribute('data-id');
			// if( currentLiAttr ) {
			// 	let selectedImg = e.target.childNodes[0];
			// 	templateObj.storageArray.push('background-image: url("'+ selectedImg.src +'");' );
			// 	//templateNode.style.backgroundImage = 'url("'+ selectedImg.src +'")';
			// 	console.log('image has been set in session storage');
			// }


			if( e.target.id == 'templateSubmit' ) {
				clearTimeout(templateObj.fieldTimer);
				templateObj.storageArray.length = 0;
				for(let i = 0; i < templateFormElements.length; i++) {
					if( templateFormElements[i].value != '' ) {
						// for (let j = templateObj.storageArray.length; j > 0; j--) {
						//  templateObj.storageArray[j] = 0;//.pop();
						// 	}
						switch(templateFormElements[i].id){
							case 'templateHeight':
							case 'templateWidth':
								templateObj.storageArray.push(templateObj.cssPropArray[i] + ':' + templateFormElements[i].value + ';');
								break;
							case 'templateBgList':
								//checkArrayValue(templateObj.storageArray, templateObj.cssPropArray[i]);
								templateObj.storageArray.push('background-image: url(images/'+ templateFormElements[i].value +');');
								//let templateFileListLi = document.createElement('li');
								//templateFileListLi.textContent = templateFormElements[i].value;
								//templateFileListParent.appendChild(templateFileListLi);
								break;	
						}
						templateObj.fieldTimer = setTimeout(function(){
							if( templateFormElements[i].id != 'templateSubmit' ) {
								templateFormElements[i].value = '';
							}
							
						}, 1000);

					} 
				}

				console.log(templateObj.storageArray);

				let joinedArr = templateObj.storageArray.join('');
				sessionStorage.setItem('templateContainer', JSON.stringify(joinedArr));
				templateNode.setAttribute('style','display:block;'+ joinedArr);
				templateObj.templateVisibility = true;
			}
		});

		// function checkArrayValue(haystack, needle) {
		// 	let prevValue = haystack.indexOf(needle);
		// 	if(prevValue == -1) {
		// 		haystack.splice(prevValue, 1);
		// 	}
		// }

		// Set counter to toggle template container values
		let counterValue = function(){
			let counter = 0;
			function changeValue(val){
				counter += val;
			}
			return {
			    direction: function(v){ 
			    	changeValue(v);
			    },
			    value: function(){
			    	return counter;
			    }
			};
		};

		// Set counter methods to perform actions on keydown event
		let countMethods = {
			setCounterOpacity: counterValue(),
			setCounterTop:  counterValue(),
			setCounterLeft: counterValue()
		}

		// Key down event listener watches for keys and perform actions
		document.addEventListener('keydown', function(e){

			// Return container to original state shift - esc
			if( e.shiftKey && e.which == 27 ){
				window.sessionStorage.clear();
				console.log('Container settings has been reset to default and sessionStorage has been cleared');

			}

			// Toggle template container shift - z
			if( e.shiftKey && e.which == 90 ){
				if( false == templateObj.templateVisibility ){
					showElement(templateNode);
					templateObj.templateVisibility = true;
				} else {
					hideElement(templateNode);
					templateObj.templateVisibility = false;
				}
			}

			// Toggle template modal shift - a
			if( e.shiftKey && e.which == 65 ){ 
				if( false == templateObj.modalVisibility ) {
					showElement(templateModal);
					templateObj.modalVisibility = true;
				} else {
					hideElement(templateModal);
					templateObj.modalVisibility = false;
				}
			}

			if( e.shiftKey && true == templateObj.templateVisibility ){
				// Toggle opactity use keys 
				// 's - up'
				if( e.which == 83 ) {
					countMethods.setCounterOpacity.direction(0.1);
					templateNode.style.setProperty('opacity', countMethods.setCounterOpacity.value());
				}
				// 'x - down'
				if( e.which == 88 ) {
					countMethods.setCounterOpacity.direction(-0.1);
					templateNode.style.setProperty('opacity', countMethods.setCounterOpacity.value());
				}

				// Toggle z-index shift - w 
				if( e.which == 87 ){
					if( false == templateObj.templateZindex ) {
						templateNode.style.zIndex = 1;
						document.querySelector('.page_container').style.zIndex = 999; 
						templateObj.templateZindex = true;
					} else {
						templateNode.style.zIndex = '';
						document.querySelector('.page_container').style = ''; 
						templateObj.templateZindex = false;
					}
					
				}
			}

			if( e.altKey && true == templateObj.templateVisibility ) {
				// Change template position
				// Alt - up 
				if( e.which == 38 ){
					countMethods.setCounterTop.direction(1);
					templateNode.style.backgroundPositionY = countMethods.setCounterTop.value() + 'em';
				}
				// Alt - down
				if( e.which == 40 ){
					countMethods.setCounterTop.direction(-1);
					templateNode.style.backgroundPositionY = countMethods.setCounterTop.value() + 'em';
				}
				// Alt - left
				if( e.which == 37 ){
					countMethods.setCounterLeft.direction(1);
					templateNode.style.backgroundPositionX = countMethods.setCounterLeft.value() + 'em';
				}
				// Alt - right
				if( e.which == 39 ){
					countMethods.setCounterLeft.direction(-1);
					templateNode.style.backgroundPositionX = countMethods.setCounterLeft.value() + 'em';
				}
			}
		});

	}()); 
});




