/**
 * Code By EpicYoshiMaster
 * FPS Limiter
 * 
 * Limits the game's FPS to a specified threshold to allow high refresh rate monitors to be playable
 * on lower FPS settings
 */

//Configuration Settings
sc.FPS_LIMITER_VALUES = [60, 100, 120, 144, 240];

sc.FPS_LIMITER_OPTIONS = {
	FPS60: 0,
	FPS100: 1,
	FPS120: 2,
	FPS144: 3,
	FPS240: 4
};

sc.OPTIONS_DEFINITION["set-fps-limit"] = {
	type: "BUTTON_GROUP",
	data: sc.FPS_LIMITER_OPTIONS,
	init: sc.FPS_LIMITER_OPTIONS.FPS60,
	cat: sc.OPTION_CATEGORY.VIDEO,
	hasDivider: true,
	header: "cc-fps-limiter",
	restart: true
};

/**
 * Declare framerate variables
 */
var fpsInterval, startTime, prevTime;

/**
 * @description Tests if the current time elapsed is long enough to process the next frame
 * This is primarily intended for high refresh rate monitors to be throttled into lower frame rates
 * Approach taken from https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
 */
function checkFrameCall() {
	let currTime = Date.now();
	let deltaTime = currTime - prevTime;

	//Has enough time passed to consider this the next frame?
	if(deltaTime > fpsInterval) {
		prevTime = currTime - (deltaTime % fpsInterval);

		doFrameCall();
	}

	ig.system.fps >= 60 && window.requestAnimationFrame && window.requestAnimationFrame(ig.system.run.bind(ig.system), ig.system.canvas)
}

/**
 * Original code for function a() in the impact.base.system module
 * The only change is moving the requestAnimationFrame call out into checkFrameCall()
 */
var b = 0, c = 0;
function doFrameCall() {
	b =
		b + 1;
	if (b % ig.system.frameSkip == 0) {
		ig.Timer.step();
		ig.system.rawTick = ig.system.actualTick = Math.min(ig.Timer.maxStep, ig.system.clock.tick()) * ig.system.totalTimeFactor;
		if (ig.system.hasFocusLost()) ig.system.actualTick = 0;
		ig.system.tick = ig.system.actualTick * ig.system.timeFactor;
		var d = ig.soundManager.context.getCurrentTimeRaw();
		ig.soundManager.context.timeOffset = d == c ? ig.soundManager.context.timeOffset + ig.system.rawTick : 0;
		c = d;
		if (ig.system.skipMode) {
			ig.system.tick = ig.system.tick * 8;
			ig.system.actualTick = ig.system.actualTick *
				8
		}
		ig.system.delegate.run();
		if (ig.system.newGameClass) {
			ig.system.setGameNow(ig.system.newGameClass);
			ig.system.newGameClass = null
		}
	}
}

/**
 * @inject
 * Replace the run loop with our own setup, set our variable states
 */
ig.System.inject({

	startRunLoop() {
		//Set start state variables
		if(sc.options) {
			this.fps = sc.FPS_LIMITER_VALUES[sc.options.get("set-fps-limit")];

			console.log(`[FPS Limiter] FPS Value Set to: ${this.fps}`);
		}

		fpsInterval = 1E3 / this.fps;
		prevTime = Date.now();
		startTime = prevTime;

		this.parent();
	},

	//Overridden to call a new function since it can't be injected on
	run() {
		if (window.IG_GAME_DEBUG) checkFrameCall();
			else try {
				checkFrameCall()
		} catch (b) {
			ig.system.error(b)
		}
	}
});