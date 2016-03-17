
<!--  -->
<!-- TEMPLATES -->
<!--  -->

<script id="queryTemplate" type="text/template">
    <div class="queryTitre couleur_base"><a href="#"><%= content %></a></div>
    <div class="queryDescription"><a href="#"><%= description %></a></div>
</script>

<script id="itemTemplate" type="text/template">
    <div class="itemTitre item<%= id %>"  data-id="<%= id %>" style="position:absolute;left:<%= left %>px;top:<%= top %>px">
        <a href="#"><img src='http://cdn.aws.chatanoo.org/mjc/nogent/divers/cercleRouge.png' alt='<%= title %>' /></a>
    </div>
</script>

<script id="itemUserTemplate" type="text/template">
    <div class="user">
        <div class="userParent">
            <div class="userName user<%= id %>"  data-id="<%= id %>" >
                <a href="#"><%= pseudo %></a>
            </div>
            <div class="userItemsParent">
            </div>
        </div>
    </div>
</script>

<script id="itemMotCleTemplate" type="text/template">
    <div class="motCle">
        <div class="motCleParent">
            <div class="motCleTitle motCle<%= id %>" data-id="<%= id %>" >
                <a href="#"><%= content %></a>
            </div>
            <div class="motCleItemsParent">
            </div>
        </div>
    </div>
</script>

<script id="itemMapTemplate" type="text/template">
    <div class="itemTitre item<%= id %>"  data-id="<%= id %>" style="position:absolute;left:<%= mapLeft %>px;top:<%= mapTop %>px">
        <a href="#"><img src='http://cdn.aws.chatanoo.org/mjc/nogent/divers/cercleRouge.png' alt='<%= title %>' /></a>
    </div>
</script>

<script id="popUpTemplate" type="text/template">
    <div class="popupContent borderTopRounded">
        <div class="popupHeader borderTopRounded">
            <div class="popupClose">x</div>
        </div>
        <div class="popupColumns">
            <div class="popupLeftColumn">
                <div class="popupTitle">
                </div>
                <div class="popupMedia">
                </div>
                <div class="popupSliders">
                    <div class="inputs">
                        <div class="sliders">
                            <span><%= gauche %></span><input type="range" id="sliderIc" min="0" max="100" value="50" /><span><%= droite %></span><br/>
                            <span><%= bas %></span><input type="range" id="sliderRu" min="0" max="100" value="50" /><span><%= haut %></span>
                        </div>
                    </div>
                    <div class="button">
                        <button class="voteButton">Vote</button>
                    </div>
                </div>
            </div>
            <div class="popupRightColumn">
                <div class="ecrivezVotez">Ecrivez votre avis puis votez :</div>
				<div class="popupInputComment">
					<div class="emojiPickerIconWrap">
						<textarea type="text" id="newComment"></textarea>
						<div class="emojiButton emojiPickerIcon black"></div>
                	</div>
                </div>
                <div class="popupComments" id="comments">
                </div>
            </div>
        </div>
        <div class="popupFooter">
        </div>
    </div>
</script>

<script id="commentTemplate" type="text/template">
    <div class="comment <%= bgcolor %>"><p><%= content %></p>
</script>

<script id="imageTemplate" type="text/template">
    <img src='<%= url %>' alt='' />
</script>

<script id="textMediaTemplate" type="text/template">
    <div class='textMedia'><%= content %></div>
</script>

<script id="videoTemplate" type="text/template">
    <video width='<%= width %>' height='<%= height %>' id='playervideo' <%= html5options %> >
        <source src='<%= url %>' type='<%= mime %>' />
    </video>
</script>

<script id="audioTemplate" type="text/template">
    <audio id='playeraudio' <%= html5options %> >
        <source src='<%= url %>' type='<%= mime %>' />
    </audio>
</script>

<script id="uploadFormTemplate" type="text/template">
    <div class="uploadContent borderTopRounded">
        <div class="uploadHeader borderTopRounded">
            <div class="uploadClose">x</div>
        </div>
        <div class="uploadBody">		
            <div id="etape_user" class="etape_user">
                <div class="tabLoginInscription">
                    <div class="login selected">Se connecter</div>
                    <div class="inscription">S'inscrire</div>
                </div>
                <div>
                    <div class="loginForm">
                        <form id="loginForm">
                        
                            <div class="elementForm">
                                <span class="label">Votre pseudo : </span><input type="input" id="pseudo" name="pseudo" value="" />
                            </div>
                            <div class="elementForm">
                                <span class="label">Votre mot de passe : </span><input type="password" id="password" name="password"  />
                            </div>
                            <div class="elementForm">
                                <button type="submit" id="login-button">Se connecter</button>
                            </div>
                            
                        </form>
                    </div>
                    <div class="inscriptionForm">
                        <form id="inscriptionForm">
                        
                            <div class="elementForm">
                                <span class="label">Votre nom : </span><input type="input" id="adduser_nom" name="adduser_nom" value="" />
                            </div>
                            
                            <div class="elementForm">
                                <span class="label">Votre prénom : </span><input type="input" id="adduser_prenom" name="adduser_prenom" value="" />
                            </div>
                            
                            <div class="elementForm">
                                <span class="label">Votre pseudo (*) : </span><input type="input" id="adduser_pseudo" name="adduser_pseudo" value="" />
                            </div>
                            
                            <div class="elementForm">
                                <span class="label">Votre mot de passe (*): </span><input type="password" id="adduser_password" name="adduser_password"  />
                            </div>
                            
                            <div class="elementForm">
                                <span class="label">Votre email : </span><input type="input" id="adduser_email" name="adduser_email" value="" />
                            </div>
                            
                            <div class="elementForm">
                                <button type="submit" id="inscription-button">S'inscrire</button>
                            </div>
                            
                            <div class="elementForm">
                                <p>(*) champs obligatoires</p>
                            </div>
                            
                        </form>
                    </div>
                </div>
            </div>
            
            <div id="etape_upload" class="etape_upload" style="display:none">
                <div id="uploadForm" class="uploadForm">
                
                    <div class="elementForm">
                        <p class="rubrique">A quelle question répondez-vous ?</p>
                        <select id="formQueries" name="queries" />
                    </div>
                    
                    <div class="elementForm">
                        <p class="rubrique">Titre de votre témoignage :</p>
                        <input type="input" id="itemTitle" name="itemTitle" value="" />
                        <p class="sousrubrique">Faites attention que votre témoignage ne traite que d'une idée, avec un parti pris clair.<br/>Cela permettra à chacun de bien cibler sa réponse.</p>
                    </div>
                    
                    <div class="elementForm">
                        <p class="rubrique principale">Vous avez deux choix :</p>
                        <p class="rubrique">A. Chargez votre média (jpeg, png, mp3, mp4) :</p>
						<p class="sousrubrique">Attention : le poids de votre media ne doit pas dépasser 20 Mo.</p>
                        <form id="fileUploadForm" enctype="multipart/form-data" method="POST">
                            <input type="file" id="fileSelect" name="file[]" />
                            <button type="submit" id="uploadButton">Envoyer votre media</button>
                			<p class="uploadStatus"></p>
                        </form>
						<div class="envoiTexte">
							<p class="rubrique">B. Ou bien envoyez-nous un simple témoignage écrit :</p>
							<textarea type="text" id="newTextMedia"></textarea>
							<button type="submit" id="sendTextMediaButton">Envoyer votre texte</button>
						</div>
                    </div>
                </div>
                
                <div id="uploadedMedia" class="uploadedMedia">
                    <div class="mediaParent"></div>
                </div>
				
				
                <div class="buttonParent">
					<p class="rubrique etape etape2">....... Prochaine étape 2/4</p>
                    <button id="toEtape2Button">&gt;</button>
                </div>
            </div>
            
            <div id="etape_vote" class="etape_vote" style="display:none">
                <p class="rubrique">Donnez votre sentiment :</p>
                <div class="inputs">
                    <div class="sliders">
                        <div class="elementForm">
                            <span><%= gauche %></span><input type="range" id="uploadSliderIc" min="0" max="100" value="50" /><span><%= droite %></span>
                        </div>
                        <div class="elementForm">
                            <span><%= bas %></span><input type="range" id="uploadSliderRu" min="0" max="100" value="50" /><span><%= haut %></span>
                        </div>
                    </div>
                </div>
                <div class="buttonParent">
					<p class="rubrique etape etape3">....... Prochaine étape 3/4</p>
                    <button id="toEtape3Button">&gt;</button>
                </div>
            </div>
            
            <div id="etape_keyword" class="etape_keyword" style="display:none">
                <p class="rubrique">Choisissez un mot-clé :</p>
                <div id="formKeywords" class="keywords"></div>
                <div class="buttonParent">
					<p class="rubrique etape etape4">....... Prochaine étape 4/4</p>
                    <button id="toEtape4Button">&gt;</button>
                </div>
            </div>
            
            <div id="etape_map" class="etape_map" style="display:none">
                <p class="rubrique">Placez votre témoignage sur la carte :</p>
                <div>
                    <div id="formMap" class="mapParent">
                        <img class="map" src="<%= urlCarte %>" alt="" />
                        <img class="item" src='http://cdn.aws.chatanoo.org/mjc/nogent/divers/cercleRouge.png' alt='' />
                    </div>
                </div>
                <div class="buttonParent">
					<p class="rubrique etape etape5">....... Envoi de la contribution</p>
                    <button id="toEtape5Button">&gt;</button>
                </div>					
            </div>
            
            <div id="etape_conclusion" class="etape_conclusion" style="display:none">
                <p>Merci de votre contribution !</p>
                <div class="buttonParent">
					<p class="rubrique etape etape6">....... Retour au débat</p>
                    <button id="toEtape6Button">&gt;</button>
                </div>					
                <div class="buttonParent">
					<p class="rubrique etape etape1">....... Envoyer un autre média</p>
                    <button id="toEtape1Button">&gt;</button>
                </div>					
            </div>
                
        </div>
    </div>
</script>
