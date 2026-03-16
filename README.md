# SkillTube Frontend Documentation

 This document will help you understand the frontend part of the SkillTube project.

## Project Overview
This represents the part of SkillTube that the user actually sees and interacts with. It looks and feels similar to modern video streaming platforms. We have screens for watching videos, browsing categories, searching for specific topics, and a profile section to view saved content. There is also an admin area for uploading content.

## Tech Stack
These are the main tools we use to build the screens:
- **React (Version 19)**: The core library we use to build everything block by block (components).
- **Vite**: The tool that bundles our code together very quickly during development.
- **TailwindCSS**: Used for styling the application. Instead of long CSS files, we use short classes directly inside our React components to describe how they should look.
- **Redux Toolkit**: A smart storage system that keeps track of app-wide data, like keeping track of whether the user is logged in across all pages.
- **React Router**: Manages the different pages in our app without making the browser reload entirely.
- **Framer Motion**: We use this to make things look smooth and dynamic with animations.

## How the Code is Organized
Everything important lives inside the `src/` folder. Here is a breakdown:

- **pages/**: These are full screens in the app. For example, `HomePage.jsx` is the main screen, and `PlayerPage.jsx` is where the video plays. There is a whole subfolder here called `admin/` for the management dashboard.
- **components/**: These are the reusable building blocks. For example, `VideoPlayer.jsx` or `BottomNav.jsx`.
- **api/**: This is where we make network requests to the backend server. It keeps our page code clean because we just call an API function instead of writing the same request multiple times.
- **redux/**: The shared memory. If the login process happens here, we save the user's data so the profile page can display their name without making another server request.
- **constants/**: Small pieces of configuration data that don't change, grouped into one place to avoid hardcoding strings all over the files.
- **utils/**: Helper functions. For example, we have one to manage sound effects (`sounds.js`).

## Understanding the Flow
The starting point of the app is `main.jsx`, which loads `App.jsx`. 
If you look inside `App.jsx`, you will see a list of Routes. This acts like a map. It says, "If the user goes to `/search`, show them the `SearchPage`." 
The layout also manages when to show the bottom navigation bar and when to hide it (like when a video is taking up the full screen).

## System Risks and Things to Look Out For
You need to be cautious about a few things:
- **Video Loading Issues**: High-quality videos might take a long time to load. Make sure the user always sees a loading state (like the ones in the `skeletons/` folder) instead of a broken screen.
- **Mobile First**: A bad experience on a phone is unacceptable. Always double-check how components behave on small screens, ensuring the TailwindCSS classes scale down properly.
- **State Management Mismatches**: Be careful when dealing with Redux. Changing shared data by accident can cause bugs on completely unrelated pages because they share the same memory.

## How to Get Started Locally
To run this code on your computer:
1. Make sure you have Node.js installed.
2. Open your terminal in the `SkillTube-frontend` folder.
3. Make sure to create a `.env` file to point to your local or staging backend server. (Like `VITE_API_URL=http://localhost:3000/api`)
4. Run `npm install` to get the dependencies.
5. Run `npm run dev` to start the local website. Click the localhost link in the terminal to view it in your browser.
