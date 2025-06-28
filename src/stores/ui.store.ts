import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  onClose?: () => void;
}

interface UIState {
  // Sidebar & Navigation
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Toasts
  toasts: Toast[];
  
  // Modals
  modals: Modal[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage?: string;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Session UI
  isVotingPanelExpanded: boolean;
  isParticipantListVisible: boolean;
  messageStreamView: 'all' | 'voted' | 'unvoted';
  
  // Mobile specific
  isMobile: boolean;
  isTablet: boolean;
  
  // Network status
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

interface UIActions {
  // Sidebar & Navigation
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Toasts
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modals
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  
  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Session UI
  toggleVotingPanel: () => void;
  setVotingPanelExpanded: (expanded: boolean) => void;
  toggleParticipantList: () => void;
  setParticipantListVisible: (visible: boolean) => void;
  setMessageStreamView: (view: 'all' | 'voted' | 'unvoted') => void;
  
  // Device detection
  setDeviceInfo: (isMobile: boolean, isTablet: boolean) => void;
  
  // Network status
  setOnlineStatus: (online: boolean) => void;
  setConnectionQuality: (quality: 'excellent' | 'good' | 'poor' | 'offline') => void;
  
  // Utility
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  toasts: [],
  modals: [],
  globalLoading: false,
  theme: 'system',
  isVotingPanelExpanded: true,
  isParticipantListVisible: true,
  messageStreamView: 'all',
  isMobile: false,
  isTablet: false,
  isOnline: true,
  connectionQuality: 'excellent',
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Sidebar & Navigation
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      // Toasts
      showToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast = { ...toast, id };
        
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        
        // Auto-remove toast after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, toast.duration || 5000);
        }
      },
      
      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },
      
      clearToasts: () => set({ toasts: [] }),

      // Modals
      showModal: (modal) => {
        const id = `modal-${Date.now()}-${Math.random()}`;
        set((state) => ({
          modals: [...state.modals, { ...modal, id }],
        }));
      },
      
      hideModal: (id) => {
        const modal = get().modals.find((m) => m.id === id);
        modal?.onClose?.();
        
        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id),
        }));
      },
      
      hideAllModals: () => {
        get().modals.forEach((modal) => modal.onClose?.());
        set({ modals: [] });
      },

      // Loading
      setGlobalLoading: (loading, message) => {
        set({ globalLoading: loading, loadingMessage: message });
      },

      // Theme
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Persist preference
        localStorage.setItem('theme', theme);
      },

      // Session UI
      toggleVotingPanel: () => set((state) => ({ isVotingPanelExpanded: !state.isVotingPanelExpanded })),
      setVotingPanelExpanded: (expanded) => set({ isVotingPanelExpanded: expanded }),
      toggleParticipantList: () => set((state) => ({ isParticipantListVisible: !state.isParticipantListVisible })),
      setParticipantListVisible: (visible) => set({ isParticipantListVisible: visible }),
      setMessageStreamView: (view) => set({ messageStreamView: view }),

      // Device detection
      setDeviceInfo: (isMobile, isTablet) => {
        set({ isMobile, isTablet });
        
        // Auto-adjust UI for mobile
        if (isMobile && !isTablet) {
          set({ 
            isSidebarOpen: false,
            isParticipantListVisible: false,
          });
        }
      },

      // Network status
      setOnlineStatus: (online) => {
        set({ isOnline: online });
        if (!online) {
          get().showToast({
            type: 'warning',
            title: 'You are offline',
            description: 'Some features may be limited',
          });
        }
      },
      
      setConnectionQuality: (quality) => set({ connectionQuality: quality }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'ui-store',
    }
  )
);

// Helper hooks
export const useToast = () => {
  const { showToast, hideToast } = useUIStore();
  
  return {
    success: (title: string, description?: string) =>
      showToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      showToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      showToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      showToast({ type: 'info', title, description }),
    hide: hideToast,
  };
};

export const useModal = () => {
  const { showModal, hideModal, hideAllModals } = useUIStore();
  
  return {
    show: showModal,
    hide: hideModal,
    hideAll: hideAllModals,
  };
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  if (savedTheme) {
    useUIStore.getState().setTheme(savedTheme);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useUIStore.getState().theme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  });
  
  // Listen for online/offline events
  window.addEventListener('online', () => useUIStore.getState().setOnlineStatus(true));
  window.addEventListener('offline', () => useUIStore.getState().setOnlineStatus(false));
}