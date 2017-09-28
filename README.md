# newrelic-video-theplatform [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
#### [New Relic](http://newrelic.com) video tracking for The Platform

## Requirements
This video monitor solutions works on top of New Relic's **Browser Agent**.

## Usage
> If `dist` folder is not included, run `npm i && npm run build` to build it.

You have **2** options:

### Standard Way
Load **scripts** inside `dist` folder into your page.

```javascript
nrvideo.Core.addTracker(new nrvideo.ThePlatformTracker(player))
```

### Plugin Ecosystem
Alternatively, you can use the Platform official ecosystem:

```html
<div id="player" class="tpPlayer"
  tp:plugin0="type=tpplayer|URL=../dist/newrelic-video-theplatform.min.js|priority=1"
>
```

## Defining Scope
If you want to use scope, you can pass it as an option:

```javascript
nrvideo.Core.addTracker(new nrvideo.ThePlatformTracker(player, {
  scope: 'SCOPE'
}))
```

or

```
tp:plugin0="type=tpplayer|URL=../dist/newrelic-video-theplatform.min.js|priority=1|scope=SCOPE"
```

## Known Limitations
Due to the information exposed by player provider, this tracker may not be able to report:
- `AD_QUARTILE`.
- `AD_CLICK`.
- `AD_RENDITION_CHANGE`.
- `BUFFER` only available for HLS (see `OnMediaBufferStart` on [docs](https://docs.theplatform.com/help/player-pdkevent-reference)).