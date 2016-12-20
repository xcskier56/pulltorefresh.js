
var this$1 = this;
var test = QUnit.test;
var module = QUnit.module;

module('_onTouchMove', function (hooks) {
  hooks.beforeEach(function () {
    this$1.ptrResult = PullToRefresh.init({
      mainElement: '#ptr-trigger-element',
      triggerElement: '#ptr-trigger-element',
      resistanceFunction: function (t) { return Math.min(1, t); },
      distMax: 800,
    });
    this$1.onTouchMove = this$1.ptrResult.handlers.onTouchMove;
    this$1.onTouchStart = this$1.ptrResult.handlers.onTouchStart;
    this$1.currentState = this$1.ptrResult.currentState;

    // simulate touchStart
    this$1.currentState._enable = true;
  });

  hooks.afterEach(function () {
    this$1.ptrResult.destroy();

    this$1.ptrResult = null;
    this$1.onTouchMove = null;
    this$1.onTouchStart = null;
    this$1.currentState = null;
  });

  test('first touchmove sets pullStartY', function (assert) {
    var moveEvent1 = {
      touches: [{ screenY: 10 }],
      preventDefault: function () { return true; },
    };

    assert.equal(this$1.currentState.pullStartY, null);
    // Since pullStartY is 0, the first move event sets
    // the pullStartY
    this$1.onTouchMove(moveEvent1);
    assert.equal(this$1.currentState.pullStartY, 10);
  });

  test('second touchmove sets pullMoveY, _state and dist', function (assert) {
    var moveEvent1 = {
      touches: [{ screenY: 10 }],
      preventDefault: function () { return true; },
    };

    var moveEvent2 = {
      touches: [{ screenY: 20 }],
      preventDefault: function () { return true; },
    };

    this$1.onTouchMove(moveEvent1);
    this$1.onTouchMove(moveEvent2);
    assert.equal(this$1.currentState.pullMoveY, 20, 'sets pullMoveY');
    assert.equal(this$1.currentState._state, 'pulling', 'sets state to pulling');
    assert.equal(this$1.currentState.dist, 10, 'sets pull dist properly'); // 20 - 10
  });

  test('pull down and then back up', function (assert) {
    var moveEvent1 = { touches: [{ screenY: 10 }], preventDefault: function () { return true; } };
    var moveEvent2 = { touches: [{ screenY: 20 }], preventDefault: function () { return true; } };
    var moveEvent3 = { touches: [{ screenY: 15 }], preventDefault: function () { return true; } };

    this$1.onTouchMove(moveEvent1);
    this$1.onTouchMove(moveEvent2);
    assert.equal(this$1.currentState.dist, 10, 'sets pull dist properly'); // 20 - 10
    this$1.onTouchMove(moveEvent3);
    assert.equal(this$1.currentState.dist, 5, 'sets pull dist properly'); // 15 - 10
  });

  test('pull past refresh dist', function (assert) {
    var moveEvent1 = { touches: [{ screenY: 10 }], preventDefault: function () { return true; } };
    var moveEvent2 = { touches: [{ screenY: 125 }], preventDefault: function () { return true; } };

    this$1.onTouchMove(moveEvent1);
    this$1.onTouchMove(moveEvent2);
    assert.equal(this$1.currentState.distResisted, 115, 'sets pull dist properly'); // 15 - 10
    assert.equal(this$1.currentState._state, 'releasing', 'sets state to refreshing');
  });
});
