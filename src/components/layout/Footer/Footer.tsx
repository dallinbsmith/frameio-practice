'use client';

import Link from 'next/link';
import styled from 'styled-components';

import { Container } from '@/components/ui/Container';

const StyledFooter = styled.footer`
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-subtle);
  padding: var(--spacing-16) 0 var(--spacing-8);
`;

const FooterGrid = styled.div`
  display: grid;
  gap: var(--spacing-12);
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: 2fr repeat(4, 1fr);
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-fg-primary);
  text-decoration: none;
  width: fit-content;
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
`;

const BrandDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  line-height: var(--line-height-relaxed);
  max-width: 280px;
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const LinkSectionTitle = styled.h4`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
`;

const LinkList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled(Link)`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  text-decoration: none;
  transition: var(--transition-colors);

  &:hover {
    color: var(--color-fg-primary);
  }
`;

const BottomBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-12);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border-subtle);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Copyright = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
`;

const LegalLinks = styled.div`
  display: flex;
  gap: var(--spacing-6);
`;

const LegalLink = styled(Link)`
  font-size: var(--font-size-sm);
  color: var(--color-fg-tertiary);
  text-decoration: none;

  &:hover {
    color: var(--color-fg-secondary);
  }
`;

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Camera to Cloud', href: '/c2c' },
      { label: 'Pricing', href: '/pricing' },
      { label: "What's New", href: '/changelog' },
    ],
  },
  solutions: {
    title: 'Solutions',
    links: [
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Agencies', href: '/agencies' },
      { label: 'Brands', href: '/brands' },
      { label: 'Media & Entertainment', href: '/media' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'Webinars', href: '/webinars' },
      { label: 'Case Studies', href: '/customers' },
      { label: 'API Docs', href: '/developers' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Security', href: '/security' },
    ],
  },
};

export const Footer = () => {
  return (
    <StyledFooter>
      <Container>
        <FooterGrid>
          <BrandSection>
            <Logo href="/">
              <LogoIcon>F</LogoIcon>
              <span>Frame.io</span>
            </Logo>
            <BrandDescription>
              The world&apos;s leading video review and collaboration platform.
              Part of Adobe.
            </BrandDescription>
          </BrandSection>

          {Object.entries(footerLinks).map(([key, section]) => (
            <LinkSection key={key}>
              <LinkSectionTitle>{section.title}</LinkSectionTitle>
              <LinkList>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </LinkList>
            </LinkSection>
          ))}
        </FooterGrid>

        <BottomBar>
          <Copyright>
            © {new Date().getFullYear()} Adobe. All rights reserved.
          </Copyright>
          <LegalLinks>
            <LegalLink href="/privacy">Privacy</LegalLink>
            <LegalLink href="/terms">Terms</LegalLink>
            <LegalLink href="/cookies">Cookies</LegalLink>
          </LegalLinks>
        </BottomBar>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
