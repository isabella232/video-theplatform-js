import { version } from '../package.json'
import ThePlatformTracker from './tracker'
import * as nrvideo from 'newrelic-video-core'

(function () {
  var newRelicPlugin = {
    VERSION: version,
    tracker: null,

    initialize: function (lo) {
      this.tracker = new ThePlatformTracker(lo.controller, lo.vars)
      nrvideo.Core.addTracker(this.tracker)
    }
  }

  $pdk.controller.plugInLoaded(newRelicPlugin, null)
})()
