import * as nrvideo from 'newrelic-video-core'
import { version } from '../package.json'

export default class ThePlatformAdsTracker extends nrvideo.VideoTracker {
  resetValues () {
    this.src = null
    this.title = null
    this.duration = null
    this.playhead = null
    this.position = null
    this.bitrate = null
  }

  getTrackerName () {
    return 'theplatform-ads'
  }

  getTrackerVersion () {
    return version
  }

  getDuration () {
    return this.duration
  }

  getResource () {
    return this.src
  }

  getPlayhead () {
    return this.playhead
  }

  getTitle () {
    return this.title
  }

  getRenditionBitrate () {
    return this.bitrate
  }

  getAdPosition () {
    return this.position
  }

  registerListeners () {
    this.player.addEventListener('OnMediaLoadStart', this.onMediaLoadStart.bind(this), this.scope)
    this.player.addEventListener('OnMediaError', this.onMediaError.bind(this), this.scope)
    this.player.addEventListener('OnMediaStart', this.onMediaStart.bind(this), this.scope)
    this.player.addEventListener('OnMediaEnd', this.onMediaEnd.bind(this), this.scope)
    this.player.addEventListener('OnMediaPlaying', this.onMediaPlaying.bind(this), this.scope)
    this.player.addEventListener('OnMediaPause', this.onMediaPause.bind(this), this.scope)
    this.player.addEventListener('OnMediaUnpause', this.onMediaUnpause.bind(this), this.scope)
    this.player.addEventListener('OnMediaBufferStart', this.onMediaBufferStart.bind(this),
      this.scope)
    this.player.addEventListener('OnMediaBufferComplete', this.onMediaBufferComplete.bind(this),
      this.scope)
  }

  unregisterListeners () {
    this.player.removeEventListener('OnMediaLoadStart', this.onMediaLoadStart, this.scope)
    this.player.removeEventListener('OnMediaError', this.onMediaError, this.scope)
    this.player.removeEventListener('OnMediaStart', this.onMediaStart, this.scope)
    this.player.removeEventListener('OnMediaEnd', this.onMediaEnd, this.scope)
    this.player.removeEventListener('OnMediaPlaying', this.onMediaPlaying, this.scope)
    this.player.removeEventListener('OnMediaPause', this.onMediaPause, this.scope)
    this.player.removeEventListener('OnMediaUnpause', this.onMediaUnpause, this.scope)
    this.player.removeEventListener('OnMediaBufferStart', this.onMediaBufferStart, this.scope)
    this.player.removeEventListener('OnMediaBufferComplete', this.onMediaBufferComplete, this.scope)
  }

  onMediaLoadStart (e) {
    if (e.data.baseClip.isAd) { // ads
      this.duration = e.data.baseClip.releaseLength
      this.bitrate = e.data.baseClip.bitrate
      this.src = e.data.baseClip.URL
      this.title = e.data.baseClip.title || e.data.title
      if (e.data.baseClip.isMid) {
        this.position = nrvideo.Constants.AdPositions.MID
      } else {
        this.position = nrvideo.Constants.AdPositions.PRE
      }
      this.sendRequest()
    }
  }

  onMediaStart (e) {
    if (e.data.baseClip.isAd) { // ads
      this.duration = e.data.baseClip.releaseLength
      this.bitrate = e.data.baseClip.bitrate
      this.src = e.data.baseClip.URL
      this.title = e.data.baseClip.title || e.data.title
      if (e.data.baseClip.isMid) {
        this.position = nrvideo.Constants.AdPositions.MID
      } else {
        this.position = nrvideo.Constants.AdPositions.PRE
      }
    }
  }

  onMediaError (e) {
    if (this.state.isRequested) { // ads
      this.sendError({ errorMessage: e.data.friendlyMessage, errorDetail: e.data.message })
      this.sendEnd()
    }
  }

  onMediaEnd (e) {
    this.sendEnd()
    this.resetValues()
  }

  onMediaPlaying (e) {
    if (this.state.isRequested) { // ads
      this.playhead = e.data.currentTimeAggregate || e.data.currentTime
      this.sendStart()
      this.sendBufferEnd()
    }
  }

  onMediaPause (e) {
    this.sendPause()
  }

  onMediaUnpause (e) {
    this.sendResume()
  }

  onMediaBufferStart (e) {
    if (e.data.baseClip.isAd) { // only if Ad
      this.sendBufferStart()
    }
  }

  onMediaBufferComplete (e) {
    if (e.data.baseClip.isAd) { // only if Ad
      this.sendBufferEnd()
    }
  }
}
