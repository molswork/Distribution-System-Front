<!-- 仪表盘页面 -->
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">仪表盘</h1>

    <!-- 关键指标总览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div v-for="(metric, index) in keyMetrics" :key="index" 
           class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <h3 class="text-sm text-gray-500 font-medium">{{ metric.title }}</h3>
          <div :class="`p-2 rounded-full ${metric.trend === 'up' ? 'bg-green-100' : metric.trend === 'down' ? 'bg-red-100' : 'bg-blue-100'}`">
            <component :is="metric.icon" 
                       class="h-4 w-4"
                       :class="metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'" />
          </div>
        </div>
        <div class="mt-2">
          <p class="text-2xl font-semibold">{{ metric.value }}</p>
          <div class="flex items-center mt-1 text-sm">
            <component :is="metric.trend === 'up' ? 'TrendingUpIcon' : metric.trend === 'down' ? 'TrendingDownIcon' : 'MinusIcon'" 
                       class="h-3 w-3 mr-1"
                       :class="metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'" />
            <span :class="metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-blue-600'">
              {{ metric.trendValue }}%
            </span>
            <span class="text-gray-400 ml-1">与昨日相比</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>待处理事项</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                  <MegaphoneIcon class="h-5 w-5" />
                </div>
                <div>
                  <h4 class="font-medium">推广审核</h4>
                  <p class="text-sm text-gray-500">{{ dashboardData.pending?.promotionAuditCount || 0 }} 条待审核</p>
                </div>
              </div>
              <Button variant="outline" size="sm">查看</Button>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <UsersIcon class="h-5 w-5" />
                </div>
                <div>
                  <h4 class="font-medium">客资分配</h4>
                  <p class="text-sm text-gray-500">{{ dashboardData.pending?.leadAssignCount || 0 }} 条待分配</p>
                </div>
              </div>
              <Button variant="outline" size="sm">查看</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>今日数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-sm text-gray-500">新增客资</p>
              <p class="text-2xl font-bold">{{ dashboardData.today?.leadCount || 0 }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">新增成交</p>
              <p class="text-2xl font-bold">{{ dashboardData.today?.dealCount || 0 }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">成交金额</p>
              <p class="text-2xl font-bold text-green-600">¥{{ dashboardData.today?.salesAmount?.toLocaleString() || 0 }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-gray-500">转化率</p>
              <p class="text-2xl font-bold">{{ dashboardData.today?.leadCount ? ((dashboardData.today.dealCount / dashboardData.today.leadCount) * 100).toFixed(1) : 0 }}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 数据图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 代理数量趋势图 -->
      <Card>
        <CardHeader>
          <CardTitle>代理数量趋势</CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="changeAgentTrendPeriod('week')" :class="{ 'bg-primary/10': agentTrendPeriod === 'week' }">本周</Button>
            <Button variant="outline" size="sm" @click="changeAgentTrendPeriod('month')" :class="{ 'bg-primary/10': agentTrendPeriod === 'month' }">本月</Button>
            <Button variant="outline" size="sm" @click="changeAgentTrendPeriod('year')" :class="{ 'bg-primary/10': agentTrendPeriod === 'year' }">全年</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <canvas ref="agentTrendChart"></canvas>
          </div>
        </CardContent>
      </Card>

      <!-- 客资获取渠道分布 -->
      <Card>
        <CardHeader>
          <CardTitle>客资获取渠道分布</CardTitle>
          <Button variant="outline" size="sm">查看详情</Button>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <canvas ref="leadSourceChart"></canvas>
          </div>
        </CardContent>
      </Card>

      <!-- 成交金额统计图 -->
      <Card>
        <CardHeader>
          <CardTitle>成交金额统计</CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="changeDealPeriod('week')" :class="{ 'bg-primary/10': dealPeriod === 'week' }">本周</Button>
            <Button variant="outline" size="sm" @click="changeDealPeriod('month')" :class="{ 'bg-primary/10': dealPeriod === 'month' }">本月</Button>
            <Button variant="outline" size="sm" @click="changeDealPeriod('year')" :class="{ 'bg-primary/10': dealPeriod === 'year' }">全年</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <canvas ref="dealAmountChart"></canvas>
          </div>
        </CardContent>
      </Card>

      <!-- 代理等级分布 -->
      <Card>
        <CardHeader>
          <CardTitle>代理等级分布</CardTitle>
          <Button variant="outline" size="sm">查看详情</Button>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <canvas ref="agentLevelChart"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { 
  TrendingUpIcon, TrendingDownIcon, MinusIcon, UsersIcon, 
  TargetIcon, DollarSignIcon, PercentIcon, BarChartIcon, MegaphoneIcon 
} from 'lucide-vue-next'
import request from '@/utils/request'
import Chart from 'chart.js/auto'

// 图表引用
const agentTrendChart = ref<HTMLCanvasElement | null>(null)
const leadSourceChart = ref<HTMLCanvasElement | null>(null)
const dealAmountChart = ref<HTMLCanvasElement | null>(null)
const agentLevelChart = ref<HTMLCanvasElement | null>(null)

// 图表实例
let agentTrendChartInstance: Chart | null = null
let leadSourceChartInstance: Chart | null = null
let dealAmountChartInstance: Chart | null = null
let agentLevelChartInstance: Chart | null = null

// 图表周期
const agentTrendPeriod = ref('month')
const dealPeriod = ref('month')

// 仪表盘数据
const dashboardData = ref<any>({
  today: {
    leadCount: 0,
    dealCount: 0,
    salesAmount: 0,
  },
  thisWeek: {
    leadCount: 0,
    dealCount: 0,
    salesAmount: 0,
  },
  thisMonth: {
    leadCount: 0,
    dealCount: 0,
    salesAmount: 0,
  },
  pending: {
    promotionAuditCount: 0,
    leadAssignCount: 0,
  }
})

// 图表数据
const chartData = ref<any>({
  agentTrend: [],
  leadSourceDistribution: [],
  dealAmountStats: [],
  agentLevelDistribution: [],
  leadStatusDistribution: []
})

// 关键指标数据
const keyMetrics = ref([
  { 
    title: '总有效代理量', 
    value: '33',
    icon: UsersIcon,
    trend: 'up',
    trendValue: 5.2
  },
  { 
    title: '当日有效代理数量', 
    value: '35',
    icon: UsersIcon,
    trend: 'up',
    trendValue: 12.5
  },
  { 
    title: '当日代理客资数量', 
    value: '7',
    icon: TargetIcon,
    trend: 'down',
    trendValue: 3.8
  },
  { 
    title: '有效客资数量', 
    value: '2',
    icon: TargetIcon,
    trend: 'same',
    trendValue: 0
  },
  { 
    title: '客资返现费用', 
    value: '¥12',
    icon: DollarSignIcon,
    trend: 'down',
    trendValue: 15.4
  },
])

// 获取仪表盘统计数据
const fetchDashboardStats = async () => {
  try {
    const response = await request.get('/dashboard/stats')
    if (response.data && response.data.code === 200) {
      dashboardData.value = response.data.data
    }
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error)
  }
}

// 获取图表数据
const fetchChartData = async () => {
  try {
    const response = await request.get('/dashboard/charts')
    if (response.data && response.data.code === 200) {
      chartData.value = response.data.data
      renderCharts()
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
  }
}

// 渲染所有图表
const renderCharts = () => {
  renderAgentTrendChart()
  renderLeadSourceChart()
  renderDealAmountChart()
  renderAgentLevelChart()
}

// 渲染代理数量趋势图
const renderAgentTrendChart = () => {
  if (!agentTrendChart.value) return
  
  // 销毁旧图表
  if (agentTrendChartInstance) {
    agentTrendChartInstance.destroy()
  }
  
  const ctx = agentTrendChart.value.getContext('2d')
  if (!ctx || !chartData.value.agentTrend) return
  
  const data = chartData.value.agentTrend
  
  agentTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((item: any) => item.date),
      datasets: [
        {
          label: '代理总数',
          data: data.map((item: any) => item.count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: '活跃代理',
          data: data.map((item: any) => item.activeCount),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  })
}

// 渲染客资来源分布图
const renderLeadSourceChart = () => {
  if (!leadSourceChart.value) return
  
  // 销毁旧图表
  if (leadSourceChartInstance) {
    leadSourceChartInstance.destroy()
  }
  
  const ctx = leadSourceChart.value.getContext('2d')
  if (!ctx || !chartData.value.leadSourceDistribution) return
  
  const data = chartData.value.leadSourceDistribution
  
  leadSourceChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map((item: any) => item.source),
      datasets: [
        {
          data: data.map((item: any) => item.value),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
      },
    }
  })
}

// 渲染成交金额统计图
const renderDealAmountChart = () => {
  if (!dealAmountChart.value) return
  
  // 销毁旧图表
  if (dealAmountChartInstance) {
    dealAmountChartInstance.destroy()
  }
  
  const ctx = dealAmountChart.value.getContext('2d')
  if (!ctx || !chartData.value.dealAmountStats) return
  
  const data = chartData.value.dealAmountStats
  
  dealAmountChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((item: any) => item.month),
      datasets: [
        {
          label: '成交金额',
          data: data.map((item: any) => item.amount),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '¥' + (Number(value) / 10000).toFixed(1) + 'w'
            }
          }
        }
      }
    }
  })
}

// 渲染代理等级分布图
const renderAgentLevelChart = () => {
  if (!agentLevelChart.value) return
  
  // 销毁旧图表
  if (agentLevelChartInstance) {
    agentLevelChartInstance.destroy()
  }
  
  const ctx = agentLevelChart.value.getContext('2d')
  if (!ctx || !chartData.value.agentLevelDistribution) return
  
  const data = chartData.value.agentLevelDistribution
  
  agentLevelChartInstance = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: data.map((item: any) => item.level),
      datasets: [
        {
          data: data.map((item: any) => item.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(245, 158, 11, 0.7)',
          ],
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
      },
    }
  })
}

// 切换代理趋势图周期
const changeAgentTrendPeriod = (period: string) => {
  agentTrendPeriod.value = period
  // 这里可以重新获取数据并更新图表
  renderAgentTrendChart()
}

// 切换成交金额图周期
const changeDealPeriod = (period: string) => {
  dealPeriod.value = period
  // 这里可以重新获取数据并更新图表
  renderDealAmountChart()
}

// 生命周期钩子
onMounted(() => {
  fetchDashboardStats()
  fetchChartData()
})

// 清理图表实例
onUnmounted(() => {
  if (agentTrendChartInstance) agentTrendChartInstance.destroy()
  if (leadSourceChartInstance) leadSourceChartInstance.destroy()
  if (dealAmountChartInstance) dealAmountChartInstance.destroy()
  if (agentLevelChartInstance) agentLevelChartInstance.destroy()
})
</script>