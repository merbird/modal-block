/**
 * Modal jquery code
 * 11/13/2021 - do not scroll to first focusable field
 * 8/2/2021 - add code to allow timer modal to optionally display only once via the use of a cookie
 * 8/17/2021 - do not allow timer modal to display if another modal already open
 * 11/1/2021 - when setting focus on first element do not scroll
 * 2/15/2022 - disable close modal on escape if disabled in the frontend
 * 4/5/2022 - Do not scroll when returning focus on modal close 
 * 5/5/2022 - Allow for modals to call other modals
 * 6/28/2022 - Allow for checking url for text before triggering modal
 * 11/22/2022 - custom events for open and close
 * 1/11/2023 - Provide ability to manually trigger initialization of modals on page. Also only initialize modals when document is ready.
 */

    
var bodModalBlock = function(){
	"use strict";
	
	var $ = jQuery.noConflict();

	const focusableElements =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

	var bodModalCount = 0; // global count of modals
	var bodModalActive = false;
	var bodModals = [];

	var initElements = function(){
	
		bodModalCount = 0; // global count of modals
		bodModalActive = false;
		bodModals = [];

		// if we have already inited this type of element
		$('.wp-block-bod-modal-block').each(function(){
			// for the identified modal we add an instance of the class BodModal 
			// to the data element  
			// $(this).data('bod-block-popup', new BodModal(this));
			bodModals.push(new BodModal(this));

		});
	};

	var checkForCookie = function(cookieName){
		let name = cookieName + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
		}
		return "";
	}


	// class used to manipulate the modal, there will be a seperate instance of the 
	// class for each modal on the page
	// container - DOM object for modal 
	var BodModal = function (container) {
		// convert passed in DOM modal container to jquery object so we can apply jquery methods
		this.$container = $(container);
		this.$trigger = this.$container.find('.bod-block-popup-trigger');
		this.$overlay = this.$container.find('.bod-block-popup-overlay');

		// Markup the aria labels

		bodModalCount ++; // get modal number to append to get unique id
		this.$container.find('.bod-block-popup-wrap').attr('aria-labelledby','bodModalAriaTitle' + bodModalCount);
		this.$container.find('.bod-modal-title').attr('id' , 'bodModalAriaTitle' + bodModalCount);
		this.$container.find('.bod-block-popup-wrap').attr('aria-describedby','bodModalAriaContent' + bodModalCount);
		this.$container.find('.bod-modal-content').attr('id' , 'bodModalAriaContent' + bodModalCount);


		// bind our functions to this so we use current rather than event version of this
		
		this.show = this.show.bind(this);
		this.afterShow = this.afterShow.bind(this);
		this.hide = this.hide.bind(this);
		this.keyPress = this.keyPress.bind(this);

		// we need a timer for fading in and out the modal and for show on page load

		this.timer = null;

		// assign trigger event depending upon trigger type which is 
		// stored has a class

		if (this.$trigger.hasClass('type_selector')) {
			var triggerSelector = this.$trigger.attr('data-selector');
			if (triggerSelector) {
				$('.' + triggerSelector).css('cursor','pointer').on('click', this.show); // attach click event
			}
		} else if (this.$trigger.hasClass('type_load')) {
			// we have show on page load
			
			// need to load the data-once attribute which will be either no , or yes

			var loadOnce = this.$trigger.attr('data-once');
			var triggerTimer = true;
			if (loadOnce) {			
				if (loadOnce === 'yes') {
						let modalId = this.$trigger.attr('data-id');
						if (!modalId) modalId= "";
						let modalOnce = checkForCookie ("bodModalOnce" + modalId);
						if (modalOnce) triggerTimer = false;
				}								
			}

			// check if we need to check for text in url to enable modal
			var loadurl = this.$trigger.attr('data-urltrig');
			if (loadurl) {
				if (window.location.href.indexOf(loadurl)===-1) triggerTimer = false;
			}

			if (triggerTimer) {
				// we need to extract the delay amd set a timeout using it
				var loadDelay = this.$trigger.attr('data-delay');
				isNaN(parseInt(loadDelay)) ? loadDelay = 1000 : loadDelay = parseInt(loadDelay);

				// if we only want to show the modal once we exact the UID provided when the modal created (optional), and the number of days we wait until we show the 
				// modal again (this is added to the cookie)
				if (loadOnce) {
					let modalId = this.$trigger.attr('data-id');
					if (!modalId) modalId= "";
					let noShowDays = this.$trigger.attr('data-days');
					isNaN(parseInt(noShowDays)) ? noShowDays = 30 : noShowDays = parseInt(noShowDays);
					this.timer = setTimeout(this.show, loadDelay, loadOnce, modalId , noShowDays);
				} else {
					this.timer = setTimeout(this.show, loadDelay);
				}
			}

		} else { // must be button, text, or image trigger
			this.$trigger.on('click', this.show); // attach click event
		}

		// setup the overlay and content wrap, put them into a jquery object and 
		// attach the hide event for the click

		// check to see if we have disabled the close on overlay click in the frontend
		var disableOverlayClose = this.$overlay.attr('data-disabled-overlay-close');
		if (!disableOverlayClose) {
			this.$overlay.on('click' , this.hide);
		} else {
			if (disableOverlayClose === 'false') {
				this.$overlay.on('click' , this.hide);				
			}
		}

		// check to see if we have disabled the close on escape key press in the frontend
		var disableEscapeClose = this.$overlay.attr('data-disabled-escape-close');
		if (!disableEscapeClose) {
			this.disableEscapeClose = false;
		} else {
			if (disableEscapeClose === 'true') {
				this.disableEscapeClose = true;			
			} else {
				this.disableEscapeClose = false;
			}
		}

		this.$modalWrap = this.$container.find('.bod-block-popup-wrap');
		this.$modal = this.$container.find('.bod-block-popup');
		this.$modalcloser = this.$container.find('.bod-block-popup-closer')
		.on('click' , this.hide);
		this.$titlecloser = this.$container.find('.bod-block-title-closer')
		.on('click' , this.hide);
		this.$btncloser = this.$container.find('.bod-block-close-btn .bod-btn')
		.on('click' , this.hide);
		this.$modalToModal = this.$container.find('.bod-modal-to-modal')
		.on('click' , this.hide);
		this.$escCloser = $(document).on('keydown' , this.keyPress);

		// Javascript modal wrap

		this.modalWrap = container.querySelector('.bod-block-popup-wrap'); 

		// capture first, all and last focusable elements so we can enforce modal focus trap for ADA
		this.focusableContent = this.modalWrap.querySelectorAll(focusableElements);
		if (this.focusableContent) {
			this.firstFocusableElement = this.focusableContent[0]; // get first element to be focused inside modal
			this.lastFocusableElement = this.focusableContent[this.focusableContent.length - 1]; // get last element to be focused inside modal
		}
		this.modalOpen = false;

	}

	BodModal.prototype = {
		show: function(loadOnce , modalId, noShowDays ){

			$(document).trigger("bod-modal-before-open",this.$modalWrap);

			// if we try and show a modal but one is already open then return without showing the new one
			if (this.$trigger.hasClass('type_load') && bodModalActive === true) {
				return;
			} 

			bodModalActive = true;

			if (loadOnce) {
				// check if we need to set a cookie to stop modal being shown mmore than once
				if (loadOnce !== 'no') {
					// flag set to say we only show once so set the cookie
					const d = new Date();
					d.setTime(d.getTime() + (noShowDays*24*60*60*1000));
					let expires = "expires="+ d.toUTCString();
					if (modalId) {
						var cookie = "bodModalOnce" + modalId;
					} else {
						var cookie = "bodModalOnce";
					}
					document.cookie = cookie + "=" + loadOnce + ";" + expires + ";path=/";
				}
			}

			// start to clearing any timeouts

			clearTimeout(this.timer);

			// when we show the modal we move it to the body DOM so that
			// nothing else impacts it
			this.$overlay.appendTo(document.body).show();
			this.$modalWrap.appendTo(document.body).show();

			// even though we have hit it with a show the opacticy still makes it
			// invisible. We wait to ensure the modal is ready then then add
			// an active class with triggers the opacity transition
			
			this.timer = setTimeout(this.afterShow, 25);
		},
		afterShow: function(){
			clearTimeout(this.timer);

			// Lets check what transition we are going to use

			if (this.transition = this.$modal.attr('data-transition')) {
				if (this.transition == 'left') {
					this.$modal.addClass('slide-right');
				} else if (this.transition == 'right') {
					this.$modal.addClass('slide-left');
				} else if (this.transition == 'bottom') {
					this.$modal.addClass('slide-up');
				} else if (this.transition == 'top') {
					this.$modal.addClass('slide-down');
				} else {
					this.$modal.addClass('fade');
				};
			} else {
				this.$modal.addClass('fade');
			};

			this.$overlay.addClass('active');
			this.$modalWrap.addClass('active');
			this.$modalWrap.attr('aria-modal','true');

			this.modalOpen = true;
			this.triggerElement = document.activeElement;
			if (this.firstFocusableElement) {
				this.firstFocusableElement.focus({
					preventScroll: true
				});
			} else {
				document.activeElement.blur();
			}
			$(document).trigger("bod-modal-after-open",this.$modalWrap);

		},
		hide: function() {
			if ($(document).trigger("bod-modal-before-close",this.$modalWrap).data('cancel')){
				return;
			};
			
			this.$overlay.removeClass('active');
			this.$modalWrap.removeClass('active');
			// add the overlay and modal wrap back to the container and hide it
			this.$overlay.appendTo(this.$container).hide();
			this.$modalWrap.appendTo(this.$container).hide();
			this.$modalWrap.attr('aria-modal','false'); 
			bodModalActive = false;
			this.modalOpen = false;
			$(document).trigger("bod-modal-after-close",this.$modalWrap);

			// return focus to element that was active before modal called
			// but do not scroll to it
			if (this.triggerElement) this.triggerElement.focus(
				{
					preventScroll: true
				}
			);
		},	
		keyPress: function(e) {
			if ( e.keyCode === 27 && !this.disableEscapeClose) { // ESC
				this.hide();
			}

			// here we do the ADA focus trap but only if the modal is open

			if (this.modalOpen) {

				// code to enforce focus trap for ADA

				let isTabPressed = e.key === 'Tab' || e.keyCode === 9;

				// if keypress is not tab do nothing
				if (!isTabPressed) {
					return;
				}
		
				// Do we have at least one element in the modal that can receive focus 
				if (this.firstFocusableElement) {
					if (e.shiftKey) { // if shift key pressed for shift + tab combination
						if (document.activeElement === this.firstFocusableElement) {
							this.lastFocusableElement.focus(); // add focus for the last focusable element
							e.preventDefault();
						}
					} else { // if tab key is pressed
						if (document.activeElement === this.lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
							this.firstFocusableElement.focus(); // add focus for the first focusable element
							e.preventDefault();
						}
					}
				} else {
					// if we are here the modal is open and the tab key has been pressed 
					// but there are no elements in the modal that can receive focus.
					// Therefore we do not want to provide focus to any element outside 
					// the modal.
					e.preventDefault();
				}
			}
		},
	}

	return {
		initModal : initElements
	}
	
};

var bodModal = bodModalBlock();
jQuery(document).ready(function( $ ) {

	bodModal.initModal();

});

// This is an example for the custom events, this one returns cancel=true so modal will not close
//(function($){
//$(document).on("bod-modal-before-close", function(e, modalData){
//	$(this).data('cancel', true);

//	this.$modalData = $(modalData);
//	this.$modalData.addClass('testbeforeclose');
//	alert("added before close");
//});
//})(jQuery);

// This is an example of how to manually trigger initialization 10 secs after page is ready
//jQuery(document).ready(function( $ ) {
//	setTimeout(bodModal.initModal,10000);
//});
