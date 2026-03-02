# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Resolution**: Depends on severity and complexity

## Security Best Practices

This project follows these security practices:

### Dependencies

- Dependencies are automatically monitored by Dependabot
- Security updates are prioritized and merged promptly
- Regular audits with `npm audit`

### Code Security

- No secrets or credentials in code
- Environment variables for sensitive configuration
- Input validation and sanitization
- Protection against common vulnerabilities (XSS, injection, etc.)

### CI/CD Security

- Automated security checks in CI pipeline
- Limited permissions for GitHub Actions
- No secrets exposed in logs

## Security-Related Configuration

### Environment Variables

Never commit sensitive data. Use environment variables:

```bash
# Copy the example file
cp .env.example .env.local

# Add your secrets to .env.local (gitignored)
```

### Content Security Policy

When deploying, configure appropriate CSP headers in your hosting platform.

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities.
