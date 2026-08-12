// Per-domain screening question banks.
// Each quiz: { domain, minutes, questions: [{ q, options: [..], answer (index), why? }] }
// Pass threshold: ceil(0.7 * questions.length)

export const QUIZ_BANKS = {
  mern: {
    minutes: 5,
    questions: [
      {
        q: 'Which lifecycle method in React runs after the component is inserted into the DOM?',
        options: ['render()', 'useEffect (with [] deps)', 'useState()', 'componentDidUnmount'],
        answer: 1,
        why: 'useEffect with empty dependencies is the modern equivalent of componentDidMount.',
      },
      {
        q: 'What does MongoDB use to distribute data across machines?',
        options: ['Partitioning only', 'Sharding', 'Replica sets only', 'SQL joins'],
        answer: 1,
        why: 'Sharding distributes collections across machines; replica sets are redundancy.',
      },
      {
        q: 'Express middleware run in what order?',
        options: ['Random order', 'Alphabetical', 'Declaration order', 'Reverse declaration order'],
        answer: 2,
        why: 'Middleware executes in the order it is registered via app.use / app.METHOD.',
      },
      {
        q: 'What is the primary purpose of JSON Web Tokens (JWT) in a MERN app?',
        options: ['Storing passwords', 'Transmitting authenticated claims', 'Rendering views', 'Caching database queries'],
        answer: 1,
        why: 'JWTs carry signed claims used to authenticate API requests.',
      },
      {
        q: 'Which HTTP status code should a REST API return for a malformed client request?',
        options: ['200 OK', '301 Moved', '400 Bad Request', '500 Internal Error'],
        answer: 2,
        why: '400 signals the client sent something the server cannot process.',
      },
      {
        q: 'A controlled input in React has its value driven by:',
        options: ['The DOM node', 'Browser autofill', 'Component state', 'The URL query string'],
        answer: 2,
        why: 'Controlled inputs read their value from state and update via onChange.',
      },
      {
        q: 'Which is NOT a benefit of environment variables (.env) in a Node server?',
        options: ['Keeping secrets out of source control', 'Portable configuration', 'Encrypting network traffic', 'Per-environment settings'],
        answer: 2,
        why: 'Env vars manage config; TLS handles network encryption.',
      },
    ],
  },

  web: {
    minutes: 4,
    questions: [
      {
        q: 'What is the correct HTML element for the largest heading?',
        options: ['<header>', '<h6>', '<h1>', '<head>'],
        answer: 2,
      },
      {
        q: 'Which CSS property changes the background color?',
        options: ['color', 'bg-color', 'background-color', 'fill'],
        answer: 2,
      },
      {
        q: 'Where should the JavaScript <script> tag ideally load for non-blocking rendering?',
        options: ['In the <head>', 'At the end of <body>', 'Inside a <style> tag', 'In the favicon'],
        answer: 1,
        why: 'Loading scripts before </body> avoids blocking initial render.',
      },
      {
        q: 'What does the CSS display property "flex" enable?',
        options: ['Page printing', 'One-dimensional layout', '3D transforms', 'Table borders'],
        answer: 1,
      },
      {
        q: 'Which HTML attribute provides alternative text for images?',
        options: ['title', 'aria-label', 'alt', 'src'],
        answer: 2,
      },
      {
        q: 'What does "semantic HTML" primarily improve?',
        options: ['File size', 'Accessibility and SEO', 'Download speed', 'Version control'],
        answer: 1,
      },
      {
        q: 'Which box-sizing value makes padding/border not add to an element width?',
        options: ['content-box', 'border-box', 'margin-box', 'auto-box'],
        answer: 1,
      },
    ],
  },

  frontend: {
    minutes: 5,
    questions: [
      {
        q: 'In Next.js, what does "getServerSideProps" enable?',
        options: ['Only static export', 'Server-side rendering per request', 'Client-side caching only', 'Database seeding'],
        answer: 1,
        why: 'getServerSideProps fetches data on the server for each request.',
      },
      {
        q: 'React reconciliation compares what to decide DOM updates?',
        options: ['File timestamps', 'The virtual DOM vs real DOM', 'Network latency', 'Memory addresses'],
        answer: 1,
      },
      {
        q: 'What is the styling philosophy of utility-first CSS (e.g. Tailwind)?',
        options: ['Only inline styles', 'Composing layouts with single-purpose classes', 'Requiring a pre-processor', 'BEM naming only'],
        answer: 1,
      },
      {
        q: 'Which hook memoizes a computed value?',
        options: ['useState', 'useMemo', 'useEffect', 'useRef'],
        answer: 1,
      },
      {
        q: 'What does code-splitting primarily improve?',
        options: ['SEO titles', 'Initial load performance', 'Database speed', 'Server uptime'],
        answer: 1,
      },
      {
        q: 'A <button> vs <div onClick> — why prefer <button>?',
        options: ['It is lighter', 'Keyboard & a11y semantics', 'Better colors', 'No reason'],
        answer: 1,
      },
      {
        q: 'Which tool compiles modern JSX/TypeScript into browser JS?',
        options: ['Webpack/Rollup/Vite', 'MySQL', 'Docker', 'Git'],
        answer: 0,
      },
    ],
  },

  backend: {
    minutes: 5,
    questions: [
      {
        q: 'Which HTTP method is typically safe and idempotent?',
        options: ['POST', 'DELETE', 'GET', 'PATCH'],
        answer: 2,
        why: 'GET does not mutate state and repeated calls return the same result.',
      },
      {
        q: 'What does an N+1 query problem refer to?',
        options: ['HTTP redirect pollution', 'One extra DB query per record in a loop', 'Making N API calls', 'Encrypting twice'],
        answer: 1,
        why: 'N+1 = 1 query for a list plus N queries for its relations. Fix with eager loading/joins.',
      },
      {
        q: 'Which is an ACID database guarantee?',
        options: ['Auto-scaling', 'Atomicity', 'Blue-green deploys', 'Lazy loading'],
        answer: 1,
      },
      {
        q: 'Why are indexes stored separately from table rows?',
        options: ['To save bandwidth', 'To speed up lookups via ordered structures', 'To compress images', 'To simplify caching'],
        answer: 1,
      },
      {
        q: 'What does a connection pool manage?',
        options: ['DNS records', 'Reusable database connections', 'Load balancer IPs', 'TLS certs'],
        answer: 1,
      },
      {
        q: 'Which header is standard for sending an API key or bearer token?',
        options: ['Cookie', 'Authorization', 'X-Client', 'Cache-Control'],
        answer: 1,
      },
      {
        q: 'Rate limiting is primarily used to:',
        options: ['Improve code style', 'Protect resources from abuse', 'Compress payloads', 'Renew certificates'],
        answer: 1,
      },
    ],
  },

  mobile: {
    minutes: 5,
    questions: [
      {
        q: 'Which is a cross-platform mobile framework?',
        options: ['SwiftUI only', 'Flutter', 'Android XML only', 'Core Data'],
        answer: 1,
      },
      {
        q: 'In React Native, the bridge/JSI layer connects JS with what?',
        options: ['Native platform APIs', 'The App Store', 'WiFi drivers', 'Push certificates'],
        answer: 0,
      },
      {
        q: 'What is the purpose of a Dart widget in Flutter?',
        options: ['SQL query runner', 'Configures an immutable UI element', 'HTTP client only', 'State store only'],
        answer: 1,
      },
      {
        q: 'Why must app permissions be requested at runtime on iOS?',
        options: ['To reduce bundle size', 'Privacy & user consent', 'To speed caching', 'To connect to the App Store'],
        answer: 1,
      },
      {
        q: 'Push notifications typically require which service token?',
        options: ['Google Analytics ID', 'APNs / FCM token', 'GitHub token', 'Domain SSL cert'],
        answer: 1,
      },
      {
        q: 'What does "offline-first" architecture prioritize?',
        options: ['Only online sync', 'Local storage as source of truth, synced later', 'Deleting local data', 'Blocking all APIs'],
        answer: 1,
      },
      {
        q: 'Which tool lets you build and share a React Native app without a local build?',
        options: ['Expo', 'Jira', 'Ngrok', 'Docker Hub'],
        answer: 0,
      },
    ],
  },

  datascience: {
    minutes: 5,
    questions: [
      {
        q: 'What does pandas primarily provide for Python?',
        options: ['HTTP servers', 'Data structures for tabular analysis', '3D rendering', 'Compiler optimization'],
        answer: 1,
      },
      {
        q: 'A DataFrame .groupby() operation is most similar to SQL\'s:',
        options: ['SELECT DISTINCT', 'GROUP BY + aggregate', 'JOIN', 'CREATE INDEX'],
        answer: 1,
      },
      {
        q: 'Which is a measure of central tendency?',
        options: ['Standard deviation', 'Variance', 'Median', 'Range'],
        answer: 2,
      },
      {
        q: 'What does "null / missing value imputation" mean?',
        options: ['Dropping all rows', 'Filling missing values with a strategy', 'Encrypting data', 'Sampling with replacement'],
        answer: 1,
        why: 'Imputation fills gaps (mean, median, mode, or model-based) rather than discarding data.',
      },
      {
        q: 'Which visualization is best to show a distribution?',
        options: ['Histogram', 'Pie chart of one value', 'A single number', 'Favicon'],
        answer: 0,
      },
      {
        q: 'Pearson correlation ranges between:',
        options: ['0 and 1', '-1 and 1', '-100 and 100', 'None of these'],
        answer: 1,
      },
      {
        q: 'The .merge() method in pandas is equivalent to SQL:',
        options: ['UNION', 'JOIN', 'ALTER TABLE', 'SELECT *'],
        answer: 1,
      },
    ],
  },

  ai: {
    minutes: 6,
    questions: [
      {
        q: 'What is retrieval-augmented generation (RAG)?',
        options: ['Training a new model', 'Grounding generation with fetched document context', 'Only caching prompts', 'Compressing weights'],
        answer: 1,
        why: 'RAG retrieves relevant context and feeds it to the LLM to reduce hallucination.',
      },
      {
        q: 'What is "grounding" in LLM applications?',
        options: ['Training on GPUs', 'Connecting model output to verifiable sources', 'Deploying to Kubernetes', 'Tokenizing text'],
        answer: 1,
      },
      {
        q: 'Which best describes a "prompt injection" attack?',
        options: ['Network DDoS', 'Malicious instructions embedded in user input', 'SQL injection variant', 'Certificate theft'],
        answer: 1,
      },
      {
        q: 'Vector embeddings represent data as:',
        options: ['SQL rows', 'Numerical vectors in a high-dimensional space', 'HTML tags', 'File paths'],
        answer: 1,
      },
      {
        q: 'What is temperature in LLM sampling?',
        options: ['Hardware temp', 'Controls randomness of output', 'Context window size', 'Learning rate'],
        answer: 1,
      },
      {
        q: 'Which library is built for chaining LLM calls and tools?',
        options: ['LangChain', 'Flask only', 'Django only', 'Wireshark'],
        answer: 0,
      },
      {
        q: 'Fine-tuning an LLM means:',
        options: ['Deleting weights randomly', 'Further training a pretrained model on task data', 'Compressing the model', 'Renaming tokens'],
        answer: 1,
      },
    ],
  },

  ml: {
    minutes: 5,
    questions: [
      {
        q: 'Train/test splitting prevents:',
        options: ['Overfitting to the evaluation', 'Using GPUs', 'Saving models', 'Version control'],
        answer: 0,
        why: 'A held-out test set measures generalization on unseen data.',
      },
      {
        q: 'Overfitting is best characterized as:',
        options: ['Low training error, high test error', 'High accuracy everywhere', 'Slow training', 'High memory use'],
        answer: 0,
      },
      {
        q: 'Which metric is best for an imbalanced classification?',
        options: ['Raw accuracy', 'F1-score', 'Runtime', 'Disk usage'],
        answer: 1,
      },
      {
        q: 'What does gradient descent optimize?',
        options: ['File system cache', 'A cost/loss function', 'Network bandwidth', 'Database schema'],
        answer: 1,
      },
      {
        q: 'Regularization (L2) primarily works to:',
        options: ['Accelerate CPU', 'Penalize large weights to combat overfitting', 'Encrypt models', 'Shrink dataset'],
        answer: 1,
      },
      {
        q: 'A confusion matrix summarizes:',
        options: ['GPUs used', 'TP/FP/TN/FN counts', 'Hyperparameters', 'API latency'],
        answer: 1,
      },
      {
        q: 'Which serves a trained model for live inference in production?',
        options: ['FastAPI + model endpoint', 'Only training notebooks', 'Excel', 'Nmap'],
        answer: 0,
      },
    ],
  },

  dataeng: {
    minutes: 5,
    questions: [
      {
        q: 'What is the core responsibility of an ETL pipeline?',
        options: ['Rendering UIs', 'Extract, transform, and load data into a target store', 'Serving web pages', 'Managing user auth'],
        answer: 1,
      },
      {
        q: 'Apache Airflow schedules work as:',
        options: ['Static HTML pages', 'Directed Acyclic Graphs (DAGs)', 'Stateful widgets', 'Shell aliases'],
        answer: 1,
      },
      {
        q: 'A data warehouse is optimized for:',
        options: ['Low-latency key-value lookups only', 'Analytical queries over large data', 'Hosting websites', 'DNS resolution'],
        answer: 1,
      },
      {
        q: 'What does "idempotent" mean for a pipeline run?',
        options: ['Running twice yields the same result', 'Runs only once ever', 'Requires GPU', 'Outputs random data'],
        answer: 0,
        why: 'Idempotent jobs can be re-run safely without corrupting or duplicating data.',
      },
      {
        q: 'Which is an event-streaming platform?',
        options: ['Kafka', 'Minitab', 'Photoshop', 'HyperTerminal'],
        answer: 0,
      },
      {
        q: 'Schema drift refers to:',
        options: ['Internet dropout', 'Source data shape changing unexpectedly', 'Hardware failure', 'Query caching'],
        answer: 1,
      },
      {
        q: 'dbt is a tool for:',
        options: ['Transformations inside the warehouse', 'Container orchestration', 'Pen testing', 'API mocking'],
        answer: 0,
      },
    ],
  },

  bi: {
    minutes: 4,
    questions: [
      {
        q: 'A KPI is best defined as a:',
        options: ['Random chart', 'Quantifiable measure tied to a business goal', 'CSS class', 'Daily email'],
        answer: 1,
      },
      {
        q: 'Which SQL clause groups rows before aggregation?',
        options: ['GROUP BY', 'HAVING only', 'OFFSET', 'LIMIT'],
        answer: 0,
      },
      {
        q: 'A pivot table / matrix visual is ideal for:',
        options: ['Mobile games', 'Cross-tabulating dimensions vs measures', 'Writing CSS', 'File upload'],
        answer: 1,
      },
      {
        q: 'What does "drill-down" let a user do?',
        options: ['Zoom into finer-grained data', 'Compress files', 'Reduce table size', 'Reboot the server'],
        answer: 0,
      },
      {
        q: 'Year-over-year (YoY) growth compares:',
        options: ['This month vs last month', 'A value to the same period last year', 'Revenue vs profit', 'SQL vs NoSQL'],
        answer: 1,
      },
      {
        q: 'A live "awareness → consideration → conversion" funnel measures:',
        options: ['Infrastructure cost', 'Drop-off across sales stages', 'Code coverage', 'Churn from a single line'],
        answer: 1,
      },
      {
        q: 'The best chart to show trend over time is a:',
        options: ['Line chart', 'Pie chart', 'Word cloud', 'Static image'],
        answer: 0,
      },
    ],
  },

  cyber: {
    minutes: 6,
    questions: [
      {
        q: 'What is penetration testing?',
        options: ['Stress-testing CPUs', 'Authorized exploitation to find vulnerabilities', 'Crypto mining', 'Password guessing for fun'],
        answer: 1,
        why: 'Pentesting is always authorized, scoped, and documented.',
      },
      {
        q: 'A phishing email’s main goal is:',
        options: ['Improve UX', 'Trick users into revealing credentials or running malware', 'Speed up networks', 'Patch software'],
        answer: 1,
      },
      {
        q: 'Which tool scans for open ports and services?',
        options: ['Nmap', 'Excel', 'Figma', 'Git'],
        answer: 0,
      },
      {
        q: 'The BEST defense against SQL injection is:',
        options: ['Disabling errors', 'Parameterized / prepared queries', 'Hiding the database', 'Changing DB names'],
        answer: 1,
      },
      {
        q: 'Multi-factor authentication adds:',
        options: ['A second browser', 'Extra proof of identity beyond a password', 'CPU cores', 'More bandwidth'],
        answer: 1,
      },
      {
        q: 'A SIEM primarily does:',
        options: ['Aggregates & analyzes security logs', 'Renders dashboards for marketing', 'Backs up photos', 'Hosts websites'],
        answer: 0,
      },
      {
        q: 'Patching quickly is critical for:',
        options: ['Reducing the window of publicly known exploits', 'Aesthetics', 'Disk space', 'SEO'],
        answer: 0,
      },
    ],
  },

  devops: {
    minutes: 5,
    questions: [
      {
        q: 'What is a container?',
        options: ['A VM', 'An isolated runtime bundling app + dependencies', 'A physical server', 'A git branch'],
        answer: 1,
      },
      {
        q: 'Kubernetes primarily automates:',
        options: ['Deployment, scaling & management of containers', 'Writing tests', 'Syntax coloring', 'API mocking'],
        answer: 0,
      },
      {
        q: 'CI/CD stands for:',
        options: ['Continuous Integration / Continuous Delivery', 'Container Instrument / Continuous Deploy', 'Code Inject / Cache Delete', 'Compute Info / Code Debug'],
        answer: 0,
      },
      {
        q: 'Infrastructure-as-Code means:',
        options: ['Drawing diagrams', 'Managing infrastructure via versioned config', 'Manual SSH', 'Excel spreadsheets'],
        answer: 1,
      },
      {
        q: 'A blue/green deployment:',
        options: ['Uses two environments to enable instant rollback', 'Uses two colors of logs', 'Deploys once a day', 'Only affects CSS'],
        answer: 0,
      },
      {
        q: 'Which tool continuously monitors metrics & alerts?',
        options: ['Prometheus', 'Internet Explorer', 'MS Paint', 'WireShark only'],
        answer: 0,
      },
      {
        q: 'Health checks in orchestration allow:',
        options: ['Restarting/removing unhealthy instances', 'Pretty errors', 'Smaller images', 'Better icons'],
        answer: 0,
      },
    ],
  },

  network: {
    minutes: 4,
    questions: [
      {
        q: 'An IP address provides:',
        options: ['Physical device case color', 'A logical host address on a network', 'Wifi password', 'CPU speed'],
        answer: 1,
      },
      {
        q: 'What does a switch do at layer 2?',
        options: ['Forwards frames based on MAC addresses', 'Routes between networks', 'Encrypts WAN links', 'Renders pages'],
        answer: 0,
      },
      {
        q: 'OSPF is what type of protocol?',
        options: ['Dynamic routing', 'A file format', 'DNS record type', 'Charging standard'],
        answer: 0,
      },
      {
        q: 'A subnet mask / CIDR prefix determines:',
        options: ['Monitor refresh rate', 'Which hosts belong to a network segment', 'Power consumption', 'Keyboard layout'],
        answer: 1,
      },
      {
        q: 'The loopback address 127.0.0.1 is used to:',
        options: ['Reach the internet', 'Address the local host itself', 'Connect satellites', 'Split VLANs'],
        answer: 1,
      },
      {
        q: 'Wireshark is used to:',
        options: ['Capture and inspect packets', 'Design logos', 'Compile JS', 'Schedule jobs'],
        answer: 0,
      },
      {
        q: 'VLANs logically segment networks at which layer?',
        options: ['Layer 2', 'Layer 0', 'Physical drive', 'None'],
        answer: 0,
      },
    ],
  },

  uiux: {
    minutes: 4,
    questions: [
      {
        q: 'What is a design system?',
        options: ['A folder of icons only', 'A unified set of reusable components, tokens, and rules', 'A color palette only', 'A CSS framework'],
        answer: 1,
      },
      {
        q: 'Usability testing measures:',
        options: ['Code speed', 'How easily real users complete tasks', 'GPU usage', 'Font rendering'],
        answer: 1,
      },
      {
        q: 'Good visual hierarchy ensures users:',
        options: ['See everything equally', 'Focus on the most important content first', 'Never scroll', 'Read the footer'],
        answer: 1,
      },
      {
        q: '"White space" (negative space) primarily:',
        options: ['Wastes pixels', 'Improves readability & focus', 'Slows rendering', 'Hides content'],
        answer: 1,
      },
      {
        q: 'Figma is primarily used for:',
        options: ['Deploying servers', 'Collaborative UI design & prototyping', 'Hosting videos', 'Querying SQL'],
        answer: 1,
      },
      {
        q: 'Contrast ratio matters most for:',
        options: ['Accessibility', 'Download speed', 'File size', 'Compilers'],
        answer: 0,
      },
      {
        q: 'An empathetic user persona is built from:',
        options: ['Developer opinions', 'Research & data about target users', 'Random names', 'Trendy fonts'],
        answer: 1,
      },
    ],
  },
}

export function passMark(domain) {
  const bank = QUIZ_BANKS[domain]
  if (!bank) return 0
  return Math.ceil(0.7 * bank.questions.length)
}