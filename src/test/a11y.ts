import { screen, within } from '@testing-library/react';

import type { AccessibilityViolation, A11yTestResult } from './types';

const checkAriaAttributes = (
  element: HTMLElement
): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = [];

  if (
    element.getAttribute('role') === 'button' &&
    !element.getAttribute('aria-label') &&
    !element.textContent?.trim()
  ) {
    violations.push({
      id: 'button-name',
      impact: 'critical',
      description: 'Buttons must have an accessible name',
      help: 'Add aria-label or text content to the button',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
      nodes: [
        {
          html: element.outerHTML,
          target: [element.tagName.toLowerCase()],
          failureSummary: 'Button has no accessible name',
        },
      ],
    });
  }

  const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'textbox'];
  const role = element.getAttribute('role');
  if (
    role &&
    interactiveRoles.includes(role) &&
    element.getAttribute('tabindex') === '-1' &&
    !element.hasAttribute('disabled')
  ) {
    violations.push({
      id: 'focusable-interactive',
      impact: 'serious',
      description: 'Interactive elements must be focusable',
      help: 'Remove tabindex="-1" or add disabled attribute',
      helpUrl:
        'https://dequeuniversity.com/rules/axe/4.4/focus-order-semantics',
      nodes: [
        {
          html: element.outerHTML,
          target: [element.tagName.toLowerCase()],
          failureSummary: 'Interactive element is not focusable',
        },
      ],
    });
  }

  return violations;
};

const checkImageAccessibility = (
  element: HTMLElement
): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = [];

  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    violations.push({
      id: 'image-alt',
      impact: 'critical',
      description: 'Images must have alternate text',
      help: 'Add an alt attribute to the image',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
      nodes: [
        {
          html: element.outerHTML,
          target: ['img'],
          failureSummary: 'Image has no alt attribute',
        },
      ],
    });
  }

  return violations;
};

const checkFormAccessibility = (
  element: HTMLElement
): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = [];

  const formElements = ['INPUT', 'SELECT', 'TEXTAREA'];
  if (formElements.includes(element.tagName)) {
    const id = element.getAttribute('id');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');

    let hasLabel = !!ariaLabel || !!ariaLabelledBy;

    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      hasLabel = hasLabel || !!label;
    }

    const parentLabel = element.closest('label');
    hasLabel = hasLabel || !!parentLabel;

    if (!hasLabel && element.getAttribute('type') !== 'hidden') {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: 'Form elements must have labels',
        help: 'Add a label element or aria-label attribute',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
        nodes: [
          {
            html: element.outerHTML,
            target: [element.tagName.toLowerCase()],
            failureSummary: 'Form element has no associated label',
          },
        ],
      });
    }
  }

  return violations;
};

const checkHeadingOrder = (
  container: HTMLElement
): AccessibilityViolation[] => {
  const violations: AccessibilityViolation[] = [];
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');

  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1), 10);
    if (level - lastLevel > 1) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        description: 'Heading levels should only increase by one',
        help: `Use an h${lastLevel + 1} instead of h${level}`,
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
        nodes: [
          {
            html: heading.outerHTML,
            target: [heading.tagName.toLowerCase()],
            failureSummary: `Heading skips from h${lastLevel} to h${level}`,
          },
        ],
      });
    }
    lastLevel = level;
  });

  return violations;
};

const checkColorContrast = (
  foreground: string,
  background: string
): { ratio: number; passes: { aa: boolean; aaa: boolean } } => {
  const getLuminance = (hex: string): number => {
    const rgb = hex
      .replace('#', '')
      .match(/.{2}/g)
      ?.map((c) => parseInt(c, 16) / 255) ?? [0, 0, 0];

    const [r, g, b] = rgb.map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio,
    passes: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    },
  };
};

const runA11yAudit = (
  container: HTMLElement = document.body
): A11yTestResult => {
  const violations: AccessibilityViolation[] = [];
  let passes = 0;

  const elements = container.querySelectorAll('*');
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      const ariaViolations = checkAriaAttributes(element);
      const imageViolations = checkImageAccessibility(element);
      const formViolations = checkFormAccessibility(element);

      violations.push(...ariaViolations, ...imageViolations, ...formViolations);

      if (
        ariaViolations.length === 0 &&
        imageViolations.length === 0 &&
        formViolations.length === 0
      ) {
        passes += 1;
      }
    }
  });

  const headingViolations = checkHeadingOrder(container);
  violations.push(...headingViolations);

  return {
    violations,
    passes,
    incomplete: 0,
  };
};

const assertAccessible = (container: HTMLElement = document.body): void => {
  const result = runA11yAudit(container);

  if (result.violations.length > 0) {
    const summary = result.violations
      .map(
        (v) =>
          `${v.impact?.toUpperCase()}: ${v.description}\n  ${v.nodes.map((n) => n.failureSummary).join('\n  ')}`
      )
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${summary}`);
  }
};

const getAccessibleName = (element: Element): string => {
  if (element instanceof HTMLElement) {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent ?? '';
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent ?? '';
      }
    }

    if (element.tagName === 'IMG') {
      return element.getAttribute('alt') ?? '';
    }

    return element.textContent?.trim() ?? '';
  }
  return '';
};

const assertFocusable = (element: HTMLElement): void => {
  const tabIndex = element.getAttribute('tabindex');
  const isNaturallyFocusable =
    element instanceof HTMLInputElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLAnchorElement;

  const isFocusable =
    isNaturallyFocusable || (tabIndex !== null && tabIndex !== '-1');

  if (!isFocusable) {
    throw new Error(
      `Element is not focusable: ${element.outerHTML.slice(0, 100)}`
    );
  }
};

const assertHasRole = (element: HTMLElement, expectedRole: string): void => {
  const role = element.getAttribute('role');
  const implicitRole = getImplicitRole(element);

  if (role !== expectedRole && implicitRole !== expectedRole) {
    throw new Error(
      `Expected element to have role "${expectedRole}", but got "${role ?? implicitRole ?? 'none'}"`
    );
  }
};

const getImplicitRole = (element: HTMLElement): string | null => {
  const tagRoles: Record<string, string> = {
    A: element.hasAttribute('href') ? 'link' : '',
    ARTICLE: 'article',
    ASIDE: 'complementary',
    BUTTON: 'button',
    DIALOG: 'dialog',
    FOOTER: 'contentinfo',
    FORM: 'form',
    H1: 'heading',
    H2: 'heading',
    H3: 'heading',
    H4: 'heading',
    H5: 'heading',
    H6: 'heading',
    HEADER: 'banner',
    IMG: 'img',
    INPUT: getInputRole(element as HTMLInputElement),
    LI: 'listitem',
    MAIN: 'main',
    NAV: 'navigation',
    OL: 'list',
    OPTION: 'option',
    SECTION: 'region',
    SELECT: 'combobox',
    TABLE: 'table',
    TEXTAREA: 'textbox',
    UL: 'list',
  };

  return tagRoles[element.tagName] ?? null;
};

const getInputRole = (input: HTMLInputElement): string => {
  const typeRoles: Record<string, string> = {
    button: 'button',
    checkbox: 'checkbox',
    email: 'textbox',
    number: 'spinbutton',
    radio: 'radio',
    range: 'slider',
    search: 'searchbox',
    submit: 'button',
    tel: 'textbox',
    text: 'textbox',
    url: 'textbox',
  };

  return typeRoles[input.type] ?? 'textbox';
};

const queryByRole = (
  container: HTMLElement,
  role: string
): HTMLElement | null => {
  return within(container).queryByRole(role);
};

const getAllByRole = (container: HTMLElement, role: string): HTMLElement[] => {
  return within(container).getAllByRole(role);
};

const assertLiveRegion = (
  element: HTMLElement,
  politeness: 'polite' | 'assertive' = 'polite'
): void => {
  const ariaLive = element.getAttribute('aria-live');
  const role = element.getAttribute('role');

  const hasLiveRegion =
    ariaLive === politeness ||
    (politeness === 'polite' && role === 'status') ||
    (politeness === 'assertive' && role === 'alert');

  if (!hasLiveRegion) {
    throw new Error(`Expected element to be a ${politeness} live region`);
  }
};

const assertDescribedBy = (
  element: HTMLElement,
  descriptionText: string
): void => {
  const describedBy = element.getAttribute('aria-describedby');
  if (!describedBy) {
    throw new Error('Element has no aria-describedby attribute');
  }

  const descriptionElement = document.getElementById(describedBy);
  if (!descriptionElement) {
    throw new Error(`Description element with id "${describedBy}" not found`);
  }

  if (!descriptionElement.textContent?.includes(descriptionText)) {
    throw new Error(
      `Expected description to contain "${descriptionText}", but got "${descriptionElement.textContent}"`
    );
  }
};

export {
  assertAccessible,
  assertDescribedBy,
  assertFocusable,
  assertHasRole,
  assertLiveRegion,
  checkAriaAttributes,
  checkColorContrast,
  checkFormAccessibility,
  checkHeadingOrder,
  checkImageAccessibility,
  getAccessibleName,
  getAllByRole,
  getImplicitRole,
  queryByRole,
  runA11yAudit,
};
