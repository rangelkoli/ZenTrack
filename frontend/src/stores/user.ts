import {create} from 'zustand';

type User = {
  isLoggedIn: boolean;
  details: {
    name: string;
    email: string;
    // Add more user details as needed
  };
};

type UserStore = {
  user: User;
  login: () => void;
  logout: () => void;
  updateUserDetails: (details: Partial<User['details']>) => void;
};

const useUserStore = create<UserStore>((set: any) => ({
  user: {
    isLoggedIn: false,
    details: {
      name: '',
      email: '',
    },
  },
  login: () => set((state: any) => ({ user: { ...state.user, isLoggedIn: true } })),
  logout: () => set((state: any) => ({ user: { ...state.user, isLoggedIn: false } })),
  updateUserDetails: (details: any) =>
    set((state: any) => ({ user: { ...state.user, details: { ...state.user.details, ...details } } })),
}));

export default useUserStore;
