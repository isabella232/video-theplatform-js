import { version } from '../package.json'
import ThePlatformTracker from './tracker'
import * as nrvideo from 'newrelic-video-core'

if ($pdk && $pdk.controller) {
  $pdk.ns('$pdk.plugin.Newrelic')
  $pdk.plugin.Newrelic = $pdk.extend(() => { }, {
    VERSION: version,

    /**
     * Empty constructor
     */
    constructor: function () {},

    /**
     * Initialize the plugin with the load object
     * @param lo load object
     */
    initialize: function (lo) {
      let tracker = new ThePlatformTracker(lo.controller, lo.vars)
      nrvideo.Core.addTracker(tracker)
      tracker.sendPlayerInit()
    }
  })

  $pdk.controller.plugInLoaded(new $pdk.plugin.Newrelic(), null)
}
