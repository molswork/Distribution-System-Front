<template>
  <div class="agent-detail-container">
    <Card class="mb-4">
      <CardHeader>
        <CardTitle>代理基本信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="text-sm font-medium mb-1">微信名称</h4>
            <p>{{ agent.wechatName || '暂无数据' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">手机号码</h4>
            <p>{{ agent.phone || '暂无数据' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">代理类型</h4>
            <p>{{ agent.category || '暂无数据' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">代理等级</h4>
            <p>{{ agent.level || '暂无数据' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">添加日期</h4>
            <p>{{ agent.createdAt || '暂无数据' }}</p>
          </div>
          <div>
            <h4 class="text-sm font-medium mb-1">推荐人/推荐码</h4>
            <p>{{ agent.referrer || '暂无数据' }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-4">
      <CardHeader>
        <CardTitle>代理状态</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center">
            <Badge :variant="agent.isAdded ? 'default' : 'outline'" class="mr-2">
              {{ agent.isAdded ? '是' : '否' }}
            </Badge>
            <span>已添加</span>
          </div>
          <div class="flex items-center">
            <Badge :variant="agent.isPosting ? 'default' : 'outline'" class="mr-2">
              {{ agent.isPosting ? '是' : '否' }}
            </Badge>
            <span>发帖</span>
          </div>
          <div class="flex items-center">
            <Badge :variant="agent.isIntercepting ? 'default' : 'outline'" class="mr-2">
              {{ agent.isIntercepting ? '是' : '否' }}
            </Badge>
            <span>截流</span>
          </div>
          <div class="flex items-center">
            <Badge :variant="agent.isDraining ? 'default' : 'outline'" class="mr-2">
              {{ agent.isDraining ? '是' : '否' }}
            </Badge>
            <span>引流获客</span>
          </div>
          <div class="flex items-center">
            <Badge :variant="agent.isInGroup ? 'default' : 'outline'" class="mr-2">
              {{ agent.isInGroup ? '是' : '否' }}
            </Badge>
            <span>进群</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-4">
      <CardHeader>
        <CardTitle>业绩数据</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-muted/20 p-4 rounded-lg">
            <h3 class="font-medium text-sm">有效客资数</h3>
            <p class="text-2xl font-bold">{{ agent.stats?.validLeads || 0 }}</p>
          </div>
          <div class="bg-muted/20 p-4 rounded-lg">
            <h3 class="font-medium text-sm">成交金额</h3>
            <p class="text-2xl font-bold">¥{{ agent.stats?.dealAmount || 0 }}</p>
          </div>
          <div class="bg-muted/20 p-4 rounded-lg">
            <h3 class="font-medium text-sm">提成金额</h3>
            <p class="text-2xl font-bold">¥{{ agent.stats?.commissionAmount || 0 }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>备注信息</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{{ agent.remark || '暂无备注' }}</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AgentStats {
  validLeads: number
  dealAmount: number
  commissionAmount: number
}

interface Agent {
  id: string
  wechatName: string
  phone: string
  category: string
  level: string
  createdAt: string
  referrer: string
  isAdded: boolean
  isPosting: boolean
  isIntercepting: boolean
  isDraining: boolean
  isInGroup: boolean
  remark: string
  stats?: AgentStats
}

const route = useRoute()
const agent = ref<Agent>({
  id: '',
  wechatName: '',
  phone: '',
  category: '',
  level: '',
  createdAt: '',
  referrer: '',
  isAdded: false,
  isPosting: false,
  isIntercepting: false,
  isDraining: false,
  isInGroup: false,
  remark: '',
})

onMounted(async () => {
  // 这里应该从API获取代理详情数据
  // const id = route.params.id as string
  // const response = await getAgentDetail(id)
  // agent.value = response.data
  
  // 模拟数据
  agent.value = {
    id: route.params.id as string,
    wechatName: '张三',
    phone: '13800138000',
    category: 'A类执行力强',
    level: 'SV3伙伴',
    createdAt: '2023-06-15',
    referrer: '李四',
    isAdded: true,
    isPosting: true,
    isIntercepting: true,
    isDraining: true,
    isInGroup: true,
    remark: '表现良好，积极参与活动',
    stats: {
      validLeads: 25,
      dealAmount: 35000,
      commissionAmount: 2450
    }
  }
})
</script> 