# Modal Block

This project provides a modal / popup block for the  WordPress Gutenberg editor.

## Features

- Multiple methods for triggering modal including button, text link, image link, external class, and page load.
- User definable modal content using Gutenberg blocks, for example, image, paragraph etc. 
- Supports multiple modals on the same page.
- Uses create-guton-block for easy config.

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

### Style Options

**Overlay Background Color** RGBA / Hex modal overlay color.

**Title Text Size** Title uses H2 tag, this is used to change the size.

**Modal Title Color** RGBA / Hex color to use for modal title text.

**Modal Title Background Color** RGBA / Hex color for modal title box.

**Title Padding** Padding around the title box. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard padding css format.

**Modal Size** One of Small (max 400px wide), Medium (max 600px wide), Large (max 800px wide),  XL (max 100px wide), FullScreen.

**Modal Background Color** RGBA / Hex color for modal background.

**Modal Padding** Padding around modal portion of window. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard padding css format.

**Modal Border Radius** Used to create rounded corners. Can be px, em, rem, % or mix of values. For example, '10px', '5rem 10px', '10px 5px 10px 10px'. Specify a max of 4 values in standard border-radius css format.

**Disable Close on Overlay Click** Toogle defaults to off. If set to on then user cannot close modal by clicking on overlay.

**Disable Close on Escape** Toogle defaults to off. If set to on then user cannot close modal by pressing Escape key.

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
