import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchFilters, DoctorProfile, DoctorSlot, Review, Order } from '@/types';
import { searchDoctors, getDoctorById, getDoctorReviews, getSpecialties } from '@/services/doctor.service';
import { getGroupedSlots, getAvailableSlots, GroupedSlots } from '@/services/slot.service';
import { getUserOrders, getOrderById, processPayment, cancelOrder, createOrder, updateOrderPatient } from '@/services/order.service';
import { useAuth } from '@/contexts/AuthContext';

// ─── Doctor Hooks ───────────────────────────────────────────────────
export function useDoctorSearch(filters: SearchFilters) {
  return useQuery<DoctorProfile[]>({
    queryKey: ['doctors', 'search', filters],
    queryFn: () => searchDoctors(filters),
    staleTime: 30_000,
  });
}

export function useDoctorProfile(doctorId: string) {
  return useQuery<DoctorProfile | null>({
    queryKey: ['doctors', doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60_000,
  });
}

export function useDoctorReviews(doctorId: string, limit = 10) {
  return useQuery<Review[]>({
    queryKey: ['reviews', doctorId, limit],
    queryFn: () => getDoctorReviews(doctorId, limit),
    enabled: !!doctorId,
    staleTime: 60_000,
  });
}

export function useSpecialties() {
  return useQuery<string[]>({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
    staleTime: 10 * 60_000,
  });
}

// ─── Slot Hooks ─────────────────────────────────────────────────────
export function useSlots(doctorId: string, date: string) {
  return useQuery<GroupedSlots>({
    queryKey: ['slots', doctorId, date],
    queryFn: () => getGroupedSlots(doctorId, date),
    enabled: !!doctorId && !!date,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

// ─── Order Hooks ────────────────────────────────────────────────────
export function useUserOrders() {
  const { user } = useAuth();
  const userId = (user as any)?.uid;
  
  return useQuery<Order[]>({
    queryKey: ['orders', userId],
    queryFn: () => getUserOrders(userId),
    enabled: !!userId,
    staleTime: 15_000,
  });
}

export function useOrder(orderId: string) {
  const { user } = useAuth();
  const userId = (user as any)?.uid;

  return useQuery<Order | null>({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId, userId),
    enabled: !!orderId && !!userId,
    staleTime: 5_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof createOrder>[0]) => createOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, userId, method }: { orderId: string; userId: string; method?: string }) =>
      processPayment(orderId, userId, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, userId, reason }: { orderId: string; userId: string; reason: string }) =>
      cancelOrder(orderId, userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
