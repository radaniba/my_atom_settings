'use strict';

require('./kite-links');
const {Range} = require('atom');
const {symbolName, symbolKind} = require('../kite-data-utils');
const {debugData} = require('./html-utils');
const {internalGotoURL, internalGotoRangeURL, internalOpenRangeInWebURL, internalExpandRangeURL} = require('../urls');
let OverlayManager;

class KiteHover extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-hover', {prototype: this.prototype});
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }

  attachedCallback() {
    this.classList.add('native-key-bindings');
    this.setAttribute('tabindex', '-1');
  }

  setData(data, editor, range) {
    range = Range.fromObject(range);

    if (data && data.symbol && data.symbol.length) {
      const [symbol] = data.symbol;
      // const type = symbolType(symbol);
      const actions = [
        `<a href="${internalOpenRangeInWebURL(range)}">web</a>`,
        `<a href="${internalExpandRangeURL(range)}">more</a>`,
      ];

      if (data.report.definition) {
        actions.unshift(`<a
          href="${internalGotoURL(data.report.definition)}">def</a>`);
      } else {
        actions.unshift(`<a
          href="${internalGotoRangeURL(range)}">def</a>`);
      }

      this.innerHTML = `
      <div class="definition">
        <span class="name">${symbolName(symbol)}</span>
        <span class="type">${symbolKind(symbol)}</span>
      </div>
      <kite-links metric="Hover">
        ${actions.join(' ')}
        <div class="flex-separator"></div>
        <kite-logo small/>
      </kite-links>
      ${debugData(data)}`;

      const links = this.querySelector('kite-links');

      if (links) {
        this.subscriptions = links.onDidClickMoreLink(() => {
          if (!OverlayManager) {
            OverlayManager = require('../overlay-manager');
          }
          OverlayManager.dismiss();
        });
      }

    } else {
      this.innerHTML = '';
    }
  }
}

module.exports = KiteHover.initClass();
