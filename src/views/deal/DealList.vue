<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">成交管理</h1>
      <Button @click="openCreateDialog">
        <PlusIcon class="h-4 w-4 mr-2" />
        添加成交
      </Button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardContent class="pt-6">
          <div class="flex flex-col items-center">
            <p class="text-sm text-gray-500">总成交金额</p>
            <h2 class="text-3xl font-bold text-primary mt-1">¥{{ dealStatistics.totalAmount }}</h2>
            <p class="text-xs text-gray-400 mt-1">成交笔数: {{ dealStatistics.totalCount }}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center">
            <p class="text-sm text-gray-500">代理提点总额</p>
            <h2 class="text-3xl font-bold text-primary mt-1">¥{{ dealStatistics.totalCommission }}</h2>
            <p class="text-xs text-gray-400 mt-1">
              提点比例: {{ 
                dealStatistics.totalAmount > 0 
                  ? ((dealStatistics.totalCommission / dealStatistics.totalAmount) * 100).toFixed(2) 
                  : '0.00' 
              }}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center">
            <p class="text-sm text-gray-500">产品分布</p>
            <div class="w-full flex justify-around mt-2">
              <div v-for="(product, idx) in dealStatistics.productBreakdown" :key="idx" class="text-center">
                <p class="text-xs text-gray-500">{{ product.name }}</p>
                <p class="font-medium">{{ product.percentage }}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 过滤和搜索区域 -->
    <div class="bg-white p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium mb-1 block">成交状态</label>
          <select 
            v-model="filters.status" 
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">全部状态</option>
            <option v-for="status in dealStatusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">产品类型</label>
          <select 
            v-model="filters.productType" 
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">全部产品</option>
            <option v-for="type in productTypeOptions" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">成交日期</label>
          <div class="flex space-x-2">
            <Input 
              v-model="filters.startDate" 
              type="date" 
              class="w-full" 
            />
            <span class="flex items-center">至</span>
            <Input 
              v-model="filters.endDate" 
              type="date" 
              class="w-full" 
            />
          </div>
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">搜索</label>
          <div class="flex space-x-2">
            <Input 
              v-model="filters.keyword" 
              placeholder="搜索客户/产品名称" 
              class="w-full" 
            />
            <Button variant="outline" @click="searchDeals">
              <SearchIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" @click="resetFilters">
          <RefreshCcwIcon class="h-3 w-3 mr-1" />
          重置筛选
        </Button>
        <Button size="sm" variant="outline" @click="exportData">
          <DownloadIcon class="h-3 w-3 mr-1" />
          导出数据
        </Button>
      </div>
    </div>

    <!-- 表格区域 -->
    <DataTable
      :columns="columns"
      :data="deals"
      :loading="loading"
      :pagination="true"
      :total-items="totalItems"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @page-change="handlePageChange"
      empty-text="暂无成交数据"
    >
      <template #actions>
        <Button 
          variant="destructive" 
          size="sm" 
          :disabled="selectedDeals.length === 0"
          @click="confirmBatchDelete"
        >
          <TrashIcon class="h-4 w-4 mr-1" />
          批量删除
        </Button>
      </template>
    </DataTable>

    <!-- 创建/编辑成交对话框 -->
    <Dialog :open="showDealDialog" @update:open="showDealDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editMode ? '编辑成交' : '添加成交' }}</DialogTitle>
          <DialogDescription>
            {{ editMode ? '更新成交信息' : '填写成交基本信息，创建新成交记录' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmitDeal" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">产品名称</label>
              <Input v-model="dealForm.productName" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">产品类型</label>
              <select 
                v-model="dealForm.productType" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">请选择</option>
                <option v-for="type in productTypeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">成交金额</label>
              <Input v-model="dealForm.amount" type="number" min="0" step="0.01" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">代理提点金额</label>
              <Input v-model="dealForm.commissionAmount" type="number" min="0" step="0.01" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">客户名称</label>
              <Input v-model="dealForm.clientName" required />
              <Input v-model="dealForm.clientId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">成交状态</label>
              <select 
                v-model="dealForm.status" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">请选择</option>
                <option v-for="status in dealStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">成交日期</label>
              <Input v-model="dealForm.dealDate" type="date" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">支付方式</label>
              <Input v-model="dealForm.paymentMethod" />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">代理名称</label>
              <Input v-model="dealForm.agentName" />
              <Input v-model="dealForm.agentId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">产品经理</label>
              <Input v-model="dealForm.managerName" required />
              <Input v-model="dealForm.managerId" type="hidden" />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">备注</label>
            <textarea 
              v-model="dealForm.remark" 
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
            ></textarea>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="showDealDialog = false">取消</Button>
            <Button type="submit" :loading="submitting">{{ editMode ? '更新' : '创建' }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 确认删除对话框 -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            {{ deleteMode === 'single' ? '确定要删除该成交记录吗？此操作不可撤销。' : `确定要删除选中的 ${selectedDeals.length} 个成交记录吗？此操作不可撤销。` }}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" @click="showDeleteDialog = false">取消</Button>
          <Button 
            type="button" 
            variant="destructive" 
            :loading="deleting"
            @click="confirmDelete"
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  PlusIcon, SearchIcon, TrashIcon, 
  PencilIcon, MoreHorizontalIcon, DownloadIcon, RefreshCcwIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import DataTable from '@/components/business/DataTable.vue'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { dealApi } from '@/api/deal'
import { DealStatus, ProductType, type Deal, type DealStatistics } from '@/types/deal'

// 状态选项
const dealStatusOptions = [
  { value: DealStatus.PENDING, label: '待确认' },
  { value: DealStatus.CONFIRMED, label: '已确认' },
  { value: DealStatus.CANCELED, label: '已取消' },
  { value: DealStatus.REFUNDED, label: '已退款' },
]

// 产品类型选项
const productTypeOptions = [
  { value: ProductType.AI_COURSE, label: 'AI课' },
  { value: ProductType.AI_EMPLOYMENT, label: 'AI就业' },
  { value: ProductType.AI_TOOLS, label: 'AI工具' },
  { value: ProductType.OTHERS, label: '其他' },
]

// 成交数据
const deals = ref<Deal[]>([])
const totalItems = ref(0)
const loading = ref(false)
const selectedDeals = ref<string[]>([])

// 统计数据
const dealStatistics = ref<DealStatistics>({
  totalAmount: 0,
  totalCount: 0,
  totalCommission: 0,
  productBreakdown: [],
  timeAnalysis: []
})

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
})

// 筛选条件
const filters = ref({
  keyword: '',
  status: '',
  productType: '',
  startDate: '',
  endDate: '',
})

// 表单相关
const showDealDialog = ref(false)
const editMode = ref(false)
const currentDealId = ref<string | null>(null)
const dealForm = ref({
  productName: '',
  productType: '',
  amount: 0,
  commissionAmount: 0,
  clientId: '',
  clientName: '',
  agentId: '',
  agentName: '',
  managerId: '',
  managerName: '',
  dealDate: new Date().toISOString().split('T')[0],
  status: DealStatus.PENDING,
  paymentMethod: '',
  remark: '',
})
const submitting = ref(false)

// 删除相关
const showDeleteDialog = ref(false)
const deleteMode = ref<'single' | 'batch'>('single')
const deleting = ref(false)

// 表格列定义
const columns = [
  {
    id: 'select',
    header: '选择',
    cell: ({ row }) => {
      return {
        template: `
          <input 
            type="checkbox" 
            :checked="selectedDeals.includes(row.id)" 
            @change="toggleSelection(row.id)"
            class="rounded border-gray-300"
          />
        `,
        setup() {
          const toggleSelection = (id) => {
            const index = selectedDeals.value.indexOf(id)
            if (index === -1) {
              selectedDeals.value.push(id)
            } else {
              selectedDeals.value.splice(index, 1)
            }
          }
          return { selectedDeals, toggleSelection, row }
        }
      }
    }
  },
  {
    accessorKey: 'productName',
    header: '产品名称',
    cell: ({ row }) => {
      return {
        template: `
          <div>
            <div class="font-medium">{{ row.productName }}</div>
            <div class="text-xs text-gray-500">{{ getProductTypeLabel(row.productType) }}</div>
          </div>
        `,
        setup() {
          const getProductTypeLabel = (productType) => {
            switch (productType) {
              case ProductType.AI_COURSE:
                return 'AI课'
              case ProductType.AI_EMPLOYMENT:
                return 'AI就业'
              case ProductType.AI_TOOLS:
                return 'AI工具'
              case ProductType.OTHERS:
                return '其他'
              default:
                return productType
            }
          }
          return { row, getProductTypeLabel }
        }
      }
    }
  },
  {
    accessorKey: 'amount',
    header: '成交金额',
    cell: ({ row }) => {
      return {
        template: `<div class="font-medium">¥{{ row.amount }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'commissionAmount',
    header: '提点金额',
    cell: ({ row }) => {
      return {
        template: `<div>¥{{ row.commissionAmount }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'clientName',
    header: '客户',
    cell: ({ row }) => {
      return {
        template: `<div>{{ row.clientName }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'agentName',
    header: '代理',
    cell: ({ row }) => {
      return {
        template: `<div>{{ row.agentName || '-' }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'managerName',
    header: '产品经理',
    cell: ({ row }) => {
      return {
        template: `<div>{{ row.managerName }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'dealDate',
    header: '成交日期',
    cell: ({ row }) => {
      return {
        template: `<div>{{ formatDate(row.dealDate) }}</div>`,
        setup() {
          const formatDate = (dateString) => {
            try {
              const date = new Date(dateString)
              return date.toLocaleDateString()
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
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      return {
        template: `
          <span :class="getBgColor(row.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            {{ getLabel(row.status) }}
          </span>
        `,
        setup() {
          const getLabel = (status) => {
            if (status === DealStatus.PENDING) {
              return '待确认'
            } else if (status === DealStatus.CONFIRMED) {
              return '已确认'
            } else if (status === DealStatus.CANCELED) {
              return '已取消'
            } else if (status === DealStatus.REFUNDED) {
              return '已退款'
            }
            return '未知'
          }
          
          const getBgColor = (status) => {
            if (status === DealStatus.PENDING) {
              return 'bg-yellow-100 text-yellow-800'
            } else if (status === DealStatus.CONFIRMED) {
              return 'bg-green-100 text-green-800'
            } else if (status === DealStatus.CANCELED) {
              return 'bg-red-100 text-red-800'
            } else if (status === DealStatus.REFUNDED) {
              return 'bg-orange-100 text-orange-800'
            }
            return 'bg-gray-100 text-gray-800'
          }
          
          return { row, getLabel, getBgColor }
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
          <div class="flex items-center space-x-2">
            <Button size="sm" variant="ghost" class="h-8 w-8 p-0" @click="onEdit(row.id)">
              <PencilIcon class="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" class="h-8 w-8 p-0" @click="onDelete(row.id)">
              <TrashIcon class="h-4 w-4" />
            </Button>
            <router-link :to="'/deal/' + row.id">
              <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </router-link>
          </div>
        `,
        setup() {
          const onEdit = (id) => {
            editDeal(id)
          }
          
          const onDelete = (id) => {
            deleteDeal(id)
          }
          
          return { row, onEdit, onDelete, PencilIcon, TrashIcon, MoreHorizontalIcon, Button }
        }
      }
    }
  }
]

// 获取成交列表数据
const fetchDeals = async () => {
  loading.value = true
  try {
    const { page, pageSize } = pagination.value
    
    const queryParams = {
      page,
      pageSize,
      keyword: filters.value.keyword,
      status: filters.value.status || undefined,
      productType: filters.value.productType || undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
    }
    
    const response = await dealApi.getDealList(queryParams)
    deals.value = response.data
    totalItems.value = response.total
    
    // 获取统计数据
    fetchDealStatistics()
  } catch (error) {
    console.error('Failed to fetch deals:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

// 获取成交统计数据
const fetchDealStatistics = async () => {
  try {
    const { startDate, endDate } = filters.value
    
    const queryParams = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
    
    dealStatistics.value = await dealApi.getDealStatistics(queryParams)
  } catch (error) {
    console.error('Failed to fetch deal statistics:', error)
    // TODO: 显示错误提示
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    keyword: '',
    status: '',
    productType: '',
    startDate: '',
    endDate: '',
  }
  searchDeals()
}

// 搜索成交
const searchDeals = () => {
  pagination.value.page = 1
  fetchDeals()
}

// 处理分页变更
const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchDeals()
}

// 打开创建成交对话框
const openCreateDialog = () => {
  editMode.value = false
  resetDealForm()
  showDealDialog.value = true
}

// 编辑成交
const editDeal = async (dealId: string) => {
  try {
    const deal = await dealApi.getDeal(dealId)
    dealForm.value = {
      productName: deal.productName,
      productType: deal.productType,
      amount: deal.amount,
      commissionAmount: deal.commissionAmount,
      clientId: deal.clientId,
      clientName: deal.clientName,
      agentId: deal.agentId || '',
      agentName: deal.agentName || '',
      managerId: deal.managerId,
      managerName: deal.managerName,
      dealDate: new Date(deal.dealDate).toISOString().split('T')[0],
      status: deal.status,
      paymentMethod: deal.paymentMethod || '',
      remark: deal.remark || '',
    }
    currentDealId.value = dealId
    editMode.value = true
    showDealDialog.value = true
  } catch (error) {
    console.error('Failed to get deal details:', error)
    // TODO: 显示错误提示
  }
}

// 重置表单
const resetDealForm = () => {
  dealForm.value = {
    productName: '',
    productType: '',
    amount: 0,
    commissionAmount: 0,
    clientId: '',
    clientName: '',
    agentId: '',
    agentName: '',
    managerId: '',
    managerName: '',
    dealDate: new Date().toISOString().split('T')[0],
    status: DealStatus.PENDING,
    paymentMethod: '',
    remark: '',
  }
  currentDealId.value = null
}

// 提交成交表单
const handleSubmitDeal = async () => {
  submitting.value = true
  try {
    if (editMode.value && currentDealId.value) {
      await dealApi.updateDeal(currentDealId.value, dealForm.value)
    } else {
      await dealApi.createDeal(dealForm.value as any)
    }
    showDealDialog.value = false
    fetchDeals()
  } catch (error) {
    console.error('Failed to save deal:', error)
    // TODO: 显示错误提示
  } finally {
    submitting.value = false
  }
}

// 删除单个成交
const deleteDeal = (dealId: string) => {
  currentDealId.value = dealId
  deleteMode.value = 'single'
  showDeleteDialog.value = true
}

// 批量删除成交
const confirmBatchDelete = () => {
  deleteMode.value = 'batch'
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  deleting.value = true
  try {
    if (deleteMode.value === 'single' && currentDealId.value) {
      await dealApi.deleteDeal(currentDealId.value)
    } else if (deleteMode.value === 'batch') {
      await dealApi.batchDeleteDeals(selectedDeals.value)
      selectedDeals.value = []
    }
    showDeleteDialog.value = false
    fetchDeals()
  } catch (error) {
    console.error('Failed to delete deal(s):', error)
    // TODO: 显示错误提示
  } finally {
    deleting.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    const { keyword, status, productType, startDate, endDate } = filters.value
    const blob = await dealApi.exportDeals({ 
      keyword, status, productType, startDate, endDate 
    })
    
    // 创建临时下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deals-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    
    // 释放URL对象
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('Failed to export deals:', error)
    // TODO: 显示错误提示
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (e) {
    return dateString
  }
}

// 获取产品类型文本
const getProductTypeLabel = (productType: string) => {
  switch (productType) {
    case ProductType.AI_COURSE:
      return 'AI课'
    case ProductType.AI_EMPLOYMENT:
      return 'AI就业'
    case ProductType.AI_TOOLS:
      return 'AI工具'
    case ProductType.OTHERS:
      return '其他'
    default:
      return productType
  }
}

// 初始化
onMounted(() => {
  fetchDeals()
})
</script>