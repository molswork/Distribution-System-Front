<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button variant="outline" @click="goBack">
          <ChevronLeftIcon class="h-4 w-4 mr-1" />
          返回
        </Button>
        <h1 class="text-2xl font-semibold">客资详情</h1>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="refreshData">
          <RefreshCcwIcon class="h-4 w-4 mr-1" />
          刷新
        </Button>
        <Button @click="editLead">
          <PencilIcon class="h-4 w-4 mr-1" />
          编辑
        </Button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧客资基本信息 -->
      <div class="space-y-6">
        <!-- 个人信息卡片 -->
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex flex-col items-center text-center">
              <div class="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500">
                {{ lead?.contactInfo?.charAt(0) || '?' }}
              </div>
              <h2 class="mt-4 text-xl font-semibold">{{ lead?.contactInfo || '未知' }}</h2>
              <div class="mt-2 flex space-x-2">
                <span 
                  :class="`px-2 py-1 text-xs rounded-full ${getStatusClass(lead?.status)}`"
                >
                  {{ getStatusLabel(lead?.status) }}
                </span>
                <span 
                  :class="`px-2 py-1 text-xs rounded-full ${getPropertyClass(lead?.property)}`"
                >
                  {{ getPropertyLabel(lead?.property) }}
                </span>
              </div>
            </div>

            <Separator />

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">获客渠道</span>
                <span class="text-sm font-medium">{{ getSourceLabel(lead?.source) || '未设置' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">获客策略</span>
                <span class="text-sm font-medium">{{ getStrategyLabel(lead?.strategy) || '未设置' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">返佣金额</span>
                <span class="text-sm font-medium">¥{{ lead?.commissionAmount || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">产品经理</span>
                <span class="text-sm font-medium">{{ lead?.managerName || '未分配' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">关联代理</span>
                <span class="text-sm font-medium">{{ lead?.agentName || '无' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">创建时间</span>
                <span class="text-sm font-medium">{{ formatDate(lead?.createdAt) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 成交信息 -->
        <Card>
          <CardHeader>
            <CardTitle>成交信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="lead?.product || lead?.dealAmount" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">成交产品</span>
                <span class="text-sm font-medium">{{ lead?.product || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">成交金额</span>
                <span class="text-sm font-medium font-bold text-green-600">¥{{ lead?.dealAmount || 0 }}</span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
              暂无成交记录
            </div>
          </CardContent>
        </Card>

        <!-- 其他信息 -->
        <Card>
          <CardHeader>
            <CardTitle>其他信息</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">帖子链接</span>
                <a 
                  v-if="lead?.postLink" 
                  :href="lead.postLink" 
                  target="_blank" 
                  class="text-sm font-medium text-blue-600 hover:underline truncate max-w-[200px]"
                >
                  查看链接
                </a>
                <span v-else class="text-sm font-medium">-</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">关键词</span>
                <span class="text-sm font-medium">{{ lead?.keywords || '-' }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 中间跟进记录 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 跟进记录 -->
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>跟进记录</CardTitle>
              <CardDescription>客资跟进历史</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="followUpLoading" class="flex justify-center py-4">
              <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <div v-else-if="followUpRecords.length === 0" class="text-center py-8 text-gray-500">
              暂无跟进记录
            </div>
            <div v-else class="space-y-4">
              <div v-for="(record, index) in followUpRecords" :key="index" class="flex space-x-4">
                <div class="min-w-[2px] bg-gray-200 flex flex-col items-center">
                  <div class="h-4 w-4 rounded-full bg-primary mt-1"></div>
                  <div class="flex-1 w-[2px] bg-gray-200"></div>
                </div>
                <div class="flex-1 pb-6">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-medium">{{ record.createdBy }}</div>
                    <div class="text-xs text-gray-500">{{ formatDateTime(record.createdAt) }}</div>
                  </div>
                  <div class="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                    {{ record.content }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 添加跟进记录 -->
        <Card>
          <CardHeader>
            <CardTitle>添加跟进记录</CardTitle>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="submitFollowUp" class="space-y-4">
              <div class="space-y-2">
                <Label for="follow-up-content">跟进内容</Label>
                <textarea 
                  id="follow-up-content"
                  v-model="followUpContent" 
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
                  placeholder="请输入本次跟进内容..."
                  required
                ></textarea>
              </div>
              <div>
                <Button 
                  type="submit" 
                  class="w-full" 
                  :disabled="!followUpContent.trim()" 
                  :loading="submitting"
                >
                  提交跟进记录
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- 修改状态 -->
        <Card>
          <CardHeader>
            <CardTitle>更新客资状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-2">
              <Button 
                v-for="status in leadStatusOptions" 
                :key="status.value" 
                variant="outline"
                :class="{ 'bg-primary/10': lead?.status === status.value }"
                @click="updateLeadStatus(status.value)"
              >
                {{ status.label }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 编辑客资对话框 -->
    <Dialog :open="showEditDialog" @update:open="showEditDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>编辑客资</DialogTitle>
          <DialogDescription>
            更新客资信息
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmitEdit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">联系方式</label>
              <Input v-model="editForm.contactInfo" placeholder="微信号或手机号" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">获客渠道</label>
              <select 
                v-model="editForm.source" 
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
                v-model="editForm.strategy" 
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
                v-model="editForm.property" 
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
              <Input v-model="editForm.commissionAmount" type="number" min="0" step="0.01" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">产品经理</label>
              <Input v-model="editForm.managerName" required />
              <Input v-model="editForm.managerId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">代理名称</label>
              <Input v-model="editForm.agentName" />
              <Input v-model="editForm.agentId" type="hidden" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">客资状态</label>
              <select 
                v-model="editForm.status" 
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">请选择</option>
                <option v-for="status in leadStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">获客帖子链接</label>
            <Input v-model="editForm.postLink" placeholder="http://" />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">获客关键词</label>
            <Input v-model="editForm.keywords" placeholder="多个关键词用逗号分隔" />
          </div>
          
          <!-- 成交信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">成交产品</label>
              <Input v-model="editForm.product" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">成交金额</label>
              <Input v-model="editForm.dealAmount" type="number" min="0" step="0.01" />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditDialog = false">取消</Button>
            <Button type="submit" :loading="submitting">更新</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeftIcon, PencilIcon, RefreshCcwIcon
} from 'lucide-vue-next'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { leadApi } from '@/api/lead'
import { LeadStatus, LeadSource, LeadStrategy, LeadProperty, type Lead, type FollowUpRecord } from '@/types/lead'

const route = useRoute()
const router = useRouter()
const leadId = ref<string>('')
const lead = ref<Lead | null>(null)
const loading = ref(true)
const followUpRecords = ref<FollowUpRecord[]>([])
const followUpLoading = ref(false)
const followUpContent = ref('')
const submitting = ref(false)
const showEditDialog = ref(false)

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

// 编辑表单
const editForm = ref({
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

// 获取客资详情
const fetchLeadData = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    leadId.value = id
    lead.value = await leadApi.getLead(id)
    
    // 获取跟进记录
    fetchFollowUpRecords()
  } catch (error) {
    console.error('Failed to fetch lead details:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

// 获取跟进记录
const fetchFollowUpRecords = async () => {
  followUpLoading.value = true
  try {
    if (leadId.value) {
      followUpRecords.value = await leadApi.getFollowUpRecords(leadId.value)
    }
  } catch (error) {
    console.error('Failed to fetch follow-up records:', error)
  } finally {
    followUpLoading.value = false
  }
}

// 提交跟进记录
const submitFollowUp = async () => {
  if (!followUpContent.value.trim()) return
  
  submitting.value = true
  try {
    await leadApi.addFollowUpRecord(leadId.value, followUpContent.value)
    followUpContent.value = ''
    fetchFollowUpRecords()
  } catch (error) {
    console.error('Failed to add follow-up record:', error)
    // TODO: 显示错误提示
  } finally {
    submitting.value = false
  }
}

// 返回列表页
const goBack = () => {
  router.push('/lead/list')
}

// 编辑客资
const editLead = () => {
  if (!lead.value) return
  
  editForm.value = {
    contactInfo: lead.value.contactInfo,
    source: lead.value.source,
    strategy: lead.value.strategy || '',
    postLink: lead.value.postLink || '',
    keywords: lead.value.keywords || '',
    property: lead.value.property,
    commissionAmount: lead.value.commissionAmount,
    managerId: lead.value.managerId,
    managerName: lead.value.managerName,
    status: lead.value.status,
    product: lead.value.product || '',
    dealAmount: lead.value.dealAmount || 0,
    agentId: lead.value.agentId || '',
    agentName: lead.value.agentName || '',
  }
  
  showEditDialog.value = true
}

// 提交编辑表单
const handleSubmitEdit = async () => {
  submitting.value = true
  try {
    await leadApi.updateLead(leadId.value, editForm.value)
    showEditDialog.value = false
    fetchLeadData()
  } catch (error) {
    console.error('Failed to update lead:', error)
    // TODO: 显示错误提示
  } finally {
    submitting.value = false
  }
}

// 更新客资状态
const updateLeadStatus = async (status: string) => {
  try {
    await leadApi.updateLeadStatus(leadId.value, status)
    fetchLeadData()
  } catch (error) {
    console.error('Failed to update lead status:', error)
    // TODO: 显示错误提示
  }
}

// 刷新数据
const refreshData = () => {
  fetchLeadData()
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (e) {
    return dateString
  }
}

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  } catch (e) {
    return dateString
  }
}

// 获取状态样式
const getStatusClass = (status?: string) => {
  switch (status) {
    case LeadStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800'
    case LeadStatus.CLOSED:
      return 'bg-green-100 text-green-800'
    case LeadStatus.UNRESPONSIVE:
      return 'bg-gray-100 text-gray-800'
    case LeadStatus.LOST:
      return 'bg-red-100 text-red-800'
    case LeadStatus.CONSIDERING:
      return 'bg-blue-100 text-blue-800'
    case LeadStatus.FOLLOW_UP:
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 获取状态文本
const getStatusLabel = (status?: string) => {
  switch (status) {
    case LeadStatus.PENDING:
      return '未添加'
    case LeadStatus.CLOSED:
      return '已成交'
    case LeadStatus.UNRESPONSIVE:
      return '未回复'
    case LeadStatus.LOST:
      return '已流失'
    case LeadStatus.CONSIDERING:
      return '考虑中'
    case LeadStatus.FOLLOW_UP:
      return '周内给答复'
    default:
      return '未知'
  }
}

// 获取属性样式
const getPropertyClass = (property?: string) => {
  switch (property) {
    case LeadProperty.VALID:
      return 'bg-green-100 text-green-800'
    case LeadProperty.INVALID:
      return 'bg-red-100 text-red-800'
    case LeadProperty.FAILED:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 获取属性文本
const getPropertyLabel = (property?: string) => {
  switch (property) {
    case LeadProperty.VALID:
      return '有效客资'
    case LeadProperty.INVALID:
      return '无效客资'
    case LeadProperty.FAILED:
      return '添加失败'
    default:
      return '未知'
  }
}

// 获取渠道文本
const getSourceLabel = (source?: string) => {
  switch (source) {
    case LeadSource.XIAOHONGSHU:
      return '小红书'
    case LeadSource.DOUYIN:
      return '抖音'
    case LeadSource.OTHERS:
      return '其他'
    default:
      return source
  }
}

// 获取策略文本
const getStrategyLabel = (strategy?: string) => {
  switch (strategy) {
    case LeadStrategy.NATURAL:
      return '自然引流'
    case LeadStrategy.COMMENT:
      return '评论截流'
    default:
      return strategy
  }
}

onMounted(() => {
  fetchLeadData()
})
</script> 