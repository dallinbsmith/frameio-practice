'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useScrollPosition, useLockBodyScroll } from '@/hooks';
import { useFeatureFlag } from '@/lib/features';

type HeaderState = 'top' | 'scrolled' | 'hidden';

const StyledHeader = styled.header<{ $state: HeaderState }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  height: var(--header-height);
  background-color: ${({ $state }) =>
    $state === 'top'
      ? 'rgba(var(--color-bg-primary-rgb), 0.8)'
      : 'var(--color-bg-primary)'};
  border-bottom: 1px solid
    ${({ $state }) =>
      $state === 'scrolled' ? 'var(--color-border-subtle)' : 'transparent'};
  backdrop-filter: blur(12px);
  transition:
    transform var(--duration-moderate) var(--ease-out-expo),
    background-color var(--duration-fast) var(--ease-default),
    border-color var(--duration-fast) var(--ease-default),
    box-shadow var(--duration-fast) var(--ease-default);

  ${({ $state }) =>
    $state === 'hidden' &&
    css`
      transform: translateY(-100%);
    `}

  ${({ $state }) =>
    $state === 'scrolled' &&
    css`
      box-shadow: var(--shadow-sm);
    `}
`;

const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-fg-primary);
  text-decoration: none;
  transition: var(--transition-colors);

  &:hover {
    color: var(--color-fg-brand);
  }
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: var(--gradient-brand-vibrant);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
`;

const Nav = styled.nav`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: var(--spacing-1);
  }
`;

const NavLink = styled(Link)`
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: var(--transition-colors);

  &:hover {
    color: var(--color-fg-primary);
    background-color: var(--color-bg-surface-hover);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const DesktopActions = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-fg-primary);
  border-radius: var(--radius-md);
  transition: var(--transition-interactive);

  &:hover {
    background-color: var(--color-bg-surface-hover);
  }

  &:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-overlay);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition:
    opacity var(--duration-normal) var(--ease-default),
    visibility var(--duration-normal) var(--ease-default);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-primary);
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  z-index: var(--z-modal);
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform var(--duration-moderate) var(--ease-out-expo);
  overflow-y: auto;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  padding: var(--spacing-4);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: var(--transition-interactive);

  &:hover {
    background-color: var(--color-bg-surface-hover);
  }
`;

const MobileMenuDivider = styled.div`
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: var(--spacing-4) 0;
`;

const MobileThemeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-4);
  color: var(--color-fg-secondary);
  font-size: var(--font-size-base);
`;

const navItems = [
  { label: 'Product', href: '/product' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Customers', href: '/customers' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Resources', href: '/resources' },
];

const SCROLL_THRESHOLD = 100;
const HIDE_THRESHOLD = 300;

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerState, setHeaderState] = useState<HeaderState>('top');
  const { y, direction } = useScrollPosition();
  const darkModeEnabled = useFeatureFlag('darkMode');

  useLockBodyScroll(mobileMenuOpen);

  useEffect(() => {
    if (y <= 0) {
      setHeaderState('top');
    } else if (y > HIDE_THRESHOLD && direction === 'down' && !mobileMenuOpen) {
      setHeaderState('hidden');
    } else if (y > SCROLL_THRESHOLD) {
      setHeaderState('scrolled');
    } else {
      setHeaderState('top');
    }
  }, [y, direction, mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <StyledHeader $state={headerState}>
        <HeaderContainer>
          <Logo href="/" onClick={closeMobileMenu}>
            <LogoIcon>F</LogoIcon>
            <span>Frame.io</span>
          </Logo>

          <Nav>
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </Nav>

          <Actions>
            <DesktopActions>
              {darkModeEnabled && <ThemeToggle />}
              <Button variant="ghost" size="sm" href="/contact">
                Contact Sales
              </Button>
              <Button size="sm" href="/signup">
                Start Free Trial
              </Button>
            </DesktopActions>
            <MobileMenuButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </MobileMenuButton>
          </Actions>
        </HeaderContainer>
      </StyledHeader>

      <MobileMenuOverlay $isOpen={mobileMenuOpen} onClick={closeMobileMenu} />

      <MobileMenu $isOpen={mobileMenuOpen}>
        {navItems.map((item) => (
          <MobileNavLink
            key={item.href}
            href={item.href}
            onClick={closeMobileMenu}
          >
            {item.label}
          </MobileNavLink>
        ))}
        <MobileMenuDivider />
        {darkModeEnabled && (
          <MobileThemeRow>
            <span>Theme</span>
            <ThemeToggle />
          </MobileThemeRow>
        )}
        <Button
          variant="ghost"
          fullWidth
          href="/contact"
          onClick={closeMobileMenu}
        >
          Contact Sales
        </Button>
        <Button fullWidth href="/signup" onClick={closeMobileMenu}>
          Start Free Trial
        </Button>
      </MobileMenu>
    </>
  );
};

export default Header;
