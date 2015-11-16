
function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		//obj["attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				//obj["attributes"][attribute.nodeName] = attribute.nodeValue;
				obj[attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue.trim(); // add trim here
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				var tmp = xmlToJson(item);
				if(tmp != "") // if not empty string
					obj[nodeName] = tmp;
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				var tmp = xmlToJson(item);
				if(tmp != "") // if not empty string
					obj[nodeName].push(tmp);
			}
		}
	}
	return obj;
};


$(function()
{
	/* BACKBONE */
	
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Views  = {};
	
	App.Views.appView = new BBCAppView();

	// Permet de gérer les click au niveau des "div" parent d'un lien (plutôt qu'au niveau du lien lui-même)
	$(document).delegate("a", "click", function(evt) {
		var href = $(this).attr("href");
		if (href == "#") evt.preventDefault();
	});	

	// XML
	$.get("../bbc.xml", function(xml)
	{
		var json = xmlToJson(xml);
		var queries = json.bbc.query;
		
		// console.log(JSON.stringify(json.bbc.query));

		var i, n = queries.length;
		var queryObj, queryId, querySubFolder, queryImages, queryBackgroundSound;
		var queryCarteObj, queryCarteBitmap; 
		
		var queryCarteTopLeftObj, queryCarteTopLeft, queryCarteBottomRightObj, queryCarteBottomRight;
		var queryCarteTop, queryCarteLeft, queryCarteBottom, queryCarteRight;
		
		var queryJSON;
		
		App.Collections.queriesMedias = new QueriesMediasCollection();
		
		for(i=0; i<n; i++)
		{
			queryObj = queries[i];
			
			queryId = queryObj.id;
			
			querySubFolder = queryObj.subfolder;
			queryBackgroundSound = queryObj.backgroundSound;
			queryImages = queryObj.images["#text"].split(",");
			
			queryCarteTop = null;
			queryCarteLeft = null;
			queryCarteBottom = null;
			queryCarteRight = null;
			
			queryCarteObj = queryObj.carte;
			
			if (queryCarteObj)
			{
				queryCarteBitmap = queryCarteObj.image["#text"];
				
				queryCarteTopLeftObj = queryCarteObj.topleft["#text"];
				queryCarteBottomRightObj = queryCarteObj.bottomright["#text"];
				
				
				if (queryCarteTopLeftObj)
				{
					queryCarteTopLeft = queryCarteTopLeftObj.split(" ").join("").split(",");
					queryCarteTop = queryCarteTopLeft[0];
					queryCarteLeft = queryCarteTopLeft[1];
				}
				
				if (queryCarteBottomRightObj)
				{
					queryCarteBottomRight = queryCarteBottomRightObj.split(" ").join("").split(",");
					queryCarteBottom = queryCarteBottomRight[0];
					queryCarteRight = queryCarteBottomRight[1];
				}
			}
			
			queryJSON = {	id:queryId, subfolder:querySubFolder, backgroundSound:queryBackgroundSound, 
							images:queryImages, carte:queryCarteBitmap, 
							carteTop:queryCarteTop, carteLeft:queryCarteLeft, 
							carteBottom:queryCarteBottom, carteRight:queryCarteRight
						};
			
			// On stocke les différentes données associées à chaque Query
			App.Collections.queriesMedias.add( new QueryMediasModel(queryJSON) );
			
			// console.log(App.Collections.queriesMedias.at(0));			
			// console.log(queryId, queryImages, queryCarteBitmap, queryCarteTopLeft, queryCarteBottomRight);
		}
		
		App.Views.appView.connectToWebServices();

	});	
	
});



	/*
		Données BBC
	
		"VO":{"__className":"Vo_Item","id":"1520","title":"Champ de bataille","description":"","_isValid":false,"_user":"328","rate":102505,"addDate":"2013.11.16 12:33:06","setDate":"2013.11.16 12:57:18","__className":"Vo_Item"},
		"user":{"__className":"Vo_User","id":"328","firstName":"","lastName":"Artistes \u00e0 la Bastille","pseudo":"Artistes a la Bastille","password":null,"email":"carolannbraun@free.fr","role":null,"_isBan":"0","addDate":"2013.11.16 12:35:17","setDate":"2013.11.16 12:35:17","__className":"Vo_User"},
		"datas":{"Carto":[{"__className":"Vo_Data_Carto","x":"48.8487","y":"2.37807","id":"866","addDate":"2013.11.16 12:33:07","setDate":"2013.11.16 12:33:07","__className":"Vo_Data_Carto"}],
		"Vote":[
			{"__className":"Vo_Data_Vote","rate":"4588","user":"327","id":"3614","addDate":"2013.11.16 12:33:08","setDate":"2013.11.16 12:33:08","__className":"Vo_Data_Vote"},
			{"__className":"Vo_Data_Vote","rate":"32639","user":"0","id":"3891","addDate":"2013.12.04 00:36:29","setDate":"2013.12.04 00:36:29","__className":"Vo_Data_Vote"},
			{"__className":"Vo_Data_Vote","rate":"32639","user":"0","id":"3925","addDate":"2013.12.04 08:21:55","setDate":"2013.12.04 08:21:55","__className":"Vo_Data_Vote"},
			{"__className":"Vo_Data_Vote","rate":"32639","user":"0","id":"3942","addDate":"2013.12.04 08:29:15","setDate":"2013.12.04 08:29:15","__className":"Vo_Data_Vote"},
			{"__className":"Vo_Data_Vote","rate":"0","user":"0","id":"3989","addDate":"2013.12.05 11:19:46","setDate":"2013.12.05 11:19:46","__className":"Vo_Data_Vote"}]},
		"comments":null,
		"medias":{"Picture":[],"Sound":[],"Video":[{"__className":"Vo_Media_Video","url":"MC-swEtoAFh-V","width":null,"height":null,"totalTime":"0","id":"692","title":"champ de bataille","description":null,"preview":null,"_isValid":"0","_user":"227","addDate":"2013.11.16 12:33:06","setDate":"2013.11.16 12:33:06","__className":"Vo_Media_Video"}]},
		"metas":[
			{"__className":"Vo_Meta","id":"323","name":"Type1KeyWord","content":"etre creatif","__className":"Vo_Meta"},
			{"__className":"Vo_Meta","id":"258","name":"Type3KeyWord","content":"l'art pour l'art","__className":"Vo_Meta"},
			{"__className":"Vo_Meta","id":"327","name":"Type2KeyWord","content":"la libert\u00e9","__className":"Vo_Meta"}],
		"rate":102505}
	*/
