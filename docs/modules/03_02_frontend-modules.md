# Frontend Module Architecture in Vue for Tauri Applications

Creating modular frontend architectures in Vue for Tauri applications enables better code organization, reusability, and maintainability. This article explores patterns for building cohesive frontend modules that integrate seamlessly with Tauri's backend capabilities.

## Prerequisites

- Understanding of Vue 3's component architecture
- Knowledge of Pinia for state management
- Familiarity with TypeScript and composition API

## Core Concepts

Frontend modules in Tauri-Vue applications are self-contained units that encapsulate components, stores, services, and types related to specific functionality. These modules provide clear boundaries and interfaces while maintaining loose coupling between different features of the application.

## Implementation

### Module Structure Pattern

Create a standardized structure for frontend modules:

```
src/
├── modules/
│   ├── user/
│   │   ├── components/
│   │   │   ├── UserList.vue
│   │   │   ├── UserProfile.vue
│   │   │   └── UserForm.vue
│   │   ├── stores/
│   │   │   └── userStore.ts
│   │   ├── services/
│   │   │   └── userApi.ts
│   │   ├── composables/
│   │   │   └── useUser.ts
│   │   ├── types/
│   │   │   └── userTypes.ts
│   │   └── index.ts
│   └── ...
```

### Module Definition and Registration

Create a module definition system:

```typescript
// src/modules/frontendModule.ts
import { App, DefineComponent } from 'vue';
import { StoreDefinition } from 'pinia';

export interface FrontendModule {
  id: string;
  name: string;
  description?: string;
  
  // Vue components to register
  components: Record<string, DefineComponent>;
  
  // Pinia stores to register
  stores: StoreDefinition[];
  
  // Composables to provide
  composables?: Record<string, Function>;
  
  // Initialization function
  initialize?: (app: App) => void | Promise<void>;
  
  // Cleanup function
  cleanup?: () => void;
  
  // Dependencies on other modules
  dependencies?: string[];
  
  // Module configuration
  config?: Record<string, any>;
}

export class FrontendModuleManager {
  private modules: Map<string, FrontendModule> = new Map();
  private initializedModules: Set<string> = new Set();

  /**
   * Register a frontend module
   */
  registerModule(module: FrontendModule): void {
    // Validate dependencies
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        if (!this.modules.has(dep)) {
          throw new Error(`Module ${module.id} depends on unregistered module: ${dep}`);
        }
      }
    }

    this.modules.set(module.id, module);
  }

  /**
   * Initialize a specific module and its dependencies
   */
  async initializeModule(moduleId: string, app: App): Promise<void> {
    if (this.initializedModules.has(moduleId)) {
      return; // Already initialized
    }

    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Initialize dependencies first
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        await this.initializeModule(dep, app);
      }
    }

    // Register components
    Object.entries(module.components).forEach(([name, component]) => {
      app.component(name, component);
    });

    // Initialize module-specific logic
    if (module.initialize) {
      await module.initialize(app);
    }

    this.initializedModules.add(moduleId);
    console.log(`Module ${moduleId} initialized successfully`);
  }

  /**
   * Initialize all registered modules
   */
  async initializeAll(app: App): Promise<void> {
    for (const moduleId of this.modules.keys()) {
      await this.initializeModule(moduleId, app);
    }
  }

  /**
   * Get a registered module
   */
  getModule(moduleId: string): FrontendModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Check if a module is initialized
   */
  isInitialized(moduleId: string): boolean {
    return this.initializedModules.has(moduleId);
  }

  /**
   * Get all registered module IDs
   */
  getModuleIds(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Cleanup resources when modules are unloaded
   */
  cleanup(): void {
    for (const [moduleId, module] of this.modules.entries()) {
      if (module.cleanup) {
        module.cleanup();
      }
      this.initializedModules.delete(moduleId);
    }
  }
}
```

### Type Definitions for Frontend Modules

Create type definitions for frontend module components:

```typescript
// src/modules/user/types/userTypes.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UserFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Module-Specific Store

Create a Pinia store for the user module:

```typescript
// src/modules/user/stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, CreateUserRequest, UpdateUserRequest, UserFilter, PagedResponse } from '../types/userTypes';
import { userApi } from '../services/userApi';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Getters
  const getUserById = computed(() => (id: number) => {
    return users.value.find(user => user.id === id) || null;
  });

  const getUsers = computed(() => users.value);
  const getLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

  // Actions
  const fetchUsers = async (filter: UserFilter = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response: PagedResponse<User> = await userApi.getUsers(filter);
      users.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('Error fetching users:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchUser = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const user = await userApi.getUser(id);
      
      // Update or add to local state
      const existingIndex = users.value.findIndex(u => u.id === id);
      if (existingIndex !== -1) {
        users.value[existingIndex] = user;
      } else {
        users.value.push(user);
      }
      
      currentUser.value = user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user';
      console.error(`Error fetching user ${id}:`, err);
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const newUser = await userApi.createUser(userData);
      users.value.push(newUser);
      return newUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      console.error('Error creating user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (updateData: UpdateUserRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await userApi.updateUser(updateData);
      
      // Update local state
      const index = users.value.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        const originalUser = users.value[index];
        users.value[index] = { ...originalUser, ...updatedUser };
      }
      
      if (currentUser.value?.id === updatedUser.id) {
        currentUser.value = updatedUser;
      }
      
      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      console.error(`Error updating user ${updateData.id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const success = await userApi.deleteUser(id);
      if (success) {
        users.value = users.value.filter(user => user.id !== id);
        if (currentUser.value?.id === id) {
          currentUser.value = null;
        }
      }
      return success;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user';
      console.error(`Error deleting user ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setActiveUser = (user: User | null) => {
    currentUser.value = user;
  };

  // Reset state
  const reset = () => {
    users.value = [];
    currentUser.value = null;
    loading.value = false;
    error.value = null;
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    };
  };

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    pagination,

    // Getters
    getUserById,
    getUsers,
    getLoading,
    getError,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    setActiveUser,
    reset,
  };
});
</script>
```

### Module-Specific Service

Create an API service for the user module:

```typescript
// src/modules/user/services/userApi.ts
import { invoke } from '@tauri-apps/api';
import { User, CreateUserRequest, UpdateUserRequest, UserFilter, PagedResponse } from '../types/userTypes';

class UserApiService {
  async getUsers(filter: UserFilter = {}): Promise<PagedResponse<User>> {
    try {
      const response: any = await invoke('get_users_command', { filter });
      
      if (response.success) {
        return {
          data: response.data.users || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 20,
          totalPages: Math.ceil((response.data.total || 0) / (response.data.limit || 20))
        };
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      const response: any = await invoke('get_user_command', { id });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response: any = await invoke('create_user_command', { userData });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(updateData: UpdateUserRequest): Promise<User> {
    try {
      const response: any = await invoke('update_user_command', { updateData });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const response: any = await invoke('delete_user_command', { id });
      
      if (response.success) {
        return response.data || false;
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const response: any = await invoke('search_users_command', { searchTerm });
      
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.error || 'Failed to search users');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

export const userApi = new UserApiService();
```

### Module-Specific Composable

Create a composable for the user module:

```typescript
// src/modules/user/composables/useUser.ts
import { computed } from 'vue';
import { useUserStore } from '../stores/userStore';

export function useUser() {
  const store = useUserStore();

  // Computed properties
  const users = computed(() => store.users);
  const currentUser = computed(() => store.currentUser);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  // Methods
  const loadUsers = async (filter?: any) => {
    await store.fetchUsers(filter);
  };

  const loadUser = async (id: number) => {
    await store.fetchUser(id);
  };

  const addUser = async (userData: any) => {
    return await store.createUser(userData);
  };

  const editUser = async (updateData: any) => {
    return await store.updateUser(updateData);
  };

  const removeUser = async (id: number) => {
    return await store.deleteUser(id);
  };

  const setSearchTerm = (term: string) => {
    // If you have a setSearchTerm in your store
  };

  return {
    // Reactive state
    users,
    currentUser,
    loading,
    error,

    // Actions
    loadUsers,
    loadUser,
    addUser,
    editUser,
    removeUser,
    setSearchTerm,

    // Direct store access if needed
    store,
  };
}
```

### Module-Specific Components

Create components for the user module:

```vue
<!-- src/modules/user/components/UserList.vue -->
<template>
  <div class="user-list">
    <div class="list-header">
      <h2>Users</h2>
      <div class="header-actions">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search users..."
          class="search-input"
          @input="handleSearch"
        />
        <button @click="openCreateModal" class="btn btn-primary">
          Add User
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>Loading users...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>Error: {{ error }}</p>
      <button @click="loadUsers" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0" class="empty-state">
      <p>No users found</p>
    </div>

    <!-- Users list -->
    <div v-else class="users-grid">
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="user-card"
        :class="{ active: currentUser?.id === user.id }"
        @click="selectUser(user)"
      >
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <div class="user-meta">
            <span class="status" :class="{ active: user.isActive }">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="date">Created: {{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
        <div class="user-actions">
          <button @click.stop="editUser(user)" class="btn btn-secondary btn-small">Edit</button>
          <button @click.stop="confirmDelete(user)" class="btn btn-danger btn-small">Delete</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="users.length > 0 && pagination.totalPages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page <= 1"
        class="btn btn-secondary"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page >= pagination.totalPages"
        class="btn btn-secondary"
      >
        Next
      </button>
    </div>

    <!-- Create/Edit modal -->
    <UserFormModal
      v-if="showFormModal"
      :user="editingUser"
      @submit="handleSubmit"
      @close="closeFormModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User } from '../types/userTypes';
import { useUser } from '../composables/useUser';
import UserFormModal from './UserFormModal.vue';

// Use the composable
const {
  users,
  currentUser,
  loading,
  error,
  loadUsers,
  loadUser,
  addUser,
  editUser: updateUser,
  removeUser
} = useUser();

// Local state
const searchTerm = ref('');
const showFormModal = ref(false);
const editingUser = ref<User | null>(null);
const filter = ref({
  search: '',
  isActive: undefined as boolean | undefined,
  page: 1,
  limit: 20
});

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const selectUser = (user: User) => {
  // Handle user selection
  console.log('Selected user:', user);
};

const editUser = (user: User) => {
  editingUser.value = user;
  showFormModal.value = true;
};

const openCreateModal = () => {
  editingUser.value = null;
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  editingUser.value = null;
};

const handleSubmit = async (userData: any) => {
  try {
    if (editingUser.value) {
      // Update existing user
      await updateUser({
        id: editingUser.value.id,
        ...userData
      });
    } else {
      // Create new user
      await addUser(userData);
    }
    closeFormModal();
    // Reload users to reflect changes
    await loadUsers(filter.value);
  } catch (err) {
    console.error('Error saving user:', err);
  }
};

const confirmDelete = async (user: User) => {
  if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
    try {
      await removeUser(user.id);
      // Reload users to reflect deletion
      await loadUsers(filter.value);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }
};

const handleSearch = () => {
  filter.value.search = searchTerm.value;
  filter.value.page = 1;
  loadUsers(filter.value);
};

const changePage = async (newPage: number) => {
  if (newPage < 1 || newPage > currentUser.value) return;
  
  filter.value.page = newPage;
  await loadUsers(filter.value);
};

// Initialize data
onMounted(async () => {
  await loadUsers(filter.value);
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.user-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.user-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #007acc;
}

.user-card.active {
  border-color: #007acc;
  background-color: #f0f8ff;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.user-info p {
  margin: 0 0 12px 0;
  color: #666;
}

.user-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
}

.status {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.status.active {
  background-color: #d4edda;
  color: #155724;
}

.status:not(.active) {
  background-color: #f8d7da;
  color: #721c24;
}

.user-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007acc;
  color: white;
}

.btn-primary:hover {
  background-color: #005a9e;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-state {
  color: #007acc;
}

.error-state {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-info {
  color: #666;
}
</style>
```

```vue
<!-- src/modules/user/components/UserFormModal.vue -->
<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ editingUser ? 'Edit User' : 'Create User' }}</h2>
        <button class="modal-close" @click="closeModal">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M4,4 L12,12 M12,4 L4,12" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            :required="!editingUser"
            class="form-control"
          />
          <small v-if="editingUser" class="form-help">
            Leave blank to keep current password
          </small>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="form-checkbox"
            />
            Active User
          </label>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            {{ editingUser ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/userTypes';

interface Props {
  user?: User | null;
}

const props = withDefaults(defineProps<Props>(), {
  user: null
});

const emit = defineEmits<{
  submit: [data: CreateUserRequest | UpdateUserRequest];
  close: [];
}>();

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  isActive: true
});

// Computed
const editingUser = computed(() => props.user);

const isFormValid = computed(() => {
  return formData.name.trim().length > 0 && 
         formData.email.trim().length > 0 &&
         (!editingUser.value || formData.password.trim().length === 0 || formData.password.trim().length >= 6);
});

// Watch for user changes to update form
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.name = newUser.name;
    formData.email = newUser.email;
    formData.password = '';
    formData.isActive = newUser.isActive;
  } else {
    // Reset form for new user
    formData.name = '';
    formData.email = '';
    formData.password = '';
    formData.isActive = true;
  }
}, { immediate: true });

// Methods
const handleSubmit = () => {
  if (editingUser.value) {
    // Update user
    const updateData: UpdateUserRequest = {
      id: editingUser.value.id,
      name: formData.name,
      email: formData.email,
      isActive: formData.isActive
    };
    
    if (formData.password.trim()) {
      (updateData as any).password = formData.password;
    }
    
    emit('submit', updateData);
  } else {
    // Create user
    const createData: CreateUserRequest = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    
    emit('submit', createData);
  }
};

const closeModal = () => {
  emit('close');
};

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// Focus first input on mount
onMounted(() => {
  const firstInput = document.querySelector('input');
  if (firstInput) {
    firstInput.focus();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
}

.user-form {
  padding: 20px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.form-checkbox {
  margin-right: 8px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.form-help {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007acc;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #005a9e;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}
</style>
```

## Advanced Patterns

### Module Communication System

Create a communication system for frontend modules:

```typescript
// src/modules/user/composables/useModuleCommunication.ts
import { ref, reactive } from 'vue';

export interface ModuleMessage {
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: number;
  correlationId?: string;
}

export interface ModuleEventBus {
  subscribe(eventType: string, callback: (message: ModuleMessage) => void): () => void;
  emit(message: Omit<ModuleMessage, 'timestamp'>): void;
  emitTo(eventType: string, target: string, data: any): void;
}

export function useModuleCommunication(): ModuleEventBus {
  const subscribers = reactive<Record<string, Array<(message: ModuleMessage) => void>>>({});

  const subscribe = (eventType: string, callback: (message: ModuleMessage) => void): () => void => {
    if (!subscribers[eventType]) {
      subscribers[eventType] = [];
    }
    
    subscribers[eventType].push(callback);

    return () => {
      const index = subscribers[eventType].indexOf(callback);
      if (index > -1) {
        subscribers[eventType].splice(index, 1);
      }
    };
  };

  const emit = (message: Omit<ModuleMessage, 'timestamp'>): void => {
    const fullMessage: ModuleMessage = {
      ...message,
      timestamp: Date.now()
    };

    // Notify specific subscribers for this message type
    if (subscribers[message.type]) {
      subscribers[message.type].forEach(callback => {
        try {
          callback(fullMessage);
        } catch (error) {
          console.error(`Error in message callback for ${message.type}:`, error);
        }
      });
    }
  };

  const emitTo = (eventType: string, target: string, data: any): void => {
    const message: ModuleMessage = {
      from: 'user-module', // This would be dynamic in a real implementation
      to: target,
      type: eventType,
      data,
      timestamp: Date.now()
    };

    emit(message);
  };

  return {
    subscribe,
    emit: (message: Omit<ModuleMessage, 'timestamp'>) => emit(message),
    emitTo
  };
}
```

### Module Configuration System

Create a configuration system for frontend modules:

```typescript
// src/modules/user/config/userConfig.ts
import { reactive } from 'vue';

export interface UserModuleConfig {
  apiEndpoint: string;
  pageSize: number;
  enableCaching: boolean;
  cacheExpiryMinutes: number;
  enableRealtimeUpdates: boolean;
  maxConcurrentRequests: number;
}

export class UserModuleConfigManager {
  private static instance: UserModuleConfigManager;
  private config = reactive<UserModuleConfig>({
    apiEndpoint: '/api/users',
    pageSize: 20,
    enableCaching: true,
    cacheExpiryMinutes: 5,
    enableRealtimeUpdates: false,
    maxConcurrentRequests: 5
  });

  static getInstance(): UserModuleConfigManager {
    if (!UserModuleConfigManager.instance) {
      UserModuleConfigManager.instance = new UserModuleConfigManager();
    }
    return UserModuleConfigManager.instance;
  }

  get configValue(): UserModuleConfig {
    return this.config;
  }

  updateConfig(updates: Partial<UserModuleConfig>): void {
    Object.assign(this.config, updates);
  }

  resetToDefaults(): void {
    this.config.apiEndpoint = '/api/users';
    this.config.pageSize = 20;
    this.config.enableCaching = true;
    this.config.cacheExpiryMinutes = 5;
    this.config.enableRealtimeUpdates = false;
    this.config.maxConcurrentRequests = 5;
  }
}

// Create and export singleton instance
export const userModuleConfig = UserModuleConfigManager.getInstance();
```

### Module Testing Utilities

Create testing utilities for frontend modules:

```typescript
// src/modules/user/__tests__/testUtils.ts
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';

export function setupTestEnvironment() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return { pinia };
}

export function createMockUserStore() {
  return {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    fetchUsers: vi.fn(),
    fetchUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserById: vi.fn(),
    getUsers: vi.fn()
  };
}

// Mock Tauri API calls
export function mockTauriApi() {
  global.window.__TAURI_INTERNALS__ = {
    invoke: vi.fn((cmd: string, args: any) => {
      // Mock different API responses based on command
      switch (cmd) {
        case 'get_users_command':
          return Promise.resolve({
            success: true,
            data: { users: [], total: 0, page: 1, limit: 20 }
          });
        case 'get_user_command':
          return Promise.resolve({
            success: true,
            data: { id: 1, name: 'Test User', email: 'test@example.com', isActive: true }
          });
        default:
          return Promise.resolve({ success: true, data: null });
      }
    })
  };
}
```

## Testing

Test the frontend module system:

```typescript
// src/modules/user/__tests__/userModule.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createPinia, setActivePinia, storeToRefs } from 'pinia';
import { mount } from '@vue/test-utils';
import { useUserStore } from '../stores/userStore';
import UserList from '../components/UserList.vue';
import { userApi } from '../services/userApi';
import { setupTestEnvironment, mockTauriApi } from './testUtils';

describe('User Module Components', () => {
  beforeEach(() => {
    setupTestEnvironment();
    mockTauriApi();
  });

  it('renders user list component', () => {
    const wrapper = mount(UserList);
    expect(wrapper.find('.user-list').exists()).toBe(true);
    expect(wrapper.find('.list-header h2').text()).toBe('Users');
  });

  it('displays loading state', async () => {
    const wrapper = mount(UserList);
    const store = useUserStore();
    
    // Simulate loading state
    store.loading = true;
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.loading-state').exists()).toBe(true);
  });

  it('interacts with user store correctly', async () => {
    const store = useUserStore();
    
    // Test initial state
    expect(store.users).toEqual([]);
    expect(store.loading).toBe(false);
    
    // Test fetchUsers action
    await store.fetchUsers();
    
    // Check that users have been loaded (mock will return empty array)
    expect(store.users).toEqual([]);
  });
});

describe('User Module Services', () => {
  beforeEach(() => {
    mockTauriApi();
  });

  it('fetches users through API service', async () => {
    const users = await userApi.getUsers();
    expect(users).toHaveProperty('data');
    expect(users).toHaveProperty('total');
  });

  it('handles API errors gracefully', async () => {
    // Mock an API error
    vi.spyOn(window, 'window', 'get').mockImplementation(() => ({
      __TAURI_INTERNALS__: {
        invoke: vi.fn(() => Promise.reject(new Error('API Error')))
      }
    }));

    await expect(userApi.getUsers()).rejects.toThrow('API Error');
  });
});

describe('User Store', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  it('manages user state correctly', () => {
    const store = useUserStore();
    
    expect(store.users).toEqual([]);
    expect(store.currentUser).toBeNull();
    
    // Add a user to the store
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      isActive: true
    };
    
    store.users.push(mockUser);
    
    expect(store.users).toHaveLength(1);
    expect(store.getUserById.value(1)).toEqual(mockUser);
  });
});
```

## Troubleshooting

Common frontend module challenges and solutions:

- **State Management**: Use Pinia stores to properly manage module state
- **Component Communication**: Use composables and event buses for inter-component communication
- **Type Safety**: Define clear TypeScript interfaces for all module data structures
- **Performance**: Implement proper caching and lazy loading for large datasets
- **Testing**: Create comprehensive unit and integration tests for module functionality

## Summary

Frontend module architecture in Vue for Tauri applications provides a clean separation of concerns by encapsulating components, stores, services, and types into focused modules. By following standardized patterns for module structure, state management, and inter-module communication, you can build maintainable and scalable frontend applications.

Continue exploring related topics in our guide to [Backend Module Architecture](./03_07_backend-modules.md) to learn how to create modular backend services that complement your frontend modules.