//-------------------------------------  ROUTER  -----------------------------//

var AppRouter = Backbone.Router.extend({

	routes: {
		"": "accueil",
		"question/:queryid/:vueid": "question",
		"question/:queryid/:vueid/media/:mediaid": "media"
	},

	addToHistory: function (hash) {
		this.navigate(hash);
	},

	ifNoSessionsGoAccueilAccueil: function () {
		if (! App.Collections) {
			App.Views.appView.selectVue(1, 0, 0, 0, 0, false);
			this.addToHistory("");
			return false;
		}
		return true;
	},

	accueil: function () {
		App.Views.appView.selectVue(1, 0, 0, 0, 0, false);
	},

	question: function (questionid, vueid) {
		if (this.ifNoSessionsGoAccueilAccueil()) {
			
			switch(vueid) {
				case "motscles":
				App.Views.appView.selectVue(0, 1, 0, 0, 0, false);
				break;
				
				case "mosaique":
				App.Views.appView.selectVue(0, 0, 1, 0, 0, false);
				break;
				
				case "carte":
				App.Views.appView.selectVue(0, 0, 0, 1, 0, false);
				break;
				
				case "participants":
				App.Views.appView.selectVue(0, 0, 0, 0, 1, false);
				break;
			}
		}
	},

	media: function (questionid, mediaid) {
		// TODO
	}

});
