/**
---
_bundle: PullToRefresh
---
*/

/* eslint-disable import/no-unresolved */

import _ptrMarkup from './_markup';
import _ptrStyles from './_styles';

let _SETTINGS = {};

const _defaults = {
  distThreshold: 60,
  distMax: 80,
  distReload: 50,
  bodyOffset: 20,
  mainElement: 'body',
  triggerElement: 'body',
  ptrElement: '.ptr',
  classPrefix: 'ptr--',
  cssProp: 'min-height',
  iconArrow: '&#8675;',
  iconRefreshing: '&hellip;',
  instructionsPullToRefresh: 'Pull down to refresh',
  instructionsReleaseToRefresh: 'Release to refresh',
  instructionsRefreshing: 'Refreshing',
  refreshTimeout: 500,
  getMarkup: _ptrMarkup,
  getStyles: _ptrStyles,
  onInit: () => {},
  onRefresh: () => location.reload(),
  resistanceFunction: t => Math.min(1, t / 2.5),
};



const currentStateDefaults = {
  pullStartY: null,
  pullMoveY: null,
  dist: 0,
  distResisted: 0,

  _state: 'pending',
  _setup: false,
  _enable: false,
  _timeout: null,
};

let currentState = {};

function _update() {
  const {
    classPrefix,
    ptrElement,
    iconArrow,
    iconRefreshing,
    instructionsRefreshing,
    instructionsPullToRefresh,
    instructionsReleaseToRefresh,
  } = _SETTINGS;

  const iconEl = ptrElement.querySelector(`.${classPrefix}icon`);
  const textEl = ptrElement.querySelector(`.${classPrefix}text`);

  if (currentState._state === 'refreshing') {
    iconEl.innerHTML = iconRefreshing;
  } else {
    iconEl.innerHTML = iconArrow;
  }

  if (currentState._state === 'releasing') {
    textEl.innerHTML = instructionsReleaseToRefresh;
  }

  if (currentState._state === 'pulling' || currentState._state === 'pending') {
    textEl.innerHTML = instructionsPullToRefresh;
  }

  if (currentState._state === 'refreshing') {
    textEl.innerHTML = instructionsRefreshing;
  }
}

function _setupEvents() {
  function onReset() {
    const { cssProp, ptrElement, classPrefix } = _SETTINGS;

    ptrElement.classList.remove(`${classPrefix}refresh`);
    ptrElement.style[cssProp] = '0px';

    currentState._state = 'pending';
  }

  function _onTouchStart(e) {
    const { triggerElement } = _SETTINGS;

    if (!window.scrollY) {
      currentState.pullStartY = e.touches[0].screenY;
    }

    if (currentState._state !== 'pending') {
      return;
    }

    clearTimeout(currentState._timeout);

    currentState._enable = triggerElement.contains(e.target);
    currentState._state = 'pending';
    _update();
  }

  function _onTouchMove(e) {
    const {
      ptrElement, resistanceFunction, distMax, distThreshold, cssProp, classPrefix,
    } = _SETTINGS;

    if (!currentState.pullStartY) {
      if (!window.scrollY) {
        currentState.pullStartY = e.touches[0].screenY;
      }
    } else {
      currentState.pullMoveY = e.touches[0].screenY;
    }

    if (!currentState._enable || currentState._state === 'refreshing') {
      if (!window.scrollY && currentState.pullStartY < currentState.pullMoveY) {
        e.preventDefault();
      }

      return;
    }

    if (currentState._state === 'pending') {
      ptrElement.classList.add(`${classPrefix}pull`);
      currentState._state = 'pulling';
      _update();
    }

    if (currentState.pullStartY && currentState.pullMoveY) {
      currentState.dist = currentState.pullMoveY - currentState.pullStartY;
    }

    if (currentState.dist > 0) {
      e.preventDefault();

      ptrElement.style[cssProp] = `${currentState.distResisted}px`;

      currentState.distResisted = resistanceFunction(currentState.dist / distThreshold)
        * Math.min(distMax, currentState.dist);

      if (currentState._state === 'pulling' && currentState.distResisted > distThreshold) {
        ptrElement.classList.add(`${classPrefix}release`);
        currentState._state = 'releasing';
        _update();
      }

      if (currentState._state === 'releasing' && currentState.distResisted < distThreshold) {
        ptrElement.classList.remove(`${classPrefix}release`);
        currentState._state = 'pulling';
        _update();
      }
    }
  }

  function _onTouchEnd() {
    const {
      ptrElement, onRefresh, refreshTimeout, distThreshold, distReload, cssProp, classPrefix,
    } = _SETTINGS;

    if (currentState._state === 'releasing' && currentState.distResisted > distThreshold) {
      currentState._state = 'refreshing';

      ptrElement.style[cssProp] = `${distReload}px`;
      ptrElement.classList.add(`${classPrefix}refresh`);

      currentState._timeout = setTimeout(() => {
        const retval = onRefresh(onReset);

        if (retval && typeof retval.then === 'function') {
          retval.then(() => onReset());
        }

        if (!retval && !onRefresh.length) {
          onReset();
        }
      }, refreshTimeout);
    } else {
      if (currentState._state === 'refreshing') {
        return;
      }

      ptrElement.style[cssProp] = '0px';

      currentState._state = 'pending';
    }

    _update();

    ptrElement.classList.remove(`${classPrefix}release`);
    ptrElement.classList.remove(`${classPrefix}pull`);

    currentState.pullStartY = currentState.pullMoveY = null;
    dist = currentState.distResisted = 0;
  }

  window.addEventListener('touchend', _onTouchEnd);
  window.addEventListener('touchstart', _onTouchStart);
  window.addEventListener('touchmove', _onTouchMove, { passive: false });

  // Store event handlers to use for teardown later
  return {
    onTouchStart: _onTouchStart,
    onTouchMove: _onTouchMove,
    onTouchEnd: _onTouchEnd,
  };
}

function _run() {
  const {
    mainElement, getMarkup, getStyles, classPrefix, onInit,
  } = _SETTINGS;

  if (!document.querySelector(`.${classPrefix}ptr`)) {
    const ptr = document.createElement('div');

    if (mainElement !== document.body) {
      mainElement.parentNode.insertBefore(ptr, mainElement);
    } else {
      document.body.insertBefore(ptr, document.body.firstChild);
    }

    ptr.classList.add(`${classPrefix}ptr`);
    ptr.innerHTML = getMarkup()
      .replace(/__PREFIX__/g, classPrefix);

    _SETTINGS.ptrElement = ptr;
  }

  // If we call init multiple times, we don't want to create
  // multiple style nodes
  let styleEl;
  if (!document.querySelector('#pull-to-refresh-js-style')) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'pull-to-refresh-js-style');

    styleEl.textContent = getStyles()
      .replace(/__PREFIX__/g, classPrefix)
      .replace(/\s+/g, ' ');

    document.head.appendChild(styleEl);
  } else {
    styleEl = document.querySelector('#pull-to-refresh-js-style');
  }

  if (typeof onInit === 'function') {
    onInit(_SETTINGS);
  }

  return {
    styleNode: styleEl,
    ptrElement: _SETTINGS.ptrElement,
  };
}

export default {
  init(options = {}) {
    let handlers;
    // Reset all state each time calling init;
    Object.keys(_defaults).forEach((key) => {
      _SETTINGS[key] = options[key] || _defaults[key];
    });

    // Reset all state each time calling init;
    Object.keys(currentStateDefaults).forEach((key) => {
      currentState[key] = currentStateDefaults[key];
    });

    if (typeof _SETTINGS.mainElement === 'string') {
      _SETTINGS.mainElement = document.querySelector(_SETTINGS.mainElement);
    }

    if (typeof _SETTINGS.ptrElement === 'string') {
      _SETTINGS.ptrElement = document.querySelector(_SETTINGS.ptrElement);
    }

    if (typeof _SETTINGS.triggerElement === 'string') {
      _SETTINGS.triggerElement = document.querySelector(_SETTINGS.triggerElement);
    }

    if (!currentState._setup) {
      handlers = _setupEvents();
      currentState._setup = true;
    }

    let { styleNode, ptrElement } = _run();

    return {
      handlers: handlers,
      settings: _SETTINGS,
      currentState: currentState,
      destroy() {
        // Teardown event listeners
        window.removeEventListener('touchstart', handlers.onTouchStart);
        window.removeEventListener('touchend', handlers.onTouchEnd);
        window.removeEventListener('touchmove', handlers.onTouchMove);

        // Remove ptr element and style tag
        styleNode.parentNode.removeChild(styleNode);
        ptrElement.parentNode.removeChild(ptrElement);

        // Enable setupEvents to run again
        currentState = {};

        // null object references
        handlers = null;
        styleNode = null;
        ptrElement = null;
        _SETTINGS = {};
      },
    };
  },
};
