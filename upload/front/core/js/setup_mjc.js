$(function()
{
	/* BACKBONE */
	
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Views  = {};
	
	App.Views.appView = new MJCAppView();
	App.Views.appView.titreAccueil = "Conflit de Canards";
	
	// Key API
	App.Views.appView.keyApi = "3WUWr77hbTf6gaH48fnUj9yhp442vbeH";

	// Carte
	/*
	App.Views.appView.mapURL = "cartes/CARTE_DRING13.jpg";
	App.Views.appView.largeurCarte = 2416;
	App.Views.appView.longueurCarte = 1110;
	App.Views.appView.latitudeTop = 48.834982;
	App.Views.appView.latitudeBottom = 48.811347;
	App.Views.appView.longitudeGauche = 2.304247;
	App.Views.appView.longitudeDroite = 2.377739;
	*/
	
	// App.Views.appView.mapURL = "cartes/CARTE_NOGENT.jpg";
	App.Views.appView.titre = 
	App.Views.appView.largeurCarte = 952;
	App.Views.appView.longueurCarte = 690;
	App.Views.appView.latitudeTop = 48.850582;
	App.Views.appView.latitudeBottom = 48.823747;
	App.Views.appView.longitudeGauche = 2.452784;
	App.Views.appView.longitudeDroite = 2.513038;
	

	// Permet de gérer les click au niveau des "div" parent d'un lien (plutôt qu'au niveau du lien lui-même)
	$(document).delegate("a", "click", function(evt) {
		var href = $(this).attr("href");
		if (href == "#") evt.preventDefault();
	});	

	// XML
	$.get("mjc_nogent.xml", function(xml)
	{
		var json = xmlToJson(xml);
		var queries = json.mjc.query;
		
		// console.log(JSON.stringify(json.mjc.query));

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
