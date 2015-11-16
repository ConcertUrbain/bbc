
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
		"mouseout a": "rollOutItem",
	},

    rollOverItem: function (e)
	{
		var el = $(e.currentTarget);
		
		var position = el.offset();
		var itemId = this.model.get("id");
		var titre = this.model.get("title");
		
		var v = App.eventManager;
		if (v) v.trigger("itemRollOver", itemId, titre, position);
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
		
		console.log("ok", el, parentEl.data("id"), itemId);
		
		var v = App.eventManager;
		if (v) v.trigger("itemSelection", itemId, motCle);
	},
});


//
// Vues MJC : 2 - Users
//

Chatanoo.UsersView = Chatanoo.MosaiqueItemsView.extend({
	
	el: "#users",
	
	renderItem: function (item, no)
	{
		// On n'affiche pas les users sans noms
		if ( (item.get("firstName") + item.get("lastName")).length > 0)
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
		
		var userName = $(".userName", el);
		var userItems = $(".userItemsParent", el);
		
		var w = userName.width();
		var h = userName.height();
		
		var items = this.model.get("items");
		var n = items.length;
		
		var indexItem = 0;
		var t = this;
		
		_.each(items, function(item) {

			var rx = 1.25 * w / 2;
			var ry = 1.4 * h / 2;
			var angle = Math.PI + 2 * Math.PI * indexItem/n;
					
			var left = Math.floor(rx + rx * Math.cos(angle)) - 18;
			var top  = Math.floor(ry + 2 * ry * Math.sin(angle)) - 40;

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
	
	render: function () {
		
		this.removeSubviews();
		
		// 1. Background de la carte
		var bgImageModel = new Backbone.Model( { id:0, url: "medias/cartes/CARTE_DRING13.jpg" } );
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
	},
	
});





//
// Contrôleur MJC
//

var MJCAppView = AppView.extend({

	initialize: function () {
		
		this.serviceURL = "http://ws.chatanoo.org/services";
		this.mediaCenterURL = "http://mc.chatanoo.org/m/";
		this.adminParams = ["mazerte","desperados","BBC_qJlCaSsBbYBYypwF9TT8KmCOxhuZ"];
		

		// Carte
		this.largeurCarte = 2416;
		this.longueurCarte = 1110;
		this.latitudeTop = 48.834982;
		this.latitudeBottom = 48.811347;
		this.longitudeGauche = 2.304247;
		this.longitudeDroite = 2.377739;
		
		// Pour mémoire :
		this.latitudeGMaps = 48.82129;
		this.longitudeGMaps = 2.366234;
		this.zoomGMaps = 17;
		
		var t = this;
		
		
		//
		// Vues et fonctionnement des onglets
		//
		
		var selectVue = function(motscles, items, carte, users)
		{
			$(".onglet").removeClass("active");
			
			$("#motcles").css("display", motscles ? "block" : "none");
			$("#items").css("display", items ? "block" : "none");
			$("#carte").css("display", carte ? "block" : "none");
			$("#users").css("display", users ? "block" : "none");
		
			if (t.backgroundImage) $("#mosaique").css("background-image", items ? t.backgroundImage : "none");
			
			if (items)
			{
				$("#mosaique").css("border", "none");
				$("#mosaique").css("-moz-border-radius", "15px");
				$("#mosaique").css("-webkit-border-radius", "15px");
				$("#mosaique").css("-ms-border-radius", "15px");
				$("#mosaique").css("border-radius", "15px");
			}
			else
			{
				$("#mosaique").css("border", "2px #ae0d03 solid");
				$("#mosaique").css("-moz-border-radius", "0px");
				$("#mosaique").css("-webkit-border-radius", "0px");
				$("#mosaique").css("-ms-border-radius", "0px");
				$("#mosaique").css("border-radius", "0px");
			}

		}
		
		// --> Onglet par défaut
		selectVue(0, 1, 0, 0);
		$(".onglet.items").addClass("active");
		
		$(".onglet.motcles").on("click", function() {
			selectVue(1, 0, 0, 0);
			$(this).addClass("active");
		});
		
		$(".onglet.items").on("click", function() {
			selectVue(0, 1, 0, 0);
			$(this).addClass("active");
		});
		
		$(".onglet.carte").on("click", function() {
			selectVue(0, 0, 1, 0);
			$(this).addClass("active");
		});
		
		$(".onglet.users").on("click", function() {
			selectVue(0, 0, 0, 1);
			$(this).addClass("active");
		});

		// Envoi
		$("#envoyer").on("click", function() { t.openUploadView() });
		
		//
		$(".global .footer").css("display", "none");
	},
	

	// --------------------------------------------------
	//
	// Mosaïque
	//
	// --------------------------------------------------

	//
	// Webs Services
	//
		
	loadDatasOfQuery: function(queryId) {
		
		var t = this;
		
		// On masque l'accueil et on affiche la mosaique
		t.accueilElement.css("display", "none");
		t.mosaiqueElement.css("display", "block");
		
		// Chargement de l'image de fond de la mosaique...
		var queryMediasModel = App.Collections.queriesMedias.getModelById(queryId);
		var images = queryMediasModel.get("images");
		var subfolder = queryMediasModel.get("subfolder");
		var randomImages = _.shuffle(images);
		var randomImage = _(randomImages[0]).strip();
		var randomImagePath = "medias/images/" + (subfolder ? subfolder : "") + randomImage;
		
		t.backgroundImage = "url('" + randomImagePath + "')";
		t.mosaiqueElement.css("background-image", t.backgroundImage);
		

		// ... puis des données de la query (carto)
		t.fetchDatasOfQuery(queryId);
		
		//
		$(".global .terme").css("opacity", 1);
		$(".global .footer").css("display", "block");
	},
		
	fetchMetasOfQuery: function(queryId) {
		
		var t = this;
		
		var jsonInput = {
			"id" : t.generateID(),
			"method" : "getMetasByVo",
			"params" : [queryId,"Query"]
		};
		
		var success = function(jsonResult) {
			
			// console.log("metas", jsonResult.length);
			
			//
			var i, n = jsonResult.length, jsonItem;
			
			// 
			App.Collections.Type1KeyWord = new MetaCollection();
			App.Collections.Type2KeyWord = new MetaCollection();
			App.Collections.Type3KeyWord = new MetaCollection();
			
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
				}
			}
	
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


	buildView: function() {
		
		var itemsCollection = App.Collections.itemsCollection;
		
		console.log("buildView", itemsCollection.length)
		
		
		//
		// Création de la liste des projets (Items) sur la mosaïque
		//
	
		
		//
		// 1. Construction de l'écran des indices
		//
		
		var CanvasManager = function()
		{
			var t = this;
			
			var mosaique = $("#mosaique");
			var mosaiqueWidth  = mosaique.width();
			var mosaiqueHeight = mosaique.height();
			
			t.stage = new Kinetic.Stage({
				container: 'items',
				width : mosaiqueWidth,
				height: mosaiqueHeight
			});
			
			t.layer = new Kinetic.Layer();
			t.stage.add(t.layer);
			
			var scale = 0.20;
				
			itemsCollection.each(function(item)
			{
				var itemId = item.get("id");
				var motCle1 = item.get("motCle1");
				var motCle2 = item.get("motCle2");
				var motCle3 = item.get("motCle3");
				
				item.computeRateFromVotes(mosaiqueWidth, mosaiqueHeight);
				
				var positions = item.get("positionsMoyenneVotes");
				var lastPosition = positions[positions.length - 1];
				
				// Création du motif de l'item
				var icon = createIcon(t.layer, lastPosition.x, lastPosition.y, scale, itemId, motCle1, motCle2, motCle3)
				
				item.set("icon", icon);
			});
		
			t.layer.draw();
		}

		var canvas = new CanvasManager();
		
		
		//
		// 2. Autres vues
		//

		var mosaique = $("#items");
		var mosaiqueWidth  = mosaique.width();
		var mosaiqueHeight = mosaique.height();


		var longGauche = this.longitudeGauche;
		var latTop = this.latitudeTop;
		
		var largCarte = this.largeurCarte;
		var hautCarte = this.longueurCarte;
		
		var latitudeTopBottom = this.latitudeBottom - latTop;
		var longitudeGaucheDroite = this.longitudeDroite - longGauche;

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

		
		var listeKeywords = [];
		var listeItemsForKeyword = []; // tableau associatif
		var listeUsers = [];
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
				listeUsers.push(user);
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
		App.Views.MapItemsView = new Chatanoo.MapItemsView(itemsCollection);
		
		var mapElement = $(App.Views.MapItemsView.$el);
		
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
		
		console.log(itemId, voteIc, voteRu);
		
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
					console.log("item non trouvé");
				}
			};
			
			t.getDataVoteById(voteId, getDataVoteByIdSuccess);
			
		}
		
		t.addDataVoteToItem(itemId, rate, success);
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
	// UpLoad
	//
	// --------------------------------------------------
	
	openUploadView: function() {
	
		var t = this;
		
		var popUpElement = $(".uploadParent");
		popUpElement.css("display", "block");
		
		var popUp = new Chatanoo.UploadView( { el : popUpElement } );
		popUp.urlCarte = "medias/cartes/CARTE_DRING13.jpg";
		popUp.render();
	
		t.initLoginForm();
	},
	
	// Upload - Sélection des mots-clés :
	
	displayUploadKeyWordSelectionView: function() {
		
		$("#etape_keyword").css("display", "block");
		$("#toEtape4Button").css("display", "none");
		
		var success = function(jsonResult) {
			
			if (! jsonResult) return;
			
			console.log("metas", jsonResult.length);
			
			var i, n = jsonResult.length, jsonItem;
			
			var metas = new MetaCollection();
			var metaModel;
			
			for(i=0; i<n; i++)
			{
				jsonItem = jsonResult[i];
				metaModel = new MetaModel(jsonItem);
				
				switch(jsonItem.name)
				{
					case "Type1KeyWord":
					metaModel.set("typeMotCle", 1);
					metas.add( metaModel );
					
					case "Type2KeyWord":
					metaModel.set("typeMotCle", 2);
					metas.add( metaModel );
					
					case "Type3KeyWord":
					metaModel.set("typeMotCle", 3);
					metas.add( metaModel );
				}
			}
			
			console.log("fetchMetasOfQuery", metas.length);
			
			t.initUploadKeywordSelect(metas);
		}
	
		console.log("fetchMetasOfQuery queryId = ", t.uploadQueryId);
	
		t.fetchMetasOfQuery(t.uploadQueryId, success);
	},
	
	initUploadKeywordSelect: function( queryKeyWordCollection ) {

		var t = this;
		
		// Tableau associatif des mots-clés selectionnés
		var keywordSelection = [];
		
		// Liste des mots-clés de la question :
		var keywordsParent = $("#formKeywords");
		
		queryKeyWordCollection.each( function (keyword)
		{
			var keywordId = keyword.get("id");
			var keywordTitle = keyword.get("content");
			
			keywordsParent.append("<div class='keyword' data-id=' " + keywordId + "'>" +  keywordTitle +" </div>");
			
			var keywordElement = $(".keyword", keywordsParent).data( "id", keywordId );
			keywordElement.on("click", function() {
				
				var keywordElement = $(this);
				if (keywordElement.hasClass("selected"))
				{
					keywordElement.removeClass("selected");
					keywordSelection[keywordId] = null;
					delete keywordSelection[keywordId];
				}
				else
				{
					keywordElement.addClass("selected");
					keywordSelection[keywordId] = keyword;
				}
				
				console.log(keyword);
				
				var keywords = [];
				for (var prop in keywordSelection)
				{
					keywords.push( keywordSelection[prop] );
				}
				
				console.log(keyword, keywords);
				
				if (keywords.length > 0)
				{
					// On fait apparaître le bouton suite
					t.displayButtonToValidateUploadKeyWord(keywords);
				}
				else
				{
					$("#toEtape4Button").css("display", "none");
				}
			});
		});
		
	},	
	
	displayButtonToValidateUploadKeyWord: function( keywords ) {
		
		var t = this;

		// Trim white space
		// keywordTitle = keywordTitle.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		// console.log("displayButtonToValidateUploadKeyWord", keyWordId);
		
		$("#toEtape4Button").css("display", "block");
		$("#toEtape4Button").on("click", function(){ t.validUploadEtape4( keywords); } );
	},

	validUploadEtape4: function( keywords ) {
		
		var t = this;	
		
		/*
		t.uploadKeyWordId = keyWordId; 
		t.uploadKeyWordContent = keywordTitle;
		*/
		
		console.log("validUploadEtape4", keywords);
		
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
		
			console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			
			// S'il n'y a qu'un seul mot-clé, on passe à la Carto :
			t.envoiCartoUpload()
		}
	
		// Envoi du mot-clé
		t.addMetaIntoVo(t.uploadItemId, t.uploadKeyWord1Id, t.uploadKeyWord1Content, successAddKeyWordToItem);
	},	

	envoiMotCleUpload: function() {

		var t = this;
		
		//
		// 4. Ajout du premier mot-clé à l'item
		//
		
		var successAddKeyWordToItem = function(jsonResult) {
		
			console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.envoiCartoUpload()
		}
	
		// Envoi du mot-clé
		t.addMetaIntoVo(t.uploadItemId, t.uploadKeyWordId, t.uploadKeyWordContent, successAddKeyWordToItem);
	},	

	envoiMotCleUpload: function() {

		var t = this;
		
		//
		// 4. Ajout du premier mot-clé à l'item
		//
		
		var successAddKeyWordToItem = function(jsonResult) {
		
			console.log("successAddKeyWordToItem jsonResult = ", jsonResult); 
			
			if (! jsonResult) return;
			
			t.envoiCartoUpload()
		}
	
		// Envoi du mot-clé
		t.addMetaIntoVo(t.uploadItemId, t.uploadKeyWordId, t.uploadKeyWordContent, successAddKeyWordToItem);
	},	

});
