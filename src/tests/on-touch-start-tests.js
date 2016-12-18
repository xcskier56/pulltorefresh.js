const { test, module } = QUnit;

module( "_onTouchStart", function( hooks ) {
  hooks.beforeEach( (assert) => {
    this.ptrResult = PullToRefresh.init({ mainElement: '#ptr-trigger-element', triggerElement: '#ptr-trigger-element' });
    this.onTouchStart = this.ptrResult.handlers.onTouchStart;
    this.currentState = this.ptrResult.currentState;

    assert.equal(this.currentState.pullStartY, null);
    assert.equal(this.currentState._enable, false, 'it starts disabled');
  });

  hooks.afterEach( (assert) => {
    this.ptrResult.destroy();

    assert.equal(document.querySelectorAll('.ptr--ptr').length, 0, 'destroy removes the ptr element');
    assert.equal(document.querySelectorAll('#pull-to-refresh-js-style').length, 0, 'destroy removes the style element');

    this.ptrResult = null;
    this.onTouchStart = null;
    this.currentState = null;
  });

  test('sets pullStartY', (assert) => {
    target = document.querySelector('#touch-element');
    const event = {
      touches: [{screenY: 10}],
      target: target
    }

    assert.equal(this.currentState.pullStartY, null);
    this.onTouchStart(event);
    assert.equal(this.currentState.pullStartY, 10);
  });

  test('enable works with child of target', (assert) => {
    target = document.querySelector('#touch-element');
    const event = {
      touches: [{screenY: 0}],
      target: target
    }

    assert.equal(this.currentState._enable, false, 'it starts disabled');
    this.onTouchStart(event);
    assert.equal(this.currentState._enable, true, 'it enables it');
  });

  test('enable does not enable when target is not child', (assert) => {
    target = document.querySelector('#non-child');
    const event = {
      touches: [{screenY: 0}],
      target: target
    }

    assert.equal(this.currentState._enable, false, 'it starts disabled');
    this.onTouchStart(event);
    assert.equal(this.currentState._enable, false, 'it stays disabled');
  })
})
