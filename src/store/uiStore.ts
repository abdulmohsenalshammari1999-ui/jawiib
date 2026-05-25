import { create } from 'zustand';

export type Modal = 'payment' | 'sabotage' | 'rules' | 'settings' | null;
export type Toast = { id: string; message: string; type: 'success' | 'error' | 'info'; ttl: number };

interface UIState {
  activeModal: Modal;
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage: string;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  openModal: (modal: Modal) => void;
  closeModal: () => void;
  addToast: (message: string, type?: Toast['type'], ttl?: number) => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setConnectionStatus: (status: UIState['connectionStatus']) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  activeModal: null,
  toasts: [],
  isLoading: false,
  loadingMessage: '',
  connectionStatus: 'disconnected',

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (message, type = 'info', ttl = 3000) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { id, message, type, ttl }] });
    setTimeout(() => get().removeToast(id), ttl);
  },

  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
