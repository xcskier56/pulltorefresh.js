
var this$1 = this;
var test = QUnit.test;
var module = QUnit.module;

module('_onTouchStart', function (hooks) {
  hooks.beforeEach(function (assert) {
    this$1.ptrResult = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
    this$1.onTouchStart = this$1.ptrResult.handlers.onTouchStart;
    this$1.currentState = this$1.ptrResult.currentState;

    assert.equal(this$1.currentState.pullStartY, null);
    assert.equal(this$1.currentState._enable, false, 'it starts disabled');
  });

  hooks.afterEach(function (assert) {
    this$1.ptrResult.destroy();

    assert.equal(document.querySelectorAll('.ptr--ptr').length, 0, 'destroy removes the ptr element');
    assert.equal(document.querySelectorAll('#pull-to-refresh-js-style').length, 0, 'destroy removes the style element');

    this$1.ptrResult = null;
    this$1.onTouchStart = null;
    this$1.currentState = null;
  });

  test('sets pullStartY', function (assert) {
    var target = document.querySelector('#touch-element');
    var event = {
      touches: [{ screenY: 10 }],
      target: target,
    };

    assert.equal(this$1.currentState.pullStartY, null);
    this$1.onTouchStart(event);
    assert.equal(this$1.currentState.pullStartY, 10);
  });

  test('enable works with child of target', function (assert) {
    var target = document.querySelector('#touch-element');
    var event = {
      touches: [{ screenY: 0 }],
      target: target,
    };

    assert.equal(this$1.currentState._enable, false, 'it starts disabled');
    this$1.onTouchStart(event);
    assert.equal(this$1.currentState._enable, true, 'it enables it');
  });

  test('enable does not enable when target is not child', function (assert) {
    var target = document.querySelector('#non-child');
    var event = {
      touches: [{ screenY: 0 }],
      target: target,
    };

    assert.equal(this$1.currentState._enable, false, 'it starts disabled');
    this$1.onTouchStart(event);
    assert.equal(this$1.currentState._enable, false, 'it stays disabled');
  });
});
