
<!doctype html>
<html>
<head>
	<meta charset='UTF-8'>
	<title></title>
    
	<link rel='stylesheet' href='front/bbc/styles/bbc.css' type='text/css' />
   	<link rel='stylesheet' href='front/core/mediaelement/mediaelementplayer.min.css' type='text/css' />    
	
    <style>
        .global .centre .ecrans .accueil {
            background-size: cover;
        }

        .global .navigationFooter .envoyer {
            background-image:url();
            background-repeat:no-repeat;
            background-size:20px 20px;
            padding-left:22px;
            padding-top: 0px;
            height:25px;
        }
    </style>

    
	<script src="front/core/js/libs/jquery-2.1.1.min.js"></script>
	<script src="front/core/js/libs/jquery.actual.min.js"></script>    
	<script src="front/core/js/libs/modernizr.custom.88646.js"></script>    
    <script src="front/core/js/libs/underscore-min.js"></script>
    <script src="front/core/js/libs/underscore.strings.js"></script>
    <script src="front/core/js/libs/backbone-min.js"></script>
    <script src="front/core/js/libs/json2_min.js"></script>
    <script src="front/core/js/libs/kinetic-v5.1.0.min.js"></script>
    <script src="front/core/js/libs/mediaelement-and-player.min.js"></script>
    <script src="front/core/js/libs/spin.min.js"></script>
    <script src="front/core/js/libs/greensock/TweenMax.min.js"></script>
    <script src="front/core/js/libs/greensock/utils/Draggable.min.js"></script>
    <script src="front/core/js/libs/greensock/TimelineLite.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1.36/aws-sdk.js"></script>
    
</head>
<body>
	
    <?php include "front/bbc/templates_bbc.php"  ?>

	<!--  -->
	<!-- HTML -->
	<!--  -->

	<div class="global">
    
        <div class="header">Le bonheur brut collectif</div>
        
        <div class="container">
                <div class="centre">
                    <div class="ecrans">
                        <div class="uploadParent"></div>
                        <div class="animationAttente" id="attente"></div>                    
                    </div>
                </div>
                <div class="clear"></div>
            </div>
        </div>
        
        <div class="footer">
        </div>
        
        <div class="popup" id="popup"></div>                  
                        
    </div>
    
	<script src="front/core/js/utils.js"></script>
	<script src="front/core/js/draw_mjc.js"></script>
	<script src="front/core/js/models_backbone.js"></script>
	<script src="front/core/js/views_backbone.js"></script>
	<script src="front/core/js/views_controler_aws.js"></script>
	<script src="front/core/js/views_mjc.js"></script>
	<script src="front/core/js/router_backbone.js"></script>

    <script>

    $(function()
        {
            /* BACKBONE */

            window.App = {};

            App.eventManager = _.extend({}, Backbone.Events);

            App.Models = {};
            App.Collections = {};
            App.Collections.queriesMedias = new QueriesMediasCollection();
            App.Views  = {};
            App.Router = new AppRouter();

            App.Views.appView = new MJCAppView(); //AppView();
            App.Views.appView.serviceURL = "http://ws.chatanoo.org";
            App.Views.appView.mediaCenterURL = "http://mc.chatanoo.org/m/";
            App.Views.appView.titreAccueil = "";
            App.Views.appView.queriesPrefix = "";

			// 
			<?php
				if (isset($_GET["query"]) === TRUE) {
					$queryId = addslashes($_GET["query"]);
					echo('App.Views.appView.currentQuery = "'. $queryId .'";');
				}
			?>

            // Key API
            App.Views.appView.proxy = "front/core/proxy/ba-simple-proxy.php?url=";
            App.Views.appView.initAdminParams(
                "mazerte",
                "desperados",
                "BBC_qJlCaSsBbYBYypwF9TT8KmCOxhuZ"
            );

            // Carte
			/*
            App.Views.appView.mapURL = "...";
            App.Views.appView.largeurCarte = 1804;
            App.Views.appView.longueurCarte = 1210;
            App.Views.appView.latitudeTop = 48.850582;
            App.Views.appView.latitudeBottom = 48.823747;
            App.Views.appView.longitudeGauche = 2.452784;
            App.Views.appView.longitudeDroite = 2.513038;
			*/
			
			var cartesFolder = "../cartes/";
			
			App.Views.appView.cartes = [
				{ 	id: 70,
					mapURL: cartesFolder + "BBC_CARTE_SAINTDENIS.png",
					largeurCarte: 1000,
					longueurCarte: 731,
					latitudeTop: 48.951081,
					longitudeGauche: 2.334334,
					latitudeBottom: 48.924244,
					longitudeDroite: 2.395274	
				},
				{ 	id: 83,
					mapURL: cartesFolder + "BBC_CARTE_MEMEPASMAL.png",
					largeurCarte: 1000,
					longueurCarte: 745,
					latitudeTop: 48.863298,
					longitudeGauche: 2.367034,
					latitudeBottom: 48.857722,
					longitudeDroite: 2.378879	
				},
				{ 	id: 86,
					mapURL: cartesFolder + "BBC_CARTE_parolespartagees.png",
					largeurCarte: 1000,
					longueurCarte: 679,
					latitudeTop: 48.826913,
					longitudeGauche: 2.364946,
					latitudeBottom: 48.820881,
					longitudeDroite: 2.379355	
				},
				{ 	id: 89,
					mapURL: cartesFolder + "BBC_CARTE_6B.png",
					largeurCarte: 1000,
					longueurCarte: 738,
					latitudeTop: 48.947332,
					longitudeGauche: 2.328755,
					latitudeBottom: 48.931856,
					longitudeDroite: 2.370275	
				},
				{ 	id: 90,
					mapURL: cartesFolder + "BBC_CARTE_6B.png",
					largeurCarte: 1000,
					longueurCarte: 738,
					latitudeTop: 48.947332,
					longitudeGauche: 2.328755,
					latitudeBottom: 48.931856,
					longitudeDroite: 2.370275	
				}
			];

            App.Views.appView.connectToWebServicesForUpload();
        })


    </script>

</body>
</html>
