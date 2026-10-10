<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="font-heading font-extrabold text-2xl text-tradeos-navy">Staff & Branch Access Control</h1>
        <p class="text-xs text-slate-500 mt-1">Invite staff, assign business roles and grant branch-scoped permissions</p>
      </div>

      <button @click="showInviteModal = true" class="btn-primary text-xs">
        <UserPlus class="w-4 h-4" />
        <span>Invite Staff Member</span>
      </button>
    </div>

    <!-- Active Staff Members Table -->
    <div class="card-panel p-0 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <h3 class="font-heading font-bold text-sm text-tradeos-navy">Workspace Members & Roles</h3>
        <span class="badge badge-navy">Owner: {{ authStore.user?.fullName }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
            <tr>
              <th class="p-3.5">Member Name</th>
              <th class="p-3.5">Email</th>
              <th class="p-3.5">Assigned Role</th>
              <th class="p-3.5">Branch Scope</th>
              <th class="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-tradeos-navy">{{ authStore.user?.fullName }} (You)</td>
              <td class="p-3.5 text-slate-600">{{ authStore.user?.email }}</td>
              <td class="p-3.5"><Badge variant="navy">Business Owner</Badge></td>
              <td class="p-3.5 font-semibold text-tradeos-blue">All Branches</td>
              <td class="p-3.5"><Badge variant="success">Active</Badge></td>
            </tr>
            <tr v-for="staff in staffList" :key="staff.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-tradeos-navy">{{ staff.name }}</td>
              <td class="p-3.5 text-slate-600">{{ staff.email }}</td>
              <td class="p-3.5"><Badge variant="info" class="capitalize">{{ staff.role }}</Badge></td>
              <td class="p-3.5 text-slate-600">{{ staff.branchName }}</td>
              <td class="p-3.5"><Badge variant="success">Active</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invite Staff Modal -->
    <Modal :show="showInviteModal" title="Invite Business Staff Member" @close="showInviteModal = false">
      <form @submit.prevent="handleInviteStaff" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Staff Member Full Name *</label>
          <input v-model="inviteName" type="text" required placeholder="e.g. Chiamaka Eze" class="input-field" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Staff Email Address *</label>
          <input v-model="inviteEmail" type="email" required placeholder="staff@business.ng" class="input-field" />
        </div>

        <div>
          <label class="block font-semibold text-tradeos-navy mb-1">Business Role *</label>
          <select v-model="inviteRole" class="input-field">
            <option value="manager">Business Manager (Daily Ops)</option>
            <option value="finance">Finance User (Invoices & Expenses)</option>
            <option value="cashier">Cashier / Sales Staff (POS Only)</option>
            <option value="inventory">Inventory Staff (Stock Receipts)</option>
          </select>
        </div>

        <button type="submit" class="btn-primary w-full justify-center">Send Invitation</button>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/common/Modal.vue';
import Badge from '@/components/common/Badge.vue';
import { UserPlus } from 'lucide-vue-next';

const authStore = useAuthStore();
const showInviteModal = ref(false);

const inviteName = ref('');
const inviteEmail = ref('');
const inviteRole = ref('cashier');

const staffList = ref([
  { id: 'st_1', name: 'Emeka Nwachukwu', email: 'emeka@cashier.ng', role: 'cashier', branchName: 'Main Branch' }
]);

const handleInviteStaff = () => {
  if (inviteName.value && inviteEmail.value) {
    staffList.value.push({
      id: 'st_' + Math.random().toString(36).substring(2, 9),
      name: inviteName.value,
      email: inviteEmail.value,
      role: inviteRole.value,
      branchName: authStore.activeBranch?.name || 'Main Branch'
    });
    showInviteModal.value = false;
    inviteName.value = ''; inviteEmail.value = '';
  }
};
</script>
