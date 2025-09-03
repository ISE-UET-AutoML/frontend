# 🚀 Frontend Development Guide

## Table of Contents
- [🏗️ Project Overview](#-project-overview)
- [📂 Repository Structure](#-repository-structure)
- [🛠️ Development Setup](#-development-setup)
- [🧭 Routing System](#-routing-system)
- [🎨 Component Architecture](#-component-architecture)
- [💅 Styling Guide](#-styling-guide)
- [🔄 State Management](#-state-management)
- [📡 API Layer](#-api-layer)
- [🎯 Adding New Features](#-adding-new-features)
- [🧪 Testing](#-testing)
- [📦 Building & Deployment](#-building--deployment)
- [🎨 shadcn/ui Integration](#-shadcnui-integration)

---

## 🏗️ Project Overview

This is a **React 18** frontend for an **Automated Machine Learning (AutoML)** platform. The application enables users to train, deploy, and manage ML models through an intuitive web interface.

### **Tech Stack**
- **Framework**: React 18 + JavaScript/TypeScript
- **Routing**: React Router v6
- **UI Libraries**: Ant Design + shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Create React App + Webpack
- **Animations**: Framer Motion

### **Key Features**
- 🤖 ML model training workflows
- 📊 Real-time training progress monitoring  
- 🚀 One-click model deployment
- 📈 Training metrics visualization
- 💾 Dataset management
- 🏷️ Data labeling interface
- ☁️ Cloud infrastructure integration

---

## 📂 Repository Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                  # API service layer
│   ├── assets/               # Images, icons, fonts
│   ├── components/           # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── common/          # Shared utilities
│   │   └── [Feature]/       # Feature-specific components
│   ├── constants/           # Application constants
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Page layout components
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── routes/              # Routing configuration
│   ├── stores/              # Zustand state stores
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Root component
│   ├── index.js             # Application entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies & scripts
├── tailwind.config.js       # Tailwind configuration
├── jsconfig.json           # Path resolution
└── webpack.config.js       # Build configuration
```

---

## 🛠️ Development Setup

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Git

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npm start
# or
yarn start
```

### **Development Server**
- **URL**: `http://localhost:3000`
- **Hot Reload**: Enabled (changes reflect immediately)
- **Environment**: Development mode with debugging enabled

### **Environment Variables**
Create `.env` file in root:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ML_API_URL=http://localhost:3008
REACT_APP_ENVIRONMENT=development
```

---

## 🧭 Routing System

### **Route Architecture**

The application uses **React Router v6** with a nested routing structure:

```javascript
// src/routes/index.js
export const router = createBrowserRouter([
  authed,      // Protected routes
  nonAuthed,   // Public routes  
  error404,    // Error handling
  testing      // Development routes
])
```

### **Route Types**

#### **🌐 Public Routes** (`src/routes/nonAuthed.js`)
```javascript
const routes = {
  element: <NonAuthed />,
  children: [
    { path: '/', element: <Home /> },           // Landing page
    { path: '/login', element: <Login /> },     // Authentication
    { path: '/signup', element: <SignUp /> },   // Registration
  ]
}
```

#### **🔒 Protected Routes** (`src/routes/authed.js`)
```javascript
const routes = {
  element: <DefaultLayout />,
  children: [
    { path: '/app', element: <RequireAuth /> },
    { path: '/app/projects', element: <Projects /> },
    { 
      path: '/app/project/:id', 
      element: <ProjectLayout />,
      children: [
        { path: 'build/uploadData', element: <UploadData /> },
        { path: 'build/training', element: <Training /> },
        { path: 'experiments', element: <Experiments /> },
        { path: 'deploy', element: <Deploy /> }
      ]
    }
  ]
}
```

### **Layout System**

#### **Layout Hierarchy**
```
DefaultLayout              # Global navigation & polling
├── NonAuthed             # Public pages wrapper
├── RequireAuth           # Authentication guard
└── ProjectLayout         # Project-specific navigation
    └── DatasetLayout     # Dataset-specific layout
```

#### **Layout Components**
- **DefaultLayout**: NavBar, global state management, polling managers
- **ProjectLayout**: Project sidebar, breadcrumbs, project context
- **RequireAuth**: Authentication verification, redirect handling

---

## 🎨 Component Architecture

### **Component Organization**

#### **📁 Directory Structure**
```
src/components/
├── ui/                    # Design system components (shadcn/ui)
├── common/               # Shared utility components
├── Dataset/              # Dataset management components
├── LabelStudio/          # Data annotation interface
├── LandingPage/          # Marketing page sections
├── LiveInfer/            # Real-time inference
├── Predict/              # Model prediction interface
└── [Individual Components] # Standalone shared components
```

#### **🎯 Component Categories**

1. **UI Components** (`ui/`)
   - Design system primitives
   - shadcn/ui components
   - Consistent styling & behavior

2. **Feature Components**
   - **Dataset/**: Data upload, visualization, management
   - **LabelStudio/**: Annotation tools, labeling interface
   - **Predict/**: Model inference, result display

3. **Shared Components**
   - **Loading.jsx**: Loading states & spinners
   - **Table.jsx**: Data tables with pagination
   - **Toast.jsx**: Notification system
   - **NavBar.jsx**: Global navigation
   - **TrainingChart.jsx**: Real-time metrics visualization

### **Component Naming Conventions**
- **PascalCase**: All component files (`MyComponent.jsx`)
- **Descriptive Names**: Clear purpose (`UserProfileCard.jsx`)
- **Feature Prefixes**: Group related components (`DatasetUploadForm.jsx`)

---

## 💅 Styling Guide

### **Styling Architecture**

The project uses a **multi-layer styling approach**:

1. **Tailwind CSS**: Utility-first framework for rapid development
2. **Ant Design**: Pre-built components with consistent design
3. **shadcn/ui**: Modern design system components
4. **Custom CSS**: Component-specific styles when needed

### **Tailwind Configuration**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn/ui design tokens
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // Custom brand colors
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

### **CSS Architecture**

#### **Global Styles** (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn/ui CSS variables */
    --primary: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96%;
    /* Custom variables */
    --brand-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

@layer components {
  /* Custom component styles */
  .btn-gradient {
    @apply bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700;
  }
}
```

### **Styling Best Practices**

#### **✅ Recommended Patterns**
```jsx
// Use Tailwind classes for layout & spacing
<div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md">
  
// Combine with shadcn/ui components
<Button variant="outline" size="lg" className="w-full">
  Custom Button
</Button>

// Use CSS variables for consistent theming
<div className="bg-primary text-primary-foreground">
  Themed content
</div>
```

#### **❌ Avoid These Patterns**
```jsx
// Don't use inline styles
<div style={{margin: '20px', padding: '10px'}}>

// Don't mix conflicting approaches
<div className="p-4" style={{padding: '20px'}}>

// Don't use magic numbers
<div className="mt-[23px] ml-[17px]">
```

---

## 🔄 State Management

### **Zustand Stores**

The application uses **Zustand** for state management with a modular store approach:

```
src/stores/
├── trainingStore.js      # ML training state & progress
├── deployStore.js        # Model deployment state
└── pollingStore.js       # Real-time data polling
```

### **Store Architecture**

#### **Training Store Example**
```javascript
// src/stores/trainingStore.js
import { create } from "zustand";
import { persist } from 'zustand/middleware';

const useTrainingStore = create(
  persist(
    (set, get) => ({
      // State
      trainingTasks: {},
      onExperimentDone: null,

      // Actions
      setOnExperimentDone: (cb) => set({ onExperimentDone: cb }),
      
      startTrainingTask: (experimentId) => {
        // Training logic with real-time polling
        const pollTraining = async () => {
          try {
            const res = await getTrainingProgress(experimentId);
            // Update state based on response
            set((state) => ({
              trainingTasks: {
                ...state.trainingTasks,
                [experimentId]: {
                  status: res.data.status,
                  progress: res.data.progress,
                  elapsed: calculateElapsedTime(startTime)
                }
              }
            }));
          } catch (err) {
            console.error(err);
          }
          setTimeout(pollTraining, 10000); // Poll every 10s
        };
        pollTraining();
      }
    }),
    { 
      name: 'training-store',
      partialize: (state) => ({ trainingTasks: state.trainingTasks })
    }
  )
);

export default useTrainingStore;
```

#### **Using Stores in Components**
```jsx
import useTrainingStore from 'src/stores/trainingStore';

function TrainingDashboard() {
  const { trainingTasks, startTrainingTask } = useTrainingStore();
  
  const handleStartTraining = (experimentId) => {
    startTrainingTask(experimentId);
  };

  return (
    <div>
      {Object.values(trainingTasks).map(task => (
        <TrainingCard key={task.experimentId} task={task} />
      ))}
    </div>
  );
}
```

### **State Management Patterns**

#### **✅ Best Practices**
- **Single Responsibility**: One store per domain (training, deployment, etc.)
- **Persistence**: Use `persist` middleware for important state
- **Async Actions**: Handle API calls within store actions
- **Computed Values**: Derive state in selectors, not components

#### **❌ Anti-Patterns**
- Don't put UI state in global stores
- Don't mutate state directly
- Don't create too many small stores
- Don't forget to handle loading/error states

---

## 📡 API Layer

### **API Service Organization**

```
src/api/
├── axios.js              # HTTP client configuration
├── auth.js              # Authentication endpoints
├── project.js           # Project CRUD operations  
├── experiment.js        # ML experiment management
├── model.js             # Model lifecycle operations
├── deploy.js            # Deployment management
├── dataset.js           # Dataset operations
├── mlService.js         # ML-specific endpoints
└── resource.js          # Cloud resource management
```

### **HTTP Client Setup**

#### **Axios Configuration** (`src/api/axios.js`)
```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token, common headers
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh, global error handling
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default instance;
```

### **API Service Pattern**

#### **Service Example** (`src/api/experiment.js`)
```javascript
import api from './axios';

export const experimentAPI = {
  // Get all experiments for a project
  getExperiments: (projectId) => 
    api.get(`/projects/${projectId}/experiments`),
  
  // Create new experiment
  createExperiment: (projectId, data) =>
    api.post(`/projects/${projectId}/experiments`, data),
  
  // Get experiment details
  getExperiment: (experimentId) =>
    api.get(`/experiments/${experimentId}`),
  
  // Update experiment
  updateExperiment: (experimentId, data) =>
    api.put(`/experiments/${experimentId}`, data),
  
  // Delete experiment
  deleteExperiment: (experimentId) =>
    api.delete(`/experiments/${experimentId}`)
};
```

#### **Using API Services**
```jsx
import { experimentAPI } from 'src/api/experiment';

function ExperimentList({ projectId }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await experimentAPI.getExperiments(projectId);
        setExperiments(response.data);
      } catch (error) {
        console.error('Failed to fetch experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, [projectId]);

  if (loading) return <Loading />;

  return (
    <div>
      {experiments.map(exp => (
        <ExperimentCard key={exp.id} experiment={exp} />
      ))}
    </div>
  );
}
```

---

## 🎯 Adding New Features

### **🆕 Adding a New Page**

#### **Step 1: Create Page Component**
```bash
# Create page directory
mkdir src/pages/my-new-page

# Create page component
touch src/pages/my-new-page/index.jsx
```

```jsx
// src/pages/my-new-page/index.jsx
import React from 'react';
import { Button } from 'src/components/ui/button';

export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My New Page</h1>
      <Button>Get Started</Button>
    </div>
  );
}
```

#### **Step 2: Add Route**
```javascript
// src/constants/paths.js
export const PATHS = {
  // ... existing paths
  MY_NEW_PAGE: '/app/my-new-page',
}

// src/routes/authed.js
import MyNewPage from 'src/pages/my-new-page';

const routes = {
  element: <DefaultLayout />,
  children: [
    // ... existing routes
    {
      path: PATHS.MY_NEW_PAGE,
      element: <MyNewPage />
    }
  ]
}
```

#### **Step 3: Add Navigation**
```jsx
// src/components/NavBar.jsx
import { PATHS } from 'src/constants/paths';

function NavBar() {
  return (
    <nav>
      <Link to={PATHS.MY_NEW_PAGE}>My New Page</Link>
    </nav>
  );
}
```

### **🧩 Adding a New Component**

#### **Step 1: Create Component**
```jsx
// src/components/MyNewComponent.jsx
import React from 'react';
import { cn } from 'src/lib/utils';

interface MyNewComponentProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function MyNewComponent({ 
  title, 
  description, 
  className,
  children 
}: MyNewComponentProps) {
  return (
    <div className={cn("p-4 bg-white rounded-lg shadow", className)}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}
```

#### **Step 2: Export Component**
```javascript
// src/components/index.js
export { default as MyNewComponent } from './MyNewComponent';
```

#### **Step 3: Use Component**
```jsx
import { MyNewComponent } from 'src/components';

function SomePage() {
  return (
    <MyNewComponent 
      title="Example Title"
      description="This is an example component"
      className="mb-6"
    >
      <p>Component content goes here</p>
    </MyNewComponent>
  );
}
```

### **🔄 Adding a New Store**

#### **Step 1: Create Store**
```javascript
// src/stores/myNewStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMyNewStore = create(
  persist(
    (set, get) => ({
      // State
      data: [],
      loading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/my-endpoint');
          set({ data: response.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      updateItem: (id, updates) => set((state) => ({
        data: state.data.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),

      reset: () => set({ data: [], loading: false, error: null })
    }),
    {
      name: 'my-new-store',
      partialize: (state) => ({ data: state.data })
    }
  )
);

export default useMyNewStore;
```

#### **Step 2: Use Store**
```jsx
import useMyNewStore from 'src/stores/myNewStore';

function MyComponent() {
  const { 
    data, 
    loading, 
    error, 
    fetchData, 
    updateItem 
  } = useMyNewStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => updateItem(item.id, { updated: true })}>
            Update
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 shadcn/ui Integration

### **What is shadcn/ui?**

shadcn/ui is a collection of copy-and-paste components built on top of Radix UI and Tailwind CSS. Unlike traditional UI libraries, you copy components directly into your project, giving you full control over the code.

### **Setup (Already Configured)**

The project is already configured with shadcn/ui:

✅ **Dependencies installed**: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`  
✅ **Tailwind configured**: Design tokens, animations, utilities  
✅ **Utils library**: `cn()` function for class merging  
✅ **CSS variables**: Design system tokens  

### **Available Components**

#### **Currently Available**
- **Button**: Multiple variants (default, outline, ghost, etc.)

#### **Adding More Components**

To add new shadcn/ui components:

```bash
# Install using CLI (if available)
npx shadcn@latest add button card input

# Or manually copy from https://ui.shadcn.com/docs/components
```

#### **Manual Component Addition**

1. **Visit**: https://ui.shadcn.com/docs/components/[component-name]
2. **Copy** the component code
3. **Create** file in `src/components/ui/[component-name].jsx`
4. **Install** any additional dependencies
5. **Use** in your components

### **Using shadcn/ui Components**

#### **Basic Usage**
```jsx
import { Button } from 'src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ML Model Training</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="default">Start Training</Button>
          <Button variant="outline">View Results</Button>
          <Button variant="destructive">Stop Training</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### **Customizing Components**
```jsx
// Custom styling with Tailwind classes
<Button 
  variant="outline" 
  size="lg"
  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white"
>
  Custom Gradient Button
</Button>

// Using as child component
<Button asChild>
  <Link to="/dashboard">Go to Dashboard</Link>
</Button>
```

#### **Component Variants**

Most shadcn/ui components support variants:

```jsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🚀</Button>
```

### **Integration with Existing UI**

#### **Mixing with Ant Design**
```jsx
// You can use both libraries together
import { Modal, Table } from 'antd';
import { Button } from 'src/components/ui/button';

function DataTable() {
  return (
    <div>
      {/* Ant Design table */}
      <Table dataSource={data} columns={columns} />
      
      {/* shadcn/ui buttons */}
      <div className="mt-4 space-x-2">
        <Button variant="outline">Export</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
```

#### **Consistent Theming**
```jsx
// Use CSS variables for consistent theming
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Themed Button
  </Button>
</div>
```

### **Best Practices**

#### **✅ Do**
- Use shadcn/ui for new components
- Customize with Tailwind classes
- Follow the design system colors
- Copy and modify components as needed

#### **❌ Don't**
- Mix conflicting design systems
- Override core component logic
- Ignore accessibility features
- Use inline styles

---

## 🧪 Testing

### **Testing Setup**
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### **Testing Patterns**
```jsx
// Component testing example
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from 'src/components/ui/button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📦 Building & Deployment

### **Build Commands**
```bash
# Development build
npm start

# Production build
npm run build

# Build with bundle analysis
npm run build -- --analyze

# Format code
npm run prettier:fix
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t ml-frontend .

# Run container
docker run -p 3000:3000 ml-frontend
```

### **Environment Configuration**
```bash
# Production environment variables
REACT_APP_API_URL=https://api.yourplatform.com
REACT_APP_ML_API_URL=https://ml-api.yourplatform.com
REACT_APP_ENVIRONMENT=production
```

---

## 🚨 Common Issues & Solutions

### **Path Resolution Issues**
```javascript
// Use absolute imports from src/
import Component from 'src/components/Component';
// Not relative imports
import Component from '../../../components/Component';
```

### **Styling Conflicts**
```jsx
// Use cn() utility to merge classes properly
import { cn } from 'src/lib/utils';

<Button className={cn("base-styles", conditionalStyles, props.className)}>
```

### **State Management Issues**
```javascript
// Don't mutate state directly
// ❌ Wrong
state.data.push(newItem);

// ✅ Correct
set((state) => ({ data: [...state.data, newItem] }));
```

### **API Error Handling**
```javascript
// Always handle errors in API calls
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
  throw error;
}
```

---

## 📚 Additional Resources

### **Documentation**
- [React Documentation](https://reactjs.org/docs)
- [React Router v6](https://reactrouter.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Ant Design](https://ant.design/docs/react/introduce)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

### **Development Tools**
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) (works with Zustand)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### **Code Style**
- Use **Prettier** for code formatting
- Follow **React** best practices
- Use **TypeScript** when possible
- Write **descriptive** component and variable names

---

## 🤝 Contributing

### **Development Workflow**
1. Create feature branch from `main`
2. Implement changes following this guide
3. Test thoroughly (unit tests + manual testing)
4. Submit pull request with clear description
5. Code review and merge

### **Code Standards**
- **ESLint**: Fix all linting errors
- **Prettier**: Format code consistently
- **TypeScript**: Add types for new code
- **Testing**: Include tests for new features
- **Documentation**: Update this guide for significant changes

---

**Happy coding! 🚀**

> This guide is maintained by the development team. Please keep it updated as the project evolves.
