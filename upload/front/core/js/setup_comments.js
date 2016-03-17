//
// TODOs
//

// Interface responsive % de la taille d'écran
// Association des couleurs à chaque item et nombre de thèmes

// Tests graphiques :
// . formes/couleurs en fonction du type de mot-clé
// . écrans des indices

// Affichage des medias (vidéos, sons, images) dans un MediaPlayer
// Canvas des items (premier clic --> ouverture du symbole + titre --> second clic sur le titre --> affichage du media)
// Canvas des mots-clés 
// Canvas de de la cartographie (ou intégration Google Maps)
// Retour à la home (vidage des vues)
// Problème des accents avec la typo
// PopUp Media avec sliders de Vote
// Version mobile (liste dans le sens Portrait par ex)


// /var/www/dring93.org/subdomains/mc/Medias

/*

1)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: I0XlU0FKKD68nT1MVxmditqo4Suo3CtB Content-length: 223 
{"method":"addUser","id":"AIIK-B078-73F0-KJ4K-QDBQ-1LZH","params":[{"email":"","__className":"Vo_User","id":0,"addDate":null,"setDate":null,"pseudo":"","password":"","isBan":false,"lastName":"","role":null,"firstName":""}]}
--> {"result":"509","id":"AIIK-B078-73F0-KJ4K-QDBQ-1LZH"}

2)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: I0XlU0FKKD68nT1MVxmditqo4Suo3CtB Content-length: 76 
{"method":"getUserById","id":"2IP7-ZM7E-GFCU-73D6-TGVH-RY28","params":[509]}
--> {"result":{"__className":"Vo_User","id":"509","firstName":"","lastName":"","pseudo":"","password":null,"email":"","role":null,"_isBan":"0","addDate":"2015.04.06 13:19:15","setDate":"2015.04.06 13:19:15","__className":"Vo_User"},"id":"2IP7-ZM7E-GFCU-73D6-TGVH-RY28"}

3)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: I0XlU0FKKD68nT1MVxmditqo4Suo3CtB Content-length: 244 
{"method":"addMetaIntoVo","id":"D05Q-W3EZ-XNCO-CI6E-DMDI-W6C9","params":[{"content":"{\"categorie2\":null,\"categorie1\":null,\"jeunevieux\":null,\"ville\":null,\"masculinfeminin\":null}","__className":"Vo_Meta","id":0,"name":"UserInfos"},509]}
--> {"result":"590","id":"D05Q-W3EZ-XNCO-CI6E-DMDI-W6C9"}

4)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Content-length: 107 
{"method":"login","id":"L3CD-AFMG-79R9-8II3-9MKA-LQT7","params":["","","BBC_qJlCaSsBbYBYypwF9TT8KmCOxhuZ"]}
--> {"result":"XbONWfSH0OObfq8TGSahfmmSLcy1Fwas","id":"L3CD-AFMG-79R9-8II3-9MKA-LQT7"}

5) 
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 219 
{"method":"addItemIntoQuery","id":"I2L9-SAJV-MBGM-FTAB-1ACV-X2EF","params":[{"__className":"Vo_Item","isValid":true,"addDate":null,"setDate":null,"description":"","id":0,"title":"test","users_id":509,"rate":0},70,null]}
--> {"result":"2099","id":"I2L9-SAJV-MBGM-FTAB-1ACV-X2EF"}

6)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 283 
{"method":"addMediaIntoItem","id":"N772-XU8O-DXSD-PGGK-MZK1-9D14","params":[{"isValid":false,"setDate":null,"preview":null,"width":null,"__className":"Vo_Media_Picture","height":null,"title":"test","addDate":null,"description":null,"url":"MC-KaZjgHdW-P","id":0,"users_id":509},2099]}
--> {"result":"689","id":"N772-XU8O-DXSD-PGGK-MZK1-9D14"}

7)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 158 
{"method":"addMetaIntoVo","id":"9SSN-RZ25-3DU6-XUZM-NWTE-BOEB","params":[{"content":"apprendre","__className":"Vo_Meta","id":325,"name":"Type2KeyWord"},2099]}
--> {"result":325,"id":"9SSN-RZ25-3DU6-XUZM-NWTE-BOEB"}

8) 
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 166 
{"method":"addMetaIntoVo","id":"XAHE-6LL9-BNTR-YIHO-XCEC-3FA6","params":[{"content":"avoir des projets","__className":"Vo_Meta","id":321,"name":"Type1KeyWord"},2099]}
--> {"result":321,"id":"XAHE-6LL9-BNTR-YIHO-XCEC-3FA6"}

9)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 161 
{"method":"addMetaIntoVo","id":"BGJE-P8C5-1TKM-6E6G-SVQ1-SIFN","params":[{"content":"etre creatif","__className":"Vo_Meta","id":323,"name":"Type1KeyWord"},2099]}
--> {"result":323,"id":"BGJE-P8C5-1TKM-6E6G-SVQ1-SIFN"}

10)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 186 
{"method":"addDataIntoVo","id":"NTSO-JJOX-ZFS0-VUEK-UZVB-1EIJ","params":[{"x":48.94639278536252,"addDate":null,"y":2.345635323,"__className":"Vo_Data_Carto","id":0,"setDate":null},2099]}
--> {"result":"1074","id":"NTSO-JJOX-ZFS0-VUEK-UZVB-1EIJ"}

11)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 86 
{"method":"getDatasById","id":"UO65-KWIL-KPO4-ZXS6-ZU2C-FO9M","params":[1074,"Carto"]}
--> {"result":{"__className":"Vo_Data_Carto","x":"48.9464","y":"2.34564","id":"1074","addDate":"2015.04.06 13:19:16","setDate":"2015.04.06 13:19:16","__className":"Vo_Data_Carto"},"id":"UO65-KWIL-KPO4-ZXS6-ZU2C-FO9M"}

12)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 175 
{"method":"addDataIntoVo","id":"DYZL-YB94-QVPR-G3V7-AYWD-ICWX","params":[{"__className":"Vo_Data_Vote","addDate":null,"setDate":null,"id":0,"users_id":509,"rate":10279},2099]}
--> {"result":"9190","id":"DYZL-YB94-QVPR-G3V7-AYWD-ICWX"}

13)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 85 
{"method":"getDatasById","id":"4VDI-FT7I-I2TG-CDUW-W2AV-GVFM","params":[9190,"Vote"]}
--> {"result":{"__className":"Vo_Data_Vote","rate":"10279","user":"509","id":"9190","addDate":"2015.04.06 13:19:17","setDate":"2015.04.06 13:19:17","__className":"Vo_Data_Vote"},"id":"4VDI-FT7I-I2TG-CDUW-W2AV-GVFM"}

14)
Referer: http://www.lebonheurbrutcollectif.org/bbc_v7.swf Content-type: application/json Authorization: XbONWfSH0OObfq8TGSahfmmSLcy1Fwas Content-length: 83 
{"method":"getMediasByItemId","id":"ZVSC-M9YL-C8WQ-9AJU-MVGX-RGVY","params":[2066]}
--> {"result":{"Picture":[{"__className":"Vo_Media_Picture","url":"MC-dIYXMOrZ-P","width":null,"height":null,"id":"688","title":"test","description":null,"preview":null,"_isValid":"0","_user":"227","addDate":"2015.03.09 18:01:38","setDate":"2015.03.09 18:01:38","__className":"Vo_Media_Picture"}]},"id":"ZVSC-M9YL-C8WQ-9AJU-MVGX-RGVY"}

*/


/*

ADMIN : 

Referer: http://www.lebonheurbrutcollectif.org/admin/Admin_JSON.swf Content-type: application/json Content-length: 129 
{"method":"login","id":"668J-KO1S-2CZM-4ETT-VJSE-GNGD","params":["carolann_bbc","desperados","BBC_qJlCaSsBbYBYypwF9TT8KmCOxhuZ"]}
--> {"result":"lgLYxYE3wHLMmNjHDmPiSnQxHbwIyV4K","id":"668J-KO1S-2CZM-4ETT-VJSE-GNGD"}

Referer: http://www.lebonheurbrutcollectif.org/admin/Admin_JSON.swf Content-type: application/json Authorization: lgLYxYE3wHLMmNjHDmPiSnQxHbwIyV4K Content-length: 103 
{"method":"getUserByLogin","id":"UB9L-KK6C-LNSK-JX6M-1IP8-FH6P","params":["carolann_bbc","desperados"]}
--> {"result":{"__className":"Vo_User","id":"13","firstName":"concert","lastName":"urbain","pseudo":"carolann_bbc","password":null,"email":"carol-ann.braun@wanadoo.fr","role":"admin","_isBan":"1","addDate":"2011.11.19 08:15:44","setDate":"2013.04.24 17:14:28","__className":"Vo_User"},"id":"UB9L-KK6C-LNSK-JX6M-1IP8-FH6P"}

Referer: http://www.lebonheurbrutcollectif.org/admin/Admin_JSON.swf Content-type: application/json Authorization: lgLYxYE3wHLMmNjHDmPiSnQxHbwIyV4K Content-length: 72 
{"method":"getQueries","id":"O2QF-21C9-U572-H5T9-88FF-7UE5","params":[]}
--> {"result":[{"__className":"Vo_Query","id":"70","content":"BONHEUR : Plaine Commune"....

*/


function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		//obj["attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				//obj["attributes"][attribute.nodeName] = attribute.nodeValue;
				obj[attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue.trim(); // add trim here
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				var tmp = xmlToJson(item);
				if(tmp != "") // if not empty string
					obj[nodeName] = tmp;
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				var tmp = xmlToJson(item);
				if(tmp != "") // if not empty string
					obj[nodeName].push(tmp);
			}
		}
	}
	return obj;
};


$(function()
{
	/* BACKBONE */
	
	window.App = {};
	
	App.eventManager = _.extend({}, Backbone.Events);
	
	App.Models = {};
	App.Collections = {};
	App.Views  = {};
	
	App.Views.appView = new AppView();

	// Permet de gérer les click au niveau des "div" parent d'un lien (plutôt qu'au niveau du lien lui-même)
	$(document).delegate("a", "click", function(evt) {
		var href = $(this).attr("href");
		if (href == "#") evt.preventDefault();
	});	

	App.Views.appView.connectToWebServices();
	
});

