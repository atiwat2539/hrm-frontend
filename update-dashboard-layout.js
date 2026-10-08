const fs = require('fs');
let code = fs.readFileSync('src/components/layout/DashboardLayout.tsx', 'utf8');

if (!code.includes('useRouter')) {
  code = code.replace(/usePathname } from 'next\/navigation';/, "usePathname, useRouter } from 'next/navigation';");
}

if (!code.includes('const router = useRouter()')) {
  code = code.replace(/const pathname = usePathname\(\);/, 'const pathname = usePathname();\n  const router = useRouter();');
}

const timeoutLogic = `
  // Auto Logout Logic (30 minutes of inactivity)
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;

    let timeoutId;

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // 30 minutes
      timeoutId = setTimeout(logout, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [pathname, router]);
`;

if (!code.includes('Auto Logout Logic')) {
  code = code.replace(/if \(pathname === '\/login' \|\| pathname === '\/register'\) \{/, timeoutLogic + '\n  if (pathname === \'/login\' || pathname === \'/register\') {');
}

if (!code.includes('useEffect')) {
  code = code.replace(/import { useState } from 'react';/, "import { useState, useEffect } from 'react';");
}

fs.writeFileSync('src/components/layout/DashboardLayout.tsx', code, 'utf8');
console.log('Done!');
