/*
 * Note: This is a specific implementation of basic QoS using
 * Google Analytics as the end point. It is not intended to be
 * configurable, beyond setting the G.A. account ID
 */
$pdk.ns("$pdk.plugin.gAnalytics");
$pdk.plugin.gAnalytics = $pdk.extend(function(){},
{
	VERSION : "1.0",
	_gaID: "",  		// GA account ID
	_firstChapter: null,
	_lastChapter: null,
	_playlist: null,
	_adObject: null,
	_position: 0,
	_isAd: false,
	_open: false,
	_loadComplete: false,
	_playbackSuccessful: true,
	_position: 0,
	_adPosition: 0,
	_totalAdTime: 0,
	_contentLength: 0,
	_seekStartPosition: 0,
	_seekedContent: 0,
	_Q1: 0,
	_Q2: 0,
	_Q3: 0,
	_Q4: 0,
	_runtime: "",
	_player: "",
	_cdn: "",
	_bufferingStartTime: 0,
	_bufferingTime: 0,
	_startupFailure: false,
	_completedVideo: false,
	_playStarted: false,
	_adStartTracked: false,
	_loadStartTime: null,
	_adCompleted: false,
	_previousPercentage: 0,
	_player: "",
	_timer: null,
	_timeInterval: 300000, //5 mins
	_isAggregate: false,
	_isAbsolute: false,
	_startTimeAbsolute: null,
	
	//Custom Metrics in Google Analytics
	_Q1Completed: 'metric1', //Metric to indicate 25% of content completed
	_bitRate: 'metric2', //bitrate of the content
	_exitBeforeStart: 'metric3', //Metric to indicate if the player was exited before starting/playing
	_successfulStartMetric: 'metric4', //If the content was started successfully
	_contentDuration: 'metric5', //Duration of the content that was watched
	_Q2Completed: 'metric6', //If 50% of content was watched
	_Q3Completed: 'metric7',//If 75% of content was watched
	_Q4Completed: 'metric8',//If 100% of content was watched
	_startupFailureMetric: 'metric9', //If the startup failed
	_completedVideoMetric: 'metric10', //If 95% of the video was watched
	_totalDuration: 'metric11', //Duration of content + the ads
	_startupTime: 'metric12', //Time to startup the content
	_completedAdMetric: 'metric13', //If 95% of the ad was watched
	_bufferingTimeMetric: 'metric14', //Buffering time
	_concurrentStreamMetric: 'metric15',
	_runtimeDimension: 'dimension1',
	_cdnDimension: 'dimension2',
	_playerDimension: 'dimension3',
	_Q1CompletedTracked: false,
	_Q2CompletedTracked: false,
	_Q3CompletedTracked: false,
	_Q4CompletedTracked: false,
	_endTracked: false,
	_percentageCompletedAggregate: 0,
	_successfulStart: false,
	_startTracked: false,
    
	constructor : function()
	{
       	tpDebug("GoogleAnalytics Plugin instantiated.");
	},

	/**
	 * Initialize the plugin with the load object
	 * @param lo load object
	 */
	initialize:function(lo)
	{
        var that = this;

        this._lo = lo;
        this._controller = this._lo.controller;
        this._runtime = this._controller.getProperty("videoEngineRuntime") || "html5";
        this._gaID = this._lo.vars['ID'];
		
		if (this._gaID == null || this._gaID.length == 0) {
			tpDebug("*** ERROR: missing GA account ID parameter");
			return;
		} else {
            tpDebug("GoogleAnalytics Plugin loading: " + this._controller);
		}
        
		
        // store the name of the Analytics object
        window.GoogleAnalyticsObject = 'ga';

        // check whether the Analytics object is defined
        if (!('ga' in window)) {
            // define the Analytics object
            window.ga = function() {
                // add the tasks to the queue
                window.ga.q.push(arguments);
            };

            // create the queue
            window.ga.q = [];
        }

        // store the current timestamp
        window.ga.l = (new Date()).getTime();
        ga('create', this._gaID, 'auto');
        
		var that = this;       
        this.registerListeners();
        tpScriptLoader.addScript("https://www.google-analytics.com/analytics.js", function() {that.gaScriptAdded()});
	},
	
	registerListeners: function() {
		// register listeners
        var me = this; 
        
        $pdk.controller.addEventListener("OnMediaStart", function(e) { 
		    me.onMediaStart(e); 
        });
        
        $pdk.controller.addEventListener("OnReleaseStart", function(e) { 
		    me.onReleaseStart(e); 
        });
           
        $pdk.controller.addEventListener("OnMediaLoadStart", function(e) { 
		    me.onMediaLoadStart(e); 
        });
			
        $pdk.controller.addEventListener("OnMediaPlaying", function(e) { 
            me.onMediaPlaying(e); 
        });
			
		$pdk.controller.addEventListener("OnMediaEnd", function(e) { 
			me.onMediaEnd(e);
		});
			
		$pdk.controller.addEventListener("OnMediaStart", function(e) {
			me.onMediaStart(e)
		});

		$pdk.controller.addEventListener("OnMediaSeekStart", function(e) {
		    me.onMediaSeekStart(e)
		});
		    
		$pdk.controller.addEventListener("OnMediaSeekComplete", function(e) {
		    me.onMediaSeekComplete(e)
		});
		
		$pdk.controller.addEventListener("OnMediaSkip", function(e) {
		    me.onMediaSkip(e)
		});

	    $pdk.controller.addEventListener("OnMediaBufferStart", function(e) {
		    me.onMediaBufferStart(e)
		});
		
		
        $pdk.controller.addEventListener("OnMediaBufferComplete", function(e) {
		    me.onMediaBufferStop(e)
		});
		    
		$pdk.controller.addEventListener("OnMediaError", function(e) {
		    me.onMediaError(e)
		});
		    
		$pdk.controller.addEventListener("OnReleaseEnd", function(e) {
		    me.onReleaseEnd(e)
		}); 
		
		window.addEventListener("unload", function(e) {
		    me.onReleaseEnd(e)
		}); 
	},

    gaScriptAdded: function() {			
		tpDebug(this, "GoogleAnalytics Loaded", tpConsts.INFO); 
    },
	
	initializeData: function() {
	    this._firstChapter = null;
        this._lastChapter = null;
        this._noOfAdStarts = 0;
        this._position = 0;
        this._isAd = false;
	    this._open = false;
	    this._loadComplete = false;
	    this._playbackSuccessful = true;
	    this._position = 0;
	    this._adPosition = 0;
	    this._totalAdTime = 0;
	    this._contentLengh = 0;
	    this._Q1 = 0;
	    this._Q2 = 0;
	    this._Q3 = 0;
	    this._Q4 = 0;
	    this._startupFailure = false;
	    this._completedVideo = false;
	    this._playStarted = false;
	    this._adStartTracked = false;
	    this._adCompleted = false;
	    this._bufferingTime = 0;
	    this._timer = null;
	    this._isAggregate = false;
	    this._isAbsolute = false;
	    this._startTimeAbsolute = null;
	    this._Q1CompletedTracked =  false;
	    this._Q2CompletedTracked =  false;
	    this._Q3CompletedTracked =  false;
	    this._Q4CompletedTracked =  false;
	    this._endTracked = false;
	    this._percentageCompletedAggregate = 0;
	    this._successfulStart = false;
	}, 
	
	onReleaseStart: function(e) {
        var playlist = e.data;
        var me = this; 
        this._player =  playlist.player || document.title;
        me.initializeData();

        if (playlist.isError) {
        	this._startupFailure = true;
        	return;
        }
        
        //Get the first chapter and the last chapter of the content 
        if (!this._firstChapter && playlist.clips) {
            tpDebug("OnReleaseStart: Find the first and last chapter");
            for (var i=0; i< playlist.clips.length; i++) {
                var clipObject = playlist.clips[i];
                
                if (!clipObject.baseClip.isAd) {
                	
                	var customData = clipObject.baseClip.contentCustomData;
                	this._cdn = customData ? customData.cdn : undefined; //name of the cdn
                	
                    if (!this._firstChapter) {
                        this._firstChapter = (playlist.clips[i]);
                    }
                    this._lastChapter = (playlist.clips[i]);
                    this._clipTitle = me.getTitle(playlist);
				}
			}
		}
		this._startTracked = true;
	},
	
	onMediaLoadStart: function(e) {
		var clip = e.data;
	    if (clip.id == this._firstChapter.id && clip.URL == this._firstChapter.URL) {
	    	//Keeps track of exit before start
	    	this._loadComplete = false;
	    	this._loadStartTime = new Date();
	    }	    
	},
	
    onMediaStart: function(e)
    {
        var clip = e.data;
        this._isAggregate = clip.chapter && clip.chapter.chapters && clip.chapter.chapters.isAggregate;
        this._isAbsolute = clip.chapter && clip.chapter.chapters && clip.chapter.chapters.isAbsolute;
        this._successfulStart = true;
        if (clip.baseClip.isAd) {
			tpDebug("Track ad start event");
			this._adObject = clip;
			this.trackAdStart(clip);
        } else {
            this._isAd = false;
            this._clipTitle = this.getTitle(clip);
		}
		
        //Track video start only for the first chapter
		if (clip.id == this._firstChapter.id && clip.URL == this._firstChapter.URL && this._open == false)
		{
			this._open = true;
			
			//Collect the custom metrics to be sent to GA
			if (!this._isAggregate && this._isAbsolute) {
				//If it is a live event, use the absolute values to get the content length
			    this._contentLength = Math.floor((clip.endTimeAbsolute - clip.startTimeAbsolute));	
			    this._startTimeAbsolute = clip.startTimeAbsolute;
			} else {
			    this._contentLength = Math.floor((clip.mediaLength > 0 ? clip.mediaLength : clip.baseClip.releaseLength)/1000);	
			}
			
            var bitrate = clip.baseClip.bitrate ? (clip.baseClip.bitrate / 1000) : undefined; //convert bitrate to kbps
  
            tpDebug("MediaLength = " + this._contentLength + "Bitrate = " + bitrate);
            
            var metric2 = this._bitRate;
            var metric12 = this._startupTime;
            var dimension1 = this._runtimeDimension;
            var dimension2 = this._cdnDimension;
            var dimension3 = this._playerDimension;
            var startupTime = (new Date() - this._loadStartTime) / 1000;

            ga('send', 'event', {
                eventCategory: 'Videos',
                eventAction: 'start',
                eventLabel: this._clipTitle,
                metric2: bitrate,
                metric12: startupTime,
                dimension1: this._runtime,
                dimension2: this._cdn,
                dimension3: this._player
            });
		}  
    },
	
	onMediaPlaying: function(e) { 
	    var timeInfo = e.data;
	    var isLive = timeInfo.isLive;
	    this._loadComplete = true;
	    var playEventName;

	     if (this._isAd) {
	         this._adPosition = timeInfo.currentTimeAggregate;
	     } else {
	         if (!this._isAggregate && this._isAbsolute) {
	         	//If it is a  live event use the absolute value to get the current position
	         	this._position = Math.floor(timeInfo.currentTimeAbsolute);
	         } else {
	            this._position = Math.floor(timeInfo.currentTimeAggregate / 1000);		            
	         }
	         
	     }
	  	  
	     //send the play event when the play starts
	     if (isLive && !this._playStarted) {
	         this._playStarted = true;
	         this.sendPlayEvent();
	         this._timer = setInterval(function() { 
	             this.sendPlayEvent(); 
	         }, this._timeInterval);
	     } else if (Math.floor(timeInfo.percentCompleteAggregate) == 0 && !this._isAd && !this._playStarted) {
	         this._playStarted = true;
	         this.sendPlayEvent();	         	         
	     } else {
	         if (!this._isAd && !isLive) {
	             this._percentageCompletedAggregate = Math.floor(timeInfo.percentCompleteAggregate);
	             if (this._percentageCompletedAggregate != 0 && this._percentageCompletedAggregate % 25 === 0 && this._previousPercentage != this._percentageCompletedAggregate) {
	                 this._previousPercentage = this._percentageCompletedAggregate;	                 
	                 this.sendPlayEvent();
	             }
	         }	         
	     }  
	},
	
	sendPlayEvent: function() {
	    var metric1 = this._Q1Completed;
        var metric6 = this._Q2Completed;
        var metric7 = this._Q3Completed;
        var metric8 = this._Q4Completed;
        var metric15 = this._concurrentStreamMetric;
        
        this.setPercentageCompleted();
        
	    ga('send', 'event', {
            eventCategory: 'Videos',
            eventAction: 'play',
            eventLabel: this._clipTitle,
            metric15: 1,
            metric1: this._Q1 === 1 ? this._Q1 : undefined,
            metric6: this._Q2 === 1 ? this._Q2 : undefined,
            metric7: this._Q3 === 1 ? this._Q3 : undefined,
            metric8: this._Q4 === 1 ? this._Q4 : undefined,          
        });
	},
    
    onMediaEnd: function(e) {
        var clip = e.data;
        
        //Calculate the total ad length for custom metric
        if (this._isAd) {
        	var adLength = clip.length  ?  clip.length : 0;
        	this._totalAdTime =+ adLength;
        	if (adLength != 0) {
        	    var percentageAdCompleted = clip.currentMediaTime ? (clip.currentMediaTime/adLength) * 100  : (this._adPosition/adLength) * 100;
        	    if (percentageAdCompleted >= 95) {
        		    this._adCompleted = true;
        	    }
        	}
        	
			tpDebug("Track adCompleteEvent - total ad length = " + this._totalAdTime);
			this.trackAdComplete(clip);
			return;
		}
    },
    
    onMediaBufferStart: function(e) {
    	this._bufferingStartTime = new Date();
	    ga('send', 'event', 'Videos', 'bufferStart', this._clipTitle);
    },
    
    onMediaBufferStop: function(e) {
    	this._bufferingTime = this._bufferingTime + (new Date() - this._bufferingStartTime);
        
        var metric14 = this._bufferingTimeMetric;
        ga('send', 'event', {
            eventCategory: 'Videos',
            eventAction: 'bufferStop',
            eventLabel: this._clipTitle,
            metric14: this._bufferingTime
        });
    },
    
    onMediaError: function(e) {
    	//Keeps track of successful plays. 
    	this._playbackSuccessful = false;
        ga('send', 'event', 'Videos', 'playbackError', this._clipTitle);
    },
    
    onReleaseEnd: function(e) {
    	//If end was already tracked or if the window was closed before the OnReleaseStart was called, return
    	//This could happen when user closes the window after end event was received
    	if (this._endTracked || !this._startTracked) {
    		return;
    	}
    	
    	this._endTracked = true;
    	var exitBeforeStart = false;
    	this._open = false;
    	var contentPlayed = 0;
    	
    	if (this._timer) {
    		clearInterval(this._timer);
    	}
    	
    	if (!this._loadComplete) {
    	    exitBeforeStart = true;
    	}
    	
    	if (exitBeforeStart && !this._playbackSuccessful) {
    		this._startupFailure = true;
    	}
    	
    	var metric3 = this._exitBeforeStart;
    	var metric4 = this._successfulStartMetric;
    	var metric5 = this._contentDuration;
    	var metric9 = this._startupFailureMetric;
    	var metric10 = this._completedVideoMetric;
    	var metric11 = this._totalDuration;
    	var metric8 = this._Q4Completed; //Send metric8 again incase it was not sent in play event
    	this.setPercentageCompleted();
   
    	
    	//The contentPlayed will not include the seeked content
    	if (!this._isAggregate && this._isAbsolute) {
    		contentPlayed = this._position - this._startTimeAbsolute - this._seekedContent;
    	} else {
    	    contentPlayed = this._position - this._seekedContent;
    	}
    	
    	ga('send', 'event', {
            eventCategory: 'Videos',
            eventAction: 'end',
            eventLabel: this._clipTitle,
            metric3: exitBeforeStart,
            metric4: this._successfulStart,
            metric5: contentPlayed,
            metric9: this._startupFailure,
            metric10: this._completedVideo,
            metric11: this._totalAdTime + contentPlayed,
            metric8: this._Q4 === 1 ? this._Q4 : undefined
        });
    },
    
    trackAdStart: function(clip) {
    	this._isAd = true;
    	tpDebug("Ad start");
    	if (clip.id == this._adObject.id && clip.URL == this._adObject.URL  && !this._adStartTracked ) {
    		this._adStartTracked = true;
    	    ga('send', 'event', 'Videos', 'adStart', this._clipTitle);	
    	}
        
    },
    
    trackAdComplete: function(clip) {
    	this._isAd = false;
    	this._adStartTracked = false;
    	tpDebug("Ad stop");
	    
	    var metric13 = this._completedAdMetric;
        ga('send', 'event', {
            eventCategory: 'Videos',
            eventAction: 'adStop',
            eventLabel: this._clipTitle,
            metric13: this._adCompleted
        });
    },
    
    getTitle: function(clip) {
        var title = 'undefined';
        if (clip.title) {
            title = clip.title;
        } else if (clip.baseClip.title) {
            title = clip.baseClip.title;
        }
		
		tpDebug("Title of the content = " + title);
		return title;
    },
    
    setPercentageCompleted: function() {
    	var percentageCompleted = 0;
    	this._Q1 = 0;
    	this._Q2 = 0;
    	this._Q3 = 0;
    	this._Q4 = 0;
        
        if (!this._isAggregate && this._isAbsolute) {
        	var contentDurationWithoutAds = this._position - this._startTimeAbsolute - this._seekedContent;
        	percentageCompleted = (contentDurationWithoutAds/this._contentLength) * 100;
        } else {
        	percentageCompleted = this._percentageCompletedAggregate;
        }
        
        if (this._contentLength != 0) {      
            if (percentageCompleted >= 25 && percentageCompleted < 50 && !this._Q1CompletedTracked) {
        	    this._Q1 = 1;
        	    this._Q1CompletedTracked = true;
        	    tpDebug("25% completed");
            } else if (percentageCompleted >= 50 && percentageCompleted < 75 && !this._Q2CompletedTracked) {
        	    this._Q2 = 1;
        	    this._Q2CompletedTracked = true;
        	    tpDebug("50% completed");
            } else if (percentageCompleted >= 75 && percentageCompleted < 99 && !this._Q3CompletedTracked) {
        	    this._Q3 = 1;
        	    this._Q3CompletedTracked = true;
        	    tpDebug("75% completed");
            } else if (percentageCompleted >= 99 && !this._Q4CompletedTracked) {
        	    this._Q4 = 1;
        	    this._Q4CompletedTracked = true;
        	    tpDebug("100% completed");
            }
        
            if (percentageCompleted >= 95) {
        	    this._completedVideo = true;
        	    tpDebug("95% completed");
            }        	
        }
    },
    
    onMediaSkip: function(e) {
    	tpDebug("media skip");
    },
    
    onMediaSeek: function(e) {
    	var seekObj = e.data;
    	this._seekStartPosition = Math.floor(seekObj.start.currentTimeAggregate / 1000);
    	tpDebug("seek start position "+ this._seekStartPosition);
    },
    
    onMediaSeekComplete: function(e) {
    	var seekObj = e.data;
    	var seekEndPosition = Math.floor(seekObj.end.currentTimeAggregate / 1000);
    	tpDebug("seek end position "+ seekEndPosition);
    	this._seekedContent = seekEndPosition - this._seekStartPosition;
    }
});

$pdk.controller.plugInLoaded(new $pdk.plugin.gAnalytics(), null);


