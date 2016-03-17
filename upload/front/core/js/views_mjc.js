
Chatanoo.CoolPasCoolItemView = Backbone.View.extend({
	
	initialize: function (param) {
		this.template = _.template($("#itemTemplate").html())
	},
	
	render: function () {
		
		this.setElement(this.template(this.model.toJSON()));
		
		return this;
	},
	
    events: {
		"click a": "selectItem",
		"mouseover a": "rollOverItem",
		"mouseout a": "rollOutItem"
	},

    rollOverItem: function (e)
	{
		var el = $(e.currentTarget);
		
		var position = el.offset();
		var itemId = this.model.get("id");
		var titre = this.model.get("title");
		var user = this.model.get("user").get("pseudo");
		
		var v = App.eventManager;
		if (v) v.trigger("itemRollOver", itemId, titre, user, position);
	},

    rollOutItem: function (e)
	{
		var el = $(e.currentTarget);
		
		var position = el.offset();
		var itemId = this.model.get("id");
		var titre = this.model.get("titre");
		
		var v = App.eventManager;
		if (v) v.trigger("itemRollOut", itemId, titre, position);
	},

    selectItem: function (e)
	{
		var el = $(e.currentTarget);
		var parentEl = el.parent();
		
		var itemId = this.model.get("id");
		var motCle  = this.model.get("motCle");
		
		// console.log("ok", el, parentEl.data("id"), itemId);
		
		var v = App.eventManager;
		if (v) v.trigger("itemSelection", itemId, motCle);
	}
});


//
// Vues MJC : 2 - Users
//

Chatanoo.UsersView = Chatanoo.MosaiqueItemsView.extend({
	
	el: "#users",
	
	renderItem: function (item, no)
	{
		// On n'affiche pas les users sans pseudo
		if ( (item.get("pseudo")).length > 0)
		{
			var itemView = new Chatanoo.UserView({
				model: item
			});
			
			// cf CollectionView
			this.addSubview(itemView);
			
			this.$el.append( itemView.render().el );	
			
			itemView.addItems();
		}
	}
	
});

Chatanoo.UserView = Backbone.View.extend({
	
	initialize: function (param) {
		this.template = _.template($("#itemUserTemplate").html())
	},
	
	render: function () {
		
		this.setElement(this.template(this.model.toJSON()));
		
		return this;
	},
	
	addItems: function () {
		
		var el = this.el;
		
		var userEl = $(this.el);
		var userName = $(".userName", userEl);
		var userItems = $(".userItemsParent", userEl);
		
		// L'élément est "hidden". 
		// On passe par un plug-in pour en connaître la dimension
		var w = userName.actual( 'width' );
		var h = userName.actual( 'height' );
		
		var rx = 1.5 * w / 2;
		var ry = 1.5 * h / 2;
		
			
		var items = this.model.get("items");
		var n = items.length;
		
		var indexItem = 0;
		var t = this;
		
		_.each(items, function(item) {

			var angle = Math.PI + 2 * Math.PI * indexItem/n;
					
			var left = Math.floor(rx + rx * Math.cos(angle)) - 25;
			var top  = Math.floor(ry + 2 * ry * Math.sin(angle)) - 34;
		
			var clone = item.clone();
			clone.set("left", left);
			clone.set("top",  top);
			
			var userItemView = new Chatanoo.CoolPasCoolItemView({
				model: clone
			});
			
			// cf CollectionView
			// t.addSubview(userItemView);
			
			userItems.append( userItemView.render().el );	
			
			indexItem++;
		});
	}
});

//
// Vues MJC : 3 - Mots-clés
//

Chatanoo.KeywordsView = Chatanoo.MosaiqueItemsView.extend({
	
	el: "#motcles",
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.KeywordView({
			model: item
		});
		
		// cf CollectionView
		this.addSubview(itemView);
		
		this.$el.append( itemView.render().el );	
		
		itemView.addItems();
	}
	
});

Chatanoo.KeywordView = Backbone.View.extend({
	
	initialize: function (param) {
		this.template = _.template($("#itemMotCleTemplate").html())
	},
	
	render: function () {
		
		this.setElement(this.template(this.model.toJSON()));
		
		return this;
	},
	
	addItems: function () {
		
		var el = this.el;
		
		var keywordParent = $(".motCleItemsParent", el);
		
		var items = this.model.get("items");
		if (! items) return;
		
		var t = this;
		
		_.each(items, function(item) {

			var keywordItemView = new Chatanoo.CoolPasCoolItemView({
				model: item
			});
			
			// cf CollectionView
			// t.addSubview(userItemView);
			
			var keywordItemEl = keywordItemView.render().el;
			
			keywordParent.append( keywordItemEl );
	
			$(keywordItemEl, ".motCle").attr("style", "");
		});
	}
});


//
// Vues MJC : 4 - Cartes
//

Chatanoo.MapItemsView = Chatanoo.MosaiqueItemsView.extend({
	
	el: "#carte",
	className:"carte",
	
	initialize: function (itemCollection, mapUrl) {
		
		this.map = mapUrl;
		
		Chatanoo.MosaiqueItemsView.prototype.initialize.call(this, itemCollection);
		
	},

	render: function () {
		
		this.removeSubviews();
		
		// 1. Background de la carte
		var bgImageModel = new Backbone.Model( { id:0, url: this.map } );
		var bgView = new Chatanoo.ImageView( { model: bgImageModel } );
		this.$el.append( bgView.render().el );	
		
		// cf CollectionView
		this.addSubview(bgView);
		
		// 2. Items de la carte
		var no = 0;
		
		_.each(this.collection.models, function (item) {
			this.renderItem(item, no++);
		}, this);

	},
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.MapItemView({
			model: item
		});
		
		this.$el.append( itemView.render().el );	
		
		// cf CollectionView
		this.addSubview(itemView);	
	}
	
});

Chatanoo.MapItemView = Chatanoo.CoolPasCoolItemView.extend({
	
	initialize: function (param) {
		this.template = _.template($("#itemMapTemplate").html())
	}
	
});





//
// Contrôleur MJC
//

var MJCAppView = AppView.extend({

	initialize: function () {
		
		var t = this;
		
		// Adresses des différents services (webs services, mediaCenter, upload)
		this.serviceURL = "http://core.aws.chatanoo.org/services";
		this.mediaCenterURL = "http://medias.aws.chatanoo.org/";
		this.uploadURL = "http://mc.chatanoo.org/upload";
		
		// Valeurs par défaut des 4 termes (peut être modifié via l'admin, en ajoutant des métas-données à chaque question)
		this.axeHorizontal = { gauche:"individuel", droite:"collectif" };
		this.axeVertical   = { bas:"réaliste", haut:"utopique" };
		
		this.updateTermes();

			
		//
		// Vues et fonctionnement des onglets
		//

		// --> Onglet par défaut : questions
		t.selectVue(1, 0, 0, 0, 0, false);
		$(".onglet.questions").addClass("active");

		// Permet de gérer les click au niveau des "div" parent d'un lien (plutôt qu'au niveau du lien lui-même)
		$(document).delegate("a", "click", function(evt) {
			var href = $(this).attr("href");
			if (href == "#") evt.preventDefault();
		});	
		

		// Envoi d'un témoignage (upload)
		$("#envoyer").off().on("click", function() { t.openUploadView() });

		
		//
		// Gestion du redimensionnement de la fenêtre
		//
		
		var resize = function()
		{
			var bodyHeight = $("body").height();
			var headerHeight = $(".header").height();
			var footerHeight = $(".footer").height();
			var reste = bodyHeight - headerHeight - footerHeight;
			$(".accueil").height( reste );
			$(".mosaique").height( reste );
			
			t.redrawViews();
			t.updateTermes();
		};

		$.event.special.removed = {
			remove: function(o) {
				if (o.handler) {
					o.handler()
				}
			}
		};

		window.onresize = function()
		{
			resize();
		};
		
		resize();
			
		$(".global .footer .navigationFooter").css("display", "none");
	},
	
	updateTermes: function() {
		
		var utopiqueParagraph = $(".global .haut .utopique > p");
		
		var hauteurGauche = utopiqueParagraph.html(this.axeHorizontal.gauche).width();
		var hauteurDroite = utopiqueParagraph.text(this.axeHorizontal.droite).width();
		
		$(".terme.individuel > p").html( this.axeHorizontal.gauche );
		$(".terme.collectif > p").html( this.axeHorizontal.droite );
		
		$(".terme.realiste > p").html( this.axeVertical.bas );
		$(".terme.utopique > p").html( this.axeVertical.haut );
		
		// RQ : le positionnement du champ semble dépendre de la largeur de la colonne droite/gauche
		// (cette largeur se retrouve comme hauteur suite au transform-rotation)
		// On ajoute donc une correction proportionnelle à la largeur :
		var correctionDroite = $(".global .milieu .droite").width() * 0.25;
		var correctionGauche = $(".global .milieu .gauche").width() * 0.25;
		
		var mosaique = $("#mosaique");
		var mosaiqueHeight = mosaique.height();
		var paddingDroit = ( mosaiqueHeight - hauteurDroite ) * 0.5 + correctionDroite;
		var paddingGauche = ( mosaiqueHeight - hauteurGauche ) * 0.5 + correctionGauche;
		
		$(".global .milieu .droite").css("padding-top", paddingDroit + "px");
		$(".global .milieu .gauche").css("padding-top", paddingGauche + "px");
	},
	
	hideBackground: function(queryId) {
		this.mosaiqueElement.css("background-image", "none");
	},
	
	getQueriesMedias: function(queryId) {
		var queryMediasModel = App.Collections.queriesMedias.getModelById(queryId);
		if ( ! queryMediasModel)
		{
			queryMediasModel = new QueryMediasModel( { id:queryId } ); 
			App.Collections.queriesMedias.add( queryMediasModel )			
		}
		return queryMediasModel;
	},
	
	updateBackground: function(queryId) {
		
		var t = this;
		
		// Chargement de l'image de fond de la mosaique...
		
		// Images de fond déclarées dans le XML, ou dans les metadonnées
		var queryMediasModel = t.getQueriesMedias(queryId);
		var images = queryMediasModel.get("images");
		if (( images != null) && (images.length > 0) ) {
			var randomImages = _.shuffle(images);
			var randomImage = _(randomImages[0]).strip();
			
			if (randomImage.indexOf("http") == 0) {
				randomImagePath = randomImage;
			}
			else if (randomImage.indexOf("-P") !== -1)
			{
				// Images du MediaCenter
				var randomImagePath = this.mediaCenterURL + randomImage + ".jpg";
			}
			else
			{
				// Images du XML
				var subfolder = queryMediasModel.get("subfolder");
				var randomImagePath = "medias/images/" + (subfolder ? subfolder : "") + randomImage;
			}
			
			t.backgroundImage = "url('" + randomImagePath + "')";
			t.mosaiqueElement.css("background-image", t.backgroundImage);
		}
	},
	
	selectVue: function(accueil, motscles, items, carte, users, dontUpdateRouter)
	{
		var t = this;
		
		$(".onglet").removeClass("active");
		$(".onglet").removeClass("inactive");
		
		// Vues (Accueil / Questions)
		t.accueilElement.css("display", accueil ? "block" : "none" );
		t.mosaiqueElement.css("display", accueil ? "none" : "block" );

		// Sous-vues des questions :
		$("#motcles").css("display", motscles ? "block" : "none");
		$("#items").css("display", items ? "block" : "none");
		$("#carte").css("display", carte ? "block" : "none");
		$("#users").css("display", users ? "block" : "none");
	
		if (t.backgroundImage) 
			$("#mosaique").css("background-image", items ? t.backgroundImage : "none");

		if (accueil)
		{
			$(".header .titre p").text( t.titreAccueil );
		
			$(".onglet.motcles").off("click");
			$(".onglet.items").off("click");
			$(".onglet.carte").off("click");
			$(".onglet.users").off("click");
			
			$(".onglet.motcles").addClass("inactive");
			$(".onglet.items").addClass("inactive");
			$(".onglet.carte").addClass("inactive");
			$(".onglet.users").addClass("inactive");
			
			if (dontUpdateRouter !== false) {
				// Routeur
				App.Router.addToHistory("");
			}
		}
		else
		{
			$(".onglet.questions").off().on("click", function() {
				t.selectVue(1, 0, 0, 0, 0);
				$(this).addClass("active");
			});
			
			$(".onglet.motcles").off().on("click", function() {
				t.selectVue(0, 1, 0, 0, 0);
				$(this).addClass("active");
			});
			
			$(".onglet.items").off().on("click", function() {
				t.selectVue(0, 0, 1, 0, 0);
				$(this).addClass("active");
			});
			
			$(".onglet.carte").off().on("click", function() {
				t.redrawMap();
				t.selectVue(0, 0, 0, 1, 0);
				$(this).addClass("active");
			});
			
			$(".onglet.users").off().on("click", function() {
				t.selectVue(0, 0, 0, 0, 1);
				$(this).addClass("active");
			});
			
			if (dontUpdateRouter !== false) {
				
				// Routeur
				var vue;
				if (motscles)
				{
					vue = "motscles";
				}
				else if (items)
				{
					vue = "mosaique";
				}
				else if (carte)
				{
					vue = "carte";
				}
				else if (users)
				{
					vue = "participants";
				}
				
				App.Router.addToHistory("question/" + t.currentQuery + "/" + vue);
			}
		}

		if (items)
		{
			// Interface aux bords arrondis
			$("#mosaique").css("border", "none");
			$("#mosaique").css("-moz-border-radius", "15px");
			$("#mosaique").css("-webkit-border-radius", "15px");
			$("#mosaique").css("-ms-border-radius", "15px");
			$("#mosaique").css("border-radius", "15px");
			//
			$(".global .terme").css("opacity", 1);
		}
		else
		{
			// Interfaces aux bords droits
			$("#mosaique").css("border", "2px #ae0d03 solid");
			$("#mosaique").css("-moz-border-radius", "0px");
			$("#mosaique").css("-webkit-border-radius", "0px");
			$("#mosaique").css("-ms-border-radius", "0px");
			$("#mosaique").css("border-radius", "0px");
			//
			$(".global .terme").css("opacity", 0);
		}
		
		$(".global .footer .navigationFooter").css("display", accueil ? "none" : "block");
	},


	// --------------------------------------------------
	//
	// Mosaïque
	//
	// --------------------------------------------------

	//
	// Webs Services
	//
		
	loadQuery: function(queryId) {
		
		var t = this;
		t.currentQuery = queryId;
		
		t.selectVue(0, 0, 1, 0, 0);

		console.log("** loadQuery **");

		$(".onglet.items").addClass("active");
		
		// On masque l'accueil et on affiche la mosaique
		t.accueilElement.css("display", "none");
		t.mosaiqueElement.css("display", "block");
		
		// Mise à jour du titre
		var queryModel = App.Views.QueriesView.collection.findWhere( { id:queryId } );
		var titre = queryModel.get("content");
		$(".header .titre p").text(titre);
		
		this.hideBackground();

		if (App.Views.MosaiqueItemsView) App.Views.MosaiqueItemsView.close();
		if (App.Views.KeywordsView) App.Views.KeywordsView.close();
		if (App.Views.UsersView) App.Views.UsersView.close();
		if (App.Views.MapItemsView) App.Views.MapItemsView.close();

		// Chargement des données
		t.loadDatasOfQuery(queryId);
	},
	
	loadDatasOfQuery: function(queryId) {
		
		var t = this;
		
		// ... puis des données de la query (carto)
		t.fetchDatasOfQuery(queryId);
		
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
			
			// 
			App.Collections.Type1KeyWord = new MetaCollection();
			App.Collections.Type2KeyWord = new MetaCollection();
			App.Collections.Type3KeyWord = new MetaCollection();
			
			var isMetaDataForBackgroundImage = false;
			var queryMediasModel = t.getQueriesMedias(queryId);
					
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				
				switch(jsonItem.name)
				{
					case "Type1KeyWord":
					App.Collections.Type1KeyWord.add( new MetaModel(jsonItem) );
					break;
					
					case "Type2KeyWord":
					App.Collections.Type2KeyWord.add( new MetaModel(jsonItem) );
					break;
					
					case "Type3KeyWord":
					App.Collections.Type3KeyWord.add( new MetaModel(jsonItem) );
					break;
					
					case "KeyWord":
					break;
					
					case "MapZoom":
					break;
					
					case "MapType":
					break;
				
					case "AXE_HORIZONTAL_GAUCHE":
					t.axeHorizontal.gauche = ((jsonItem.content) && (jsonItem.content.length > 0)) ? jsonItem.content : "individuel";					
					break;
					
					case "AXE_HORIZONTAL_DROITE":
					t.axeHorizontal.droite = ((jsonItem.content) && (jsonItem.content.length > 0)) ? jsonItem.content : "collectif";					
					break;
					
					case "AXE_VERTICAL_BAS":
					t.axeVertical.bas = ((jsonItem.content) && (jsonItem.content.length > 0)) ? jsonItem.content : "réaliste";					
					break;
					
					case "AXE_VERTICAL_HAUT":
					t.axeVertical.haut = ((jsonItem.content) && (jsonItem.content.length > 0)) ? jsonItem.content : "utopique";					
					break;
					
					case "BACKGROUND_IMAGE":
					
					if ((jsonItem.content) && (jsonItem.content.length > 0))
					{
						var imageID = jsonItem.content;
						var imageURL = t.getImagePath(imageID);

						if (isMetaDataForBackgroundImage == false) {
							isMetaDataForBackgroundImage = true;
							queryMediasModel.set("images", [imageURL]);
						}
						else
						{
							var images = queryMediasModel.get("images");
							images.push(imageURL);
						}
					}
				}
			}

			t.updateTermes();
			t.updateBackground(queryId);
			
			// console.log("Type1KeyWord", App.Collections.Type1KeyWord.length);
			// console.log("Type2KeyWord", App.Collections.Type2KeyWord.length);
			// console.log("Type3KeyWord", App.Collections.Type3KeyWord.length);

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
			
			var type1KeyWords = App.Collections.Type1KeyWord.getContents();
			var type2KeyWords = App.Collections.Type2KeyWord.getContents();
			var type3KeyWords = App.Collections.Type3KeyWord.getContents();
			
			// console.log("type1KeyWords", type1KeyWords);
			// console.log("type2KeyWords", type2KeyWords);
			// console.log("type3KeyWords", type3KeyWords);

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
				if (jsonItemVO._isValid != false)
				{
					jsonItemUser = jsonItem.user;
					jsonItemCartos = jsonItem.datas.Carto[0];
					jsonItemVotes = jsonItem.datas.Vote;
					jsonItemMetas = jsonItem.metas;
					jsonItemRate = jsonItem.rate;
					
					// console.log(jsonItemVotes);
					
					var votes = new DataVoteCollection(jsonItemVotes);
					votes.comparator = 'page';
					
					var metas = new MetaCollection(jsonItemMetas);
					metas.comparator = 'name';
					
					var itemModel = new ItemModel(jsonItemVO);
					itemModel.set("user"  , new UserModel(jsonItemUser));
					itemModel.set("cartos", new DataCartoModel(jsonItemCartos));
					itemModel.set("votes" , votes);
					itemModel.set("metas" , metas);
	
					//
					// Médias (selon type)
					//
					
					jsonItemMedias = jsonItem.medias;
					
					if (jsonItemMedias.Picture && (jsonItemMedias.Picture.length > 0))
					{
						itemModel.set("media", new MediaModel(jsonItemMedias.Picture[0]));
					}
					else if (jsonItemMedias.Video && (jsonItemMedias.Video.length > 0))
					{
						itemModel.set("media", new MediaModel(jsonItemMedias.Video[0]));
					}
					else if (jsonItemMedias.Sound && (jsonItemMedias.Sound.length > 0))
					{
						itemModel.set("media", new MediaModel(jsonItemMedias.Sound[0]));
					}
					else if (jsonItemMedias.Text && (jsonItemMedias.Text.length > 0))
					{
						itemModel.set("media", new MediaModel(jsonItemMedias.Text[0]));
					}
					
					itemModel.analyseMetaKeywords(type1KeyWords, type2KeyWords, type3KeyWords, t.metaStringToColor);
					
					itemsCollection.add ( itemModel ); 
				}
			}

			t.buildView();
		};
		
		t.ajax("plugins", jsonInput, success)
	},

	redrawViews: function() {

		var t = this;
		
		var itemsCollection = App.Collections.itemsCollection;
		if (! itemsCollection) return;
		
		var mosaique = $("#mosaique");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
		var layer;

		// Vue Mosaïque
		
		itemsCollection.each(function(item)
		{
			var icon = item.get("icon");
			if (icon)
			{
				item.computeRateFromVotes(mosaiqueWidth, mosaiqueHeight);
				
				var positions = item.get("positionsMoyenneVotes");
				var lastPosition = positions[positions.length - 1];
				
				if (lastPosition)
				{
					icon.setX(lastPosition.x);
					icon.setY(lastPosition.y);
					
					if (! layer) layer = icon.parent;
				}
			}
		});
		
		if (layer) layer.draw();
		
		t.redrawMap();
	},
	
	redrawMap: function() {	
	
		var t = this;
		var mosaique = $("#mosaique");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
		
		// Vue Carte
		var geoms = t.getMapGeoms( mosaiqueWidth, mosaiqueHeight );
		t.updateMap(geoms, mosaiqueWidth, mosaiqueHeight);
		
		// Recalcul de la position de la carte de chaque item
		t.updateItemsMapPosition( geoms );		
	},

	buildView: function() {
		
		var t = this;		
		var itemsCollection = App.Collections.itemsCollection;
		
		// console.log("buildView", itemsCollection.length)
		
		
		//
		// Création de la liste des projets (Items) sur la mosaïque
		//
	
		
		//
		// 1. Construction de l'écran des indices
		//
		
		var CanvasManager = function()
		{
			var mosaique = $("#mosaique");
			var mosaiqueWidth  = mosaique.width();
			var mosaiqueHeight = mosaique.height();
			
			t.stage = new Kinetic.Stage({
				container: 'items',
				width : 2000, // mosaiqueWidth,
				height: 1200  // mosaiqueHeight
			});
			
			t.voteLayer = new Kinetic.Layer();
			t.stage.add(t.voteLayer);
			
			t.layer = new Kinetic.Layer();
			t.stage.add(t.layer);
			
			var scale = 0.20;
				
			itemsCollection.each(function(item)
			{
				var itemId = item.get("id");
				var motCle1 = item.get("motCle1");
				var motCle2 = item.get("motCle2");
				var motCle3 = item.get("motCle3");
				var titre = item.get("title");
				var user = item.get("user").get("pseudo");
				
				item.computeRateFromVotes(mosaiqueWidth, mosaiqueHeight);
				
				var positions = item.get("positionsMoyenneVotes");
				var lastPosition = positions[positions.length - 1];
				
				if (lastPosition)
				{
					// Création du motif de l'item
					var icon = createIcon(t.layer, lastPosition.x, lastPosition.y, scale, itemId, motCle1, motCle2, motCle3, titre, user)
					
					item.set("icon", icon);
				}
			});
		
			t.layer.draw();
		};

		var canvas = new CanvasManager();
		
		
		//
		// 2. Autres vues
		//

		var mosaique = $("#items");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();
	
		var listeKeywords = [];
		var listeItemsForKeyword = []; // tableau associatif
		
		var listeUsers = [];
		var listeAssocUsers = [];
		var listeUserIds = [];
		
		var user, userId;
		
		itemsCollection.each(function(item)
		{
			//
			// Utilisateur :
			//
			
			user = item.get("user");
			userId = user.get("id");
			
			if (listeUserIds.indexOf(userId) == -1)
			{
				listeUserIds.push(userId);
				listeAssocUsers[userId] = user;
				listeUsers.push(user);
			}
			else
			{
				user = listeAssocUsers[userId];
			}
			
			// On stocke dans l'utilisateur la liste des items associés
			if ( user.get("items") == null)
			{
				user.set("items", []);
			}
			
			user.get("items").push(item);
			
			
			//
			// Mots-clés
			//
			
			var metaCollection = item.get("metas");
			var metaContent;
			
			metaCollection.each(function(meta)
			{
				if ((meta.get("name") == "Type1KeyWord") || (meta.get("name") == "Type2KeyWord") || (meta.get("name") == "Type3KeyWord"))
				{
					metaContent = meta.get("content");
					
					if (listeItemsForKeyword[metaContent] == null)
					{
						listeItemsForKeyword[metaContent] = [];
						listeKeywords.push(meta);
					}
					
					listeItemsForKeyword[metaContent].push(item);
				}
			});
			
		});


		// Dimension de la carte
		var geoms = t.getMapGeoms( mosaiqueWidth, mosaiqueHeight );
		
		// Recalcul de la position de la carte de chaque item
		t.updateItemsMapPosition( geoms );

		
		// 2) Construction de l'écran des users
		
		var userCollection = new UsersCollection();
		userCollection.add(listeUsers);
		
		if (App.Views.UsersView) App.Views.UsersView.close();
		App.Views.UsersView = new Chatanoo.UsersView(userCollection);


		// 3) Construction de l'écran des mots-clés
		
		var keywordsCollection = new MetaCollection();
		keywordsCollection.add(listeKeywords);

		keywordsCollection.each(function(meta) {
			var metaContent = meta.get("content");
			meta.set("items", listeItemsForKeyword[metaContent]);
		});
		
		if (App.Views.KeywordsView) App.Views.KeywordsView.close();
		App.Views.KeywordsView = new Chatanoo.KeywordsView(keywordsCollection);
		
		
		// 4) Construction de l'écran de la carte
		if (App.Views.MapItemsView) App.Views.MapItemsView.close();
		App.Views.MapItemsView = new Chatanoo.MapItemsView( itemsCollection, this.mapURL );
		
		t.updateMap(geoms, mosaiqueWidth, mosaiqueHeight);
	},

	getMapGeoms: function( mosaiqueWidth, mosaiqueHeight ) {
		
		var t = this;
		
		var largCarte = this.largeurCarte;
		var hautCarte = this.longueurCarte;
		
		var scaleCarteX = mosaiqueWidth  / largCarte;
		var scaleCarteY = mosaiqueHeight / hautCarte;
		var scaleCarte = Math.min( scaleCarteX, scaleCarteY );
		var carteMarginLeft, carteMarginTop;
		
		if (scaleCarte == scaleCarteX)
		{
			// La carte est calée sur la largeur
			// On doit centrer en hauteur
			carteMarginLeft = 0;
			carteMarginTop = (mosaiqueHeight - hautCarte * scaleCarte) / 2;
		}
		else
		{
			// La carte est calée sur la hauteur
			// On doit centrer en largeur
			carteMarginLeft = (mosaiqueWidth - largCarte * scaleCarte) / 2;
			carteMarginTop = 0;
		}
		
		return { scale: scaleCarte, marginLeft:carteMarginLeft, marginTop:carteMarginTop };
	},
	
	updateItemsMapPosition: function( geoms ) {
		
		var t = this;
		
		var itemsCollection = App.Collections.itemsCollection;
		if (! itemsCollection) return;
		
		var scaleCarte = geoms.scale;
		var carteMarginLeft = geoms.marginLeft;
		var carteMarginTop = geoms.marginTop;
		
		var largCarte = this.largeurCarte;
		var hautCarte = this.longueurCarte;
		
		var longGauche = this.longitudeGauche;
		var latTop = this.latitudeTop;
		
		var latitudeTopBottom = this.latitudeBottom - latTop;
		var longitudeGaucheDroite = this.longitudeDroite - longGauche;

		itemsCollection.each(function(item)
		{
			//
			// Position sur la carte
			//
			
			var percentX = 0, percentY = 0;
			
			var cartos = item.get("cartos");
			if (cartos)
			{
				if (cartos.get("y"))
					percentX = (cartos.get("y") - longGauche)/longitudeGaucheDroite;
					
				if (cartos.get("x"))
					percentY = (cartos.get("x") - latTop)/latitudeTopBottom;
			}
			
			var margin = 40;
			
			var left = percentX * largCarte;
			left = Math.max(margin, left);
			left = Math.min(largCarte - margin, left);
			left = Math.floor(left);
			
			var top = percentY * hautCarte;
			top = Math.max(margin, top);
			top = Math.min(hautCarte - margin, top);
			top = Math.floor(top);
			
			// console.log("cartos", cartos.get("y"), percentX, longGauche, "=", left, "/", cartos.get("x"), percentY, latTop, "=", top);
				
			item.set("mapTop", top);
			item.set("mapLeft", left);
		});
		
	},

	updateMap: function( geoms, mosaiqueWidth, mosaiqueHeight ) {
		
		var mapElement = $(App.Views.MapItemsView.$el);
		if (! mapElement) return;
		
		var scaleCarte = geoms.scale;
		var carteMarginLeft = geoms.marginLeft;
		var carteMarginTop = geoms.marginTop;
		
		var mapScale = "scale(" + scaleCarte + ")";
		var mapScaleOrigin = "0% 0%";
		
		mapElement.css("width", mosaiqueWidth);
		mapElement.css("height", mosaiqueHeight);
		
		mapElement.css("margin-left", carteMarginLeft + "px");
		mapElement.css("margin-top", carteMarginTop + "px");
		
		mapElement.css("-moz-transform", mapScale);
		mapElement.css("-webkit-transform", mapScale);
		mapElement.css("-o-transform", mapScale);
		mapElement.css("transform", mapScale);

		mapElement.css("-moz-transform-origin", mapScaleOrigin);
		mapElement.css("-webkit-transform-origin", mapScaleOrigin);
		mapElement.css("-o-transform-origin", mapScaleOrigin);
		mapElement.css("transform-origin", mapScaleOrigin);		
	},
	
	voteMediaItem: function(itemId, voteIc, voteRu) {

		if (isNaN(voteIc) || isNaN(voteRu)) return;

		console.log("[VIEWS] voteMediaItem > ", itemId, voteIc, voteRu);
		
		var t = this;
		
		
		// 1. Vote 
		
		var rate = t.getRate(voteIc, voteRu);
		
		console.log("vote", itemId, "ic", voteIc, "ru", voteRu, "rate", rate, "check vote = ", t.getVoteFromRate(rate));
		
		var successVote = function(jsonResult) {
			
			// On veut récupérer les données du vote créées côté serveur (id, dates)
			var voteId = jsonResult;
			
			var getDataVoteByIdSuccess = function(jsonResult) {
				
				var itemCollection = App.Collections.itemsCollection;
				var itemModel = itemCollection.findWhere( {id:itemId });
				if (itemModel)
				{
					// Nouveau vote (données récupérées par "getDataVoteById")
					var newVote = new DataVoteModel( jsonResult );
					
					// On doit ajouter ce vote à la collection des votes de cet item
					var votesCollection = itemModel.get("votes");
					
					// Position actuelle (avant le vote)
					var positions = itemModel.get("positionsMoyenneVotes");
					var previousPosition = positions[positions.length - 1];
					
					// console.log("AVANT", votesCollection.length, positions.length, "position", previousPosition.x, previousPosition.y);
					// console.log("AVANT", positions, previousPosition);
					
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
					// console.log("APRES", positions, lastPosition);
					
					// Déplacement de l'icône sur la mosaïque
					var itemIcon = itemModel.get("icon");
					if (itemIcon) 
					{
						var moveX = lastPosition.x - previousPosition.x;
						var moveY = lastPosition.y - previousPosition.y;
						
						// console.log("APRES", votesCollection.length, positions.length, "position", lastPosition.x, lastPosition.y);
						
						itemIcon.move( { x: moveX, y: moveY } );
						
						var layer =  itemIcon.parent;
						if (layer) layer.draw();
						
						// console.log("APRES", layer);
					}
				}
				else
				{
					// console.log("item non trouvé");
				}
				
			};
			
			// On récupère les votes pour mettre à jour la mosaïque
			t.getDataVoteById(voteId, getDataVoteByIdSuccess);
			
		};
		
		// On ajoute le vote à l'item
		t.addDataVoteToItem(itemId, rate, successVote);
		
		
		// 2. Commentaire 
		var commentaire = $("#newComment").val();
		if (commentaire && (commentaire.length > 0))
		{
			commentaire = trimWhiteSpace (commentaire);

			var userId = t.currentUserId ? t.currentUserId : 0;
			var commentJson = {"content":commentaire, "items_id":0, "isValid":false, "id":0, "users_id":userId, "addDate":null, "setDate":null, "__className":"Vo_Comment"};
			
			var addCommentSuccess = function(jsonResult) {
	
				var commentId = jsonResult;
				
				// console.log("commentId", commentId);
			};
			
			// Envoi du texte du commentaire
			t.addCommentToItem(itemId, commentJson, rate, addCommentSuccess);
		}
	},
	
				

	// --------------------------------------------------
	//
	// Player
	//
	// --------------------------------------------------

	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo) {

		console.log("[CONTROLER MJC] openMediaItem itemId = ", itemId); // , motCle, motCle1, motCle2, motCle3, titre, pseudo);
		
		var ecrans = $(".ecrans");
		
		var popUpWith = Math.max( 510, ecrans.width() * 0.5);
		var popUpHeight = 460;
		var popUpLeft = ecrans.width() * 0.5 - 20;
		var popUpTop = 20;
		
		var popupView = this.prepareMediaPlayer(popUpWith, popUpHeight, popUpLeft, popUpTop);

		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3, titre, pseudo);
		this.loadComments(itemId);
	},

	loadComments: function(itemId) {

		var t = this;
		
		var success = function(jsonResult) {
			
			// TODO --> collection des commentaires de l'item
			var commentCollection = new CommentCollection( jsonResult );
			
			var itemModel = App.Collections.itemsCollection.findWhere( { id: itemId });
			if (itemModel) itemModel.set("comments", commentCollection);
			
			// Mise à jour de la vue des commentaires dans le player
			if (App.Views.CommentsView) App.Views.CommentsView.close();
			App.Views.CommentsView = new Chatanoo.CommentsView(commentCollection);
		};
		
		t.fetchCommentsOfItem(itemId, success)
	},

	//
	// Vote
	//
	
	getRate: function (individuelCollectif, realisteUtopique)
	{
		var b1 = Math.floor(255 * individuelCollectif);
		var b2 = Math.floor(255 * realisteUtopique);
		var rate = Math.floor( (b1 << 8) | b2 );
		
		return rate;
	},
	
	getVoteFromRate: function (rate)
	{
		var 	ic = (rate >> 8 & 0xFF);
		var ru = (rate & 0xFF);
			
		return { ic:ic, ru:ru };
	},
	
	
	//
	// Mots-clés
	//
	
	metaStringToColor: function (motCleNo, type)
	{
		switch(type)
		{
			case 1:
				switch(motCleNo)
				{
					case 0: return "#1670f9";
					case 1: return "#5105dc";
					case 2: return "#007e91";
					case 3: return "#b8dff7";
					case 4: return "#adbff8";
					case 5: return "#2596cf";
					case 6: return "#c0b4de";
					case 7: return "#4aaece";
					case 8: return "#946cdc";
					
					default:
					return "#FF0000";
				}
			break;
			
			case 2:
				switch(motCleNo)
				{
					case 0: return "#fcff00";
					case 1: return "#5e9d5e";
					case 2: return "#7fe460";
					case 3: return "#d4ff04";
					case 4: return "#ffd62f";
					case 5: return "#dbe847";
					case 6: return "#fffdb5";
					case 7: return "#96bf07";
					case 8: return "#ffe610";
					
					default:
					return "#FF0000";
				}
			break;
			
			case 3:
				switch(motCleNo)
				{
					case 0: return "#c50137";
					case 1: return "#f04f73";
					case 2: return "#ff8700";
					case 3: return "#f62adf";
					case 4: return "#ffbed9";
					case 5: return "#ffad50";
					case 6: return "#f72b9a";
					case 7: return "#ca2bf7";
					case 8: return "#a61b00";
					
					default:
					return "#FF0000";
				}
			break;
		}
			
		return "#FF0000";
	},


	// --------------------------------------------------
	//
	// Tracé de l'évolution du vote d'un item
	//
	// --------------------------------------------------

	drawEvolutionVote: function( itemId ) {
		
		var t = this;
		if (! t.voteLayer) return; 
		
		var itemCollection = App.Collections.itemsCollection;
		var itemModel = itemCollection.findWhere( {id:itemId });
		if (itemModel)
		{
			// Position actuelle (avant le vote)
			var positions = itemModel.get("positionsMoyenneVotes");
		
			// Spline
			var points = getSplinePoints(positions, false);
			var n = points.length;
			
			var i, point, pointsArray = [];
		
			for (i=1; i<n; i++)
			{
				point = points[i];
				pointsArray.push(point.x);
				pointsArray.push(point.y);
			}

			t.line = new Kinetic.Line({
				points: pointsArray,
				stroke: 'white',
				strokeWidth: 3,
				lineCap: 'round',
				lineJoin: 'round'
			});			
			
			t.voteLayer.add(t.line);  
			t.voteLayer.draw();
		}
	},

	clearEvolutionVote: function( itemId ) {
		var t = this;
		
		if (t.voteLayer && t.line) 
		{
			t.line.remove();
			t.voteLayer.draw();
			
			t.line = null;
		}
	},




	// --------------------------------------------------
	//
	// UpLoad
	//
	// --------------------------------------------------
	
	
	changeLayoutForUpload: function() {
		
		// RQ : on utilise l'opacity pour ne pas défaire la hauteur des Divs.
		
		$(".terme.individuel > p").css( "opacity", 0 );
		$(".terme.collectif > p").css( "opacity", 0 );
		
		$(".terme.realiste > p").css( "opacity", 0 );
		$(".terme.utopique > p").css( "opacity", 0 );
		
		if ( $(".onglet.items").hasClass("active") == false )
		{
			$("#mosaique").css("border", "0px #ae0d03 solid");
			$("#mosaique").css("-moz-border-radius", "15px");
			$("#mosaique").css("-webkit-border-radius", "15px");
			$("#mosaique").css("-ms-border-radius", "15px");
			$("#mosaique").css("border-radius", "15px");
		}
	},
	
	restoreLayoutAfterUpload: function() {
		
		$(".terme.individuel > p").css( "opacity", 1 );
		$(".terme.collectif > p").css( "opacity", 1 );
		
		$(".terme.realiste > p").css( "opacity", 1 );
		$(".terme.utopique > p").css( "opacity", 1 );
		
		if ( $(".onglet.items").hasClass("active") == false )
		{
			$("#mosaique").css("border", "2px #ae0d03 solid");
			$("#mosaique").css("-moz-border-radius", "0px");
			$("#mosaique").css("-webkit-border-radius", "0px");
			$("#mosaique").css("-ms-border-radius", "0px");
			$("#mosaique").css("border-radius", "0px");
		}
	},
	
	validUploadEtape3: function() {
		
		var t = this;
		
		var coolRadio = $("#coolRadio");
		console.log("coolRadio", coolRadio);
		
		if (coolRadio.length == 1) {
			
			// Vote : valeur du vote "Cool/Pas cool"
			t.uploadVote = $('input:radio[name=sentiment]:checked').val() == "choix1" ? 1 : -1;
		
			console.log("t.uploadVote = ", t.uploadVote);	
		}
		else
		{
			var icSlider = $("#uploadSliderIc");
			var ruSlider = $("#uploadSliderRu");
			
			// console.log("validUploadEtape3", $("#uploadSliderIc").val(), $("#uploadSliderRu").val());

			var ic = parseInt(icSlider.val()) / 100;
			var ru = parseInt(ruSlider.val()) / 100;
			
			var rate = t.getRate(ic, ru);
			
			/*
			var check_ic = (rate >> 8 & 0xFF);
			var check_ru = (rate & 0xFF);
			var check2 = t.getVoteFromRate(rate);
			*/
					
			// console.log(icSlider.val(), ruSlider.val(), ic, ru, rate, "--", check_ic, check_ru, check2);
			
			// Vote : valeur du vote
			t.uploadVote = rate;
		}
		
		$("#toEtape3Button").off("click");
		$("#etape_vote").css("display", "none");		
		
		t.displayUploadKeyWordSelectionView();
	},
	
	// Upload - Sélection des mots-clés :
	
	displayUploadKeyWordSelectionView: function() {
		
		var t = this;
				
		$("#etape_keyword").css("display", "block");
		
		$("#toEtape4Button").css("display", "none");
		$("#toEtape4Button").siblings(".etape").css("display", "none");

		var metas = new MetaCollection();
		var metaModel;

		var success = function(jsonResult) {
			
			// console.log("metas jsonResult", jsonResult);
			
			if (! jsonResult) return;
			
			// console.log("metas", jsonResult.length);
			
			var i, n = jsonResult.length, jsonItem;
			var metas = new MetaCollection();
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				switch(jsonItem.name)
				{
					case "Type1KeyWord":
					metaModel = new MetaModel(jsonItem);
					metaModel.set("typeMotCle", 1);
					metas.add( metaModel );
					break;
					
					case "Type2KeyWord":
					metaModel = new MetaModel(jsonItem);
					metaModel.set("typeMotCle", 2);
					metas.add( metaModel );
					break;
					
					case "Type3KeyWord":
					metaModel = new MetaModel(jsonItem);
					metaModel.set("typeMotCle", 3);
					metas.add( metaModel );
					break;
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
		
		// Tableau associatif des mots-clés selectionnés
		var keywordSelection = [];
		 
		// Liste des mots-clés de la question :
		var keywordsParent = $("#formKeywords");
		$(".keyword", keywordsParent).off();
		keywordsParent.html("");
		
		queryKeyWordCollection.each( function (keyword)
		{
			var keywordId = keyword.get("id");
			var keywordTitle = keyword.get("content");
			
			keywordsParent.append("<div class='keyword' data-id='" + keywordId + "'>" +  keywordTitle +"</div>");
		});

		$(".keyword", keywordsParent).off().on("click", function() {
			
			var keywords = [];
			for (var prop in keywordSelection)
			{
				keywords.push( keywordSelection[prop] );
			}
			
			var keywordElement = $(this);
			var keywordId = keywordElement.data("id");
			var keyword = queryKeyWordCollection.findWhere ( { id : keywordId + "" } );
			
			// console.log(keywordId, keyword);
			
			if (keywordElement.hasClass("selected"))
			{
				keywordElement.removeClass("selected");
				keywordSelection[keywordId] = null;
				delete keywordSelection[keywordId];
				
				keywords = [];
				for (var prop in keywordSelection) {
					keywords.push( keywordSelection[prop] );
				}
			}
			else
			{
				if (keywords.length < 3)
				{
					keywordElement.addClass("selected");
					keywordSelection[keywordId] = keyword;
					keywords.push(keyword);
				}
				else
				{
					// Il  y a déjà trois mots-clés, on n'autorise pas le nouveau mot-clé
					return;
				}
			}
			
			if (keywords.length > 0)
			{
				// On fait apparaître le bouton suite
				t.displayButtonToValidateUploadKeyWord(keywords);
			}
			else
			{
				$("#toEtape4Button").siblings(".etape").css("display", "none");
				$("#toEtape4Button").css("display", "none");
			}
		});
	
	},	
	
	displayButtonToValidateUploadKeyWord: function( keywords ) {
		
		var t = this;

		// Trim white space
		// keywordTitle = keywordTitle.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		// console.log("displayButtonToValidateUploadKeyWord", keyWordId);
		
		
		$("#toEtape4Button").siblings(".etape").css("display", "inline");
		$("#toEtape4Button").css("display", "inline");
		$("#toEtape4Button").off("click").on("click", function(){ t.validUploadEtape4( keywords); } );
	},

	validUploadEtape4: function( keywords ) {
		
		var t = this;	
		
		t.uploadKeyWords = keywords; 
		
		// console.log("validUploadEtape4", keywords);
		
		$("#toEtape4Button").off("click");
		$("#etape_keyword").css("display", "none");		
		
		t.displayUploadMapView();
	},

	
	// Upload - Envoi :
			
	envoiMotCleUpload: function() {

		var t = this;
		
		//
		// 4. Ajout du premier mot-clé à l'item
		//
		
		var successAddKeyWordToItem = function(jsonResult) {
		
			// console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			if (t.uploadKeyWords.length == 0)
			{
				// S'il n'y a plus de mot-clé à envoyer, on passe à la Carto :
				t.envoiCartoUpload();
			}
			else
			{
				// On passe au mot-clé suivant
				t.envoiMotCleUpload();
			}
		}
	
		// Envoi du mot-clé
		var keywordModel = t.uploadKeyWords.shift();
		var keywordId = keywordModel.get("id");
		var keywordContent = keywordModel.get("content");
		
		t.addMetaIntoVo(t.uploadItemId, keywordId, keywordContent, successAddKeyWordToItem);
	},

});
