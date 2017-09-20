$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTParser=$pdk.extend(function(){},{constructor:function(){if($pdk.plugin.vast.VASTParser._instance){this.parse=null;
this.parseVast=null;
throw"$pdk.plugin.vast.VASTParser is a Singlton. Access via getInstance()"
}$pdk.plugin.vast.VASTParser._instance=this;
tpDebug("VASTParser instantiated.","","VAST")
},parse:function(b){var c;
var a;
if(b instanceof window.Document){tpRemoveWhiteSpace(b);
c=b;
a=this.parseVast(c.childNodes[0].childNodes);
if(a&&c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}else{if(b.xml){c=tpParseXml(b.xml);
a=this.parseVast(c.childNodes[0].childNodes);
if(a&&c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}else{if(b instanceof Element){a=this.parseVast(b.childNodes);
if(a&&b.attributes.version){a.version=b.attributes.version.nodeValue
}}else{c=tpParseXml(b);
a=this.parseVast(c.childNodes[0].childNodes);
if(c.childNodes[0].attributes.version){a.version=c.childNodes[0].attributes.version.nodeValue
}}}}return a
},parseVast:function(b){var a={};
var d;
a.ads=[];
for(var c=0;
c<b.length;
c++){if(b[c] instanceof Element){d=this.parseAd(b[c]);
if(d){a.ads.push(d)
}}}if(a.ads.length>0){return a
}else{return null
}},parseAd:function(b){var g=b.childNodes[0];
var a;
if(!(g instanceof Element)){return null
}if(g.tagName=="InLine"){a=this.parseInLine(g);
if(b.attributes.getNamedItem("id")){a.id=b.attributes.getNamedItem("id").nodeValue
}if(b.attributes.sequence&&a){a.sequence=parseInt(b.attributes.sequence.nodeValue,10)
}if(!a){return null
}if(a.video){if(g.getElementsByTagName("CustomTracking")[0]){a.video.trackingEvents=a.video.trackingEvents.concat(this.parseTrackingEvents(g.getElementsByTagName("CustomTracking")[0]))
}}a.adType="InLine";
return a
}else{if(g.tagName=="Wrapper"){a={};
if(b.attributes.getNamedItem("id")){a.id=b.attributes.getNamedItem("id").nodeValue
}if(b.attributes.sequence){a.sequence=parseInt(b.attributes.sequence.nodeValue,10)
}var j=g.getElementsByTagName("AdSystem")[0];
if(j){a.adSystem=j.childNodes.nodeValue
}a.error=this.parseSimpleUrl(g.getElementsByTagName("Error")[0]);
a.extensions=this.parseExtensions(g.getElementsByTagName("Extensions")[0]);
try{a.impressions=this.parseImpressions(g.getElementsByTagName("Impression"))
}catch(f){console.error(f)
}a.trackingEvents=this.parseTrackingEvents(g.getElementsByTagName("TrackingEvents")[0]);
if(g.getElementsByTagName("CustomTracking")[0]){a.trackingEvents=a.trackingEvents.concat(this.parseTrackingEvents(g.getElementsByTagName("CustomTracking")[0]))
}a.adType="Wrapper";
a.vastAdData={};
a.vastAdData.ads=[];
var h=b.getElementsByTagName("VASTAdData");
if(!h.length){h=b.getElementsByTagName("vastaddata")
}var d=h[0].childNodes;
for(var c=0;
c<d.length;
c++){if(d[c] instanceof Element){ad=this.parseAd(d[c]);
if(ad){a.vastAdData.ads.push(ad)
}}}return this.parseWrapper(g,a)
}else{throw new Error("Unrecognized ad type: "+g.tagName)
}}return null
},parseUrls:function(a){if(a&&a.childNodes){var c=[];
for(var b=0;
b<a.childNodes.length;
b++){c.push(this.parseUrl(a.childNodes[b]))
}return c
}return null
},parseUrl:function(b){var a={};
a.url=this.parseSimpleUrl(b);
if(b.attributes&&b.attributes.id){a.id=b.attributes.id.nodeValue
}else{a.id=null
}return a
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},parseImpressions:function(d){if(!d){return null
}var b=[];
var a=d.length;
var c=0;
for(;
c<a;
c++){b=b.concat(this.parseUrls(d[c]))
}return b
},parseTrackingEvents:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseTrackingEvent(b.childNodes[c]))
}return a
}return null
},parseTrackingEvent:function(b){var a={};
if(b.attributes.event){a.event=b.attributes.event.nodeValue
}a.urls=this.parseUrls(b);
return a
},parseWrapper:function(b,d){var a=d?d:{};
a.vastAdTagURL=this.parseSimpleUrl(b.getElementsByTagName("VASTAdTagURI")[0]);
a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0]);
var e=b.getElementsByTagName("vastaddata")[0];
if(e){for(var c=0;
c<e.childNodes.length;
c++){}}return a
},parseInLine:function(b){var c={};
if(b.attributes.id){c.id=b.attributes.id.nodeValue
}try{c.adSystem=b.getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue
}catch(e){tpDebug("AdSystem child node not present on Inline VAST Ad. Per the VAST spec, it is required.","","VAST",tpConsts.ERROR);
return null
}c.error=this.parseSimpleUrl(b.getElementsByTagName("Error")[0]);
c.extensions=this.parseExtensions(b.getElementsByTagName("Extensions")[0]);
try{c.impressions=this.parseImpressions(b.getElementsByTagName("Impression"))
}catch(d){tpDebug(d,"","VAST",tpConsts.ERROR)
}var a=this.parseCreatives(b,c);
return a
},parseCreatives:function(e,h){var j=h;
if(e.getElementsByTagName("AdTitle")[0]&&e.getElementsByTagName("AdTitle")[0].childNodes[0]){j.adTitle=e.getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue
}if(e.getElementsByTagName("Description")[0]&&e.getElementsByTagName("Description")[0].childNodes[0]){j.description=e.getElementsByTagName("Description")[0].childNodes[0].nodeValue
}var g=e.getElementsByTagName("Creatives")[0];
if(!g){return null
}for(var c=0;
c<g.childNodes.length;
c++){var f=g.childNodes[c];
if(f.getElementsByTagName("CompanionAds").length>0){var a=f.getElementsByTagName("CompanionAds")[0];
if(a){j.companionAds=this.parseCompanionAds(a)
}}if(f.getElementsByTagName("Linear")[0]){var d=f.getElementsByTagName("Linear")[0];
if(d){j.video=this.parseVideo(d);
if(f.attributes&&f.attributes.id){j.video.id=f.attributes.id.nodeValue
}}}if(f.getElementsByTagName("NonLinearAds").length>0){var b=f.getElementsByTagName("NonLinearAds")[0];
if(b){j.nonLinearAds=this.parseNonLinearAds(b)
}}}if(!j.video){j.video={}
}return j
},parseCompanionAds:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseCompanion(b.childNodes[c]))
}return a
}return null
},parseCompanion:function(b){var a={};
if(b.getElementsByTagName("AltText")[0]&&b.getElementsByTagName("AltText")[0].childNodes[0]){a.altText=b.getElementsByTagName("AltText")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("adParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("Code")[0]&&b.getElementsByTagName("Code")[0].childNodes[0]){a.code=b.getElementsByTagName("Code")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("CompanionClickThrough")[0]){a.companionClickThrough=this.parseSimpleUrl(b.getElementsByTagName("CompanionClickThrough")[0])
}if(b.attributes.creativeType){a.creativeType=b.attributes.creativeType.nodeValue
}if(b.attributes.expandedHeight){a.expandedHeight=b.attributes.expandedHeight.nodeValue
}if(b.attributes.expandedWidth){a.expandedWidth=b.attributes.expandedWidth.nodeValue
}if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.resourceType){a.resourceType=b.attributes.resourceType.nodeValue
}if(b.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(b.getElementsByTagName("StaticResource")[0])
}if(b.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(b.getElementsByTagName("IFrameResource")[0])
}if(b.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=b.getElementsByTagName("HTMLResource")[0]
}if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseVideo:function(b){var a={};
if(b.getElementsByTagName("Duration")[0]){a.duration=tpTimeToMillis(b.getElementsByTagName("Duration")[0].childNodes[0].nodeValue)
}if(b.getElementsByTagName("AdID")[0]){a.adId=b.getElementsByTagName("AdID")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("AdParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("VideoClicks")[0]){a.videoClicks=this.parseVideoClicks(b.getElementsByTagName("VideoClicks")[0])
}if(b.getElementsByTagName("MediaFiles")[0]){a.mediaFiles=this.parseMediaFiles(b.getElementsByTagName("MediaFiles")[0])
}if(b.getElementsByTagName("TrackingEvents")[0]){a.trackingEvents=this.parseTrackingEvents(b.getElementsByTagName("TrackingEvents")[0])
}if(b.attributes.skipoffset){var d=b.attributes.skipoffset.nodeValue;
if(d.indexOf(":")>0){var c=d.split(":");
a.skipOffset=(c[0]*60*60)+(c[1]*60)+(c[2])
}else{if(d.indexOf("%")>0){if(a.duration){a.skipOffset=Math.round((a.duration/1000)*(parseInt(d,10)*0.01))
}}else{a.skipOffset=parseInt(d,10)
}}}return a
},parseAdParameters:function(b){if(b){try{var a={};
a.apiFramework=b.attributes.apiFramework;
a.parameters=b.childNodes[0].nodeValue;
return a
}catch(c){}}return null
},parseVideoClicks:function(b){if(b){var a={};
var e=b.getElementsByTagName("ClickTracking");
var d=[];
a.clickThrough=this.parseUrls(b.getElementsByTagName("ClickThrough")[0]);
for(var c=0;
c<e.length;
c++){d.push(this.parseUrls(e[c])[0])
}a.clickTracking=d;
if(b.getElementsByTagName("CustomClick").length>0){a.customClick=this.parseUrls(b.getElementsByTagName("CustomClick")[0])
}return a
}return null
},parseMediaFiles:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseMediaFile(b.childNodes[c]))
}return a
}return null
},parseMediaFile:function(b){var a={};
if(b.attributes.bitrate){a.bitrate=b.attributes.bitrate.nodeValue*1000
}a.delivery=(b.attributes.delivery?b.attributes.delivery.nodeValue:null);
if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.type){a.type=b.attributes.type.nodeValue
}a.url=this.parseSimpleUrl(b);
if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseNonLinearAds:function(c){if(c&&c.childNodes){var b;
if(c.getElementsByTagName("TrackingEvents")){b=this.parseTrackingEvents(c.getElementsByTagName("TrackingEvents")[0])
}var a=[];
var e=c.getElementsByTagName("NonLinear");
for(var d=0;
d<e.length;
d++){a.push(this.parseNonLinear(e[d],b));
b=null
}return a
}return null
},parseNonLinear:function(c,b){var a={};
if(c.attributes.apiFramework){a.apiFramework=c.attributes.apiFramework.nodeValue
}if(c.attributes.expandedHeight){a.expandedHeight=c.attributes.expandedHeight.nodeValue
}if(c.attributes.expandedWidth){a.expandedWidth=c.attributes.expandedWidth.nodeValue
}if(c.attributes.height){a.height=c.attributes.height.nodeValue
}if(c.attributes.id){a.id=c.attributes.id.nodeValue
}if(c.attributes.maintainAspectRatio){a.maintainAspectRatio=c.attributes.maintainAspectRatio.nodeValue
}a.nonLinearClickThrough=this.parseSimpleUrl(c.getElementsByTagName("NonLinearClickThrough")[0]);
a.adParameters=this.parseAdParameters(c.getElementsByTagName("AdParameters")[0]);
if(c.attributes.resourceType){a.resourceType=c.attributes.resourceType.nodeValue
}if(c.attributes.scalable){a.scalable=c.attributes.scalable.nodeValue
}if(c.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(c.getElementsByTagName("StaticResource")[0])
}if(c.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(c.getElementsByTagName("IFrameResource")[0])
}if(c.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=c.getElementsByTagName("HTMLResource")[0]
}if(c.attributes.width){a.width=c.attributes.width.nodeValue
}if(b){a.trackingEvents=b
}return a
},parseExtensions:function(h){if(h&&h.childNodes){var o=[];
var a=h.getElementsByTagName("Extension");
for(var e=0;
e<a.length;
e++){if(a[e].attributes.type.nodeValue.toLowerCase()==="freewheel"){var n={};
var l=a[e].getElementsByTagName("RenditionParameter");
var c=a[e].getElementsByTagName("CreativeParameter");
if(l.length){n.renditionParameters=[];
for(var d=0;
d<l.length;
d+=1){var g={};
var m=l[d].parentNode;
g.name=l[d].attributes.name.nodeValue;
g.type=m.attributes.type.nodeValue;
g.id=m.attributes.renditionId.nodeValue;
g.value=l[d].textContent;
n.renditionParameters.push(g)
}}if(c.length){n.creativeParameters=[];
for(var b=0;
b<c.length;
b+=1){var f={};
f.name=c[b].attributes.name.nodeValue;
f.type=c[b].attributes.type.nodeValue;
f.id=c[b].attributes.creativeId.nodeValue;
f.value=c[b].textContent;
n.creativeParameters.push(f)
}}o.push(n)
}}return o
}return null
}});
$pdk.plugin.vast.VASTParser.getInstance=function(){if(!$pdk.plugin.vast.VASTParser._instance){$pdk.plugin.vast.VASTParser._instance=new $pdk.plugin.vast.VASTParser()
}return $pdk.plugin.vast.VASTParser._instance
};
$pdk.plugin.vast.VASTParser.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VMAPParser=$pdk.extend(function(){},{constructor:function(){if($pdk.plugin.vast.VMAPParser._instance){this.parse=null;
this.parseVmap=null;
throw"$pdk.plugin.vast.VMAPParser is a Singlton. Access via getInstance()"
}$pdk.plugin.vast.VMAPParser._instance=this;
tpDebug("VMAPParser instantiated.","","VMAP")
},parse:function(a,d){this.vastResponseIndex=0;
this.vastResponses={};
var e;
if(a instanceof window.Document){tpRemoveWhiteSpace(a);
e=a
}else{if(a.xml){e=tpParseXml(a.xml)
}else{e=tpParseXml(a)
}}tpRemoveComments(e);
if(e&&e.childNodes&&e.childNodes.length>0){var c=0;
for(var b=0;
b<e.childNodes.length;
b++){if(e.childNodes[b].localName.toLowerCase()=="vmap"){c=b;
break
}}return this.parseVmap(e.childNodes[c].childNodes,d)
}else{return null
}},parseVmap:function(b,e){var a={};
var d;
a.adbreaks=[];
for(var c=0;
c<b.length;
c++){if(b[c] instanceof Element){d=this.parseAdBreak(b[c],e);
if(d&&d.adTagUri){a.adbreaks.push(d)
}if(d&&!d.adTagUri){d.adTagUri="empty-adslot:";
a.adbreaks.push(d)
}}}if(a.adbreaks.length>0){return a
}else{return null
}},parseUrls:function(a){if(a&&a.childNodes){var c=[];
for(var b=0;
b<a.childNodes.length;
b++){c.push(this.parseUrl(a.childNodes[b]))
}return c
}return null
},parseOffset:function(g,f){if(g=="start"||g=="end"){return g
}if(g.indexOf(":")>=0){var d=0,a=0,c=0,b=0;
var e=g.split(":");
while(e.length){if(e.length==1){c=parseInt(e[0].split(".")[0],10);
if(e[0].indexOf(".")>=0){b=parseInt(e[0].split(".")[1],10)
}}else{if(e.length==2){a=parseInt(e[0],10)
}else{if(e.length==3){d=parseInt(e[0],10)
}}}e.shift()
}return d*3600000+a*60000+c*1000+b
}else{if(g.indexOf("%")>=0){return f*parseInt(g.replace("%",""),10)/100
}else{if(g.indexOf("#")>=0){return g
}}}},parseUrl:function(b){var a={};
a.url=this.parseSimpleUrl(b);
if(b.attributes&&b.attributes.id){a.id=b.attributes.id.nodeValue
}else{a.id=null
}return a
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},parseAdBreak:function(c,g){var f;
var a;
a={};
if(c.attributes.timeOffset){a.timeOffset=this.parseOffset(c.attributes.timeOffset.value,g)
}if(c.attributes.breakType){a.breakType=c.attributes.breakType.value
}if(c.attributes.breakId){a.breakId=c.attributes.breakId.value
}for(var b=0;
b<c.childNodes.length;
b++){f=c.childNodes[b];
if(!(f instanceof Element)){continue
}if(f.localName=="AdSource"){if(f.attributes.allowMultipleAds){a.allowMultipleAds=(f.attributes.allowMultipleAds.value==="false"?false:true)
}if(f.attributes.followRedirects){a.followRedirects=(f.attributes.followRedirects.value==="false"?false:true)
}if(f.childNodes){var e;
for(var d=0;
d<f.childNodes.length;
d++){e=f.childNodes[d];
if(e.localName.toLowerCase()=="adtaguri"){a.adTagUri=this.parseSimpleUrl(f.childNodes[0])
}else{if(e.localName.toLowerCase()=="vastaddata"){this.vastResponseIndex++;
a.vastAdData=e.childNodes[0];
a.adTagUri="vmap-parser:vast-response-"+this.vastResponseIndex;
this.vastResponses[a.adTagUri]=a.vastAdData
}else{if(e.localName.toLowerCase()=="customaddata"){tpDebug("AdSource source is CustomAdData, which is not handled yet.","","VAST",tpConsts.WARN);
return null
}else{tpDebug("AdSource source is not one of allowed values (VastAdData, AdTagURI, or CustomAdData). It is '"+e.localName+"'. Skipping this AdBreak.","","VAST",tpConsts.ERROR);
return null
}}}}}}else{if(f.localName=="TrackingEvents"){a.trackingEvents=this.parseTrackingEvents(f)
}else{if(f.localName=="Extensions"){}else{tpDebug("Unrecognized AdBreak type: "+f.localName,"","VAST",tpConsts.ERROR);
return null
}}}}return a
},getVASTResponse:function(a){return this.vastResponses[a]
},parseImpressions:function(d){if(!d){return null
}var b=[];
var a=d.length;
var c=0;
for(;
c<a;
c++){b=b.concat(this.parseUrls(d[c]))
}return b
},parseTrackingEvents:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseTrackingEvent(b.childNodes[c]))
}return a
}return null
},parseTrackingEvent:function(b){var a={};
if(b.attributes.event){a.event=b.attributes.event.nodeValue
}a.urls=this.parseUrls(b);
return a
},parseCompanionAds:function(b){if(b&&b.childNodes){var a=[];
for(var c=0;
c<b.childNodes.length;
c++){a.push(this.parseCompanion(b.childNodes[c]))
}return a
}return null
},parseCompanion:function(b){var a={};
if(b.getElementsByTagName("AltText")[0]&&b.getElementsByTagName("AltText")[0].childNodes[0]){a.altText=b.getElementsByTagName("AltText")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("adParameters")[0]){a.adParameters=this.parseAdParameters(b.getElementsByTagName("AdParameters")[0])
}if(b.getElementsByTagName("Code")[0]&&b.getElementsByTagName("Code")[0].childNodes[0]){a.code=b.getElementsByTagName("Code")[0].childNodes[0].nodeValue
}if(b.getElementsByTagName("CompanionClickThrough")[0]){a.companionClickThrough=this.parseSimpleUrl(b.getElementsByTagName("CompanionClickThrough")[0])
}if(b.attributes.creativeType){a.creativeType=b.attributes.creativeType.nodeValue
}if(b.attributes.expandedHeight){a.expandedHeight=b.attributes.expandedHeight.nodeValue
}if(b.attributes.expandedWidth){a.expandedWidth=b.attributes.expandedWidth.nodeValue
}if(b.attributes.height){a.height=b.attributes.height.nodeValue
}if(b.attributes.id){a.id=b.attributes.id.nodeValue
}if(b.attributes.resourceType){a.resourceType=b.attributes.resourceType.nodeValue
}if(b.getElementsByTagName("StaticResource")[0]){a.staticResource=this.parseSimpleUrl(b.getElementsByTagName("StaticResource")[0])
}if(b.getElementsByTagName("IFrameResource")[0]){a.iFrameResource=this.parseSimpleUrl(b.getElementsByTagName("IFrameResource")[0])
}if(b.getElementsByTagName("HTMLResource")[0]){a.HTMLResource=b.getElementsByTagName("HTMLResource")[0]
}if(b.attributes.width){a.width=b.attributes.width.nodeValue
}return a
},parseVideoClicks:function(b){if(b){var a={};
a.clickThrough=this.parseUrls(b.getElementsByTagName("ClickThrough")[0]);
a.clickTracking=this.parseUrls(b.getElementsByTagName("ClickTracking")[0]);
if(b.getElementsByTagName("CustomClick").length>0){a.customClick=this.parseUrls(b.getElementsByTagName("CustomClick")[0])
}return a
}return null
}});
$pdk.plugin.vast.VMAPParser.getInstance=function(){if(!$pdk.plugin.vast.VMAPParser._instance){$pdk.plugin.vast.VMAPParser._instance=new $pdk.plugin.vast.VMAPParser()
}return $pdk.plugin.vast.VMAPParser._instance
};
$pdk.plugin.vast.VMAPParser.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.PlaylistProcessor=$pdk.extend(function(){},{constructor:function(a,b){this._scopes=a;
this._adTracking=b;
tpDebug("PlaylistProcessor instantiated.","","VMAP")
},splice:function(){if(arguments.length<3){return
}var f=arguments[0];
var a=arguments[1];
var d=arguments[2];
var e=[];
var c;
if(d>0){console.error("Warning PlaylistProcessor.splice does not support removing")
}if(arguments.length>3){for(var b=arguments.length-1;
b>=3;
b--){c=arguments[b];
this._insertClipAtIndex(f,c,a)
}}return e
},createClip:function(a,h,k,g,e,j,d){if(arguments.length==5){e=g
}var b={};
b.id=""+Math.floor(Math.random()*100000);
b.isAd=g;
b.noSkip=e;
b.streamType="flashVideoUnknownMP4";
b.URL=a;
b.description=k;
b.type=j;
b.globalDataType="com.theplatform.pdk.data::BaseClip";
if(d){b.trackingURLs=[];
for(var f=0;
f<d.length;
f++){b.trackingURLs.push(this._adTracking.getTrackingUrl(d[f]))
}}var c=com.theplatform.pdk.SelectorExported.getInstance(this._scopes.toString()).parseClip(b);
c.baseClip=b;
return c
},_insertClipAtIndex:function(d,c,a){d.chapters.chapters=[];
if(a<d.clips.length&&d.clips[a].chapter.adIndex==-1){d.clips[a].chapter.adIndex=d.clips[a].chapter.contentIndex
}for(var b=0;
b<d.clips.length;
b++){if(d.clips[b].chapter){d.chapters.chapters.push(d.clips[b].chapter)
}if(b>=a){if(d.clips[b].chapter){d.clips[b].chapter.contentIndex++
}d.clips[b].clipIndex++;
if(b>a&&d.clips[b].chapter&&d.clips[b].chapter.adIndex>=0){d.clips[b].chapter.adIndex++
}}}c.clipIndex=a;
d.baseClips.splice(a,0,c.baseClip);
d.clips.splice(a,0,c)
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTProcessor=$pdk.extend(function(){},{constructor:function(a,b,c,d){this.controller=a;
this._enablePods=b;
this._defaultEnablePods=b;
this.mimeTypes=c;
this.adTracking=new $pdk.plugin.vast.AdTracking();
this.allowClicks=d
},initialize:function(){this.parentWrappers=[];
this._enablePods=this._defaultEnablePods
},success:function(){this.vastSuccess(this._playlist)
},process:function(c,b,a){if(!c||!c.ads||c.ads.length===0){tpDebug("No ads found",this.controller.id,"VAST");
a();
return
}if(parseFloat(c.version)>=3){this._enablePods=true
}this.vastError=a;
this.vastSuccess=b;
this._playlist={};
this._playlist.baseClips=[];
this._playlist.clips=[];
this._playlist.globalDataType="com.theplatform.pdk.data::Playlist";
this.processVAST(c)
},processVAST:function(b){var j=0;
var k=0;
var h=0;
for(var f=0;
f<b.ads.length;
f++){var l=b.ads[f];
if(l.sequence&&!isNaN(l.sequence)){h++
}if(l.adType==="Wrapper"){j++
}else{if(l.adType==="InLine"){k++
}else{tpDebug("Unknown ad type: "+(l?l.adType:"<null>")+" ignoring",this.controller.id,"VAST")
}}}tpDebug("VAST playlist with "+k+" inline and "+j+" wrapper Ads.",this.controller.id,"VAST");
if(this._enablePods&&(h>0)){tpDebug("Detected VAST 3.0 sequence attributes",this.controller.id,"VAST");
var e=[];
var c=[];
for(f=0;
f<b.ads.length;
f++){if(b.ads[f].sequence&&!isNaN(b.ads[f].sequence)){c.push(b.ads[f])
}}while(c.length>0){var g=Number.MAX_VALUE;
var a=-1;
var d=0;
for(f=0;
f<c.length;
f++){d=Number(b.ads[f].sequence);
if(d<g){g=d;
a=f
}}e.push(c[a]);
c.splice(a,1)
}this.ads=e;
this.processAd();
for(f=0;
f<e.length;
f++){this.processAd(e[f])
}this.doneWithVAST();
return
}else{if(j>0||k>0){tpDebug("Detected VAST 2.0 inline",this.controller.id,"VAST");
if(this._enablePods){if(b.ads.length>1){tpDebug("Playing only first ad, since VAST 3.0 was triggered and there are no sequences",this.controller.id,"VAST")
}this.processAd(b.ads[0])
}else{tpDebug("Playing all ads, since VAST 2.0 was triggered (2.0 pod simulation)",this.controller.id,"VAST");
for(f=0;
f<b.ads.length;
f++){this.processAd(b.ads[f])
}}this.doneWithVAST();
return
}}if(this._playlist.clips.length>0){this.doneWithVAST()
}else{if(this.parentWrappers.length===0){this.vastError()
}}},doneWithVAST:function(){if(this.parentWrappers.length===0){this.success()
}},processCompanions:function(g,h){if(!(g&&g.length)){return
}if(!h.banners){h.banners=[]
}tpDebug("adding companions",this.controller.id,"VAST");
var n,a,b,k,j,c,o,m,l,f,d;
for(var e=0;
e<g.length;
e++){if(g[e].staticResource){if(g[e].staticResource){a=g[e].staticResource
}else{if(g[e].iFrameResource){a=g[e].iFrameResource
}}b=g[e].companionClickThrough;
j="_blank";
c=parseInt(g[e].width,10);
o=parseInt(g[e].height,10);
if(g[e].creativeType){d=g[e].creativeType
}if(g[e].altText){f=g[e].altText
}m=g[e].id;
l=g[e].id;
n={globalDataType:"com.theplatform.pdk.data::Banner",guid:l,region:m,src:a,href:b,target:j,alt:f,bannerType:d,bannerWidth:c,bannerHeight:o,bannerSize:(c*o)};
h.banners.push(n)
}}},processOverlays:function(b,f){if(!(b&&b.length)){return
}if(!f.overlays){f.overlays=[]
}tpDebug("adding overlays",this.controller.id,"VAST");
var l,a,c,h,g,d,m,k,j;
for(var e=0;
e<b.length;
e++){if(b[e]){if(b[e].staticResource){a=b[e].staticResource
}else{if(b[e].iFrameResource){a=b[e].iFrameResource
}else{continue
}}c=b[e].nonLinearClickThrough;
g="_blank";
d=b[e].width;
m=b[e].height;
if(b[e].id){j=b[e].id
}else{j="tpVASTOverlay"
}j+="_"+Math.floor(Math.random()*100000);
overlay={globalDataType:"com.theplatform.pdk.data::Overlay",src:a,href:c,target:g,bannerWidth:(d*1),bannerHeight:(m*1),bannerSize:(d*m),stretchToFit:b[e].scalable==="true",guid:j};
this.processTrackingEvents(b[e].trackingEvents,overlay);
f.overlays.push(overlay)
}}},processTrackingEvents:function(f,e){if(f){var a=f.length;
i=0;
for(;
i<a;
i++){var g=f[i];
if(g.event=="creativeView"){if(g.urls){if(!e.impressionUrls){e.impressionUrls=[]
}var b=g.urls.length;
var d=0;
for(;
d<b;
d++){var c=g.urls[d];
e.impressionUrls.push(c.url)
}}}}}},processImpressions:function(c,b){if(b&&c&&c.length){if(!b.impressionUrls){b.impressionUrls=[]
}for(var a=0;
a<c.length;
a++){if(c[a].url){b.impressionUrls.push(c[a].url)
}}}},processMediaTrackingEvents:function(f,g){tpDebug("adding Tracking URLs",this.controller.id,"VAST");
if(!(f.trackingEvents&&f.trackingEvents.length)){return
}if(!g.trackingURLs){g.trackingURLs=[]
}for(var e=0;
e<f.trackingEvents.length;
e++){if(f.trackingEvents[e].event=="creativeView"){if(f.trackingEvents[e].urls){if(!g.impressionUrls){g.impressionUrls=[]
}var b=f.trackingEvents[e].urls.length;
var d=0;
for(;
d<b;
d++){var c=f.trackingEvents[e].urls[d];
if(c){g.impressionUrls.push(c.url)
}}}}var a=this.adTracking.getTrackingUrl(f.trackingEvents[e]);
if(a){g.trackingURLs.push(a)
}else{tpDebug("TrackingEvent "+f.trackingEvents[e].event+" not supported. Ignoring.",this.controller.id,"VAST")
}}},processVideoClicks:function(d,e){var c=d.videoClicks;
if(c){if(!e.moreInfo){e.moreInfo={globalDataType:"com.theplatform.pdk.data::HyperLink"};
e.moreInfo.clickTrackingUrls=[]
}if(this.allowClicks&&c.clickThrough&&c.clickThrough.length>0){e.moreInfo.href=c.clickThrough[0].url
}else{e.moreInfo.href=null
}if(this.allowClicks&&c.clickTracking){var b=0;
var a=c.clickTracking.length;
for(;
b<a;
b++){e.moreInfo.clickTrackingUrls.push(c.clickTracking[b].url)
}}}},_playlist:null,processMediaFiles:function(q,d,m,a,r,o){var s=null;
var n={};
var k,h;
var c;
for(k=0;
k<this.parentWrappers.length;
k++){c=this.parentWrappers[k];
this.processMediaTrackingEvents(c,n);
this.processVideoClicks(c,n);
this.processImpressions(c.impressions,n)
}if(d&&d.mediaFiles&&d.mediaFiles.length){n.releaseLength=d.duration;
if(d.mediaFiles&&d.mediaFiles.length){tpDebug("looping through MediaFiles");
var g=true;
var l;
if(this.mimeTypes&&this.mimeTypes.length){for(k=0;
k<this.mimeTypes.length;
k++){for(h=0;
h<d.mediaFiles.length;
h++){l=d.mediaFiles[h];
if(l&&this.isAllowedVideo(l)&&l.type==this.mimeTypes[k]){this.addVideoToBaseClip(l,n,g);
tpDebug("mediaFile["+h+"]: "+l.url);
g=false
}}}}else{for(k=0;
k<d.mediaFiles.length;
k++){l=d.mediaFiles[k];
if(l&&this.isAllowedVideo(l)){this.addVideoToBaseClip(l,n,g);
tpDebug("mediaFile["+h+"]: "+l.url);
g=false
}}}}}if(n.URL){if(d.adParameters){if(!n.contentCustomData){n.contentCustomData={}
}if(typeof d.adParameters.parameters!="string"){n.contentCustomData.adParameters=JSON.stringify(d.adParameters.parameters).replace(/\\n/g,"\n").replace(/\\"/g,'"')
}else{n.contentCustomData.adParameters=d.adParameters.parameters
}}this.processImpressions(r,n);
this.processMediaTrackingEvents(d,n);
this.processVideoClicks(d,n);
this.processCompanions(m,n);
this.processOverlays(a,n);
this.processExtensions(o,n);
var f=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(n);
f.baseClip=n;
n.guid=q;
f.pid=d.id;
f.length=n.releaseLength;
this._playlist.clips.push(f);
this._playlist.baseClips.push(n);
if(n.type==="application/x-shockwave-flash"){f.isExternal=true
}if(d.skipOffset){f.skipOffset=1000*Number(d.skipOffset)
}f.chapter={globalDataType:this.controller.getDataTypeName("Chapter")};
f.chapter.index=this._playlist.clips.length-1;
f.chapter.startTime=0;
f.chapter.endTime=d.duration;
f.chapter.length=d.duration;
f.chapter.aggregateLength=d.duration;
f.chapter.globalDataType="com.theplatform.pdk.data::Chapter";
f.title=this.currentTitle;
if(this._playlist.clips.length>1){var b=this._playlist.clips[this._playlist.clips.length-2];
f.chapter.aggregateStartTime=b.chapter.aggregateStartTime+b.chapter.endTime;
f.chapter.chapters=b.chapter.chapters;
f.chapter.chapters.isAggregate=true
}else{f.chapter.chapters={globalDataType:this.controller.getDataTypeName("ChapterList"),chapters:[],aggregateStartTime:0,aggregateLength:0};
f.chapter.aggregateStartTime=0
}f.chapter.chapters.chapters.push(f.chapter);
f.chapter.chapters.aggregateLength+=d.duration;
f.chapter.endTime=f.chapter.startTime+d.duration
}else{this.processCompanions(m,n);
this.processOverlays(a,n);
var p=false;
var e=this.controller.getCurrentPlaylist();
if(e&&e.clips&&e.clips.length){for(k=e.currentIndex+1;
k<e.clips.length;
k++){if(!e.clips[k].baseClip.isAd){if(!e.clips[k].baseClip.banners){e.clips[k].baseClip.banners=[]
}e.clips[k].baseClip.banners=e.clips[k].baseClip.banners.concat(n.banners);
e.clips[k].baseClip.overlays=e.clips[k].baseClip.overlays.concat(n.overlays);
this.controller.updateClip(e.clips[k]);
break
}}}}},isAllowedVideo:function(a){if(!a.url||a.url.length===0){return false
}if(this.mimeTypes.length===0){return true
}for(var b=0;
b<this.mimeTypes.length;
b++){if(this.mimeTypes[b]==a.type){return true
}}return false
},addVideoToBaseClip:function(a,d,c){var b={};
b.globalDataType="com.theplatform.pdk.data::FileInfo";
b.URL=a.url;
b.bitrate=a.bitrate;
b.width=a.width;
b.height=a.height;
b.type=a.type;
if(!d.possibleFiles){d.possibleFiles=[]
}d.possibleFiles.push(b);
if(c){d.defaultFI=b;
d.isAd=true;
d.noSkip=this.currentClip&&this.currentClip.baseClip?this.currentClip.baseClip.noSkip:true;
d.streamType="flashVideoUnknownMP4";
d.URL=a.url;
d.description=this.currentDescription;
d.type=a.type;
d.id=Math.floor(Math.random()*10000)+"";
d.globalDataType="com.theplatform.pdk.data::BaseClip"
}},processAd:function(a){if(!a){this.currentClip=null;
return
}if(a.adType=="InLine"){this.processInline(a)
}else{if(a.adType=="Wrapper"){this.processWrapper(a)
}}},processWrapperAdEvent:function(a){tpDebug("Processing wrapper tracking events");
this.parentWrappers.push(a)
},processWrapper:function(a){this.parentWrappers.push(a);
this.processVAST(a.vastAdData);
this.parentWrappers.pop()
},processInline:function(f){var e=this;
if(f.adTitle){this.currentTitle=f.adTitle
}if(f.description){this.currentDescription=f.description
}var d=f.video;
var a=f.companionAds;
var g=f.impressions;
var c=f.nonLinearAds;
if(!f.impressions){f.impressions=[]
}var h;
for(var b=0;
b<this.parentWrappers.length;
b++){h=this.parentWrappers[b];
f.impressions=f.impressions.concat(h.impressions)
}if(d){this.processMediaFiles(f.id,d,a,c,g,f)
}else{}},processExtensions:function(h,g){var c=function(l,m){if(!g.contentCustomData){g.contentCustomData={}
}g.contentCustomData[l]=m
};
var d=function(l){var n=[];
try{if(l.length){for(var m=0;
m<l.length;
m+=1){n.push(l[m].id)
}}}catch(o){}return n
};
var k=function(n){if(n){for(var l=0;
l<n.length;
l+=1){var o=n[l];
var m;
switch(o.type.toLowerCase()){case"linear":m=f;
break;
case"nonlinear":m=a;
break;
case"companion":m=b;
break
}if(m&&m.indexOf(o.id)!==-1){c(o.name,o.value)
}}}};
var f=d(h.video.mediaFiles);
if(h.video&&h.video.id){f.push(h.video.id)
}var a=d(h.nonLinearAds);
var b=d(h.companionAds);
if(h.extensions&&h.extensions.length){for(var e=0;
e<h.extensions.length;
e+=1){var j=h.extensions[e];
k(j.creativeParameters);
k(j.renditionParameters)
}}}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VMAPProcessor=$pdk.extend(function(){},{constructor:function(a){this.controller=a;
this._adBreaks=null;
this._ready=false
},ready:function(){return this._ready
},initialize:function(){this._adBreaks=null;
this._ready=false;
this._byPosition=false;
this._preRolls=[];
this._postRolls=[]
},process:function(c,e,f){if(!c||!c.adbreaks||c.adbreaks.length===0){tpDebug("No adbreaks found",this.controller.id,"VAST");
return
}this._adBreaks=c.adbreaks;
this._ready=true;
this._byPosition=this.isPositionOnly();
var d=[];
for(var a=0;
a<this._adBreaks.length;
a++){var b=this._adBreaks[a];
if(b.timeOffset=="start"||b.timeOffset<=1000||(this._byPosition&&b.timeOffset=="#1")){this._preRolls.push(b)
}else{if(b.timeOffset=="end"||Math.abs(e-b.timeOffset)<=1000){d.push(b)
}}}this._postRolls=d.concat(this.getAdsForPosition("#"+f))
},getPreRolls:function(){return this._preRolls
},getPostRolls:function(){return this._postRolls
},getMidRollsForOffset:function(d){if(!this._adBreaks){return null
}var c=[];
for(var a=0;
a<this._adBreaks.length;
a++){var b=this._adBreaks[a];
if(Math.abs(b.timeOffset-d)<1000){c.push(b)
}}return c
},getMidRollsForPosition:function(a){return this.getAdsForPosition(a)
},isPositionOnly:function(){if(!this._adBreaks||this._adBreaks.length===0){return false
}var b;
for(var a=0;
a<this._adBreaks.length;
a++){b=this._adBreaks[a];
if(!!(b.timeOffset+"").match(/^[0-9]+$/)){return false
}}return true
},getAdsForPosition:function(c){if(!this._byPosition||!this._adBreaks||this._adBreaks.length===0){return[]
}var a=[];
for(var b=0;
b<this._adBreaks.length;
b++){if(this._adBreaks[b].timeOffset==c){a.push(this._adBreaks[b])
}}return a
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTLoader=$pdk.extend(function(){},{WRAPPER_LIMIT:10,constructor:function(a,b,d,c){this.initialize();
this.wrapperDepth=c;
this.wrapper=d;
this.followAdditionalWrappers=a;
this.allowMultipleAds=b;
if(this.followAdditionalWrappers&&this.haveReachedWrapperLimit()){tpDebug(this.WRAPPER_LIMIT+" wrappers have been followed. This is the plugin limit.","","VAST",tpConsts.WARN);
this.followAdditionalWrappers=false
}tpDebug("VASTLoader instantiated.","","VMAP")
},initialize:function(a,b){this.success=null;
this.wrapper=null;
this.wrappers=0;
this.wrapperDepth=0;
if(arguments.length==2){this.followAdditionalWrappers=a;
this.allowMultipleAds=b
}},load:function(b,d,a){var c=this;
$pdk.plugin.vast.XMLLoader.getInstance().loadXML(b,function(e){var f;
if(e instanceof window.Document){tpRemoveWhiteSpace(e);
f=e
}else{if(e.xml){f=tpParseXml(e.xml)
}else{f=tpParseXml(e)
}}tpRemoveComments(f.childNodes[0]);
c.processAds(f.childNodes[0],d,a)
},function(){var e=true;
if(b.indexOf("empty-adslot:")<0){e=false
}a(e)
})
},processAds:function(f,n,a){var e=false;
if(!this.allowMultipleAds){e=this.chooseSingleAd(f)
}var k,p;
var l=false;
this.success=n;
this.failure=a;
this.xml=f;
if(!e){for(var d=0;
d<f.childNodes.length;
d++){k=f.childNodes[d];
if(!k.localName||k.localName.toLowerCase()!="ad"){f.removeChild(k);
d--;
continue
}if(k.childNodes&&k.childNodes.length==1){p=k.childNodes[0];
if(this.wrapper&&p.localName.toLowerCase()=="inline"){this.appendAdToWrapperAd(k,this.wrapper);
d--
}else{if(p.localName.toLowerCase()=="wrapper"){if(this.followAdditionalWrappers){var g;
for(var c=0;
c<p.childNodes.length;
c++){if(p.childNodes[c].localName.toLowerCase()=="vastadtaguri"){g=this.parseSimpleUrl(p.childNodes[c])
}}if(!g){a();
return
}g=g.replace("&amp;","&");
var o=this.followAdditionalWrappers;
if(p.attributes.followAdditionalWrappers&&p.attributes.followAdditionalWrappers.nodeValue){o=p.attributes.followAdditionalWrappers.nodeValue!=="false"
}var b=this.allowMultipleAds;
if(p.attributes.allowMultipleAds&&p.attributes.allowMultipleAds.nodeValue){b=p.attributes.allowMultipleAds.nodeValue!=="false"
}l=true;
this.wrappers++;
k.appendChild(document.createElement("VASTAdData"));
if(this.wrapper){this.appendAdToWrapperAd(k,this.wrapper);
d--
}var m=new $pdk.plugin.vast.VASTLoader(o,b,k,this.wrapperDepth+1);
var h=this;
m.load(g,function(j){h.check()
},function(){h.check()
})
}else{f.removeChild(k);
d--
}}}}}}if(l){}else{if(this.haveReachedWrapperLimit()){this.stripDeadEndWrapperBranch()
}if(f.childNodes.length>0){n(f)
}else{a()
}}},stripDeadEndWrapperBranch:function(){var d=this.wrapper,a=this.elementsByTagNameInsensitive(this.wrapper,"VASTAdData");
if(a&&a.length>0&&a.childNodes&&a.childNodes.length>0){}else{d=this.wrapper.parentNode;
while(d){if(d.localName.toLowerCase()=="vastaddata"){try{var b=this.getFirstWrapper(d.childNodes);
if(d.childNodes.length>1){d.removeChild(b);
break
}d.removeChild(b)
}catch(c){break
}}d=d.parentNode&&d.parentNode.localName?d.parentNode:undefined
}}},getFirstWrapper:function(a){for(var b=0;
b<a.length;
b++){if(a[b].childNodes[0].localName.toLowerCase()=="wrapper"){return a[b]
}}return null
},chooseSingleAd:function(d){var g,f,b,a;
var e=d.childNodes.length;
var c=false;
for(g=0;
g<e;
g++){b=d.childNodes[g];
if(b.childNodes&&b.childNodes.length==1){a=b.childNodes[0];
if(a.localName.toLowerCase()=="inline"&&!(b.attributes.sequence&&b.attributes.sequence.nodeValue)){c=true;
if(this.wrapper){this.appendAdToWrapperAd(b,this.wrapper)
}else{for(f=e;
f>0;
f--){if(d.childNodes[f-1]!==b){d.removeChild(d.childNodes[f-1])
}}}break
}}}if(!c){for(g=e;
g>0;
g--){b=d.childNodes[g-1];
if(b.childNodes&&b.childNodes.length==1){a=b.childNodes[0];
if(a.localName.toLowerCase()=="inline"){d.removeChild(b)
}}}}return c
},appendAdToWrapperAd:function(d,c){var a=this.elementsByTagNameInsensitive(c,"VASTAdData");
if(a&&a.length>0){this.elementsByTagNameInsensitive(c,"VASTAdData")[0].appendChild(d)
}else{var f=c.childNodes;
var e;
for(var g=0;
f.length;
g++){e=f[g];
if(e.localName.toLowerCase()=="vastaddata"){break
}e=undefined
}if(e){c.removeChild(e)
}var b=document.createElement("VASTAdData");
b.appendChild(d);
c.appendChild(b)
}},haveReachedWrapperLimit:function(){return this.wrapperDepth>=this.WRAPPER_LIMIT
},check:function(){this.wrappers--;
if(this.wrappers===0){if(this.xml.childNodes.length>0){this.success(this.xml)
}else{this.failure()
}}},elementsByTagNameInsensitive:function(a,b){var c=a.getElementsByTagName(b);
if(c&&c.length>0){return c
}return a.getElementsByTagName(b.toLowerCase())
},parseSimpleUrl:function(a){if(a&&a.nodeValue){return a.nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].nodeValue){return a.childNodes[0].nodeValue.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{if(a&&a.childNodes&&a.childNodes[0]&&a.childNodes[0].textContent){return a.childNodes[0].textContent.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm,"$2")
}else{return null
}}}},logXmlFromRoot:function(a){var b=a;
while(b){if(b.parentNode){b=b.parentNode
}else{break
}}}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.XMLLoader=$pdk.extend(function(){},(function(){var a=function(c,b){tpDebug(c,"","XMLLoader",b)
};
return{constructor:function(b){if($pdk.plugin.vast.XMLLoader._instance){this.loadXML=null;
throw"$pdk.plugin.vast.XMLLoader is a Singlton. Access via getInstance()"
}this.hosts=[];
for(var c=0;
c<b.length;
c++){this.hosts[b[c]]={withCredentials:true}
}$pdk.plugin.vast.XMLLoader._instance=this;
this.urlparser=document.createElement("a");
a("XMLLoader instantiated.")
},_hostSupportsCredentials:function(c,f,e){this.urlparser.href=c;
var d=this.urlparser.hostname;
var b=this;
if(this.hosts[d]){if(this.hosts[d].withCredentials){f()
}else{e()
}}else{b.hosts[d]={withCredentials:false};
e()
}},loadXML:function(d,e,c){var b=this;
this._hostSupportsCredentials(d,function(){b.doLoadXML(d,true,e,c)
},function(){b.doLoadXML(d,false,e,c)
})
},doLoadXML:function(b,g,l,c){var h=false;
var m=false;
var n;
if(b.indexOf("empty-adslot:")===0){c();
return
}a("Loading VMAP or VAST XML From url: "+b);
if(typeof XMLHttpRequest!=="undefined"&&"withCredentials" in new XMLHttpRequest()){n=new XMLHttpRequest()
}else{if(typeof XDomainRequest!=="undefined"){m=true;
n=new XDomainRequest();
a("Using XDomainRequest, since XMLHttpRequest isn't fully supported.")
}else{c("This browser does not support XMLHttpRequest or XDomainRequest.")
}}if(g&&n&&("withCredentials" in n)){try{n.withCredentials=true
}catch(d){a("Failed to set XMLHttpRequest's 'withCredentials' property to true; attempting to proceed anyway.",tpConsts.WARN)
}}else{}var k=this;
var f=function(){var p,o;
if(this.readyState===4&&this.status===200&&!h){h=true;
p=n.responseXML;
if(!p){p=n.responseText
}try{l(p)
}catch(q){a("Error parsing VMAP or VAST XML: "+p,tpConsts.ERROR);
c();
if(tpLogLevel=="debug"){throw q
}}}else{if(this.readyState===4&&this.status===404&&!h){h=true;
c()
}else{if(m&&!h){h=true;
try{l(n.responseText)
}catch(r){a("Error parsing Vast XML: "+n.responseText,tpConsts.WARN);
c();
if(tpLogLevel=="debug"){throw r
}}}}}};
if(m){n.onload=f
}else{n.onreadystatechange=f
}n.onerror=function(e){a("Error loading VMAP or VAST XML from url:"+b,tpConsts.WARN);
h=true;
c()
};
try{n.open("GET",b);
n.send(null);
setTimeout(function(){if(!h){h=true;
c()
}},5000)
}catch(j){a(j.message);
c()
}}}
}()));
$pdk.plugin.vast.XMLLoader.hosts=["pubads.g.doubleclick.net","ads.doubleclick.net"];
$pdk.plugin.vast.XMLLoader.getInstance=function(a){if(!$pdk.plugin.vast.XMLLoader._instance){$pdk.plugin.vast.XMLLoader._instance=new $pdk.plugin.vast.XMLLoader($pdk.plugin.vast.XMLLoader.hosts)
}return $pdk.plugin.vast.XMLLoader._instance
};
$pdk.plugin.vast.XMLLoader.getInstance();
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.AdTracking=$pdk.extend(function(){},{TRIGGER_TYPE_PERCENTAGE:0,TRIGGER_TYPE_MILLISECONDS:1,TRIGGER_TYPE_EVENT:2,EVENT_MUTE:0,EVENT_PAUSE:1,EVENT_REPLAY:2,EVENT_FULL_SCREEN:3,EVENT_STOP:4,EVENT_START:5,EVENT_UNPAUSE:6,EVENT_CLOSE:7,EVENT_UNMUTE:8,EVENT_ACCEPTINVITATION:9,EVENT_VIEWABILITY:12,EVENT_BREAK_START:13,EVENT_BREAK_END:14,constructor:function(){},getTrackingUrl:function(c){var b=c.event;
var a=c.urls[0].url;
switch(b.toLowerCase()){case"start":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,0);
case"firstquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,25);
case"midpoint":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,50);
case"thirdquartile":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,75);
case"mute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_MUTE);
case"unmute":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNMUTE);
case"pause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_PAUSE);
case"unpause":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"replay":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_REPLAY);
case"stop":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_STOP);
case"resume":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_UNPAUSE);
case"close":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_CLOSE);
case"complete":return this.setTracking(a,this.TRIGGER_TYPE_PERCENTAGE,100);
case"acceptinvitation":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_ACCEPTINVITATION);
case"viewable_impression":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_VIEWABILITY);
case"expand":case"fullscreen":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_FULL_SCREEN);
case"breakstart":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_BREAK_START);
case"breakend":return this.setTracking(a,this.TRIGGER_TYPE_EVENT,this.EVENT_BREAK_END);
default:return null
}},setTracking:function(b,c,d){var a={};
a.triggerType=c;
a.triggerValue=d;
a.URL=b;
a.hasFired=false;
a.globalDataType="com.theplatform.pdk.data::TrackingUrl";
return a
},fireVmapAdBreakEvent:function(a,d,c){var e=d.baseClip;
for(var b=0;
b<e.trackingURLs.length;
b++){if(e.trackingURLs[b].triggerType===this.TRIGGER_TYPE_EVENT&&e.trackingURLs[b].triggerValue===c&&!e.trackingURLs[b].hasFired){this.sendTrackingUrl(e.trackingURLs[b].URL);
e.trackingURLs[b].hasFired=true;
a.modClip(d)
}}return e
},sendTrackingUrl:function(a){if(a.indexOf("ord=")===-1){var d=100000+Math.floor(Math.random()*900001);
a+=(a.indexOf("?")===-1?"?":"&");
a+="ord="+d
}a+=(a.indexOf("?")===-1?"?":"&");
a+="source=pdk";
var c=new Image();
var b=this;
c.onload=function(f){b.completeHandler(f)
};
c.onerror=function(f){b.completeHandler(f)
};
c.src=a+"&"
},completeHandler:function(a){tpDebug("Tracking url sent: "+(a.target).src,"AdTracking",tpConsts.INFO)
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.BannerManager=$pdk.extend(function(){},{constructor:function(a,c,d){var b=this;
this.controller=a;
this.controller.addEventListener("OnMediaStart",function(f){b.onMediaStart(f)
});
this.controller.addEventListener("OnMediaEnd",function(f){b.onMediaEnd(f)
});
this.adTracking=d;
this.divs={};
this.map=c;
this.a={}
},onMediaStart:function(c){var b=c.data;
var d=b.baseClip.banners;
if(d){for(var a=0;
a<d.length;
a++){this.showBanner(d[a])
}}},onMediaEnd:function(c){var b=c.data;
var d=b.baseClip.banners;
if(d){for(var a=0;
a<d.length;
a++){}}},showBanner:function(b){if(!this.banners){this.banners=[]
}var g=this.getDivForBanner(b);
if(g){g.innerHTML="";
var e=document.createElement("a");
var c=document.createElement("img");
this.divs[b]=g;
this.a[b]=e;
if(b.src){c.src=b.src
}g.style["text-align"]="center";
var f=this;
e.href=b.href;
e.target="_blank";
e.style.position="relative";
e.appendChild(c);
e.onclick=function(){for(var h=0;
h<b.clickTracking.length;
h++){this.adTracking.sendTrackingUrl(b.clickTracking[h])
}};
g.appendChild(e);
if(b.impressionUrls){var a=b.impressionUrls.length;
var d=0;
for(;
d<a;
d++){this.adTracking.sendTrackingUrl(b.impressionUrls[d])
}}this.banners.push(b)
}},getDivForBanner:function(a){var c;
var b;
for(c in this.map){b=document.getElementById(c);
if(b){if(this.map[c].width===-1){this.map[c].width=b.offsetWidth
}if(this.map[c].height===-1){this.map[c].height=b.offsetHeight
}if(a.bannerWidth===this.map[c].width&&a.bannerHeight===this.map[c].height){return b
}}}for(c in this.map){if(a.bannerWidth<=this.map[c].width&&a.bannerHeight<=this.map[c].height){return document.getElementById(c)
}}for(c in this.map){return document.getElementById(c)
}return null
},layout:function(){if(this.banners){for(var a=0;
a<this.banners.length;
a++){this.doLayout(this.banners[a],this.divs[this.banners[a]],this.a[this.banners[a]])
}}},doLayout:function(a,c,b){if(a.bannerHeight){c.style.height=a.bannerHeight+"px";
b.style.height=a.bannerHeight+"px";
b.style.display="block"
}if(a.bannerWidth){c.style.width=a.bannerWidth+"px";
b.style.width=a.bannerWidth+"px"
}b.style.marginLeft="auto";
b.style.marginRight="auto";
c.style.width="100%"
},removeBanner:function(a){var c=this.getDivForBanner(a);
if(c){c.innerHTML=""
}for(var b=0;
this.banners&&b<this.banners.length;
b++){if(this.banners[b]==a){this.banners.splice(b,1);
break
}}},removeAllBanners:function(){this.banners=undefined
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.LayerManager=$pdk.extend(function(){},{constructor:function(c,b){var d=this;
this.controller=c;
this.container=b;
this.queue={};
this.timeouts={};
this.layers={};
this.ready={};
this.LOADER_SWF_LOAD_TIMEOUT=3000;
this.hasFlashComponentLayer=this.controller.component.videoengineruntime==="flash";
this.usingFlashComponentLayer=this.hasFlashComponentLayer;
var a=$pdk.env.Detect.getInstance().hasFlash();
if(this.usingFlashComponentLayer){b.style.visibility="hidden"
}else{if(a){this.controller.hasLayer=function(e,f){return(d.layers[f]!==undefined)
};
this.controller.loadLayer=function(h,k,e){if(h==="flash"){d.queue[k]=[];
d.ready[k]=false;
d.layers[k]=document.createElement("object");
d.layers[k].data=e;
d.layers[k].type="application/x-shockwave-flash";
d.layers[k].style.width="100%";
d.layers[k].style.height="100%";
d.layers[k].style.position="absolute";
var j=document.createElement("param");
j.name="movie";
j.value=e;
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="scale";
j.value="noscale";
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="salign";
j.value="tl";
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="bgcolor";
j.value=d.controller.getProperty("pageBackgroundColor");
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="menu";
j.value="false";
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="wmode";
j.value="transparent";
d.layers[k].appendChild(j);
j=document.createElement("param");
j.name="allowscriptaccess";
j.value="always";
d.layers[k].appendChild(j);
b.appendChild(d.layers[k]);
var g=0,f=100;
d.timeouts[k]=setInterval(function(){var l=0;
try{l=d.layers[k].PercentLoaded()
}catch(m){l=0
}if(l>=100){d.isReady(k);
clearInterval(d.timeouts[k])
}else{g++;
if(g*f>=d.LOADER_SWF_LOAD_TIMEOUT){clearInterval(d.timeouts[k])
}}},f)
}};
this.controller.callLayerFunction=function(g,e,f){if(d.ready[g]){if(d.layers[g]&&d.layers[g].callLayerFunction){return d.layers[g].callLayerFunction(g,e,f)
}}else{d.queue[g].push({id:g,func:e,params:f})
}}
}}},setLayerRuntime:function(a){this.usingFlashComponentLayer=false;
if(a==="flash"&&this.hasFlashComponentLayer){this.usingFlashComponentLayer=true
}},isReady:function(b){var a;
this.ready[b]=true;
while(this.queue[b].length){a=this.queue[b].shift();
this.controller.callLayerFunction(a.id,a.func,a.params)
}},hideLayers:function(){this.container.style.visibility="hidden"
},showLayers:function(){this.container.style.visibility=(this.usingFlashComponentLayer?"hidden":"inherit")
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.OverlayManager=$pdk.extend(function(){},{constructor:function(b,a,d){var c=this;
this.controller=b;
this.overlayLayer=a;
this.adTracking=d;
this.controller.addEventListener("OnOverlayAreaChanged",function(f){c.layout()
});
this.divs={};
this.a={}
},showOverlay:function(d){if(!this.overlays){this.overlays=[]
}var b=document.createElement("div");
b.className="tpOverlay";
if(d.guid){b.id="tpVastPlugInoverlay"+d.guid
}var f=document.createElement("a");
var c=document.createElement("img");
this.divs[d]=b;
this.a[d]=f;
if(d.src){c.src=d.src
}if(d.stretchToFit&&d.bannerHeight>d.bannerWidth){c.style.height="100%";
c.style.width="auto";
c.style.maxWidth="100%";
f.style.maxWidth=d.bannerWidth+"px"
}else{if(d.stretchToFit){c.style.width="100%";
c.style.height="auto";
c.style.maxWidth="100%";
f.style.maxWidth=d.bannerWidth+"px"
}}b.style.position="absolute";
b.style["text-align"]="center";
var g=this;
f.href=d.href;
f.target="_blank";
f.style.position="relative";
f.appendChild(c);
b.appendChild(f);
if(d.impressionUrls){var a=d.impressionUrls.length;
var e=0;
for(;
e<a;
e++){this.adTracking.sendTrackingUrl(d.impressionUrls[e])
}}this.doLayout(d,b,f);
this.overlays.push(d);
this.overlayLayer.appendChild(b);
var h=document.createElement("canvas");
if(h&&h.getContext&&h.getContext("2d")){h.width=15;
h.height=15;
h.style.position="absolute";
h.style.top="0";
h.style.right="0";
f.onclick=function(j){if(j.target!=h){g.controller.pause(true)
}};
h.onclick=function(){g.removeOverlay(d);
return false
};
this.drawCloseButton(h,"#"+this.controller.getProperty("controlframecolor").substr(2),"#"+this.controller.getProperty("controlbackgroundcolor").substr(2),"#"+this.controller.getProperty("controlcolor").substr(2));
f.appendChild(h)
}},layout:function(){if(this.overlays){for(var a=0;
a<this.overlays.length;
a++){this.doLayout(this.overlays[a],this.divs[this.overlays[a]],this.a[this.overlays[a]])
}}},doLayout:function(b,a,c){if(b.bannerHeight){a.style.height=b.bannerHeight+"px";
c.style.height=b.bannerHeight+"px";
c.style.display="block"
}a.style.width="100%";
c.style.width="100%";
c.style.marginLeft="auto";
c.style.marginRight="auto";
a.style.width="100%";
var d=this.controller.getOverlayArea();
a.style.top=((d.height-b.bannerHeight))+"px"
},drawCloseButton:function(c,e,d,b){var a=c.getContext("2d");
a.clearRect(0,0,15,15);
a.fillStyle=d;
a.strokeStyle=e;
a.fillRect(0,0,15,15);
a.strokeStyle=e;
a.moveTo(0,0);
a.lineTo(15,0);
a.lineTo(15,15);
a.lineTo(0,15);
a.lineTo(0,0);
a.stroke();
a.strokeStyle=b;
a.lineWidth=3;
a.moveTo(4,4);
a.lineTo(11,11);
a.moveTo(4,11);
a.lineTo(11,4);
a.stroke()
},removeOverlay:function(b){var a;
if(b.id){a=document.getElementById(b.id)
}else{a=document.getElementById("tpVastPlugInoverlay"+b.guid)
}if(a){this.overlayLayer.removeChild(a)
}for(var c=0;
this.overlays&&c<this.overlays.length;
c++){if(this.overlays[c]==b){this.overlays.splice(c,1);
break
}}},removeAllOverlays:function(){this.overlays=undefined;
this.overlayLayer.innerHTML=""
}});
$pdk.ns("$pdk.plugin.vast");
$pdk.plugin.vast.VASTPlugIn=$pdk.extend(function(){},{nextPercentage:null,_enablePods:false,VPAID_FLASH_MIMETYPE:"application/x-shockwave-flash",VPAID_JS_MIMETYPE:"application/javascript",mimeTypeTable:{f4m:"application/f4m+xml",m3u:"application/x-mpegURL",mpeg4:"video/mp4","mpeg-dash":"application/dash+xml",flv:"video/x-flv",qt:"video/quicktime",js:this.VPAID_JS_MIMETYPE,swf:this.VPAID_FLASH_MIMETYPE},skipOffsets:{},defaultTypes:["video/mp4"],overlayManager:null,bannerManager:null,constructor:function(){this.container=document.createElement("div");
this.container.style.display="";
this.container.style.width="100%";
this.overlayLayer=document.createElement("div");
this.overlayLayer.style.position="relative";
this.overlayLayer.style.display="";
this.container.appendChild(this.overlayLayer);
this.vpaidLayer=document.createElement("div");
this.vpaidLayer.style.position="absolute";
this.vpaidLayer.style.display="";
this.container.appendChild(this.vpaidLayer)
},onEnded:function(a){this.done()
},initialize:function(l){var m=this;
this.priority=l.priority;
this.controller=l.controller;
this.controller.registerAdPlugIn(this);
this.controller.registerPlaylistPlugIn(this);
this.controller.registerMetadataUrlPlugIn(this,this.priority);
this.hasFlash=$pdk.env.Detect.getInstance().hasFlash();
this._adTracking=new $pdk.plugin.vast.AdTracking();
this.layerManager=new $pdk.plugin.vast.LayerManager(this.controller,this.vpaidLayer);
this.overlayManager=new $pdk.plugin.vast.OverlayManager(this.controller,this.overlayLayer,this._adTracking);
this.enableVPAID=l.vars.enableVPAID!=="false";
this.enableJSVPAID=!$pdk.isIE9&&l.vars.enableJSVPAID!=="false";
this.enableFlashVPAID=l.vars.enableFlashVPAID!=="false";
var j=l.vars.hosts;
if(j&&j.length){this.hosts=j.split(",")
}var g=l.vars.acceptsCredentials;
if(g&&g.length){g=g.split(",");
$pdk.plugin.vast.XMLLoader.hosts=$pdk.plugin.vast.XMLLoader.hosts.concat(g)
}var e;
var n=l.vars.banners;
var p;
if(n){var f=n.split(",");
var a;
if(f){p={};
for(e=0;
e<f.length;
e++){n=f[e];
a=n.split(":");
if(a&&a.length===2&&a[1].indexOf("x")>0){p[a[0]]={width:parseInt(a[1].split("x")[0],10),height:parseInt(a[1].split("x")[1],10)}
}else{if(a&&a.length===1){var d=null;
p[a[0]]={width:d?d.clientWidth:-1,height:d?d.clientHeight:-1}
}}}}}this.bannerManager=new $pdk.plugin.vast.BannerManager(this.controller,p,this._adTracking);
this.mimeTypes=[];
if(this.controller.getProperty("formats")){var o=this.controller.getProperty("formats").split(",");
var k;
for(e=0;
e<o.length;
e++){k=this.mimeTypeTable[o[e].toLowerCase()];
if(k){this.mimeTypes.push(k)
}}for(e=0;
e<this.defaultTypes.length;
e++){if(this.mimeTypes.indexOf(this.defaultTypes[e])==-1){this.mimeTypes.push(this.defaultTypes[e])
}}}else{this.mimeTypes=this.defaultTypes.concat()
}var b=l.vars.mimeType;
if(b){this.mimeTypes.push(b)
}else{b=l.vars.mimeTypes;
if(b){this.mimeTypes=this.mimeTypes.concat(b.split(","))
}}if(this.enableVPAID&&this.enableFlashVPAID&&this.hasFlash&&this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE)<0){this.mimeTypes.unshift(this.VPAID_FLASH_MIMETYPE)
}if(this.enableVPAID&&this.enableJSVPAID&&this.mimeTypes.indexOf(this.VPAID_JS_MIMETYPE)<0){this.mimeTypes.unshift(this.VPAID_JS_MIMETYPE)
}if(this._isFlashFirefox()&&this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE)>-1){this.mimeTypes.splice(this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE),1)
}var h=l.vars.enablePods;
if(h&&h.toLowerCase()==="true"){this._enablePods=true
}var c=l.vars.allowClicks;
if(c&&c.toLowerCase()==="false"){this.allowClicks=false
}else{this.allowClicks=true
}this._vastLoader=new $pdk.plugin.vast.VASTLoader(true,true);
this._vastProcessor=new $pdk.plugin.vast.VASTProcessor(this.controller,this._enablePods,this.mimeTypes,this.allowClicks,this._adTracking);
this._vmapProcessor=new $pdk.plugin.vast.VMAPProcessor(this.controller);
this.controller.addEventListener("OnMediaAreaChanged",function(q){m.resizeMedia(q.data)
});
this.controller.addEventListener("OnOverlayAreaChanged",function(q){});
this.controller.addEventListener("OnMediaLoadStart",function(q){if(m._vpaidPlayer&&m._vpaidClip.id===q.data.id){m._vpaidPlayer.loadStart()
}m.currentClip=q.data;
m.nextPercentage=null
});
this.controller.addEventListener("OnMediaEnd",function(q){m.onEnded(q);
m.currentClip=null
});
this.controller.addEventListener("OnMediaStart",function(q){m.onMediaStart.apply(m,[q])
});
this.controller.addEventListener("OnMediaPlaying",function(q){if(m.currentPlaylistClip&&m.skipOffsets[m.currentPlaylistClip.id]&&!isNaN(m.skipOffsets[m.currentPlaylistClip.id])){if(q.data.currentTime>m.skipOffsets[m.currentPlaylistClip.id]){delete m.skipOffsets[m.currentPlaylistClip.id];
m.currentPlaylistClip.baseClip.noSkip=false;
m.controller.updateClip(m.currentPlaylistClip)
}}});
this.controller.addEventListener("OnMediaEnd",function(q){m.onMediaEnd.apply(m,[q])
});
this.controller.addEventListener("OnReleaseEnd",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnSetRelease",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnSetReleaseUrl",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnSetRelease",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnSetReleaseUrl",function(q){m.onReleaseEnd.apply(m,[q])
});
this.controller.addEventListener("OnLoadReleaseUrl",function(q){m.onReleaseEnd.apply(m,[q])
});
tpDebug("*** VAST plugin LOADED! ***")
},_isFlashFirefox:function(){return $pdk.isFirefox&&this.controller.component.videoengineruntime!=="flash"
},destroy:function(){},resizeMedia:function(a){this.mediaArea=a;
if(this._vpaidPlayer){this._vpaidPlayer.resize(a)
}},rewriteMetadataUrl:function(e,b){var d=/[&]+vpaid=[^&]*|vpaid=[^&]*[&]*/;
var c=e.replace(d,"");
var a=[];
if(this.mimeTypes.indexOf(this.VPAID_JS_MIMETYPE)>=0){a.push("script")
}if(this.mimeTypes.indexOf(this.VPAID_FLASH_MIMETYPE)>=0){a.push("flash")
}if(!b&&this.enableVPAID){if(a.length){c=[c,c.indexOf("?")>=0?"&":"?","vpaid="+a.join(",")].join("")
}}if(c!=e){this.controller.setMetadataUrl(c);
return true
}return false
},onMediaStart:function(f){var d=f.data;
var b=0;
if(d.baseClip.overlays&&d.baseClip.overlays.length){this.currentOverlays=d.baseClip.overlays
}if(!d.baseClip.isAd){if(this.originalClip&&this.originalClip.baseClip&&this.originalClip.baseClip.trackingURLs){this.originalClip=this._adTracking.fireVmapAdBreakEvent(this.controller,this.originalClip,this._adTracking.EVENT_BREAK_END)
}if(this.currentOverlays){for(b=0;
b<this.currentOverlays.length;
b++){var a=this.currentOverlays[b];
this.overlayManager.showOverlay(a);
var c=this;
setTimeout(function(){c.overlayManager.removeOverlay(a)
},15000)
}}}else{if(d.baseClip.isAd){this.currentPlaylistClip=d;
if(!this.currentOverlays){this.currentOverlays=[]
}if(d.baseClip.overlays){this.currentOverlays=this.currentOverlays.concat(d.baseClip.overlays.concat())
}}}},onMediaEnd:function(b){var a=b.data;
if(!a.baseClip.isAd){this.currentOverlays=[];
this.overlayManager.removeAllOverlays()
}},onReleaseEnd:function(a){if(typeof this.originalClip!="undefined"&&typeof this.originalClip.baseClip!="undefined"){if(this.originalClip.baseClip.trackingURLs){this.originalClip=this._adTracking.fireVmapAdBreakEvent(this.controller,this.originalClip,this._adTracking.EVENT_BREAK_END)
}}this.overlayLayer.innerHTML="";
this.currentOverlays=[]
},replacePlaylist:function(d){var b;
var a;
if(d.metaTags){for(var c=0;
c<d.metaTags.length;
c++){if(d.metaTags[c].name=="adPlaylistUrl"){b=d.metaTags[c].content;
if(d.metaTags.length>c+1){a=d.metaTags[c+1].content
}break
}}}if(b){this.doLoadVMAP(d,b,a);
return true
}else{return false
}},doLoadVMAP:function(d,b,a){var c=this;
b=this.doUrlSubstitutions(b);
$pdk.plugin.vast.XMLLoader.getInstance().loadXML(b,function(q){if(!c._playlistProcessor){c._playlistProcessor=new $pdk.plugin.vast.PlaylistProcessor(c.controller.scopes,c._adTracking)
}var e=$pdk.plugin.vast.VMAPParser.getInstance();
var m=d.chapters.aggregateLength;
result=e.parse(q,m);
c._vmapProcessor.initialize();
c._vmapProcessor.process(result,m,d.chapters.chapters?d.chapters.chapters.length+1:2);
var s=c._vmapProcessor.getPreRolls();
var f;
var p=c._vmapProcessor.getPostRolls();
var l=d.clips.length-1;
var g;
var k=this.currentClip&&this.currentClip.baseClip?this.currentClip.baseClip.noSkip:true;
var o;
var h;
if(p&&p.length){for(o=0;
o<p.length;
o++){h=p[o].trackingEvents;
g=c._playlistProcessor.createClip(p[o].adTagUri,"VAST Ad","",true,k,"application/vast+xml",h);
g.baseClip.trackingData=""+p[o].allowMultipleAds+"|"+p[o].followRedirects;
c._playlistProcessor.splice(d,l+o+1,0,g)
}}var r=!c._vmapProcessor.isPositionOnly();
for(var n=l;
n>0;
n--){f=r?c._vmapProcessor.getMidRollsForOffset(d.clips[n].startTime):c._vmapProcessor.getMidRollsForPosition("#"+(n+1));
if(f&&f.length){for(o=0;
o<f.length;
o++){h=f[o].trackingEvents;
g=c._playlistProcessor.createClip(f[o].adTagUri,"VAST Ad","",true,k,"application/vast+xml",h);
g.baseClip.trackingData=""+f[o].allowMultipleAds+"|"+f[o].followRedirects;
c._playlistProcessor.splice(d,n+o,0,g)
}}}if(s&&s.length){for(o=0;
o<s.length;
o++){h=s[o].trackingEvents;
g=c._playlistProcessor.createClip(s[o].adTagUri,"VAST Ad","",true,k,"application/vast+xml",h);
g.baseClip.trackingData=""+s[o].allowMultipleAds+"|"+s[o].followRedirects;
c._playlistProcessor.splice(d,o,0,g)
}}c.controller.playlistReplaced(d)
},function(){if(a){c.doLoadVMAP(d,a,null)
}else{c.controller.playlistReplaced(d)
}})
},isAd:function(a){return(this.isVastUrl(a.URL)||this.isVastUrl(a.baseURL))
},checkAd:function(e){var a=(!e.mediaLength||e.mediaLength<=0)&&(this.isVastUrl(e.baseClip.URL)||e.baseClip.type=="application/vast+xml")||e.baseClip.type=="application/vmap+xml";
var d=this;
if(a){if(!e.baseClip.type||e.baseClip.type&&(e.baseClip.type.toLowerCase()==="application/xml"||e.baseClip.type.toLowerCase()==="application/vast+xml"||e.baseClip.type.toLowerCase()==="text/xml")){this._vastProcessor.initialize()
}else{return false
}this.currentClip=e;
this.originalClip=e;
if(e.baseClip.trackingURLs){e.baseClip=this._adTracking.fireVmapAdBreakEvent(this.controller,this.originalClip,this._adTracking.EVENT_BREAK_START)
}var b=true;
var f=true;
if(e.baseClip.trackingData&&e.baseClip.trackingData.indexOf("|")>=0){b=e.baseClip.trackingData.split("|")[0]=="false"?false:true;
f=e.baseClip.trackingData.split("|")[1]=="false"?false:true
}if(e.baseClip.URL.indexOf("vmap-parser:")===0){var c=$pdk.plugin.vast.VMAPParser.getInstance().getVASTResponse(e.baseClip.URL);
if(c){this._vastLoader.initialize(f,b);
this._vastLoader.processAds(c,function(g){var h=$pdk.plugin.vast.VASTParser.getInstance();
result=h.parse(g);
setTimeout(function(){d.processVAST(result)
},1)
},function(){setTimeout(function(){d.vastError()
},1)
})
}else{setTimeout(function(){d.vastError()
},1)
}return true
}setTimeout(function(){d._vastLoader.initialize(f,b);
d._vastLoader.load(d.doUrlSubstitutions(e.baseClip.URL),function(g){var h=$pdk.plugin.vast.VASTParser.getInstance();
result=h.parse(g);
d.processVAST(result)
},function(g){d.vastError(g)
})
},1);
return true
}else{if(this.isCompatibleWithVpaid(e)){if(!this._vpaidPlayer){this._vpaidPlayer=new $pdk.plugin.vpaid.player.VPAIDPlayer(this.controller,this.vpaidLayer,this.layerManager,this._adTracking)
}this._vpaidClip=e;
this.layerManager.setLayerRuntime(e.baseClip.type===this.VPAID_FLASH_MIMETYPE?"flash":"html5");
if(this._vpaidPlayer.active()){e.streamType="empty";
this.controller.modClip(e);
this._vpaidPlayer.cancel(function(){d._vpaidPlayer.initVPAIDAd(e,d.mediaArea)
})
}else{this._vpaidPlayer.initVPAIDAd(e,this.mediaArea)
}return false
}}return false
},isCompatibleWithVpaid:function(a){return((a.baseClip.type===this.VPAID_FLASH_MIMETYPE)&&(this.hasFlash))||a.baseClip.type===this.VPAID_JS_MIMETYPE
},doUrlSubstitutions:function(a){var b=document.location.href;
if($pdk.parentUrl){b=$pdk.parentUrl
}var c=this.controller.getMediaArea();
a=a.replace(/\[timestamp\]/gi,(new Date()).getTime());
a=a.replace(/\[page_url\]/gi,escape(b));
a=a.replace(/\[player_width\]/gi,c.width);
a=a.replace(/\[player_height\]/gi,c.height);
a=a.replace(/\[player_dimensions\]/gi,c.width+"x"+c.height);
a=a.replace(/\[hostname\]/gi,document.location.hostname);
a=a.replace(/\[domain\]/gi,document.location.hostname.split(".").slice(1).join("."));
return a
},processVAST:function(a){if(a){var b=this;
if(a.ads){this._vastProcessor.process(a,function(c){b.vastSuccess(c)
},function(){b.vastError()
})
}else{this.vastError()
}}else{this.vastError()
}},vastError:function(a){if(a){tpDebug("VAST Error. Resuming content.",this.controller.id,"VAST")
}this.currentClip=null;
if(!this.didFailover()){this.controller.setAds(null)
}},vastSuccess:function(b){tpDebug("VAST Success. Play ads.",this.controller.id,"VAST");
for(var a=0;
a<b.clips.length;
a++){this.skipOffsets[b.clips[a].id]=b.clips[a].skipOffset
}if(b.clips.length>0||!this.didFailover()){tpDebug(b.clips.length+" clips to be played",this.controller.id,"VAST");
this.controller.setAds(b)
}},didFailover:function(){if(this.originalClip.baseClip.failOverClips&&this.originalClip.baseClip.failOverClips.length>0){var a=this;
var b=com.theplatform.pdk.SelectorExported.getInstance(this.controller.scopes.toString()).parseClip(a.originalClip.baseClip.failOverClips[0]);
b.baseClip=a.originalClip.baseClip.failOverClips[0];
b.length=a.originalClip.baseClip.failOverClips[0].releaseLength;
b.baseClip.failOverClips=a.originalClip.baseClip.failOverClips.concat();
b.baseClip.failOverClips.shift();
setTimeout(function(){a.checkAd(b)
},1);
return true
}return false
},done:function(){this.overlayManager.removeAllOverlays()
},isVastUrl:function(a){if(!a||!this.hosts||this.hosts.length===0){return false
}for(var b=0;
b<this.hosts.length;
b++){if(a.match(this.hosts[b])){return true
}}return false
},log:function(a){}});
var vastPlugIn=new $pdk.plugin.vast.VASTPlugIn();
tpController.plugInLoaded(vastPlugIn,vastPlugIn.container);
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.plugin.vpaid.player.EndingErrorTimer=$pdk.extend(function(){},(function(){var f=1000,g=2000;
var a,d;
function c(l){a=l
}function k(){j()
}function h(){a("The VPAID content failed to end after "+g+"ms.")
}function e(l){if(l>0&&l<=f){b()
}}function b(){if(!d){d=setTimeout(h,g)
}}function j(){if(d){clearTimeout(d);
d=null
}}return{constructor:c,handleAdPlaying:e,stop:j,destroy:k}
}()));
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.plugin.vpaid.player.PdkNoopPlayer=$pdk.extend(function(){},(function(){var a=false;
var c={};
function d(){}function e(f){tpDebug("Adding Playback Listeners for NoOp control.");
c._onPlayerPauseListener=f._onPlayerPauseListener;
c._onPlayerUnpauseListener=f._onPlayerUnpauseListener;
c._onVolumeChangeListener=f._onVolumeChangeListener;
c._onMuteListener=f._onMuteListener;
c._onResetPlayerListener=f._onResetPlayerListener;
c._onMediaEndListener=f._onMediaEndListener;
if(a===false){f._controller.addEventListener("OnPlayerPause",function(g){c._onPlayerPauseListener(g)
});
f._controller.addEventListener("OnPlayerUnPause",function(g){c._onPlayerUnpauseListener(g)
});
f._controller.addEventListener("OnVolumeChange",function(g){c._onVolumeChangeListener(g)
});
f._controller.addEventListener("OnMute",function(g){c._onMuteListener(g)
});
f._controller.addEventListener("OnResetPlayer",function(g){c._onResetPlayerListener(g)
});
f._controller.addEventListener("OnMediaEnd",function(g){c._onMediaEndListener(g)
});
a=true
}}function b(){tpDebug("Removing Playback Listeners for NoOp control.");
c._onPlayerPauseListener=d;
c._onPlayerUnpauseListener=d;
c._onVolumeChangeListener=d;
c._onMuteListener=d;
c._onResetPlayerListener=d;
c._onMediaEndListener=d
}return{_controller:null,_volumeSetCallback:null,_muteSetCallback:null,_pauseSetCallback:null,_onPlayerPauseListener:null,_onPlayerUnpauseListener:null,_onVolumeChangeListener:null,_onMuteListener:null,_active:false,constructor:function(f,h){this._controller=f;
this._seekSetCallback=h.mediaSeekSet;
this._volumeSetCallback=h.mediaSoundLevelSet;
this._muteSetCallback=h.mediaMuteSet;
this._pauseSetCallback=h.mediaPauseSet;
this._endSetCallback=h.mediaEndSet;
this._closeSetCallback=h.mediaCloseSet;
var g=this;
this._onPlayerUnpauseListener=function(){g._onPlayerUnpause.apply(g,arguments)
};
this._onPlayerPauseListener=function(){g._onPlayerPause.apply(g,arguments)
};
this._onVolumeChangeListener=function(){g._onVolumeChange.apply(g,arguments)
};
this._onMuteListener=function(){g._onMute.apply(g,arguments)
};
this._onResetPlayerListener=function(){g._onResetPlayer.apply(g,arguments)
};
this._onMediaEndListener=function(){g._onMediaEnd.apply(g,arguments)
}
},activate:function(f){this._active=true;
this._clip=f;
this._chapters=(f.chapter?f.chapter.chapters:null);
e(this)
},deactivate:function(){this._active=false;
b()
},mediaStarts:function(){if(this._active){this.removeChapters();
this._controller.dispatchEvent("OnMediaStart",this._clip);
this.addChapters()
}},mediaPause:function(g){if(this._active){var f={globalDataType:"com.theplatform.pdk.data::MediaPause",userInitiated:false,clip:this._clip};
this.removeChapters();
if(g){this._controller.dispatchEvent("OnMediaPause",f)
}else{this._controller.dispatchEvent("OnMediaUnpause",f)
}this.addChapters()
}},mediaMute:function(f){if(this._active){var g=f;
this._controller.dispatchEvent("OnMute",g)
}},mediaPlaying:function(g){if(this._active){var f={currentTime:g,duration:this._clip.mediaLength,percentComplete:g/this._clip.mediaLength*100};
this._controller.dispatchEvent("OnMediaPlaying",f)
}},mediaEnds:function(){if(this._active){this._controller.trace("calling endMedia()","NoOpPlayer",tpConsts.INFO);
this.removeChapters();
this._controller.endMedia(this._clip);
this.addChapters()
}},mediaError:function(f){tpDebug(f,this._controller.id,"NoOpPlayer",tpConsts.WARN);
if(!this._active){this.removeChapters();
this._controller.endMedia();
this.addChapters()
}else{this.mediaEnds()
}},done:function(f){if(this._active){var g=this._controller;
var h=f;
var k=this;
setTimeout(function j(){k.log("on async, call endMedia");
k.controller.endMedia(h)
},10)
}},_onVolumeChange:function(f){if(this._active){this._volumeSetCallback(parseInt(f.data,10))
}},_onMute:function(f){if(this._active){this._muteSetCallback(f.data)
}},_onPlayerPause:function(g){var f="PdkNoopPlayer::onPlayerPause";
if(this._pauseSetCallback&&this._active){tpDebug(f+"- calling pauseSetCallback with True");
this._pauseSetCallback(true)
}},_onPlayerUnpause:function(g){var f="PdkNoopPlayer::onPlayerUnpause";
if(this._pauseSetCallback&&this._active){tpDebug(f+"- calling pauseSetCallback with False");
this._pauseSetCallback(false)
}},_onResetPlayer:function(){this._closeSetCallback()
},_onMediaEnd:function(){this._endSetCallback()
},dispose:function(){this.log("dispose");
this._controller=null;
this._volumeSetCallback=null;
this._muteSetCallback=null;
this._pauseSetCallback=null;
this._mediaPlayingCallback=null;
this._callbackScope=null;
this._currentReleasePlaylistAdClip=null;
this._onPlayerUnpauseListener=null;
this._onPlayerPauseListener=null;
this._onVolumeChangeListener=null;
this._onMuteListener=null
},removeChapters:function(){if(this._clip&&this._clip.chapter){this._clip.chapter.chapters=undefined
}},addChapters:function(){if(this._clip&&this._clip.chapter){this._clip.chapter.chapters=this._chapters
}},log:function(g,h){if(!h){h=tpConsts.DEBUG
}var f=this._controller?this._controller.id:"";
tpDebug(g,f,"NoOpPlayer",h)
}}
}()));
$pdk.ns("$pdk.plugin.vpaid.player");
$pdk.ns("$pdk.plugin.vpaid.VPAIDEvent");
$pdk.plugin.vpaid.VPAIDEvent.AdClickThru="AdClickThru";
$pdk.plugin.vpaid.VPAIDEvent.AdError="AdError";
$pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange="AdExpandedChange";
$pdk.plugin.vpaid.VPAIDEvent.AdImpression="AdImpression";
$pdk.plugin.vpaid.VPAIDEvent.AdLinearChange="AdLinearChange";
$pdk.plugin.vpaid.VPAIDEvent.AdLoaded="AdLoaded";
$pdk.plugin.vpaid.VPAIDEvent.AdLog="AdLog";
$pdk.plugin.vpaid.VPAIDEvent.AdPaused="AdPaused";
$pdk.plugin.vpaid.VPAIDEvent.AdPlaying="AdPlaying";
$pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange="AdRemainingTimeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdStarted="AdStarted";
$pdk.plugin.vpaid.VPAIDEvent.AdStopped="AdStopped";
$pdk.plugin.vpaid.VPAIDEvent.AdSkipped="AdSkipped";
$pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation="AdUserAcceptInvitation";
$pdk.plugin.vpaid.VPAIDEvent.AdUserClose="AdUserClose";
$pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize="AdUserMinimize";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete="AdVideoComplete";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile="AdVideoFirstQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint="AdVideoMidpoint";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoStart="AdVideoStart";
$pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile="AdVideoThirdQuartile";
$pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange="AdVolumeChange";
$pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange="AdSkippableStateChange";
$pdk.plugin.vpaid.player.VPAIDPlayer=$pdk.extend(function(){},{version:"VERSION_UNKNOWN",LOAD_TIMEOUT:6000,INIT_TIMEOUT:6000,START_TIMEOUT:6000,RESUME_TIMEOUT:6000,LOAD:"load",INIT:"init",START:"start",RESUME:"resume",NONE:"none",_controller:null,_scrubberTimer:null,_soundLevel:null,_muted:false,_position:0,_currentAd:null,_clip:null,_mediaArea:null,_active:false,_pauseState:false,_loadPercentage:0,_useRemainingTime:false,_linearPending:false,_loadStartChecked:false,_waitingForPossibleIndecisiveLinearAd:false,_injectionPending:false,_adVideoStarted:false,_adVideoStarting:false,_adVideoComplete:false,_adStarted:false,_adStopped:false,_adLoading:false,_adLoaded:false,_adExpanded:false,_isLinearNonVideoAd:false,_adWrapper:null,_errorTimer:null,_errorStage:this.NONE,_loadStartCalled:false,_volume:1,_layerManager:null,constructor:function(b,a,e,f){this._controller=b;
this._container=a;
this._layerManager=e;
this._adTracking=f;
tpConsts.StreamType={};
tpConsts.StreamType.EMPTY="empty";
var d=this;
this._controller.trace=function(h,g,j){tpDebug(h,d._controller.widgetId,g,j)
};
this._controller.addEventListener("OnReleaseEnd",function(g){d.handleReleaseEnd(g)
});
this._controller.addEventListener("OnClearCurrentRelease",function(g){d.handleClearCurrentRelease(g)
});
this._controller.addEventListener("OnResetPlayer",function(g){d.handleClearCurrentRelease(g)
});
this._controller.addEventListener("OnMediaEnd",function(g){d.handleMediaEnd(g)
});
this._controller.addEventListener("OnShowFullScreen",function(g){d.handleShowFullScreen(g)
});
var c={mediaEndSet:function(){d.requestMediaEnd()
},mediaCloseSet:function(){d.requestMediaClose()
},mediaSeekSet:function(g){d.requestMediaSeek(g)
},mediaPauseSet:function(g){d.requestMediaPause(g)
},mediaMuteSet:function(g){d.requestMediaMute(g)
},mediaSoundLevelSet:function(g){d.requestMediaSoundLevel(g)
}};
this._noop=new $pdk.plugin.vpaid.player.PdkNoopPlayer(this._controller,c)
},active:function(){return this._active
},cancel:function(a){this._initCalled=false;
this._stopAdCallback=a;
if(this._loadStartCalled){this._stopAdCallback.loadStartCalled=true
}this.stopAd()
},requestMediaClose:function(){this._controller.trace("requestMediaClose: calling stopAd","VPAID",tpConsts.INFO);
this.stopAd()
},requestMediaEnd:function(){this._controller.trace("requestMediaEnd: calling stopAd","VPAID",tpConsts.INFO);
this.stopAd()
},requestMediaSeek:function(a){},requestMediaPause:function(a){if(a){this._adWrapper.pauseAd()
}else{this._adWrapper.resumeAd()
}},requestMediaMute:function(b){if(b==this._muted){return
}if(this._ignoreMute){return
}setTimeout(function(){a._ignoreMute=false
},500);
this._ignoreMute=true;
this._muted=b;
var a=this;
if(b&&this._volume!==0){this._volume=0;
this._preMuteVolume=this._adWrapper.getAdVolume()||this._preMuteVolume;
if(this._preMuteVolume<0){this._preMuteVolume=1
}if(this._adWrapper){this._adWrapper.setAdVolume(0)
}}else{if(!b&&this._volume===0){this._volume=this._preMuteVolume;
if(this._adWrapper){this._adWrapper.setAdVolume(this._preMuteVolume)
}}}},requestMediaSoundLevel:function(a){this._volume=a;
this._adWrapper.setAdVolume(a)
},destroy:function(){return
},isVPAIDAd:function(b){var a=false;
if((b.type=="application/x-shockwave-flash"||b.type=="swf")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{if((b.type=="application/javascript"||b.type=="js")||(this._clip&&this._clip.baseClip.URL==b.URL)){a=true
}else{a=false
}}this._controller.trace("is this a VPAID ad? ["+b.type+": "+a+"]","VPAID",tpConsts.INFO);
return a
},initVPAIDAd:function(b,a){this._controller.trace("initVPAIDAd: "+b.URL);
if(!this.active()&&this.isVPAIDAd(b.baseClip)){this._active=true;
this._clip=b;
this._adStopped=false;
this._area=a;
this._pauseState=false;
this._initCalled=true;
if(this._clip.baseClip.type=="application/javascript"){this._jsAdWrapper=new $pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper(this._controller,this._container);
this._adWrapper=this._jsAdWrapper
}else{if(this._clip.baseClip.type=="application/x-shockwave-flash"){if(!this._swfAdWrapper){this._swfAdWrapper=new $pdk.plugin.vpaid.wrapper.FlashAdWrapper(this._controller,this._container)
}this._adWrapper=this._swfAdWrapper
}}if(this.isExternalVideoElement()){this._clip.isExternal=true;
this._controller.modClip(this._clip)
}this._controller.trace("loading the VPAID ad","VPAID",tpConsts.INFO);
if(b.baseClip.isOverlay){this._controller.trace("VPAID came from a NonLinear VAST element, skipping until injectPlaylist","VPAID",tpConsts.INFO);
b.baseClip.URL="";
b.streamType="empty";
this._controller.modClip(b);
this._linearPending=true
}else{b.streamType="empty";
this._controller.modClip(b);
this._controller.trace("Signing up to play this ad","VPAID",tpConsts.INFO);
this._adLoading=true
}if(this._loadStartCalled){this.loadStart()
}return true
}return false
},loadStart:function(){this._loadStartCalled=true;
if(this._stopAdCallback){this._stopAdCallback.loadStartCalled=true
}if(this._initCalled){this._layerManager.showLayers();
this.loadAd()
}},loadAd:function(){this._controller.trace("loadAd","VPAID",tpConsts.INFO);
this.startErrorStage(this.LOAD);
var b=this;
var a=this._clip.baseClip.isAd&&!this._clip.baseClip.isMid;
var c=this._isSSA(this._controller.getCurrentPlaylist());
this._adWrapper.loadAd(this._clip.baseClip.URL,function(){b.onLoaderCompleteHandler()
},function(d){b.onLoaderErrorHandler(d)
})
},_isSSA:function(b){if(b.metaTags){for(var a=0;
a<b.metaTags.length;
a++){if(b.metaTags[a].name==="manifestServiceUrl"){return true
}}}return false
},isExternalVideoElement:function(){if(this._adWrapper){return this._adWrapper.isExternalVideoElement()
}},onLoaderCompleteHandler:function(){this.endErrorStage();
var a=this._adWrapper.handshakeVersion("2.0");
this._controller.trace("handshake version: "+a,"VPAID",tpConsts.INFO);
if(a===null){this.mediaErrored("ad api has no handshake function; it's either not implemented correctly or implemented for a non-generalized framework that we don't understand")
}else{this.addVPaidHandlers();
this.doInitAd()
}},onLoaderErrorHandler:function(a){this.mediaErrored(a?a.toString():"unknown VPAID error.")
},handleReleaseEnd:function(a){this.cleanUp()
},handleClearCurrentRelease:function(a){this._noop.deactivate();
this._loadStartChecked=false;
this.cleanUp()
},beginVPAID:function(){var b=this._clip;
var a=this;
if(!b.baseClip.isAd){return
}else{if(b.streamType!="empty"){}else{if(b.baseClip.URL.indexOf(this._clip.baseClip.URL)!==0){this._controller.trace("Empty stream type, but not from this plug-in; ignore","VPAID",tpConsts.INFO)
}else{if(this._adWrapper&&(this._adWrapper.getAdLinear()||this._adVideoStarting)){this._controller.trace("ad is linear, starting playback...","VPAID",tpConsts.INFO);
this._controller.trace("Opening NoOp Bridge","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
if(this._linearPending){this._linearPending=false;
setTimeout(function(){a.doStartAdVideo()
},1)
}this._controller.trace("URL is "+b.baseClip.URL+" handle it","VPAID",tpConsts.INFO);
this.playAd(b)
}else{this._controller.trace("ad is not linear, resuming content playback...","VPAID",tpConsts.INFO);
this._noop.activate(b);
this._loadStartChecked=true;
this._waitingForPossibleIndecisiveLinearAd=true;
setTimeout(function(){a._noop.mediaStarts(a._clip)
},1)
}}}}},resize:function(a,b){this._container.style.width=a.width+"px";
this._container.style.height=a.height+"px";
if(this._adWrapper){this._adWrapper.resizeAd(a.width,a.height,(b&&$pdk.isIOS?"fullscreen":"normal"))
}this._controller.trace("Positioning player at ["+a.x+", "+a.y+"], "+a.width+"w x "+a.height+"h","VPAID",tpConsts.INFO)
},handleShowFullScreen:function(b){var a=this._controller.getMediaArea();
if(a&&this._adWrapper){this.resize(a,b.data)
}},handleMediaEnd:function(a){if(this._adWrapper&&this._adWrapper.getAdLinear()&&this._adVideoStarted&&this._adWrapper.getAdRemainingTime()>=1){this._controller.trace("ending linear media from outside","VPAID",tpConsts.INFO);
this.stopAd()
}else{if(this._adWrapper&&this._adStarted&&!this._adVideoStarting&&!(a.data).isAd){this._controller.trace("ending ad and moving on to next chapter","VPAID",tpConsts.INFO);
this.stopAd()
}}},playAd:function(b){this._controller.trace("playAd","VPAID",tpConsts.INFO);
this._currentAd=b;
this.computeDuration();
this._controller.trace("Playing ad "+b.baseClip.URL+" duration: "+this._currentAd.mediaLength,"VPAID",tpConsts.INFO);
var a=this;
this._position=0;
this._loadPercentage=0
},doInitAd:function(){var a=null;
if(this._clip.baseClip.contentCustomData&&this._clip.baseClip.contentCustomData.adParameters){a=this._clip.baseClip.contentCustomData.adParameters
}if(!this._area){this._area=this._controller.getMediaArea()
}this.startErrorStage(this.INIT);
this._controller.trace("calling initAd("+this._area.width+", "+this._area.height+", normal, 300, "+a+", env)","VPAID",tpConsts.INFO);
this._adWrapper.initAd(this._area.width,this._area.height,"normal",($pdk.isIOS||$pdk.isAndroid?300:1500),a,null)
},doStartAdVideo:function(){this._controller.trace("Calling mediaStarts","VPAID",tpConsts.INFO);
if(!this._isLinearNonVideoAd){this._noop.mediaStarts(this._clip)
}this._isLinearNonVideoAd=false;
this._adVideoStarted=true;
this._adVideoStarting=false;
if(!this._muted){this._preMuteVolume=this._adWrapper.getAdVolume()
}this.startScrubberTimer()
},startAd:function(){this._controller.trace("calling startAd()","VPAID",tpConsts.INFO);
this._adLoading=false;
this._adLoaded=false;
this._loadStartCalled=false;
this._initCalled=false;
this._controller.trace("inserting VPAID ad. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.takeOverClip(this._clip);
this.beginVPAID();
this.endErrorStage();
this.startErrorStage(this.START);
this._adWrapper.startAd();
this.initEndingErrorTimer()
},adStarted:function(){this._adExpanded=this._adWrapper.getAdExpanded();
this.resize(this._area);
if(this._controller.getMuteState()){this._muted=true;
this._preMuteVolume=1;
this._adWrapper.setAdVolume(0)
}else{this._muted=false;
this._adWrapper.setAdVolume(this._volume)
}},scrubTick:function(){var b=1000*this._adWrapper.getAdRemainingTime();
if(!this._currentAd){return
}if(b>this._currentAd.mediaLength){this._currentAd.mediaLength=b;
this._currentAd.length=b;
this._currentAd.endTime=b;
this._controller.modClip(this._currentAd)
}if(b>0&&this._currentAd.mediaLength>0){this._position=this._currentAd.mediaLength-(b+500)
}else{this._position+=300
}if(this._currentAd.mediaLength>0&&this._position>=this._currentAd.mediaLength){this._controller.trace("Video portion of ad is done playing","VPAID",tpConsts.INFO)
}else{var a=this._currentAd.mediaLength-this._position;
if(this._position>=0&&a>0){this._controller.trace("Calling mediaPlaying("+this._position+") timeRemaining:"+a,"VPAID",tpConsts.DEBUG);
this._noop.mediaPlaying(this._position)
}this.triggerEndingErrorTimer(a)
}},linearComplete:function(a){if(this._adVideoComplete){return
}this._controller.trace("linear portion of ad is complete. endMedia: "+a,"VPAID",tpConsts.DEBUG);
if(this._currentAd&&this._currentAd.mediaLength){this._noop.mediaPlaying(this._currentAd.mediaLength)
}this._adVideoComplete=true;
if(a){this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate()
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},adComplete:function(){if((this._adVideoStarted||this._adVideoStarting)&&!this._adVideoComplete){this.mediaErrored("The VPAID ad ended unexpectedly, moving on.")
}else{this.cleanUp()
}},startErrorStage:function(a){this._errorStage=a;
var b=this;
switch(a){case this.LOAD:this._errorTimer=setTimeout(function(){b.loadError()
},this.LOAD_TIMEOUT);
break;
case this.INIT:this._errorTimer=setTimeout(function(){b.initError()
},this.INIT_TIMEOUT);
break;
case this.START:this._errorTimer=setTimeout(function(){b.startError()
},this.START_TIMEOUT);
break;
case this.RESUME:this._errorTimer=setTimeout(function(){b.resumeError()
},this.RESUME_TIMEOUT);
break
}},endErrorStage:function(){this._errorStage=this.NONE;
if(this._errorTimer){clearTimeout(this._errorTimer)
}this._errorTimer=null
},loadError:function(){this.mediaErrored("The VPAID content failed to Load after ms:"+this.LOAD_TIMEOUT)
},initError:function(){this.mediaErrored("The VPAID content failed to Init after ms:"+this.INIT_TIMEOUT)
},startError:function(){this.mediaErrored("The VPAID content failed to Start after ms:"+this.START_TIMEOUT)
},resumeError:function(){this.mediaErrored("The VPAID content failed to Resume after ms:"+this.RESUME_TIMEOUT)
},addVPaidHandlers:function(){if(!this._adWrapper){return
}var a=this;
this.listeners={};
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdClickThru,this.listeners.adClickThru=function(c,d,b){a.handleAdClickThru(c,d,b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdError,this.listeners.adError=function(b){a.handleAdError(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange,this.listeners.adExpandedChange=function(b){a.handleAdExpandedChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdImpression,this.listeners.adImpression=function(b){a.handleAdImpression(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLinearChange,this.listeners.adLinearChange=function(b){a.handleAdLinearChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLoaded,this.listeners.adLoaded=function(b){a.handleAdLoaded(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLog,this.listeners.adLog=function(b){a.handleAdLog(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPaused,this.listeners.adPaused=function(b){a.handleAdPaused(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPlaying,this.listeners.adPlaying=function(b){a.handleAdPlaying(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange,this.listeners.adRemainingTimeChange=function(b){a.handleAdRemainingTimeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStarted,this.listeners.adStarted=function(b){a.handleAdStarted(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStopped,this.listeners.adStopped=function(b){a.handleAdStopped(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkipped,this.listeners.adSkipped=function(b){a.handleAdSkipped(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation,this.listeners.adUserAcceptInvitation=function(b){a.handleAdUserAcceptInvitation(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserClose,this.listeners.adUserClose=function(b){a.handleAdUserClose(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize,this.listeners.adUserMinimize=function(b){a.handleAdUserMinimize(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete,this.listeners.adVideoComplete=function(b){a.handleAdVideoComplete(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile,this.listeners.adVideoFirstQuartile=function(b){a.handleAdVideoFirstQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint,this.listeners.adVideoMidPoint=function(b){a.handleAdVideoMidpoint(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoStart,this.listeners.adVideoStart=function(b){a.handleAdVideoStart(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile,this.listeners.adVideoThirdQuartile=function(b){a.handleAdVideoThirdQuartile(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange,this.listeners.adVolumeChange=function(b){a.handleAdVolumeChange(b)
});
this._adWrapper.addEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange,this.listeners.adSkippableStateChange=function(b){a.handleAdSkippableStateChange(b)
})
},removeVPaidHandlers:function(){if(this.listeners){this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdClickThru,this.listeners.adClickThru);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdError,this.listeners.adError);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdExpandedChange,this.listeners.adExpandedChange);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdImpression,this.listeners.adImpression);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLinearChange,this.listeners.adLinearChange);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLoaded,this.listeners.adLoaded);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdLog,this.listeners.adLog);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPaused,this.listeners.adPaused);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdPlaying,this.listeners.adPlaying);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdRemainingTimeChange,this.listeners.adRemainingTimeChange);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStarted,this.listeners.adStarted);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdStopped,this.listeners.adStopped);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkipped,this.listeners.adSkipped);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserAcceptInvitation,this.listeners.adUserAcceptInvitation);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserClose,this.listeners.adUserClose);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdUserMinimize,this.listeners.adUserMinimize);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoComplete,this.listeners.adVideoComplete);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoFirstQuartile,this.listeners.adVideoFirstQuartile);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoMidpoint,this.listeners.adVideoMidPoint);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoStart,this.listeners.adVideoStart);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVideoThirdQuartile,this.listeners.adVideoThirdQuartile);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdVolumeChange,this.listeners.adVolumeChange);
this._adWrapper.removeEventListener($pdk.plugin.vpaid.VPAIDEvent.AdSkippableStateChange,this.listeners.adSkippableStateChange)
}},computeDuration:function(){if(!this._adWrapper||!this._currentAd){return
}var c;
var a=this._adWrapper.getAdRemainingTime();
var d=this._adWrapper.getAdDuration();
c=Math.max(d,a);
if(c>0){var b=c*1000;
this._currentAd.mediaLength=b;
this._currentAd.endTime=b;
this._currentAd.length=b;
this._controller.modClip(this._currentAd)
}},linearCheck:function(){if(this._adVideoStarting||this._adVideoStarted){}else{this._controller.trace("closing out empty clip since no ad started.","VPAID",tpConsts.INFO);
this._loadStartChecked=false;
this._noop.mediaEnds();
this._noop.deactivate();
this.cleanUp()
}},handleAdClickThru:function(f,g,b){var a=this._clip.baseClip.moreInfo||this._clip.moreInfo||null;
if(a&&a.clickTrackingUrls.length){a.clickTrackingUrls.forEach(function(e){this._adTracking.sendTrackingUrl(e)
}.bind(this))
}if(this._adLoaded||this._adStarted){var d;
if(typeof f==="object"){d=f
}else{if(typeof f==="string"){d={url:f,id:g,playerHandles:b}
}}this._controller.trace("handleAdClickThru "+(d?"url:"+d.url+" id:"+d.id+" playerHandles:"+d.playerHandles:"no data"),"VPAID",tpConsts.INFO);
if(d&&d.playerHandles){var c=null;
if(d.url!==""){c=d.url
}else{if(this._clip.baseClip.moreInfo&&this._clip.baseClip.moreInfo.href){c=this._clip.baseClip.moreInfo.href
}}if(c){window.open(c,"_blank")
}}this._controller.pause(true)
}},handleAdError:function(b){var a=(b&&b.message?b.message:(typeof b==="string"?b:"Unknown Error"));
if(!this._loadStartChecked){this._noop.activate(this._clip)
}this.mediaErrored("VPAID AdError: "+a);
this._controller.trace("handleAdError :"+a,"VPAID",tpConsts.INFO)
},handleAdExpandedChange:function(c){var b=this._adWrapper.getAdExpanded();
this._controller.trace("handleAdExpandedChange expanded:"+b,"VPAID",tpConsts.INFO);
var a=this._adStarted&&b!=this._adExpanded;
this._adExpanded=b;
if(!a){this._controller.trace("adExpanded unchanged, so do nothing.")
}else{if(b){this._controller.pause(true)
}else{this._controller.pause(false)
}}},handleAdImpression:function(a){this._controller.trace("handleAdImpression :","VPAID",tpConsts.INFO)
},handleAdLinearChange:function(b){if(this._adWrapper&&this._adStarted){var a=this._adWrapper.getAdLinear();
this._controller.trace("handleAdLinearChange : "+a,"VPAID",tpConsts.INFO);
if(!a){this.linearComplete(true)
}this.stopEndingErrorTimer()
}},handleAdLoaded:function(a){this._controller.trace("handleAdLoaded: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this._adLoaded=true;
this._adLoading=false;
this.startAd()
},handleAdLog:function(a){this._controller.trace(a,"AdLog",tpConsts.INFO)
},handleAdPaused:function(b){this._controller.trace("handleAdPaused","VPAID",tpConsts.INFO);
this._pauseState=true;
var a=this._adWrapper.getAdRemainingTime();
this._adPlayingCheck={_remainingTimeChangeEvents:0,_remainingTimeAtPause:a,test:function(c){this._remainingTimeChangeEvents++;
var d=this._remainingTimeAtPause-c;
return this._remainingTimeChangeEvents>1&&d>2
}};
this.stopScrubberTimer();
this._noop.mediaPause(true);
this.stopEndingErrorTimer()
},handleAdPlaying:function(b){this._controller.trace("handleAdPlaying","VPAID",tpConsts.INFO);
this._pauseState=false;
this._adPlayingCheck=undefined;
this.endErrorStage();
this._noop.mediaPause(false);
if(this._adVideoStarted){this.startScrubberTimer();
if(this._currentAd&&this._endingErrorTimer){var a=this._currentAd.mediaLength-this._position;
this._endingErrorTimer.handleAdPlaying(a)
}}},handleAdRemainingTimeChange:function(c){var b=this._adWrapper.getAdRemainingTime();
this._controller.trace("handleAdRemainingTimeChange : time remaining:"+b,"VPAID",tpConsts.INFO);
var a=this._adPlayingCheck?this._adPlayingCheck.test(b):false;
if(this._pauseState&&a){this.handleAdPlaying(c)
}this.computeDuration()
},handleAdStarted:function(b){this._controller.trace("handleAdStarted: adLinear = "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
this.endErrorStage();
this.adStarted();
this._adStarted=true;
this.computeDuration();
this._handlePossibleLinearNonVideoAd();
if(this._waitingForPossibleIndecisiveLinearAd){var a=this;
setTimeout(function(){a.linearCheck()
},100)
}},_handlePossibleLinearNonVideoAd:function(){var a=this;
this._isLinearNonVideoAd=false;
this._linearNonVideoAdTimeout=setTimeout(function(){if(!a._adVideoStarted){a.takeOverClip(a._clip);
a.beginVPAID();
a._noop.mediaStarts(a._clip);
a._isLinearNonVideoAd=true
}},1000)
},handleAdSkipped:function(a){this._controller.trace("handleAdSkipped","VPAID",tpConsts.INFO);
this.doStopAd()
},handleAdStopped:function(a){this._controller.trace("handleAdStopped","VPAID",tpConsts.INFO);
this.doStopAd()
},doStopAd:function(){if(!this._active){return
}if(!this._adVideoComplete&&(this._adVideoStarted||this._adVideoStarting)){this.linearComplete(true)
}this._adStopped=true;
this.adComplete();
this.stopEndingErrorTimer();
if(this._stopAdCallback){var b=this;
var a=this._stopAdCallback;
var c=function(){if(a.loadStartCalled){b._loadStartCalled=true
}a()
};
this._stopAdCallback=null;
setTimeout(c,100)
}},handleAdUserAcceptInvitation:function(a){this._controller.trace("handleAdUserAcceptInvitation","VPAID",tpConsts.INFO)
},handleAdUserClose:function(a){this._controller.trace("handleAdUserClose","VPAID",tpConsts.INFO)
},handleAdUserMinimize:function(a){this._controller.trace("handleAdUserMinimize :","VPAID",tpConsts.INFO)
},handleAdVideoComplete:function(a){this._controller.trace("handleAdVideoComplete :","VPAID",tpConsts.INFO);
this.linearComplete(true);
if(this._adWrapper&&!this._adWrapper.isExternalVideoElement()){this.doStopAd()
}},handleAdVideoFirstQuartile:function(a){this._controller.trace("handleAdVideoFirstQuartile :","VPAID",tpConsts.INFO);
if(this._pauseState){this.handleAdPlaying(a)
}},handleAdVideoMidpoint:function(a){this._controller.trace("handleAdVideoMidpoint","VPAID",tpConsts.INFO);
if(this._pauseState){this.handleAdPlaying(a)
}},handleAdVideoThirdQuartile:function(a){this._controller.trace("handleAdVideoThirdQuartile :","VPAID",tpConsts.INFO);
if(this._pauseState){this.handleAdPlaying(a)
}},handleAdVideoStart:function(b){this._controller.trace("handleAdVideoStart","VPAID",tpConsts.INFO);
if(this._waitingForPossibleIndecisiveLinearAd){this._waitingForPossibleIndecisiveLinearAd=false;
this._adLoading=false;
this._adVideoStarting=true;
this._controller.trace("inserting VPAID ad. linear: "+this._adWrapper.getAdLinear(),"VPAID",tpConsts.INFO);
var a=this;
if(!this._isLinearNonVideoAd){clearTimeout(this._linearNonVideoAdTimeout);
a.takeOverClip(this._clip);
a.beginVPAID()
}setTimeout(function(){a.doStartAdVideo()
},1)
}else{if(this._linearPending){this._adVideoStarting=true;
this._controller.trace("handleAdVideoStart: injecting","VPAID",tpConsts.INFO);
this._controller.injectPlaylist(this.createPlaylist(this.getNoOpClip(this._clip.baseClip)))
}else{this._controller.trace("handleAdVideoStart: starting","VPAID",tpConsts.INFO);
this.doStartAdVideo()
}}},handleAdVolumeChange:function(b){this._ignoreMute=false;
var a=this._adWrapper.getAdVolume();
if(a!==this._volume){this._volume=a;
if(a===0){this._noop.mediaMute(true)
}else{if(a!==0){this._noop.mediaMute(false)
}}}},handleAdSkippableStateChange:function(a){this._clip.baseClip.noSkip=!this._adWrapper.getAdSkippableState();
this._controller.updateClip(this._clip)
},startScrubberTimer:function(){if(!this._scrubberTimer){var a=this;
this._scrubberTimer=setInterval(function(){a.scrubTick()
},300)
}},stopScrubberTimer:function(){if(this._scrubberTimer){clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}},getNoOpClip:function(c){var b={};
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.title="";
b.URL=c.URL;
b.isAd=true;
b.noSkip=true;
b.releaseLength=c.releaseLength;
b.impressionUrls=c.impressionUrls;
b.type=c.type;
var a=com.theplatform.pdk.SelectorExported.getInstance(this._controller.scopes.toString()).parseClip(b);
a.streamType="empty";
a.title="";
a.hasOverlayLayer=true;
a.trackingURLs=this._clip.trackingURLs;
return a
},takeOverClip:function(a){var b=a.baseClip;
b.globalDataType="com.theplatform.pdk.data::BaseClip";
b.isAd=true;
b.noSkip=true;
this._controller.modBaseClip(a);
a.streamType="empty";
if(this.isExternalVideoElement()){a.isExternal=true
}a.hasOverlayLayer=true;
this._controller.modClip(a)
},createPlaylist:function(a){var b={};
b.globalDataType="com.theplatform.pdk.data::Playlist";
b.baseClips=[a.baseClip];
b.clips=[a];
return b
},mediaErrored:function(a){this.endErrorStage();
this._noop.mediaError(a);
this._noop.deactivate();
this._loadStartChecked=false;
this.cleanUp()
},cleanUp:function(){if(!this._clip){return
}this._controller.trace("cleanUp()","VPAID",tpConsts.INFO);
this._clip=null;
this._active=false;
if(this._adWrapper){this.removeVPaidHandlers();
if(!this._adStopped){this._controller.trace("calling stopAd()","VPAID",tpConsts.INFO);
this.stopAd()
}this._adWrapper.unloadAd()
}if(this._scrubberTimer){this._controller.trace("removing scrubber timer","VPAID",tpConsts.DEBUG);
clearInterval(this._scrubberTimer);
this._scrubberTimer=null
}clearTimeout(this._linearNonVideoAdTimeout);
this._layerManager.hideLayers();
this._linearPending=false;
this._waitingForPossibleIndecisiveLinearAd=false;
this._adStarted=false;
this._adStopped=false;
this._adLoaded=false;
this._adLoading=false;
this._adVideoStarted=false;
this._adVideoStarting=false;
this._adVideoComplete=false;
this._adWrapper=null;
this._isLinearNonVideoAd=false;
this._initCalled=false;
this._loadStartCalled=false;
this._scrubberTimer=null;
this._soundLevel=null;
this._muted=false;
this._position=0;
this._currentAd=null;
this._clip=null;
this._loadPercentage=0;
this._linearPending=false;
this._loadStartChecked=false;
this._waitingForPossibleIndecisiveLinearAd=false;
this._injectionPending=false;
this._adVideoStarted=false;
this._adVideoStarting=false;
this._adVideoComplete=false;
this._adStarted=false;
this._adStopped=false;
this._adLoading=false;
this._adLoaded=false;
this._adExpanded=false;
this._adPlayingCheck=undefined;
this.endErrorStage();
this.destroyEndingErrorTimer();
this._errorTimer=null;
this._errorStage=this.NONE
},initEndingErrorTimer:function(){var a=this;
this._endingErrorTimer=new $pdk.plugin.vpaid.player.EndingErrorTimer(function(b){tpDebug(b,a._controller.id,"VPAIDPlayer",tpConsts.WARN);
a.doStopAd()
})
},triggerEndingErrorTimer:function(a){if(this._endingErrorTimer){this._endingErrorTimer.handleAdPlaying(a)
}},stopEndingErrorTimer:function(){if(this._endingErrorTimer){this._endingErrorTimer.stop()
}},destroyEndingErrorTimer:function(){if(this._endingErrorTimer){this._endingErrorTimer.destroy();
this._endingErrorTimer=null
}},stopAd:function(){if(this._adWrapper){try{this._adWrapper.stopAd()
}catch(a){tpDebug("Got en error while calling stopAd on the VPAID ad.",this._controller.id,"VPAIDPlayer",tpConsts.WARN)
}}}});
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.nsapiComponentMap={};
$pdk.plugin.vpaid.wrapper.nsapiMessageDelegate=function(b,c,d,a){if($pdk.plugin.vpaid.wrapper.nsapiComponentMap[a]){$pdk.plugin.vpaid.wrapper.nsapiComponentMap[a].receiveMessage(b,c,d)
}};
$pdk.plugin.vpaid.wrapper.FlashAdWrapper=$pdk.extend(function(){},{constructor:function(b,a){this.controller=b;
this.listeners=[];
$pdk.plugin.vpaid.wrapper.nsapiComponentMap[b.id]=this;
if(!this.controller.hasLayer("flash",$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID)){this.controller.loadLayer("flash",$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL)
}},receiveMessage:function(a,b,c){if(a==="event"){this.dispatchEvent(b,c)
}else{if(a==="load"&&b==="success"){this.loadSuccess()
}else{if(a==="load"&&b==="failure"){this.loadFailure()
}}}},dispatchEvent:function(b,c){if(this.listeners[b]){for(var a=0;
a<this.listeners[b].length;
a++){this.listeners[b][a](c)
}}},isExternalVideoElement:function(){return true
},loadAd:function(b,c,a){this.loadSuccess=c;
this.loadFailure=a;
this.listeners=[];
this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"loadAd",[b,"$pdk.plugin.vpaid.wrapper.nsapiMessageDelegate",this.controller.id])
},unloadAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"unloadAd",[])
},addEventListener:function(a,b){if(!this.listeners[a]){this.listeners[a]=[]
}this.listeners[a].push(b)
},removeEventListener:function(a,b){},getAdLinear:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdLinear",[])
},getAdExpanded:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdExpanded",[])
},getAdRemainingTime:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdRemainingTime",[])
},getAdDuration:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdDuration",[])
},getAdVolume:function(){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"getAdVolume",[])
},setAdVolume:function(a){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"setAdVolume",[a])
},handshakeVersion:function(a){return this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"handshakeVersion",[a])
},initAd:function(d,a,b,c,f,e){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"initAd",[d,a,b,c,f,e])
},resizeAd:function(c,a,b){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resizeAd",[c,a,b])
},startAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"startAd",[])
},stopAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"stopAd",[])
},pauseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"pauseAd",[])
},resumeAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"resumeAd",[])
},expandAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"expandAd",[])
},collapseAd:function(){this.controller.callLayerFunction($pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID,"collapseAd",[])
}});
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_ID="vpaid-layer";
$pdk.plugin.vpaid.wrapper.FlashAdWrapper.FLASH_LAYER_URL=$pdk.scriptRoot+"/swf/VPAIDLoader.swf";
$pdk.ns("$pdk.plugin.vpaid.wrapper");
$pdk.plugin.vpaid.wrapper.JavaScriptAdWrapper=$pdk.extend(function(){},{constructor:function(b,a){this.controller=b;
this.iframe=document.createElement("iframe");
this.iframe.setAttribute("frameborder","0");
this.iframe.setAttribute("allowfullscreen","true");
this.iframe.setAttribute("scrolling","no");
this.iframe.style.position="absolute";
a.appendChild(this.iframe);
this.container=a;
if(this._supportsMultipleVideoTags()||this.controller.getProperty("videoEngineRuntime")==="flash"){this.video=document.createElement("video");
this.video.style.width="100%";
this.video.style.height="100%";
this.video.style.position="absolute";
a.appendChild(this.video);
this.isExternal=true
}else{this.video=this.controller.getVideoProxy()._ve.getPlaybackElement();
this.originalStyles=this.video.style.cssText;
this.isExternal=false
}},_supportsMultipleVideoTags:function(){if($pdk.isIOS||$pdk.isAndroid){return false
}else{return true
}},loadAd:function(b,e,a){var d=this;
this.iframe.onload=function(g){d.iframe.onload=null;
var f=d.iframe.contentWindow.getVPAIDAd;
if(f&&typeof f=="function"){d.VPAIDCreative=f();
if(d.checkVPAIDInterface(d.VPAIDCreative)){e()
}else{a()
}}else{a()
}};
var c='<html><head><script type="text/javascript">var inDapIF=false;<\/script><script type="text/javascript" src="'+b+'"><\/script></head><body></body></html>';
if(this.iframe.contentWindow){this.iframe.contentWindow.document.open();
this.iframe.contentWindow.document.write(c);
this.iframe.contentWindow.document.close()
}else{this.iframe.contentDocument.open();
this.iframe.contentDocument.write(c);
this.iframe.contentDocument.close()
}},unloadAd:function(){if(this.iframe.contentWindow){this.iframe.contentWindow.document.open();
this.iframe.contentWindow.document.write("<html></html>");
this.iframe.contentWindow.document.close()
}else{this.iframe.contentDocument.open();
this.iframe.contentDocument.write("<html></html>");
this.iframe.contentDocument.close()
}this.iframe.style.visibility="hidden";
this.container.removeChild(this.iframe);
if(this._supportsMultipleVideoTags()||this.controller.getProperty("videoEngineRuntime")==="flash"){this.container.removeChild(this.video)
}else{this.restoreVideoElementStyles()
}this.container.innerHTML=""
},restoreVideoElementStyles:function(){this.video.style.cssText=this.originalStyles;
this.video.style.zIndex="inherit"
},checkVPAIDInterface:function(a){if(a&&a.handshakeVersion&&typeof a.handshakeVersion=="function"&&a.initAd&&typeof a.initAd=="function"&&a.startAd&&typeof a.startAd=="function"&&a.stopAd&&typeof a.stopAd=="function"&&a.skipAd&&typeof a.skipAd=="function"&&a.resizeAd&&typeof a.resizeAd=="function"&&a.pauseAd&&typeof a.pauseAd=="function"&&a.resumeAd&&typeof a.resumeAd=="function"&&a.expandAd&&typeof a.expandAd=="function"&&a.collapseAd&&typeof a.collapseAd=="function"&&a.subscribe&&typeof a.subscribe=="function"&&a.unsubscribe&&typeof a.unsubscribe=="function"){return true
}return false
},subscribe:function(c,b,a){if(this.VPAIDCreative){this.VPAIDCreative.subscribe(c,b,a)
}},unsubscribe:function(b,a){if(this.VPAIDCreative){this.VPAIDCreative.unsubscribe(b,a)
}},addEventListener:function(b,c,a){this.subscribe(c,b,a)
},removeEventListener:function(a,b){this.unsubscribe(b,a)
},getAdLinear:function(){try{return this.VPAIDCreative.getAdLinear()
}catch(a){return true
}},getAdExpanded:function(){try{return this.VPAIDCreative.getAdExpanded()
}catch(a){return false
}},getAdRemainingTime:function(){try{return this.VPAIDCreative.getAdRemainingTime()
}catch(a){return -1
}},getAdDuration:function(){try{return this.VPAIDCreative.getAdDuration()
}catch(a){return -1
}},getAdVolume:function(){try{return this.VPAIDCreative.getAdVolume()
}catch(a){return -1
}},setAdVolume:function(a){try{this.VPAIDCreative.setAdVolume(a)
}catch(b){}},getAdSkippableState:function(){try{return this.VPAIDCreative.getAdSkippableState()
}catch(a){return false
}},handshakeVersion:function(a){return this.VPAIDCreative.handshakeVersion(a)
},initAd:function(d,a,b,c,g,f){if(!f){f={slot:this.container,videoSlot:this.video,videoSlotCanAutoPlay:true}
}var e={AdParameters:g};
this.VPAIDCreative.initAd(d,a,b,c,e,f)
},isExternalVideoElement:function(){return this.isExternal
},resizeAd:function(c,a,b){this.iframe.style.width=c+"px";
this.iframe.style.height=a+"px";
if(this.VPAIDCreative){try{this.VPAIDCreative.resizeAd(c,a,b)
}catch(d){}}},startAd:function(){this.VPAIDCreative.startAd()
},stopAd:function(){this.VPAIDCreative.stopAd()
},pauseAd:function(){this.VPAIDCreative.pauseAd()
},resumeAd:function(){this.VPAIDCreative.resumeAd()
},expandAd:function(){this.VPAIDCreative.expandAd()
},collapseAd:function(){this.VPAIDCreative.collapseAd()
}});