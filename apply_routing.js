const fs = require('fs');

// Helpers for reading/writing
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, c) => fs.writeFileSync(f, c);

// --- APP.JSX ---
let app = read('frontend/src/App.jsx');

// 1. Add getAllSubjects import
app = app.replace(
  "import { getSemesterForSubject } from './data/subjects';",
  "import { getSemesterForSubject, getAllSubjects } from './data/subjects';"
);

// 2. Add navigate helper at the top of App component (after states)
const navigateHelper = `
  const navigate = (path, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    window.dispatchEvent(new Event('popstate'));
  };
`;
// Insert after const [blockedState, setBlockedState] = useState(null);
app = app.replace(
  "const [blockedState, setBlockedState] = useState(null);",
  "const [blockedState, setBlockedState] = useState(null);\n" + navigateHelper
);

// 3. Replace handleHashChange and useEffect
const oldRouterEffect = `    const handleHashChange = () => {
      const rawHash = window.location.hash;
      
      // Let MSAL process its own authentication hashes (code, state, error) in the popup/redirect
      if (rawHash.includes('code=') || rawHash.includes('state=') || rawHash.includes('error=')) {
        return; 
      }
      
      if (!rawHash || rawHash === '') {
        // If they navigate back to the root without a hash, let the browser handle it.
        // It will either exit the site naturally or just clear the hash.
        return;
      }

      const hash = rawHash.replace('#', '');
      
      if (hash === 'subject-detail') {
        // If they navigate to subject-detail but no subject is in state (e.g. refresh), go home
        if (!selectedSubject) {
          window.location.replace('#home');
          setActiveView('home');
          trackActivity('VIEW_PAGE', 'Home Page');
          trackPageView('home');
        } else {
          setActiveView('subject-detail');
          setActivePdfFile(null); // Ensure PDF is closed if they back out
          trackActivity('VIEW_PAGE', \`Subject: \${selectedSubject.code || selectedSubject.name}\`);
          trackPageView('subject_detail', { subject_code: selectedSubject.code || 'unknown' });
        }
      } else if (hash === 'pdf-viewer') {
        // Do nothing on hashchange to pdf-viewer.
        // The PDF modal is opened by handleViewFile setting activePdfFile synchronously.
        // If we check activePdfFile here, it fails due to stale closures.
      } else if (hash.startsWith('semester-') || hash.startsWith('year-')) {
        setActiveView(hash);
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', \`Semester/Year Grid: \${hash}\`);
        trackPageView('subject_grid', { grid_name: hash });
      } else if (hash === 'credits') {
        setActiveView('credits');
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', 'Credits Modal');
        trackPageView('credits');
      } else if (hash === 'home' || hash === 'admin' || hash === 'downloads' || hash === 'saved' || hash === 'profile') {
        setActiveView(hash);
        setActivePdfFile(null);
        
        let pageName = hash.charAt(0).toUpperCase() + hash.slice(1);
        if (hash === 'admin') pageName = 'Admin Panel';
        trackActivity('VIEW_PAGE', \`\${pageName} Page\`);
        trackPageView(hash);

        if (hash === 'home') {
          setSelectedSubject(null);
          secureStorage.removeItem('backbenchers_selected_subject');
        }
      } else {
        // Default fallback
        setActiveView('home');
        setActivePdfFile(null);
        window.location.replace('#home');
        trackActivity('VIEW_PAGE', 'Home Page (Fallback)');
        trackPageView('home', { navigation_result: 'fallback' });
      }

      // Automatically close sidebar on navigating for all devices (mobile + laptop)
      setSidebarCollapsed(true);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initialize hash on load
    if (!window.location.hash) {
      window.history.pushState(null, '', '#buffer'); // Extra buffer layer
      window.location.hash = 'home'; // Push instead of replace
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedSubject]);`;

const newRouterEffect = `    const handleRoute = () => {
      // MSAL processes its own authentication hashes
      if (window.location.hash.includes('code=') || window.location.hash.includes('state=')) return;
      
      const path = window.location.pathname;
      let view = path === '/' ? 'home' : path.slice(1);
      
      // Dynamic Title & Meta mapping
      let title = "Backbenchers | JKLU B.Tech Notes & PYQs";
      
      if (view.startsWith('semester/')) {
        view = view.replace('semester/', 'semester-');
        title = \`Semester \${view.split('-')[1]} Subjects | JKLU B.Tech PYQs\`;
      } else if (view.startsWith('year/')) {
        view = view.replace('year/', 'year-').replace('/', '-');
        title = \`Year \${view.split('-')[1]} Subjects | JKLU B.Tech PYQs\`;
      } else if (view.startsWith('subject/')) {
        const code = view.split('/')[1];
        view = 'subject-detail';
        const allSubs = getAllSubjects();
        const sub = allSubs.find(s => s.code === code);
        
        if (sub && (!selectedSubject || selectedSubject.code !== code)) {
           setSelectedSubject(sub);
           secureStorage.setItem('backbenchers_selected_subject', JSON.stringify(sub));
        }
        
        const subjName = sub ? sub.name : (selectedSubject ? selectedSubject.name : code);
        title = \`\${code} \${subjName} PYQs | JKLU Backbenchers\`;
      } else if (view === 'downloads' || view === 'saved' || view === 'profile' || view === 'admin') {
        title = \`\${view.charAt(0).toUpperCase() + view.slice(1)} | Backbenchers JKLU\`;
      }
      
      document.title = title;

      const hash = view;
      
      if (hash === 'subject-detail') {
        if (!selectedSubject && !path.startsWith('/subject/')) {
          navigate('/', true);
          setActiveView('home');
        } else {
          setActiveView('subject-detail');
          setActivePdfFile(null);
          trackActivity('VIEW_PAGE', \`Subject: \${path}\`);
          trackPageView('subject_detail', { subject_code: path });
        }
      } else if (hash === 'pdf-viewer') {
        // Keep modal
      } else if (hash.startsWith('semester-') || hash.startsWith('year-')) {
        setActiveView(hash);
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', \`Semester/Year Grid: \${hash}\`);
        trackPageView('subject_grid', { grid_name: hash });
      } else if (hash === 'credits') {
        setActiveView('credits');
        setActivePdfFile(null);
      } else if (hash === 'home' || hash === 'admin' || hash === 'downloads' || hash === 'saved' || hash === 'profile') {
        setActiveView(hash);
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', \`\${hash} Page\`);
        trackPageView(hash);
        if (hash === 'home') {
          setSelectedSubject(null);
          secureStorage.removeItem('backbenchers_selected_subject');
        }
      } else {
        setActiveView('home');
        setActivePdfFile(null);
        navigate('/', true);
      }
      setSidebarCollapsed(true);
    };

    window.addEventListener('popstate', handleRoute);
    handleRoute();

    return () => window.removeEventListener('popstate', handleRoute);
  }, [selectedSubject]);`;

// Need to escape regex for replace, so we just use string replace since we have the exact old code
// But wait, there might be slight whitespace differences. Let's do it carefully.
// Instead of large replace, let's use a regex to find the block
app = app.replace(/const handleHashChange = \(\) => \{[\s\S]*?return \(\) => window\.removeEventListener\('hashchange', handleHashChange\);\s*\}, \[selectedSubject\]\);/, newRouterEffect);

// 4. Replace other window.location calls in App.jsx
app = app.replace(/window\.location\.replace\('#home'\)/g, "navigate('/', true)");
app = app.replace(/window\.location\.replace\('#' \+ nextView\)/g, "navigate('/' + nextView, true)");
app = app.replace(/window\.location\.replace\(`#\$\{semNum\}`\)/g, "navigate(`/${semNum.replace('-', '/')}`, true)");
app = app.replace(/window\.location\.replace\(`#semester-\$\{semNum\}`\)/g, "navigate(`/semester/${semNum}`, true)");
app = app.replace(/window\.location\.hash = 'home'/g, "navigate('/')");
app = app.replace(/window\.location\.hash = 'subject-detail'/g, "navigate(`/subject/${subject.code || selectedSubject.code}`)");
// Fix the handleSelectSubject navigation
app = app.replace(
  "window.location.hash = 'subject-detail';",
  "navigate(`/subject/${subject.code}`);"
);
app = app.replace(/window\.location\.hash = 'pdf-viewer'/g, "// modal opens over current path");
app = app.replace(/window\.location\.hash = view/g, "navigate(`/${view}`)");

// Note: handleLogout
app = app.replace(
  "window.location.hash = 'home';",
  "navigate('/');"
);

write('frontend/src/App.jsx', app);


// --- HOME.JSX ---
let home = read('frontend/src/components/Home.jsx');
home = home.replace(/window\.location\.hash = `year-\$\{idx \+ 1\}-\$\{branch\.id\}`/g, "window.history.pushState(null, '', `/year/${idx + 1}/${branch.id}`); window.dispatchEvent(new Event('popstate'));");
home = home.replace(/window\.location\.hash = year\.action\.hash/g, "window.history.pushState(null, '', `/${year.action.hash.replace('#', '')}`); window.dispatchEvent(new Event('popstate'));");
home = home.replace(/window\.location\.hash = 'semester-' \+ sem\.num/g, "window.history.pushState(null, '', `/semester/${sem.num}`); window.dispatchEvent(new Event('popstate'));");
write('frontend/src/components/Home.jsx', home);


// --- NAVBAR.JSX ---
let navbar = read('frontend/src/components/Navbar.jsx');
navbar = navbar.replace(/window\.location\.hash = 'home'/g, "window.history.pushState(null, '', '/'); window.dispatchEvent(new Event('popstate'));");
navbar = navbar.replace(/window\.location\.hash = 'profile'/g, "window.history.pushState(null, '', '/profile'); window.dispatchEvent(new Event('popstate'));");
write('frontend/src/components/Navbar.jsx', navbar);


// --- ANALYTICS.JSX ---
let analytics = read('frontend/src/analytics.js');
analytics = analytics.replace(
  "const route = () => window.location.hash.replace('#', '') || 'login';",
  "const route = () => window.location.pathname.slice(1) || 'home';"
);
write('frontend/src/analytics.js', analytics);

console.log('Routing files updated successfully');
