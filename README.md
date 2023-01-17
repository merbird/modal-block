# Modal Block

This project provides a modal / popup block for the  WordPress Gutenberg editor.

## Features

- Multiple methods for triggering modal including button, text link, image link, external class, and page load.
- User definable modal content using Gutenberg blocks, for example, image, paragraph etc. 
- Supports multiple modals on the same page.
- Custom events, before open, after open, before close, after close
- Allows for manual initialization of modal windows. For use when content changes after document is ready.
- Allows for modal to modal links. Just add the class bod-modal-to-modal to the trigger link
- Uses create-guten-block for easy config.

## Custom Events

Provides 4 events to allow for custom code interaction with the modal, bod-modal-before-open, bod-modal-after-open, bod-modal-before-close  and bod-modal-after-close. The bod-modal-before-close event also includes the ability to return a cancel data element which if set to true will cancel the close event for the modal, i.e. keep the modal window open. This allows for custom validation to be performed before the modal closes.

    $(document).on("bod-modal-before-close", function(e, modalData){
	    $(this).data('cancel', true);
	    this.$modalData = $(modalData);
	    this.$modalData.addClass('newClass');
    });

## Manual Initialization

Allows for manual modal initialization, i.e. reload modal data from page. This is useful if data is changed after the document is ready. This is performed by calling the following JavaScript function:

	bodModal.initModal();

## Options

**Modal Title** Title to display at the top of the modal window.

**Modal Content** Block into which you can add other blocks to create required modal content.

### Trigger Options

**Show On** Defines how the modal window will be triggered. Possible values are Button Click, Image Click, Text Click, Custom Element Click, Page Load.

#### Button Click Options

**Label** Text to display inside button.

**Background Color** RGBA/Hex color to display for button background color. 

**Color** RGBA/Hex color for button label text.

**Align** Align button to left / center / right .

#### Text Click Options

**Text** Link text.

**Size** px / rem / em / % text size. Defaults to px (do not insert space between value amd size type).

**Override Theme Text Color** allows user to define link text color to use.

**Color** RGBA/Hex color for link text.

**Align** Align text to left / center / right. 

#### Image Click Options

**Image** Image to use for model trigger.

**Size** Selects theme image size to use, for example, thumbnail, medium, large, full etc. 

**Align** Align image to left / center / right 

#### Custom Element Click Options

**Trigger Class** Class name on which to attach the trigger event.

#### Page Load Options

**Delay Before Showing Modal** Timer delay in ms before displaying modal (1000 = 1 second).

**Display Once** Display the modal one time only.

**Modal Id** Optional ID used to identify modals on different pages as the same. That is, all modals with the same ID and Display Once set to yes are treated as the same modal. Used to stop same modal on different pages being displayed more than once.

**Show Once Every x Days** Optional number of days before display once expires and modal is shown again. If not set defaults to 30 days.

**URL Content Trigger** Only trigger modal if the URL contains this text

### Modal Options

**Modal Transition** How to transition the modal on the screen. One of Fade, From Left, From Right, From Bottom, From Top.

**Overlay Background Color** RGBA / Hex modal overlay color.

**Modal Size** One of Small (max 400px wide), Medium (max 600px wide), Large (max 800px wide),  XL (max 100px wide), FullScreen.

**Modal Border Radius** Used to create rounded corners. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard border-radius css format.

**Disable Close on Overlay Click** Toogle defaults to off. If set to on then user cannot close modal by clicking on overlay.

**Disable Close on Escape** Toogle defaults to off. If set to on then user cannot close modal by pressing Escape key.

### Title Options

**Title Text Size** Title uses H2 tag, this is used to change the size.

**Title Align** Left, Center, Right

**Modal Title Color** RGBA / Hex color to use for modal title text.

**Modal Title Background Color** RGBA / Hex color for modal title box.

**Title Padding** Padding around the title box. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard padding css format.

**Show Close X in Title** If selected a close 'X' button will be shown in the title bar of the modal. Note the screen level close X will not be shown.

**Close X Size** Size of close 'X' in title. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard padding css format.

### Content Options

**Modal Background Color** RGBA / Hex color for modal background.

**Background Image** Background Image to use for modal content area. Displays a centered image with the background-size set to cover. 

**Modal Padding** Padding around modal portion of window. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard padding css format.

**Show Close Btn** Defaults to N. If yes close button is displayed in the modal window.

**Close Btn Label** Label text for close button.

**Close Btn Bg Color** Bavkground color for close button.

**Close Btn Text Color** Color for close button text.

**Close Button Align** Align the close button to the left, center or right in the modal window. 

## Requirements

Wordpress 5+

## Setup

Download this folder in your Wordpress plugins directory

# Development Environment
This project was bootstrapped with [Create Guten Block](https://github.com/ahmadawais/create-guten-block).

## Requirements
Node.js

## Setup

```
cd /wp-content/plugins/modal-block/
npm install
```
To start developing
```
npm start
```

To build
```
npm run build
```

---

This project was bootstrapped with [Create Guten Block](https://github.com/ahmadawais/create-guten-block).
