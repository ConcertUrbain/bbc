
$(function()
{
	// Permet de gérer les click au niveau des "div" parent d'un lien (plutôt qu'au niveau du lien lui-même)
	$(document).delegate("a", "click", function(evt) {
		var href = $(this).attr("href");
		if (href == "#") evt.preventDefault();
	});	
	
	
		
	/* BACKBONE */
	
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Views  = {};
	
	App.Views.appView = new Dring13AppView();
	App.Views.appView.connectToWebServices();

});



/*

Bug Vidéo :
http://ms.dring93.org/m/MC-cFFaYWpV-V.flv
http://ms.dring93.org/m/MC-cFFaYWpV-V.mp4

*/

