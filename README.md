[![Community Project header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Community_Project.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#community-project)

# New Relic thePlatform JS Tracker


The New Relic thePlatform JS tracker instruments thePlatform HTML5 player.

## Build

Install dependencies:

```
$ npm install
```

And build:

```
$ npm run build:dev
```

Or if you need a production build:

```
$ npm run build
```

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

or you can use theplatform plugin space:

```
tp:plugin0="type=tpplayer|URL=../dist/newrelic-video-theplatform.min.js|priority=1|scope=SCOPE"
```

### Examples

Check out the `samples` folder for complete usage examples.

## Known Limitations
Due to the information exposed by player provider, this tracker may not be able to report:
- `AD_QUARTILE`.
- `AD_CLICK`.
- `AD_RENDITION_CHANGE`.
- `BUFFER` only available for HLS (see `OnMediaBufferStart` on The Platform docs).

# Open source license

This project is distributed under the [Apache 2 license](LICENSE).

# Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT. Issues and contributions should be reported to the project here on GitHub.

We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

## Community

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

https://discuss.newrelic.com/t/theplatform-js-tracker/100302

## Issues / enhancement requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues before submitting a new issue.

# Contributing

Contributions are encouraged! If you submit an enhancement request, we'll invite you to contribute the change yourself. Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource+videoagent@newrelic.com.
