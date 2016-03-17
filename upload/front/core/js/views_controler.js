
//
// Contrôleur de l'application
//

var AppView = Backbone.View.extend({

	authentificationID: null,
	
	accueilElement: $(".global .centre .accueil"),
	mosaiqueElement: $(".global .centre .mosaique"),
	
	initialize: function () {
		
		this.proxy = "proxy/ba-simple-proxy.php?url=";
		this.serviceURL = "http://ws.dring93.org/services";
		this.uploadURL = "http://ms.dring93.org/upload";
		this.mediaCenterURL = "http://ms.dring93.org/m/";
		this.mapURL = "medias/cartes/CARTE_DRING13.jpg";
		
		this.initAdminParams( "mazerte", "desperados", "qJlCaSsBbYBYypwF9TT8KmCOxhuZ3wIj" );
		
		this.axeHorizontal = { gauche:"individuel.", droite:"collectif." };
		this.axeVertical   = { bas:"réaliste.", haut:"utopique." };
	},
	
	initAdminParams: function( u1 , u2, u3 ) {
		this.adminParams = [ u1, u2, u3 ];
		this.keyApi = u3;
	},


	// --------------------------------------------------
	//
	// Mosaïque
	//
	// --------------------------------------------------

	initAccueil: function () {
		
		var t = this;
		
		// Titre de l'accueil :
		if (t.titreAccueil) $(".global .header .titre p").text( t.titreAccueil );
		
		// Support du Canvas ?
		if (Modernizr.canvas && Modernizr.csstransforms) {
			// Le navigateur supporte le canvas et les css-transforms
		} else {
			
			// Animation du footer :
			// Succession du message par défaut Creative Commons et de celui de la mise à jour du navigateur
			
			var ccElement = $(".creativecommons");
			
			// Texte par défaut
			var creativeCommonsHtml = ccElement.html();
			
			// Texte alternatif
			var browserHtml =  "<strong>Attention, votre navigateur est trop ancien. Mettez le à jour ou utilisez un navigateur récent.</strong>";
			
			var tl, restart = function() { tl.restart(); };
			
			tl = new TimelineLite( { onComplete:restart });
			tl.to(ccElement, 1, { opacity: 0, delay: 3 });
			tl.call( function() { ccElement.html( browserHtml ); });
			tl.to(ccElement, 1, { opacity: 1 });
			tl.to(ccElement, 1, { opacity: 0, delay: 3 });
			tl.call( function() { ccElement.html( creativeCommonsHtml ); });
			tl.to(ccElement, 1, { opacity: 1 });
			tl.play();
		}
	},


	//
	// Webs Services
	//
		
	connectToWebServices: function () {
		
		var t = this;
		var v = App.eventManager;
		
		// Authentification au WebServices
		t.authentification();	
		
		// ... déclenchera le téléchargement de la liste des projets
		v.on("authentificationSuccess", this.fetchProjects, this);
		
		v.on("itemSelection", this.openMediaItem, this);
		v.on("itemRollOver", this.openTooltipItem, this);
		v.on("itemRollOut", this.closeTooltipItem, this);
		
		// Dessin de l'évolution de la moyenne des votes
		v.on("itemDrawEvolution", this.drawEvolutionVote, this);
		v.on("itemClearEvolution", this.clearEvolutionVote, this);
		
		v.on("voteMedia", this.voteMediaItem, this);

		v.on("closePopUpWithCloseButton", this.closePopUpWithCloseButton, this);
	},
	
	authentification: function( params, callback ) {
		
		var t = this;
		var v = App.eventManager;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "login",
			"params" : params || t.adminParams
		};
		
		var success = function(jsonResult) {
			
			t.authentificationID = jsonResult;
			
			if (callback)
			{
				callback();
			}
			else
			{
				v.trigger("authentificationSuccess");
			}
		};
		
		t.ajax("connection", jsonInput, success);
	},
		
	fetchProjects: function() {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getQueries",
			"params" : []
		};
		
		var success = function(jsonResult) {
			
			// console.log("queries", App.Views.QueriesView.collection.length);
			
			//
			// Création de la liste des projets (Queries) sur la page d'accueil
			//
			
			App.Views.QueriesView = new Chatanoo.QueriesView(jsonResult);
			
			// 
			// Chargement des metas données du projet
			//
			
			t.fetchMetas();
		};
		
		t.ajax("queries", jsonInput, success);
	},

	fetchMetas: function() {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMetas",
			"params" : []
		};
		
		var success = function(jsonResult) {
			
			// console.log("metas", jsonResult);
			// {"__className":"Vo_Meta","id":"741","name":"BACKGROUND_IMAGE_ACCUEIL","content":"MC-EsuhxTee-P","__className":"Vo_Meta"},
			
			// A-t-on défini une image de fond pour l'accueil du projet ?
			var i, n = jsonResult.length, metaVO;
			for(i=0; i<n; i++)
			{
				metaVO = jsonResult[i];
				if (metaVO.name === "BACKGROUND_IMAGE_ACCUEIL") {
					
					var imageID = metaVO.content;
					var backgroundImageURL = t.mediaCenterURL + imageID + ".jpg";
					
					$(".global .container .ecrans .accueil").css("background-image", "url('" + backgroundImageURL + "')");
					
					break;
				}
			}
		};
		
		t.ajax("search", jsonInput, success);
	},
	
	loadQuery: function(queryId) {
		
		var t = this;
		t.currentQuery = queryId;
		
		// Chargement des données
		t.loadDatasOfQuery(queryId);
	},
	
	loadDatasOfQuery: function(queryId) {
		
		var t = this;
		
		// On masque l'accueil et on affiche la mosaique
		t.accueilElement.css("display", "none");
		t.mosaiqueElement.css("display", "block");
		
		// Données de la query (carto)
		t.fetchDatasOfQuery(queryId);
	},

	fetchDatasOfQuery: function(queryId) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasByQueryId",
			"params" : [queryId]
		};
		
		var success = function(jsonResult) {
			
			// console.log("datas", jsonResult.length);
			
			// ... puis des méta-données de la  de la query (mots-clés)
			t.fetchMetasOfQuery(queryId);
		};
		
		t.ajax("datas", jsonInput, success)
	},
		
	fetchMetasOfQuery: function(queryId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMetasByVo",
			"params" : [queryId,"Query"]
		};
		
		var success = success || function(jsonResult) {
			
			// console.log("metas", jsonResult.length);
			
			//
			var i, n = jsonResult.length, jsonItem;
			
			// Liste des mots-clés de la question en cours
			App.Collections.keyWord = new MetaCollection();
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				
				switch(jsonItem.name)
				{
					case "KeyWord":
					App.Collections.keyWord.add( new MetaModel(jsonItem) );
					break;
					
					case "MapZoom":
					break;
					
					case "MapType":
					break;
					
					case "BACKGROUND_IMAGE":
					case "CARTE_LONGITUDE_MIN":
					case "CARTE_LONGITUDE_MAX":
					case "CARTE_LATITUDE_MIN":
					case "CARTE_LATITUDE_MAX":
					break;
				}
			}
	
			// console.log("keyWord", App.Collections.keyWord.length);

			// ... et enfin des items de la  de la query
			t.fetchItemsOfQuery(queryId);
		};
		
		t.ajax("search", jsonInput, success);
	},

	fetchItemsOfQuery: function(queryId) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "call",
			"params" : ["GetItemsWithDetailsByQuery", [queryId]]
		};
		
		var success = function(jsonResult) {
			
			var keyWords = App.Collections.keyWord.getContents();
			
			// TODO : Stocker les collections d'items des différentes Query pour ne pas les recharger
			var itemsCollection = App.Collections.itemsCollection = new ItemsCollection();
			
			var i, n = jsonResult.length, jsonItem;
			var jsonItemVO, jsonItemUser, jsonItemCartos, jsonItemVotes, jsonItemComments, jsonItemMedias;
			var jsonItemMetas, jsonItemRate;
			
			var centreEl = $(".centre");
			var centreWidth  = centreEl.width();
			var centreHeight = centreEl.height();
			
			// console.log("fetchItemsOfQuery", n);
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				
				jsonItemVO = jsonItem.VO;
					
				// console.log(jsonItem);
					
				if (jsonItemVO._isValid != false)
				{
					jsonItemUser = jsonItem.user;
					jsonItemCartos = jsonItem.datas.Carto[0];
					jsonItemVotes = jsonItem.datas.Vote;
					jsonItemMetas = jsonItem.metas;
					jsonItemRate = jsonItem.rate;
					
					// console.log(jsonItemVotes);
					
					var user = new UserModel(jsonItemUser);
					
					var cartos = new DataCartoModel(jsonItemCartos);
					
					var votes = new DataVoteCollection(jsonItemVotes);
					votes.comparator = 'page';
					
					var metas = new MetaCollection(jsonItemMetas);
					metas.comparator = 'name';
					
					var itemModel = new ItemModel(jsonItemVO);
					itemModel.set("rate"  , jsonItemRate);
					itemModel.set("user"  , user);
					itemModel.set("cartos", cartos);
					itemModel.set("votes" , votes);
					itemModel.set("metas" , metas);
					

					itemModel.analyseMetaKeywords();
					
					itemsCollection.add ( itemModel ); 
				}
			}
			
			t.buildView();
		};
		
		t.ajax("plugins", jsonInput, success);
	},

	buildView: function() {
	
		var itemsCollection = App.Collections.itemsCollection;
	
		//
		// Création de la liste des projets (Items) sur la mosaïque
		//
		
		App.Views.MosaiqueItemsView = new Chatanoo.MosaiqueItemsView(itemsCollection);	
	},
		
	fetchMediaOfItem: function(itemId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMediasByItemId",
			"params" : [itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("medias", jsonInput, success);
	},


	/* Commentaires des items */
	
	fetchCommentsOfItem: function(itemId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getCommentsByItemId",
			"params" : [itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("comments", jsonInput, success);
	},
	
	fetchDataOfCommentOfItem: function(commentId, itemId, success) {

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasByCommentId",
			"params" : [commentId, itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("datas", jsonInput, success);
		
	},

	addCommentToItem: function(itemId, commentModel, vote, success) {

		// JSON ou model BackBoneJS ?
		var commentJSON = commentModel.toJSON ? commentModel.toJSON() : commentModel;

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addCommentIntoItem",
			"params" : [ commentJSON, parseInt(itemId), vote]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
		
	},

	addVoteToComment: function(voteModel, commentId, voteValue, itemId, success) {

		// JSON ou model BackBoneJS ?
		var voteJSON = voteModel.toJSON ? voteModel.toJSON() : voteModel;
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [ voteJSON, parseInt(commentId), voteValue, parseInt(itemId)]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("comments", jsonInput, success);
		
	},

	getRateOfToItem: function(itemId, success) {

		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getRateOfItem",
			"params" : [ itemId ]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
		
	},	


	/* Titres des items (affichés en rollOver) */

	openTooltipItem: function(itemId, titre, user, position) {
		
		if ((titre == "") || (titre == null)) titre = "(Sans titre)";
		
		var parentToolTip = $(".global");
		var userSpan = user.length == 0 ? "" : " <span class='username'>par " + user + "</span>";
		parentToolTip.append("<div class='tooltip shadow'>" + titre + userSpan + "</div>");
		
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.css("position", "absolute");
		tooltipEl.css("left", position.left + "px");
		tooltipEl.css("top", (position.top + 25) + "px");
		
	},
	
	closeTooltipItem: function(itemId, titre, user, position) {
		var parentToolTip = $(".global");
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.remove();
	},
	
	
	
	/* MediaPlayer */
	
	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo) {

		console.log("[CONTROLER] itemId = ", itemId); // , motCle, motCle1, motCle2, motCle3, titre, pseudo);

		var popupView = this.prepareMediaPlayer();

		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo);
	},
	
	prepareMediaPlayer: function( playerWidth, playerHeight, playerX, playerY ) {
			
		var t = this;
		
		// TODO On affiche la popUp avec un Gif de chargement
		
		var popUpElement = $("#popup");
		popUpElement.off();
		popUpElement.html("");
		popUpElement.css("display", "block");
		
		if (playerX) popUpElement.css("left", playerX + "px");
		if (playerY) popUpElement.css("top", playerY + "px");
		
		// Taille de la popUp
		var popUpReference = $("#mosaique");
		var popUpWidth = playerWidth || popUpReference.width();
		var popUpHeight = playerHeight || popUpReference.height();

		var options =  {
			
			width:popUpWidth, height:popUpHeight, 
			gauche: t.axeHorizontal.gauche,
			droite: t.axeHorizontal.droite,
			bas: t.axeVertical.bas,
			haut: t.axeVertical.haut
		};

		var popUp = new Chatanoo.PopUpView( { el : popUpElement } ).render( options );

		// TODO : remplacer le passage par l'eventManager
		// popUp.on("voteMedia", this.voteMediaItem, this);

		var mediaWidth = Math.floor(popUpWidth * 0.5);
		var mediaHeight = Math.floor(popUpHeight * 0.5);
		
		popUp.mediaWidth = mediaWidth;
		popUp.mediaHeight = mediaHeight;
		
		var popUpContentMedia = $(".popupMedia", popUpElement);
		popUpContentMedia.css("width", mediaWidth + "px");
		popUpContentMedia.css("height", mediaHeight + "px");
		
		// popUpContentMedia.css("margin-left", (popUpWidth * 0.05) + "px");
		// popUpContentMedia.css("margin-top", (popUpHeight * 0.05) + "px");
		
		var popUpSliders = $(".popupSliders", popUpElement);
		popUpSliders.css("top", (mediaHeight + 50) + "px");

		return popUp;
	},
	
	createImageView: function( element, itemId, mediaId, urlImage ) {
		var t = this;
		var model = new MediaModel( { itemId: itemId, id: mediaId, url: t.mediaCenterURL + urlImage + ".jpg" } );
		var imageView = new Chatanoo.ImageView( { el: element, model: model } ).render();
		
		return { model:model, view:imageView };
	},
	
	createVideoView: function( element, itemId, mediaId, urlVideo, width, height) {
		var t = this;
		
		var extension = ".mp4";
		var mime = "video/mp4";
		
		var model = new MediaModel( { itemId: itemId, id: mediaId, url: t.mediaCenterURL + urlVideo + extension, mime:mime, width:width, height:height, autoplay: true } );
		var videoView = new Chatanoo.VideoView( { el: element, model: model } ).loadVideo();
		
		return { model:model, view:videoView };
	},
	
	createAudioView: function( element, itemId, mediaId, urlAudio) {
		var t = this;
		
		var extension = ".mp3";
		var mime = "audio/mp3";
		
		var model = new MediaModel( { itemId: itemId, id: mediaId, url: t.mediaCenterURL + urlAudio + extension, mime:mime, autoplay: true } );
		var audioView = new Chatanoo.AudioView( { el: element, model: model } ).loadAudio();
		
		return { model:model, view:audioView };
	},
	
	createTextView: function( element, itemId, mediaId, textContent) {
		var t = this;
		
		var model = new TextMediaModel( { itemId: itemId, id: mediaId, content: textContent } );
		var textView = new Chatanoo.TextMediaView( { el: element, model: model } ).render();
		
		return { model:model, view:textView };
	},
	
	openMediaItemInPlayer: function( popupView, itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo) {
		
		var t = this;
		
		var popUpElement = popupView.$el;
		var mediaTitle = $(".popupTitle", popUpElement);
		var mediaParent = $(".popupMedia", popUpElement);
		var mediaWidth = popupView.mediaWidth;
		var mediaHeight = popupView.mediaHeight;
		
		if ((titre == "") || (titre == null)) titre = "(Sans titre)";
		
		mediaTitle.html(titre + "<br/><span class='username'>par " + pseudo + "</span>");
		
		var success = function(jsonResult) {
			
			if (jsonResult.Picture && (jsonResult.Picture.length > 0))
			{
				var imageObject = jsonResult.Picture[0];
				var imageId = imageObject.id;
				var titreImage = imageObject.title;
				var urlImage = imageObject.url;
				
				// console.log(imageId, titreImage, urlImage);
				
				var image = t.createImageView( mediaParent, itemId, imageId, urlImage );
				
				popupView.model = image.model;
			}
			else if (jsonResult.Video && (jsonResult.Video.length > 0))
			{
				var videoObject = jsonResult.Video[0];
				var videoId = videoObject.id;
				var titreVideo = videoObject.title;
				var urlVideo = videoObject.url;
				
				// console.log(videoId, titreVideo, urlVideo);
				
				var video = t.createVideoView( mediaParent, itemId, videoId, urlVideo, mediaWidth, mediaHeight );
				
				popupView.model = video.model;
			}
			else if (jsonResult.Sound && (jsonResult.Sound.length > 0))
			{
				var audioObject = jsonResult.Sound[0];
				var audioId = audioObject.id;
				var titreAudio = audioObject.title;
				var urlAudio = audioObject.url;
				
				// console.log(audioId, titreAudio, urlAudio);
				
				var audio = t.createAudioView( mediaParent, itemId, audioId, urlAudio );
				
				popupView.model = audio.model;
			}
			else if (jsonResult.Text && (jsonResult.Text.length > 0))
			{
				// console.log("openMediaItem : Text --> TODO : div texte ", jsonResult );
				var textObject = jsonResult.Text[0];
				var textId = textObject.id;
				var textContent = textObject.content;
				
				var texte = t.createTextView( mediaParent, itemId, textId, textContent );
				
				popupView.model = texte.model;
			}
			else
			{
				// console.log("openMediaItem : type non prévu", jsonResult );
			}
			
			var popUpHeader = $(".popupHeader", popUpElement);

			var onDragEnd = function(e) {
				var itemDragged = e.currentTarget;
				var draggableObject = Draggable.get(itemDragged);
			};
				
			Draggable.create(popUpElement,{ type:"x,y", trigger:popUpHeader, onDragEnd:onDragEnd });			
		};
		
		t.fetchMediaOfItem(itemId, success);
	},


	/* Vote */

	voteMediaItem: function(itemId, voteIc, voteRu) {
		
		var t = this;
		var rate = t.getRate(voteIc, voteRu);
		
		console.log("[CONTROLER] vote", itemId, "ic", voteIc, "ru", voteRu, "rate", rate, "check vote = ", t.getVoteFromRate(rate));
		
		var success = function(jsonResult) {
			
			// On veut récupérer les données du vote créées côté serveur (id, dates)
			var voteId = jsonResult;
			
			var getDataVoteByIdSuccess = function(jsonResult) {
				
				var itemCollection = App.Views.MosaiqueItemsView.collection;
				var itemModel = itemCollection.findWhere( {id:itemId });
				if (itemModel)
				{
					// Nouveau vote (données récupérées par "getDataVoteById")
					var newVote = new DataVoteModel( jsonResult );
					
					// On doit ajouter ce vote à la collection des votes de cet item
					var votesCollection = itemModel.get("votes");
					
					// Position actuelle (avant le vote)
					var positions = itemModel.get("positionsMoyenneVotes");
					var lastPosition = positions[positions.length - 1];
					
					// console.log("AVANT", votesCollection.length, positions.length, "position", lastPosition.x, lastPosition.y);
					
					// Ajout du nouveau vote
					votesCollection.add(newVote);
					
					// On doit mettre à jour la nouvelle position de l'item sur la mosaique
					var mosaique = $("#mosaique");
					var mosaiqueWidth  = mosaique.width();
					var mosaiqueHeight = mosaique.height();
					
					itemModel.computeRateFromVotes(mosaiqueWidth, mosaiqueHeight);
					
					// Position nouvelle (après le vote)
					var positions = itemModel.get("positionsMoyenneVotes");
					var lastPosition = positions[positions.length - 1];
					
					// console.log("APRES", votesCollection.length, positions.length, "position", lastPosition.x, lastPosition.y);
					
					// Déplacement de l'icône sur la mosaïque
					var itemIcon = itemModel.get("icon");
					if (itemIcon) itemIcon.move( { x: lastPosition.x, y: lastPosition.y } );
				}
				else
				{
					// console.log("item non trouvé");
				}
			};
			
			t.getDataVoteById(voteId, getDataVoteByIdSuccess);
			
		}
		
		t.addDataVoteToItem(itemId, rate, success);
	},

	addDataVoteToItem: function(itemId, rate, success) {
		
		var t = this;
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var dataVo = {"users_id":userId, "rate":rate, "__className":"Vo_Data_Vote", "id":0, "setDate":null, "addDate":null};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [dataVo, itemId]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	getDataVoteById: function(voteId, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getDatasById",
			"params" : [voteId, "Vote"]
		};
		
		var success = success || function(jsonResult) {
			// console.log(jsonResult);
		};
		
		t.ajax("datas", jsonInput, success);
	},

	addItemIntoQuery: function(queryId, mediaTitle, mediaFilename, success) {
		
		var t = this;
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var itemVO = {"users_id":userId, "title": mediaTitle, "rate":0, "__className":"Vo_Item", "isValid":true, "id":0, "rate":0, "description":"", "setDate":null, "addDate":null};
		var mediaVO = {"title": mediaTitle, "fileName": mediaFilename};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addItemIntoQuery",
			"params" : [itemVO, queryId, mediaVO]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id de l'item ajouté
			// console.log(jsonResult);
		};
		
		t.ajax("queries", jsonInput, success);
	},

	addMediaIntoItem: function(itemId, mediaTitle, mediaFilename, textMediaContent, success) {
		
		var t = this;
		var userId = t.currentUserId ? t.currentUserId : 0;
		var mediaVO;
		
		if (textMediaContent != null)
		{
			// a. Envoi d'un témoignage texte		
			mediaVO = {"users_id":userId, "content":textMediaContent, "title":mediaTitle, "__className":"Vo_Media_Text", "isValid":true, "id":0, "description":null, "setDate":null, "addDate":null};
		}
		else
		{
			// b. Envoi d'un témoignage media (image, vidéo, audio)
			var mediaArray = mediaFilename.split("-");
			var mediaType = mediaArray[mediaArray.length - 1];
			var mediaClass;
			 
			switch(mediaType)
			{
				case "P":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Picture", "isValid":true, "id":0, "preview":null, "width":null,"height":null, "description":null, "setDate":null, "addDate":null};
				break;
				
				case "V":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Video", "isValid":true, "id":0, "preview":null, "width":null,"height":null, "description":null, "setDate":null, "addDate":null};
				break;
				
				case "A":
				mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":"Vo_Media_Sound", "isValid":true, "id":0, "description":null, "setDate":null, "addDate":null};
				break;
				
				default:
				console.log("Erreur : Envoi d'un media de type non reconnu...");
				return;
			}
			
		}
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addMediaIntoItem",
			"params" : [mediaVO, itemId]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id du media ajouté
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	addMetaIntoVo: function(itemId, metaId, metaContent, success) {
		
		var t = this;
		var metaVO = {"content": metaContent, "id":metaId, "name":"KeyWord", "__className":"Vo_Meta"};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addMetaIntoVo",
			"params" : [metaVO, itemId]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id de la meta ajoutée
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	addDataCartoToItem: function(itemId, latitude, longitude, success) {
			
		var t = this;
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var dataVo = {"x":latitude, "y":longitude, "__className":"Vo_Data_Carto", "id":0, "setDate":null, "addDate":null};

		// {"method":"addDataIntoVo","id":"R7BZ-HISJ-INAM-FNG0-5KB9-7PUH","params":[{"x":48.81390517570364,"addDate":null,"setDate":null,"id":0,"y":2.344161101081081,"__className":"Vo_Data_Carto"},1219]}
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addDataIntoVo",
			"params" : [dataVo, itemId]
		};
		
		// console.log("addDataCartoToItem", jsonInput);
			
		var success = success || function(jsonResult) {
			// Retourne l'id de la data Carto
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success);
	},

	
	
	// --------------------------------------------------
	//
	// Formulaire d'Upload
	//
	// --------------------------------------------------

	openUploadView: function() {
	
		var t = this;
		
		var mosaique = $("#mosaique");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
		
		var popUpElement = $(".uploadParent");
		popUpElement.css("display", "block");
		popUpElement.css("width", mosaiqueWidth + "px");
		popUpElement.css("height", mosaiqueHeight + "px");


		var options =  {
			
			gauche: t.axeHorizontal.gauche,
			droite: t.axeHorizontal.droite,
			bas: t.axeVertical.bas,
			haut: t.axeVertical.haut,
		}
		
		
		t.popupUpload = new Chatanoo.UploadView( { el : popUpElement } );
		t.popupUpload.urlCarte = t.mapURL;
		t.popupUpload.render( options );

		var popUpContent = $(".uploadContent", popUpElement);
		popUpContent.css("width", mosaiqueWidth + "px");
		popUpContent.css("height", mosaiqueHeight + "px");
		
		t.changeLayoutForUpload();
		t.initLoginForm();
	},

	changeLayoutForUpload: function() {
	},
	
	restoreLayoutAfterUpload: function() {
	},
	
	closePopUpWithCloseButton: function() {
		var t = this;
		t.restoreLayoutAfterUpload();
	},
	
	closeUploadView: function() {
		var t = this;
		if (t.popupUpload) t.popupUpload.closePopUp();
	},
	
	initLoginForm: function () {
		
		var t = this;
		t.initUploadQuerySelect();

		// Fomulaire de Login
		var loginForm = document.getElementById('loginForm');
		loginForm.onsubmit = function(event) {
			event.preventDefault();
			t.checkLoginForUpload();
		};

		// Fomulaire de Login
		var inscriptionForm = document.getElementById('inscriptionForm');
		inscriptionForm.onsubmit = function(event) {
			event.preventDefault();
			t.addUser();
		};
		
		$(".tabLoginInscription .login").off().on("click", function() {
			$(".loginForm").css("display", "block");
			$(".inscriptionForm").css("display", "none");
			$(".tabLoginInscription .login").removeClass("selected").addClass("selected");
			$(".tabLoginInscription .inscription").removeClass("selected");
		});
		
		$(".tabLoginInscription .inscription").off().on("click", function() {
			$(".loginForm").css("display", "none");
			$(".inscriptionForm").css("display", "block");
			$(".tabLoginInscription .login").removeClass("selected");
			$(".tabLoginInscription .inscription").removeClass("selected").addClass("selected");
		});	
	},
	
	checkLoginForUpload: function() {
		
		var t = this;
		
		var pseudo = $("#pseudo").val();
		var password = $("#password").val();
		
		var success = function(jsonResult) {
			
			if (jsonResult == null)
			{
				// Identifiants non valides
			}
			else
			{
				// Identifiants valides
				// console.log("login : user id = ", jsonResult.id);
				t.uploadUserId = t.currentUserId = jsonResult.id;				
				t.authentification ( [ pseudo, password, t.adminParams[2] ] , function() {
					t.initUploadForm();
				});
			}
		};
		
		t.getUserByLogin( pseudo, password, success );
		
	},

	getUserByLogin: function(pseudo, password, success) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getUserByLogin",
			"params" : [pseudo, password]
		};
		
		t.ajax("users", jsonInput, success);	
	},
	
	addUser: function() {
		
		var t = this;
		
		var nom = $("#adduser_nom").val();
		var prenom = $("#adduser_prenom").val();
		var pseudo = $("#adduser_pseudo").val();
		var password = $("#adduser_password").val();
		var email = $("#adduser_email").val();

		if (( pseudo.length == 0 ) || ( password.length == 0 ))
		{
			alert ("Attention le pseudo et le mot de passe doivent être remplis !");
			return;
		}

		var success = function(jsonResult) 
		{
			if ( jsonResult != null )
			{
				alert ("Ce pseudo existe déjà !");
			}
			else
			{
				var userVO = {"email":email, "__className":"Vo_User", "id":0, "pseudo":pseudo, "password":password, "isBan":false, "lastName":nom, "role":null, "firstName":prenom, "addDate":null, "setDate":null};
				
				var jsonInput = {
					"id" : t.generateID(),
					"method" : "addUser",
					"params" : [userVO]
				};
				
				var success = function(jsonResult) {
					
					if (jsonResult == null)
					{
					}
					else
					{
						// Nouvel utilisateur
						// console.log("inscription : user id = ", jsonResult.id);				
						t.uploadUserId = t.currentUserId = jsonResult.id;
						t.authentification ( [ pseudo, password, t.adminParams[2] ] , function() {
							t.initUploadForm();
						});
					}
				};
				
				t.ajax("users", jsonInput, success)
			}
		}
		
		// On vérifie d'abord que le couple n'existe pas déjà :
		t.getUserByLogin( pseudo, password, success );
	},

	initUploadQuerySelect: function() {

		var t = this;

		// Liste des questions :
		var questionSelect = $("#formQueries");
		var queryCollection = App.Views.QueriesView.collection;
		
		// 
		t.uploadQueryId = t.currentQuery ? t.currentQuery : queryCollection.at(0).get("id");
		
		// console.log("initUploadForm", queryCollection.length, questionSelect);
		
		queryCollection.each( function (query)
		{
			var queryId = query.get("id");
			var queryTitle = query.get("content");
			
			if (queryId == t.currentQuery)
			{
				// Par défaut on sélectionne la question courante de la mosaïque
				questionSelect.append("<option data-id='" + queryId + "' value=' " + queryId + "' selected='selected'>" +  queryTitle +" </option>");
			}
			else
			{
				questionSelect.append("<option data-id='" + queryId + "' value=' " + queryId + "'>" +  queryTitle +" </option>");
			}
		});
		
		questionSelect.off().on("change", function(e) {
			
			var queryId = $(e.target).val();
			// console.log("change", queryId);
			
			t.uploadQueryId = queryId;
		});
		
	},
	
	disableUploadSubmitButton: function( bool ) {
		document.getElementById('uploadButton').disabled = bool;
	},
	
	initUploadForm: function() {
		
		var t = this;
		
		// On affiche le formulaire d'upload
		$("#etape_user").css("display", "none");
		$("#etape_upload").css("display", "block");
		
		// Titre 
		$("#itemTitle").val("");
		
		// Media
		$(".uploadedMedia").html("");
		
		// Texte
		$(".newTextMedia").val("");
		$(".envoiTexte").css("display", "block");
		
		// Champ d'état du téléchargement
		$(".uploadStatus").html("");
		
		$("#toEtape2Button").siblings(".etape").css("display", "none");
		$("#toEtape2Button").css("display", "none");
		

		//
		// a. Envoi d'un simple texte
		//

		var sendTextButton = $("#sendTextMediaButton");
		sendTextButton.off().on("click", function() {
		
			var textTitle = $("#itemTitle").val();
			var textContent = $("#newTextMedia").val();
			
			t.validUploadEtape2( "Text", textTitle, null, textContent);
		});
		
		
		//
		// b. Upload d'un media
		//
		
		var form = $("#fileUploadForm");
		var fileSelect = $("#fileSelect");
		
		var uploadButton = $("#uploadButton");
		t.disableUploadSubmitButton(true);
	
		var files;
		var uploadFiles = function (event)
		{
			event.stopPropagation();
			event.preventDefault();
			
			t.disableUploadSubmitButton(true);
		
			if (files.length == 0) return;
			
			// console.log(t.uploadURL, files.length)
		
			var i, file, data = new FormData();
			
			for (i = 0; i < files.length; i++) {
			  file = files[i];
			  data.append('file', file, file.name);
			  // RQ : On ne prend que le premier
			  break;
			}
		
			// Champ d'état du téléchargement
			$(".uploadStatus").html("Envoi du média en cours...");
		
			var loadingAnimation = t.startLoadingAnimation();
		
			$.ajax({
				url: t.uploadURL,
				type: 'POST',
				data: data,
				cache: false,
				processData: false,
				contentType: false,
				success: function(data, textStatus, jqXHR)
				{
					t.stopLoadingAnimation(loadingAnimation);
					
					// Le serveur renvoie l'id du media uploadé (ex : MC-pXWxGcoX-P )
					if (typeof data.error === 'undefined')
					{
						// console.log('Upload success: ' + data);
						
						$(".uploadStatus").html("Envoi du média réussi");
			
						t.displayButtonToValidateUploadMedia( data );
					}
					else
					{
						$(".uploadStatus").html("Echec de l'envoi du média");
						
						// console.log('Upload error 1: ' + data.error);
					}
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					// console.log('Upload error 2: ' + textStatus);
					
					$(".uploadStatus").html("Echec de l'envoi du média");
					
					t.stopLoadingAnimation(loadingAnimation);					
				}
			});
		}		
		
		$('input[type=file]').off().on('change', function (event)
		{
			files = event.target.files;
			
			var i, file;
			
			// On vérifie les types MIME des fichiers sélectionnés
			
			// . Sont autorisés : image/jpg, image/png, audio/mpeg (MP3), video/mp4...
			// . Ne sont pas encore autorisés : video/x-flv (FLV), audio/x-m4a (AAC)
			
			for (i = 0; i < files.length; i++) {
			
			  file = files[i];
			  
			  if ((file.type != "image/png") && (file.type != "image/jpeg") && (file.type != "video/mp4") && (file.type != "audio/mpeg")) {
				// Type incompatible : on bloque le bouton "Envoyer votre media"
				// console.log("Type incompatible", file.type)
				t.disableUploadSubmitButton(true);
				return;
			  }
			  
			  // RQ : On ne prendra que le premier fichier sélectionné
			  break;
			}
			
			t.disableUploadSubmitButton(false);
			
			form.off().on('submit', uploadFiles);
		});
			
	},

	getMediaTypeFromFileName: function( mediaFileName ) {
		
		var filenameArray = mediaFileName.split("-");
		var filenameLastChar = filenameArray[filenameArray.length - 1];
		
		switch(filenameLastChar)
		{
			case "P": return "Picture";
			case "V": return "Video";
			case "A": return "Audio";
			case "T": return "Text";
		}
		
		return "Unknown";
	},
	
	//
	
	displayButtonToValidateUploadMedia: function( mediaFileName ) {
		
		var t = this;
		
		// Pas de variable pour le texte
		t.textMediaContent = null;
		
		var mediaTitle = $("#itemTitle").val();
		
		// TODO : Chargement du media pour contrôler ce qui a été transmis
		// console.log("displayButtonToValidateUploadMedia", mediaFileName);
		
		var mediaType = t.getMediaTypeFromFileName(mediaFileName);
		
		var uploadParent = $(".uploadParent"); 
		uploadButton.disabled = true;
			
		var mediaParent = $(".uploadedMedia", uploadParent);
		
		$(".envoiTexte").css("display", "none");

		var itemId = t.uploadItemId;
		var mediaId = 0;
		var mediaWidth  =  mediaParent.width() || uploadParent.width() * 0.5;
		var mediaHeight = mediaWidth * 2 / 3;

		// console.log(mediaFileName, mediaType);

		switch(mediaType)
		{
			case "Picture" :
			var image = t.createImageView( mediaParent, itemId, mediaId, mediaFileName );
			break;
			
			case "Video" :
			var video = t.createVideoView( mediaParent, itemId, mediaId, mediaFileName, mediaWidth, mediaHeight );
			break;
		};
		
		// La suite est maintenant accessible : étape 2
		$("#toEtape2Button").siblings(".etape").css("display", "inline");
		$("#toEtape2Button").css("display", "inline");
		$("#toEtape2Button").off().on("click", function(){ t.validUploadEtape2( mediaType, mediaTitle, mediaFileName, null ); } );

	},
	
	validUploadEtape2: function( mediaType, mediaTitle, mediaFileName, textMediaContent ) {
		
		// console.log("validUploadEtape2");
		
		var t = this;
		
		t.uploadMediaType = mediaType;
		t.uploadMediaTitle = mediaTitle;
		t.uploadMediaFileName = mediaFileName;
		t.textMediaContent = textMediaContent;
		
		$("#toEtape2Button").off("click");
		$("#toEtape3Button").off().on("click", function(){ t.validUploadEtape3(); } );
		
		$("#etape_vote").css("display", "block");
		$("#etape_upload").css("display", "none");		
	},

	validUploadEtape3: function() {
		
		var t = this;
		
		// console.log("validUploadEtape3", $('input:radio[name=sentiment]:checked').val());
		
		// Vote : valeur du vote "Cool/Pas cool"
		t.uploadVote = $('input:radio[name=sentiment]:checked').val() == "choix1" ? 1 : -1;
		
		$("#toEtape3Button").off("click");
		$("#etape_vote").css("display", "none");		
		
		t.displayUploadKeyWordSelectionView();
	},
	
	displayUploadKeyWordSelectionView: function() {

		var t = this;
		
		$("#etape_keyword").css("display", "block");
		
		$("#toEtape4Button").css("display", "none");
		$("#toEtape4Button").siblings(".etape").css("display", "none");
		
		var success = function(jsonResult) {
			
			if (! jsonResult) return;
			
			// console.log("metas", jsonResult.length);
			
			var i, n = jsonResult.length, jsonItem;
			var metas = new MetaCollection();
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				switch(jsonItem.name)
				{
					case "KeyWord":
					metas.add( new MetaModel(jsonItem) );
				}
			}
			
			// console.log("fetchMetasOfQuery", metas.length);
			
			t.initUploadKeywordSelect(metas);
		}
	
		// console.log("fetchMetasOfQuery queryId = ", t.uploadQueryId);
	
		// On récupère la liste des mots-clés de la question choisie dans le formulaire
		t.fetchMetasOfQuery(t.uploadQueryId, success);
	},
	
	initUploadKeywordSelect: function( queryKeyWordCollection ) {

		var t = this;
		
		// Liste des mots-clés de la question :
		var keywordsSelect = $("#formKeywords");
		
		keywordsSelect.append("<option value=''>Sélectionnez un mot-clé</option>");
		
		queryKeyWordCollection.each( function (keyword)
		{
			var keywordId = keyword.get("id");
			var keywordTitle = keyword.get("content");
			
			keywordsSelect.append("<option value=' " + keywordId + "'>" +  keywordTitle +" </option>");
		});
		
		keywordsSelect.off().on("change", function(e) {
			var keyWordId = $(e.target).val();
			if (keyWordId != "")
			{
				var keywordTitle = $("#formKeywords option:selected").text();
				
				// Trim white space
				keywordTitle = keywordTitle.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				
				// console.log("change", keyWordId, keywordTitle);
				
				t.displayButtonToValidateUploadKeyWord(keyWordId, keywordTitle);
			}
		});
	},	
	
	displayButtonToValidateUploadKeyWord: function( keyWordId, keywordTitle ) {
		
		var t = this;
		
		// console.log("displayButtonToValidateUploadKeyWord", keyWordId);
		
		$("#toEtape4Button").siblings(".etape").css("display", "inline");
		$("#toEtape4Button").css("display", "inline");
		$("#toEtape4Button").off().on("click", function(){ t.validUploadEtape4(keyWordId, keywordTitle); } );
	},

	validUploadEtape4: function( keyWordId, keywordTitle ) {
		
		var t = this;	
		t.uploadKeyWordId = keyWordId;
		t.uploadKeyWordContent = keywordTitle;
		
		// console.log("validUploadEtape4", keyWordId, keywordTitle);
		
		$("#toEtape4Button").off("click");
		$("#etape_keyword").css("display", "none");		
		
		t.displayUploadMapView();
	},
	
	displayUploadMapView: function() {
		
		var t = this;
		
		$("#etape_map").css("display", "block");
		$("#toEtape5Button").css("display", "none");
		$("#toEtape5Button").siblings(".etape").css("display", "none");
		
		// Drag and drop du perso sur la carte :
		var mapParent =  $(".global .uploadParent .uploadContent .uploadBody .mapParent");
		var item = $(".item", mapParent);
		var map = $(item).siblings(".map");
		var mapWidth = map.width();
		var mapHeight = map.height();
		
		var uploadForm = $(".uploadParent"); 
		mapParent.css("height", uploadForm.height() * 0.5);
		
		var longitudeGauche = t.longitudeGauche;
		var latitudeTop = t.latitudeTop;
		
		var longitudeGaucheDroite = t.longitudeDroite - longitudeGauche;
		var latitudeTopBottom = t.latitudeBottom - latitudeTop;
				
		var mapX = (t.latitudeBottom + latitudeTop) * 0.5;
		var mapY = (t.longitudeDroite + longitudeGauche) * 0.5;
		
		// console.log(mapX, mapY);
		
		var onDragEnd = function(e) {
			
			var itemDragged = e.currentTarget;
			
			var draggableObject = Draggable.get(item);
			var positionX = draggableObject.x;
			var positionY = draggableObject.y;
			var percentX = positionX / mapWidth;
			var percentY = positionY / mapHeight;
			
			var largCarte = t.largeurCarte;
			var hautCarte = t.longueurCarte;
			
			var longitude = longitudeGauche + percentX * longitudeGaucheDroite;
			var latitude  = latitudeTop + percentY * latitudeTopBottom;

			// On récupère la position du marker sur la carte
			mapX = latitude;
			mapY = longitude;
			 
			// console.log(positionX, positionY, mapWidth, mapHeight, "mapX", mapX, "mapY", mapY);

			// Au premier déplacement, on affiche le bouton de validation :
			$("#toEtape5Button").css("display", "inline");
			$("#toEtape5Button").siblings(".etape").css("display", "inline");
		};

		
		var draggable = Draggable.create(item, { onDragEnd:onDragEnd });
		TweenLite.set(item, { x: mapWidth * 0.5, y: mapHeight * 0.5 });
		
		// Bouton de validation de l'étape de la carte :
		$("#toEtape5Button").siblings(".etape").css("display", "inline");
		$("#toEtape5Button").css("display", "inline");
		$("#toEtape5Button").off().on("click", function(){ t.validUploadEtape5( mapX, mapY); } );
	},
	
	validUploadEtape5: function( mapX, mapY ) {
		
		var t = this;	
		t.uploadMapX = mapX;
		t.uploadMapY = mapY;
		
		var item = $(".global .uploadParent .uploadContent .uploadBody .mapParent .item");
		if (Draggable.get(item)) Draggable.get(item).kill();
		
		$("#toEtape5Button").off("click");
		$("#etape_map").css("display", "none");		
		
		t.envoiItemUpload();
	},

	envoiItemUpload: function() {
		
		//
		// 1. Ajout d'un item à la Query
		//
		
		var t = this;
		
		var successAddItemToQuery = function(jsonResult) {
			
			// console.log("successAddItemToQuery jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.uploadItemId = parseInt(jsonResult);
			t.envoiMediaUpload();			
		};
		
		// Envoi de l'item
		t.addItemIntoQuery(t.uploadQueryId, t.uploadMediaTitle, t.uploadMediaFileName, successAddItemToQuery)
	},
	
	envoiMediaUpload: function() {
		
		var t = this;

		//
		// 2. Ajout d'un media à l'item
		//

		var successAddMediaToItem = function(jsonResult) {
			
			// console.log("successAddMediaToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
		
			t.uploadMediaId = jsonResult;
			t.envoiVoteUpload();
		};
	
		// Envoi du media
		t.addMediaIntoItem(t.uploadItemId, t.uploadMediaTitle, t.uploadMediaFileName, t.textMediaContent, successAddMediaToItem); 
	},
	
	envoiVoteUpload: function() {
		
		var t = this;
		
		//
		// 3. Ajout d'un vote à l'item
		//

		var successAddVoteToItem = function(jsonResult) {
			
			// console.log("successAddVoteToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
			
			t.uploadDataVoteId = jsonResult;		
			t.envoiMotCleUpload();
		};
	
		// Envoi du vote
		t.addDataVoteToItem(t.uploadItemId, t.uploadVote, successAddVoteToItem);	
	},
	
	envoiMotCleUpload: function() {
		
		var t = this;
		
		//
		// 4. Ajout d'un mot-clé à l'item
		//
		
		var successAddKeyWordToItem = function(jsonResult) {
		
			// console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.envoiCartoUpload()
		}
	
		// Envoi du mot-clé
		t.addMetaIntoVo(t.uploadItemId, t.uploadKeyWordId, t.uploadKeyWordContent, successAddKeyWordToItem);
	},

	envoiCartoUpload: function() {
				
		var t = this;
	
		//
		// 5. Ajout d'une data de position sur la carte à l'item
		//
		
		var successAddDataCartoToItem = function(jsonResult) {
		
			// console.log("successAddDataCartoToItem jsonResult = ", jsonResult); 
		
			if (! jsonResult) return;
			
			t.finUpload();
		};
		
		// console.log("addDataCartoToItem", t.uploadItemId, t.uploadMapX, t.uploadMapY)
		
		t.addDataCartoToItem(t.uploadItemId, t.uploadMapX, t.uploadMapY, successAddDataCartoToItem);

	},
	
	finUpload: function() {
		
		var t = this;
		
		// Fin de l'upload
		$("#etape_conclusion").css("display", "block");		
		$("#toEtape6Button").off().on("click", function()
		{ 
			$("#toEtape6Button").off("click");
			t.closeUploadView(); 
		} );

		// Nouvel upload
		$("#toEtape1Button").off().on("click", function()
		{ 
			$("#etape_conclusion").css("display", "none");
			$("#toEtape1Button").off("click");
			t.initUploadForm(); 
		} );
		
		// On doit ajouter l'item uploadé dans la liste des  items de la query associée
		// et rafraichir les vues :
		
		t.loadQuery( t.uploadQueryId );
	},


	// --------------------------------------------------
	//
	// Tracé de l'évolution du vote d'un item
	//
	// --------------------------------------------------

	drawEvolutionVote: function( itemId ) {
	},
	
	clearEvolutionVote: function( itemId ) {
	},


	// --------------------------------------------------
	//
	// Général
	//
	// --------------------------------------------------

	startLoadingAnimation: function( target ) {
		
		if (! target) target = $("#attente");
		
		var opts = { color: '#FFFFFF', left: '60%', top: '40%' };
			
		var spinner = new Spinner( opts ).spin();
		target.append(spinner.el);
		
		return spinner;
	},
	
	stopLoadingAnimation: function( spinner ) {
		spinner.stop();
	},
	
	//
	// Webs Services :
	//
	
	ajax: function (serviceName, data, successCallback) {

		var t = this;
		var loadingAnimation = t.startLoadingAnimation();
		
		var ajaxError = function(jqXHR, textStatus, errorThrown)
		{
			t.stopLoadingAnimation(loadingAnimation);
			
			console.log("error :" + textStatus, jqXHR);
		};
		
		var ajaxSuccess	= function(data, textStatus, jqXHR)
		{
			t.stopLoadingAnimation(loadingAnimation);
		
			// Le Proxy PHP renvoie : {"status":{"http_code":200},"contents":{"result":"...","id":"..."}}
			// console.log("success :" + JSON.stringify(data.contents));
			
			if (successCallback) successCallback(data.contents.result);
		};
		
		var ajaxRequest = {
			
			type: "POST",
			url: t.proxy + t.serviceURL + "/" + serviceName + "/json",
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json",
		}
		
		if (t.authentificationID)
		{
			ajaxRequest.beforeSend = function(xhr) {
				  xhr.setRequestHeader("Authorization", t.authentificationID);
			};
		}
		
		// console.log(JSON.stringify(ajaxRequest));
		
		jQuery.ajax(ajaxRequest).done(ajaxSuccess).fail(ajaxError);
	},
	
	generateID: function()
	{
		var num = 24;
		var char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
		var uiid = "";
		for(var i = 0; i < num; i++)
		{
			uiid += char[Math.floor(Math.random() * char.length)];
			if (i%4 == 3 && i != 0 && i < num - 1)
				uiid += '-';
		}
		
		return uiid;
	},
	
});
