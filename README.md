# CircusSync - Performance Production Company Management App

CircusSync is a comprehensive management application designed specifically for entertainment production companies. It helps manage clients, performers, gigs, contracts, and more - all in one intuitive interface.

## Features

- **Client Management**: Track client contacts, event history, preferences, and follow-up reminders
- **Performer Database**: Manage performer details, skills, availability, and payment rates
- **Event Planning**: Organize gigs with detailed information about venues, schedules, and required resources
- **Contract & Payment Tracking**: Generate contracts and keep track of deposits and payments
- **Calendar Views**: Visualize your schedule with intuitive calendar interfaces
- **Task Management**: Never miss a follow-up with built-in task management
- **Agent Relationships**: Track agent partnerships and commission structures

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/circussync.git
cd circussync
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
circussync/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   ├── routes/                # SvelteKit routes
│   │   ├── +layout.svelte     # Main app layout
│   │   ├── +page.svelte       # Dashboard
│   │   ├── login/+page.svelte # Login page
│   │   ├── clients/           # Client management pages
│   │   ├── performers/        # Performer management pages
│   │   ├── events/            # Event management pages
│   │   └── agents/            # Agent management pages
│   ├── lib/
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # UI components (buttons, modals, etc.)
│   │   │   ├── clients/       # Client-related components
│   │   │   ├── performers/    # Performer-related components
│   │   │   ├── events/        # Event-related components
│   │   │   └── dashboard/     # Dashboard components
│   │   ├── stores/            # Svelte stores
│   │   │   ├── clientStore.ts
│   │   │   ├── performerStore.ts
│   │   │   ├── eventStore.ts
│   │   │   └── agentStore.ts
│   │   ├── services/          # Services for external APIs
│   │   │   ├── database.ts    # Firebase database service
│   │   │   ├── auth.ts        # Authentication service
│   │   │   ├── storage.ts     # File storage service
│   │   │   └── notifications.ts # Notification service
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   └── static/                # Static assets
├── package.json
└── tsconfig.json
```

## Database Setup

CircusSync uses Firebase for the backend. To set up your database:

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database, Authentication, and Storage
3. Configure Authentication to allow email/password sign-in
4. Create the following Firestore collections:
   - `clients`
   - `performers`
   - `events`
   - `agents`
   - `tasks`
   - `users`
   - `notifications`
   - `documents`

## Customization

### Tailwind CSS

The app uses Tailwind CSS for styling. You can customize the theme in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Customize your color palette here
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          // ...and so on
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Firebase Rules

Secure your Firebase database with these recommended rules:

```
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Add more granular rules as needed
  }
}
```

## Deployment

To build and deploy CircusSync:

1. Build the production version
```bash
npm run build
# or
yarn build
```

2. Preview the production build locally
```bash
npm run preview
# or
yarn preview
```

3. Deploy to your preferred hosting platform (such as Firebase Hosting, Vercel, or Netlify)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Svelte and SvelteKit for the frontend framework
- Firebase for backend services
- Tailwind CSS for styling
- Lucide icons for beautiful SVG icons