# YouPlay
A simple YouTube playlist with player that works with any responsive framework.

## Requirements

_To get started, you need a [YouTube (v3) API Key](https://developers.google.com/youtube/v3/getting-started)._

**In addition, you will need to include the following Javascript files:**

* `jQuery (1.9.1+)`
* `youplay.js`

## Usage

YouPlay will generate a playlist based on the markup structure that you provide.

**Basic `HTML` Structure Example**

````html
<div data-youplay-playlist-id="" data-youplay-api-key="">
	<div data-youplay-player></div>
	<ul data-youplay-playlist-items>
		<li data-youplay-playlist-item>
			<h2 data-youplay-playlist-item-title></h2>
			<img data-youplay-playlist-item-thumbnail />
		</li>
	</ul>
</div>
````

_**That's it.** There's no need to initialize or configure YouPlay with Javascript._

That conveniently takes us to how we actually configure YouPlay...

## Required Data Attributes

These attributes need to be defined, self explanatory:

* **data-youplay-api-key**
* **data-youplay-playlist-id**

## Optional Data Attributes
* **data-youplay-autoplay**
  
  _false_ | true

* **data-youplay-autonext**

  _true_ | false

* **data-youplay-loop**

  _true_ | false

* **data-youplay-mute**

  _false_ | true
  
  _Must be set to true if autoplay is enabled._

* **data-youplay-max-results**

  _50_

* **data-youplay-thumbnail-quality**

  _high_ | default

### Optional Data Attributes _(Presentation)_
* **data-youplay-active-class**

  _active_

* **data-youplay-player-class**

  _embed-responsive-item_


## Player Objects (DOM):

* **data-youplay-player**

  _Replaced with YouTube Iframe_

* **data-youplay-playlist-title**

* **data-youplay-playlist-description**

* **data-youplay-playlist-items**

  _Playlist Item Container_
  
  * **data-youplay-playlist-item**
  
    _Playlist Item Template_

## Notes

No assumptions are made about the design or presentation, but take a look at some of the examples to see it working with framework components.
