import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTermsConditions,
  publishTermsConditions,
  toggleTermsStatus,
  restoreTermsVersion,
  fetchPrivacyPolicies,
  publishPrivacyPolicy,
  togglePrivacyStatus,
  restorePrivacyVersion,
  fetchRefundPolicies,
  publishRefundPolicy,
  toggleRefundStatus,
  restoreRefundVersion,
  fetchSupportContact,
  updateSupportContact,
} from '../store/legal/legalThunk';

export const useTermsConditions = (type = 'customer') => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-terms', type],
    queryFn: async () => {
      const actionResult = await dispatch(fetchTermsConditions(type));
      if (fetchTermsConditions.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to fetch terms & conditions');
    },
    staleTime: 10 * 60 * 1000,       // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000,          // 30 minutes cache retention
    placeholderData: (prev) => prev,  // Keep existing data while refetching
    refetchOnMount: false,            // Don't refetch if cache is fresh
    refetchOnWindowFocus: false,      // Prevent reload on tab switch
    retry: 1,                         // Max 1 retry to prevent long blocking
  });

  const publishMutation = useMutation({
    mutationFn: async (content) => {
      const actionResult = await dispatch(publishTermsConditions({ type, content }));
      if (publishTermsConditions.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to publish terms');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-terms', type] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(toggleTermsStatus({ id, type }));
      if (toggleTermsStatus.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to toggle terms status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-terms', type] });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(restoreTermsVersion({ id, type }));
      if (restoreTermsVersion.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to restore terms version');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-terms', type] });
    },
  });

  const reduxState = useSelector((state) => state.legal?.terms?.[type] || { active: null, history: [] });

  return {
    activeTerms: query.data?.data?.active || reduxState.active,
    history: query.data?.data?.history || reduxState.history || [],
    loading: query.isLoading && !reduxState.active,
    isFetching: query.isFetching,
    publishing: publishMutation.isPending,
    error: query.error || publishMutation.error,
    publishTerms: publishMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    restoreVersion: restoreVersionMutation.mutateAsync,
    refetch: query.refetch,
  };
};

export const usePrivacyPolicies = (type = 'customer') => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-privacy', type],
    queryFn: async () => {
      const actionResult = await dispatch(fetchPrivacyPolicies(type));
      if (fetchPrivacyPolicies.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to fetch privacy policies');
    },
    staleTime: 10 * 60 * 1000,       // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000,          // 30 minutes cache retention
    placeholderData: (prev) => prev,  // Keep existing data while refetching
    refetchOnMount: false,            // Don't refetch if cache is fresh
    refetchOnWindowFocus: false,      // Prevent reload on tab switch
    retry: 1,                         // Max 1 retry to prevent long blocking
  });

  const publishMutation = useMutation({
    mutationFn: async (content) => {
      const actionResult = await dispatch(publishPrivacyPolicy({ type, content }));
      if (publishPrivacyPolicy.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to publish privacy policy');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-privacy', type] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(togglePrivacyStatus({ id, type }));
      if (togglePrivacyStatus.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to toggle privacy status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-privacy', type] });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(restorePrivacyVersion({ id, type }));
      if (restorePrivacyVersion.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to restore privacy version');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-privacy', type] });
    },
  });

  const reduxState = useSelector((state) => state.legal?.privacy?.[type] || { active: null, history: [] });

  return {
    activePolicy: query.data?.data?.active || reduxState.active,
    history: query.data?.data?.history || reduxState.history || [],
    loading: query.isLoading && !reduxState.active,
    isFetching: query.isFetching,
    publishing: publishMutation.isPending,
    error: query.error || publishMutation.error,
    publishPolicy: publishMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    restoreVersion: restoreVersionMutation.mutateAsync,
    refetch: query.refetch,
  };
};

export const useRefundPolicies = (type = 'customer') => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-refund', type],
    queryFn: async () => {
      const actionResult = await dispatch(fetchRefundPolicies(type));
      if (fetchRefundPolicies.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to fetch refund policies');
    },
    staleTime: 10 * 60 * 1000,       // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000,          // 30 minutes cache retention
    placeholderData: (prev) => prev,  // Keep existing data while refetching
    refetchOnMount: false,            // Don't refetch if cache is fresh
    refetchOnWindowFocus: false,      // Prevent reload on tab switch
    retry: 1,                         // Max 1 retry to prevent long blocking
  });

  const publishMutation = useMutation({
    mutationFn: async (content) => {
      const actionResult = await dispatch(publishRefundPolicy({ type, content }));
      if (publishRefundPolicy.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to publish refund policy');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund', type] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(toggleRefundStatus({ id, type }));
      if (toggleRefundStatus.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to toggle refund status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund', type] });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (id) => {
      const actionResult = await dispatch(restoreRefundVersion({ id, type }));
      if (restoreRefundVersion.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to restore refund version');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund', type] });
    },
  });

  const reduxState = useSelector((state) => state.legal?.refund?.[type] || { active: null, history: [] });

  return {
    activePolicy: query.data?.data?.active || reduxState.active,
    history: query.data?.data?.history || reduxState.history || [],
    loading: query.isLoading && !reduxState.active,
    isFetching: query.isFetching,
    publishing: publishMutation.isPending,
    error: query.error || publishMutation.error,
    publishPolicy: publishMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    restoreVersion: restoreVersionMutation.mutateAsync,
    refetch: query.refetch,
  };
};

export const useSupportContact = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-support-contact'],
    queryFn: async () => {
      const actionResult = await dispatch(fetchSupportContact());
      if (fetchSupportContact.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to fetch support contact details');
    },
    staleTime: 10 * 60 * 1000,       // 10 minutes cache freshness
    gcTime: 30 * 60 * 1000,          // 30 minutes cache retention
    placeholderData: (prev) => prev,  // Keep existing data while refetching
    refetchOnMount: false,            // Don't refetch if cache is fresh
    refetchOnWindowFocus: false,      // Prevent reload on tab switch
    retry: 1,                         // Max 1 retry to prevent long blocking
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const actionResult = await dispatch(updateSupportContact(payload));
      if (updateSupportContact.fulfilled.match(actionResult)) {
        return actionResult.payload;
      }
      throw new Error(actionResult.payload?.message || 'Failed to update support contact details');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-contact'] });
    },
  });

  return {
    contact: query.data?.data,
    loading: query.isLoading,
    isUpdating: updateMutation.isPending,
    error: query.error || updateMutation.error,
    updateContact: updateMutation.mutateAsync,
    refetch: query.refetch,
  };
};
