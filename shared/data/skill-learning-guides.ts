/** Original Skillmetry study notes and externally hosted learning guides.
 * External courses are linked, not copied or claimed as our own. Reviewed 2026-10-17.
 * Notes are NOT quiz evidence. Course material may change; recheck links periodically.
 */
export type SkillLearningGuide = {
  skillId: string;
  documentation: {title:string;url:string};
  lecture: {title:string;url:string;format:"video"|"course-with-video"|"interactive-course"};
  notes:readonly string[];
  challenge:string;
};
const guides: SkillLearningGuide[] = [
  {
    "skillId": "python",
    "documentation": {
      "title": "Python tutorial",
      "url": "https://docs.python.org/3/tutorial/"
    },
    "lecture": {
      "title": "Beginner Python full course",
      "url": "https://www.freecodecamp.org/news/ultimate-beginners-python-course/",
      "format": "course-with-video"
    },
    "notes": [
      "Variables and collections hold data.",
      "Functions divide work into reusable steps.",
      "Handle exceptions instead of hiding errors."
    ],
    "challenge": "Write a command-line expense tracker that totals and categorizes entries."
  },
  {
    "skillId": "sql",
    "documentation": {
      "title": "PostgreSQL SQL tutorial",
      "url": "https://www.postgresql.org/docs/current/tutorial.html"
    },
    "lecture": {
      "title": "SQL and databases full course",
      "url": "https://www.freecodecamp.org/news/sql-and-databases-full-course",
      "format": "course-with-video"
    },
    "notes": [
      "SELECT retrieves rows; WHERE filters them.",
      "JOIN relates tables through matching keys.",
      "GROUP BY aggregates, while HAVING filters groups."
    ],
    "challenge": "Write queries to identify the three most active users in a sample database."
  },
  {
    "skillId": "math",
    "documentation": {
      "title": "Statistics and probability fundamentals",
      "url": "https://www.khanacademy.org/math/statistics-probability"
    },
    "lecture": {
      "title": "Statistics for data science with Python",
      "url": "https://www.freecodecamp.org/news/learn-pandas-for-data-science/",
      "format": "course-with-video"
    },
    "notes": [
      "Mean and median summarize differently when outliers exist.",
      "Probability expresses uncertainty, not certainty.",
      "Sampling and variance matter before model training."
    ],
    "challenge": "Summarize the spread and median of a small real-world dataset."
  },
  {
    "skillId": "data-processing",
    "documentation": {
      "title": "Pandas getting started tutorials",
      "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html"
    },
    "lecture": {
      "title": "Learn Pandas by building projects",
      "url": "https://www.freecodecamp.org/news/learn-pandas-for-data-science/",
      "format": "course-with-video"
    },
    "notes": [
      "Inspect missing values and data types before cleaning.",
      "Use transformations deliberately and preserve raw input.",
      "Verify counts and distributions after each cleaning step."
    ],
    "challenge": "Clean a CSV and record each step in a reproducible notebook."
  },
  {
    "skillId": "ml-foundations",
    "documentation": {
      "title": "Scikit-learn supervised learning guide",
      "url": "https://scikit-learn.org/stable/supervised_learning.html"
    },
    "lecture": {
      "title": "Machine learning concepts and generative AI introduction",
      "url": "https://www.freecodecamp.org/news/learn-machine-learning-in-2024",
      "format": "course-with-video"
    },
    "notes": [
      "Separate training data from evaluation data.",
      "Pick a baseline model before using complex models.",
      "Check overfitting instead of trusting one training score."
    ],
    "challenge": "Train a baseline classifier with a repeatable train/test split."
  },
  {
    "skillId": "model-evaluation",
    "documentation": {
      "title": "Scikit-learn model evaluation reference",
      "url": "https://scikit-learn.org/stable/modules/model_evaluation.html"
    },
    "lecture": {
      "title": "Scikit-learn metrics crash course",
      "url": "https://www.freecodecamp.org/news/learn-scikit-learn",
      "format": "course-with-video"
    },
    "notes": [
      "Accuracy alone can mislead on imbalanced datasets.",
      "Precision and recall answer different error questions.",
      "Use appropriate data splits and avoid leakage."
    ],
    "challenge": "Compare a confusion matrix with precision and recall for a toy classifier."
  },
  {
    "skillId": "rest-api",
    "documentation": {
      "title": "MDN HTTP overview",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP"
    },
    "lecture": {
      "title": "APIs for beginners — video course",
      "url": "https://www.freecodecamp.org/news/learn-to-code-rest-apis-using-nextjs-14",
      "format": "course-with-video"
    },
    "notes": [
      "GET retrieves, POST creates, PUT/PATCH update.",
      "Use status codes and JSON consistently.",
      "Validate requests and authorize on the server."
    ],
    "challenge": "Design three CRUD endpoints with example requests and responses."
  },
  {
    "skillId": "docker",
    "documentation": {
      "title": "Docker getting started",
      "url": "https://docs.docker.com/get-started/"
    },
    "lecture": {
      "title": "Docker full course for deploying applications",
      "url": "https://www.youtube.com/watch?v=rjjES5IsPdg",
      "format": "video"
    },
    "notes": [
      "Images package app environments; containers run images.",
      "Use Dockerfiles for reproducible builds.",
      "Persist data with volumes rather than ephemeral container layers."
    ],
    "challenge": "Containerize a small web server and run it locally."
  },
  {
    "skillId": "deployment",
    "documentation": {
      "title": "Vercel deployment documentation",
      "url": "https://vercel.com/docs/deployments/overview"
    },
    "lecture": {
      "title": "Learn to deploy and secure full-stack web apps",
      "url": "https://www.freecodecamp.org/news/learn-how-to-deploy-secure-and-automate-full-stack-web-apps",
      "format": "course-with-video"
    },
    "notes": [
      "Separate preview/staging from production environments.",
      "Store credentials in protected environment variables.",
      "Use health checks and rollback plans for every release."
    ],
    "challenge": "Write a staging-to-production checklist for a sample app."
  },
  {
    "skillId": "html",
    "documentation": {
      "title": "MDN HTML structure curriculum",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"
    },
    "lecture": {
      "title": "HTML and CSS course for beginners",
      "url": "https://www.youtube.com/watch?v=dX8396ZmSPk",
      "format": "video"
    },
    "notes": [
      "Use semantic headings, lists, labels and landmarks.",
      "Forms need accessible labels and useful validation.",
      "Correct document structure helps people and assistive tech."
    ],
    "challenge": "Create an accessible registration form without a UI framework."
  },
  {
    "skillId": "css",
    "documentation": {
      "title": "MDN CSS styling curriculum",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"
    },
    "lecture": {
      "title": "CSS full course for beginners",
      "url": "https://www.youtube.com/watch?v=OXGznpKZ_sA",
      "format": "video"
    },
    "notes": [
      "The box model controls spacing and sizing.",
      "Flexbox and Grid solve different layout problems.",
      "Design responsive layouts around content, not one device."
    ],
    "challenge": "Build a responsive two-column layout with keyboard-visible controls."
  },
  {
    "skillId": "javascript",
    "documentation": {
      "title": "JavaScript language guide (MDN)",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    "lecture": {
      "title": "JavaScript for beginners with exercises",
      "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      "format": "video"
    },
    "notes": [
      "Understand values, scope and functions.",
      "Promises and async/await express asynchronous work.",
      "Array methods help transform data without mutation."
    ],
    "challenge": "Build a searchable task list with filter and sort."
  },
  {
    "skillId": "typescript",
    "documentation": {
      "title": "TypeScript handbook",
      "url": "https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
    },
    "lecture": {
      "title": "TypeScript full course for beginners",
      "url": "https://www.freecodecamp.org/news/learn-typescript-with-interactive-lessons",
      "format": "video"
    },
    "notes": [
      "Types help catch mistakes before runtime.",
      "Use unions and narrowing for safe state handling.",
      "Validate external data even when TypeScript types look correct."
    ],
    "challenge": "Replace unsafe any values with validated discriminated unions."
  },
  {
    "skillId": "react",
    "documentation": {
      "title": "React official learning guide",
      "url": "https://react.dev/learn"
    },
    "lecture": {
      "title": "Modern React hands-on video course",
      "url": "https://www.freecodecamp.org/news/learn-react-2024",
      "format": "course-with-video"
    },
    "notes": [
      "Components express reusable UI pieces.",
      "State drives what appears on screen; avoid direct DOM mutations.",
      "Effects synchronize with external systems, not derived values."
    ],
    "challenge": "Build a small interactive filterable project gallery."
  },
  {
    "skillId": "accessibility",
    "documentation": {
      "title": "Web.dev learn accessibility",
      "url": "https://web.dev/learn/accessibility"
    },
    "lecture": {
      "title": "Accessibility guided curriculum",
      "url": "https://web.dev/learn/accessibility",
      "format": "video"
    },
    "notes": [
      "Keyboard access and focus order are fundamental.",
      "Use semantic HTML before adding ARIA.",
      "Check color contrast and provide clear form errors."
    ],
    "challenge": "Audit a page using keyboard-only navigation and a screen reader."
  },
  {
    "skillId": "testing",
    "documentation": {
      "title": "Vitest getting started",
      "url": "https://vitest.dev/guide/"
    },
    "lecture": {
      "title": "JavaScript unit testing with Jest",
      "url": "https://www.freecodecamp.org/news/how-to-test-javascript-code-with-jest",
      "format": "course-with-video"
    },
    "notes": [
      "Test observable behavior rather than implementation trivia.",
      "Cover empty, invalid and failure states.",
      "Keep deterministic tests that can run repeatedly."
    ],
    "challenge": "Write three unit tests for a date formatting helper."
  },
  {
    "skillId": "node",
    "documentation": {
      "title": "Node.js learning center",
      "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs"
    },
    "lecture": {
      "title": "Node.js and Express backend full course",
      "url": "https://www.freecodecamp.org/news/free-8-hour-node-express-course/",
      "format": "course-with-video"
    },
    "notes": [
      "Node runs JavaScript outside the browser.",
      "The event loop coordinates asynchronous callbacks.",
      "Validate requests and handle server errors explicitly."
    ],
    "challenge": "Build a minimal JSON API with input validation."
  },
  {
    "skillId": "authentication",
    "documentation": {
      "title": "Supabase Auth guide",
      "url": "https://supabase.com/docs/guides/auth"
    },
    "lecture": {
      "title": "Node.js Passport and JWT authentication course",
      "url": "https://www.freecodecamp.org/news/learn-to-implement-user-authentication-in-node-apps-using-passport-js",
      "format": "course-with-video"
    },
    "notes": [
      "Authentication proves identity; authorization controls access.",
      "Avoid leaking session tokens to client logs.",
      "Enforce resource ownership server-side on every write."
    ],
    "challenge": "Design owner-only API endpoints and test cross-account denial."
  }
];
export const skillLearningGuides: Readonly<Record<string, SkillLearningGuide>> = Object.fromEntries(guides.map(g=>[g.skillId,g]));
export const curatedGuideSkillIds=guides.map(g=>g.skillId);
