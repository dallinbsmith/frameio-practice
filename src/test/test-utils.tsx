import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ToastProvider } from '@/components/ui/Toast';
import { StyledComponentsRegistry } from '@/lib/styled/registry';

import type {
  CustomRenderOptions,
  RenderWithProvidersResult,
  TestProviderConfig,
  WrapperProps,
} from './types';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

type AllProvidersProps = {
  children: ReactNode;
  config?: TestProviderConfig | undefined;
};

const AllProviders = ({ children, config: _config }: AllProvidersProps) => {
  return (
    <StyledComponentsRegistry>
      <ToastProvider>{children}</ToastProvider>
    </StyledComponentsRegistry>
  );
};

const createWrapper = (config?: TestProviderConfig | undefined) => {
  const Wrapper = ({ children }: WrapperProps) => (
    <AllProviders config={config}>{children}</AllProviders>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & CustomRenderOptions
): RenderWithProvidersResult => {
  const {
    wrapper,
    initialState: _initialState,
    route: _route,
    ...renderOptions
  } = options ?? {};

  const Wrapper = wrapper ?? createWrapper();

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

const renderWithConfig = (
  ui: ReactElement,
  config: TestProviderConfig,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderWithProvidersResult => {
  const Wrapper = createWrapper(config);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

const renderWithUser = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & CustomRenderOptions
): RenderWithProvidersResult => {
  return customRender(ui, options);
};

const renderInContainer = (
  ui: ReactElement,
  container: HTMLElement
): RenderWithProvidersResult => {
  return customRender(ui, { container });
};

type DebugOptions = {
  maxLength?: number | undefined;
  prettyDOM?: boolean | undefined;
};

const debugElement = (element: Element, options: DebugOptions = {}): void => {
  const { maxLength = 10000, prettyDOM = true } = options;

  if (prettyDOM) {
    const { prettyDOM: pretty } = require('@testing-library/dom');
    console.log(pretty(element, maxLength));
  } else {
    console.log(element.outerHTML.slice(0, maxLength));
  }
};

const debugScreen = (options: DebugOptions = {}): void => {
  screen.debug(undefined, options.maxLength ?? 10000);
};

const getByTestId = (testId: string): HTMLElement => {
  return screen.getByTestId(testId);
};

const queryByTestId = (testId: string): HTMLElement | null => {
  return screen.queryByTestId(testId);
};

const getAllByTestId = (testId: string): HTMLElement[] => {
  return screen.getAllByTestId(testId);
};

const findByTestId = async (testId: string): Promise<HTMLElement> => {
  return screen.findByTestId(testId);
};

const withinTestId = (testId: string) => {
  return within(screen.getByTestId(testId));
};

const getByLabelText = (text: string | RegExp): HTMLElement => {
  return screen.getByLabelText(text);
};

const getByPlaceholderText = (text: string | RegExp): HTMLElement => {
  return screen.getByPlaceholderText(text);
};

const getByText = (text: string | RegExp): HTMLElement => {
  return screen.getByText(text);
};

const queryByText = (text: string | RegExp): HTMLElement | null => {
  return screen.queryByText(text);
};

const getByRole = (
  role: string,
  options?: { name?: string | RegExp }
): HTMLElement => {
  return screen.getByRole(role, options);
};

const queryByRole = (
  role: string,
  options?: { name?: string | RegExp }
): HTMLElement | null => {
  return screen.queryByRole(role, options);
};

const getAllByRole = (role: string): HTMLElement[] => {
  return screen.getAllByRole(role);
};

const findByRole = async (
  role: string,
  options?: { name?: string | RegExp }
): Promise<HTMLElement> => {
  return screen.findByRole(role, options);
};

const getButton = (name: string | RegExp): HTMLElement => {
  return screen.getByRole('button', { name });
};

const getLink = (name: string | RegExp): HTMLElement => {
  return screen.getByRole('link', { name });
};

const getTextbox = (name?: string | RegExp): HTMLElement => {
  return name
    ? screen.getByRole('textbox', { name })
    : screen.getByRole('textbox');
};

const getCheckbox = (name?: string | RegExp): HTMLElement => {
  return name
    ? screen.getByRole('checkbox', { name })
    : screen.getByRole('checkbox');
};

const getRadio = (name: string | RegExp): HTMLElement => {
  return screen.getByRole('radio', { name });
};

const getCombobox = (name?: string | RegExp): HTMLElement => {
  return name
    ? screen.getByRole('combobox', { name })
    : screen.getByRole('combobox');
};

const getHeading = (name?: string | RegExp, level?: number): HTMLElement => {
  const options: { name?: string | RegExp; level?: number } = {};
  if (name) options.name = name;
  if (level) options.level = level;
  return screen.getByRole('heading', options);
};

const getList = (): HTMLElement => {
  return screen.getByRole('list');
};

const getListItems = (): HTMLElement[] => {
  return screen.getAllByRole('listitem');
};

const getDialog = (name?: string | RegExp): HTMLElement => {
  return name
    ? screen.getByRole('dialog', { name })
    : screen.getByRole('dialog');
};

const queryDialog = (name?: string | RegExp): HTMLElement | null => {
  return name
    ? screen.queryByRole('dialog', { name })
    : screen.queryByRole('dialog');
};

const getAlert = (): HTMLElement => {
  return screen.getByRole('alert');
};

const queryAlert = (): HTMLElement | null => {
  return screen.queryByRole('alert');
};

const getTab = (name: string | RegExp): HTMLElement => {
  return screen.getByRole('tab', { name });
};

const getTabPanel = (): HTMLElement => {
  return screen.getByRole('tabpanel');
};

const getMenu = (): HTMLElement => {
  return screen.getByRole('menu');
};

const getMenuItems = (): HTMLElement[] => {
  return screen.getAllByRole('menuitem');
};

export * from '@testing-library/react';
export { userEvent };
export { customRender as render };
export {
  AllProviders,
  createWrapper,
  debugElement,
  debugScreen,
  findByRole,
  findByTestId,
  getAlert,
  getAllByRole,
  getAllByTestId,
  getButton,
  getByLabelText,
  getByPlaceholderText,
  getByRole,
  getByTestId,
  getByText,
  getCheckbox,
  getCombobox,
  getDialog,
  getHeading,
  getLink,
  getList,
  getListItems,
  getMenu,
  getMenuItems,
  getRadio,
  getTab,
  getTabPanel,
  getTextbox,
  queryAlert,
  queryByRole,
  queryByTestId,
  queryByText,
  queryDialog,
  renderInContainer,
  renderWithConfig,
  renderWithUser,
  withinTestId,
};
