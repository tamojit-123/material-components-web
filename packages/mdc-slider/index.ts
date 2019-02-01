/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import MDCComponent from '@material/base/component';

import {strings} from './constants';
import {MDCSliderAdapter} from './adapter';
import {MDCSliderFoundation} from './foundation';

class MDCSlider extends MDCComponent<MDCSliderFoundation> {
  static attachTo(root: Element) {
    return new MDCSlider(root);
  }

  private thumbContainer_!: Element;
  private track_!: Element;
  private pinValueMarker_!: Element;
  private trackMarkerContainer_!: Element;

  get value() {
    return this.foundation_.getValue();
  }

  set value(value: number) {
    this.foundation_.setValue(value);
  }

  get min() {
    return this.foundation_.getMin();
  }

  set min(min: number) {
    this.foundation_.setMin(min);
  }

  get max() {
    return this.foundation_.getMax();
  }

  set max(max: number) {
    this.foundation_.setMax(max);
  }

  get step() {
    return this.foundation_.getStep();
  }

  set step(step: number) {
    this.foundation_.setStep(step);
  }

  get disabled() {
    return this.foundation_.isDisabled();
  }

  set disabled(disabled: boolean) {
    this.foundation_.setDisabled(disabled);
  }

  initialize() {
    this.thumbContainer_ = this.root_.querySelector(strings.THUMB_CONTAINER_SELECTOR) as Element;
    this.track_ = this.root_.querySelector(strings.TRACK_SELECTOR) as Element;
    this.pinValueMarker_ = this.root_.querySelector(strings.PIN_VALUE_MARKER_SELECTOR) as Element;
    this.trackMarkerContainer_ = this.root_.querySelector(strings.TRACK_MARKER_CONTAINER_SELECTOR) as Element;
    const startOfErrorMessage = 'Slider component requires a';
    if (!this.thumbContainer_) {
      throw new Error(`${startOfErrorMessage} ${strings.THUMB_CONTAINER_SELECTOR} element`);
    }
    if (!this.track_) {
      throw new Error(`${startOfErrorMessage} ${strings.TRACK_SELECTOR} element`);
    }
    if (!this.pinValueMarker_) {
      throw new Error(`${startOfErrorMessage} ${strings.PIN_VALUE_MARKER_SELECTOR} element`);
    }
    if (!this.trackMarkerContainer_) {
      throw new Error(`${startOfErrorMessage} ${strings.TRACK_MARKER_CONTAINER_SELECTOR} element`);
    }
  }

  getDefaultFoundation() {
    return new MDCSliderFoundation({
      hasClass: (className) => this.root_.classList.contains(className),
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      getAttribute: (name) => this.root_.getAttribute(name),
      setAttribute: (name, value) => this.root_.setAttribute(name, value),
      removeAttribute: (name) => this.root_.removeAttribute(name),
      computeBoundingRect: () => this.root_.getBoundingClientRect(),
      getTabIndex: () => (this.root_ as HTMLElement).tabIndex,
      registerInteractionHandler: (type, handler) => {
        this.root_.addEventListener(type, handler);
      },
      deregisterInteractionHandler: (type, handler) => {
        this.root_.removeEventListener(type, handler);
      },
      registerThumbContainerInteractionHandler: (type, handler) => {
        this.thumbContainer_.addEventListener(type, handler);
      },
      deregisterThumbContainerInteractionHandler: (type, handler) => {
        this.thumbContainer_.removeEventListener(type, handler);
      },
      registerBodyInteractionHandler: (type, handler) => {
        document.body.addEventListener(type, handler);
      },
      deregisterBodyInteractionHandler: (type, handler) => {
        document.body.removeEventListener(type, handler);
      },
      registerResizeHandler: (handler) => {
        window.addEventListener('resize', handler);
      },
      deregisterResizeHandler: (handler) => {
        window.removeEventListener('resize', handler);
      },
      notifyInput: () => {
        this.emit(strings.INPUT_EVENT, this);
      },
      notifyChange: () => {
        this.emit(strings.CHANGE_EVENT, this);
      },
      setThumbContainerStyleProperty: (propertyName, value) => {
        (this.thumbContainer_ as HTMLElement).style.setProperty(propertyName as string, value);
      },
      setTrackStyleProperty: (propertyName, value) => {
        (this.track_ as HTMLElement).style.setProperty(propertyName as string, value);
      },
      setMarkerValue: (value) => {
        (this.pinValueMarker_ as HTMLElement).innerText = value;
      },
      appendTrackMarkers: (numMarkers) => {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < numMarkers; i++) {
          const marker = document.createElement('div');
          marker.classList.add('mdc-slider__track-marker');
          frag.appendChild(marker);
        }
        this.trackMarkerContainer_.appendChild(frag);
      },
      removeTrackMarkers: () => {
        while (this.trackMarkerContainer_.firstChild) {
          this.trackMarkerContainer_.removeChild(this.trackMarkerContainer_.firstChild);
        }
      },
      setLastTrackMarkersStyleProperty: (propertyName, value) => {
        // We remove and append new nodes, thus, the last track marker must be dynamically found.
        const lastTrackMarker = this.root_.querySelector(strings.LAST_TRACK_MARKER_SELECTOR) as HTMLElement;
        lastTrackMarker.style.setProperty(propertyName as unknown as string, value);
      },
      isRTL: () => getComputedStyle(this.root_).direction === 'rtl',
    });
  }

  initialSyncWithDOM() {
    const ariaValueNow = this.root_.getAttribute(strings.ARIA_VALUENOW);
    const ariaMin = this.root_.getAttribute(strings.ARIA_VALUEMIN);
    const ariaMax = this.root_.getAttribute(strings.ARIA_VALUEMAX);
    const ariaStep = this.root_.getAttribute(strings.STEP_DATA_ATTR);
    const origValueNow = ariaValueNow ? parseFloat(ariaValueNow) : 0;
    const min = ariaMin ? parseFloat(ariaMin) : this.min;
    const max = ariaMax ? parseFloat(ariaMax) : this.max;

    // min and max need to be set in the right order to avoid throwing an error
    // when the new min is greater than the default max.
    if (min >= this.max) {
      this.max = max;
      this.min = min;
    } else {
      this.min = min;
      this.max = max;
    }

    this.step = ariaStep ? parseFloat(ariaStep) : this.step;
    this.value = origValueNow || this.value;
    this.disabled = (
      this.root_.hasAttribute(strings.ARIA_DISABLED) &&
      this.root_.getAttribute(strings.ARIA_DISABLED) !== 'false'
    );
    this.foundation_.setupTrackMarker();
  }

  layout() {
    this.foundation_.layout();
  }

  /** @param {number=} amount */
  stepUp(amount = (this.step || 1)) {
    this.value += amount;
  }

  /** @param {number=} amount */
  stepDown(amount = (this.step || 1)) {
    this.value -= amount;
  }
}

export {MDCSliderFoundation, MDCSlider};
