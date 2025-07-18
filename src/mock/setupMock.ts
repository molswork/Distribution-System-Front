import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import request from '@/utils/request'

// 生成随机日期
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// 生成随机数字
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 从数组中随机选择一个元素
const randomPick = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

export function setupMockApi() {
  // 创建一个MockAdapter实例，使用项目中的request实例而不是全局axios实例
  const mock = new MockAdapter(request, { delayResponse: 500 })

  // 模拟登录API
  mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data)
    
    // 简单的用户名密码验证
    if (username === 'admin' && password === 'admin123') {
      return [
        200, 
        {
          code: 200,
          success: true,
          data: {
            token: 'mock-token-admin',
            user: {
              id: 1,
              username: 'admin',
              nickname: '系统管理员',
              email: 'admin@example.com',
              role: 'super_admin',
              status: 'active',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            permissions: ['*'],
          }
        }
      ]
    } else if (username === 'sales' && password === 'sales123') {
      return [
        200, 
        {
          code: 200,
          success: true,
          data: {
            token: 'mock-token-sales',
            user: {
              id: 2,
              username: 'sales',
              nickname: '销售人员',
              email: 'sales@example.com',
              role: 'sales',
              status: 'active',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            permissions: ['dashboard', 'lead', 'deal'],
          }
        }
      ]
    }
    
    return [
      401, 
      {
        code: 401,
        success: false,
        message: '用户名或密码错误',
        data: null
      }
    ]
  })

  // 模拟获取用户信息API
  mock.onGet('/user/profile').reply((config) => {
    // 从请求头获取token
    const token = config.headers?.Authorization?.replace('Bearer ', '')
    
    if (token === 'mock-token-admin') {
      return [
        200,
        {
          code: 200,
          success: true,
          data: {
            user: {
              id: 1,
              username: 'admin',
              nickname: '系统管理员',
              email: 'admin@example.com',
              role: 'super_admin',
              status: 'active',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            permissions: ['*'],
          }
        }
      ]
    } else if (token === 'mock-token-sales') {
      return [
        200,
        {
          code: 200,
          success: true,
          data: {
            user: {
              id: 2,
              username: 'sales',
              nickname: '销售人员',
              email: 'sales@example.com',
              role: 'sales',
              status: 'active',
              avatar: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            permissions: ['dashboard', 'lead', 'deal'],
          }
        }
      ]
    }
    
    return [
      401,
      {
        code: 401,
        success: false,
        message: '身份验证失败',
        data: null
      }
    ]
  })

  // 模拟用户列表API
  mock.onGet('/users').reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1])
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('page_size') || '10')
    const keyword = params.get('keyword') || ''
    const role = params.get('role')
    const status = params.get('status')
    
    let users = Array.from({ length: 35 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      nickname: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `1381234${String(i).padStart(4, '0')}`,
      role: i === 0 ? 'super_admin' : i < 3 ? 'director' : i < 8 ? 'leader' : i < 20 ? 'sales' : 'agent',
      status: i % 5 === 0 ? 'inactive' : i % 10 === 0 ? 'pending' : i % 15 === 0 ? 'banned' : 'active',
      level: i < 5 ? 'S' : i < 15 ? 'A' : i < 25 ? 'B' : 'C',
      commission_rate: i < 5 ? 10 : i < 15 ? 8 : i < 25 ? 5 : 3,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
    }))
    
    // 应用筛选条件
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      users = users.filter(user => 
        user.username.toLowerCase().includes(lowerKeyword) || 
        user.nickname.toLowerCase().includes(lowerKeyword) || 
        user.email.toLowerCase().includes(lowerKeyword) || 
        user.phone.includes(keyword)
      )
    }
    
    if (role && role !== 'all') {
      users = users.filter(user => user.role === role)
    }
    
    if (status && status !== 'all') {
      users = users.filter(user => user.status === status)
    }
    
    // 分页
    const total = users.length
    const startIndex = (page - 1) * pageSize
    const items = users.slice(startIndex, startIndex + pageSize)
    
    return [
      200, 
      {
        code: 200,
        success: true,
        data: {
          items,
          total,
          page,
          page_size: pageSize
        }
      }
    ]
  })

  // 模拟仪表盘数据API
  mock.onGet('/dashboard/stats').reply(200, {
    code: 200,
    success: true,
    data: {
      today: {
        leadCount: 85,
        dealCount: 12,
        salesAmount: 26500,
      },
      thisWeek: {
        leadCount: 420,
        dealCount: 65,
        salesAmount: 154200,
      },
      thisMonth: {
        leadCount: 1280,
        dealCount: 187,
        salesAmount: 458600,
      },
      pending: {
        promotionAuditCount: 27,
        leadAssignCount: 35,
      }
    }
  })

  // 模拟仪表盘图表数据
  mock.onGet('/dashboard/charts').reply(200, {
    code: 200,
    success: true,
    data: {
      // 代理数量趋势（最近30天）
      agentTrend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - 29 + i)
        return {
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          count: 100 + Math.floor(Math.random() * 50) + (i * 2),
          activeCount: 60 + Math.floor(Math.random() * 30) + i
        }
      }),
      
      // 客资来源分布
      leadSourceDistribution: [
        { source: '小红书', value: 45 },
        { source: '抖音', value: 30 },
        { source: '微信', value: 15 },
        { source: '其他', value: 10 }
      ],
      
      // 成交金额统计（最近12个月）
      dealAmountStats: Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - 11 + i)
        return {
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          amount: 200000 + Math.floor(Math.random() * 100000) + (i * 15000)
        }
      }),
      
      // 代理等级分布
      agentLevelDistribution: [
        { level: 'SV1', count: 120 },
        { level: 'SV2', count: 85 },
        { level: 'SV3', count: 64 },
        { level: 'SV4', count: 45 },
        { level: 'SV5', count: 28 },
        { level: 'SV6', count: 12 }
      ],
      
      // 客资状态分布
      leadStatusDistribution: [
        { status: '未添加', count: 320 },
        { status: '已成交', count: 180 },
        { status: '未回复', count: 240 },
        { status: '已流失', count: 120 },
        { status: '考虑中', count: 160 },
        { status: '周内给答复', count: 95 }
      ]
    }
  })

  // 模拟代理列表API
  mock.onGet(/\/agents(\?.*)?$/).reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1] || '')
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '10')
    const keyword = params.get('keyword') || ''
    const status = params.get('status') || ''
    const category = params.get('category') || ''
    const level = params.get('level') || ''
    const isAdded = params.get('isAdded') === 'true'
    const isPosting = params.get('isPosting') === 'true'
    const isIntercept = params.get('isIntercept') === 'true'
    const isAttracting = params.get('isAttracting') === 'true'
    const isInGroup = params.get('isInGroup') === 'true'
    
    // 生成代理数据
    const agentNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
    const agentStatuses = ['active', 'inactive', 'pending', 'blocked']
    const agentCategories = ['A', 'B', 'C', 'D']
    const agentLevels = ['SV1', 'SV2', 'SV3', 'SV4', 'SV5', 'SV6']
    
    let agents = Array.from({ length: 100 }, (_, i) => {
      const name = agentNames[i % agentNames.length] + (Math.floor(i / agentNames.length) || '')
      const wechatName = `wx_${name}`
      const phone = `1380000${String(i + 1).padStart(4, '0')}`
      const statusIndex = i % agentStatuses.length
      const categoryIndex = i % agentCategories.length
      const levelIndex = i % agentLevels.length
      
      return {
        id: `agent-${i + 1}`,
        name,
        wechatName,
        phone,
        redBookAccount: `redbook_${name}`,
        referrer: i % 5 === 0 ? agentNames[Math.floor(Math.random() * agentNames.length)] : '',
        status: agentStatuses[statusIndex],
        category: agentCategories[categoryIndex],
        level: agentLevels[levelIndex],
        isAdded: i % 3 === 0,
        isPosting: i % 4 === 0,
        isIntercept: i % 5 === 0,
        isAttracting: i % 6 === 0,
        isInGroup: i % 7 === 0,
        notes: i % 10 === 0 ? '这是一个表现良好的代理' : '',
        addedDate: randomDate(new Date(2023, 0, 1), new Date()),
        createdAt: randomDate(new Date(2023, 0, 1), new Date())
      }
    })
    
    // 应用筛选条件
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      agents = agents.filter(agent => 
        agent.name.toLowerCase().includes(lowerKeyword) || 
        agent.wechatName.toLowerCase().includes(lowerKeyword) || 
        agent.phone.includes(keyword)
      )
    }
    
    if (status) {
      agents = agents.filter(agent => agent.status === status)
    }
    
    if (category) {
      agents = agents.filter(agent => agent.category === category)
    }
    
    if (level) {
      agents = agents.filter(agent => agent.level === level)
    }
    
    if (isAdded) {
      agents = agents.filter(agent => agent.isAdded)
    }
    
    if (isPosting) {
      agents = agents.filter(agent => agent.isPosting)
    }
    
    if (isIntercept) {
      agents = agents.filter(agent => agent.isIntercept)
    }
    
    if (isAttracting) {
      agents = agents.filter(agent => agent.isAttracting)
    }
    
    if (isInGroup) {
      agents = agents.filter(agent => agent.isInGroup)
    }
    
    // 分页
    const total = agents.length
    const startIndex = (page - 1) * pageSize
    const data = agents.slice(startIndex, startIndex + pageSize)
    
    return [
      200, 
      {
        code: 200,
        success: true,
        data,
        total,
        page,
        pageSize
      }
    ]
  })

  // 模拟代理详情API
  mock.onGet(/\/agents\/[^/]+$/).reply(config => {
    const id = config.url.split('/').pop()
    
    // 生成代理详情
    const agent = {
      id,
      name: `代理${id.split('-')[1]}`,
      wechatName: `wx_代理${id.split('-')[1]}`,
      phone: `1380000${String(parseInt(id.split('-')[1])).padStart(4, '0')}`,
      redBookAccount: `redbook_代理${id.split('-')[1]}`,
      referrer: '张三',
      status: 'active',
      category: 'A',
      level: 'SV3',
      isAdded: true,
      isPosting: true,
      isIntercept: true,
      isAttracting: true,
      isInGroup: true,
      notes: '这是一个表现良好的代理，积极参与各项活动',
      addedDate: randomDate(new Date(2023, 0, 1), new Date()),
      createdAt: randomDate(new Date(2023, 0, 1), new Date())
    }
    
    return [
      200,
      {
        code: 200,
        success: true,
        data: agent
      }
    ]
  })

  // 模拟代理业绩API
  mock.onGet(/\/agents\/[^/]+\/performance$/).reply(config => {
    const id = config.url.split('/')[2]
    
    // 生成代理业绩数据
    const performance = {
      clientsTotal: randomNumber(50, 200),
      validClients: randomNumber(20, 100),
      totalRevenue: randomNumber(50000, 200000),
      commission: randomNumber(5000, 20000),
      baseSalary: randomNumber(2000, 5000),
      performance: randomNumber(1000, 3000)
    }
    
    return [
      200,
      {
        code: 200,
        success: true,
        data: performance
      }
    ]
  })

  // 模拟客资列表API
  mock.onGet(/\/leads(\?.*)?$/).reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1] || '')
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '10')
    const keyword = params.get('keyword') || ''
    const status = params.get('status') || ''
    const source = params.get('source') || ''
    const strategy = params.get('strategy') || ''
    const property = params.get('property') || ''
    
    // 客资状态、来源和策略
    const leadStatuses = ['pending', 'closed', 'unresponsive', 'lost', 'considering', 'follow_up']
    const leadSources = ['xiaohongshu', 'douyin', 'others']
    const leadStrategies = ['natural', 'comment']
    const leadProperties = ['valid', 'invalid', 'failed']
    const managerNames = ['胡夏阳', '洪备', '田逸轩', '李洋', '夏季', '何祥', '刘志城', '李杰', '吴丽丽', '葛江云']
    const products = ['AI课程', 'AI就业', 'AI工具']
    
    // 生成客资数据
    let leads = Array.from({ length: 150 }, (_, i) => {
      const statusIndex = i % leadStatuses.length
      const sourceIndex = i % leadSources.length
      const strategyIndex = i % leadStrategies.length
      const propertyIndex = i % leadProperties.length
      const managerIndex = i % managerNames.length
      
      return {
        id: `lead-${i + 1}`,
        contactInfo: i % 2 === 0 ? `wx_user${i + 1}` : `1390000${String(i + 1).padStart(4, '0')}`,
        source: leadSources[sourceIndex],
        strategy: leadStrategies[strategyIndex],
        property: leadProperties[propertyIndex],
        commissionAmount: (i % 3 === 0 ? 5 : 1) * (i % 5 === 0 ? 0 : 1),
        managerId: `manager-${managerIndex + 1}`,
        managerName: managerNames[managerIndex],
        status: leadStatuses[statusIndex],
        product: i % 4 === 0 ? products[i % products.length] : '',
        dealAmount: i % 4 === 0 ? randomNumber(1000, 10000) : 0,
        agentId: i % 6 === 0 ? `agent-${(i % 20) + 1}` : '',
        agentName: i % 6 === 0 ? `代理${(i % 20) + 1}` : '',
        postLink: i % 5 === 0 ? `https://xiaohongshu.com/post/${i + 1000}` : '',
        keywords: i % 7 === 0 ? 'AI学习,编程,就业' : '',
        createdAt: randomDate(new Date(2023, 0, 1), new Date())
      }
    })
    
    // 应用筛选条件
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      leads = leads.filter(lead => 
        lead.contactInfo.toLowerCase().includes(lowerKeyword) || 
        lead.managerName.toLowerCase().includes(lowerKeyword)
      )
    }
    
    if (status) {
      leads = leads.filter(lead => lead.status === status)
    }
    
    if (source) {
      leads = leads.filter(lead => lead.source === source)
    }
    
    if (strategy) {
      leads = leads.filter(lead => lead.strategy === strategy)
    }
    
    if (property) {
      leads = leads.filter(lead => lead.property === property)
    }
    
    // 分页
    const total = leads.length
    const startIndex = (page - 1) * pageSize
    const data = leads.slice(startIndex, startIndex + pageSize)
    
    return [
      200, 
      {
        code: 200,
        success: true,
        data,
        total,
        page,
        pageSize
      }
    ]
  })

  // 模拟客资详情API
  mock.onGet(/\/leads\/[^/]+$/).reply(config => {
    const id = config.url.split('/').pop()
    
    // 生成客资详情
    const lead = {
      id,
      contactInfo: `wx_user${id.split('-')[1]}`,
      source: 'xiaohongshu',
      strategy: 'natural',
      property: 'valid',
      commissionAmount: 5,
      managerId: 'manager-1',
      managerName: '胡夏阳',
      status: 'considering',
      product: '',
      dealAmount: 0,
      agentId: 'agent-5',
      agentName: '代理5',
      postLink: `https://xiaohongshu.com/post/${parseInt(id.split('-')[1]) + 1000}`,
      keywords: 'AI学习,编程,就业',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      followUpRecords: Array.from({ length: 3 }, (_, i) => ({
        id: `record-${i + 1}`,
        content: `跟进记录${i + 1}：客户对课程很感兴趣，正在考虑中`,
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
        createdBy: '胡夏阳'
      }))
    }
    
    return [
      200,
      {
        code: 200,
        success: true,
        data: lead
      }
    ]
  })

  // 模拟成交列表API
  mock.onGet(/\/deals(\?.*)?$/).reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1] || '')
    const page = parseInt(params.get('page') || '1')
    const pageSize = parseInt(params.get('pageSize') || '10')
    const keyword = params.get('keyword') || ''
    const status = params.get('status') || ''
    const productType = params.get('productType') || ''
    const startDate = params.get('startDate')
    const endDate = params.get('endDate')
    
    // 成交状态和产品类型
    const dealStatuses = ['pending', 'paid', 'refunded', 'cancelled']
    const productTypes = ['AI课程', 'AI就业', 'AI工具']
    const managerNames = ['胡夏阳', '洪备', '田逸轩', '李洋', '夏季', '何祥', '刘志城', '李杰', '吴丽丽', '葛江云']
    
    // 生成成交数据
    let deals = Array.from({ length: 120 }, (_, i) => {
      const statusIndex = i % dealStatuses.length
      const productIndex = i % productTypes.length
      const managerIndex = i % managerNames.length
      const dealDate = randomDate(new Date(2023, 0, 1), new Date())
      
      return {
        id: `deal-${i + 1}`,
        leadId: `lead-${(i % 150) + 1}`,
        contactInfo: i % 2 === 0 ? `wx_user${i + 1}` : `1390000${String(i + 1).padStart(4, '0')}`,
        productType: productTypes[productIndex],
        productName: `${productTypes[productIndex]}-${i % 3 + 1}`,
        amount: randomNumber(1000, 10000),
        status: dealStatuses[statusIndex],
        managerId: `manager-${managerIndex + 1}`,
        managerName: managerNames[managerIndex],
        agentId: i % 6 === 0 ? `agent-${(i % 20) + 1}` : '',
        agentName: i % 6 === 0 ? `代理${(i % 20) + 1}` : '',
        commissionAmount: randomNumber(100, 1000),
        paymentMethod: i % 3 === 0 ? '支付宝' : '微信支付',
        dealDate,
        createdAt: dealDate
      }
    })
    
    // 应用筛选条件
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      deals = deals.filter(deal => 
        deal.contactInfo.toLowerCase().includes(lowerKeyword) || 
        deal.managerName.toLowerCase().includes(lowerKeyword) ||
        deal.productName.toLowerCase().includes(lowerKeyword)
      )
    }
    
    if (status) {
      deals = deals.filter(deal => deal.status === status)
    }
    
    if (productType) {
      deals = deals.filter(deal => deal.productType === productType)
    }
    
    if (startDate) {
      const start = new Date(startDate)
      deals = deals.filter(deal => new Date(deal.dealDate) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      deals = deals.filter(deal => new Date(deal.dealDate) <= end)
    }
    
    // 分页
    const total = deals.length
    const startIndex = (page - 1) * pageSize
    const data = deals.slice(startIndex, startIndex + pageSize)
    
    return [
      200, 
      {
        code: 200,
        success: true,
        data,
        total,
        page,
        pageSize
      }
    ]
  })

  // 模拟成交统计API
  mock.onGet('/deals/statistics').reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1] || '')
    const startDate = params.get('startDate')
    const endDate = params.get('endDate')
    
    // 生成成交统计数据
    const statistics = {
      totalAmount: 568000,
      totalCount: 87,
      productTypeDistribution: [
        { type: 'AI课程', count: 45, amount: 225000 },
        { type: 'AI就业', count: 32, amount: 320000 },
        { type: 'AI工具', count: 10, amount: 23000 }
      ],
      managerDistribution: [
        { name: '胡夏阳', count: 15, amount: 120000 },
        { name: '洪备', count: 12, amount: 96000 },
        { name: '田逸轩', count: 10, amount: 85000 },
        { name: '李洋', count: 9, amount: 72000 },
        { name: '夏季', count: 8, amount: 64000 },
        { name: '其他', count: 33, amount: 131000 }
      ]
    }
    
    return [
      200,
      {
        code: 200,
        success: true,
        data: statistics
      }
    ]
  })

  // 更多模拟API可以根据需要添加
} 