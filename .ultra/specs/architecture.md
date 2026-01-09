# Architecture Specification - Paimon Admin Dashboard

> Version: 1.1.0
> Status: Research Round 1 Complete
> Backend Reference: /Users/rocky243/paimon-backed
> Last Updated: 2025-12-15

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Paimon Admin Dashboard                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       Presentation Layer                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │    │
│  │  │   Pages     │  │ Components  │  │   Layouts   │              │    │
│  │  │ (Routes)    │  │ (UI Kit)    │  │ (Shells)    │              │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌─────────────────────────────────┴───────────────────────────────┐    │
│  │                        State Layer                               │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │    │
│  │  │  Zustand  │ │  TanStack │ │  Context  │ │   Form    │       │    │
│  │  │  (Global) │ │  (Server) │ │  (Theme)  │ │  (Local)  │       │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌─────────────────────────────────┴───────────────────────────────┐    │
│  │                       Service Layer                              │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │    │
│  │  │    API    │ │ WebSocket │ │   Auth    │ │  Storage  │       │    │
│  │  │  Client   │ │  Client   │ │  Service  │ │  Service  │       │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    External Services                             │    │
│  │  ┌───────────────────────┐  ┌───────────────────────┐           │    │
│  │  │  Paimon Backend API   │  │  WebSocket Server     │           │    │
│  │  │  (FastAPI REST)       │  │  (Real-time Push)     │           │    │
│  │  └───────────────────────┘  └───────────────────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
User Interaction
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────►│   TanStack  │────►│   Axios     │
│ Components  │     │    Query    │     │   Client    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   ▼
       │                   │          ┌─────────────┐
       │                   │          │   Backend   │
       │                   │          │    API      │
       │                   │          └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Zustand   │◄────│   Cache     │◄────│  Response   │
│   Store     │     │  (Query)    │     │   Data      │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 2. Technology Stack

### 2.1 Core Technologies

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **Framework** | React | 18.x | Component-based, mature ecosystem |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Build Tool** | Vite | 5.x | Fast HMR, ESM-native |
| **Routing** | React Router | 6.x | Standard routing solution |
| **State (Server)** | TanStack Query | 5.x | Caching, background sync |
| **State (Client)** | Zustand | 4.x | Lightweight, simple API |
| **UI Library** | shadcn/ui + Radix | Latest | Headless, fully customizable, Tailwind-native |
| **Data Table** | TanStack Table | 8.x | Headless, powerful filtering/sorting/pagination |
| **Charts** | ECharts | 5.x | Rich chart types, performant |
| **HTTP Client** | Axios | 1.x | Interceptors, request/response transform |
| **Forms** | React Hook Form | 7.x | Performant form handling |
| **Validation** | Zod | 3.x | Type-safe schema validation |
| **i18n** | react-i18next | 14.x | Mature i18n solution |
| **Testing** | Vitest | 1.x | Vite-native, fast |
| **E2E Testing** | Playwright | 1.x | Cross-browser, reliable |
| **CSS** | Tailwind CSS | 3.x | Utility-first, customizable |
| **Web3** | wagmi + viem | 2.x | Modern Web3 stack, React hooks |
| **Linting** | ESLint + Prettier | Latest | Code quality |

### 2.2 Project Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.10.0",
    "zustand": "^4.4.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-toast": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "echarts": "^5.4.0",
    "echarts-for-react": "^3.0.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "react-i18next": "^14.0.0",
    "i18next": "^23.7.0",
    "dayjs": "^1.11.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "lucide-react": "^0.294.0",
    "wagmi": "^2.0.0",
    "viem": "^2.0.0",
    "@walletconnect/web3-provider": "^1.8.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "tailwindcss-animate": "^1.0.0"
  }
}
```

## 3. Directory Structure

```
src/
├── app/                          # Application core
│   ├── App.tsx                   # Root component
│   ├── routes.tsx                # Route definitions
│   └── providers.tsx             # Context providers
│
├── pages/                        # Page components (route-based)
│   ├── dashboard/
│   │   └── index.tsx
│   ├── redemptions/
│   │   ├── index.tsx             # List page
│   │   └── [id].tsx              # Detail page
│   ├── rebalance/
│   │   ├── index.tsx
│   │   └── history.tsx
│   ├── risk/
│   │   ├── index.tsx
│   │   ├── alerts.tsx
│   │   └── forecast.tsx
│   ├── approvals/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── reports/
│   │   └── index.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   └── audit.tsx
│   └── login/
│       └── index.tsx
│
├── components/                   # Shared components
│   ├── ui/                       # Base UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Table/
│   │   └── Modal/
│   ├── charts/                   # Chart components
│   │   ├── LineChart/
│   │   ├── PieChart/
│   │   ├── GaugeChart/
│   │   └── HeatMap/
│   ├── business/                 # Business components
│   │   ├── RedemptionCard/
│   │   ├── ApprovalQueue/
│   │   ├── RiskIndicator/
│   │   └── NAVDisplay/
│   └── layout/                   # Layout components
│       ├── MainLayout/
│       ├── Header/
│       ├── Sider/
│       └── Footer/
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── usePermission.ts
│   └── useTheme.ts
│
├── services/                     # API services
│   ├── api/
│   │   ├── client.ts             # Axios instance
│   │   ├── fund.ts               # Fund API
│   │   ├── redemptions.ts        # Redemptions API
│   │   ├── rebalance.ts          # Rebalance API
│   │   ├── risk.ts               # Risk API
│   │   ├── approvals.ts          # Approvals API
│   │   ├── reports.ts            # Reports API
│   │   └── auth.ts               # Auth API
│   ├── websocket/
│   │   ├── client.ts             # WebSocket client
│   │   └── handlers.ts           # Message handlers
│   └── storage/
│       └── local.ts              # LocalStorage wrapper
│
├── stores/                       # Zustand stores
│   ├── auth.ts                   # Auth state
│   ├── ui.ts                     # UI state (theme, sidebar)
│   └── notifications.ts          # Notification state
│
├── types/                        # TypeScript types
│   ├── api.ts                    # API response types
│   ├── models.ts                 # Domain models
│   └── common.ts                 # Common types
│
├── utils/                        # Utility functions
│   ├── format.ts                 # Formatting helpers
│   ├── validate.ts               # Validation helpers
│   └── constants.ts              # Constants
│
├── i18n/                         # Internationalization
│   ├── config.ts
│   ├── locales/
│   │   ├── zh-CN.json
│   │   └── en-US.json
│
├── styles/                       # Global styles
│   ├── globals.css
│   ├── theme.ts                  # Ant Design theme
│   └── tailwind.config.js
│
└── tests/                        # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

## 4. Key Design Decisions

### 4.1 State Management Strategy

**Decision**: TanStack Query for server state, Zustand for client state.

**Rationale**:
- Server state (API data) has different lifecycle than client state
- TanStack Query provides caching, background refresh, optimistic updates
- Zustand is minimal and simple for UI state
- Clear separation of concerns

### 4.2 Component Architecture

**Decision**: Feature-based organization with atomic design principles.

**Rationale**:
- Pages contain page-specific logic
- Components are reusable building blocks
- Business components encapsulate domain logic
- UI components are presentational only

### 4.3 API Client Design

**Decision**: Axios with request/response interceptors + TanStack Query hooks.

**Rationale**:
- Centralized error handling
- JWT token injection
- Request/response logging
- Automatic retry logic

### 4.4 WebSocket Integration

**Decision**: Singleton WebSocket client with reconnection logic.

**Rationale**:
- Single connection for all real-time data
- Automatic reconnection on disconnect
- Message type routing to handlers
- Integration with React Query for cache updates

### 4.5 Authentication Flow

**Decision**: JWT tokens stored in memory + refresh token in HttpOnly cookie.

**Rationale**:
- XSS protection (no localStorage for sensitive tokens)
- CSRF protection (HttpOnly cookie)
- Seamless token refresh

## 5. API Integration

### 5.1 API Client Configuration

```typescript
// services/api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### 5.2 API Service Example

```typescript
// services/api/redemptions.ts
export const redemptionsApi = {
  getList: (params: RedemptionListParams) =>
    apiClient.get<PaginatedResponse<Redemption>>('/redemptions', { params }),

  getById: (id: string) =>
    apiClient.get<Redemption>(`/redemptions/${id}`),

  approve: (id: string, data: ApprovalData) =>
    apiClient.post(`/redemptions/${id}/approve`, data),

  reject: (id: string, data: RejectionData) =>
    apiClient.post(`/redemptions/${id}/reject`, data),
};
```

### 5.3 TanStack Query Hook Example

```typescript
// hooks/useRedemptions.ts
export const useRedemptions = (params: RedemptionListParams) => {
  return useQuery({
    queryKey: ['redemptions', params],
    queryFn: () => redemptionsApi.getList(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useApproveRedemption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalData }) =>
      redemptionsApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
    },
  });
};
```

## 6. WebSocket Architecture

### 6.1 WebSocket Client

```typescript
// services/websocket/client.ts
class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private handlers = new Map<string, Set<Function>>();

  connect() {
    this.socket = new WebSocket(import.meta.env.VITE_WS_URL);

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.dispatch(message.type, message.data);
    };

    this.socket.onclose = () => {
      this.scheduleReconnect();
    };
  }

  subscribe(channel: string, handler: Function) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    // Send subscription message
    this.send({ type: 'subscribe', channel });

    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  private dispatch(type: string, data: any) {
    this.handlers.get(type)?.forEach(handler => handler(data));
  }
}
```

### 6.2 WebSocket React Hook

```typescript
// hooks/useWebSocket.ts
export const useWebSocket = (channel: string, handler: (data: any) => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = wsClient.subscribe(channel, (data) => {
      handler(data);

      // Optionally update React Query cache
      if (channel === 'fund:nav') {
        queryClient.setQueryData(['fund', 'nav'], data);
      }
    });

    return unsubscribe;
  }, [channel, handler, queryClient]);
};
```

## 7. Performance Optimization

### 7.1 Code Splitting

```typescript
// app/routes.tsx
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Redemptions = lazy(() => import('@/pages/redemptions'));
const Rebalance = lazy(() => import('@/pages/rebalance'));
const Risk = lazy(() => import('@/pages/risk'));
const Approvals = lazy(() => import('@/pages/approvals'));
const Reports = lazy(() => import('@/pages/reports'));
```

### 7.2 Virtual Scrolling

For tables with >100 rows:
- Use `@tanstack/react-virtual` for virtualization
- Fixed table height with scrollable body

### 7.3 Memoization Strategy

- Use `React.memo` for pure components
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children

### 7.4 Image Optimization

- Lazy loading for images
- WebP format with fallback
- Responsive images with srcset

## 8. Security Considerations

### 8.1 XSS Prevention

- No `dangerouslySetInnerHTML` without sanitization
- Content Security Policy headers
- Input sanitization

### 8.2 CSRF Protection

- SameSite cookie attribute
- CSRF token for mutations

### 8.3 Sensitive Data

- No sensitive data in localStorage
- Clear memory on logout
- Redact sensitive data in logs

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

- Component rendering tests
- Hook logic tests
- Utility function tests

### 9.2 Integration Tests

- Page-level tests with mocked API
- User flow tests
- Form submission tests

### 9.3 E2E Tests (Playwright)

- Critical user journeys
- Cross-browser testing
- Visual regression testing

### 9.4 Coverage Targets

| Category | Target |
|----------|--------|
| Overall | >= 80% |
| Critical paths | 100% |
| Components | >= 85% |
| Hooks | >= 90% |

## 10. Deployment

### 10.1 Build Process

```bash
# Production build
pnpm build

# Output: dist/
# - index.html
# - assets/
#   - js/ (chunked)
#   - css/
#   - images/
```

### 10.2 Environment Variables

```bash
# .env.production
VITE_API_BASE_URL=https://api.paimon.fund/v1
VITE_WS_URL=wss://api.paimon.fund/ws
VITE_SENTRY_DSN=xxx
```

### 10.3 CDN & Caching

- Static assets: Cache forever (hashed filenames)
- HTML: No cache (or short TTL)
- API responses: Per-endpoint caching

## 11. Technology Stack Validation (Research Round 3)

> Validated: 2025-12-15
> Team Assessment: React 精通 + Web3 有经验
> Confidence: 95%

### 11.1 Core Libraries Verification

| Library | Context7 ID | Snippets | Reputation | Score |
|---------|-------------|----------|------------|-------|
| shadcn/ui | /websites/ui_shadcn | 1,188 | High | 75.1 |
| wagmi | /websites/wagmi_sh | 4,555 | High | 66.2 |
| TanStack Table | /websites/tanstack_table | 1,562 | High | 94.3 |
| TanStack Query | /websites/tanstack_query_v5 | 1,664 | High | 84.4 |

### 11.2 Team Skill Alignment

| Technology | Required Level | Team Level | Gap |
|------------|---------------|------------|-----|
| React 18 | Expert | Expert | None |
| TypeScript | Advanced | Advanced | None |
| Tailwind CSS | Intermediate | Advanced | None |
| Web3/wagmi | Intermediate | Intermediate | None |
| TanStack Query | Intermediate | Intermediate | Low |

### 11.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| shadcn/ui 组件不足 | Low | Medium | 按需封装业务组件 |
| wagmi 版本升级 | Low | Low | 锁定主版本 |
| 性能瓶颈 | Low | Medium | 虚拟化 + 懒加载 |

### 11.4 Final Technology Stack

```
Frontend Stack (Validated)
├── Framework: React 18.x + Vite 5.x
├── Language: TypeScript 5.x (strict)
├── Styling: Tailwind CSS 3.x
├── UI Components: shadcn/ui + Radix UI
├── State Management
│   ├── Server: TanStack Query 5.x
│   └── Client: Zustand 4.x
├── Data Table: TanStack Table 8.x
├── Forms: React Hook Form 7.x + Zod
├── Charts: ECharts 5.x
├── Web3: wagmi 2.x + viem
├── Testing: Vitest + Playwright
└── Icons: Lucide React
```

---

**Reference Documents:**
- Backend Architecture: `/Users/rocky243/paimon-backed/.ultra/specs/architecture.md`
- API Specification: `/Users/rocky243/paimon-backed/docs/backend/05-api-specification.md`

## 12. Task Design Decisions

### 12.1 Task 27: User Settings Page (US-14)

#### 12.1.1 Settings Page Layout Architecture

**Decision**: Use tab-based layout with sidebar navigation for settings sections.

**Rationale**:
- **Scalability**: Easy to add new settings sections without cluttering UI
- **Mobile-friendly**: Sidebar collapses to bottom navigation or hamburger menu on mobile
- **User mental model**: Familiar pattern used by most applications (GitHub, GitLab, etc.)
- **Accessibility**: Tab navigation provides clear section switching with keyboard support

**Implementation Approach**:
```typescript
// SettingsPage structure
<SettingsPage>
  <SettingsLayout>
    <SettingsSidebar>
      <SettingsNav />
    </SettingsSidebar>
    <SettingsContent>
      <Routes>
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="notifications" element={<NotificationPreferences />} />
        <Route path="display" element={<DisplayOptions />} />
      </Routes>
    </SettingsContent>
  </SettingsLayout>
</SettingsPage>
```

**Dependencies**:
- React Router 6.x (nested routes)
- Radix UI Tabs (keyboard navigation)
- Tailwind CSS (responsive utilities)

**Testing Strategy**:
- Unit tests: Each settings section component independently
- Integration tests: Tab navigation and routing
- Accessibility tests: Keyboard navigation and screen reader support

---

#### 12.1.2 Form Management Strategy

**Decision**: Use React Hook Form + Zod for all settings forms.

**Rationale**:
- **Type safety**: Zod schemas provide runtime validation with TypeScript inference
- **Performance**: React Hook Form minimizes re-renders vs controlled inputs
- **UX**: Built-in support for validation errors, dirty state, submission handling
- **Consistency**: Same pattern used across app (authentication, approvals, etc.)

**Implementation Approach**:
```typescript
// Example: Profile settings form
const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  avatar: z.string().url().optional(),
});

function ProfileSettings() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { mutate } = useMutation({
    mutationFn: updateProfile,
  });

  return (
    <form onSubmit={handleSubmit(data => mutate(data))}>
      {/* Form fields */}
    </form>
  );
}
```

**Alternatives Considered**:
- **Formik**: More heavyweight, larger bundle size
- **Uncontrolled inputs only**: No validation, harder to maintain

**Trade-offs**:
- Pros: Type-safe validation, minimal boilerplate, great DX
- Cons: Additional dependency (already in project stack)

---

#### 12.1.3 Theme Management Approach

**Decision**: Use next-themes for dark/light/system theme switching.

**Rationale**:
- **SSR support**: Handles flash of incorrect theme (FOIT) during page load
- **System preference**: Respects user's OS theme preference by default
- **LocalStorage sync**: Persists choice across sessions
- **Zero-flash**: Smooth theme transitions without flickering

**Implementation Approach**:
```typescript
// Theme provider setup (root of app)
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <App />
</ThemeProvider>

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <Sun className="h-4 w-4" />
      <Moon className="h-4 w-4" />
    </button>
  );
}
```

**Alternatives Considered**:
- **Custom CSS variables**: More control, but requires manual localStorage management
- **CSS-only media queries**: No user preference persistence

**Trade-offs**:
- Pros: Battle-tested, handles edge cases, minimal setup
- Cons: Additional 1.5KB gzipped

---

#### 12.1.4 Language Switching Strategy

**Decision**: Pre-implement language selector UI, but translations will be added in Task 28 (i18n setup).

**Rationale**:
- **UI readiness**: Settings page will have language selector ready when i18n is implemented
- **Consistent UX**: Language preference stored with other settings
- **Dependency order**: i18n setup (Task 28) must complete before translations work

**Implementation Approach**:
```typescript
// Placeholder selector (functional in Task 28)
function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('zh-CN');

  const handleChange = (lang: string) => {
    setLanguage(lang);
    // i18n.changeLanguage(lang); // Will work after Task 28
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh-CN">简体中文</SelectItem>
        <SelectItem value="en-US">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

**Dependencies**:
- react-i18next (configured in Task 28)
- Radix UI Select component
- localStorage for persistence

**Testing Strategy**:
- Unit tests: Selector state changes
- Integration tests: localStorage persistence
- E2E tests: Language preference applied after reload (Task 28)

---

#### 12.1.5 Settings Persistence Pattern

**Decision**: Optimistic UI updates with TanStack Query mutation and rollback on error.

**Rationale**:
- **Immediate feedback**: UI updates instantly without waiting for API response
- **Error resilience**: Automatically rolls back on API failure
- **Consistency**: Same pattern used for approvals, redemptions, etc.
- **Offline handling**: TanStack Query cache handles pending mutations

**Implementation Approach**:
```typescript
const updateSettings = useMutation({
  mutationFn: async (settings: UserSettings) => {
    return api.put('/user/settings', settings);
  },
  onMutate: async (newSettings) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries(['user-settings']);
    // Snapshot previous value
    const previous = queryClient.getQueryData(['user-settings']);
    // Optimistically update
    queryClient.setQueryData(['user-settings'], newSettings);
    return { previous };
  },
  onError: (err, newSettings, context) => {
    // Rollback on error
    queryClient.setQueryData(['user-settings'], context.previous);
    toast.error('Failed to save settings');
  },
  onSuccess: () => {
    toast.success('Settings saved');
  },
});
```

**Trade-offs**:
- Pros: Better UX, resilient to network issues
- Cons: More complex error handling, requires rollback logic

- Database Design: `/Users/rocky243/paimon-backed/docs/backend/06-database-design.md`
