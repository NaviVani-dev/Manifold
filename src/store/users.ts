import { create } from "zustand";
import { UsersStore } from "~/types/userTypes";

export const useUserStore = create<UsersStore>()((set) => ({
  users: undefined,
  setUsers: (users) => set({ users }),
  updateUser: (index, newData) =>
    set((state) => ({
      users: state.users
        ? state.users.map((user, i) =>
            i === index ? { ...user, ...newData } : user
          )
        : state.users,
    })),
}));
