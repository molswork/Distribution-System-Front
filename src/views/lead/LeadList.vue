<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">客资管理</h1>
      <Button @click="openCreateDialog">
        <PlusIcon class="h-4 w-4 mr-2" />
        添加客资
      </Button>
    </div>

    <!-- 过滤和搜索区域 -->
    <div class="bg-white p-4 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium mb-1 block">客资状态</label>
          <select 
            v-model="filters.status" 
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">全部状态</option>
            <option v-for="status in leadStatusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">来源渠道</label>
          <select 
            v-model="filters.source" 
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">全部渠道</option>
            <option v-for="source in leadSourceOptions" :key="source.value" :value="source.value">
              {{ source.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">获取策略</label>
          <select 
            v-model="filters.strategy" 
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">全部策略</option>
            <option v-for="strategy in leadStrategyOptions" :key="strategy.value" :value="strategy.value">
              {{ strategy.label }}
            </option>
          </select>
        </div>
      <div>
          <label class="text-sm font-medium mb-1 block">搜索客资</label>
          <div class="flex space-x-2">
            <Input 
              v-model="filters.keyword" 
              placeholder="搜索微信/电话/产品经理" 
              class="w-full" 
            />
            <Button variant="outline" @click="searchLeads">
              <SearchIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          :class="{ 'bg-primary/10': filters.property === LeadProperty.VALID }"
          @click="togglePropertyFilter(LeadProperty.VALID)"
        >
          <CheckIcon v-if="filters.property === LeadProperty.VALID" class="h-4 w-4 mr-1" />
          有效客资
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          :class="{ 'bg-primary/10': filters.property === LeadProperty.INVALID }"
          @click="togglePropertyFilter(LeadProperty.INVALID)"
        >
          <CheckIcon v-if="filters.property === LeadProperty.INVALID" class="h-4 w-4 mr-1" />
          无效客资
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          :class="{ 'bg-primary/10': filters.property === LeadProperty.FAILED }"
          @click="togglePropertyFilter(LeadProperty.FAILED)"
        >
          <CheckIcon v-if="filters.property === LeadProperty.FAILED" class="h-4 w-4 mr-1" />
          添加失败
        </Button>
        <Button size="sm" variant="outline" @click="resetFilters">
          <RefreshCcwIcon class="h-3 w-3 mr-1" />
          重置筛选
        </Button>
      </div>
    </div>

    <!-- 表格区域 -->
    <DataTable
      :columns="columns"
      :data="leads"
      :loading="loading"
      :pagination="true"
      :total-items="totalItems"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @page-change="handlePageChange"
      empty-text="暂无客资数据"
    >
      <template #toolbar>
        <Button variant="outline" size="sm" @click="exportData">
          <DownloadIcon class="h-4 w-4 mr-1" />
          导出数据
        </Button>
      </template>
      <template #actions>
        <Button 
          variant="destructive" 
          size="sm" 
          :disabled="selectedLeads.length === 0"
          @click="confirmBatchDelete"
        >
          <TrashIcon class="h-4 w-4 mr-1" />
          批量删除
        </Button>
      </template>
    </DataTable>

    <!-- 创建/编辑客资对话框 -->
    <Dialog :open="showLeadDialog" @update:open="showLeadDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editMode ? '编辑客资' : '添加客资' }}</DialogTitle>
          <DialogDescription>
            {{ editMode ? '更新客资信息' : '填写客资基本信息，创建新客资' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmitLead" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">联系方式</label>
              <Input v-model="leadForm.contactInfo" placeholder="微信号或手机号" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">获客渠道</label>
              <select 
                v-model="leadForm.source" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">请选择</option>
                <option v-for="source in leadSourceOptions" :key="source.value" :value="source.value">
                  {{ source.label }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">获客策略</label>
              <select 
                v-model="leadForm.strategy" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">请选择</option>
                <option v-for="strategy in leadStrategyOptions" :key="strategy.value" :value="strategy.value">
                  {{ strategy.label }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">客资属性</label>
              <select 
                v-model="leadForm.property" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">请选择</option>
                <option v-for="property in leadPropertyOptions" :key="property.value" :value="property.value">
                  {{ property.label }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">返佣金额</label>
              <Input v-model="leadForm.commissionAmount" type="number" min="0" step="0.01" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">产品经理</label>
              <Input v-model="leadForm.managerName" required />
              <Input v-model="leadForm.managerId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">代理名称</label>
              <Input v-model="leadForm.agentName" />
              <Input v-model="leadForm.agentId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">客资状态</label>
              <select 
                v-model="leadForm.status" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">请选择</option>
                <option v-for="status in leadStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium">获客帖子链接</label>
            <Input v-model="leadForm.postLink" placeholder="http://" />
          </div>
          
          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium">获客关键词</label>
            <Input v-model="leadForm.keywords" placeholder="多个关键词用逗号分隔" />
          </div>
          
          <!-- 成交信息，仅编辑模式显示 -->
          <div v-if="editMode" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">成交产品</label>
              <Input v-model="leadForm.product" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">成交金额</label>
              <Input v-model="leadForm.dealAmount" type="number" min="0" step="0.01" />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="showLeadDialog = false">取消</Button>
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
            {{ deleteMode === 'single' ? '确定要删除该客资吗？此操作不可撤销。' : `确定要删除选中的 ${selectedLeads.length} 个客资吗？此操作不可撤销。` }}
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
import { ref, onMounted } from 'vue'
import { 
  PlusIcon, CheckIcon, SearchIcon, TrashIcon, 
  PencilIcon, MoreHorizontalIcon, DownloadIcon, RefreshCcwIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTable from '@/components/business/DataTable.vue'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import type { ColumnDef } from '@tanstack/vue-table'
import { leadApi } from '@/api/lead'
import { LeadStatus, LeadSource, LeadStrategy, LeadProperty, type Lead } from '@/types/lead'

// 状态选项
const leadStatusOptions = [
  { value: LeadStatus.PENDING, label: '未添加' },
  { value: LeadStatus.CLOSED, label: '已成交' },
  { value: LeadStatus.UNRESPONSIVE, label: '未回复' },
  { value: LeadStatus.LOST, label: '已流失' },
  { value: LeadStatus.CONSIDERING, label: '考虑中' },
  { value: LeadStatus.FOLLOW_UP, label: '周内给答复' },
]

// 来源选项
const leadSourceOptions = [
  { value: LeadSource.XIAOHONGSHU, label: '小红书' },
  { value: LeadSource.DOUYIN, label: '抖音' },
  { value: LeadSource.OTHERS, label: '其他' },
]

// 策略选项
const leadStrategyOptions = [
  { value: LeadStrategy.NATURAL, label: '自然引流' },
  { value: LeadStrategy.COMMENT, label: '评论截流' },
]

// 属性选项
const leadPropertyOptions = [
  { value: LeadProperty.VALID, label: '有效客资' },
  { value: LeadProperty.INVALID, label: '无效客资' },
  { value: LeadProperty.FAILED, label: '添加失败' },
]

// 客资数据
const leads = ref<Lead[]>([])
const totalItems = ref(0)
const loading = ref(false)
const selectedLeads = ref<string[]>([])

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
})

// 筛选条件
const filters = ref({
  keyword: '',
  status: '',
  source: '',
  strategy: '',
  property: '',
})

// 表单相关
const showLeadDialog = ref(false)
const editMode = ref(false)
const currentLeadId = ref<string | null>(null)
const leadForm = ref({
  contactInfo: '',
  source: '',
  strategy: '',
  postLink: '',
  keywords: '',
  property: '',
  commissionAmount: 0,
  managerId: '',
  managerName: '',
  status: '',
  product: '',
  dealAmount: 0,
  agentId: '',
  agentName: '',
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
            :checked="selectedLeads.includes(row.id)" 
            @change="toggleSelection(row.id)"
            class="rounded border-gray-300"
          />
        `,
        setup() {
          const toggleSelection = (id) => {
            const index = selectedLeads.value.indexOf(id)
            if (index === -1) {
              selectedLeads.value.push(id)
            } else {
              selectedLeads.value.splice(index, 1)
            }
          }
          return { selectedLeads, toggleSelection, row }
        }
      }
    }
  },
  {
    accessorKey: 'contactInfo',
    header: '联系方式',
    cell: ({ row }) => {
      return {
        template: `<div>{{ row.contactInfo }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'source',
    header: '获客渠道',
    cell: ({ row }) => {
      return {
        template: `<div>{{ getSourceLabel(row.source) }}</div>`,
        setup() {
          const getSourceLabel = (source) => {
            if (source === LeadSource.XIAOHONGSHU) {
              return '小红书'
            } else if (source === LeadSource.DOUYIN) {
              return '抖音'
            } else if (source === LeadSource.OTHERS) {
              return '其他'
            }
            return source
          }
          return { row, getSourceLabel }
        }
      }
    }
  },
  {
    accessorKey: 'strategy',
    header: '获客策略',
    cell: ({ row }) => {
      return {
        template: `<div>{{ getStrategyLabel(row.strategy) }}</div>`,
        setup() {
          const getStrategyLabel = (strategy) => {
            if (strategy === LeadStrategy.NATURAL) {
              return '自然引流'
            } else if (strategy === LeadStrategy.COMMENT) {
              return '评论截流'
            }
            return strategy || '-'
          }
          return { row, getStrategyLabel }
        }
      }
    }
  },
  {
    accessorKey: 'property',
    header: '客资属性',
    cell: ({ row }) => {
      return {
        template: `
          <span :class="getBgColor(row.property)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
            {{ getLabel(row.property) }}
          </span>
        `,
        setup() {
          const getLabel = (property) => {
            if (property === LeadProperty.VALID) {
              return '有效客资'
            } else if (property === LeadProperty.INVALID) {
              return '无效客资'
            } else if (property === LeadProperty.FAILED) {
              return '添加失败'
            }
            return property
          }
          
          const getBgColor = (property) => {
            if (property === LeadProperty.VALID) {
              return 'bg-green-100 text-green-800'
            } else if (property === LeadProperty.INVALID) {
              return 'bg-red-100 text-red-800'
            } else if (property === LeadProperty.FAILED) {
              return 'bg-gray-100 text-gray-800'
            }
            return 'bg-gray-100 text-gray-800'
          }
          
          return { row, getLabel, getBgColor }
        }
      }
    }
  },
  {
    accessorKey: 'commissionAmount',
    header: '返佣金额',
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
            if (status === LeadStatus.PENDING) {
              return '未添加'
            } else if (status === LeadStatus.CLOSED) {
              return '已成交'
            } else if (status === LeadStatus.UNRESPONSIVE) {
              return '未回复'
            } else if (status === LeadStatus.LOST) {
              return '已流失'
            } else if (status === LeadStatus.CONSIDERING) {
              return '考虑中'
            } else if (status === LeadStatus.FOLLOW_UP) {
              return '周内给答复'
            }
            return '未知'
          }
          
          const getBgColor = (status) => {
            if (status === LeadStatus.PENDING) {
              return 'bg-yellow-100 text-yellow-800'
            } else if (status === LeadStatus.CLOSED) {
              return 'bg-green-100 text-green-800'
            } else if (status === LeadStatus.UNRESPONSIVE) {
              return 'bg-gray-100 text-gray-800'
            } else if (status === LeadStatus.LOST) {
              return 'bg-red-100 text-red-800'
            } else if (status === LeadStatus.CONSIDERING) {
              return 'bg-blue-100 text-blue-800'
            } else if (status === LeadStatus.FOLLOW_UP) {
              return 'bg-purple-100 text-purple-800'
            }
            return 'bg-gray-100 text-gray-800'
          }
          
          return { row, getLabel, getBgColor }
        }
      }
    }
  },
  {
    accessorKey: 'dealAmount',
    header: '成交金额',
    cell: ({ row }) => {
      return {
        template: `<div>{{ row.dealAmount ? '¥' + row.dealAmount : '-' }}</div>`,
        setup() {
          return { row }
        }
      }
    }
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => {
      return {
        template: `<div>{{ formatDate(row.createdAt) }}</div>`,
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
            <router-link :to="'/lead/' + row.id">
              <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </router-link>
          </div>
        `,
        setup() {
          const onEdit = (id) => {
            editLead(id)
          }
          
          const onDelete = (id) => {
            deleteLead(id)
          }
          
          return { row, onEdit, onDelete, PencilIcon, TrashIcon, MoreHorizontalIcon, Button }
        }
      }
    }
  }
]

// 获取客资列表数据
const fetchLeads = async () => {
  loading.value = true
  try {
    const { page, pageSize } = pagination.value
    
    const queryParams = {
      page,
      pageSize,
      keyword: filters.value.keyword,
      status: filters.value.status || undefined,
      source: filters.value.source || undefined,
      strategy: filters.value.strategy || undefined,
      property: filters.value.property || undefined,
    }
    
    const response = await leadApi.getLeadList(queryParams)
    leads.value = response.data
    totalItems.value = response.total
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

// 切换客资属性筛选条件
const togglePropertyFilter = (property: string) => {
  if (filters.value.property === property) {
    filters.value.property = ''
  } else {
    filters.value.property = property
  }
  searchLeads()
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    keyword: '',
    status: '',
    source: '',
    strategy: '',
    property: '',
  }
  searchLeads()
}

// 搜索客资
const searchLeads = () => {
  pagination.value.page = 1
  fetchLeads()
}

// 处理分页变更
const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchLeads()
}

// 打开创建客资对话框
const openCreateDialog = () => {
  editMode.value = false
  resetLeadForm()
  showLeadDialog.value = true
}

// 编辑客资
const editLead = async (leadId: string) => {
  try {
    const lead = await leadApi.getLead(leadId)
    leadForm.value = {
      contactInfo: lead.contactInfo,
      source: lead.source,
      strategy: lead.strategy || '',
      postLink: lead.postLink || '',
      keywords: lead.keywords || '',
      property: lead.property,
      commissionAmount: lead.commissionAmount,
      managerId: lead.managerId,
      managerName: lead.managerName,
      status: lead.status,
      product: lead.product || '',
      dealAmount: lead.dealAmount || 0,
      agentId: lead.agentId || '',
      agentName: lead.agentName || '',
    }
    currentLeadId.value = leadId
    editMode.value = true
    showLeadDialog.value = true
  } catch (error) {
    console.error('Failed to get lead details:', error)
    // TODO: 显示错误提示
  }
}

// 重置表单
const resetLeadForm = () => {
  leadForm.value = {
    contactInfo: '',
    source: '',
    strategy: '',
    postLink: '',
    keywords: '',
    property: '',
    commissionAmount: 0,
    managerId: '',
    managerName: '',
    status: LeadStatus.PENDING,
    product: '',
    dealAmount: 0,
    agentId: '',
    agentName: '',
  }
  currentLeadId.value = null
}

// 提交客资表单
const handleSubmitLead = async () => {
  submitting.value = true
  try {
    if (editMode.value && currentLeadId.value) {
      await leadApi.updateLead(currentLeadId.value, leadForm.value)
    } else {
      await leadApi.createLead(leadForm.value as any)
    }
    showLeadDialog.value = false
    fetchLeads()
  } catch (error) {
    console.error('Failed to save lead:', error)
    // TODO: 显示错误提示
  } finally {
    submitting.value = false
  }
}

// 删除单个客资
const deleteLead = (leadId: string) => {
  currentLeadId.value = leadId
  deleteMode.value = 'single'
  showDeleteDialog.value = true
}

// 批量删除客资
const confirmBatchDelete = () => {
  deleteMode.value = 'batch'
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  deleting.value = true
  try {
    if (deleteMode.value === 'single' && currentLeadId.value) {
      await leadApi.deleteLead(currentLeadId.value)
    } else if (deleteMode.value === 'batch') {
      await leadApi.batchDeleteLeads(selectedLeads.value)
      selectedLeads.value = []
    }
    showDeleteDialog.value = false
    fetchLeads()
  } catch (error) {
    console.error('Failed to delete lead(s):', error)
    // TODO: 显示错误提示
  } finally {
    deleting.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    const { keyword, status, source, strategy, property } = filters.value
    const blob = await leadApi.exportLeads({ keyword, status, source, strategy, property })
    
    // 创建临时下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    
    // 释放URL对象
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('Failed to export leads:', error)
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

// 初始化
onMounted(() => {
  fetchLeads()
})
</script>