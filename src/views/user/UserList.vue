<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600">管理系统用户信息</p>
      </div>
      <Button @click="handleCreateUser" class="flex items-center space-x-2">
        <Plus class="h-4 w-4" />
        <span>新增用户</span>
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="pt-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>关键字</Label>
            <Input
              v-model="searchParams.keyword"
              placeholder="用户名/邮箱/手机号"
              @keyup.enter="handleSearch"
            />
          </div>

          <div>
            <Label>角色</Label>
            <Select v-model="searchParams.role">
              <SelectTrigger>
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="super_admin">超级管理员</SelectItem>
                <SelectItem value="director">总监</SelectItem>
                <SelectItem value="leader">主管</SelectItem>
                <SelectItem value="sales">销售</SelectItem>
                <SelectItem value="agent">代理</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>状态</Label>
            <Select v-model="searchParams.status">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="banned">封禁</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end space-x-2">
            <Button @click="handleSearch">搜索</Button>
            <Button variant="outline" @click="handleReset">重置</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 批量操作 -->
    <div v-if="selectedUsers.length > 0" class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        @click="handleBatchDelete"
        :disabled="batchDeleting"
      >
        <Trash2 class="h-4 w-4 mr-1" />
        批量删除 ({{ selectedUsers.length }})
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="handleBatchExport"
        :disabled="batchExporting"
      >
        <Download class="h-4 w-4 mr-1" />
        导出
      </Button>
    </div>

    <!-- 用户列表表格 -->
    <DataTable
      :columns="columns"
      :data="userList"
      :loading="loading"
      :total-items="totalItems"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="handlePageChange"
      :row-selection="rowSelection"
      @row-selection-change="handleRowSelectionChange"
    />

    <!-- 用户表单对话框 -->
    <UserFormDialog
      v-model:open="showUserForm"
      :user="selectedUser"
      @success="handleFormSuccess"
    />

    <!-- 重置密码对话框 -->
    <ResetPasswordDialog
      v-model:open="showResetPassword"
      :user="selectedUser"
      @success="handleResetPasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { Plus, Trash2, Download, Edit, KeyRound, Eye } from 'lucide-vue-next'
import type { User, UserQueryParams, UserSearchParams, SearchRole, SearchStatus, UserStatus, UserRole } from '@/types/user'
import { userApi } from '@/api/user'
import DataTable from '@/components/business/DataTable.vue'
import UserFormDialog from '@/components/business/UserFormDialog.vue'
import ResetPasswordDialog from '@/components/business/ResetPasswordDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast/use-toast'

type RowSelectionState = Record<string, boolean>

const { toast } = useToast()

const loading = ref(false)
const userList = ref<User[]>([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedUsers = ref<string[]>([])
const rowSelection = ref<RowSelectionState>({})
const showUserForm = ref(false)
const showResetPassword = ref(false)
const selectedUser = ref<User | null>(null)
const batchDeleting = ref(false)
const batchExporting = ref(false)

// 使用UserSearchParams类型
const searchParams = reactive<UserSearchParams>({
  keyword: '',
  role: 'all',
  status: 'all',
  page: 1,
  page_size: 10,
})

// 修复Badge variant类型问题
const columns = [
  {
    id: 'avatar',
    header: '头像',
    cell: ({ row }) => {
      return {
        template: `
          <div class="flex justify-center">
            <Avatar class="h-10 w-10">
              <AvatarImage :src="row.avatar" />
              <AvatarFallback>{{ row.username.slice(0, 2).toUpperCase() }}</AvatarFallback>
            </Avatar>
          </div>
        `,
        setup() {
          return { row, Avatar, AvatarImage, AvatarFallback }
        }
      }
    }
  },
  {
    accessorKey: 'username',
    header: '用户名',
    cell: ({ row }) => {
      return {
        template: `<div class="font-medium">{{ row.username }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    cell: ({ row }) => {
      return {
        template: `<div class="text-sm text-gray-600">{{ row.email }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'phone',
    header: '手机号',
    cell: ({ row }) => {
      return {
        template: `<div class="text-sm">{{ row.phone }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'role',
    header: '角色',
    cell: ({ row }) => {
      return {
        template: `
          <Badge :variant="row.role === 'super_admin' ? 'default' : 'secondary'">
            {{ getRoleName(row.role) }}
          </Badge>
        `,
        setup() {
          const getRoleName = (role) => {
            const roleMap = {
              super_admin: '超级管理员',
              director: '总监',
              leader: '主管',
              sales: '销售',
              agent: '代理',
            }
            return roleMap[role] || role
          }
          return { row, Badge, getRoleName }
        }
      }
    }
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      return {
        template: `
          <Badge :variant="getStatusVariant(row.status)">
            {{ getStatusText(row.status) }}
          </Badge>
        `,
        setup() {
          const getStatusVariant = (status) => {
            const variantMap = {
              active: 'default',
              inactive: 'secondary',
              pending: 'outline',
              banned: 'destructive',
            }
            return variantMap[status] || 'default'
          }
          
          const getStatusText = (status) => {
            const textMap = {
              active: '正常',
              inactive: '禁用',
              pending: '待审核',
              banned: '封禁',
            }
            return textMap[status] || status
          }
          
          return { row, Badge, getStatusVariant, getStatusText }
        }
      }
    }
  },
  {
    accessorKey: 'level',
    header: '等级',
    cell: ({ row }) => {
      return {
        template: `<div class="text-center">{{ row.level }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'commission_rate',
    header: '佣金比例',
    cell: ({ row }) => {
      return {
        template: `<div class="text-center">{{ row.commission_rate }}%</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => {
      return {
        template: `<div class="text-sm text-gray-600">{{ formatDate(row.created_at) }}</div>`,
        setup() {
          const formatDate = (dateString) => {
            try {
              return new Date(dateString).toLocaleDateString()
            } catch (e) {
              return dateString
            }
          }
          return { row, formatDate }
        }
      }
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      return {
        template: `
          <div class="flex items-center space-x-1">
            <Button variant="ghost" size="sm" @click="onEdit(row)">
              <Edit class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" @click="onResetPassword(row)">
              <KeyRound class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" @click="onView(row)">
              <Eye class="h-4 w-4" />
            </Button>
          </div>
        `,
        setup() {
          const onEdit = (user) => {
            handleEditUser(user)
          }
          
          const onResetPassword = (user) => {
            handleResetPassword(user)
          }
          
          const onView = (user) => {
            handleViewUser(user)
          }
          
          return { 
            row, 
            onEdit, 
            onResetPassword, 
            onView,
            Button,
            Edit,
            KeyRound,
            Eye
          }
        }
      }
    }
  },
]

// 修复loadUserList函数中的类型问题
const loadUserList = async () => {
  loading.value = true
  try {
    // 创建基础参数对象
    const params: Partial<UserQueryParams> = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchParams.keyword,
    };
    
    // 只有非'all'值才添加到params，使用类型转换
    if (searchParams.role && searchParams.role !== 'all') {
      params.role = searchParams.role as UserRole;
    }
    if (searchParams.status && searchParams.status !== 'all') {
      params.status = searchParams.status as UserStatus;
    }
    
    const response = await userApi.getUserList(params as UserQueryParams);
    userList.value = response?.items || []; // 确保始终是数组
    totalItems.value = response?.total || 0;
  } catch (error) {
    console.error('加载用户列表失败:', error)
    toast({
      title: '获取用户列表失败',
      description: error instanceof Error ? error.message : '未知错误',
      variant: 'destructive',
    })
    // 确保即使出错时也有一个空数组
    userList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

const handleReset = () => {
  searchParams.keyword = ''
  searchParams.role = 'all'
  searchParams.status = 'all'
  handleSearch()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUserList()
}

const handleRowSelectionChange = (selection: RowSelectionState) => {
  rowSelection.value = selection
  selectedUsers.value = Object.keys(selection)
}

const handleCreateUser = () => {
  selectedUser.value = null
  showUserForm.value = true
}

const handleEditUser = (user: User) => {
  selectedUser.value = user
  showUserForm.value = true
}

const handleViewUser = (user: User) => {
  // 跳转到用户详情页
  console.log('查看用户详情:', user)
}

const handleResetPassword = (user: User) => {
  selectedUser.value = user
  showResetPassword.value = true
}

const handleBatchDelete = async () => {
  if (!selectedUsers.value.length) return

  batchDeleting.value = true
  try {
    await userApi.batchDeleteUsers(selectedUsers.value)
    toast({
      title: '删除成功',
      description: `已删除 ${selectedUsers.value.length} 个用户`,
    })
    selectedUsers.value = []
    rowSelection.value = {}
    loadUserList()
  } catch (error) {
    toast({
      title: '删除失败',
      description: error instanceof Error ? error.message : '未知错误',
      variant: 'destructive',
    })
  } finally {
    batchDeleting.value = false
  }
}

const handleBatchExport = async () => {
  batchExporting.value = true
  try {
    const blob = await userApi.exportUsers(searchParams)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `用户列表_${new Date().toLocaleDateString()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast({
      title: '导出成功',
      description: '用户数据已导出到本地',
    })
  } catch (error) {
    toast({
      title: '导出失败',
      description: error instanceof Error ? error.message : '未知错误',
      variant: 'destructive',
    })
  } finally {
    batchExporting.value = false
  }
}

const handleFormSuccess = () => {
  showUserForm.value = false
  loadUserList()
}

const handleResetPasswordSuccess = () => {
  showResetPassword.value = false
}

onMounted(() => {
  loadUserList()
})
</script>