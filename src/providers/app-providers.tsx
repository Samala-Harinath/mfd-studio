"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Provider, useStore } from "react-redux";
import {
  createStudioActions,
  registerStudioActions,
  studioMutationFns,
  type StudioMutationFns,
} from "@/features/studio/actions";
import { sessionQueryOptions } from "@/lib/query/options";
import { hydrateSession } from "@/store/slices/studio.slice";
import { makeStore, type AppStore } from "@/store/store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  const [queryClient] = useState(makeQueryClient);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StudioRuntime>{children}</StudioRuntime>
      </QueryClientProvider>
    </Provider>
  );
}

function StudioRuntime({ children }: { children: ReactNode }) {
  const store = useStore() as AppStore;
  const queryClient = useQueryClient();
  const session = useQuery(sessionQueryOptions());

  const login = useMutation({ mutationKey: ["mfd", "login"], mutationFn: studioMutationFns.login });
  const logout = useMutation({ mutationKey: ["mfd", "logout"], mutationFn: studioMutationFns.logout });
  const signup = useMutation({ mutationKey: ["mfd", "signup"], mutationFn: studioMutationFns.signup });
  const save = useMutation({ mutationKey: ["mfd", "save-site"], mutationFn: studioMutationFns.save });
  const enquiry = useMutation({ mutationKey: ["mfd", "enquiry"], mutationFn: studioMutationFns.enquiry });

  const mutations = useRef<StudioMutationFns>({
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    signup: signup.mutateAsync,
    save: save.mutateAsync,
    enquiry: enquiry.mutateAsync,
  });
  mutations.current = {
    login: login.mutateAsync,
    logout: logout.mutateAsync,
    signup: signup.mutateAsync,
    save: save.mutateAsync,
    enquiry: enquiry.mutateAsync,
  };

  const actions = useRef<ReturnType<typeof createStudioActions> | null>(null);
  if (!actions.current) {
    actions.current = createStudioActions(store, queryClient, mutations);
    registerStudioActions(store, actions.current);
  }

  useEffect(() => {
    if (session.isPending) return;
    if (store.getState().studio.status !== "loading") return;
    store.dispatch(hydrateSession(session.isSuccess ? session.data : { user: null, tenant: null }));
  }, [session.isPending, session.isSuccess, session.data, session.error, store]);

  useEffect(() => {
    const current = actions.current;
    return () => current?.dispose();
  }, []);

  return children;
}
