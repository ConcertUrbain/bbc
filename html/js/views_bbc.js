	
//
// Contrôleur BBC
//

var BBCAppView = AppView.extend({

	initialize: function () {
		this.serviceURL = "http://ws.chatanoo.org/services";
		this.mediaCenterURL = "http://mc.chatanoo.org/m/";
		this.adminParams = ["mazerte","desperados","BBC_qJlCaSsBbYBYypwF9TT8KmCOxhuZ"];
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
		var randomImagePath = "../images/" + (subfolder ? subfolder : "") + randomImage;
		t.mosaiqueElement.css("background-image", "url('" + randomImagePath + "')");

		// ... puis des données de la query (carto)
		t.fetchDatasOfQuery(queryId);
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
		
		// App.Views.MosaiqueItemsView = Chatanoo.MosaiqueItemsView(itemsCollection);
	
		
		//
		// Construction de l'écran des indices
		//
		
		var CanvasManager = function()
		{
			var t = this;
			
			var mosaique = $("#mosaique");
			var mosaiqueWidth  = mosaique.width();
			var mosaiqueHeight = mosaique.height();
			
			t.stage = new Kinetic.Stage({
				container: 'motifsItems',
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
	}	

});
