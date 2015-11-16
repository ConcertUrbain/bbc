
//
// Contrôleur de l'application
//

var AppView = Backbone.View.extend({

	authentificationID: null,
	
	accueilElement: $(".global .centre .accueil"),
	mosaiqueElement: $(".global .centre .mosaique"),
	
	initialize: function () {
		this.serviceURL = "http://ws.dring93.org/services";
		this.uploadURL = "http://ms.dring93.org/upload";
		this.mediaCenterURL = "http://ms.dring93.org/m/";
		this.mapURL = "medias/cartes/CARTE_DRING13.jpg";
		this.keyApi = "qJlCaSsBbYBYypwF9TT8KmCOxhuZ3wIj";
		this.adminParams = ["mazerte", "desperados", this.keyApi];
	},
	

	// --------------------------------------------------
	//
	// Mosaïque
	//
	// --------------------------------------------------



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
		
		v.on("voteMedia", this.voteMediaItem, this);
		
	},
	
	authentification: function( params, callback ) {
		
		var t = this;
		var v = App.eventManager;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "login",
			"params" : params || t.adminParams
		}
		
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
		}
		
		t.ajax("connection", jsonInput, success)
	},
		
	fetchProjects: function() {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getQueries",
			"params" : []
		};
		
		var success = function(jsonResult) {
			
			//
			// Création de la liste des projets (Queries) sur la page d'accueil
			//
			
			App.Views.QueriesView = new Chatanoo.QueriesView(jsonResult);
			
			// console.log("queries", App.Views.QueriesView.collection.length);
		};
		
		t.ajax("queries", jsonInput, success)
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
				}
			}
	
			// console.log("keyWord", App.Collections.keyWord.length);

			// ... et enfin des items de la  de la query
			t.fetchItemsOfQuery(queryId);
		};
		
		t.ajax("search", jsonInput, success)
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
		
		t.ajax("plugins", jsonInput, success)
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
		
		t.ajax("medias", jsonInput, success)
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
		
		t.ajax("comments", jsonInput, success)
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
		
		t.ajax("datas", jsonInput, success)
		
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
		
		t.ajax("items", jsonInput, success)
		
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
		
		t.ajax("comments", jsonInput, success)
		
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
		
		t.ajax("items", jsonInput, success)
		
	},	


	/* Titres des items (affichés en rollOver) */

	openTooltipItem: function(itemId, titre, position) {
		
		var parentToolTip = $(".global");
		parentToolTip.append("<div class='tooltip'>" + titre + "</div>");
		
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.css("position", "absolute");
		tooltipEl.css("left", position.left + "px");
		tooltipEl.css("top", position.top + "px");
		
	},
	
	closeTooltipItem: function(itemId, titre, position) {
		var parentToolTip = $(".global");
		var tooltipEl = $(".tooltip", parentToolTip);
		tooltipEl.remove();
	},
	
	
	
	/* MediaPlayer */
	
	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3) {
		var popupView = this.prepareMediaPlayer();
		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3);
	},
	
	prepareMediaPlayer: function( playerWidth, playerHeight ) {
			
		var t = this;
		
		// TODO On affiche la popUp avec un Gif de chargement
		
		var popUpElement = $("#popup");
		popUpElement.css("display", "block");
		
		// Taille de la popUp
		var popUpReference = $("#mosaique");
		var popUpWidth = playerWidth || popUpReference.width();
		var popUpHeight = playerHeight || popUpReference.height();
		
		var popUp = new Chatanoo.PopUpView( { el : popUpElement } ).render( { width:popUpWidth, height:popUpHeight });
		
		var mediaWidth = Math.floor(popUpWidth * 0.9);
		var mediaHeight = Math.floor(popUpHeight * 0.9) - 80;
		
		popUp.mediaWidth = mediaWidth;
		popUp.mediaHeight = mediaHeight;
		
		var popUpContentMedia = $(".popupMedia", popUpElement);
		popUpContentMedia.css("width", mediaWidth + "px");
		popUpContentMedia.css("height", mediaHeight + "px");
		popUpContentMedia.css("margin-left", (popUpWidth * 0.05) + "px");
		popUpContentMedia.css("margin-top", (popUpHeight * 0.05) + "px");
		
		var popUpSliders = $(".popupSliders", popUpElement);
		popUpSliders.css("top", (mediaHeight + 50) + "px");

		return popUp;
	},
	
	openMediaItemInPlayer: function( popupView, itemId, motCle, motCle1, motCle2, motCle3) {
		
		var t = this;
		
		var popUpElement = popupView.$el;
		var mediaParent = $(".popupMedia", popUpElement);
		var mediaWidth = popupView.mediaWidth;
		var mediaHeight = popupView.mediaHeight;
		
		var success = function(jsonResult) {
			
			if (jsonResult.Picture && (jsonResult.Picture.length > 0))
			{
				var imageObject = jsonResult.Picture[0];
				var imageId = imageObject.id;
				var titreImage = imageObject.title;
				var urlImage = imageObject.url;
				
				// console.log(imageId, titreImage, urlImage);
				
				var model = new MediaModel( { itemId: itemId, id: imageId, url: t.mediaCenterURL + urlImage + ".jpg" } );
				var imageView = new Chatanoo.ImageView( { el: mediaParent, model: model } ).render();
				
				popupView.model = model;
			}
			else if (jsonResult.Video && (jsonResult.Video.length > 0))
			{
				var videoObject = jsonResult.Video[0];
				var videoId = videoObject.id;
				var titreVideo = videoObject.title;
				var urlVideo = videoObject.url;
				
				// console.log(videoId, titreVideo, urlVideo);
				
				var model = new MediaModel( { itemId: itemId, id: videoId, url: t.mediaCenterURL + urlVideo + ".mp4", width: mediaWidth, height: mediaHeight, autoplay: true } );
				var videoView = new Chatanoo.VideoView( { el: mediaParent, model: model } ).loadVideo();
				
				popupView.model = model;
			}
			else if (jsonResult.Audio && (jsonResult.Audio.length > 0))
			{
				// console.log("openMediaItem : Audio --> TODO : player audio ", jsonResult );
			}
			else if (jsonResult.Text && (jsonResult.Text.length > 0))
			{
				// console.log("openMediaItem : Text --> TODO : div texte ", jsonResult );
			}
			else
			{
				// console.log("openMediaItem : type non prévu", jsonResult );
			}
		};
		
		t.fetchMediaOfItem(itemId, success)
	},


	/* Vote */

	voteMediaItem: function(itemId, voteIc, voteRu) {
		
		// console.log("vote BBC", itemId, voteIc, voteRu);
		
		var t = this;
		var rate = t.getRate(voteIc, voteRu);
		
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
		
		t.ajax("items", jsonInput, success)
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
		
		t.ajax("datas", jsonInput, success)
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
		
		t.ajax("queries", jsonInput, success)
	},

	addMediaIntoItem: function(itemId, mediaTitle, mediaFilename, success) {
		
		var t = this;
		
		var mediaArray = mediaFilename.split("-");
		var mediaType = mediaArray[mediaArray.length - 1];
		var mediaClass;
		 
		switch(mediaType)
		{
			case "P":
			mediaClass = "Vo_Media_Picture";
			break;
			
			case "V":
			mediaClass = "Vo_Media_Video";
			break;
			
			case "A":
			mediaClass = "Vo_Media_Audio";
			break;
			
			default:
			// Textes ?
		}
		
		var userId = t.currentUserId ? t.currentUserId : 0;
		var mediaVO = {"users_id":userId, "url":mediaFilename, "title":mediaTitle, "__className":mediaClass, "isValid":true, "id":0, "preview":null, "width":null,"height":null, "description":null, "setDate":null, "addDate":null};
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "addMediaIntoItem",
			"params" : [mediaVO, itemId]
		};
		
		var success = success || function(jsonResult) {
			// Retourne l'id du media ajouté
			// console.log(jsonResult);
		};
		
		t.ajax("items", jsonInput, success)
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
		
		t.ajax("items", jsonInput, success)
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
		
		t.ajax("items", jsonInput, success)
	},

	
	
	// --------------------------------------------------
	//
	// Formulaire d'Upload
	//
	// --------------------------------------------------

	openUploadView: function() {
	
		var t = this;
		
		var popUpElement = $(".uploadParent");
		popUpElement.css("display", "block");
		
		t.popupUpload = new Chatanoo.UploadView( { el : popUpElement } );
		t.popupUpload.urlCarte = t.mapURL;
		t.popupUpload.render();
	
		t.initLoginForm();
	},
	
	closeUploadView: function() {
		
		var t = this;
		if (t.popupUpload) t.popupUpload.closePopUp();
		
	},
	
	initLoginForm: function () {
		
		var t = this;
		t.initUploadQuerySelect();

		// Fomulaire de Login
		var form = document.getElementById('loginForm');
		
		form.onsubmit = function(event) {
			event.preventDefault();
			t.checkLoginForUpload();
		};
		
		$("#toEtape2Button").css("display", "none");
	},
	
	checkLoginForUpload: function() {
		
		var t = this;
		
		var pseudo = $("#pseudo").val();
		var password = $("#password").val();
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getUserByLogin",
			"params" : [pseudo, password]
		};
		
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
		
		t.ajax("users", jsonInput, success)
	},

	initUploadQuerySelect: function() {

		var t = this;

		// Liste des questions :
		var questionSelect = $("#formQueries");
		var queryCollection = App.Views.QueriesView.collection;
		
		// Par défaut :
		var defaultQuery = queryCollection.at(0);
		t.uploadQueryId = defaultQuery.get("id");
		
		// console.log("initUploadForm", queryCollection.length, questionSelect);
		
		queryCollection.each( function (query)
		{
			var queryId = query.get("id");
			var queryTitle = query.get("content");
			
			questionSelect.append("<option data-id='" + queryId + "' value=' " + queryId + "'>" +  queryTitle +" </option>");
		});
		
		questionSelect.on("change", function(e) {
			var queryId = $(e.target).val();
			// console.log("change", queryId);
			
			t.uploadQueryId = queryId;
		});
		
	},
	
	initUploadForm: function() {
		
		var t = this;
		
		// On affiche le formulaire d'upload
		$("#etape_user").css("display", "none");
		$("#etape_upload").css("display", "block");
		
		var form = $("#fileUploadForm");
		var fileSelect = $("#fileSelect");
		var uploadButton = $("#uploadButton");

		var files;
		
		var uploadFiles = function (event)
		{
			event.stopPropagation();
			event.preventDefault();
		
			// console.log(t.uploadURL, files.length)
		
			// START A LOADING SPINNER HERE
		
			var data = new FormData();
			
			for (var i = 0; i < files.length; i++) {
				
			  var file = files[i];
			
			  if (! file.type.match('image.*')) {
				continue;
			  }
			  
			  data.append('file', file, file.name);
			  
			  break;
			}
		
			$.ajax({
				url: t.uploadURL,
				type: 'POST',
				data: data,
				cache: false,
				processData: false,
				contentType: false,
				success: function(data, textStatus, jqXHR)
				{
					// Le serveur renvoie l'id du media uploadé (ex : MC-pXWxGcoX-P )
					if (typeof data.error === 'undefined')
					{
						// console.log('Upload success: ' + data);
						
						t.displayButtonToValidateUploadMedia( data );
					}
					else
					{
						console.log('Upload error 1: ' + data.error);
					}
					
					// STOP LOADING SPINNER
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					console.log('Upload error 2: ' + textStatus);
					
					// STOP LOADING SPINNER
				}
			});
		}		
		
		$('input[type=file]').on('change', function (event)
		{
			files = event.target.files;
			form.on('submit', uploadFiles);
		});
		
	},

	displayButtonToValidateUploadMedia: function( mediaFileName ) {
		
		var t = this;
		var mediaTitle = $("#itemTitle").val();
		
		// TODO : Chargement du media pour contrôler ce qui a été transmis
		// console.log("displayButtonToValidateUploadMedia", mediaFileName);
		
		// La suite est maintenant accessible : étape 2
		$("#toEtape2Button").css("display", "block");
		$("#toEtape2Button").on("click", function(){ t.validUploadEtape2( mediaTitle, mediaFileName ); } );

	},
	
	validUploadEtape2: function( mediaTitle, mediaFileName ) {
		
		// console.log("validUploadEtape2");
		
		var t = this;
		
		t.uploadMediaTitle = mediaTitle;
		t.uploadMediaFileName = mediaFileName;
		
		$("#toEtape2Button").off("click");
		$("#toEtape3Button").on("click", function(){ t.validUploadEtape3(); } );
		
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
		
		keywordsSelect.on("change", function(e) {
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
		
		$("#toEtape4Button").css("display", "block");
		$("#toEtape4Button").on("click", function(){ t.validUploadEtape4(keyWordId, keywordTitle); } );
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
		
		// Drag and drop du perso sur la carte :
		
		var item = $(".global .uploadParent .uploadContent .uploadBody .mapParent .item");
		var map = $(item).siblings(".map");
		var mapWidth = map.width();
		var mapHeight = map.height();
		
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
			$("#toEtape5Button").css("display", "block");
		};

		
		var draggable = Draggable.create(item, { onDragEnd:onDragEnd });
		TweenLite.set(item, { x: mapWidth * 0.5, y: mapHeight * 0.5 });
		
		// Bouton de validation de l'étape de la carte :
		$("#toEtape5Button").css("display", "block");
		$("#toEtape5Button").on("click", function(){ t.validUploadEtape5( mapX, mapY); } );
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
		t.addMediaIntoItem(t.uploadItemId, t.uploadMediaTitle, t.uploadMediaFileName, successAddMediaToItem); 
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
		// console.log("fin de l'upload"); 
		
		$("#etape_conclusion").css("display", "block");		
		$("#toEtape6Button").on("click", function()
		{ 
			$("#toEtape6Button").off("click");
			t.closeUploadView(); 
		} );

	},

/*

(Mauvais login...)
connection
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Content-length: 128 
{"method":"login","id":"VB4I-SG6H-4ZFI-T75R-EF5N-PQRC","params":["carolann_d13","desperado","qJlCaSsBbYBYypwF9TT8KmCOxhuZ3wIj"]}
{"result":false,"id":"VB4I-SG6H-4ZFI-T75R-EF5N-PQRC"}

(Login ok)
connection
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Content-length: 129 
{"method":"login","id":"EJBB-XTD2-L98O-77JU-ZXHU-DJHW","params":["carolann_d13","desperados","qJlCaSsBbYBYypwF9TT8KmCOxhuZ3wIj"]}
{"result":"XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL","id":"EJBB-XTD2-L98O-77JU-ZXHU-DJHW"}


users
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 103 
{"method":"getUserByLogin","id":"37QR-KOZ9-WNXK-LMV7-27P6-JJMR","params":["carolann_d13","desperados"]}
{"result":{"id":"1","firstName":"concert","lastName":"urbain","pseudo":"carolann_d13","password":"0fba5c22724cbfe3a9ec1e1cb1d7b690e4ef57bb","email":"carol-ann.braun@wanadoo.fr","role":"admin","_isBan":"1","addDate":"2009.11.01 02:10:16","setDate":"2011.05.15 16:37:05","__className":"Vo_User"},"id":"37QR-KOZ9-WNXK-LMV7-27P6-JJMR"}


// Ajout de l'item
queries
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 256 
{"method":"addItemIntoQuery","id":"P87A-9UXN-G22B-9N03-HD73-OK8M","params":[{"isValid":true,"title":"test","setDate":null,"__className":"Vo_Item","description":"","users_id":0,"id":0,"addDate":null,"rate":0},10,{"title":"test","fileName":"MC-npEitHdo-P"}]}
{"result":"1219","id":"P87A-9UXN-G22B-9N03-HD73-OK8M"}


// Ajout du media à l'item
items
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 281 
{"method":"addMediaIntoItem","id":"HJIJ-4I67-QN8J-SK1K-72CD-EAAW","params":[{"setDate":null,"preview":null,"width":null,"isValid":false,"height":null,"title":"test","addDate":null,"description":null,"url":"MC-npEitHdo-P","users_id":0,"id":0,"__className":"Vo_Media_Picture"},1219]}
{"result":"445","id":"HJIJ-4I67-QN8J-SK1K-72CD-EAAW"}

// Ajout du Vote à l'item
items
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 169 
{"method":"addDataIntoVo","id":"RHED-842Q-V619-PB28-REZ4-9HKX","params":[{"addDate":null,"rate":1,"users_id":0,"id":0,"setDate":null,"__className":"Vo_Data_Vote"},1219]}
{"result":"2734","id":"RHED-842Q-V619-PB28-REZ4-9HKX"}

// Ajout du mot-clé
items
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 152 
{"method":"addMetaIntoVo","id":"ZWSV-5PPV-GY7L-DIMT-BURI-8JRP","params":[{"content":"agression","id":17,"name":"KeyWord","__className":"Vo_Meta"},1219]}
{"result":17,"id":"ZWSV-5PPV-GY7L-DIMT-BURI-8JRP"}

// Récupération des données géographiques
datas
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 81 
{"method":"getDatasByQueryId","id":"TE36-MLAZ-PZ2N-RNRV-377K-DIBX","params":[10]}
{"result":{"Carto":[{"x":"48.8214","y":"2.36607","id":"15","addDate":"2009.11.03 04:36:49","setDate":"2011.04.28 16:44:12","__className":"Vo_Data_Carto"}]},"id":"TE36-MLAZ-PZ2N-RNRV-377K-DIBX"}

// Ajout de la position géographique à l'item
items
Referer: http://www.dring13.org/semaine_egalite/Dring13Upload_JSON.swf Content-type: application/json Authorization: XnauhbcN7rDbCdoVr24IwLlO7sZRYmJL Content-length: 192 
{"method":"addDataIntoVo","id":"R7BZ-HISJ-INAM-FNG0-5KB9-7PUH","params":[{"x":48.81390517570364,"addDate":null,"setDate":null,"id":0,"y":2.344161101081081,"__className":"Vo_Data_Carto"},1219]}
{"result":"792","id":"R7BZ-HISJ-INAM-FNG0-5KB9-7PUH"}



*/	
	

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
		
		spinner.el.remove();
		
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
			url: "proxy/ba-simple-proxy.php?url=" + t.serviceURL + "/" + serviceName + "/json",
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
