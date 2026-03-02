import { fireEvent } from '@testing-library/react';

import type { KeyboardEventOptions, PointerEventOptions } from './types';

const createKeyboardEvent = (
  type: 'keydown' | 'keyup' | 'keypress',
  options: KeyboardEventOptions
): KeyboardEvent => {
  return new KeyboardEvent(type, {
    key: options.key,
    code: options.code ?? options.key,
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
  });
};

const createPointerEvent = (
  type: string,
  options: PointerEventOptions = {}
): PointerEvent => {
  return new PointerEvent(type, {
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
    button: options.button ?? 0,
    pointerType: options.pointerType ?? 'mouse',
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
  });
};

const pressKey = (
  element: Element,
  key: string,
  modifiers: Partial<KeyboardEventOptions> = {}
): void => {
  const options: KeyboardEventOptions = { key, ...modifiers };
  element.dispatchEvent(createKeyboardEvent('keydown', options));
  element.dispatchEvent(createKeyboardEvent('keyup', options));
};

const pressEnter = (element: Element): void => {
  pressKey(element, 'Enter');
};

const pressEscape = (element: Element): void => {
  pressKey(element, 'Escape');
};

const pressTab = (element: Element, shift = false): void => {
  pressKey(element, 'Tab', { shiftKey: shift });
};

const pressArrowDown = (element: Element): void => {
  pressKey(element, 'ArrowDown');
};

const pressArrowUp = (element: Element): void => {
  pressKey(element, 'ArrowUp');
};

const pressArrowLeft = (element: Element): void => {
  pressKey(element, 'ArrowLeft');
};

const pressArrowRight = (element: Element): void => {
  pressKey(element, 'ArrowRight');
};

const pressSpace = (element: Element): void => {
  pressKey(element, ' ');
};

const pressHome = (element: Element): void => {
  pressKey(element, 'Home');
};

const pressEnd = (element: Element): void => {
  pressKey(element, 'End');
};

const typeText = (element: Element, text: string): void => {
  for (const char of text) {
    pressKey(element, char);
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.value += char;
      fireEvent.input(element, { target: { value: element.value } });
    }
  }
};

const clearAndType = (
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
): void => {
  element.value = '';
  fireEvent.input(element, { target: { value: '' } });
  typeText(element, text);
};

const click = (
  element: Element,
  options: Partial<PointerEventOptions> = {}
): void => {
  element.dispatchEvent(createPointerEvent('pointerdown', options));
  element.dispatchEvent(createPointerEvent('pointerup', options));
  fireEvent.click(element);
};

const doubleClick = (
  element: Element,
  options: Partial<PointerEventOptions> = {}
): void => {
  click(element, options);
  click(element, options);
  fireEvent.dblClick(element);
};

const rightClick = (
  element: Element,
  options: Partial<PointerEventOptions> = {}
): void => {
  element.dispatchEvent(
    createPointerEvent('pointerdown', { ...options, button: 2 })
  );
  element.dispatchEvent(
    createPointerEvent('pointerup', { ...options, button: 2 })
  );
  fireEvent.contextMenu(element);
};

const hover = (element: Element): void => {
  element.dispatchEvent(createPointerEvent('pointerenter'));
  fireEvent.mouseEnter(element);
};

const unhover = (element: Element): void => {
  element.dispatchEvent(createPointerEvent('pointerleave'));
  fireEvent.mouseLeave(element);
};

const focus = (element: HTMLElement): void => {
  element.focus();
  fireEvent.focus(element);
  fireEvent.focusIn(element);
};

const blur = (element: HTMLElement): void => {
  element.blur();
  fireEvent.blur(element);
  fireEvent.focusOut(element);
};

const dragStart = (element: Element, dataTransfer?: DataTransfer): void => {
  fireEvent.dragStart(element, {
    dataTransfer: dataTransfer ?? new DataTransfer(),
  });
};

const dragOver = (element: Element, dataTransfer?: DataTransfer): void => {
  fireEvent.dragOver(element, {
    dataTransfer: dataTransfer ?? new DataTransfer(),
  });
};

const drop = (element: Element, dataTransfer?: DataTransfer): void => {
  fireEvent.drop(element, {
    dataTransfer: dataTransfer ?? new DataTransfer(),
  });
};

const dragEnd = (element: Element): void => {
  fireEvent.dragEnd(element);
};

const simulateDragAndDrop = (
  source: Element,
  target: Element,
  data?: Record<string, string>
): void => {
  const dataTransfer = new DataTransfer();

  if (data) {
    Object.entries(data).forEach(([type, value]) => {
      dataTransfer.setData(type, value);
    });
  }

  dragStart(source, dataTransfer);
  dragOver(target, dataTransfer);
  drop(target, dataTransfer);
  dragEnd(source);
};

const scroll = (
  element: Element,
  options: { top?: number; left?: number }
): void => {
  if (options.top !== undefined) {
    Object.defineProperty(element, 'scrollTop', {
      value: options.top,
      writable: true,
    });
  }
  if (options.left !== undefined) {
    Object.defineProperty(element, 'scrollLeft', {
      value: options.left,
      writable: true,
    });
  }
  fireEvent.scroll(element);
};

const scrollTo = (element: Element, x: number, y: number): void => {
  scroll(element, { left: x, top: y });
};

const resize = (element: HTMLElement, width: number, height: number): void => {
  Object.defineProperty(element, 'offsetWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(element, 'offsetHeight', {
    value: height,
    configurable: true,
  });
  Object.defineProperty(element, 'clientWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(element, 'clientHeight', {
    value: height,
    configurable: true,
  });

  const resizeEvent = new Event('resize', { bubbles: true });
  element.dispatchEvent(resizeEvent);
};

const touch = (
  element: Element,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ clientX: number; clientY: number }>
): void => {
  const touchList = touches.map(
    (t, i) =>
      new Touch({
        identifier: i,
        target: element,
        clientX: t.clientX,
        clientY: t.clientY,
      })
  );

  const touchEvent = new TouchEvent(type, {
    touches: type === 'touchend' ? [] : touchList,
    changedTouches: touchList,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(touchEvent);
};

const swipe = (
  element: Element,
  direction: 'left' | 'right' | 'up' | 'down',
  distance = 100
): void => {
  const start = { clientX: 100, clientY: 100 };
  const end = { ...start };

  switch (direction) {
    case 'left':
      end.clientX -= distance;
      break;
    case 'right':
      end.clientX += distance;
      break;
    case 'up':
      end.clientY -= distance;
      break;
    case 'down':
      end.clientY += distance;
      break;
  }

  touch(element, 'touchstart', [start]);
  touch(element, 'touchmove', [end]);
  touch(element, 'touchend', [end]);
};

const pinch = (
  element: Element,
  scale: number,
  centerX = 100,
  centerY = 100
): void => {
  const initialDistance = 50;
  const finalDistance = initialDistance * scale;

  const startTouches = [
    { clientX: centerX - initialDistance, clientY: centerY },
    { clientX: centerX + initialDistance, clientY: centerY },
  ];

  const endTouches = [
    { clientX: centerX - finalDistance, clientY: centerY },
    { clientX: centerX + finalDistance, clientY: centerY },
  ];

  touch(element, 'touchstart', startTouches);
  touch(element, 'touchmove', endTouches);
  touch(element, 'touchend', endTouches);
};

const paste = (element: Element, text: string): void => {
  const clipboardData = new DataTransfer();
  clipboardData.setData('text/plain', text);

  const pasteEvent = new ClipboardEvent('paste', {
    clipboardData,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(pasteEvent);

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.value += text;
    fireEvent.input(element, { target: { value: element.value } });
  }
};

const copy = (element: Element): void => {
  const clipboardData = new DataTransfer();
  const selection = window.getSelection();

  if (selection && selection.toString()) {
    clipboardData.setData('text/plain', selection.toString());
  }

  const copyEvent = new ClipboardEvent('copy', {
    clipboardData,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(copyEvent);
};

export {
  blur,
  clearAndType,
  click,
  copy,
  createKeyboardEvent,
  createPointerEvent,
  doubleClick,
  dragEnd,
  dragOver,
  dragStart,
  drop,
  focus,
  hover,
  paste,
  pinch,
  pressArrowDown,
  pressArrowLeft,
  pressArrowRight,
  pressArrowUp,
  pressEnd,
  pressEnter,
  pressEscape,
  pressHome,
  pressKey,
  pressSpace,
  pressTab,
  resize,
  rightClick,
  scroll,
  scrollTo,
  simulateDragAndDrop,
  swipe,
  touch,
  typeText,
  unhover,
};
