/*
 * YouPlay (v1.2)
 * https://github.com/esquivias/YouPlay
 */
var YouPlay = (function($, undefined){
	'use strict';
	function YouPlay(element){
		this.youtube = {
			api_key: $(element).data('youplay-api-key'),
			playlist_id: $(element).data('youplay-playlist-id'),
			uid: (Math.random().toString(16).substr(2,8)),
			url: {
				playlists: 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id={{PLAYLIST_ID}}&key={{API_KEY}}',
				playlist_items: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults={{MAX_RESULTS}}&playlistId={{PLAYLIST_ID}}&key={{API_KEY}}'
			}
		}
		this.option = $.extend({
			autoplay: false,
			autonext: true,
			loop: true,
			mute: false,
			max_results: 50,
			thumbnail_quality: 'high',
			active_class: 'active',
			player_class: 'embed-responsive-item',
			callback: null,
			debug: false
		},{
			autoplay: $(element).data('youplay-autoplay'),
			autonext: $(element).data('youplay-autonext'),
			loop: $(element).data('youplay-loop'),
			mute: $(element).data('youplay-mute'),
			max_results: $(element).data('youplay-max-results'),
			thumbnail_quality: $(element).data('youplay-thumbnail-quality'),
			active_class: $(element).data('youplay-active-class'),
			player_class: $(element).data('youplay-player-class'),
			callback: $(element).data('youplay-callback'),
			debug: $(element).data('youplay-debug')
		});
		this.object = {
			player: $(element).find("[data-youplay-player]"),
			playlist_title: $(element).find("[data-youplay-playlist-title]"),
			playlist_description: $(element).find("[data-youplay-playlist-description]"),
			playlist_items: $(element).find("[data-youplay-playlist-items]"),
			playlist_item: $(element).find("[data-youplay-playlist-item]")
		}
		this.init(element);
	}
	YouPlay.prototype = {
		init: function(element){
			if(typeof this.youtube.api_key === 'undefined' || typeof this.youtube.playlist_id === 'undefined'){
				if(this.option.debug){
					if(typeof this.youtube.api_key === 'undefined'){
						console.error("Missing required data-youplay-api-key attribute.\nhttps://developers.google.com/youtube/v3/getting-started");
					}else if(typeof this.youtube.playlist_id === 'undefined'){
						console.error("Missing required data-youplay-playlist-id attribute.");
					}
				}
				return false;
			}
			if(typeof YT === 'undefined'){
				var tag = document.createElement('script'), htag = document.getElementsByTagName('head')[0];
				tag.src = 'https://www.youtube.com/player_api';
				htag.appendChild(tag);
			}
			if(typeof $(element).data('youplay-autoplay') !== 'undefined'){
				if(typeof $(element).data('youplay-mute') === 'undefined'){
					this.option.mute = true;
					if(this.option.debug){
						console.log("YouPlay will automatically mute audio when autoplay is enabled.");
					}
				}
			}
		},
		onYouTubeIframeAPIReady: function(){
			this.populatePlaylist();
			this.populatePlaylistItems();
		},
		requestYouTubeURL: function(name){
			return this.youtube.url[name].replace('{{PLAYLIST_ID}}', this.youtube.playlist_id).replace('{{API_KEY}}', this.youtube.api_key).replace('{{MAX_RESULTS}}', this.option.max_results);
		},
		prepareCallback: function(method, data){
			if(this.option.callback !== null){
				if(typeof window[this.option.callback] !== 'undefined'){
					if(typeof window[this.option.callback][method] !== 'undefined'){
						window[this.option.callback][method](data);
					}else{
						if(this.option.debug){
							console.log('YouPlay callback ' + this.option.callback + '.' + method + ' not found.');
						}
					}
				}else{
					if(this.option.debug){
						console.error('YouPlay callback ' + this.option.callback + ' not found.');
					}
				}
			}
		},
		prepareValueFormat: function(attribute, data){
			if(this.option.callback !== null){
				if(typeof window[this.option.callback] !== 'undefined'){
					if(typeof window[this.option.callback]['onFormat'] !== 'undefined'){
						if(typeof window[this.option.callback]['onFormat'][attribute] !== 'undefined'){
							data = window[this.option.callback]['onFormat'][attribute](data);
						}
					}
				}
			}
			return data;
		},
		populatePlaylist: function(){
			var url = this.requestYouTubeURL('playlists');
			$.ajaxSetup({cache: false});
			$.ajax(url, {
				context: this,
				dataType: 'json',
				crossDomain: true,
				error: function(){},
				success: function(data){
					this.object.playlist_title.html(data.items[0].snippet.title);
					this.object.playlist_description.html(data.items[0].snippet.description);
				}
			});
		},
		populatePlaylistItems: function(){
			var this_ = this, url = this.requestYouTubeURL('playlist_items');
			this.object.playlist_items.html('');
			$.ajaxSetup ({cache: false});
			$.ajax(url, {
				context: this,
				dataType: 'json',
				crossDomain: true,
				error: function(){},
				success: function(data){
					if(data.kind === 'youtube#playlistItemListResponse'){
						$.each(data.items, function(index, item){
							this_.populatePlaylistItem(item, this_.object.playlist_item);
						});
						this.populateYouTubePlayer();
					}
				}
			});
		},
		populatePlaylistItem: function(item, element){
			var this_ = this, template = element.clone();
			if(typeof item.status === 'undefined' || $.inArray(item.status.uploadStatus, ['rejected', 'deleted', 'failed']) === -1 && typeof item.snippet.thumbnails !== 'undefined'){
				if(typeof item.snippet.thumbnails === 'undefined'){
					if(this.option.debug){
						console.log("YouPlay is not able to load " + item.snippet.resourceId.videoId + ", a private video.");
					}
				}else{
					var data = $.extend({
						id: item.snippet.resourceId.videoId,
						thumbnail: item.snippet.thumbnails[this.option.thumbnail_quality].url
					},
						item.snippet
					);
					$.each(data, function(attribute, value){
						value = this_.prepareValueFormat(attribute, value);
						var tag = $(template).find('[data-youplay-playlist-item-'+attribute+']');
						if(tag.prop('tagName') != "IMG"){
							tag.html(value);
						}else{
							var titleFormat = this_.prepareValueFormat('title', data.title);
							tag.attr('src', value).attr('alt', titleFormat).attr('title', titleFormat);
						}
					});
					template.attr('data-youplay-video-id', data.id).appendTo(this.object.playlist_items);
				}
			}
		},
		populateYouTubePlayer: function(){
			var this_ = this;
			this.object.player.attr('id', 'YouPlay' + this.youtube.uid).addClass(this.option.player_class);
			this.object.YT_player = new YT.Player(this.object.player.attr('id'), {
				playerVars: {
					enablejsapi: 1,
					modestbranding: 1,
					rel: 0,
					wmode: 'transparent'
				},
				events: {
					'onReady': function(){
						this_.onYouTubePlayerReady();
					},
					'onStateChange': function(e){
						this_.onYouTubePlayerStateChange(e);
					},
					'onError': function(e){
						if(this_.option.debug){
							console.log(e);
						}
						this_.prepareCallback('onError', e);
					}
				}
			});
		},
		onYouTubePlayerReady: function(){
			var this_ = this;
			this.object.playlist_items.find('[data-youplay-playlist-item]').bind('click', function(e){
				e.preventDefault();
				this_.object.playlist_items.find('[data-youplay-playlist-item]').removeClass(this_.option.active_class);
				$(this).addClass(this_.option.active_class);
				this_.object.YT_player.loadVideoById($(this).data('youplay-video-id'));
				this_.prepareCallback('onPlaylistItem', this);
			});
			if(this.option.autoplay){
				if(this.object.playlist_items.find('.' + this.option.active_class).length === 0){
					this.object.playlist_items.find('[data-youplay-playlist-item]').first().click();
				}
				this.prepareCallback('onReady', true);
			}else{
				this.object.YT_player.cueVideoById(this.object.playlist_items.find('[data-youplay-playlist-item]').first().addClass(this.option.active_class).data('youplay-video-id'));
			}
			this.prepareCallback('onReady', false);
		},
		onYouTubePlayerStateChange: function(e){
			if (typeof e !== 'undefined'){
				if(this.option.mute){
					this.object.YT_player.mute();
				}
				var next = null;
				if(e.data === 0 && this.option.autonext){
					next = this.object.playlist_items.find('[data-youplay-playlist-item].' + this.option.active_class).next()
					if(next.length === 0 && this.option.loop){
						next = this.object.playlist_items.find('[data-youplay-playlist-item]').first();
						this.prepareCallback('onLoop', true);
					}else{
						this.prepareCallback('onAutonext', next);
					}
					next.click();
				}
			}
		}
	}
	return YouPlay;
}(jQuery));
$.fn.YouPlay = function(){
	return this.each(function(){
		this.youplay_object = new YouPlay(this);
	});
};
$(document).ready(function(){
	$('[data-youplay-playlist-id]').each(function(index, element){
		if(typeof element.youplay_object === 'undefined'){
			$(this).YouPlay();
		}
	});
});
function onYouTubeIframeAPIReady(){
	$('[data-youplay-playlist-id]').each(function(index, element){
		if(typeof element.youplay_object === 'undefined'){
			console.error('YouPlay cannot initialize playlist ' + $(this).data('youplay-playlist-id'));
		}else{
			element.youplay_object.onYouTubeIframeAPIReady();
		}
	});
}