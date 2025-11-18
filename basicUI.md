# Signal Gen: UI Architecture Overview

This document outlines the UI structure of the Signal Gen application. While it's built as a single-page application (SPA) using Vite, its architecture is component-based and mirrors many concepts found in modern frameworks like Next.js, such as a root layout, distinct page components, and client-side navigation.

## 1. Root Layout (`App.tsx`)

`App.tsx` serves as the root layout for the entire application, analogous to a `layout.tsx` file in the Next.js App Router. Its primary responsibilities are:

-   **Authentication Guard:** It performs a simple check on the `isAuthenticated` global state.
    -   If `false`, it renders the full-screen `AuthPage` component, blocking access to the rest of the app.
    -   If `true`, it renders the main application layout.
-   **Core UI Structure:** The main layout is a flex container that establishes the primary visual structure:
    -   **`Sidebar`:** The main navigation component, which is conditionally rendered based on screen size (fixed on desktop, off-canvas on mobile).
    -   **Main Content Wrapper:** A `div` that takes up the remaining screen space. This wrapper contains:
        -   The sticky **`Header`** component.
        -   A `<main>` element that acts as the content area where the active page component is rendered.
-   **Global Overlays:** It's responsible for rendering global, app-wide components that overlay the page content. These are controlled by global state:
    -   `ChatWidget`: The floating AI assistant.
    -   `Toast`: For temporary notifications.
    -   `SharePostModal`, `ViewPostModal`, etc.: App-wide modals.
-   **State & Prop Drilling:** The root layout initializes the main controllers (like `useChat` and `useSignalGenerator`) and passes them down as props to the currently rendered page component.

## 2. Authentication Flow (`AuthPage.tsx`)

This component is a full-page view dedicated to user authentication.

-   **Structure:** It's a self-contained page with a simple card-based UI that includes forms for both login and sign-up.
-   **Behavior:** It manages its own internal state for the forms. Upon a successful (mock) API call, it invokes the `onAuthSuccess` callback passed from `App.tsx`. This triggers the `login()` action in the global store, flipping the `isAuthenticated` flag and causing the root layout to re-render, replacing the `AuthPage` with the main application view.

## 3. Header (`components/Header.tsx`)

The `Header` is a simple, sticky component that sits at the top of the main content area.

-   **Structure:**
    -   On the left, it displays the app logo and title on larger screens. On mobile, it contains the hamburger menu icon to toggle the `Sidebar`.
    -   On the right, it houses user-specific actions, primarily the `NotificationBell` component.
-   **Function:** It's mostly presentational but contains the crucial logic for toggling the mobile sidebar visibility.

## 4. Sidebar (`components/Sidebar.tsx`)

The `Sidebar` is the primary navigation element of the application.

-   **Structure:** A vertical list of `NavLink` components, grouped by category (Analysis, Social, Tools, etc.).
-   **Routing:** It acts as the main client-side router. Each `NavLink` is a button that, when clicked, calls the `setCurrentPage` action from the global store. This state change is the sole driver for which page component gets rendered in the main content area.
-   **Responsiveness:**
    -   On desktop (`lg` and up), it's a fixed-width, visible sidebar.
    -   On smaller screens, it transforms into an off-canvas drawer that slides in from the left, controlled by the `isSidebarOpen` state. An overlay is rendered to cover the main content when the sidebar is open on mobile.

## 5. Page Rendering & Structure (`pages/`)

The `pages/` directory contains all the main views of the application, similar to the `app/` or `pages/` directory in a Next.js project.

-   **Dynamic Rendering:** Instead of file-based routing, the `App.tsx` component uses a large `switch` statement (`renderPage` function) based on the `currentPage` state variable to determine which page component to render.
-   **Component Structure:** Each "page" is a standard React component (e.g., `DashboardPage.tsx`, `SignalGenPage.tsx`). They are designed to fill the `<main>` content area and are responsible for their own internal layout (e.g., using grids, cards, and other components).
-   **Data Flow:** Pages receive necessary data, global state, and action controllers as props from the main `App.tsx` layout. For example, `SignalGenPage` receives the `signalGenController` to manage its specific state and actions.
