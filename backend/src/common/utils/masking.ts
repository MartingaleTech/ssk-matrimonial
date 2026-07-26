export function maskPhone(phone?: string | null): string | null {
  if (!phone) {
    return phone ?? null;
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }
  const visible = digits.slice(-4);
  const prefix = phone.startsWith('+') ? '+' : '';
  return `${prefix}${'*'.repeat(digits.length - 4)}${visible}`;
}

export function maskEmail(email?: string | null): string | null {
  if (!email || !email.includes('@')) {
    return email ?? null;
  }
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}
