//
// Fonctions utiles
//


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


function getDefaultDate(itemModel)
{
	return new Date(2009, 04, Number( itemModel.get("id") ) % 29 + 1);
}

function dateToIso8601(date)
{
	var iso = "";
	
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var monthStr = (month < 10 ? "0" : "") + month;
	var day = date.getDate();
	var dayStr = (day < 10 ? "0" : "") + day;
	
	iso += year + "-" + monthStr + "-" + dayStr;
	
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var secondes = date.getSeconds();
	
	var hourStr = (hour < 10 ? "0" : "") + hour;
	var minutesStr = (minutes < 10 ? "0" : "") + minutes;
	var secondesStr = (secondes < 10 ? "0" : "") + secondes;
	
	iso += "T" + hourStr + ":" + minutesStr + ":" + secondesStr;
	
	return iso;
}

function iso8601ToDate(iso)
{
	var separator = iso.indexOf("T") == - 1 ? " " : "T";
	
	var dateSplitArray = dateSplitArray = iso.split(separator);
	
	var dateSplitResult = dateSplitArray[0];
	var timeSplitResult = dateSplitArray[1];
	
	var date = new Date();
	
	// Date
	var separatorDate = iso.indexOf(".") == - 1 ? "-" : ".";
	dateSplitArray = dateSplitResult.split(separatorDate);
	date.setFullYear(dateSplitArray[0], parseInt(dateSplitArray[1]) - 1, dateSplitArray[2]);
	
	// Heure
	dateSplitArray = timeSplitResult.split("Z").join("").split(":");
	date.setHours(dateSplitArray[0], dateSplitArray[1], dateSplitArray[2]);
	
	return date;
}

function trimWhiteSpace(str)
{
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
