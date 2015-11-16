
//
// Vues Dring13 : 1 - Items
//

Chatanoo.CoolPasCoolView = Chatanoo.MosaiqueItemsView.extend({
	
	renderItem: function (item, no)
	{
		var itemView = new Chatanoo.CoolPasCoolItemView({
			model: item
		});
		
		// cf CollectionView
		this.addSubview(itemView);
		
		this.$el.append( itemView.render().el );	
	}
	
});

Chatanoo.CoolPasCoolItemView = Backbone.View.extend({
	
	initialize: function (param) {
		this.template = _.template($("#dringTemplate").html())
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
		
		// console.log("ok", el, parentEl.data("id"), itemId);
		
		var v = App.eventManager;
		if (v) v.trigger("itemSelection", itemId, motCle);
	},
});



//
// Vues Dring13 : 2 - Users
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
		this.template = _.template($("#dringUserTemplate").html())
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
// Vues Dring13 : 3 - Mots-clés
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
		this.template = _.template($("#dringMotCleTemplate").html())
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
// Vues Dring13 : 4 - Cartes
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
		this.template = _.template($("#dringMapTemplate").html())
	},
	
});

Chatanoo.CoolPasCoolPopUpView = Chatanoo.PopUpView.extend({
	
	choix1: "Cool",
	choix2: "Pas Cool",
	
    events: {
		"click .popupClose": "closePopUp",
		"click .voteButton.cool": "voteCool",
		"click .voteButton.pasCool": "votePasCool",
	},	
	
	voteCool: function(e) {
		this.sendVote(1);
	},
	
	votePasCool: function(e) {
		this.sendVote(-1);
	},
	
 	sendVote: function(voteValue) {
		var t = this;
		
		var itemId = t.model.get("itemId");
		
		var v = App.eventManager;
		if (v) v.trigger("voteMedia", itemId, voteValue);
	},
	
 	closePopUp: function(e) {
		
		var t = this;
		
		$(t.el).undelegate('.popupClose', 'click');
		$(t.el).undelegate('.voteButton.cool', 'click');
		$(t.el).undelegate('.voteButton.pasCool', 'click');
		
		t.$el.css("display", "none");
		t.$el.css("width", "");
		t.$el.css("height", "");
		if (t.subview && t.subview.close) subview.close();
		t.close()
	},
	
 	render: function( options ) {
		
		var t = this;
		
		if (options && options.width) t.$el.css("width", options.width);
		if (options && options.height) t.$el.css("height", options.height);
		
		t.$el.css("display", "block");
		t.$el.html(t.template( { choix1: this.choix1, choix2: this.choix2 } ));
		
		return this;
    }
});


	
//
// Contrôleur Dring13
//

var Dring13AppView = AppView.extend({

	initialize: function () {
		
		var t = this;
		
		this.serviceURL = "http://ws.dring93.org/services";
		this.uploadURL = "http://ms.dring93.org/upload";
		this.mediaCenterURL = "http://ms.dring93.org/m/";
		this.mapURL = "medias/cartes/CARTE_DRING13.jpg";
		this.keyApi = "qJlCaSsBbYBYypwF9TT8KmCOxhuZ3wIj";
		this.adminParams = ["mazerte", "desperados", this.keyApi];
		
		
		//
		// Cool / Pas cool
		//
		
		this.choix1 = "Cool";
		this.choix2 = "Pas Cool";
		
		$(".onglet.items").html( this.choix1 + " " + this.choix2 );
		

		// Envoi
		$("#envoyer").on("click", function() { t.openUploadView() });
			
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
		
	
		//
		// Vues et fonctionnement des onglets
		//
		
		var selectVue = function(motscles, items, carte, users)
		{
			$("#motcles").css("display", motscles ? "block" : "none");
			$("#items").css("display", items ? "block" : "none");
			$("#carte").css("display", carte ? "block" : "none");
			$("#users").css("display", users ? "block" : "none");
		}
		
		// Onglet par défaut
		selectVue(1, 0, 0, 0);
		
		$(".onglet.motcles").on("click", function() {
			selectVue(1, 0, 0, 0);
			$(".onglets").attr("class", "onglets motcles");
		});
		
		$(".onglet.items").on("click", function() {
			selectVue(0, 1, 0, 0);
			$(".onglets").attr("class", "onglets items");
		});
		
		$(".onglet.carte").on("click", function() {
			selectVue(0, 0, 1, 0);
			$(".onglets").attr("class", "onglets carte");
		});
		
		$(".onglet.users").on("click", function() {
			selectVue(0, 0, 0, 1);
			$(".onglets").attr("class", "onglets users");
		});
	},
	

	// --------------------------------------------------
	//
	// Mosaïques
	//
	// --------------------------------------------------

	buildView: function() {
	
		var itemsCollection = App.Collections.itemsCollection;
		
		// console.log("buildView", itemsCollection.length)
		
		if (itemsCollection.length == 0) return;


		var mosaique = $(".mosaique");
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
		
		// console.log(mosaiqueWidth, mosaiqueHeight);
		
	
		//
		// Calculs des positions des items sur les mosaïques
		//
		
		// 1. On doit trouver :
		// - les minimums et maximum des votes (axe des y)
		// - les minimums et maximum des dates (axe des x)
		
		var listeDates = [];
		var listeResultats = [];
		var listeKeywords = [];
		var listeItemsForKeyword = []; // tableau associatif
		var listeUsers = [];
		var listeUserIds = [];
		var date, user, userId;


		
		itemsCollection.each(function(item)
		{
			//
			// Date et Vote : 
			//
			
			date = item.get("setDate");
			if (date == null)
			{
				// Fausse date d'après l'id de l'item
				date = getDefaultDate(item);
			}
			
			item.set("date", date)
				
			listeDates.push(date)
			listeResultats.push(item.get("rate"));
			
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
			user.get("items").push(item);
			user.get("items").push(item);
			user.get("items").push(item);
			
			//
			// Mots-clés
			//
			
			var metaCollection = item.get("metas");
			var metaContent;
			
			metaCollection.each(function(meta)
			{
				if (meta.get("name") == "KeyWord")
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
			//
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

		
		// On trie les 2 listes 	
		listeDates.sort();		
		listeResultats.sort( function sortNumber(a,b) { return a - b });

		var n = listeDates.length;
		var dateMin = listeDates[0];
		var dateMax = listeDates[n - 1];

		// console.log(dateMin, dateMax);

		var timeMin = iso8601ToDate(dateMin).getTime();
		var timeMax = iso8601ToDate(dateMax).getTime();
		
		var voteMin = parseInt(listeResultats[0]);
		var voteMax = parseInt(listeResultats[n - 1]);
		
		// console.log(timeMin, timeMax);
		// console.log(voteMin, voteMax);

		
		// 2. On peut déterminer la position théorique des points sur la Mosaïque Cool/Pas Cool:
		
		var percentX, percentY, percentAbs;
		var date, vote;

		var marginLeft = 60;
		var marginTop = 60;
		
		var w = mosaiqueWidth  - 2 * marginLeft;
		var h = mosaiqueHeight - 2 * marginTop;
		var dh = h/2;
		
		var n = listeDates.length;
		var left;
		var top;
	
	
	
		// Calcul de la position du la mosaïque Cool/Pas Cool
		
		itemsCollection.each(function(item)
		{
			var date = item.get("date");
			var positionDate = listeDates.indexOf(date);
			var percentX = positionDate / n;
			var left = marginLeft + w * (1 - percentX);
			
			item.set("left", left);
			
			var vote = item.get("rate");
			if (vote >= 0)
			{
				if (voteMax == 0)
				{
					// Evite la division par zéro
					percentY = 0;
				}	
				else
				{
					percentY = vote / voteMax;
				}
				
				top = dh * (1 - percentY) + marginTop;
			}
			else
			{
				if (voteMin == 0)
				{
					// Evite la division par zéro
					percentY = 0;
				}	
				else
				{
					percentY = vote / voteMin;
				}
				
				top = dh + dh * Math.min(1, percentY) + marginTop;
			}
			
			item.set("top", top);
		});
	
	
		// 1) Construction de l'écran des cool/pas cool
		
		if (App.Views.ItemsView) App.Views.ItemsView.close();
		App.Views.ItemsView = new Chatanoo.CoolPasCoolView(itemsCollection);


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

	// --------------------------------------------------
	//
	// Player
	//
	// --------------------------------------------------
	
	openMediaItem: function(itemId, motCle, motCle1, motCle2, motCle3) {
		var popupView = this.prepareMediaPlayer(280, 200);
		this.openMediaItemInPlayer(popupView, itemId, motCle, motCle1, motCle2, motCle3);
		this.loadComments(itemId);
	},
	
	prepareMediaPlayer: function( playerWidth, playerHeight ) {
			
		var t = this;
		
		// TODO On affiche la popUp avec un Gif de chargement
		
		var popUpElement = $("#popup");
		popUpElement.css("display", "block");
		
		var popUp = new Chatanoo.CoolPasCoolPopUpView( { el : popUpElement } );
		popUp.choix1 = this.choix1;
		popUp.choix2 = this.choix2;
		popUp.render()
		
		var mediaWidth = Math.floor(playerWidth * 0.9);
		var mediaHeight = Math.floor(playerHeight * 0.9) - 80;
		
		var popUpContentMedia = $(".popupMedia", popUpElement);
		popUpContentMedia.css("width", mediaWidth + "px");
		popUpContentMedia.css("height", mediaHeight + "px");
		popUpContentMedia.css("margin-left", (playerWidth * 0.05) + "px");
		popUpContentMedia.css("margin-top", (playerHeight * 0.05) + "px");
		
		// var popUpSliders = $(".popupSliders", popUpElement);
		// popUpSliders.css("top", (mediaHeight + 50) + "px");

		return popUp;
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
			
			// Chargement de la données du vote pour chaque commentaire
			commentCollection.each ( function( commentModel)
			{
				var commentId = commentModel.get("id");
				
				var rateCommentSuccess = function(jsonResult) {
					
					var votes = jsonResult.Vote;
					if (votes && votes.length > 0)
					{
						var vote = votes[0];
						var voteId = vote.id;
						var rate = vote.rate;
						
						commentModel.set("rate", rate);
						
						// console.log( "rateCommentSuccess", itemId, commentId, voteId, rate );
					}
				}
			
				t.fetchDataOfCommentOfItem(commentId , itemId, rateCommentSuccess);
			});
		}
		
		t.fetchCommentsOfItem(itemId, success)
	},
	
	
	// --------------------------------------------------
	//
	// Vote
	//
	// --------------------------------------------------

	voteMediaItem: function(itemId, vote) {
		
		var t = this;
		var commentaire = $("#newComment").val();
		
		// TODO Bloquer les boutons de vote et le champ textarea
		
		// TODO : ajouter la référence à l'user si il est connecté
		var commentJson = {"content":commentaire, "items_id":0, "isValid":false, "id":0, "users_id":0, "addDate":null, "setDate":null, "__className":"Vo_Comment"};

		var addCommentSuccess = function(jsonResult) {

			var commentId = jsonResult;
			
			// TODO : ajouter la référence à l'user si il est connecté
			var voteJson = {"__className":"Vo_Data_Vote", "rate":vote, "id":0, "users_id":0, "addDate":null, "setDate":null};
		
			var addVoteToCommentSuccess = function(jsonResult) {
				
				var voteId = jsonResult;
			
				var getRateOfToItemSuccess = function(jsonResult) {
					
					var rateOfItem = parseInt(jsonResult);
					
					// Mise à jour de l'item
					var itemModel = App.Collections.itemsCollection.findWhere( { id: itemId });
					if (itemModel) itemModel.set("rate", rateOfItem);
				
					// Rechargement des commentaires de l'item en cours
					t.loadComments(itemId);
					
					// TODO : mettre à jour la mosaïque Cool/Pas Cool
					console.log("mise à jour mosaïque .... ");
		
					// TODO Débloquer les boutons de vote et le champ textarea (le vider)
				};
				
				// Récupération du "rate de l'item
				t.getRateOfToItem(itemId, getRateOfToItemSuccess);		
			};
	
			// Envoi du vote associé au commentaire
			t.addVoteToComment(voteJson, commentId, vote, itemId, addVoteToCommentSuccess);
		};
		
		// Envoi du texte du commentaire
		t.addCommentToItem(itemId, commentJson, vote, addCommentSuccess);
	},

});


