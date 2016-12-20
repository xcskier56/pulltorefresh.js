const { test, module } = QUnit;

module('_onTouchMove', (hooks) => {
  hooks.beforeEach(() => {
    this.ptrResult = PullToRefresh.init({
      mainElement: '#ptr-trigger-element',
      triggerElement: '#ptr-trigger-element',
      resistanceFunction: t => Math.min(1, t),
      distMax: 800,
    });
    this.onTouchMove = this.ptrResult.handlers.onTouchMove;
    this.onTouchStart = this.ptrResult.handlers.onTouchStart;
    this.currentState = this.ptrResult.currentState;

    // simulate touchStart
    this.currentState._enable = true;
  });

  hooks.afterEach(() => {
    this.ptrResult.destroy();

    this.ptrResult = null;
    this.onTouchMove = null;
    this.onTouchStart = null;
    this.currentState = null;
  });

  test('first touchmove sets pullStartY', (assert) => {
    const moveEvent1 = {
      touches: [{ screenY: 10 }],
      preventDefault: () => true,
    };

    assert.equal(this.currentState.pullStartY, null);
    // Since pullStartY is 0, the first move event sets
    // the pullStartY
    this.onTouchMove(moveEvent1);
    assert.equal(this.currentState.pullStartY, 10);
  });

  test('second touchmove sets pullMoveY, _state and dist', (assert) => {
    const moveEvent1 = {
      touches: [{ screenY: 10 }],
      preventDefault: () => true,
    };

    const moveEvent2 = {
      touches: [{ screenY: 20 }],
      preventDefault: () => true,
    };

    this.onTouchMove(moveEvent1);
    this.onTouchMove(moveEvent2);
    assert.equal(this.currentState.pullMoveY, 20, 'sets pullMoveY');
    assert.equal(this.currentState._state, 'pulling', 'sets state to pulling');
    assert.equal(this.currentState.dist, 10, 'sets pull dist properly'); // 20 - 10
  });

  test('pull down and then back up', (assert) => {
    const moveEvent1 = { touches: [{ screenY: 10 }], preventDefault: () => true };
    const moveEvent2 = { touches: [{ screenY: 20 }], preventDefault: () => true };
    const moveEvent3 = { touches: [{ screenY: 15 }], preventDefault: () => true };

    this.onTouchMove(moveEvent1);
    this.onTouchMove(moveEvent2);
    assert.equal(this.currentState.dist, 10, 'sets pull dist properly'); // 20 - 10
    this.onTouchMove(moveEvent3);
    assert.equal(this.currentState.dist, 5, 'sets pull dist properly'); // 15 - 10
  });

  test('pull past refresh dist', (assert) => {
    const moveEvent1 = { touches: [{ screenY: 10 }], preventDefault: () => true };
    const moveEvent2 = { touches: [{ screenY: 125 }], preventDefault: () => true };

    this.onTouchMove(moveEvent1);
    this.onTouchMove(moveEvent2);
    assert.equal(this.currentState.distResisted, 115, 'sets pull dist properly'); // 15 - 10
    assert.equal(this.currentState._state, 'releasing', 'sets state to refreshing');
  });
});
