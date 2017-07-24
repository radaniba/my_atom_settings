'use strict';

const {openDocumentationInWebURL} = require('../urls');
const {renderValueHeader, renderExtend, renderExamples, renderUsages, renderDefinition, renderMembers, valueDescription, debugData, renderLinks} = require('./html-utils');
const StickyTitle = require('./sticky-title');

class KiteExpandModule extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-expand-module', {prototype: this.prototype});
  }

  setData(data) {
    const {value} = data;

    this.innerHTML = `
    ${renderValueHeader(value)}
    ${renderExtend(value)}

    <div class="scroll-wrapper">
      <div class="sections-wrapper">
        <section class="summary">
          <h4>Summary</h4>
          ${valueDescription(data)}
        </section>

        ${renderMembers(value)}
        ${renderUsages(data)}
        ${renderExamples(data)}
        ${renderLinks(data)}
        ${renderDefinition(data)}
        ${debugData(data)}
      </div>
    </div>

    <footer>
      <div></div>
      <kite-open-link data-url="${openDocumentationInWebURL(value.id)}"></kite-open-link>
    </footer>
    `;
  }

  attachedCallback() {
    this.subscriptions = new StickyTitle(this.querySelectorAll('h4'), this.querySelector('.sections-wrapper'));
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }
}

module.exports = KiteExpandModule.initClass();
