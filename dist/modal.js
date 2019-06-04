/**
 * Modal jquery code
 */
(function($){
	"use strict";

	var initElements = function(){



		// if we have already inited this type of element
		$('.bod-block-popup').each(function(){
			// for the identified modal we add an instance of the class BodModal 
			// to the data element  
			$(this).data('bod-block-popup', new BodModal(this));

		});
	};


	// class used to manipulate the modal, there will be an seperate instance of the 
	// class for each modal on the page
	// container - DOM object for modal 
	var BodModal = function (container) {
		// convert passed in DOM modal container to jquery object so we can apply jquery methods
		this.$container = $(container);
		this.$trigger = this.$container.find('.bod-block-popup-trigger');

		// Markup the aria labels

		window.bodModalCount ++; // get modal number to append to get unique id
		this.$container.find('.bod-block-popup-wrap').attr('aria-labelledby','bodModalAriaTitle' + window.bodModalCount);
		this.$container.find('.bod-modal-title').attr('id' , 'bodModalAriaTitle' + window.bodModalCount);
		this.$container.find('.bod-block-popup-wrap').attr('aria-describedby','bodModalAriaContent' + window.bodModalCount);
		this.$container.find('.bod-modal-content').attr('id' , 'bodModalAriaContent' + window.bodModalCount);


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
			// we need to extract the delay amd set a timeout using it
			var loadDelay = this.$trigger.attr('data-delay');
			isNaN(parseInt(loadDelay)) ? loadDelay = 1000 : loadDelay = parseInt(loadDelay);
			this.timer = setTimeout(this.show, loadDelay);
		} else { // must be button, text, or image trigger
			this.$trigger.on('click', this.show); // attach click event
		}

		// setup the overlay and content wrap, put them into a jquery object and 
		// attach the hide event for the click

		this.$overlay = this.$container.find('.bod-block-popup-overlay')
			.on('click' , this.hide);
		this.$modalWrap = this.$container.find('.bod-block-popup-wrap');
		this.$modalcloser = this.$container.find('.bod-block-popup-closer')
		.on('click' , this.hide);
		this.$escCloser = $(document).on('keydown' , this.keyPress);



	}

	BodModal.prototype = {
		show: function(){

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
			this.$overlay.addClass('active');
			this.$modalWrap.addClass('active');
			this.$modalWrap.attr('aria-modal','true'); 

		},
		hide: function() {
			this.$overlay.removeClass('active');
			this.$modalWrap.removeClass('active');
			// add the overlay and modal wrap back to the container and hide it
			this.$overlay.appendTo(this.$container).hide();
			this.$modalWrap.appendTo(this.$container).hide();
			this.$modalWrap.attr('aria-modal','false'); 
		},	
		keyPress: function(e) {
			if ( e.keyCode === 27 ) { // ESC
				this.hide();
			}
		},
	}

	window.bodModalCount = 0; // global count of modals
	initElements();
	
})(jQuery);