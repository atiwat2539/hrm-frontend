const fs = require('fs');

let code = fs.readFileSync('src/components/layout/DashboardLayout.tsx', 'utf8');

const regex = /\/\/ Auto Logout Logic[\s\S]*?resetTimeout\(\);\s*return \(\) => \{[\s\S]*?\}\s*\}, \[pathname, router\]\);/;

const newLogic = `// Auto Logout Logic (15 minutes of inactivity)
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;

    let intervalId: ReturnType<typeof setInterval>;
    let lastActionTime = Date.now();

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    };

    const checkIdle = () => {
      // 15 minutes = 15 * 60 * 1000 = 900000 ms
      if (Date.now() - lastActionTime >= 15 * 60 * 1000) {
        logout();
      }
    };

    const updateActivity = () => {
      lastActionTime = Date.now();
    };

    // Check every minute
    intervalId = setInterval(checkIdle, 60 * 1000);

    // Removed 'mousemove' as micro-movements of optical mice can prevent idle detection
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [pathname, router]);`;

if (code.match(regex)) {
  code = code.replace(regex, newLogic);
  fs.writeFileSync('src/components/layout/DashboardLayout.tsx', code, 'utf8');
  console.log('Successfully updated session timeout logic.');
} else {
  console.log('Could not find the auto logout logic block.');
}
