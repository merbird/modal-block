/**
 * BLOCK: Modal Block
 *
 * Allows modal / popup block for use in the Gutenberg editor. 
 */

//  v1.1 - Update for deprecated wp.editor (changed to wp.blockEditor) and core/editor (changed to core/block-editor).
//  v1.2 - Change icon to use SVG - use alt tag from trigger image - optional close btn in modal and set location to left / right / or middle
//  Import CSS.
//  v1.3 - Option to allow for the timer based modal to be displayed only once.  
//  v1.4 - Use Button instead of span, add custom class to dialog, add toggle to disable close on overlay click
//  v1.4.1 - fix for when we use trigger on image and medium image size does not exist.
//  v1.4.2 - fix where clicking on nested content causes modal window to close when editing
//  v1.4.3 - option to disable close modal on escape key

import './style.scss';
import './editor.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { InspectorControls, MediaUpload, PlainText, InnerBlocks } = wp.blockEditor;
const { CheckboxControl, SelectControl, ColorPicker, PanelBody, ToggleControl} = wp.components;

const blockAttributes = {
	title: {
		type: "string",
		default: "Modal Title"	
	},
	showOn: {
		type: "string",
		default: "btn"
	},
	btnLabel: {
		type: "string",
		selector: '.bod-btn',
		source: "text",
		default: "Show"
	},
	btnBackgdColor: {
		type: "string",
		default: "rgba(0, 0, 0, 0.1)"	
	},
	btnColor: {
		type: "string",
		default: "#ffffff"
	},
	triggerImageSizes: {
		type:"object",
		default: ""
	},
	triggerImageSrc: {
		type:"string",
		attribute: 'src',
		selector: '.trigger_image',
		default: ''
	},
	triggerImageAlt: {
		type:"string",
		default: ''
	},		
	imgSize: {
		type: "string",
		default: "medium"
	},
	imgSizeLabels: {
		type: "array",
		default: []
	},
	triggerText: {
		type: "string",
		source: "text",
		selector: ".type_text",
		default: "Click Me"
	},
	textSize: {
		type: "string",
		default: ""
	},
	overrideLinkColor: {
		type: "boolean",
		default: false	
	},
	textColor: {
		type: "string",
		default: "#000000"	
	},
	textAlign: {
		type: "string",
		default: "center"
	},
	showDelay: {
		type: "string",
		default: "0"
	},	
	showOnce: {
		type: "string",
		default: "no"
	},
	modalId: {
		type: "string",
		default: ""
	},
	noShowDays: {
		type: "string",
		default: ""
	},	
	triggerSelector: {
		type: "string",
		default: "triggerclass"
	},
	disableOverlayClose: {
		type: "boolean",
		default: false
	},
	disableEscapeClose: {
		type: "boolean",
		default: false
	},
	overlayBackgdColor: {
		type: "string",
		default: "rgba(0, 0, 0, 0.1)"	
	},
	modalSize: {
		type: "string",
		default: "size-m"
	},
	modalBackgdColor: {
		type: "string",
		default: "#ffffff"	
	},
	modalPadding: {
		type: "string"
	},
	titleSize: {
		type: "string",
		default: ""	
	},
	titleColor: {
		type: "string",
		default: "#000000"	
	},
	titleBackgdColor: {
		type: "string",
		default: "#ffffff"	
	},
	titlePadding: {
		type: "string"
	},
	modalRadius: {
		type: "string",
		default: "10"
	},
	showCloseBtn: {
		type: "string",
		default: "no"
	},
	btnCloseLabel: {
		type: "string",
		default: "Close"
	},
	btnCloseBackgdColor: {
		type: "string",
		default: "rgba(0, 0, 0, 0.1)"	
	},
	btnCloseColor: {
		type: "string",
		default: "#ffffff"
	},
	btnCloseAlign: {
		type: "string",
		default: "center"
	}
}

// takes the style type attributes entered in the backend form and converts them to inline styles
// styles - object
const bodFormatStyles = (styles) => {

	// loop round the object of styles passed to us 
	let formatedStyles = {}; // returned set of styles in an object
	for (let style in styles) {

		switch (style) {
			case 'fontSize':
			case 'padding':
			case 'borderRadius':
				
				// first check if any number exists in string / if not then do nothing

				if (!isNaN(parseFloat(styles[style]))) {

					// split string of values into array e.g. 10px 5px 5px 10px
					let styleValues = styles[style].split(" ");
					let formatStyleValue = '';
					
					let valueCount = 0;

					// loop round the array of style values formatting
					// each one depending upon %, em, rem, or px

					styleValues.forEach(function(styleValue) {

						// we have only have max of 4 values for padding 1 for everything else
						if (((style === 'padding' || style === 'borderRadius') && valueCount < 4) ||
							( style !== 'padding' && style !== 'borderRadius' && valueCount < 1 )) { 
							if (styleValue.includes('%')) {
								formatStyleValue += parseInt(styleValue) + '% ';
							} else if (styleValue.includes('rem')) {
								formatStyleValue += parseFloat(styleValue) + 'rem ';
							} else if (styleValue.includes('em')) {
								formatStyleValue += parseFloat(styleValue) + 'em ';
							} else {
							// assume we are dealing with px
								formatStyleValue += parseInt(styleValue) + 'px ';
							}
							valueCount ++;
						}
					}); // end for each
					formatedStyles[style] = formatStyleValue;

				} // end NaN check
				break;

			case 'color':
			case 'backgroundColor':
				// extract rgba color from object color
				if (typeof styles[style] === 'object') {  
					const {rgb} = styles[style];
					const {r,g,b,a} = rgb;
					formatedStyles[style] = "rgba("+ r + "," + g + "," + b + "," + a + ")";
				} else {
					formatedStyles[style] = styles[style];
				}
				break;
			
			case 'textAlign':
				formatedStyles[style] = styles[style];
				break;								
		} // end switch 

	} // end styles loop 

	return formatedStyles;

}

const v1 = {
	attributes: blockAttributes,
	save: function( {attributes} ) {


		// format the trigger content which is either an image, link text, 

		const trigger = () => {
			if (attributes.showOn === 'image') {
				return (
					<a href="javascript:void(0)" className="bod-block-popup-trigger type_image">
						<img 
							className='trigger_image'
							src={attributes.triggerImageSrc} 
							alt={attributes.triggerImageAlt}
						/>
					</a>
				);
			} else if (attributes.showOn === 'text') {
				let classStyles = '';
				if (attributes.overrideLinkColor) {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize, 'color' : attributes.textColor});
				} else {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize});
				}
				return (
					<a href="javascript:void(0)" style={classStyles} className="bod-block-popup-trigger type_text">
						{ attributes.triggerText }
					</a>					
				);
			} else if (attributes.showOn === 'load') {
				if (attributes.showOnce !== 'no') {
				return (
					<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay} data-once={attributes.showOnce} data-id={attributes.modalId} data-days={attributes.noShowDays}></span>
				);
				} else {
					return (
						<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay}></span>
					);					
				}
			} else if (attributes.showOn === 'selector') {
				return (
					<span className="bod-block-popup-trigger type_selector" data-selector={attributes.triggerSelector}></span>
				);
			} else {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnBackgdColor, 'color' : attributes.btnColor});
				return (
					<span style={classStyles} className="bod-block-popup-trigger type_btn bod-btn">
						{attributes.btnLabel}
					</span>
				);
			}
			
		}

		// format the close button 

		const closeBtn = () => {
			if (attributes.showCloseBtn === 'yes') {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnCloseBackgdColor, 'color' : attributes.btnCloseColor});
				return (
					<div className={'bod-block-close-btn' + ' align-' + attributes.btnCloseAlign}>
						<button type="button" style={classStyles} className="type_btn bod-btn">
							{attributes.btnCloseLabel}
						</button>
					</div>
				);
			}
		}

		return (
			<div className= {'bod-block-popup ' + 'align-' + attributes.textAlign}>
				{trigger()}
			
				{/* Modal Overlay */}
				<div style={bodFormatStyles ({'backgroundColor': attributes.overlayBackgdColor})} className="bod-block-popup-overlay"></div>
			
				<div role="dialog" aria-modal="false" aria-labelledby="" aria-describedby="" className={"bod-block-popup-wrap"}>
					{/* Modal Content */}
					<div style={bodFormatStyles ({'backgroundColor': attributes.modalBackgdColor, 'borderRadius': attributes.modalRadius})} className={"bod-block-popup " + attributes.modalSize}>
						<div id="" style={bodFormatStyles ({'backgroundColor': attributes.titleBackgdColor, 'padding': attributes.titlePadding}) } className = "bod-modal-title">
							<h2 style={bodFormatStyles ({'color': attributes.titleColor, 'fontSize': attributes.titleSize})}>{attributes.title}</h2>
						</div> {/* end title */}
						<div id=""  style={bodFormatStyles ({'padding': attributes.modalPadding})} className="bod-modal-content">
							{<InnerBlocks.Content/>}
							{closeBtn()}
						</div> {/* end content */}
						
					</div> {/* end modal content */}
					<div className="bod-block-popup-closer"></div>
				</div>

			</div>
		);
	}
};

const v2 = {
	attributes: blockAttributes,
	save: function( {attributes} ) {


		// format the trigger content which is either an image, link text, 

		const trigger = () => {
			if (attributes.showOn === 'image') {
				return (
					<a href="javascript:void(0)" className="bod-block-popup-trigger type_image">
						<img 
							className='trigger_image'
							src={attributes.triggerImageSrc} 
							alt={attributes.triggerImageAlt}
						/>
					</a>
				);
			} else if (attributes.showOn === 'text') {
				let classStyles = '';
				if (attributes.overrideLinkColor) {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize, 'color' : attributes.textColor});
				} else {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize});
				}
				return (
					<a href="javascript:void(0)" style={classStyles} className="bod-block-popup-trigger type_text">
						{ attributes.triggerText }
					</a>					
				);
			} else if (attributes.showOn === 'load') {
				if (attributes.showOnce !== 'no') {
				return (
					<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay} data-once={attributes.showOnce} data-id={attributes.modalId} data-days={attributes.noShowDays}></span>
				);
				} else {
					return (
						<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay}></span>
					);					
				}
			} else if (attributes.showOn === 'selector') {
				return (
					<span className="bod-block-popup-trigger type_selector" data-selector={attributes.triggerSelector}></span>
				);
			} else {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnBackgdColor, 'color' : attributes.btnColor});
				return (
					<button type="button" style={classStyles} className="bod-block-popup-trigger type_btn bod-btn">
						{attributes.btnLabel}
					</button>
				);
			}
			
		}

		// format the close button 

		const closeBtn = () => {
			if (attributes.showCloseBtn === 'yes') {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnCloseBackgdColor, 'color' : attributes.btnCloseColor});
				return (
					<div className={'bod-block-close-btn' + ' align-' + attributes.btnCloseAlign}>
						<button type="button" style={classStyles} className="type_btn bod-btn">
							{attributes.btnCloseLabel}
						</button>
					</div>
				);
			}
		}

		return (

			<div className= {'bod-block-popup ' + 'align-' + attributes.textAlign}>
				{trigger()}
			
				{/* Modal Overlay */}
				<div style={bodFormatStyles ({'backgroundColor': attributes.overlayBackgdColor})} className="bod-block-popup-overlay" data-disabled-overlay-close={attributes.disableOverlayClose ? "true" : "false"}></div>
			
				<div role="dialog" aria-modal="false" aria-labelledby="" aria-describedby="" className={"bod-block-popup-wrap " + attributes.className}>
					{/* Modal Content */}
					<div style={bodFormatStyles ({'backgroundColor': attributes.modalBackgdColor, 'borderRadius': attributes.modalRadius})} className={"bod-block-popup " + attributes.modalSize}>
						<div id="" style={bodFormatStyles ({'backgroundColor': attributes.titleBackgdColor, 'padding': attributes.titlePadding}) } className = "bod-modal-title">
							<h2 style={bodFormatStyles ({'color': attributes.titleColor, 'fontSize': attributes.titleSize})}>{attributes.title}</h2>
						</div> {/* end title */}
						<div id=""  style={bodFormatStyles ({'padding': attributes.modalPadding})} className="bod-modal-content">
							{<InnerBlocks.Content/>}
							{closeBtn()}
						</div> {/* end content */}
						
					</div> {/* end modal content */}
					<div className="bod-block-popup-closer"></div>
				</div>

			</div>
		);
	}
};

/**
 * Register: Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'bod/modal-block', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Modal Block', 'bod-modal' ), // Block title.
	icon: <svg role="img" viewBox="0 0 114.31 122.88" xmlns="http://www.w3.org/2000/svg">
		<path class="custom-icon-modalblock" d="M69.88,71.65h35.78a8.68,8.68,0,0,1,8.65,8.66v33.92a8.67,8.67,0,0,1-8.65,8.65H69.88a8.67,8.67,0,0,1-8.65-8.65V80.31a8.68,8.68,0,0,1,8.65-8.66ZM26.26,78.12a3.35,3.35,0,0,1-3.17-3.46,3.29,3.29,0,0,1,3.17-3.45H42.9a3.34,3.34,0,0,1,3.17,3.45,3.29,3.29,0,0,1-3.17,3.46Zm75.19-18.46h-7V8.1a1.17,1.17,0,0,0-.33-.82A1.2,1.2,0,0,0,93.34,7H8.06a1.15,1.15,0,0,0-.82.33,1.13,1.13,0,0,0-.33.82v96.35a1.13,1.13,0,0,0,1.15,1.16H45.17v7H8.1A8.16,8.16,0,0,1,0,104.45V8.1A7.93,7.93,0,0,1,2.39,2.39,8,8,0,0,1,8.1,0H93.39A7.92,7.92,0,0,1,99.1,2.39a8,8,0,0,1,2.39,5.71c0,39.79,0-9.25,0,51.56ZM26.22,33.12a3.36,3.36,0,0,1-3.17-3.46,3.3,3.3,0,0,1,3.17-3.46H75.14a3.35,3.35,0,0,1,3.17,3.46,3.3,3.3,0,0,1-3.17,3.46Zm0,22.5a3.36,3.36,0,0,1-3.17-3.46,3.29,3.29,0,0,1,3.17-3.45H75.14a3.34,3.34,0,0,1,3.17,3.45,3.29,3.29,0,0,1-3.17,3.46ZM75.65,99.16a2.41,2.41,0,0,1-2.08-1c-1.1-1.64.4-3.26,1.43-4.41,3-3.23,9.61-9.08,11.07-10.79a2.4,2.4,0,0,1,3.76,0c1.51,1.76,8.53,8,11.33,11.1,1,1.1,2.18,2.59,1.16,4.1a2.42,2.42,0,0,1-2.08,1H95v9.4a3,3,0,0,1-2.95,3H83.82a3,3,0,0,1-2.95-3v-9.4Z"/></svg>, // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'widgets', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'modal' , 'bod-modal' ),
		__( 'popup' , 'bod-modal' ),
		__( 'window' , 'bod-modal' )
	],

	attributes: blockAttributes,


	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: function( {attributes, className, setAttributes, isSelected, clientId} ) {
		

		// If innerblock is selected then we want to keep parent modal block open
		// returns true if child innerblock is selected

		function checkInnerblockSelected () {

			const select = wp.data.select('core/block-editor');
//			const isParentOfSelectedBlock = useSelect( ( select ) => select( 'core/block-editor' ).hasSelectedInnerBlock( clientId, true ) );
			const isParentOfSelectedBlock = select.hasSelectedInnerBlock( clientId, true );
			return (isParentOfSelectedBlock ? true : false);			
			const selected = select.getBlockSelectionStart();
			const inner = select.getBlock(clientId).innerBlocks;
			for (let i = 0; i < inner.length; i++) {
				if (inner[i].clientId === selected || inner[i].innerBlocks.length && hasSelectedInnerBlock(inner[i])) {
					console.log ('innerblock clicked');
					return true;
				}
			}
			console.log ('innerblock not clicked');
			return false;
		}

		// hide fields if fieldtype does not match the one passed in
		// fieldvalue string or boolean
		// trigger string - trigger field to check against
		// e.g. of use fieldvalue - image - trigger showOn
		// if the value in the field showOn is != image then hide field
		// e.g. fieldvalue true - trigger  overrideLinkColor
		// if value of overrideLinkColor != true then hide

		function hideFields(fieldvalue , trigger) {
			if (Array.isArray(fieldvalue)) {
				return !fieldvalue.includes(attributes[trigger]) ? "hide" : "";
			} else {
				return attributes[trigger] !== fieldvalue ? "hide" : "";		
			}
		}

		// triggered when an image is selected 

		function onImageSelect(imageObject) {

			// setAttributes({ triggerImage: imageObject.id});
			setAttributes({ triggerImageSizes: imageObject.sizes});

			// check if we have a medium size if not use the original full size

			if (imageObject.sizes.medium !== undefined) {
				setAttributes({ 
					imgSize: 'medium',
					triggerImageSrc: imageObject.sizes.medium.url});
				
			} else {
				setAttributes({ 
					imgSize: 'full',
					triggerImageSrc: imageObject.sizes.full.url});
			}

			setAttributes({ triggerImageAlt: imageObject.alt});

			// we need to construct the labels for the image sizes select field
			let imgSizesArray = Object.keys(imageObject.sizes); // make array of image sizes object
			let labelSizes = [];
			imgSizesArray.forEach( (value, index) => {
				labelSizes.push({ label: value  , value: value });
			});
			setAttributes({ imgSizeLabels: labelSizes });

		}

		// triggered on image size change 

		function onImageSizeChange(imageSize) {

			setAttributes({ 
				imgSize: imageSize,
				triggerImageSrc: attributes.triggerImageSizes[imageSize].url 
			});

		}



		// format the trigger content which is either an image, link text, onload, class or btn

		const trigger = () => {
			if (attributes.showOn === 'image') {
				return (
					<a href="javascript:void(0)" className="bod-block-popup-trigger type_image">
						<img 
							className='trigger_image'
							src={attributes.triggerImageSrc} 
							alt={attributes.triggerImageAlt} 
						/>
					</a>
				);
			} else if (attributes.showOn === 'text') {
				let classStyles = '';
				if (attributes.overrideLinkColor) {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize, 'color' : attributes.textColor});
				} else {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize});
				}
				return (
					<a href="javascript:void(0)" style={classStyles} className="bod-block-popup-trigger type_text">
						{ attributes.triggerText }
					</a>					
				);
			} else if (attributes.showOn === 'load') {
				return (
					<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay}>{__('Modal on screen load','bod-modal')}</span>
				);
			} else if (attributes.showOn === 'selector') {
				return (
					<span className="bod-block-popup-trigger type_selector" data-selector={attributes.triggerSelector}>{__('Modal on class selector','bod-modal')}</span>
				);
			} else {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnBackgdColor, 'color' : attributes.btnColor});
				//console.log('in trigger returned class styles are :');
				//console.log(classStyles);
				return (
					<button type="button" style={classStyles} className="bod-block-popup-trigger type_btn bod-btn">
						{attributes.btnLabel}
					</button>
				);
			}
			
		}

		// Figure out if we need to display the title and innerblocks fields
		// we only display if block is currently selected 

		const dispTitleInnerBlock = (blockSelected) => {
			if (blockSelected || checkInnerblockSelected()) {
				return (
					<div>
						<PlainText
							onChange={ content => setAttributes({ title: content})}
							value={attributes.title}
							placeholder={__('Modal Title Text','bod-modal')}
						/>
				
						<label>{__('Modal Content:','bod-modal')}</label>
						<div className="bod-form-innerblock">
							<InnerBlocks />
						</div>
					</div>
				);
			} else {
				return null;
			}
		}
		
		return (
			<div>
			

			<div className= {'bod-block-popup ' + 'align-' + attributes.textAlign + ' ' + className}>
					{trigger()}
				
					{/* Modal Overlay */}
					<div style={bodFormatStyles ({'backgroundColor': attributes.overlayBackgdColor})} className="bod-block-popup-overlay"></div>
				
					{/* Modal Content */}
					<div  role="dialog" aria-modal="false" aria-labelledby="" aria-describedby=""  style={bodFormatStyles ({'backgroundColor': attributes.modalBackgdColor, 'borderRadius': attributes.modalRadius})} className={"bod-block-popup-wrap " + attributes.modalSize}>
						<div id="" style={bodFormatStyles ({'backgroundColor': attributes.titleBackgdColor, 'padding': attributes.titlePadding}) } className = "bod-modal-title">
							<h2 style={bodFormatStyles ({'color': attributes.titleColor, 'fontSize': attributes.titleSize})}>{attributes.title}</h2>
						</div> {/* end title */}
						<div id=""  style={bodFormatStyles ({'padding': attributes.modalPadding})} className="bod-modal-content">
							{/*<InnerBlocks.Content/>*/}
						</div> {/* end content */}
						<div className="bod-block-popup-closer"></div>
					</div> {/* end modal content */}

				</div>


				<div className="bod-form">

					{dispTitleInnerBlock(isSelected)}

					<InspectorControls>
						<PanelBody
							title={__('Trigger','bod-modal')}
							initialOpen={true}
							className="bod-form"
						>					
									{/*******************/}
									{/*    Trigger Tab  */}
									{/*******************/}

							<SelectControl
								label={__('Show On','bod-modal')}
								value={ attributes.showOn }
								options= {[
									{ label: __('Button Click','bod-modal'), value: 'btn' },
									{ label: __('Text Click','bod-modal'), value: 'text' },
									{ label: __('Image Click','bod-modal'), value: 'image' },
									{ label: __('Custom Element Click','bod-modal'), value: 'selector' },
									{ label: __('Page Load','bod-modal'), value: 'load' },
								]}
								onChange={ content => setAttributes({ showOn: content }) }
								/>


							<div className={hideFields('btn','showOn')}>

								<label>{__('Button Label:','bod-modal')}</label>	
								<PlainText
									onChange={ content => setAttributes({ btnLabel: content }) }
									value={ attributes.btnLabel }
									placeholder={__('Text to appear on button','bod-modal')}
								/>

								<label>{__('Button Background Color:','bod-modal')}</label>	
								<ColorPicker
									color={ attributes.btnBackgdColor }
									onChangeComplete={ ( color ) => setAttributes({ btnBackgdColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
								/>		

								<label>{__('Button Color:','bod-modal')}</label>	
								<ColorPicker
									color={ attributes.btnColor }
									onChangeComplete={ ( color ) => setAttributes({ btnColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
								/>	

							</div> {/* end button wrapper */}
						

							<div className={hideFields('image' , 'showOn')}>

								{/* Trigger Image */}

								<label>{__('Image: ','bod-modal')}</label>
								<MediaUpload
									onSelect={onImageSelect}
									type="image"
									value={attributes.triggerImageSrc}
									render={({open}) => (
										<a onClick={open} className="bod-trigger-image-container">
										<img src={attributes.triggerImageSrc}/>
									</a>
									)}
								/>

								{/* Trigger Image Size */}

								<SelectControl
									label={__('Image Size:','bod-modal')}
									value={ attributes.imgSize}
									options= {attributes.imgSizeLabels}
									onChange={ onImageSizeChange }
								/>

							</div> {/* end hide fields */}

							<div className={hideFields('text' , 'showOn')}>

								{/* Trigger Text */}

								<label>{__('Text:','bod-modal')}</label>
								<PlainText
									onChange={ content => setAttributes({ triggerText: content }) }
									value={ attributes.triggerText }
									placeholder={__('Trigger text','bod-modal')}
								/>

								{/* Trigger Text Size */}

								<label>{__('Text Size:','bod-modal')}</label>	
								<PlainText
									onChange={ content => setAttributes({ textSize: content }) }
									value={ attributes.textSize }
									placeholder={__('Trigger link text size','bod-modal')}
								/>

								{/* Override Theme Colors */}

								<CheckboxControl
									label={__('Override Theme Text Color:','bod-modal')}
									checked={ attributes.overrideLinkColor }
									onChange={ (isChecked) => 
											setAttributes({overrideLinkColor: isChecked})
									}
								/>

								{/* Trigger Text Color */}

								<div className={hideFields(true , 'overrideLinkColor')}>
									<label>{__('Text Color:','bod-modal')}</label>	
									<ColorPicker
										color={ attributes.textColor }
										onChangeComplete={ ( color ) => setAttributes({ textColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
									/>	
								</div>	
							</div>

							<div className={hideFields(['text','image','btn'] , 'showOn')}>

								{/* Align Trigger Text / Image*/}

								<SelectControl
								label={__('Button / Text / Image Align','bod-modal')}
								value={ attributes.textAlign }
								options= {[
									{ label: __('Left','bod-modal'), value: 'left' },
									{ label: __('Center','bod-modal'), value: 'center' },
									{ label: __('Right','bod-modal'), value: 'right' },
								]}
								onChange={ content => setAttributes({ textAlign: content }) }
								/>
							</div>

							<div className={hideFields('load' , 'showOn')}>

								{/* Show Delay */}

								<label>{__('Delay Before Showing Modal:','bod-modal')}</label>	
								<PlainText
									onChange={ content => setAttributes({ showDelay: content }) }
									value={ attributes.showDelay }
									placeholder={__('Delay before showing modal popup','bod-modal')}
								/>		

								<SelectControl
									label={__('Show Once','bod-modal')}
								value={ attributes.showOnce }
								options= {[
									{ label: __('No','bod-modal'), value: 'no' },
									{ label: __('Yes','bod-modal'), value: 'yes' },
								]}
								onChange={ content => setAttributes({ showOnce: content }) }
								/>

								{/* No Show Days */}

								<label>{__('Show Once Every X Days')}</label>	
								<PlainText
									onChange={ content => setAttributes({ noShowDays: content }) }
									value={ attributes.noShowDays }
									placeholder={__('Number of Days','bod-modal')}
								/>

								{/* Modal ID */}

								<label>{__('Modal Identifier')}</label>	
								<PlainText
									onChange={ content => setAttributes({ modalId: content }) }
									value={ attributes.modalId }
									placeholder={__('Modal Id','bod-modal')}
								/>		
							</div>

							<div className={hideFields('selector', 'showOn')}>

								{/* Trigger Class Selector */}

								<label>{__('Trigger Class Selector:','bod-modal')}</label>	
								<PlainText
									onChange={ content => setAttributes({ triggerSelector: content }) }
									value={ attributes.triggerSelector }
									placeholder={__('Trigger Class Selector','bod-modal')}
								/>
							</div>

						</PanelBody>
						<PanelBody
							title={__('Style','bod-modal')}
							initialOpen={false}
							className="bod-form"
						>
									{/*******************/}
									{/*     Style Tab   */}
									{/*******************/}

							{/* Overlay background color */}

							<label>{__('Overlay Background Color:','bod-modal')}</label>	
							<ColorPicker
								color={ attributes.overlayBackgdColor }
								onChangeComplete={ ( color ) => setAttributes({ overlayBackgdColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
							/>		

							{/* Title Size */}

							<label>{__('Title Text Size:','bod-modal')}</label>	
							<PlainText
								onChange={ content => setAttributes({ titleSize: content }) }
								value={ attributes.titleSize }
								placeholder={__('Modal Title Text Size px, em, rem, %','bod-modal')}
							/>	
							
							{/* Title color */}

							<label>{__('Modal Title Color:','bod-modal')}</label>	
							<ColorPicker
								color={ attributes.titleColor }
								onChangeComplete={ ( color ) => setAttributes({ titleColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
							/>	

							
							{/* Title background color */}

							<label>{__('Modal Title Background Color:','bod-modal')}</label>	
							<ColorPicker
								color={ attributes.titleBackgdColor }
								onChangeComplete={ ( color ) => setAttributes({ titleBackgdColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
							/>	

							{/* Title Padding*/}

							<label>{__('Title Padding:','bod-modal')}</label>	
							<PlainText
								onChange={ content => setAttributes({ titlePadding: content }) }
								value={ attributes.titlePadding }
								placeholder={__('Title padding px, em, rem, %','bod-modal')}
							/>	

							{/* Modal Size */}

							<SelectControl
							label={__('Modal Size - Width','bod-modal')}
							value={ attributes.modalSize }
							options= {[
								{ label: __('Small 400px','bod-modal'), value: 'size-s' },
								{ label: __('Medium 600px','bod-modal'), value: 'size-m' },
								{ label: __('Large 800px','bod-modal'), value: 'size-l' },
								{ label: __('XL 1000px','bod-modal'), value: 'size-xl' },
								{ label: __('Fullscreen','bod-modal'), value: 'size-f' },
							]}
							onChange={ content => setAttributes({ modalSize: content }) }
							/>


							{/* Modal background color */}

							<label>{__('Modal Background Color:','bod-modal')}</label>	
							<ColorPicker
								color={ attributes.modalBackgdColor }
								onChangeComplete={ ( color ) => setAttributes({ modalBackgdColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
							/>

							{/* Modal Padding*/}

							<label>{__('Modal Padding:','bod-modal')}</label>	
							<PlainText
								onChange={ content => setAttributes({ modalPadding: content }) }
								value={ attributes.modalPadding }
								placeholder={__('Modal padding px, em, rem, %','bod-modal')}
							/>	

							{/* Modal Border Radius */}

							<label>{__('Modal Border Radius:','bod-modal')}</label>	
							<PlainText
								onChange={ content => setAttributes({ modalRadius: content }) }
								value={ attributes.modalRadius }
								placeholder={__('Modal radius for border','bod-modal')}
							/>	

							{/* Disable Overlay Close */}

							<ToggleControl
								label={__('Disable Close on Overlay Click','bod-modal')}
								checked={ attributes.disableOverlayClose}
								onChange={ () => setAttributes({ disableOverlayClose : !attributes.disableOverlayClose }) }
							/>

							{/* Disable Overlay Close */}

							<ToggleControl
								label={__('Disable Close on Escape Btn','bod-modal')}
								checked={ attributes.disableEscapeClose}
								onChange={ () => setAttributes({ disableEscapeClose : !attributes.disableEscapeClose }) }
							/>

							{/* Close Btn */}

							<SelectControl
								label={__('Show Close Btn','bod-modal')}
							value={ attributes.showCloseBtn }
							options= {[
								{ label: __('No','bod-modal'), value: 'no' },
								{ label: __('Yes','bod-modal'), value: 'yes' }
							]}
							onChange={ content => setAttributes({ showCloseBtn: content }) }
							/>

							<div className={hideFields('yes','showCloseBtn')}>

								<label>{__('Close Btn Label:','bod-modal')}</label>	
								<PlainText
									onChange={ content => setAttributes({ btnCloseLabel: content }) }
									value={ attributes.btnCloseLabel }
									placeholder={__('Text to appear on close button','bod-modal')}
								/>

								<label>{__('Close Button Bg Color:','bod-modal')}</label>	
								<ColorPicker
									color={ attributes.btnCloseBackgdColor }
									onChangeComplete={ ( color ) => setAttributes({ btnCloseBackgdColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
								/>		

								<label>{__('Close Button Text Color:','bod-modal')}</label>	
								<ColorPicker
									color={ attributes.btnCloseColor }
									onChangeComplete={ ( color ) => setAttributes({ btnCloseColor: 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')'}) }
								/>	

								{/* Align Trigger Text / Image*/}

								<SelectControl
								label={__('Close Button Align','bod-modal')}
								value={ attributes.btnCloseAlign }
								options= {[
									{ label: __('Left','bod-modal'), value: 'left' },
									{ label: __('Center','bod-modal'), value: 'center' },
									{ label: __('Right','bod-modal'), value: 'right' },
								]}
								onChange={ content => setAttributes({ btnCloseAlign: content }) }
								/>

							</div> {/* end close button wrapper */}


						</PanelBody>
						
					</InspectorControls>
				</div> {/* end bod-form */}


			</div>
		);

	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( {attributes} ) {


		// format the trigger content which is either an image, link text, 

		const trigger = () => {
			if (attributes.showOn === 'image') {
				return (
					<a href="javascript:void(0)" className="bod-block-popup-trigger type_image">
						<img 
							className='trigger_image'
							src={attributes.triggerImageSrc} 
							alt={attributes.triggerImageAlt}
						/>
					</a>
				);
			} else if (attributes.showOn === 'text') {
				let classStyles = '';
				if (attributes.overrideLinkColor) {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize, 'color' : attributes.textColor});
				} else {
					classStyles = bodFormatStyles ({'fontSize': attributes.textSize});
				}
				return (
					<a href="javascript:void(0)" style={classStyles} className="bod-block-popup-trigger type_text">
						{ attributes.triggerText }
					</a>					
				);
			} else if (attributes.showOn === 'load') {
				if (attributes.showOnce !== 'no') {
				return (
					<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay} data-once={attributes.showOnce} data-id={attributes.modalId} data-days={attributes.noShowDays}></span>
				);
				} else {
					return (
						<span className = "bod-block-popup-trigger type_load" data-delay={attributes.showDelay}></span>
					);					
				}
			} else if (attributes.showOn === 'selector') {
				return (
					<span className="bod-block-popup-trigger type_selector" data-selector={attributes.triggerSelector}></span>
				);
			} else {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnBackgdColor, 'color' : attributes.btnColor});
				return (
					<button type="button" style={classStyles} className="bod-block-popup-trigger type_btn bod-btn">
						{attributes.btnLabel}
					</button>
				);
			}
			
		}

		// format the close button 

		const closeBtn = () => {
			if (attributes.showCloseBtn === 'yes') {
				let classStyles = bodFormatStyles ({'backgroundColor': attributes.btnCloseBackgdColor, 'color' : attributes.btnCloseColor});
				return (
					<div className={'bod-block-close-btn' + ' align-' + attributes.btnCloseAlign}>
						<button type="button" style={classStyles} className="type_btn bod-btn">
							{attributes.btnCloseLabel}
						</button>
					</div>
				);
			}
		}

		return (

			<div className= {'bod-block-popup ' + 'align-' + attributes.textAlign}>
				{trigger()}
			
				{/* Modal Overlay */}
				<div style={bodFormatStyles ({'backgroundColor': attributes.overlayBackgdColor})} className="bod-block-popup-overlay" data-disabled-overlay-close={attributes.disableOverlayClose ? "true" : "false"}  data-disabled-escape-close={attributes.disableEscapeClose ? "true" : "false"}></div>
			
				<div role="dialog" aria-modal="false" aria-labelledby="" aria-describedby="" className={"bod-block-popup-wrap " + attributes.className}>
					{/* Modal Content */}
					<div style={bodFormatStyles ({'backgroundColor': attributes.modalBackgdColor, 'borderRadius': attributes.modalRadius})} className={"bod-block-popup " + attributes.modalSize}>
						<div id="" style={bodFormatStyles ({'backgroundColor': attributes.titleBackgdColor, 'padding': attributes.titlePadding}) } className = "bod-modal-title">
							<h2 style={bodFormatStyles ({'color': attributes.titleColor, 'fontSize': attributes.titleSize})}>{attributes.title}</h2>
						</div> {/* end title */}
						<div id=""  style={bodFormatStyles ({'padding': attributes.modalPadding})} className="bod-modal-content">
							{<InnerBlocks.Content/>}
							{closeBtn()}
						</div> {/* end content */}
						
					</div> {/* end modal content */}
					<div className="bod-block-popup-closer"></div>
				</div>

			</div>
		);
	},
	deprecated: [ v2, v1],
} );
